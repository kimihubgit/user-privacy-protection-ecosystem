/**
 * KiGuard Homograph / Punycode Attack Detection Module
 * 
 * Detects Internationalized Domain Name (IDN) homograph attacks,
 * mixed-script spoofing (e.g. Cyrillic/Greek lookalikes mixed with Latin ASCII),
 * whole-script brand impersonation, and invisible/bidi character injections.
 */

// RFC 3492 Punycode decoder
export function punycodeDecode(input) {
  const BASE = 36;
  const TMIN = 1;
  const TMAX = 26;
  const SKEW = 38;
  const DAMP = 700;
  const INITIAL_BIAS = 72;
  const INITIAL_N = 128;

  let n = INITIAL_N;
  let i = 0;
  let bias = INITIAL_BIAS;
  let output = [];

  const basicLength = input.lastIndexOf('-');
  if (basicLength > 0) {
    for (let j = 0; j < basicLength; j++) {
      const c = input.charCodeAt(j);
      if (c >= 128) throw new Error('Illegal input');
      output.push(String.fromCharCode(c));
    }
    input = input.substring(basicLength + 1);
  }

  function adapt(delta, numPoints, firstTime) {
    delta = firstTime ? Math.floor(delta / DAMP) : Math.floor(delta / 2);
    delta += Math.floor(delta / numPoints);
    let k = 0;
    while (delta > ((BASE - TMIN) * TMAX) / 2) {
      delta = Math.floor(delta / (BASE - TMIN));
      k += BASE;
    }
    return k + Math.floor(((BASE - TMIN + 1) * delta) / (delta + SKEW));
  }

  function digitValue(c) {
    const code = c.charCodeAt(0);
    if (code >= 48 && code <= 57) return code - 48 + 26; // '0'-'9'
    if (code >= 65 && code <= 90) return code - 65;      // 'A'-'Z'
    if (code >= 97 && code <= 122) return code - 97;     // 'a'-'z'
    return BASE;
  }

  let inIdx = 0;
  while (inIdx < input.length) {
    const oldi = i;
    let w = 1;
    let k = BASE;
    while (true) {
      if (inIdx >= input.length) throw new Error('Punycode truncated');
      const digit = digitValue(input[inIdx++]);
      if (digit >= BASE) throw new Error('Invalid digit');
      i += digit * w;
      const t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias;
      if (digit < t) break;
      w *= BASE - t;
      k += BASE;
    }
    bias = adapt(i - oldi, output.length + 1, oldi === 0);
    n += Math.floor(i / (output.length + 1));
    i %= output.length + 1;
    output.splice(i, 0, String.fromCodePoint(n));
    i++;
  }

  return output.join('');
}

// Convert punycode domain (e.g. xn--pypal-4ve.com) to Unicode (pаypal.com)
export function toUnicodeDomain(domain) {
  if (!domain || typeof domain !== 'string') return '';
  return domain.split('.').map(label => {
    if (label.toLowerCase().startsWith('xn--')) {
      try {
        return punycodeDecode(label.substring(4).toLowerCase());
      } catch (e) {
        return label;
      }
    }
    return label;
  }).join('.');
}

