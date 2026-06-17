import sharp from 'sharp';
import { copyFileSync, existsSync } from 'fs';

const SOURCE = 'public/favicon.ico';
if (!existsSync(SOURCE)) {
  console.error(`❌ ${SOURCE} not found. Ensure your real favicon.ico is in public/`);
  process.exit(1);
}

// Generate all PWA sizes from the real favicon
const sizes = [
  { size: 512, name: 'pwa-512x512.png'      },
  { size: 192, name: 'pwa-192x192.png'      },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32,  name: 'favicon-32x32.png'   },
];

for (const { size, name } of sizes) {
  await sharp(SOURCE)
    .resize(size, size, { fit: 'contain', background: { r:0,g:0,b:0,alpha:0 } })
    .png()
    .toFile(`public/${name}`);
  console.log(`✅ Generated public/${name} (${size}×${size})`);
}

// icon.png = 512px version (used in app UI)
await sharp(SOURCE)
  .resize(512, 512, { fit: 'contain', background: { r:0,g:0,b:0,alpha:0 } })
  .png()
  .toFile('public/icon.png');
console.log('✅ Generated public/icon.png');
console.log('\n🎉 All icons generated from your real favicon.ico');
