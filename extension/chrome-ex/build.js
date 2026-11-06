import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to copy directory recursively
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Helper to copy file
function copyFileSync(src, dest) {
  if (!fs.existsSync(src)) return;
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

try {
  console.log('Building popup using Vite...');
  execSync('npx vite build', { stdio: 'inherit' });

  console.log('Copying static assets to dist...');
  copyFileSync('manifest.json', 'dist/manifest.json');
  copyFileSync('LICENSE.txt', 'dist/LICENSE.txt');
  copyFileSync('src/config.js', 'dist/src/config.js');
  copyDirSync('assets', 'dist/assets');
  copyDirSync('data', 'dist/data');
  copyDirSync('rules', 'dist/rules');
  copyDirSync('icons', 'dist/icons');
  copyDirSync('_locales', 'dist/_locales');
  console.log('Bundling background script using esbuild...');
  execSync('npx esbuild src/background/background.js --bundle --outfile=dist/src/background/background.js --platform=browser', { stdio: 'inherit' });

  copyDirSync('src/content', 'dist/src/content');
  copyDirSync('src/test', 'dist/src/test');
  copyDirSync('src/_locales', 'dist/src/_locales');
  copyDirSync('src/shared', 'dist/src/shared');
  copyDirSync('src/block', 'dist/src/block');
  copyDirSync('src/welcome', 'dist/src/welcome');
  console.log('Build complete! Output is in dist folder.');
} catch (err) {
  console.error('Build failed:', err);
  process.exit(1);
}
