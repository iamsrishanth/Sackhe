const https = require('https');
const fs = require('fs');
const path = require('path');

const assetNames = [
  'sackhelogo.webp',
  'Home View1.webp',
  'Home View2.webp',
  'Solid Waste Management System.webp',
  'premium-pad.webp',
  '4 View Sides.webp',
  'Sackhe_Specifications..webp',
  'our mission.webp',
  'our vision.webp',
  'Innovation.webp',
  'sustainability.webp',
  'excellence.webp',
  'integrity.webp',
  'Team.webp',
  'Maintenance Services.webp',
  'Waste Management Advisory.webp',
  'Girls Schools & Colleges .webp',
  'Local Communities.webp',
  'Municipal Authorities.webp',
  'Environmental Ecosystems.webp',
  'Public Health.webp',
  'Future Generations.webp',
  'Sandhya.webp',
  'Varshitha.webp',
  'Rakesh.webp',
  'Jahnavi.webp',
  'Sai Venkata Satya Kedar Illa.webp',
  'kg reddy.webp',
  'srix.webp',
  'kase.webp',
  '1.webp',
  '2.webp',
  '3.webp',
  '4.webp',
  '5.webp',
  '6.webp',
  '7.webp',
  '8.webp',
  '9.webp',
  '10.webp',
  '11.webp',
  '12.webp',
  '13.webp',
  '14.webp'
];

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };
    
    const request = (currentUrl) => {
      https.get(currentUrl, options, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          let redirectUrl = res.headers.location;
          if (!redirectUrl.startsWith('http')) {
            const parsedUrl = new URL(currentUrl);
            redirectUrl = parsedUrl.origin + redirectUrl;
          }
          request(redirectUrl);
          return;
        }

        if (res.statusCode !== 200) {
          reject(new Error(`Failed to get '${currentUrl}' (Status Code: ${res.statusCode})`));
          return;
        }

        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', (err) => {
        reject(err);
      });
    };
    
    request(url);
  });
};

async function run() {
  const destDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
  }

  for (const name of assetNames) {
    const encodedName = encodeURIComponent(name);
    const url = `https://www.sackhetechnologies.com/${encodedName}`;
    const dest = path.join(destDir, name);
    try {
      await download(url, dest);
      const stat = fs.statSync(dest);
      console.log(`Successfully downloaded: ${name} (${stat.size} bytes)`);
    } catch (err) {
      console.error(`Failed to download ${name}:`, err.message);
    }
  }
  console.log('Asset downloads finished.');
}

run();