// Unicode Confusables dictionary (mapping non-Latin homoglyphs to Latin equivalents)
export const CONFUSABLES = {
  // Cyrillic Lowercase
  '\u0430': { latin: 'a', name: 'Cyrillic a (U+0430)' },
  '\u0441': { latin: 'c', name: 'Cyrillic c (U+0441)' },
  '\u0434': { latin: 'd', name: 'Cyrillic d (U+0434)' },
  '\u0435': { latin: 'e', name: 'Cyrillic e (U+0435)' },
  '\u0456': { latin: 'i', name: 'Cyrillic i (U+0456)' },
  '\u0458': { latin: 'j', name: 'Cyrillic j (U+0458)' },
  '\u04cf': { latin: 'l', name: 'Cyrillic palochka (U+04CF)' },
  '\u043e': { latin: 'o', name: 'Cyrillic o (U+043E)' },
  '\u0440': { latin: 'p', name: 'Cyrillic p (U+0440)' },
  '\u0455': { latin: 's', name: 'Cyrillic s (U+0455)' },
  '\u0443': { latin: 'y', name: 'Cyrillic u/y (U+0443)' },
  '\u0445': { latin: 'x', name: 'Cyrillic x (U+0445)' },
  '\u0501': { latin: 'd', name: 'Cyrillic komi d (U+0501)' },
  '\u051b': { latin: 'q', name: 'Cyrillic q (U+051B)' },
  '\u051d': { latin: 'w', name: 'Cyrillic w (U+051D)' },

  // Greek Lowercase
  '\u03b1': { latin: 'a', name: 'Greek alpha (U+03B1)' },
  '\u03b2': { latin: 'b', name: 'Greek beta (U+03B2)' },
  '\u03b5': { latin: 'e', name: 'Greek epsilon (U+03B5)' },
  '\u03b9': { latin: 'i', name: 'Greek iota (U+03B9)' },
  '\u03ba': { latin: 'k', name: 'Greek kappa (U+03BA)' },
  '\u03bf': { latin: 'o', name: 'Greek omicron (U+03BF)' },
  '\u03c1': { latin: 'p', name: 'Greek rho (U+03C1)' },
  '\u03c5': { latin: 'u', name: 'Greek upsilon (U+03C5)' },
  '\u03bd': { latin: 'v', name: 'Greek nu (U+03BD)' },
  '\u03c7': { latin: 'x', name: 'Greek chi (U+03C7)' }
};

// Invisible & BiDi control characters
export const INVISIBLE_CHARS = new Set([
  0x200B, // Zero Width Space
  0x200C, // Zero Width Non-Joiner
  0x200D, // Zero Width Joiner
  0x200E, // Left-to-Right Mark
  0x200F, // Right-to-Left Mark
  0x2028, // Line Separator
  0x2029, // Paragraph Separator
  0x202A, 0x202B, 0x202C, 0x202D, 0x202E, // Bidi embedding/overrides
  0xFEFF  // Zero Width No-Break Space
]);

// Target popular brands commonly impersonated via Homograph attacks
export const HIGH_RISK_BRANDS = [
  'paypal', 'apple', 'google', 'microsoft', 'facebook', 'instagram', 'whatsapp',
  'netflix', 'amazon', 'twitter', 'linkedin', 'binance', 'coinbase', 'telegram',
  'vietcombank', 'techcombank', 'mbbank', 'vpbank', 'bidv', 'agribank', 'acb',
  'tpbank', 'sacombank', 'vib', 'shb', 'hdbank', 'shopee', 'lazada', 'tiki', 'zalo',
  'chongluadao', 'kiguard'
];

function getCharScript(code) {
  // ASCII Latin alphanumeric & hyphen
  if ((code >= 0x0041 && code <= 0x005A) || (code >= 0x0061 && code <= 0x007A) || (code >= 0x0030 && code <= 0x0039) || code === 0x002D) {
    return 'Latin-ASCII';
  }
  // Latin Extended (Vietnamese accents, European accents, etc.)
  if ((code >= 0x00C0 && code <= 0x024F) || (code >= 0x1EA0 && code <= 0x1EF9)) {
    return 'Latin-Extended';
  }
  // Cyrillic
  if (code >= 0x0400 && code <= 0x052F) {
    return 'Cyrillic';
  }
  // Greek
  if (code >= 0x0370 && code <= 0x03FF) {
    return 'Greek';
  }
  return 'Other';
}

function extractRawDomain(domainOrUrl) {
  let raw = domainOrUrl.trim().toLowerCase();
  if (raw.includes('://')) {
    raw = raw.split('://')[1];
  }
  return raw.split('/')[0].split('?')[0].split('#')[0].split(':')[0];
}

