const fs = require('fs');
const path = require('path');
const https = require('https');

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const SAMPLE_IMAGES = [
  {
    filename: 'sample_pothole_1.jpg',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80',
    description: 'Road damage / crater pothole',
  },
  {
    filename: 'sample_pothole_2.jpg',
    url: 'https://images.unsplash.com/photo-1584463699047-73d72a74c2be?w=800&q=80',
    description: 'Duplicate road damage pothole',
  },
  {
    filename: 'sample_garbage_1.jpg',
    url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&q=80',
    description: 'Overflowing dumpster / garbage pile',
  },
  {
    filename: 'sample_streetlight_1.jpg',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80',
    description: 'Broken streetlight lamp post',
  },
  {
    filename: 'sample_streetlight_before.jpg',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80',
    description: 'Streetlight outage before repair',
  },
  {
    filename: 'sample_streetlight_after.jpg',
    url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80',
    description: 'Working streetlight after repair',
  },
  {
    filename: 'sample_drain_1.jpg',
    url: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?w=800&q=80',
    description: 'Clogged drain / stormwater flooding',
  },
  {
    filename: 'sample_water_1.jpg',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
    description: 'Water leakage / pipeline burst',
  },
  {
    filename: 'pothole.jpg',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80',
    description: 'Test pothole photo',
  },
  {
    filename: 'photo.jpg',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80',
    description: 'Generic test photo',
  },
];

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // Follow redirects if any (Unsplash often returns 301/302)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: HTTP status ${res.statusCode}`));
      }

      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

async function downloadAll() {
  console.log(`[Sample Images] Ensuring sample photos in ${UPLOADS_DIR}...`);
  for (const item of SAMPLE_IMAGES) {
    const dest = path.join(UPLOADS_DIR, item.filename);
    if (!fs.existsSync(dest) || fs.statSync(dest).size === 0) {
      try {
        console.log(`[Sample Images] Downloading ${item.filename} (${item.description})...`);
        await downloadFile(item.url, dest);
        console.log(`[Sample Images] Saved ${item.filename} (${fs.statSync(dest).size} bytes).`);
      } catch (err) {
        console.error(`[Sample Images] Error downloading ${item.filename}:`, err.message);
      }
    } else {
      console.log(`[Sample Images] Already exists: ${item.filename}`);
    }
  }
  console.log('[Sample Images] All sample photos are ready.');
}

if (require.main === module) {
  downloadAll();
}

module.exports = { downloadAll };
