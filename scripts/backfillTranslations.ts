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

// Statistics
const stats = {
  artistsScheduled: 0,
  performancesScheduled: 0,
  venuesScheduled: 0,
  siteInfoFieldsScheduled: 0,
  donationStoriesScheduled: 0,
  donationImpactsScheduled: 0,
  englishSkipped: 0,
  translationFailed: 0,
  writesCount: 0,
};

const isFilled = (val: unknown): val is string => typeof val === 'string' && val.trim().length > 0;

/**
 * Translate Japanese text to natural English using Gemini.
 * Never returns Japanese text on error or missing API key.
 * Retries up to 3 times on transient errors.
 */
async function translateText(text: string, contextHint: string): Promise<string | null> {
  const clean = (text || '').trim();
  if (!clean) return null;

  const cacheKey = `${contextHint}\n${clean}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  if (!ai) {
    console.warn(`  ⚠️ Gemini API key missing, skipped translation for: ${contextHint}`);
    stats.translationFailed++;
    return null;
  }

  const prompt = `
You are an expert translator specializing in performing arts, fringe festivals, and Osaka culture.
Translate the following Japanese text into natural, vibrant, and engaging English suitable for the Osaka Fringe Festival official website and Audience App.
Keep theater/arts nuances authentic. If there are Japanese location names (e.g. 中崎町 Nakazakicho, 心斎橋 Shinsaibashi), use standard Romaji.

Context: ${contextHint}
Japanese Text:
${clean}

Respond ONLY with the translated English text, without markdown formatting, quotes, or conversational filler.
`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-flash-latest',
        contents: prompt,
      });

      const translated = response.text ? response.text.trim().replace(/^["']|["']$/g, '') : null;
      if (translated) {
        translationCache.set(cacheKey, translated);
        return translated;
      }
    } catch (err: any) {
      if (attempt < 3) {
        console.warn(`  ⚠️ Gemini attempt ${attempt} failed for "${contextHint}" (${err?.message || err}). Retrying in ${attempt}s...`);
        await new Promise((r) => setTimeout(r, attempt * 1000));
      } else {
        console.error(`  ❌ skipped: ${contextHint} (Gemini error after 3 attempts: ${err?.message || err})`);
      }
    }
  }

  stats.translationFailed++;
  return null;
}

/**
 * Pagination helper to fetch all items from microCMS endpoint
 */
async function getAllContents<T = any>(endpoint: string): Promise<T[]> {
  const limit = 100;
  let offset = 0;
  const all: T[] = [];

  while (true) {
    const result = await client.getList<T>({
      endpoint,
      queries: { limit, offset },
    });
    all.push(...result.contents);
    if (all.length >= result.totalCount || result.contents.length < limit) {
      break;
    }
    offset += limit;
  }

  return all;
}

async function backfillArtists() {
  console.log('\n[1/4] Processing Artists...');
  const contents = await getAllContents<any>('artists');
  console.log(`  Total artists fetched: ${contents.length}`);

  for (const item of contents) {
    const patchData: Record<string, any> = {};
    const itemLabel = item.name || item.id;

    // name -> nameEn
    if (isFilled(item.name)) {
      if (isFilled(item.nameEn)) {
        stats.englishSkipped++;
      } else {
        const translated = await translateText(item.name, `Artist name: ${itemLabel}`);
        if (translated) patchData.nameEn = translated;
      }
    }

    // origin -> originEn
    if (isFilled(item.origin)) {
      if (isFilled(item.originEn)) {
        stats.englishSkipped++;
      } else {
        const translated = await translateText(item.origin, `Artist origin: ${itemLabel}`);
        if (translated) patchData.originEn = translated;
      }
    }

    // profile -> profileEn
    if (isFilled(item.profile)) {
      if (isFilled(item.profileEn)) {
        stats.englishSkipped++;
      } else {
        const translated = await translateText(item.profile, `Artist profile: ${itemLabel}`);
        if (translated) patchData.profileEn = translated;
      }
    }

    // Artist.genre は英語コードのため翻訳しない

    if (Object.keys(patchData).length > 0) {
      stats.artistsScheduled++;
      console.log(`  - Artist [${item.id}] ${itemLabel}:`);
      for (const [k, v] of Object.entries(patchData)) {
        const preview = String(v).replace(/\n/g, ' ');
        console.log(`      + ${k}: ${preview.slice(0, 80)}${preview.length > 80 ? '...' : ''}`);
      }

      if (!isDryRun) {
        await client.update({
          endpoint: 'artists',
          contentId: item.id,
          content: patchData,
        });
        stats.writesCount++;
        console.log(`    ✅ Updated ${item.id}`);
      }
    }
  }
}

async function backfillPerformances() {
  console.log('\n[2/4] Processing Performances...');
  const contents = await getAllContents<any>('performances');
  console.log(`  Total performances fetched: ${contents.length}`);

  for (const item of contents) {
    const patchData: Record<string, any> = {};
    const itemLabel = item.title || item.id;

    // title -> titleEn
    if (isFilled(item.title)) {
      if (isFilled(item.titleEn)) {
        stats.englishSkipped++;
      } else {
        const translated = await translateText(item.title, `Performance title: ${itemLabel}`);
        if (translated) patchData.titleEn = translated;
      }
    }

    // genre -> genreEn (Performance自由記述ジャンル)
    if (isFilled(item.genre)) {
      if (isFilled(item.genreEn)) {
        stats.englishSkipped++;
      } else {
        const translated = await translateText(item.genre, `Performance subgenre: ${itemLabel}`);
        if (translated) patchData.genreEn = translated;
      }
    }

    // description -> descriptionEn
    if (isFilled(item.description)) {
      if (isFilled(item.descriptionEn)) {
        stats.englishSkipped++;
      } else {
        const translated = await translateText(item.description, `Performance description: ${itemLabel}`);
        if (translated) patchData.descriptionEn = translated;
      }
    }

    // ticketPrice -> ticketPriceEn
    if (isFilled(item.ticketPrice)) {
      if (isFilled(item.ticketPriceEn)) {
        stats.englishSkipped++;
      } else {
        const translated = await translateText(item.ticketPrice, `Performance ticket price: ${itemLabel}`);
        if (translated) patchData.ticketPriceEn = translated;
      }
    }

    if (Object.keys(patchData).length > 0) {
      stats.performancesScheduled++;
      console.log(`  - Performance [${item.id}] ${itemLabel}:`);
      for (const [k, v] of Object.entries(patchData)) {
        const preview = String(v).replace(/\n/g, ' ');
        console.log(`      + ${k}: ${preview.slice(0, 80)}${preview.length > 80 ? '...' : ''}`);
      }

      if (!isDryRun) {
        await client.update({
          endpoint: 'performances',
          contentId: item.id,
          content: patchData,
        });
        stats.writesCount++;
        console.log(`    ✅ Updated ${item.id}`);
      }
    }
  }
}

async function backfillVenues() {
  console.log('\n[3/4] Processing Venues...');
  const contents = await getAllContents<any>('venues');
  console.log(`  Total venues fetched: ${contents.length}`);

  for (const item of contents) {
    const patchData: Record<string, any> = {};
    const itemLabel = item.name || item.id;

    // name -> nameEn
    if (isFilled(item.name)) {
      if (isFilled(item.nameEn)) {
        stats.englishSkipped++;
      } else {
        const translated = await translateText(item.name, `Venue name: ${itemLabel}`);
        if (translated) patchData.nameEn = translated;
      }
    }

    // area -> areaEn
    if (isFilled(item.area)) {
      if (isFilled(item.areaEn)) {
        stats.englishSkipped++;
      } else {
        const translated = await translateText(item.area, `Venue area: ${itemLabel}`);
        if (translated) patchData.areaEn = translated;
      }
    }

    // address -> addressEn
    if (isFilled(item.address)) {
      if (isFilled(item.addressEn)) {
        stats.englishSkipped++;
      } else {
        const translated = await translateText(item.address, `Venue address: ${itemLabel}`);
        if (translated) patchData.addressEn = translated;
      }
    }

    // access -> accessEn
    if (isFilled(item.access)) {
      if (isFilled(item.accessEn)) {
        stats.englishSkipped++;
      } else {
        const translated = await translateText(item.access, `Venue access: ${itemLabel}`);
        if (translated) patchData.accessEn = translated;
      }
    }

    // description -> descriptionEn
    if (isFilled(item.description)) {
      if (isFilled(item.descriptionEn)) {
        stats.englishSkipped++;
      } else {
        const translated = await translateText(item.description, `Venue description: ${itemLabel}`);
        if (translated) patchData.descriptionEn = translated;
      }
    }

    if (Object.keys(patchData).length > 0) {
      stats.venuesScheduled++;
      console.log(`  - Venue [${item.id}] ${itemLabel}:`);
      for (const [k, v] of Object.entries(patchData)) {
        const preview = String(v).replace(/\n/g, ' ');
        console.log(`      + ${k}: ${preview.slice(0, 80)}${preview.length > 80 ? '...' : ''}`);
      }

      if (!isDryRun) {
        await client.update({
          endpoint: 'venues',
          contentId: item.id,
          content: patchData,
        });
        stats.writesCount++;
        console.log(`    ✅ Updated ${item.id}`);
      }
    }
  }
}

async function backfillSiteInfo() {
  console.log('\n[4/4] Processing Site Info...');
  try {
    const raw = await client.getObject<any>({ endpoint: 'site_info' });
    const info = raw?.siteTitle ? raw : (Array.isArray(raw?.contents) ? raw.contents[0] : raw);

    if (!info) {
      console.log('  Site Info: content not found.');
      return;
    }

    const targetContentId: string | undefined = info.id;
    const patchData: Record<string, any> = {};

    // 1. Regular fields list
    const regularFieldPairs: Array<[string, string, string]> = [
      ['siteTitle', 'siteTitleEn', 'Site Title'],
      ['heroTagline', 'heroTaglineEn', 'Hero Tagline'],
      ['heroSubtitle', 'heroSubtitleEn', 'Hero Subtitle'],
      ['festivalPeriod', 'festivalPeriodEn', 'Festival Schedule / Dates'],
      ['locationSummary', 'locationSummaryEn', 'Location / Area Summary'],
      ['aboutTitle', 'aboutTitleEn', 'About Section Title'],
      ['aboutText', 'aboutTextEn', 'About Section Body Text'],
      ['donationTitle', 'donationTitleEn', 'Donation Section Title'],
      ['donationText', 'donationTextEn', 'Donation Section Body Text'],
      ['donationBankInfo', 'donationBankInfoEn', 'Bank Transfer Details'],
      ['donationBankNote', 'donationBankNoteEn', 'Bank Transfer Notes / Receipt Notice'],
      ['newsNotice', 'newsNoticeEn', 'Global News Notice / Announcement'],
    ];

    console.log('  --- Checking regular fields ---');
    for (const [jpKey, enKey, desc] of regularFieldPairs) {
      const jpVal = info[jpKey];
      const enVal = info[enKey];

      if (isFilled(jpVal)) {
        if (isFilled(enVal)) {
          stats.englishSkipped++;
        } else {
          const translated = await translateText(jpVal, `Site Info ${desc} (${jpKey})`);
          if (translated) {
            patchData[enKey] = translated;
            stats.siteInfoFieldsScheduled++;
            console.log(`    + ${enKey} (TRANSLATE): ${translated.replace(/\n/g, ' ').slice(0, 80)}...`);
          }
        }
      }
    }

    // 2. donationStories Repeater
    console.log('  --- Checking donationStories repeater ---');
    const existingStories = Array.isArray(info.donationStories) ? info.donationStories : [];
    let storiesChanged = false;
    const updatedStories = [];

    for (const story of existingStories) {
      const updatedStory = { ...story };
      const keyLabel = Array.isArray(story.sectionKey)
        ? story.sectionKey.join(',')
        : (story.sectionKey || 'story');

      // title -> titleEn
      if (isFilled(story.title)) {
        if (isFilled(story.titleEn)) {
          stats.englishSkipped++;
        } else {
          const translated = await translateText(story.title, `donationStories[${keyLabel}].title`);
          if (translated) {
            updatedStory.titleEn = translated;
            storiesChanged = true;
            stats.donationStoriesScheduled++;
            console.log(`    + donationStories[${keyLabel}].titleEn (TRANSLATE): ${translated.replace(/\n/g, ' ').slice(0, 80)}...`);
          }
        }
      }

      // text -> textEn
      if (isFilled(story.text)) {
        if (isFilled(story.textEn)) {
          stats.englishSkipped++;
        } else {
          const translated = await translateText(story.text, `donationStories[${keyLabel}].text`);
          if (translated) {
            updatedStory.textEn = translated;
            storiesChanged = true;
            stats.donationStoriesScheduled++;
            console.log(`    + donationStories[${keyLabel}].textEn (TRANSLATE): ${translated.replace(/\n/g, ' ').slice(0, 80)}...`);
          }
        }
      }

      updatedStories.push(updatedStory);
    }

    if (storiesChanged) {
      patchData.donationStories = updatedStories;
    }

    // 3. donationImpacts Repeater
    console.log('  --- Checking donationImpacts repeater ---');
    const existingImpacts = Array.isArray(info.donationImpacts) ? info.donationImpacts : [];
    let impactsChanged = false;
    const updatedImpacts = [];

    for (let i = 0; i < existingImpacts.length; i++) {
      const impact = existingImpacts[i];
      const updatedImpact = { ...impact };
      const labelStr = impact.label || `0${i + 1}`;

      // title -> titleEn
      if (isFilled(impact.title)) {
        if (isFilled(impact.titleEn)) {
          stats.englishSkipped++;
        } else {
          const translated = await translateText(impact.title, `donationImpacts[${labelStr}].title`);
          if (translated) {
            updatedImpact.titleEn = translated;
            impactsChanged = true;
            stats.donationImpactsScheduled++;
            console.log(`    + donationImpacts[${labelStr}].titleEn (TRANSLATE): ${translated.replace(/\n/g, ' ').slice(0, 80)}...`);
          }
        }
      }

      // text -> textEn
      if (isFilled(impact.text)) {
        if (isFilled(impact.textEn)) {
          stats.englishSkipped++;
        } else {
          const translated = await translateText(impact.text, `donationImpacts[${labelStr}].text`);
          if (translated) {
            updatedImpact.textEn = translated;
            impactsChanged = true;
            stats.donationImpactsScheduled++;
            console.log(`    + donationImpacts[${labelStr}].textEn (TRANSLATE): ${translated.replace(/\n/g, ' ').slice(0, 80)}...`);
          }
        }
      }

      updatedImpacts.push(updatedImpact);
    }

    if (impactsChanged) {
      patchData.donationImpacts = updatedImpacts;
    }

    // Perform patch if any changes
    if (Object.keys(patchData).length > 0) {
      console.log(`  - Site Info summary: ${Object.keys(patchData).length} fields/repeaters updated.`);
      if (!isDryRun) {
        if (targetContentId) {
          await client.update({
            endpoint: 'site_info',
            contentId: targetContentId,
            content: patchData,
          });
        } else {
          await client.update({
            endpoint: 'site_info',
            content: patchData,
          });
        }
        stats.writesCount++;
        console.log(`    ✅ Updated site_info (${targetContentId || 'object'})`);
      }
    } else {
      console.log('  Site Info: All English fields and repeaters already filled.');
    }
  } catch (e: any) {
    console.error('  ❌ Site info processing error:', e.message || e);
  }
}

async function main() {
  try {
    await backfillArtists();
    await backfillPerformances();
    await backfillVenues();
    await backfillSiteInfo();

    console.log('\n====================================================');
    console.log('📊 Translation Backfill Summary');
    console.log('====================================================');
    console.log(`実行モード: ${isDryRun ? '🔍 DRY-RUN (microCMSへの書き込みなし)' : '🚀 LIVE (microCMSへ書き込み実行)'}`);
    console.log(`1. Artists 翻訳予定件数: ${stats.artistsScheduled}`);
    console.log(`2. Performances 翻訳予定件数: ${stats.performancesScheduled}`);
    console.log(`3. Venues 翻訳予定件数: ${stats.venuesScheduled}`);
    console.log(`4. site_info 通常フィールド翻訳予定数: ${stats.siteInfoFieldsScheduled}`);
    console.log(`5. donationStories の翻訳予定フィールド数: ${stats.donationStoriesScheduled}`);
    console.log(`6. donationImpacts の翻訳予定フィールド数: ${stats.donationImpactsScheduled}`);
    console.log(`7. 既存英語SKIP数: ${stats.englishSkipped}`);
    console.log(`8. 翻訳失敗数: ${stats.translationFailed}`);
    console.log(`9. microCMSへの書き込み件数: ${stats.writesCount}`);
    console.log('====================================================\n');
  } catch (err) {
    console.error('❌ Backfill failed:', err);
    process.exit(1);
  }
}

main();