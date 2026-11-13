const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function main() {
  const publicDir = path.join(__dirname, '..', 'public');
  const appDir = path.join(__dirname, '..', 'src', 'app');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#40D9FF"/>
      <stop offset="45%" stop-color="#00A6FF"/>
      <stop offset="100%" stop-color="#0066FF"/>
    </linearGradient>
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#0076F9"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background tile -->
  <rect width="128" height="128" rx="26" fill="#050813"/>
  <rect width="126" height="126" x="1" y="1" rx="25" fill="none" stroke="#0076F9" stroke-width="2" stroke-opacity="0.5"/>

  <!-- ULT Text -->
  <text x="58" y="70" 
        font-family="Arial, Helvetica, sans-serif" 
        font-size="47" 
        font-weight="900" 
        font-style="italic" 
        letter-spacing="-1"
        text-anchor="middle" 
        fill="url(#blueGrad)">ULT</text>

  <!-- Dynamic swooshing arrow under ULT swooshing up to the right -->
  <path d="M 12 98 C 36 98, 66 94, 95 76 L 93 84 L 118 60 L 92 63 L 96 70 C 70 86, 40 92, 12 92 Z"
        fill="url(#glowGrad)"
        filter="url(#glow)"/>
</svg>`;

  const svgBuffer = Buffer.from(svg);

  // 1. public/favicon.png (192x192)
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  // 2. src/app/favicon.ico (32x32)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(appDir, 'favicon.ico'));

  // 3. public/favicon.ico (32x32)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));

  // 4. src/app/icon.png (32x32)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(appDir, 'icon.png'));

  // 5. src/app/apple-icon.png (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(appDir, 'apple-icon.png'));

  // 6. public/favicon-32x32.png
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));

  // 7. public/favicon-16x16.png
  await sharp(svgBuffer)
    .resize(16, 16)
    .png()
    .toFile(path.join(publicDir, 'favicon-16x16.png'));

  console.log('All "ULT" favicon and icon assets generated successfully!');
}

main().catch(console.error);
