/**
 * Shared Cryptography Utility using Web Crypto API.
 * Provides AES-GCM encryption and PBKDF2 key derivation.
 */

/**
 * Derives a cryptographic key from a password and salt using PBKDF2.
 * @param {string} password 
 * @param {Uint8Array} salt 
 * @returns {Promise<CryptoKey>}
 */
export async function deriveKey(password, salt) {
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
}

/**
 * Encrypts a plain text string using a password.
 * Returns a Base64-encoded string combining salt, IV, and ciphertext.
 * @param {string} dataString 
 * @param {string} password 
 * @returns {Promise<string>}
 */
export async function encryptData(dataString, password) {
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
}

/**
 * Decrypts a combined Base64-encoded string (salt + IV + ciphertext) using a password.
 * @param {string} combinedBase64 
 * @param {string} password 
 * @returns {Promise<string>}
 */
export async function decryptData(combinedBase64, password) {
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
}
