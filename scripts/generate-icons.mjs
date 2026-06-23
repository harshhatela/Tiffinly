import sharp from 'sharp';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { decodeIco } from 'icojs';

const ICO_PATH = 'public/favicon.ico';

if (!existsSync(ICO_PATH)) {
  console.error(`❌ ${ICO_PATH} not found.`);
  process.exit(1);
}

console.log('🔍 Decoding favicon.ico...');
const icoBuffer = readFileSync(ICO_PATH);
const arrayBuf  = icoBuffer.buffer.slice(icoBuffer.byteOffset, icoBuffer.byteOffset + icoBuffer.byteLength);
const images    = await decodeIco(arrayBuf);

if (!images || images.length === 0) {
  console.error('❌ Could not extract any images from favicon.ico — file may be corrupt.');
  process.exit(1);
}

// Pick the LARGEST embedded frame (most detail for upscaling)
const largest = images.sort((a, b) => b.width - a.width)[0];
console.log(`✅ Extracted ${largest.width}×${largest.height} frame from favicon.ico`);

// Save the extracted PNG as our real source file
writeFileSync('public/icon-source.png', Buffer.from(largest.buffer));
console.log('✅ Saved public/icon-source.png (real logo, decoded from .ico)');

// Now generate all required PWA sizes FROM the real decoded source
const sizes = [
  { size: 512, name: 'pwa-512x512.png'      },
  { size: 192, name: 'pwa-192x192.png'      },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32,  name: 'favicon-32x32.png'   },
  { size: 512, name: 'icon.png'             },
];

for (const { size, name } of sizes) {
  await sharp('public/icon-source.png')
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(`public/${name}`);
  console.log(`✅ public/${name} (${size}×${size})`);
}

console.log('\n🎉 All icons regenerated from your REAL logo (not a placeholder).');
console.log('   If the icon still looks wrong, check public/icon-source.png directly —');
console.log('   that PNG is exactly what was embedded in favicon.ico.');
