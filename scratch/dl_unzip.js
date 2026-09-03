const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');

console.log('Downloading N02-23_GML.zip...');
const file = fs.createWriteStream('scratch/N02-23_GML.zip');
https.get('https://nlftp.mlit.go.jp/ksj/gml/data/N02/N02-23/N02-23_GML.zip', res => {
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Downloaded. Unzipping...');
    execSync('powershell -Command "Expand-Archive -Path \'scratch/N02-23_GML.zip\' -DestinationPath \'scratch/n02\' -Force"');
    console.log('Unzipped successfully');
  });
});
