const crypto = require('crypto');

const key = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzcsxNe0BRgnsJGqiDNcJBCymnUr3wzFrr7mPVpqYDFQTUD6sgP97srvsuM4nMVfll2X8qT6bowHVlfbYQvgdklCtpOAI4xI2UOpri9QHVzNxSp3N8XnI+3Fcso0/tc8VBUbLCXS0S6zhxkkMorK5U9nAZY/sR5pz4gf7ygZi4ib8Y6LSMNog/Vs27mINq0h1oG7kH389DgGSe4F2uG3MOBEoCrW8iguBLRE4Su8ULytH79RJuHk3Viw/j3G3rWpWrylaUzDfWd+3GrvpZ5KSytH6JRnjW3b4g2UaTBBsbNFuqK5FvAcB2y0KR4qTXjMSATj8a063ovqB9V71kZQMSQIDAQAB";

// Base64 decode to buffer
const decoded = Buffer.from(key, 'base64');

// SHA256 hash of the decoded buffer
const sha256 = crypto.createHash('sha256').update(decoded).digest('hex');

// Map first 32 hex chars to a-p
let id = '';
for (let i = 0; i < 32; i++) {
    const charCode = sha256.charCodeAt(i);
    // '0'-'9' maps to 'a'-'j'
    // 'a'-'f' maps to 'k'-'p'
    if (charCode >= 48 && charCode <= 57) {
        id += String.fromCharCode(charCode + 49); // 48 ('0') + 49 = 97 ('a')
    } else if (charCode >= 97 && charCode <= 102) {
        id += String.fromCharCode(charCode + 10); // 97 ('a') + 10 = 107 ('k')
    }
}

console.log("Calculated Extension ID:", id);
