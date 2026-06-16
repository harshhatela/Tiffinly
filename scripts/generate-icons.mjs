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

// Tiffinly branded SVG icon — tiffin box illustration
function makeBrandedSVG(size) {
  const r = Math.round(size * 0.22);
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF8C52"/>
      <stop offset="100%" stop-color="#E55A1C"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="url(#bg)" rx="${r}"/>
  <!-- Tiffin box body -->
  <rect x="${size*0.2}" y="${size*0.42}" width="${size*0.6}" height="${size*0.32}"
        rx="${size*0.06}" fill="white" opacity="0.95"/>
  <!-- Tiffin box lid -->
  <rect x="${size*0.16}" y="${size*0.32}" width="${size*0.68}" height="${size*0.14}"
        rx="${size*0.05}" fill="white" opacity="0.85"/>
  <!-- Lid handle -->
  <rect x="${size*0.38}" y="${size*0.24}" width="${size*0.24}" height="${size*0.1}"
        rx="${size*0.04}" fill="white" opacity="0.7"/>
  <!-- Steam lines (3 wavy lines above) -->
  <path d="M${size*0.35} ${size*0.18} Q${size*0.38} ${size*0.12} ${size*0.35} ${size*0.06}"
        stroke="white" stroke-width="${size*0.025}" fill="none" opacity="0.5"
        stroke-linecap="round"/>
  <path d="M${size*0.5} ${size*0.16} Q${size*0.53} ${size*0.10} ${size*0.5} ${size*0.04}"
        stroke="white" stroke-width="${size*0.025}" fill="none" opacity="0.5"
        stroke-linecap="round"/>
  <path d="M${size*0.65} ${size*0.18} Q${size*0.68} ${size*0.12} ${size*0.65} ${size*0.06}"
        stroke="white" stroke-width="${size*0.025}" fill="none" opacity="0.5"
        stroke-linecap="round"/>
  <!-- Divider line on tiffin body -->
  <rect x="${size*0.2}" y="${size*0.56}" width="${size*0.6}" height="${size*0.02}"
        fill="#FF6B2C" opacity="0.3"/>
</svg>`;
}

const icons = [
  { size: 512, name: 'pwa-512x512.png'      },
  { size: 192, name: 'pwa-192x192.png'      },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32,  name: 'favicon-32x32.png'   },
  { size: 512, name: 'icon.png'             },
];

for (const { size, name } of icons) {
  await sharp(Buffer.from(makeBrandedSVG(size))).png().toFile(`public/${name}`);
  console.log(`✅ ${name}  (${size}×${size})`);
}

copyFileSync('public/favicon-32x32.png', 'public/favicon.ico');
console.log('✅ favicon.ico\n\n🎉 All icons generated.');
