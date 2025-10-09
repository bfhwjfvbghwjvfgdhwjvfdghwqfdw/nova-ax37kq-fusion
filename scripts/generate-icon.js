const Jimp = require('jimp');
const fs = require('fs').promises;
const path = require('path');

async function generateIcon() {
  const size = 256;
  const iconPath = path.resolve(__dirname, '..', 'build', 'icon.ico');
  
  // Create a new image
  const image = new Jimp(size, size, '#0078FF');
  
  // Save as PNG first (since Jimp doesn't support ICO directly)
  const pngPath = iconPath.replace('.ico', '.png');
  await image.writeAsync(pngPath);
  
  // Convert to ICO using png-to-ico
  const pngToIco = require('png-to-ico');
  const buf = await fs.readFile(pngPath);
  const icoBuffer = await pngToIco(buf);
  await fs.writeFile(iconPath, icoBuffer);
  
  // Clean up PNG
  await fs.unlink(pngPath);
  
  console.log('New icon generated at:', iconPath);
}

generateIcon().catch(console.error);