export const HomographDetector = {
  /**
   * Analyzes a domain or URL for homograph / punycode spoofing.
   * @param {string} domainOrUrl 
   * @returns {object} Analysis result
   */
  analyze(domainOrUrl) {
    if (!domainOrUrl || typeof domainOrUrl !== 'string') {
      return { isAttack: false };
    }

    const rawDomain = extractRawDomain(domainOrUrl);
    const unicodeDomain = toUnicodeDomain(rawDomain);
    const labels = unicodeDomain.split('.');

    for (let lIndex = 0; lIndex < labels.length; lIndex++) {
      const label = labels[lIndex];
      // Skip top-level domains like .com, .vn, etc.
      if (lIndex === labels.length - 1 && labels.length > 1) continue;

      let hasInvisible = false;
      let invisibleCharList = [];
      let scriptCounts = {};
      let confusableMatches = [];
      let normalizedChars = [];

      for (let i = 0; i < label.length; i++) {
        const code = label.codePointAt(i);
        const char = String.fromCodePoint(code);

        if (INVISIBLE_CHARS.has(code)) {
          hasInvisible = true;
          invisibleCharList.push(`U+${code.toString(16).toUpperCase().padStart(4, '0')}`);
        }

        const script = getCharScript(code);
        scriptCounts[script] = (scriptCounts[script] || 0) + 1;

        if (CONFUSABLES[char]) {
          confusableMatches.push({
            char,
            code: `U+${code.toString(16).toUpperCase().padStart(4, '0')}`,
            script,
            looksLike: CONFUSABLES[char].latin,
            description: CONFUSABLES[char].name,
            position: i
          });
          normalizedChars.push(CONFUSABLES[char].latin);
        } else {
          normalizedChars.push(char);
        }
      }

      const normalizedLabel = normalizedChars.join('');

      // 1. Invisible characters attack check
      if (hasInvisible) {
        return {
          isAttack: true,
          attackType: 'invisible_chars',
          severity: 'critical',
          punycodeDomain: rawDomain,
          unicodeDomain,
          normalizedDomain: labels.map((l, idx) => idx === lIndex ? normalizedLabel : l).join('.'),
          confusableMatches,
          reason: `Tên miền chứa ký tự ẩn (${invisibleCharList.join(', ')}) để làm sai lệch địa chỉ URL.`
        };
      }

      // 2. Mixed-Script Homograph Attack check (Latin mixed with Cyrillic/Greek in the same label)
      const hasLatin = (scriptCounts['Latin-ASCII'] || 0) > 0 || (scriptCounts['Latin-Extended'] || 0) > 0;
      const hasCyrillicOrGreek = (scriptCounts['Cyrillic'] || 0) > 0 || (scriptCounts['Greek'] || 0) > 0;

      if (hasLatin && hasCyrillicOrGreek && confusableMatches.length > 0) {
        const spoofedBrand = HIGH_RISK_BRANDS.find(b => normalizedLabel === b || normalizedLabel.includes(b)) || normalizedLabel;
        const mainConfusable = confusableMatches[0];
        return {
          isAttack: true,
          attackType: 'mixed_script_homograph',
          severity: 'critical',
          punycodeDomain: rawDomain,
          unicodeDomain,
          spoofedBrand,
          normalizedDomain: labels.map((l, idx) => idx === lIndex ? normalizedLabel : l).join('.'),
          confusableMatches,
          reason: `Ký tự '${mainConfusable.char}' (${mainConfusable.script}) được dùng thay cho chữ '${mainConfusable.looksLike}' để mạo danh '${spoofedBrand}'.`
        };
      }

      // 3. Whole-Script Confusable Attack check (100% Cyrillic/Greek mimicking a famous brand)
      if (!hasLatin && hasCyrillicOrGreek && confusableMatches.length > 0) {
        const matchedBrand = HIGH_RISK_BRANDS.find(b => normalizedLabel === b || normalizedLabel.includes(b));
        if (matchedBrand) {
          return {
            isAttack: true,
            attackType: 'whole_script_homograph',
            severity: 'critical',
            punycodeDomain: rawDomain,
            unicodeDomain,
            spoofedBrand: matchedBrand,
            normalizedDomain: labels.map((l, idx) => idx === lIndex ? normalizedLabel : l).join('.'),
            confusableMatches,
            reason: `Tên miền dùng toàn bộ ký tự ${confusableMatches[0].script} để mô phỏng thương hiệu '${matchedBrand}'.`
          };
        }
      }
    }

    return {
      isAttack: false,
      punycodeDomain: rawDomain,
      unicodeDomain
    };
  }
};
