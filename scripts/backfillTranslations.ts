import { createClient } from 'microcms-js-sdk';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

export function loadEnv() {
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

export interface BackfillStats {
  artistsScheduled: number;
  performancesScheduled: number;
  venuesScheduled: number;
  partnerScheduled: number;
  siteInfoFieldsScheduled: number;
  donationStoriesScheduled: number;
  donationImpactsScheduled: number;
  awardsInfoScheduled: number;
  awardsSectionsScheduled: number;
  awardsEditorScheduled: number;
  awardsMembersScheduled: number;
  englishSkipped: number;
  translationFailed: number;
  updateFailed: number;
  writesCount: number;
}

export function createDefaultStats(): BackfillStats {
  return {
    artistsScheduled: 0,
    performancesScheduled: 0,
    venuesScheduled: 0,
    partnerScheduled: 0,
    siteInfoFieldsScheduled: 0,
    donationStoriesScheduled: 0,
    donationImpactsScheduled: 0,
    awardsInfoScheduled: 0,
    awardsSectionsScheduled: 0,
    awardsEditorScheduled: 0,
    awardsMembersScheduled: 0,
    englishSkipped: 0,
    translationFailed: 0,
    updateFailed: 0,
    writesCount: 0,
  };
}

export interface BackfillContext {
  client: any;
  ai?: any;
  isDryRun?: boolean;
  stats: BackfillStats;
  translationCache?: Map<string, string>;
  translator?: (text: string, contextHint: string) => Promise<string | null>;
}

export const isFilled = (val: unknown): val is string => typeof val === 'string' && val.trim().length > 0;

/**
 * Translate Japanese text to natural English using Gemini.
 * Never returns Japanese text on error or missing API key.
 * Retries up to 3 times on transient errors.
 */
export async function translateTextWithGemini(
  text: string,
  contextHint: string,
  ai: any,
  translationCache: Map<string, string>,
  stats: BackfillStats
): Promise<string | null> {
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
Important festival terminology:
- Use "OSAKA FRINGE AWARDS 2026" for awards title references.
- Use "Editor-in-Chief" for "編集長".
- Never fabricate biographical details, external facts, or missing info.

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

export async function translateText(ctx: BackfillContext, text: string, contextHint: string): Promise<string | null> {
  if (ctx.translator) {
    return ctx.translator(text, contextHint);
  }
  return translateTextWithGemini(
    text,
    contextHint,
    ctx.ai,
    ctx.translationCache || new Map(),
    ctx.stats
  );
}

/**
 * Pagination helper to fetch all items from microCMS endpoint
 */
export async function getAllContents<T = any>(client: any, endpoint: string): Promise<T[]> {
  const limit = 100;
  let offset = 0;
  const all: T[] = [];

  while (true) {
    const result = await client.getList({
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

export async function backfillArtists(ctx: BackfillContext) {
  console.log('\n[1/5] Processing Artists...');
  const contents = await getAllContents<any>(ctx.client, 'artists');
  console.log(`  Total artists fetched: ${contents.length}`);

  for (const item of contents) {
    const patchData: Record<string, any> = {};
    const itemLabel = item.name || item.id;

    if (isFilled(item.name)) {
      if (isFilled(item.nameEn)) {
        ctx.stats.englishSkipped++;
      } else {
        const translated = await translateText(ctx, item.name, `Artist name: ${itemLabel}`);
        if (translated) patchData.nameEn = translated;
      }
    }

    if (isFilled(item.origin)) {
      if (isFilled(item.originEn)) {
        ctx.stats.englishSkipped++;
      } else {
        const translated = await translateText(ctx, item.origin, `Artist origin: ${itemLabel}`);
        if (translated) patchData.originEn = translated;
      }
    }

    if (isFilled(item.profile)) {
      if (isFilled(item.profileEn)) {
        ctx.stats.englishSkipped++;
      } else {
        const translated = await translateText(ctx, item.profile, `Artist profile: ${itemLabel}`);
        if (translated) patchData.profileEn = translated;
      }
    }

    if (Object.keys(patchData).length > 0) {
      ctx.stats.artistsScheduled++;
      console.log(`  - Artist [${item.id}] ${itemLabel}:`);
      for (const [k, v] of Object.entries(patchData)) {
        const preview = String(v).replace(/\n/g, ' ');
        console.log(`      + ${k}: ${preview.slice(0, 80)}${preview.length > 80 ? '...' : ''}`);
      }

      if (!ctx.isDryRun) {
        try {
          const fresh = await ctx.client.get({ endpoint: 'artists', contentId: item.id });
          const finalPatch: Record<string, any> = {};
          for (const [k, v] of Object.entries(patchData)) {
            if (!isFilled(fresh?.[k])) {
              finalPatch[k] = v;
            } else {
              ctx.stats.englishSkipped++;
            }
          }
          if (Object.keys(finalPatch).length > 0) {
            await ctx.client.update({
              endpoint: 'artists',
              contentId: item.id,
              content: finalPatch,
            });
            ctx.stats.writesCount++;
            console.log(`    ✅ Updated ${item.id}`);
          }
        } catch (err: any) {
          ctx.stats.updateFailed++;
          console.error(`    ❌ Failed to update artist ${item.id}:`, err?.message || err);
        }
      }
    }
  }
}

export async function backfillPerformances(ctx: BackfillContext) {
  console.log('\n[2/5] Processing Performances...');
  const contents = await getAllContents<any>(ctx.client, 'performances');
  console.log(`  Total performances fetched: ${contents.length}`);

  for (const item of contents) {
    const patchData: Record<string, any> = {};
    const itemLabel = item.title || item.id;

    if (isFilled(item.title)) {
      if (isFilled(item.titleEn)) {
        ctx.stats.englishSkipped++;
      } else {
        const translated = await translateText(ctx, item.title, `Performance title: ${itemLabel}`);
        if (translated) patchData.titleEn = translated;
      }
    }

    if (isFilled(item.genre)) {
      if (isFilled(item.genreEn)) {
        ctx.stats.englishSkipped++;
      } else {
        const translated = await translateText(ctx, item.genre, `Performance subgenre: ${itemLabel}`);
        if (translated) patchData.genreEn = translated;
      }
    }

    if (isFilled(item.description)) {
      if (isFilled(item.descriptionEn)) {
        ctx.stats.englishSkipped++;
      } else {
        const translated = await translateText(ctx, item.description, `Performance description: ${itemLabel}`);
        if (translated) patchData.descriptionEn = translated;
      }
    }

    if (isFilled(item.ticketPrice)) {
      if (isFilled(item.ticketPriceEn)) {
        ctx.stats.englishSkipped++;
      } else {
        const translated = await translateText(ctx, item.ticketPrice, `Performance ticket price: ${itemLabel}`);
        if (translated) patchData.ticketPriceEn = translated;
      }
    }

    const rawDuration = item.durationMinutes != null ? String(item.durationMinutes).trim() : '';
    if (isFilled(rawDuration)) {
      if (isFilled(item.durationMinutesEn)) {
        ctx.stats.englishSkipped++;
      } else {
        const translated = await translateText(ctx, rawDuration, `Performance duration: ${itemLabel}`);
        if (translated) patchData.durationMinutesEn = translated;
      }
    }

    if (Object.keys(patchData).length > 0) {
      ctx.stats.performancesScheduled++;
      console.log(`  - Performance [${item.id}] ${itemLabel}:`);
      for (const [k, v] of Object.entries(patchData)) {
        const preview = String(v).replace(/\n/g, ' ');
        console.log(`      + ${k}: ${preview.slice(0, 80)}${preview.length > 80 ? '...' : ''}`);
      }

      if (!ctx.isDryRun) {
        try {
          const fresh = await ctx.client.get({ endpoint: 'performances', contentId: item.id });
          const finalPatch: Record<string, any> = {};
          for (const [k, v] of Object.entries(patchData)) {
            if (!isFilled(fresh?.[k])) {
              finalPatch[k] = v;
            } else {
              ctx.stats.englishSkipped++;
            }
          }
          if (Object.keys(finalPatch).length > 0) {
            await ctx.client.update({
              endpoint: 'performances',
              contentId: item.id,
              content: finalPatch,
            });
            ctx.stats.writesCount++;
            console.log(`    ✅ Updated ${item.id}`);
          }
        } catch (err: any) {
          ctx.stats.updateFailed++;
          console.error(`    ❌ Failed to update performance ${item.id}:`, err?.message || err);
        }
      }
    }
  }
}

export async function backfillVenues(ctx: BackfillContext) {
  console.log('\n[3/5] Processing Venues...');
  const contents = await getAllContents<any>(ctx.client, 'venues');
  console.log(`  Total venues fetched: ${contents.length}`);

  for (const item of contents) {
    const patchData: Record<string, any> = {};
    const itemLabel = item.name || item.id;

    if (isFilled(item.name)) {
      if (isFilled(item.nameEn)) {
        ctx.stats.englishSkipped++;
      } else {
        const translated = await translateText(ctx, item.name, `Venue name: ${itemLabel}`);
        if (translated) patchData.nameEn = translated;
      }
    }

    if (isFilled(item.area)) {
      if (isFilled(item.areaEn)) {
        ctx.stats.englishSkipped++;
      } else {
        const translated = await translateText(ctx, item.area, `Venue area: ${itemLabel}`);
        if (translated) patchData.areaEn = translated;
      }
    }

    if (isFilled(item.address)) {
      if (isFilled(item.addressEn)) {
        ctx.stats.englishSkipped++;
      } else {
        const translated = await translateText(ctx, item.address, `Venue address: ${itemLabel}`);
        if (translated) patchData.addressEn = translated;
      }
    }

    if (isFilled(item.access)) {
      if (isFilled(item.accessEn)) {
        ctx.stats.englishSkipped++;
      } else {
        const translated = await translateText(ctx, item.access, `Venue access: ${itemLabel}`);
        if (translated) patchData.accessEn = translated;
      }
    }

    if (isFilled(item.description)) {
      if (isFilled(item.descriptionEn)) {
        ctx.stats.englishSkipped++;
      } else {
        const translated = await translateText(ctx, item.description, `Venue description: ${itemLabel}`);
        if (translated) patchData.descriptionEn = translated;
      }
    }

    if (Object.keys(patchData).length > 0) {
      ctx.stats.venuesScheduled++;
      console.log(`  - Venue [${item.id}] ${itemLabel}:`);
      for (const [k, v] of Object.entries(patchData)) {
        const preview = String(v).replace(/\n/g, ' ');
        console.log(`      + ${k}: ${preview.slice(0, 80)}${preview.length > 80 ? '...' : ''}`);
      }

      if (!ctx.isDryRun) {
        try {
          const fresh = await ctx.client.get({ endpoint: 'venues', contentId: item.id });
          const finalPatch: Record<string, any> = {};
          for (const [k, v] of Object.entries(patchData)) {
            if (!isFilled(fresh?.[k])) {
              finalPatch[k] = v;
            } else {
              ctx.stats.englishSkipped++;
            }
          }
          if (Object.keys(finalPatch).length > 0) {
            await ctx.client.update({
              endpoint: 'venues',
              contentId: item.id,
              content: finalPatch,
            });
            ctx.stats.writesCount++;
            console.log(`    ✅ Updated ${item.id}`);
          }
        } catch (err: any) {
          ctx.stats.updateFailed++;
          console.error(`    ❌ Failed to update venue ${item.id}:`, err?.message || err);
        }
      }
    }
  }
}

export async function backfillPartners(ctx: BackfillContext) {
  console.log('\n[4/5] Processing Partners...');
  let endpoint = 'partner';
  let contents: any[] = [];

  try {
    contents = await getAllContents<any>(ctx.client, endpoint);
  } catch (e1: any) {
    endpoint = 'partners';
    try {
      contents = await getAllContents<any>(ctx.client, endpoint);
    } catch (e2: any) {
      console.warn(`  ⚠️ Could not fetch partners from 'partner' or 'partners': ${e2?.message || e2}`);
      return;
    }
  }

  console.log(`  Total partners fetched (${endpoint}): ${contents.length}`);

  for (const item of contents) {
    const patchData: Record<string, any> = {};
    const itemLabel = item.name || item.id;

    // name -> nameEn
    if (isFilled(item.name)) {
      if (isFilled(item.nameEn)) {
        ctx.stats.englishSkipped++;
      } else {
        const translated = await translateText(ctx, item.name, `Partner name: ${itemLabel}`);
        if (translated) patchData.nameEn = translated;
      }
    }

    // description -> descriptionEn
    if (isFilled(item.description)) {
      if (isFilled(item.descriptionEn)) {
        ctx.stats.englishSkipped++;
      } else {
        const translated = await translateText(ctx, item.description, `Partner description: ${itemLabel}`);
        if (translated) patchData.descriptionEn = translated;
      }
    }

    // Note: Do NOT translate or modify category!

    if (Object.keys(patchData).length > 0) {
      ctx.stats.partnerScheduled++;
      console.log(`  - Partner [${item.id}] ${itemLabel}:`);
      for (const [k, v] of Object.entries(patchData)) {
        const preview = String(v).replace(/\n/g, ' ');
        console.log(`      + ${k}: ${preview.slice(0, 80)}${preview.length > 80 ? '...' : ''}`);
      }

      if (!ctx.isDryRun) {
        try {
          const fresh = await ctx.client.get({ endpoint, contentId: item.id });
          const finalPatch: Record<string, any> = {};
          for (const [k, v] of Object.entries(patchData)) {
            if (!isFilled(fresh?.[k])) {
              finalPatch[k] = v;
            } else {
              ctx.stats.englishSkipped++;
            }
          }
          if (Object.keys(finalPatch).length > 0) {
            await ctx.client.update({
              endpoint,
              contentId: item.id,
              content: finalPatch,
            });
            ctx.stats.writesCount++;
            console.log(`    ✅ Updated partner ${item.id}`);
          }
        } catch (err: any) {
          ctx.stats.updateFailed++;
          console.error(`    ❌ Failed to update partner ${item.id}:`, err?.message || err);
        }
      }
    }
  }
}

export async function backfillSiteInfo(ctx: BackfillContext) {
  console.log('\n[5/5] Processing Site Info...');
  try {
    const raw = await ctx.client.getObject({ endpoint: 'site_info' });
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
          ctx.stats.englishSkipped++;
        } else {
          const translated = await translateText(ctx, jpVal, `Site Info ${desc} (${jpKey})`);
          if (translated) {
            patchData[enKey] = translated;
            ctx.stats.siteInfoFieldsScheduled++;
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
          ctx.stats.englishSkipped++;
        } else {
          const translated = await translateText(ctx, story.title, `donationStories[${keyLabel}].title`);
          if (translated) {
            updatedStory.titleEn = translated;
            storiesChanged = true;
            ctx.stats.donationStoriesScheduled++;
            console.log(`    + donationStories[${keyLabel}].titleEn (TRANSLATE): ${translated.replace(/\n/g, ' ').slice(0, 80)}...`);
          }
        }
      }

      // text -> textEn
      if (isFilled(story.text)) {
        if (isFilled(story.textEn)) {
          ctx.stats.englishSkipped++;
        } else {
          const translated = await translateText(ctx, story.text, `donationStories[${keyLabel}].text`);
          if (translated) {
            updatedStory.textEn = translated;
            storiesChanged = true;
            ctx.stats.donationStoriesScheduled++;
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
          ctx.stats.englishSkipped++;
        } else {
          const translated = await translateText(ctx, impact.title, `donationImpacts[${labelStr}].title`);
          if (translated) {
            updatedImpact.titleEn = translated;
            impactsChanged = true;
            ctx.stats.donationImpactsScheduled++;
            console.log(`    + donationImpacts[${labelStr}].titleEn (TRANSLATE): ${translated.replace(/\n/g, ' ').slice(0, 80)}...`);
          }
        }
      }

      // text -> textEn
      if (isFilled(impact.text)) {
        if (isFilled(impact.textEn)) {
          ctx.stats.englishSkipped++;
        } else {
          const translated = await translateText(ctx, impact.text, `donationImpacts[${labelStr}].text`);
          if (translated) {
            updatedImpact.textEn = translated;
            impactsChanged = true;
            ctx.stats.donationImpactsScheduled++;
            console.log(`    + donationImpacts[${labelStr}].textEn (TRANSLATE): ${translated.replace(/\n/g, ' ').slice(0, 80)}...`);
          }
        }
      }

      updatedImpacts.push(updatedImpact);
    }

    if (impactsChanged) {
      patchData.donationImpacts = updatedImpacts;
    }

    // 4. awardsInfo Object
    console.log('  --- Checking awardsInfo object ---');
    if (info.awardsInfo && typeof info.awardsInfo === 'object') {
      const rawAi = info.awardsInfo;
      const updatedAwardsInfo = { ...rawAi };
      let awardsInfoChanged = false;

      const aiFields: Array<[string, string, string]> = [
        ['title', 'titleEn', 'Awards Title'],
        ['tagline', 'taglineEn', 'Awards Tagline'],
        ['summary', 'summaryEn', 'Awards Summary'],
        ['notice', 'noticeEn', 'Awards Notice'],
      ];

      for (const [jpKey, enKey, desc] of aiFields) {
        const jpVal = rawAi[jpKey];
        const enVal = rawAi[enKey];
        if (isFilled(jpVal)) {
          if (isFilled(enVal)) {
            ctx.stats.englishSkipped++;
          } else {
            const translated = await translateText(ctx, jpVal, `awardsInfo.${jpKey} (${desc})`);
            if (translated) {
              updatedAwardsInfo[enKey] = translated;
              awardsInfoChanged = true;
              ctx.stats.awardsInfoScheduled++;
              console.log(`    + awardsInfo.${enKey} (TRANSLATE): ${translated.replace(/\n/g, ' ').slice(0, 80)}...`);
            }
          }
        }
      }

      if (awardsInfoChanged) {
        patchData.awardsInfo = updatedAwardsInfo;
      }
    }

    // 5. awardsSections Repeater
    console.log('  --- Checking awardsSections repeater ---');
    if (Array.isArray(info.awardsSections)) {
      let sectionsChanged = false;
      const updatedSections = [];

      for (let i = 0; i < info.awardsSections.length; i++) {
        const sec = info.awardsSections[i];
        const updatedSec = { ...sec };
        const labelStr = sec.title ? String(sec.title).slice(0, 20) : `Section ${i + 1}`;

        if (isFilled(sec.title)) {
          if (isFilled(sec.titleEn)) {
            ctx.stats.englishSkipped++;
          } else {
            const translated = await translateText(ctx, sec.title, `awardsSections[${i}].title (${labelStr})`);
            if (translated) {
              updatedSec.titleEn = translated;
              sectionsChanged = true;
              ctx.stats.awardsSectionsScheduled++;
              console.log(`    + awardsSections[${i}].titleEn (TRANSLATE): ${translated.replace(/\n/g, ' ').slice(0, 80)}...`);
            }
          }
        }

        if (isFilled(sec.text)) {
          if (isFilled(sec.textEn)) {
            ctx.stats.englishSkipped++;
          } else {
            const translated = await translateText(ctx, sec.text, `awardsSections[${i}].text (${labelStr})`);
            if (translated) {
              updatedSec.textEn = translated;
              sectionsChanged = true;
              ctx.stats.awardsSectionsScheduled++;
              console.log(`    + awardsSections[${i}].textEn (TRANSLATE): ${translated.replace(/\n/g, ' ').slice(0, 80)}...`);
            }
          }
        }

        updatedSections.push(updatedSec);
      }

      if (sectionsChanged) {
        patchData.awardsSections = updatedSections;
      }
    }

    // 6. awardsEditor Object
    console.log('  --- Checking awardsEditor object ---');
    if (info.awardsEditor && typeof info.awardsEditor === 'object') {
      const rawEditor = info.awardsEditor;
      const updatedEditor = { ...rawEditor };
      let editorChanged = false;

      const editorFields: Array<[string, string, string]> = [
        ['name', 'nameEn', 'Awards Editor Name'],
        ['role', 'roleEn', 'Awards Editor Role (e.g. 編集長 -> Editor-in-Chief)'],
        ['title', 'titleEn', 'Awards Editor Title'],
        ['profile', 'profileEn', 'Awards Editor Profile'],
      ];

      for (const [jpKey, enKey, desc] of editorFields) {
        const jpVal = rawEditor[jpKey];
        const enVal = rawEditor[enKey];
        if (isFilled(jpVal)) {
          if (isFilled(enVal)) {
            ctx.stats.englishSkipped++;
          } else {
            const translated = await translateText(ctx, jpVal, `awardsEditor.${jpKey} (${desc})`);
            if (translated) {
              updatedEditor[enKey] = translated;
              editorChanged = true;
              ctx.stats.awardsEditorScheduled++;
              console.log(`    + awardsEditor.${enKey} (TRANSLATE): ${translated.replace(/\n/g, ' ').slice(0, 80)}...`);
            }
          }
        }
      }

      if (editorChanged) {
        patchData.awardsEditor = updatedEditor;
      }
    }

    // 7. awardsMembers Repeater
    console.log('  --- Checking awardsMembers repeater ---');
    if (Array.isArray(info.awardsMembers)) {
      let membersChanged = false;
      const updatedMembers = [];

      for (let i = 0; i < info.awardsMembers.length; i++) {
        const member = info.awardsMembers[i];
        const updatedMember = { ...member };
        const labelStr = member.name || `Member ${i + 1}`;

        const memberFields: Array<[string, string, string]> = [
          ['name', 'nameEn', 'Awards Member Name'],
          ['role', 'roleEn', 'Awards Member Role'],
          ['title', 'titleEn', 'Awards Member Title'],
          ['profile', 'profileEn', 'Awards Member Profile'],
        ];

        for (const [jpKey, enKey, desc] of memberFields) {
          const jpVal = member[jpKey];
          const enVal = member[enKey];
          if (isFilled(jpVal)) {
            if (isFilled(enVal)) {
              ctx.stats.englishSkipped++;
            } else {
              const translated = await translateText(ctx, jpVal, `awardsMembers[${i}].${jpKey} (${labelStr} - ${desc})`);
              if (translated) {
                updatedMember[enKey] = translated;
                membersChanged = true;
                ctx.stats.awardsMembersScheduled++;
                console.log(`    + awardsMembers[${i}].${enKey} (TRANSLATE): ${translated.replace(/\n/g, ' ').slice(0, 80)}...`);
              }
            }
          }
        }

        updatedMembers.push(updatedMember);
      }

      if (membersChanged) {
        patchData.awardsMembers = updatedMembers;
      }
    }

    // Perform patch if any changes
    if (Object.keys(patchData).length > 0) {
      console.log(`  - Site Info summary: ${Object.keys(patchData).length} fields/repeaters updated.`);
      if (!ctx.isDryRun) {
        try {
          // Re-fetch latest site_info to prevent race condition overwrite
          const freshRaw = await ctx.client.getObject({ endpoint: 'site_info' });
          const fresh = freshRaw?.siteTitle ? freshRaw : (Array.isArray(freshRaw?.contents) ? freshRaw.contents[0] : freshRaw);

          for (const [_, enKey] of regularFieldPairs) {
            if (patchData[enKey] && isFilled(fresh?.[enKey])) {
              delete patchData[enKey];
              ctx.stats.englishSkipped++;
            }
          }

          if (Object.keys(patchData).length > 0) {
            if (targetContentId) {
              await ctx.client.update({
                endpoint: 'site_info',
                contentId: targetContentId,
                content: patchData,
              });
            } else {
              await ctx.client.update({
                endpoint: 'site_info',
                content: patchData,
              });
            }
            ctx.stats.writesCount++;
            console.log(`    ✅ Updated site_info (${targetContentId || 'object'})`);
          } else {
            console.log('    ℹ️ Site Info: Fresh data already contains all translations; write skipped.');
          }
        } catch (err: any) {
          ctx.stats.updateFailed++;
          console.error('    ❌ Failed to update site_info:', err?.message || err);
        }
      }
    } else {
      console.log('  Site Info: All English fields, repeaters, and awards already filled.');
    }
  } catch (e: any) {
    ctx.stats.updateFailed++;
    console.error('  ❌ Site info processing error:', e.message || e);
  }
}

export async function runBackfill(ctx: BackfillContext) {
  await backfillArtists(ctx);
  await backfillPerformances(ctx);
  await backfillVenues(ctx);
  await backfillPartners(ctx);
  await backfillSiteInfo(ctx);

  console.log('\n====================================================');
  console.log('📊 Translation Backfill Summary');
  console.log('====================================================');
  console.log(`実行モード: ${ctx.isDryRun ? '🔍 DRY-RUN (microCMSへの書き込みなし)' : '🚀 LIVE (microCMSへ書き込み実行)'}`);
  console.log(`1. Artists 翻訳予定件数: ${ctx.stats.artistsScheduled}`);
  console.log(`2. Performances 翻訳予定件数: ${ctx.stats.performancesScheduled}`);
  console.log(`3. Venues 翻訳予定件数: ${ctx.stats.venuesScheduled}`);
  console.log(`4. Partners 翻訳予定件数: ${ctx.stats.partnerScheduled}`);
  console.log(`5. site_info 通常フィールド翻訳予定数: ${ctx.stats.siteInfoFieldsScheduled}`);
  console.log(`6. donationStories の翻訳予定フィールド数: ${ctx.stats.donationStoriesScheduled}`);
  console.log(`7. donationImpacts の翻訳予定フィールド数: ${ctx.stats.donationImpactsScheduled}`);
  console.log(`8. awardsInfo の翻訳予定フィールド数: ${ctx.stats.awardsInfoScheduled}`);
  console.log(`9. awardsSections の翻訳予定フィールド数: ${ctx.stats.awardsSectionsScheduled}`);
  console.log(`10. awardsEditor の翻訳予定フィールド数: ${ctx.stats.awardsEditorScheduled}`);
  console.log(`11. awardsMembers の翻訳予定フィールド数: ${ctx.stats.awardsMembersScheduled}`);
  console.log(`12. 既存英語SKIP数: ${ctx.stats.englishSkipped}`);
  console.log(`13. 翻訳失敗数: ${ctx.stats.translationFailed}`);
  console.log(`14. microCMS書き込み失敗数: ${ctx.stats.updateFailed}`);
  console.log(`15. microCMSへの書き込み件数: ${ctx.stats.writesCount}`);
  console.log('====================================================\n');

  if (ctx.stats.translationFailed > 0 || ctx.stats.updateFailed > 0) {
    console.error(`❌ Errors occurred during backfill (Translation failures: ${ctx.stats.translationFailed}, Update failures: ${ctx.stats.updateFailed}).`);
    return false;
  }
  return true;
}

export async function main() {
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

  const ctx: BackfillContext = {
    client,
    ai,
    isDryRun,
    stats: createDefaultStats(),
    translationCache: new Map(),
  };

  try {
    const success = await runBackfill(ctx);
    if (!success) {
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Backfill failed:', err);
    process.exit(1);
  }
}

// Auto-run when executed as a script
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('scripts/backfillTranslations.ts')) {
  main();
}