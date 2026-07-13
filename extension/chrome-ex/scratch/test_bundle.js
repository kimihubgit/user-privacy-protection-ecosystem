const fs = require('fs');
const path = require('path');

// Find the latest popup JS bundle in dist/assets
const assetsDir = path.join(__dirname, '..', 'dist', 'assets');
if (!fs.existsSync(assetsDir)) {
  console.error('Dist assets directory not found!');
  process.exit(1);
}

const files = fs.readdirSync(assetsDir);
const jsFile = files.find(f => f.startsWith('popup-') && f.endsWith('.js'));

if (!jsFile) {
  console.error('No popup JS bundle found in dist/assets!');
  process.exit(1);
}

const jsPath = path.join(assetsDir, jsFile);
console.log('Testing bundle:', jsPath);

// Mock browser globals & chrome APIs
global.window = {
  addEventListener: () => {},
  dispatchEvent: () => {},
  CustomEvent: class {},
};
global.document = {
  createElement: () => ({
    addEventListener: () => {},
    style: {},
  }),
  body: {
    appendChild: () => {},
  },
  getElementById: () => null,
  querySelectorAll: () => [],
  querySelector: () => ({ appendChild: () => {}, addEventListener: () => {} }),
};
global.navigator = {
  userAgent: 'node',
};
global.MutationObserver = class {
  observe() {}
  disconnect() {}
};
global.SVGElement = class {};
global.chrome = {
  runtime: {
    getURL: (p) => p,
    sendMessage: () => {},
    id: 'test-id',
  },
  storage: {
    local: {
      get: (keys, cb) => cb({}),
      set: (data, cb) => cb && cb(),
    }
  },
  proxy: {
    settings: {
      clear: () => {},
      set: () => {},
    }
  },
  management: {
    getAll: (cb) => cb([]),
  },
  tabs: {
    query: (q, cb) => cb([]),
  }
};

try {
  // Read bundle and evaluate it
  const code = fs.readFileSync(jsPath, 'utf8');
  // We wrap in a function to evaluate
  eval(code);
  console.log('SUCCESS: Bundle executed successfully without initial crashes.');
} catch (e) {
  console.error('CRASH DETECTED:', e);
}
