/**
 * Service for Google and Microsoft Edge translation APIs, dictionary APIs,
 * and automatic language/phonetics detection.
 */

const SUPPORTED_LANGS = new Set([
    "af", "am", "ar", "az", "be", "bg", "bn", "bs", "ca", "ceb", "co", "cs", "cy", "da", "de",
    "el", "en", "eo", "es", "et", "eu", "fa", "fi", "fil", "fr", "fy", "ga", "gd", "gl", "gu",
    "ha", "haw", "he", "hi", "hmn", "hr", "ht", "hu", "hy", "id", "ig", "is", "it", "iw", "ja",
    "jw", "ka", "kk", "km", "kn", "ko", "ku", "ky", "la", "lb", "lo", "lt", "lv", "mg", "mi",
    "mk", "ml", "mn", "mr", "ms", "mt", "my", "ne", "nl", "no", "ny", "or", "pa", "pl", "ps",
    "pt", "ro", "ru", "rw", "sd", "si", "sk", "sl", "sm", "sn", "so", "sq", "sr", "st", "su",
    "sv", "sw", "ta", "te", "tg", "th", "tk", "tl", "tr", "tt", "ug", "uk", "ur", "uz", "vi",
    "xh", "yi", "yo", "zh", "zu"
]);

const ALL_LANG_CODES = new Set([...SUPPORTED_LANGS, "zh", "iw", "nb", "tl", "nn", "hans", "hant", "yue", "wyw"]);

let edgeTokenCache = null;

function mapGoogleLang(lang) {
    if (!lang) return "auto";
    const low = lang.toLowerCase();
    if (low === "zh-cn" || low === "zh-hans") return "zh-CN";
    if (low === "zh-tw" || low === "zh-hant") return "zh-TW";
    return low.split("-")[0];
}

function mapEdgeLang(lang) {
    if (!lang) return "en";
    const low = lang.toLowerCase();
    if (low === "zh-cn" || low === "zh-hans") return "zh-Hans";
    if (low === "zh-tw" || low === "zh-hant") return "zh-Hant";
    return low;
}

function parseGoogleResponse(responseJson) {
    if (!Array.isArray(responseJson)) {
        throw new Error("Google: response không hợp lệ");
    }
    const detected = typeof responseJson[2] === "string" ? responseJson[2] : undefined;
    const sentences = responseJson[0];
    if (!Array.isArray(sentences)) {
        throw new Error("Google: định dạng bản dịch lạ");
    }
    const parts = [];
    for (const sentence of sentences) {
        if (Array.isArray(sentence) && typeof sentence[0] === "string") {
            parts.push(sentence[0]);
        }
    }
    const translatedText = parts.join("");
    if (!translatedText) {
        throw new Error("Google: không đọc được bản dịch");
    }
    return {
        text: translatedText,
        detected: detected
    };
}

function chunkText(text, maxLength) {
    const trimmed = text.trim();
    if (!trimmed) return [];
    if (trimmed.length <= maxLength) return [trimmed];
    const chunks = [];
    for (let i = 0; i < trimmed.length; i += maxLength) {
        chunks.push(trimmed.slice(i, i + maxLength));
    }
    return chunks;
}

