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

async function run() {
  console.log('Testing site_info contentId...');
  try {
    const res = await client.getListDetail({ endpoint: 'site_info', contentId: 'site_info' });
    console.log('getListDetail site_info ID "site_info":', JSON.stringify(res, null, 2));
  } catch (e: any) {
    console.log('getListDetail with id "site_info" error:', e?.message || e);
  }

  try {
    const res = await client.getList({ endpoint: 'site_info', queries: { limit: 100 } });
    console.log('getList site_info:', JSON.stringify(res, null, 2));
  } catch (e: any) {
    console.log('getList error:', e?.message || e);
  }
}

run();
