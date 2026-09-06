import { createClient } from 'microcms-js-sdk';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      content.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...rest] = trimmed.split('=');
          const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = val;
          }
        }
      });
    }
  }
}

loadEnv();

const isDryRun = process.argv.includes('--dry-run');
const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN || '';
const apiKey = process.env.MICROCMS_WRITE_API_KEY || process.env.MICROCMS_API_KEY || '';
const geminiApiKey = process.env.GEMINI_API_KEY || '';

console.log('====================================================');
console.log(' OSAKA FRINGE 2026 - Translation Backfill Script');
console.log('====================================================');
console.log(`Mode: ${isDryRun ? '🔍 DRY RUN (No writes to microCMS)' : '🚀 LIVE (Writing to microCMS)'}`);
console.log(`Service Domain: ${serviceDomain || '(Not set)'}`);
console.log(`Write API Key configured: ${apiKey ? 'Yes' : 'No'}`);
console.log(`Gemini API Key configured: ${geminiApiKey ? 'Yes' : 'No'}`);
console.log('----------------------------------------------------');

if (!serviceDomain || !apiKey) {
  console.error('❌ Error: MICROCMS_SERVICE_DOMAIN and MICROCMS_WRITE_API_KEY (or MICROCMS_API_KEY) must be set in .env.local');
  process.exit(1);
}

const client = createClient({
  serviceDomain,
  apiKey,
});

const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;
const translationCache = new Map<string, string>();

async function translateText(text: string, contextHint: string): Promise<string> {
  const clean = (text || '').trim();
  if (!clean) return '';
  if (translationCache.has(clean)) return translationCache.get(clean)!;

  if (!ai) {
    console.warn('  ⚠️ Gemini API key missing, returning original text');
    return clean;
  }

  try {
    const prompt = `
You are an expert translator specializing in performing arts, fringe festivals, and Osaka culture.
Translate the following Japanese text into natural, vibrant, and engaging English suitable for the Osaka Fringe Festival official website and Audience App.
Keep theater/arts nuances authentic. If there are Japanese location names (e.g. 中崎町 Nakazakicho, 心斎橋 Shinsaibashi), use standard Romaji.

Context: ${contextHint}
Japanese Text:
${clean}

Respond ONLY with the translated English text, without markdown formatting, quotes, or conversational filler.
`;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-flash-latest',
      contents: prompt,
    });

    const translated = response.text ? response.text.trim().replace(/^[\"']|[\"']$/g, '') : clean;
    translationCache.set(clean, translated);
    return translated;
  } catch (err: any) {
    console.error(`  ❌ Translation error for "${clean.slice(0, 30)}...":`, err.message || err);
    return clean;
  }
}

async function backfillArtists() {
  console.log('\n[1/4] Processing Artists...');
  const res = await client.getList({ endpoint: 'artists', queries: { limit: 100 } });
  let updatedCount = 0;

  for (const item of res.contents as any[]) {
    const patchData: Record<string, any> = {};

    if (item.name && (!item.nameEn || !item.nameEn.trim())) {
      patchData.nameEn = await translateText(item.name, 'Artist / Company Name');
    }
    if (item.origin && (!item.originEn || !item.originEn.trim())) {
      patchData.originEn = await translateText(item.origin, 'Artist Origin / City / Country');
    }
    if (item.profile && (!item.profileEn || !item.profileEn.trim())) {
      patchData.profileEn = await translateText(item.profile, 'Artist Biography / Profile');
    }

    // Artist.genre は英語コードのため翻訳しない

    if (Object.keys(patchData).length > 0) {
      console.log(`  - Artist [${item.id}] ${item.name}:`);
      for (const [k, v] of Object.entries(patchData)) {
        console.log(`      + ${k}: ${String(v).slice(0, 60)}${String(v).length > 60 ? '...' : ''}`);
      }

      if (!isDryRun) {
        await client.update({
          endpoint: 'artists',
          contentId: item.id,
          content: patchData,
        });
        console.log(`    ✅ Updated ${item.id}`);
      }
      updatedCount++;
    }
  }
  console.log(`  Artists summary: ${updatedCount} items to update.`);
}

async function backfillPerformances() {
  console.log('\n[2/4] Processing Performances...');
  const res = await client.getList({ endpoint: 'performances', queries: { limit: 100 } });
  let updatedCount = 0;

  for (const item of res.contents as any[]) {
    const patchData: Record<string, any> = {};

    if (item.title && (!item.titleEn || !item.titleEn.trim())) {
      patchData.titleEn = await translateText(item.title, 'Performance / Show Title');
    }
    if (item.genre && (!item.genreEn || !item.genreEn.trim())) {
      patchData.genreEn = await translateText(item.genre, 'Performance Sub-Genre (e.g. Comedy, Disco, Contemporary Dance)');
    }
    if (item.description && (!item.descriptionEn || !item.descriptionEn.trim())) {
      patchData.descriptionEn = await translateText(item.description, 'Performance Description / Synopsis');
    }
    if (item.ticketPrice && (!item.ticketPriceEn || !item.ticketPriceEn.trim())) {
      patchData.ticketPriceEn = await translateText(item.ticketPrice, 'Ticket Price / Admission Fee info');
    }

    if (Object.keys(patchData).length > 0) {
      console.log(`  - Performance [${item.id}] ${item.title}:`);
      for (const [k, v] of Object.entries(patchData)) {
        console.log(`      + ${k}: ${String(v).slice(0, 60)}${String(v).length > 60 ? '...' : ''}`);
      }

      if (!isDryRun) {
        await client.update({
          endpoint: 'performances',
          contentId: item.id,
          content: patchData,
        });
        console.log(`    ✅ Updated ${item.id}`);
      }
      updatedCount++;
    }
  }
  console.log(`  Performances summary: ${updatedCount} items to update.`);
}

