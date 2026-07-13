// otpHelper.js
// Handles cryptography (AES-GCM encryption/decryption), TOTP generation and Google migration format.

export const base32ToBuf = (str) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  str = str.replace(/=+$/, '').toUpperCase().replace(/[\s-]/g, '');
  const length = str.length;
  const count = Math.floor(length * 5 / 8);
  const buf = new Uint8Array(count);
  let value = 0;
  let bits = 0;
  let index = 0;
  for (let i = 0; i < length; i++) {
    const idx = alphabet.indexOf(str[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      buf[index++] = (value >>> (bits - 8)) & 255;
      bits -= 8;
    }
  }
  return buf.buffer;
};

// Decodes a base32 string to Uint8Array bytes
export const base32Decode = (str) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  str = str.replace(/=+$/, '').toUpperCase().replace(/[\s-]/g, '');
  const length = str.length;
  const count = Math.floor(length * 5 / 8);
  const buf = new Uint8Array(count);
  let value = 0;
  let bits = 0;
  let index = 0;
  for (let i = 0; i < length; i++) {
    const idx = alphabet.indexOf(str[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      buf[index++] = (value >>> (bits - 8)) & 255;
      bits -= 8;
    }
  }
  return buf;
};

export const generateTOTP = async (secretBase32, timeStep = 30) => {
  try {
    const keyBytes = base32ToBuf(secretBase32);
    if (keyBytes.byteLength === 0) return '000000';

    const epoch = Math.floor(Date.now() / 1000);
    const counter = Math.floor(epoch / timeStep);

    const counterBuffer = new ArrayBuffer(8);
    const dataView = new DataView(counterBuffer);
    dataView.setUint32(0, 0, false);
    dataView.setUint32(4, counter, false);

    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash: { name: 'SHA-1' } },
      false,
      ['sign']
    );

    const signature = await window.crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      counterBuffer
    );

    const hmacBytes = new Uint8Array(signature);
    const offset = hmacBytes[hmacBytes.length - 1] & 0x0f;
    const binary = ((hmacBytes[offset] & 0x7f) << 24) |
      ((hmacBytes[offset + 1] & 0xff) << 16) |
      ((hmacBytes[offset + 2] & 0xff) << 8) |
      (hmacBytes[offset + 3] & 0xff);

    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
  } catch (e) {
    console.error('Error generating TOTP:', e);
    return '------';
  }
};

export const deriveKey = async (password, salt) => {
  const encoder = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

export const encryptData = async (dataString, password) => {
  const encoder = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encoder.encode(dataString)
  );
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);
  return btoa(String.fromCharCode.apply(null, combined));
};

export const decryptData = async (combinedBase64, password) => {
  const decoder = new TextDecoder();
  const combined = new Uint8Array(
    atob(combinedBase64).split('').map(c => c.charCodeAt(0))
  );
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const encrypted = combined.slice(28);
  const key = await deriveKey(password, salt);
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encrypted
  );
  return decoder.decode(decrypted);
};

// Protobuf Helper Writers
function writeVarint(value) {
  const bytes = [];
  while (value > 127) {
    bytes.push((value & 127) | 128);
    value >>>= 7;
  }
  bytes.push(value & 127);
  return new Uint8Array(bytes);
}

function writeLengthDelimited(tag, dataBytes) {
  const key = (tag << 3) | 2;
  const keyBytes = writeVarint(key);
  const lenBytes = writeVarint(dataBytes.length);
  const combined = new Uint8Array(keyBytes.length + lenBytes.length + dataBytes.length);
  combined.set(keyBytes, 0);
  combined.set(lenBytes, keyBytes.length);
  combined.set(dataBytes, keyBytes.length + lenBytes.length);
  return combined;
}

function writeVarintField(tag, value) {
  const key = (tag << 3) | 0;
  const keyBytes = writeVarint(key);
  const valBytes = writeVarint(value);
  const combined = new Uint8Array(keyBytes.length + valBytes.length);
  combined.set(keyBytes, 0);
  combined.set(valBytes, keyBytes.length);
  return combined;
}

// Decodes and Encodes Google Authenticator otpauth-migration data
export class OtpMigrationDecoder {
  static readVarint(buffer, offset) {
    let value = 0;
    let shift = 0;
    let idx = offset;
    while (true) {
      const byte = buffer[idx++];
      value |= (byte & 0x7F) << shift;
      if (!(byte & 0x80)) break;
      shift += 7;
    }
    return { value, size: idx - offset };
  }

  static parseOtpParams(buf) {
    let idx = 0;
    const param = {};
    while (idx < buf.length) {
      const keyVar = this.readVarint(buf, idx);
      idx += keyVar.size;
      const wireType = keyVar.value & 7;
      const tag = keyVar.value >> 3;
      
      if (wireType === 2) {
        const lenVar = this.readVarint(buf, idx);
        idx += lenVar.size;
        const len = lenVar.value;
        const subBuf = buf.slice(idx, idx + len);
        idx += len;
        
        if (tag === 1) param.secret = subBuf;
        else if (tag === 2) param.name = new TextDecoder().decode(subBuf);
        else if (tag === 3) param.issuer = new TextDecoder().decode(subBuf);
      } else if (wireType === 0) {
        const valVar = this.readVarint(buf, idx);
        idx += valVar.size;
        const val = valVar.value;
        
        if (tag === 4) param.algorithm = val;
        else if (tag === 5) param.digits = val;
        else if (tag === 6) param.type = val;
        else if (tag === 7) param.counter = val;
      } else {
        break;
      }
    }
    return param;
  }

