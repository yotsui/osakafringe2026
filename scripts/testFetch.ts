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

const serviceDomain = (process.env.MICROCMS_SERVICE_DOMAIN || '').trim();
const apiKey = (process.env.MICROCMS_API_KEY || '').trim();

const client = createClient({
  serviceDomain,
  apiKey,
});

async function verify() {
  console.log('=== [1] microCMS 実API (Raw) GET 検証 ===');
  const res: any = await client.getObject({ endpoint: 'site_info' });
  const rawData = res.contents && Array.isArray(res.contents) ? res.contents[0] : res;

  console.log('1. rawData.donationStories 存在確認 & 長さ:', rawData.donationStories?.length);
  console.log('2. rawData.donationImpacts 存在確認 & 長さ:', rawData.donationImpacts?.length);
  console.log('3. rawData.donationStories sectionKey 一覧 (Raw):', 
    rawData.donationStories?.map((s: any) => ({
      sectionKey: s.sectionKey,
      isArray: Array.isArray(s.sectionKey),
      title: s.title
    }))
  );
  console.log('4. rawData.donationImpacts labels:',
    rawData.donationImpacts?.map((i: any) => ({ label: i.label, title: i.title }))
  );

  console.log('\n=== [2] アプリケーション正規化 (Normalized) 検証 ===');
  const normalizeDonationStory = (raw: any) => {
    let sectionKey = 'HISTORY';
    if (Array.isArray(raw?.sectionKey) && raw.sectionKey.length > 0) {
      sectionKey = raw.sectionKey[0];
    } else if (typeof raw?.sectionKey === 'string' && raw.sectionKey) {
      sectionKey = raw.sectionKey;
    }
    return {
      sectionKey,
      title: raw?.title || '',
      titleEn: raw?.titleEn || raw?.title || '',
      text: raw?.text || '',
      textEn: raw?.textEn || raw?.text || '',
    };
  };

  const normalizedStories = rawData.donationStories?.map(normalizeDonationStory);
  console.log('正規化後の Stories (Scalar sectionKey):');
  normalizedStories.forEach((s: any, idx: number) => {
    console.log(` [${idx + 1}] sectionKey: "${s.sectionKey}" (type: ${typeof s.sectionKey}) | title: "${s.title.replace(/\n/g, ' ')}"`);
  });

  const allScalar = normalizedStories.every((s: any) => typeof s.sectionKey === 'string' && ['HISTORY', 'MESSAGE', 'ENVIRONMENT', 'PREFORM', 'CLOSING'].includes(s.sectionKey));
  console.log('\n全5セクションの sectionKey が scalar string で正常:', allScalar ? '✅ PASS' : '❌ FAIL');
}

verify().catch((e) => {
  console.error('検証エラー:', e);
  process.exit(1);
});
