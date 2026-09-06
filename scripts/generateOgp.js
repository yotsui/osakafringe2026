const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function createOgp() {
  const kvPath = path.join(__dirname, '../public/images/osakafringe_visuals.webp');
  const logoPath = path.join(__dirname, '../public/logo/大阪文化万博_開催期間_01.png');

  // Load KV and round its corners
  const kvSize = 590;
  const roundedCorners = Buffer.from(
    `<svg><rect x="0" y="0" width="${kvSize}" height="${kvSize}" rx="20" ry="20"/></svg>`
  );

  const roundedKv = await sharp(kvPath)
    .resize(kvSize, kvSize, { fit: 'cover' })
    .composite([{ input: roundedCorners, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Load Logo (pink on black/transparent)
  const logo = await sharp(logoPath)
    .resize(480, null, { fit: 'inside' })
    .toBuffer();

  // Create 1200x630 background SVG
  const svgOverlay = Buffer.from(`
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#070A12"/>
          <stop offset="100%" stop-color="#0F172A"/>
        </linearGradient>
      </defs>
      
      <rect width="1200" height="630" fill="url(#bg)"/>
      
      <!-- Subtle brand border -->
      <rect x="20" y="20" width="1160" height="590" rx="24" fill="none" stroke="#1E293B" stroke-width="2"/>

      <!-- Category badge -->
      <rect x="65" y="70" width="220" height="28" rx="14" fill="#1E293B" stroke="#334155" stroke-width="1"/>
      <text x="175" y="89" font-family="'Helvetica Neue', Arial, sans-serif" font-size="11" font-weight="900" fill="#E6007E" text-anchor="middle" letter-spacing="2">OFFICIAL WEBSITE</text>
      
      <!-- Taglines -->
      <text x="65" y="380" font-family="'Helvetica Neue', Arial, sans-serif" font-size="32" font-weight="900" fill="#FFFFFF" letter-spacing="1">spill over</text>
      <text x="65" y="420" font-family="'Hiragino Sans', 'Meiryo', sans-serif" font-size="20" font-weight="700" fill="#E2E8F0">文化芸術が街にあふれだす。</text>
      
      <line x1="65" y1="452" x2="525" y2="452" stroke="#334155" stroke-width="1.5"/>

      <!-- Dates & Locations -->
      <text x="65" y="492" font-family="'Helvetica Neue', Arial, sans-serif" font-size="17" font-weight="900" fill="#FFF100" letter-spacing="1">2026.10.8 THU – 11.8 SUN</text>
      <text x="65" y="525" font-family="'Hiragino Sans', 'Meiryo', sans-serif" font-size="14" font-weight="600" fill="#94A3B8">大阪市内各所（劇場・広場・歴史的建築・カフェ）</text>

      <!-- URL footer -->
      <text x="65" y="565" font-family="'Helvetica Neue', Arial, sans-serif" font-size="13" font-weight="800" fill="#64748B" letter-spacing="1">https://osakafringe.com</text>
    </svg>
  `);

  await sharp(svgOverlay)
    .composite([
      { input: logo, top: 125, left: 65 },
      { input: roundedKv, top: 20, left: 585 },
    ])
    .jpeg({ quality: 92 })
    .toFile(path.join(__dirname, '../public/ogp.jpg'));

  console.log('public/ogp.jpg generated successfully');
}

createOgp().catch(console.error);
