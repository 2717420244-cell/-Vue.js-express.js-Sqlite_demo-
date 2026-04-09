const http = require('http');
const https = require('https');
const { URL } = require('url');
const path = require('path');
const fs = require('fs');

function getFilenameFromUrl(url, defaultName = 'image.jpg') {
  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;
    const basename = path.basename(pathname);
    return basename && basename.includes('.') ? basename : defaultName;
  } catch {
    return defaultName;
  }
}

function downloadImage(imageUrl, savePath) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(imageUrl);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      timeout: 30000
    };

    const request = protocol.request(options, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP Error: Status Code ${response.statusCode}`));
        return;
      }

      const filePath = savePath || path.join(__dirname, getFilenameFromUrl(imageUrl));
      const writeStream = fs.createWriteStream(filePath);
      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloadedSize = 0;

      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        if (totalSize) {
          process.stdout.write(`\rDownloading: ${Math.floor((downloadedSize / totalSize) * 100)}%`);
        }
      });

      response.pipe(writeStream);

      writeStream.on('finish', () => {
        console.log(`\nDownload completed: ${filePath}`);
        resolve(filePath);
      });

      writeStream.on('error', (err) => {
        reject(new Error(`File write error: ${err.message}`));
      });
    });

    request.on('error', (err) => {
      reject(new Error(`Network error: ${err.message}`));
    });

    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });

    request.end();
  });
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node imageDownloader.js <image_url> [save_path]');
    console.log('Example: node imageDownloader.js https://example.com/image.jpg');
    return;
  }

  const imageUrl = args[0];
  const savePath = args[1] || null;

  try {
    new URL(imageUrl);
  } catch {
    console.error('Error: Invalid URL format');
    return;
  }

  console.log(`Downloading: ${imageUrl}`);

  try {
    await downloadImage(imageUrl, savePath);
  } catch (err) {
    console.error(`\nDownload failed: ${err.message}`);
  }
}

main();
