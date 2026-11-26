/**
 * Generate favicon files from decompress.png logo
 * Run with: node scripts/generate-favicons.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

async function generateFavicons() {
  try {
    // Try to use sharp if available
    const sharp = await import('sharp').catch(() => null);
    
    if (!sharp) {
      console.log('⚠️  Sharp not installed. Installing...');
      console.log('Run: npm install --save-dev sharp');
      console.log('\nAfter installing sharp, run this script again.');
      return;
    }

    const sourcePath = join(projectRoot, 'public/assets/images/decompress.png');
    const appDir = join(projectRoot, 'app');

    console.log('🎨 Generating favicons from decompress.png...\n');

    // Generate icon.png (32x32 for Next.js automatic favicon)
    await sharp.default(sourcePath)
      .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(join(appDir, 'icon.png'));
    console.log('✅ Created app/icon.png (32x32)');

    // Generate apple-icon.png (180x180 for Apple devices)
    await sharp.default(sourcePath)
      .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(join(appDir, 'apple-icon.png'));
    console.log('✅ Created app/apple-icon.png (180x180)');

    // Generate opengraph-image.png (1200x630 for social sharing)
    await sharp.default(sourcePath)
      .resize(1200, 630, { fit: 'contain', background: { r: 245, g: 248, b: 250, alpha: 1 } })
      .png()
      .toFile(join(appDir, 'opengraph-image.png'));
    console.log('✅ Created app/opengraph-image.png (1200x630)');

    console.log('\n✨ All favicons generated successfully!');
    console.log('Next.js will automatically serve these as favicons.');
  } catch (error) {
    console.error('❌ Error generating favicons:', error.message);
  }
}

generateFavicons();
