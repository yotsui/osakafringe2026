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
  const linesRaw = JSON.parse(fs.readFileSync('scratch/n02/UTF-8/N02-23_RailroadSection.geojson', 'utf8'));

  console.log('--- Checking Minoh / Kayano ---');
  const minohStations = stationsRaw.features.filter(f => f.properties.N02_005 && (f.properties.N02_005.includes('箕面') || f.properties.N02_005.includes('萱野')));
  minohStations.forEach(m => console.log(m.properties.N02_004, m.properties.N02_003, m.properties.N02_005));

  console.log('--- Checking Fukuchiyama / Takarazuka ---');
  const fukuchi = stationsRaw.features.filter(f => f.properties.N02_003 && f.properties.N02_003.includes('福知山'));
  console.log('Fukuchiyama stations count:', fukuchi.length);
  fukuchi.slice(0, 10).forEach(m => console.log(m.properties.N02_005, m.geometry.coordinates[0]));

  console.log('--- Checking Kawachinagano ---');
  const kn = stationsRaw.features.filter(f => f.properties.N02_005 && f.properties.N02_005.includes('河内長野'));
  kn.forEach(m => console.log(m.properties.N02_004, m.properties.N02_003, m.properties.N02_005, m.geometry.coordinates[0]));

  console.log('--- Checking Kansai Airport ---');
  const kix = stationsRaw.features.filter(f => f.properties.N02_005 && (f.properties.N02_005.includes('関西空港') || f.properties.N02_005.includes('りんくう')));
  kix.forEach(m => console.log(m.properties.N02_004, m.properties.N02_003, m.properties.N02_005, m.geometry.coordinates[0]));

  console.log('--- Checking Shinkansen in lines ---');
  const shinkansen = linesRaw.features.filter(f => (f.properties.N02_003 && f.properties.N02_003.includes('新幹線')) || (f.properties.N02_004 && f.properties.N02_004.includes('東海旅客鉄道')));
  console.log('Shinkansen lines count:', shinkansen.length);
  shinkansen.slice(0, 5).forEach(m => console.log(m.properties.N02_004, m.properties.N02_003));
}

main().catch(console.error);
