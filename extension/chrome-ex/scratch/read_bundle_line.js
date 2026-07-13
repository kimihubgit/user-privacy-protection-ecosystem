const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'dist', 'assets');
if (!fs.existsSync(assetsDir)) {
  console.error('Assets directory not found');
  process.exit(1);
}

const files = fs.readdirSync(assetsDir);
const jsFile = files.find(f => f.startsWith('popup-') && f.endsWith('.js'));
if (!jsFile) {
  console.error('No popup JS bundle found');
  process.exit(1);
}

const file = path.join(assetsDir, jsFile);
console.log('Reading file:', file);

const content = fs.readFileSync(file, 'utf8');
// Search for '.toString()' and extract 200 chars around each match
let match;
const regex = /\.toString\(\)/g;
let matchIndex = 1;
while ((match = regex.exec(content)) !== null) {
  const idx = match.index;
  console.log(`\n--- Match #${matchIndex} at character index ${idx} ---`);
  console.log(content.substring(Math.max(0, idx - 150), Math.min(content.length, idx + 150)));
  matchIndex++;
}