async function fetchGoogleTranslationChunk(source, target, text) {
    const url = new URL("https://translate.googleapis.com/translate_a/single");
    url.searchParams.set("client", "gtx");
    url.searchParams.set("sl", source);
    url.searchParams.set("tl", target);
    url.searchParams.set("dt", "t");
    url.searchParams.set("ie", "UTF-8");
    url.searchParams.set("oe", "UTF-8");
    url.searchParams.set("q", text);

    const res = await fetch(url.toString(), {
        method: "GET",
        credentials: "omit"
    });
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Google ${res.status}: ${errText.slice(0, 200)}`);
    }
    const json = await res.json();
    return parseGoogleResponse(json);
}

async function translateGoogle(text, source, target) {
    const sourceLang = source === "auto" ? "auto" : mapGoogleLang(source);
    const targetLang = mapGoogleLang(target);
    const chunks = chunkText(text, 900);
    if (chunks.length === 0) {
        throw new Error("Không có nội dung để dịch.");
    }

    const results = [];
    let detectedLang;
    for (const chunk of chunks) {
        const res = await fetchGoogleTranslationChunk(sourceLang, targetLang, chunk);
        results.push(res.text);
        if (res.detected) {
            detectedLang = res.detected;
        }
    }
    return {
        text: results.join(""),
        detected: detectedLang
    };
}

function isSingleWord(text) {
    const norm = text.normalize("NFC").trim();
    return !(norm.length < 1 || norm.length > 64 || /\s/.test(norm) || /\n|\r/.test(norm));
}

function flattenArray(item, results) {
    if (typeof item === "string") {
        results.push(item);
    } else if (Array.isArray(item)) {
        item.forEach(subItem => flattenArray(subItem, results));
    }
}

function isValidLangCode(code) {
    const trimmed = code.trim();
    if (!trimmed) return true;
    const low = trimmed.toLowerCase();
    return low === "auto" || /^[a-z]{2,3}-[a-z0-9]{2,12}$/i.test(trimmed) ? true : ALL_LANG_CODES.has(low);
}

function extractTransliteration(responseJson, originalText) {
    const targetText = originalText.trim();
    const results = [];
    const addResult = val => {
        const trimmed = val.trim();
        if (!trimmed || trimmed === targetText || /^[\d.,]+$/.test(trimmed) || isValidLangCode(trimmed)) return;
        results.push(trimmed);
    };

    if (!Array.isArray(responseJson)) return null;
    for (let i = 1; i < Math.min(responseJson.length, 10); i++) {
        if (i === 2 && typeof responseJson[2] === "string" && isValidLangCode(responseJson[2])) continue;
        const item = responseJson[i];
        if (Array.isArray(item)) {
            const flat = [];
            flattenArray(item, flat);
            flat.forEach(addResult);
        } else if (typeof item === "string") {
            addResult(item);
        }
    }
    
    const sentences = responseJson[0];
    if (Array.isArray(sentences)) {
        for (const sentence of sentences) {
            if (Array.isArray(sentence) && sentence.length >= 2 && typeof sentence[1] === "string") {
                const phoneticText = sentence[1];
                if (/[^\u0000-\u007f]/.test(targetText) && /^[\u0020\u0000-\u024F0-9'.,\-]+$/i.test(phoneticText)) {
                    addResult(phoneticText);
                }
            }
        }
    }
    return results.length === 0 ? null : [...new Set(results)].join(" · ");
}

async function fetchTransliteration(text, source, target) {
    const url = new URL("https://translate.googleapis.com/translate_a/single");
    url.searchParams.set("client", "gtx");
    url.searchParams.set("sl", mapGoogleLang(source));
    url.searchParams.set("tl", mapGoogleLang(target));
    url.searchParams.append("dt", "t");
    url.searchParams.append("dt", "rm");
    url.searchParams.set("ie", "UTF-8");
    url.searchParams.set("oe", "UTF-8");
    url.searchParams.set("q", text);

    const res = await fetch(url.toString(), {
        method: "GET",
        credentials: "omit"
    });
    if (!res.ok) return null;
    const json = await res.json();
    return extractTransliteration(json, text);
}

async function getPhoneticFromGoogle(text, lang) {
    const phonetic = await fetchTransliteration(text, lang, lang);
    if (phonetic) return phonetic;
    if (mapGoogleLang(lang) !== "en") {
        const fallback = await fetchTransliteration(text, lang, "en");
        if (fallback) return fallback;
    }
    return null;
}

async function getPhoneticFromDictionary(text) {
    const trimmed = text.trim().toLowerCase().normalize("NFC").replace(/[^\p{L}\p{N}'-]/gu, "");
    if (!trimmed || trimmed.length > 48) return null;
    try {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(trimmed)}`);
        if (!res.ok) return null;
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) return null;
        const entry = data[0];
        if (entry && entry.phonetic) return entry.phonetic;
        const withText = entry.phonetics?.find(p => p.text);
        return withText ? withText.text : null;
    } catch {
        return null;
    }
}

function simpleDetectLang(text) {
    const trimmed = text.trim();
    const containsVietAccent = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(trimmed);
    return containsVietAccent ? "vi" : "en";
}

