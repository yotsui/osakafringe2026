const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');

async function main() {
  if (!fs.existsSync('scratch/N02-23_GML.zip')) {
    console.log('Downloading...');
    await new Promise((res, rej) => {
      const f = fs.createWriteStream('scratch/N02-23_GML.zip');
      https.get('https://nlftp.mlit.go.jp/ksj/gml/data/N02/N02-23/N02-23_GML.zip', r => {
        r.pipe(f);
        f.on('finish', () => f.close(res));
      }).on('error', rej);
    });
  }
  if (!fs.existsSync('scratch/n02/UTF-8/N02-23_Station.geojson')) {
    console.log('Unzipping...');
    execSync('powershell -Command "Expand-Archive -Path \'scratch/N02-23_GML.zip\' -DestinationPath \'scratch/n02\' -Force"');
  }

  const stationsRaw = JSON.parse(fs.readFileSync('scratch/n02/UTF-8/N02-23_Station.geojson', 'utf8'));

  console.log('--- Hineno & Kumatori ---');
  stationsRaw.features
    .filter(f => ['日根野', '熊取', '長滝'].includes(f.properties.N02_005))
    .forEach(f => {
      console.log(f.properties.N02_004, f.properties.N02_003, f.properties.N02_005, f.geometry.coordinates[0]);
    });

  console.log('--- Kintetsu Ikoma Line & Oji ---');
  stationsRaw.features
    .filter(f => (f.properties.N02_003 && f.properties.N02_003.includes('生駒線')) || ['王寺', '新王寺', '平群', '生駒'].includes(f.properties.N02_005))
    .forEach(f => {
      console.log(f.properties.N02_004, f.properties.N02_003, f.properties.N02_005, f.geometry.coordinates[0]);
    });
}

main().catch(console.error);
