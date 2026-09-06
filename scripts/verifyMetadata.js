const fs = require('fs');
const path = require('path');

const pages = [
  'index.html',
  'about.html',
  'audience.html',
  'artists.html',
  'venues.html',
  'donate.html',
  'contact.html'
];

pages.forEach(p => {
  const filePath = path.join(__dirname, '../.next/server/app', p);
  if (fs.existsSync(filePath)) {
    const html = fs.readFileSync(filePath, 'utf8');
    console.log(`\n=== PAGE: ${p} ===`);
    
    // Extract canonical
    const canonicalMatch = html.match(/<link rel="canonical" href="([^"]+)"/);
    console.log('  canonical:', canonicalMatch ? canonicalMatch[1] : 'NONE');

    // Extract OG tags
    const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/);
    const ogDesc = html.match(/<meta property="og:description" content="([^"]+)"/);
    const ogUrl = html.match(/<meta property="og:url" content="([^"]+)"/);
    const ogSiteName = html.match(/<meta property="og:site_name" content="([^"]+)"/);
    const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/);
    const ogImageWidth = html.match(/<meta property="og:image:width" content="([^"]+)"/);
    const ogImageHeight = html.match(/<meta property="og:image:height" content="([^"]+)"/);

    console.log('  og:title:', ogTitle ? ogTitle[1] : 'NONE');
    console.log('  og:description:', ogDesc ? ogDesc[1].substring(0, 50) + '...' : 'NONE');
    console.log('  og:url:', ogUrl ? ogUrl[1] : 'NONE');
    console.log('  og:site_name:', ogSiteName ? ogSiteName[1] : 'NONE');
    console.log('  og:image:', ogImage ? ogImage[1] : 'NONE');
    console.log('  og:image:dimensions:', `${ogImageWidth ? ogImageWidth[1] : ''} x ${ogImageHeight ? ogImageHeight[1] : ''}`);

    // Extract Twitter tags
    const twCard = html.match(/<meta name="twitter:card" content="([^"]+)"/);
    const twTitle = html.match(/<meta name="twitter:title" content="([^"]+)"/);
    const twImage = html.match(/<meta name="twitter:image" content="([^"]+)"/);
    console.log('  twitter:card:', twCard ? twCard[1] : 'NONE');
    console.log('  twitter:title:', twTitle ? twTitle[1] : 'NONE');
    console.log('  twitter:image:', twImage ? twImage[1] : 'NONE');
  } else {
    console.log('Not found:', filePath);
  }
});
