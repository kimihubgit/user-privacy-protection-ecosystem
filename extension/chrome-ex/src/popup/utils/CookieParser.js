import { decryptData } from '../../shared/crypto.js';

/**
 * CookieParser — Handles parsing cookies from various formats.
 * Extracted from CookieController to isolate format parsing logic.
 * 
 * Supports: JSON, Header String, Netscape formats.
 */
export class CookieParser {
    /**
     * Auto-detect and parse cookie data from text
     * @param {string} text - Raw cookie text
     * @param {string} currentDomain - Current page domain (for Header String format)
     * @param {string} password - Decryption password
     * @returns {Promise<{ cookies: Array, format: string, error: string|null }>}
     */
    static async parse(text, currentDomain, password = "") {
        if (!text) {
            return { cookies: [], format: '', error: 'Vui lòng dán dữ liệu cookie.' };
        }

        // Check if the cookie content is encrypted
        if (text.startsWith('[KiGuard Encrypted Cookie]')) {
            if (!password) {
                return { cookies: [], format: 'Encrypted', error: 'Dữ liệu cookie đã được mã hóa. Vui lòng nhập mật khẩu giải mã.' };
            }
            try {
                const encryptedBody = text.replace('[KiGuard Encrypted Cookie]', '').trim();
                const decryptedText = await decryptData(encryptedBody, password);
                return CookieParser._parseDecrypted(decryptedText, currentDomain);
            } catch (e) {
                return { cookies: [], format: 'Encrypted', error: 'Giải mã thất bại! Vui lòng kiểm tra lại mật khẩu.' };
            }
        }

        return CookieParser._parseDecrypted(text, currentDomain);
    }

    static _parseDecrypted(text, currentDomain) {
        // Try JSON first
        if (text.startsWith('[') || text.startsWith('{')) {
            return CookieParser._parseJSON(text);
        }

        // Try Netscape format
        if (text.includes('\t') && text.split('\n').some(line => {
            const trim = line.trim();
            return !trim.startsWith('#') && trim.split('\t').length >= 7;
        })) {
            return CookieParser._parseNetscape(text);
        }

        // Try Header String format
        if (text.includes('=')) {
            return CookieParser._parseHeaderString(text, currentDomain);
        }

        return { cookies: [], format: '', error: 'Không nhận dạng được định dạng (Yêu cầu JSON, Header hoặc Netscape).' };
    }

    static _parseJSON(text) {
        try {
            let cookiesArray = JSON.parse(text);
            if (!Array.isArray(cookiesArray)) {
                if (typeof cookiesArray === 'object' && cookiesArray !== null) {
                    cookiesArray = [cookiesArray];
                } else {
                    return { cookies: [], format: 'JSON', error: 'Dữ liệu không phải là mảng hoặc đối tượng JSON.' };
                }
            }
            return { cookies: cookiesArray, format: 'JSON', error: null };
        } catch (e) {
            return { cookies: [], format: 'JSON', error: 'Phát hiện dạng JSON nhưng sai cấu trúc. Vui lòng kiểm tra lại.' };
        }
    }

    static _parseNetscape(text) {
        const cookiesArray = [];
        const lines = text.split('\n');

        lines.forEach(line => {
            const trimLine = line.trim();
            if (!trimLine || trimLine.startsWith('#')) return;

            const fields = trimLine.split('\t');
            if (fields.length < 7) return;

            const domain = fields[0].trim();
            const path = fields[2].trim();
            const secure = fields[3].trim().toUpperCase() === 'TRUE';
            const expirationDate = parseFloat(fields[4].trim());
            const name = fields[5].trim();
            const value = fields[6].trim();

            if (name) {
                cookiesArray.push({
                    name,
                    value,
                    domain,
                    path,
                    secure,
                    expirationDate: expirationDate > 0 ? expirationDate : undefined,
                    session: expirationDate === 0
                });
            }
        });

        if (cookiesArray.length === 0) {
            return { cookies: [], format: 'Netscape', error: 'Phát hiện dạng Netscape nhưng không tìm thấy cookie hợp lệ.' };
        }

        return { cookies: cookiesArray, format: 'Netscape', error: null };
    }

    static _parseHeaderString(text, currentDomain) {
        const cookiesArray = [];
        const parts = text.split(';');

        parts.forEach(part => {
            const trimPart = part.trim();
            if (!trimPart) return;
            const eqIdx = trimPart.indexOf('=');
            if (eqIdx === -1) return;
            const name = trimPart.substring(0, eqIdx).trim();
            const value = trimPart.substring(eqIdx + 1).trim();
            if (name) {
                cookiesArray.push({
                    name,
                    value,
                    domain: currentDomain.startsWith('.') ? currentDomain : `.${currentDomain}`,
                    path: '/',
                    secure: false,
                    httpOnly: false,
                    session: true
                });
            }
        });

        if (cookiesArray.length === 0) {
            return { cookies: [], format: 'Header String', error: 'Không tìm thấy cookie hợp lệ dạng Header String (name=value; ...)' };
        }

        return { cookies: cookiesArray, format: 'Header String', error: null };
    }
}