async function getWordPhonetics(text, lang) {
    if (!isSingleWord(text)) return;
    const lowLang = lang.toLowerCase();
    if (lowLang === "en" || lowLang.startsWith("en-")) {
        const dictPhonetic = await getPhoneticFromDictionary(text);
        if (dictPhonetic) return dictPhonetic;
        const googlePhonetic = await getPhoneticFromGoogle(text, lang);
        return googlePhonetic || undefined;
    }
    const googlePhonetic = await getPhoneticFromGoogle(text, lang);
    if (googlePhonetic) return googlePhonetic;
    if (/^[a-zA-Z'.-]+$/i.test(text.trim())) {
        const dictPhonetic = await getPhoneticFromDictionary(text);
        if (dictPhonetic) return dictPhonetic;
    }
}

async function getPhoneticForTranslation(details) {
    const { sourceText, translated, sourceLang, targetLang, detectedSource } = details;
    if (isSingleWord(translated)) {
        const ph = await getWordPhonetics(translated, targetLang);
        if (ph) return ph;
    }
    if (isSingleWord(sourceText)) {
        const resolvedSourceLang = sourceLang !== "auto" 
            ? sourceLang 
            : (detectedSource && detectedSource !== "auto" ? detectedSource.split("-")[0] : simpleDetectLang(sourceText));
        const ph = await getWordPhonetics(sourceText, resolvedSourceLang);
        if (ph) return ph;
    }
    return null;
}

function getJwtExpiration(token) {
    try {
        const parts = token.split(".");
        const payload = parts[1];
        if (!payload) return null;
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const padding = base64.length % 4 === 0 ? "" : "=".repeat(4 - base64.length % 4);
        const data = JSON.parse(atob(base64 + padding));
        return typeof data.exp === "number" ? data.exp * 1000 : null;
    } catch {
        return null;
    }
}

async function getEdgeToken(forceRefresh = false) {
    const now = Date.now();
    if (!forceRefresh && edgeTokenCache && now < edgeTokenCache.expiresAt - 45000) {
        return edgeTokenCache.token;
    }
    const res = await fetch("https://edge.microsoft.com/translate/auth", {
        method: "GET",
        credentials: "omit"
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Edge auth ${res.status}: ${text.slice(0, 200)}`);
    }
    const token = (await res.text()).trim();
    if (!token) throw new Error("Edge auth: token rỗng");
    let expiresAt = now + 480000; // default 8 mins
    const exp = getJwtExpiration(token);
    if (exp !== null) {
        expiresAt = exp;
    }
    edgeTokenCache = { token, expiresAt };
    return token;
}

async function fetchMicrosoftTranslation(text, source, target, token) {
    const targetLang = mapEdgeLang(target);
    const searchParams = new URLSearchParams({
        "api-version": "3.0",
        to: targetLang
    });
    if (source && source !== "auto") {
        searchParams.set("from", mapEdgeLang(source));
    }
    const url = `https://api-edge.cognitive.microsofttranslator.com/translate?${searchParams.toString()}`;
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify([{ Text: text }])
    });
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Microsoft ${res.status}: ${errText.slice(0, 200)}`);
    }
    const json = await res.json();
    const translation = json[0];
    const translatedText = translation?.translations?.[0]?.text || "";
    if (!translatedText) throw new Error("Microsoft: không có bản dịch");
    return {
        translated: translatedText,
        detected: translation?.detectedLanguage?.language
    };
}

async function translateMicrosoft(text, source, target) {
    let token = await getEdgeToken(false);
    try {
        return await fetchMicrosoftTranslation(text, source, target, token);
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("401") || msg.includes("403")) {
            token = await getEdgeToken(true);
            return fetchMicrosoftTranslation(text, source, target, token);
        }
        throw err;
    }
}

export const TranslateService = {
    async translate(payload) {
        const { provider, text, source, target } = payload;
        if (!text || !text.trim()) {
            throw new Error("Không có nội dung để dịch.");
        }

        const resolvedProvider = provider === "microsoft" ? "microsoft" : "google";
        const resolvedSource = source || "auto";
        const resolvedTarget = target || "vi";

        if (resolvedProvider === "google") {
            const result = await translateGoogle(text, resolvedSource, resolvedTarget);
            const phonetic = await getPhoneticForTranslation({
                sourceText: text,
                translated: result.text,
                sourceLang: resolvedSource,
                targetLang: resolvedTarget,
                detectedSource: result.detected
            });
            return {
                translated: result.text,
                detectedSource: result.detected,
                phonetic: phonetic
            };
        } else {
            const result = await translateMicrosoft(text, resolvedSource, resolvedTarget);
            const phonetic = await getPhoneticForTranslation({
                sourceText: text,
                translated: result.translated,
                sourceLang: resolvedSource,
                targetLang: resolvedTarget,
                detectedSource: result.detected
            });
            return {
                translated: result.translated,
                detectedSource: result.detected,
                phonetic: phonetic
            };
        }
    }
};
