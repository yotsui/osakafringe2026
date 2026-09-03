const fs = require('fs');

console.log('Reading RailroadSection.geojson...');
const linesRaw = JSON.parse(fs.readFileSync('scratch/n02/UTF-8/N02-23_RailroadSection.geojson', 'utf8'));
console.log('Total line features:', linesRaw.features.length);

const sample = linesRaw.features.find(f => f.properties.N02_004 && f.properties.N02_004.includes('大阪市高速電気軌道'));
console.log('Sample Osaka Metro line:', sample ? sample.properties : 'not found');

// Find all distinct operators containing Osaka/JR West/etc.
const opMap = {};
linesRaw.features.forEach(f => {
  const op = f.properties.N02_004 || '';
  const lineName = f.properties.N02_003 || '';
  if (
    op.includes('大阪市高速電気軌道') ||
    op.includes('西日本旅客鉄道') ||
    op.includes('阪急電鉄') ||
    op.includes('阪神電気鉄道') ||
    op.includes('京阪電気鉄道') ||
    op.includes('近畿日本鉄道') ||
    op.includes('南海電気鉄道') ||
    op.includes('大阪モノレール') ||
    op.includes('北大阪急行電鉄')
  ) {
    if (!opMap[op]) opMap[op] = new Set();
    opMap[op].add(lineName);
  }
});

console.log('\n--- Operators & Lines found ---');
for (const [op, lines] of Object.entries(opMap)) {
  console.log(`${op}: [${Array.from(lines).join(', ')}]`);
}

// Check Stations
console.log('\nReading Station.geojson...');
const stationsRaw = JSON.parse(fs.readFileSync('scratch/n02/UTF-8/N02-23_Station.geojson', 'utf8'));
console.log('Total station features:', stationsRaw.features.length);
const sampleStation = stationsRaw.features.find(f => f.properties.N02_004 && f.properties.N02_004.includes('大阪市高速電気軌道'));
console.log('Sample Osaka Metro station:', sampleStation ? sampleStation.properties : 'not found');
