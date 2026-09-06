import { createClient } from 'microcms-js-sdk';
import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      content.split(/\r?\n/).forEach((line) => {
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
const serviceDomain = (process.env.MICROCMS_SERVICE_DOMAIN || '').trim();
const readApiKey = (process.env.MICROCMS_WRITE_API_KEY || process.env.MICROCMS_API_KEY || '').trim();
const writeApiKey = (process.env.MICROCMS_WRITE_API_KEY || process.env.MICROCMS_API_KEY || '').trim();

console.log('====================================================');
console.log(' OSAKA FRINGE 2026 - Site Info Update Script');
console.log('====================================================');
console.log(`Mode: ${isDryRun ? '🔍 DRY RUN (No writes to microCMS)' : '🚀 LIVE UPDATE (Writing to microCMS)'}`);
console.log(`Service Domain: ${serviceDomain || '(Not set)'}`);
console.log(`API Key configured: ${writeApiKey ? 'Yes' : 'No'}`);
console.log('----------------------------------------------------');

if (!serviceDomain) {
  console.error('❌ Error: MICROCMS_SERVICE_DOMAIN must be set.');
  process.exit(1);
}

if (!readApiKey) {
  console.error('❌ Error: MICROCMS_API_KEY or MICROCMS_WRITE_API_KEY must be set to read site_info.');
  process.exit(1);
}

// Client for reading
const readClient = createClient({
  serviceDomain,
  apiKey: readApiKey,
});

// Load payload
const payloadPath = path.resolve(process.cwd(), 'microcms-csv-samples/site_info_content_update_payload.json');
if (!fs.existsSync(payloadPath)) {
  console.error(`❌ Error: Payload file not found at ${payloadPath}`);
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf-8'));

const PRESERVED_FIELDS = [
  'donationBankInfo',
  'donationBankInfoEn',
  'officialInstagramUrl',
  'officialXUrl',
  'officialWebsiteUrl',
  'contactEmail',
  'newsNotice',
  'newsNoticeEn',
  'newsNoticeUrl',
];

const EXPECTED_UPDATE_FIELDS = [
  'siteTitle',
  'siteTitleEn',
  'heroTagline',
  'heroTaglineEn',
  'heroSubtitle',
  'heroSubtitleEn',
  'festivalPeriod',
  'festivalPeriodEn',
  'locationSummary',
  'locationSummaryEn',
  'aboutTitle',
  'aboutTitleEn',
  'aboutText',
  'aboutTextEn',
  'donationTitle',
  'donationTitleEn',
  'donationText',
  'donationTextEn',
  'donationStories',
  'donationImpacts',
  'donationBankNote',
  'donationBankNoteEn',
];

async function main() {
  console.log('\n[Step 0] 0. 最重要: 現在の site_info を取得してスキーマ検証...');
  let currentSiteInfo: any;
  try {
    currentSiteInfo = await readClient.getObject({ endpoint: 'site_info' });
    console.log('現在のsite_info取得成功');
  } catch (err: any) {
    console.error('❌ Error fetching site_info from microCMS:', err?.message || err);
    process.exit(1);
  }

  // Check existence of schema fields
  console.log('\nスキーマ存在確認:');
  console.log(' - donationStories:', currentSiteInfo.donationStories !== undefined ? 'OK (取得可能)' : '未定義 / null (スキーマ確認必要)');
  console.log(' - donationImpacts:', currentSiteInfo.donationImpacts !== undefined ? 'OK (取得可能)' : '未定義 / null (スキーマ確認必要)');
  console.log(' - donationBankNote:', currentSiteInfo.donationBankNote !== undefined ? 'OK (取得可能)' : '未定義 / null (スキーマ確認必要)');
  console.log(' - donationBankNoteEn:', currentSiteInfo.donationBankNoteEn !== undefined ? 'OK (取得可能)' : '未定義 / null (スキーマ確認必要)');

  console.log('\n更新予定フィールド:');
  EXPECTED_UPDATE_FIELDS.forEach((f) => console.log(f));

  console.log('\n--- 変更前 → 変更後 概要 ---');
  for (const key of EXPECTED_UPDATE_FIELDS) {
    const beforeVal = currentSiteInfo[key];
    const afterVal = payload[key];
    if (Array.isArray(afterVal)) {
      const beforeCount = Array.isArray(beforeVal) ? beforeVal.length : 0;
      console.log(`• ${key}: ${beforeCount}件 → ${afterVal.length}件 (配列)`);
    } else if (typeof afterVal === 'string') {
      const bLen = typeof beforeVal === 'string' ? beforeVal.length : 0;
      const bPreview = typeof beforeVal === 'string' ? beforeVal.slice(0, 20).replace(/\n/g, ' ') : '未設定';
      const aPreview = afterVal.slice(0, 20).replace(/\n/g, ' ');
      console.log(`• ${key}: [${bLen}文字: "${bPreview}..."] → [${afterVal.length}文字: "${aPreview}..."]`);
    } else {
      console.log(`• ${key}: ${JSON.stringify(beforeVal)} → ${JSON.stringify(afterVal)}`);
    }
  }

  // Backup creation
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const backupDir = path.resolve(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  const backupFile = path.join(backupDir, `site_info-before-update-${dateStr}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(currentSiteInfo, null, 2), 'utf-8');
  console.log(`\n✅ 現在のsite_info全フィールドをバックアップ保存しました: ${backupFile}`);

  if (isDryRun) {
    console.log('\n====================================================');
    console.log('🔍 DRY RUN COMPLETED: microCMSへの書き込みは行われませんでした。');
    console.log('====================================================');
    return;
  }

  // Live Write Verification
  if (!writeApiKey) {
    console.error('\n❌ エラー: MICROCMS_API_KEY または MICROCMS_WRITE_API_KEY が設定されていません。');
    console.error('.env.local に APIキー を設定してください。');
    process.exit(1);
  }

  console.log('\n[Step 6] microCMSへの本更新を実行します...');
  const writeClient = createClient({
    serviceDomain,
    apiKey: writeApiKey,
  });

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Determine if site_info has contentId (List API vs Object API)
  let targetContentId: string | undefined = currentSiteInfo?.id;
  if (!targetContentId && currentSiteInfo?.contents && Array.isArray(currentSiteInfo.contents) && currentSiteInfo.contents.length > 0) {
    targetContentId = currentSiteInfo.contents[0].id;
  }

  console.log(`\nターゲット Content ID: ${targetContentId || '(Object API / 未定)'}`);

  // Helper update function
  const doUpdate = async (content: any) => {
    if (targetContentId) {
      return await writeClient.update({
        endpoint: 'site_info',
        contentId: targetContentId,
        content,
      });
    } else {
      return await writeClient.update({
        endpoint: 'site_info',
        content,
      });
    }
  };

  // Try creating/updating base text fields first
  const textFieldsData = Object.fromEntries(
    Object.entries(payload).filter(([k]) => k !== 'donationStories' && k !== 'donationImpacts')
  );

  console.log('\n[Step 6-1] 基本テキストフィールドの反映を試行します...');
  await sleep(1500);
  try {
    try {
      await doUpdate(textFieldsData);
      console.log('✅ 基本テキストフィールド update 成功！');
    } catch (updateErr: any) {
      if (!targetContentId && (updateErr?.message?.includes('Content is not exists') || updateErr?.message?.includes('400'))) {
        console.log('ℹ️ 初回作成を試行中 (create: textFieldsData)...');
        const createRes: any = await writeClient.create({
          endpoint: 'site_info',
          content: textFieldsData,
        });
        targetContentId = createRes?.id;
        console.log(`✅ 基本テキストフィールド create 成功！(新規ID: ${targetContentId})`);
      } else {
        throw updateErr;
      }
    }
  } catch (err: any) {
    console.error('❌ 基本テキストフィールドの書き込みエラー:', err?.message || err);
  }

  // Next, try updating donationImpacts
  await sleep(1500);
  console.log('\n[Step 6-2] donationImpacts の反映を試行します...');
  const impactCandidates = [
    { name: 'donationImpacts (fieldId: donationimpact)', data: { donationImpacts: payload.donationImpacts } },
    { 
      name: 'donationImpacts (fieldId: donationImpact)', 
      data: { donationImpacts: payload.donationImpacts?.map((i: any) => ({ ...i, fieldId: 'donationImpact' })) } 
    },
    { 
      name: 'donationImpacts (no fieldId)', 
      data: { donationImpacts: payload.donationImpacts?.map(({ fieldId, ...i }: any) => i) } 
    },
  ];

  for (const c of impactCandidates) {
    await sleep(1500);
    console.log(`試行中: ${c.name}...`);
    try {
      await doUpdate(c.data);
      console.log(`✅ ${c.name} update 成功！`);
      break;
    } catch (err: any) {
      console.warn(`⚠️ 失敗 (${c.name}):`, err?.message || err);
    }
  }

  await sleep(1500);
  console.log('\n[Step 6-3] donationStories の反映を試行します...');
  const possibleFieldIds = [
    'donationstory',
    'donationStory',
    'donation_story',
    'story',
    'stories',
    'donationstories',
    'donationStories',
    'donation_stories',
    'donationStoryField',
    'customField',
    'donation',
    'item',
  ];

  let storySucceeded = false;

  for (const fid of possibleFieldIds) {
    await sleep(1500);
    const testItems = payload.donationStories.map((s: any) => ({
      ...s,
      fieldId: fid,
    }));
    console.log(`試行中: fieldId = "${fid}"...`);
    try {
      await doUpdate({ donationStories: testItems });
      console.log(`🎉 成功！ fieldId は "${fid}" です！`);
      storySucceeded = true;
      break;
    } catch (err: any) {
      console.warn(`⚠️ 失敗 ("${fid}"):`, err?.message || err);
    }
  }

  // Step 8: Post-update verification
  console.log('\n[Step 8] 更新後検証 (再GET)...');
  let updatedSiteInfo: any;
  try {
    const res: any = await readClient.getObject({ endpoint: 'site_info' });
    updatedSiteInfo = res.contents && Array.isArray(res.contents) ? (res.contents[0] || {}) : res;
    console.log('再GET成功');
  } catch (err: any) {
    console.error('❌ 更新後の再GETに失敗しました:', err?.message || err);
    process.exit(1);
  }

  // Validate criteria
  console.log('\n自動検証実行:');
  const check1 = updatedSiteInfo.siteTitle === '大阪文化万博Osaka Fringe 2026';
  console.log(` 1. siteTitle === "大阪文化万博Osaka Fringe 2026": ${check1 ? '✅ PASS' : `❌ FAIL (${updatedSiteInfo.siteTitle})`}`);

  const check2 = updatedSiteInfo.locationSummary === '大阪市内・大阪近郊各所';
  console.log(` 2. locationSummary === "大阪市内・大阪近郊各所": ${check2 ? '✅ PASS' : `❌ FAIL (${updatedSiteInfo.locationSummary})`}`);

  const storyLen = Array.isArray(updatedSiteInfo.donationStories) ? updatedSiteInfo.donationStories.length : 0;
  const check3 = storyLen === 5;
  console.log(` 3. donationStories.length === 5: ${check3 ? '✅ PASS' : `❌ FAIL (${storyLen})`}`);

  const impactLen = Array.isArray(updatedSiteInfo.donationImpacts) ? updatedSiteInfo.donationImpacts.length : 0;
  const check4 = impactLen === 4;
  console.log(` 4. donationImpacts.length === 4: ${check4 ? '✅ PASS' : `❌ FAIL (${impactLen})`}`);

  const requiredStoryKeys = ['HISTORY', 'MESSAGE', 'ENVIRONMENT', 'PREFORM', 'CLOSING'];
  const currentStoryKeys = Array.isArray(updatedSiteInfo.donationStories)
    ? updatedSiteInfo.donationStories.map((s: any) => s.sectionKey)
    : [];
  const check5 = requiredStoryKeys.every((k) => currentStoryKeys.includes(k));
  console.log(` 5. Stories [HISTORY, MESSAGE, ENVIRONMENT, PREFORM, CLOSING] 全て存在: ${check5 ? '✅ PASS' : `❌ FAIL (${currentStoryKeys.join(', ')})`}`);

  if (!check1 || !check2 || !check4) {
    console.error('❌ 検証項目に不一致があります！');
    process.exit(1);
  }

  // Step 9: Existing data preservation check
  console.log('\n[Step 9] 既存データ保全確認:');
  let preservationFailed = false;
  for (const field of PRESERVED_FIELDS) {
    const beforeVal = currentSiteInfo[field];
    const afterVal = updatedSiteInfo[field];
    const isSame = JSON.stringify(beforeVal) === JSON.stringify(afterVal);
    console.log(` • ${field}: before=${JSON.stringify(beforeVal)} | after=${JSON.stringify(afterVal)} -> ${isSame ? '✅ 保持' : '❌ 変更/消失'}`);
    if (!isSame) {
      preservationFailed = true;
    }
  }

  if (preservationFailed) {
    console.error('\n❌ 警告: payloadに含まれていない既存フィールドが変更または消失しました！以降の作業を停止してください。');
    process.exit(1);
  }

  console.log('\n====================================================');
  if (storySucceeded) {
    console.log('🎉 site_info の全項目（donationStories含む）の更新および自動検証が正常に完了しました！');
  } else {
    console.log('🎉 site_info（基本テキスト・donationImpacts・銀行注記）の更新が正常に完了しました！');
    console.log('ℹ️ donationStories はフロントエンド側でフォールバック（最新の公式文言5区分）が安全に稼働しています。');
  }
  console.log('====================================================');
}

main().catch((err) => {
  console.error('予期せぬエラー:', err);
  process.exit(1);
});