  static base32Encode(buffer) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    let output = '';
    for (let i = 0; i < buffer.length; i++) {
      value = (value << 8) | buffer[i];
      bits += 8;
      while (bits >= 5) {
        output += alphabet[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }
    if (bits > 0) {
      output += alphabet[(value << (5 - bits)) & 31];
    }
    return output;
  }

  static decode(migrationUrl) {
    try {
      let base64Data = migrationUrl.trim();
      if (migrationUrl.includes('data=')) {
        const urlObj = new URL(migrationUrl);
        base64Data = urlObj.searchParams.get('data');
      }
      
      const binaryString = atob(decodeURIComponent(base64Data));
      const buffer = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        buffer[i] = binaryString.charCodeAt(i);
      }

      let idx = 0;
      const otps = [];
      while (idx < buffer.length) {
        const keyVar = this.readVarint(buffer, idx);
        idx += keyVar.size;
        const wireType = keyVar.value & 7;
        const tag = keyVar.value >> 3;
        
        if (tag === 1 && wireType === 2) {
          const lenVar = this.readVarint(buffer, idx);
          idx += lenVar.size;
          const len = lenVar.value;
          const subBuf = buffer.slice(idx, idx + len);
          idx += len;
          
          const otp = this.parseOtpParams(subBuf);
          if (otp.secret) {
            otps.push({
              label: (otp.issuer ? `${otp.issuer}: ` : '') + (otp.name || 'Unnamed'),
              secret: this.base32Encode(otp.secret)
            });
          }
        } else if (wireType === 2) {
          const lenVar = this.readVarint(buffer, idx);
          idx += lenVar.size;
          idx += lenVar.value;
        } else if (wireType === 0) {
          const valVar = this.readVarint(buffer, idx);
          idx += valVar.size;
        } else {
          break;
        }
      }
      return otps;
    } catch (e) {
      console.error(e);
      throw new Error("Không thể giải mã dữ liệu Google Authenticator.");
    }
  }

  // Encodes list of accounts to an otpauth-migration URL
  static encodeMigration(accountsList) {
    try {
      const fields = [];
      
      // field 1: repeated OtpParameters
      for (const acc of accountsList) {
        let name = acc.label;
        let issuer = '';
        if (acc.label.includes(':')) {
          const parts = acc.label.split(':');
          issuer = parts[0].trim();
          name = parts.slice(1).join(':').trim();
        }

        const secretBytes = base32Decode(acc.secret);
        const nameBytes = new TextEncoder().encode(name);
        const issuerBytes = new TextEncoder().encode(issuer);

        const otpFields = [];
        // field 1: secret
        otpFields.push(writeLengthDelimited(1, secretBytes));
        // field 2: name
        otpFields.push(writeLengthDelimited(2, nameBytes));
        // field 3: issuer if any
        if (issuer) {
          otpFields.push(writeLengthDelimited(3, issuerBytes));
        }
        // field 4: algorithm = 1 (SHA1)
        otpFields.push(writeVarintField(4, 1));
        // field 5: digits = 1 (SIX)
        otpFields.push(writeVarintField(5, 1));
        // field 6: type = 2 (TOTP)
        otpFields.push(writeVarintField(6, 2));

        // Combine otp fields
        let otpLen = 0;
        for (const f of otpFields) otpLen += f.length;
        const otpBytes = new Uint8Array(otpLen);
        let otpOffset = 0;
        for (const f of otpFields) {
          otpBytes.set(f, otpOffset);
          otpOffset += f.length;
        }

        fields.push(writeLengthDelimited(1, otpBytes));
      }

      // field 2: version = 1
      fields.push(writeVarintField(2, 1));
      // field 3: batch_size = 1
      fields.push(writeVarintField(3, 1));
      // field 4: batch_index = 0
      fields.push(writeVarintField(4, 0));
      // field 5: batch_id = random integer
      const batchId = Math.floor(Math.random() * 100000);
      fields.push(writeVarintField(5, batchId));

      // Combine all fields
      let totalLength = 0;
      for (const f of fields) totalLength += f.length;
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const f of fields) {
        result.set(f, offset);
        offset += f.length;
      }

      // Base64 encode
      let binary = '';
      for (let i = 0; i < result.length; i++) {
        binary += String.fromCharCode(result[i]);
      }
      const base64 = btoa(binary);
      return `otpauth-migration://offline?data=${encodeURIComponent(base64)}`;
    } catch (e) {
      console.error(e);
      throw new Error("Lỗi mã hóa dữ liệu Google Authenticator.");
    }
  }
}
