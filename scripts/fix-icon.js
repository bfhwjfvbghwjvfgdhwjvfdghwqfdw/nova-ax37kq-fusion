const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcon() {
  const buildDir = path.resolve(__dirname, '..', 'build');
  const iconPath = path.join(buildDir, 'icon.ico');
  const pngPath = path.join(buildDir, 'icon-256.png');
  
  // Ensure build directory exists
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  try {
    // Create a simple 256x256 PNG icon with a blue background
    const size = 256;
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="#0078FF"/>
        <text x="50%" y="50%" font-size="120" fill="white" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-weight="bold">X</text>
      </svg>
    `;

    // Generate PNG first
    await sharp(Buffer.from(svg))
      .resize(256, 256)
      .png()
      .toFile(pngPath);

    console.log(`✓ Generated PNG at: ${pngPath}`);

    // Now use png-to-ico to create proper ICO file
    const { default: pngToIco } = await import('png-to-ico');
    const pngBuffer = fs.readFileSync(pngPath);
    
    // Generate ICO with multiple sizes for better compatibility
    const icoBuffer = await pngToIco([pngBuffer]);
    fs.writeFileSync(iconPath, icoBuffer);

    console.log(`✓ Generated ICO at: ${iconPath}`);
    
    // Clean up the temporary PNG
    fs.unlinkSync(pngPath);
    
    console.log('\n✅ Icon generation complete! You can now run the build.');
  } catch (error) {
    console.error('❌ Error generating icon:', error);
    process.exit(1);
  }
}

generateIcon();
