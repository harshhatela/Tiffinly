/**
 * Generates Tiffinly PWA icons in the /public directory.
 * Run once with: node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
import { mkdirSync, existsSync, copyFileSync } from 'fs';

if (!existsSync('public')) {
  mkdirSync('public');
  console.log('Created public/ directory');
}

const BRAND_ORANGE = '#FF6B2C';
const BRAND_LIGHT  = '#FFF0E8';

// Generate SVG for a given size with a Tiffinly tiffin-box icon
function makeSVG(size) {
  const r     = Math.round(size * 0.22);  // corner radius of bg
  const fs    = Math.round(size * 0.48);  // font size

  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${BRAND_ORANGE}" rx="${r}"/>
      <text
        x="50%" y="54%"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="${fs}"
        font-weight="700"
        fill="${BRAND_LIGHT}"
        text-anchor="middle"
        dominant-baseline="middle"
      >T</text>
    </svg>
  `.trim();
}

const icons = [
  { size: 512, name: 'pwa-512x512.png'      },
  { size: 192, name: 'pwa-192x192.png'      },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32,  name: 'favicon-32x32.png'   },
];

for (const { size, name } of icons) {
  await sharp(Buffer.from(makeSVG(size)))
    .png()
    .toFile(`public/${name}`);
  console.log(`✅ Generated public/${name}  (${size}×${size})`);
}

// favicon.ico = rename/copy the 32px version
copyFileSync('public/favicon-32x32.png', 'public/favicon.ico');
console.log('✅ Generated public/favicon.ico');

console.log('\n🎉 All icons ready. Commit the public/ folder.');
