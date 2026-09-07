const https = require('https');
const fs = require('fs');
const path = require('path');

const assetNames = [
  'sackhelogo.png',
  'Home View2.png',
  'Solid Waste Management System.png',
  'premium-pad.png',
  'Girls Schools & Colleges .jpeg',
  'Local Communities.jpg',
  'Municipal Authorities.jpeg',
  'Environmental Ecosystems.jpeg',
  'Public Health.jpeg',
  'Future Generations.webp',
  'Sai Venkata Satya Kedar Illa.JPG',
  'our mission.png',
  'our vision.png',
  'Innovation.png',
  'sustainability.png',
  'excellence.png',
  'Home View1.png',
  '4 View Sides.png',
  'Sackhe_Specifications..png',
  'Maintenance Services.png',
  'Waste Management Advisory.png'
];

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };
    https.get(url, options, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (Status Code: ${res.statusCode})`));
        return;
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${url} to ${dest}`);
        resolve();
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

async function run() {
  const destDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
  }

  for (const name of assetNames) {
    const encodedName = encodeURIComponent(name);
    const url = `https://sackhetechnologies.com/${encodedName}`;
    const dest = path.join(destDir, name);
    try {
      await download(url, dest);
    } catch (err) {
      console.error(`Failed to download ${name}:`, err.message);
    }
  }
  console.log('Asset downloads finished.');
}

run();