async function backfillVenues() {
  console.log('\n[3/4] Processing Venues...');
  const res = await client.getList({ endpoint: 'venues', queries: { limit: 100 } });
  let updatedCount = 0;

  for (const item of res.contents as any[]) {
    const patchData: Record<string, any> = {};

    if (item.name && (!item.nameEn || !item.nameEn.trim())) {
      patchData.nameEn = await translateText(item.name, 'Venue Name');
    }
    if (item.area && (!item.areaEn || !item.areaEn.trim())) {
      patchData.areaEn = await translateText(item.area, 'Venue Area (e.g. Namba, Umeda, Nakazakicho)');
    }
    if (item.address && (!item.addressEn || !item.addressEn.trim())) {
      patchData.addressEn = await translateText(item.address, 'Street Address in Osaka');
    }
    if (item.access && (!item.accessEn || !item.accessEn.trim())) {
      patchData.accessEn = await translateText(item.access, 'Transit & Access Directions');
    }
    if (item.description && (!item.descriptionEn || !item.descriptionEn.trim())) {
      patchData.descriptionEn = await translateText(item.description, 'Venue Description / Atmosphere');
    }

    if (Object.keys(patchData).length > 0) {
      console.log(`  - Venue [${item.id}] ${item.name}:`);
      for (const [k, v] of Object.entries(patchData)) {
        console.log(`      + ${k}: ${String(v).slice(0, 60)}${String(v).length > 60 ? '...' : ''}`);
      }

      if (!isDryRun) {
        await client.update({
          endpoint: 'venues',
          contentId: item.id,
          content: patchData,
        });
        console.log(`    ✅ Updated ${item.id}`);
      }
      updatedCount++;
    }
  }
  console.log(`  Venues summary: ${updatedCount} items to update.`);
}

async function backfillSiteInfo() {
  console.log('\n[4/4] Processing Site Info...');
  try {
    const info = await client.getObject<any>({ endpoint: 'site_info' });
    if (info) {
      const patchData: Record<string, any> = {};

      if (info.siteTitle && (!info.siteTitleEn || !info.siteTitleEn.trim())) {
        patchData.siteTitleEn = await translateText(info.siteTitle, 'Site Title');
      }
      if (info.heroTagline && (!info.heroTaglineEn || !info.heroTaglineEn.trim())) {
        patchData.heroTaglineEn = await translateText(info.heroTagline, 'Hero Tagline');
      }
      if (info.heroSubtitle && (!info.heroSubtitleEn || !info.heroSubtitleEn.trim())) {
        patchData.heroSubtitleEn = await translateText(info.heroSubtitle, 'Hero Subtitle');
      }
      if (info.festivalPeriod && (!info.festivalPeriodEn || !info.festivalPeriodEn.trim())) {
        patchData.festivalPeriodEn = await translateText(info.festivalPeriod, 'Festival Schedule / Dates');
      }
      if (info.locationSummary && (!info.locationSummaryEn || !info.locationSummaryEn.trim())) {
        patchData.locationSummaryEn = await translateText(info.locationSummary, 'Location / Area Summary');
      }

      if (Object.keys(patchData).length > 0) {
        console.log('  - Site Info:');
        for (const [k, v] of Object.entries(patchData)) {
          console.log(`      + ${k}: ${String(v).slice(0, 60)}${String(v).length > 60 ? '...' : ''}`);
        }

        if (!isDryRun) {
          await client.update({
            endpoint: 'site_info',
            content: patchData,
          });
          console.log('    ✅ Updated site_info');
        }
      } else {
        console.log('  Site Info: All English fields already filled.');
      }
    }
  } catch (e: any) {
    console.log('  Site info check skipped / not an object endpoint:', e.message || e);
  }
}

async function main() {
  try {
    await backfillArtists();
    await backfillPerformances();
    await backfillVenues();
    await backfillSiteInfo();
    console.log('\n====================================================');
    console.log(`🎉 Backfill ${isDryRun ? 'DRY-RUN' : 'COMPLETED'} successfully!`);
    console.log('====================================================\n');
  } catch (err) {
    console.error('❌ Backfill failed:', err);
    process.exit(1);
  }
}

main();