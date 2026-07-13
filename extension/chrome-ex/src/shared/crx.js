/**
 * Shared Chrome Extension (CRX) Utilities.
 * Handles decoding CRX headers to extract clean ZIP archives and browser downloads.
 */

/**
 * Converts a Chrome Extension (CRX) ArrayBuffer payload into a clean ZIP ArrayBuffer.
 * Strips the signature/header data for both CRXv2 and CRXv3 formats.
 * 
 * @param {ArrayBuffer} arrayBuffer - The raw CRX file buffer
 * @returns {ArrayBuffer} The stripped ZIP file buffer
 * @throws {Error} If the header/magic signature is invalid, unsupported, or file is truncated
 */
export function crxToZip(arrayBuffer) {
    if (!arrayBuffer || arrayBuffer.byteLength < 12) {
        throw new Error("Tập tin quá nhỏ hoặc không hợp lệ.");
    }

    const view = new DataView(arrayBuffer);
    
    // Header verification: check magic 'Cr24' (0x43723234)
    if (view.getUint32(0, false) !== 0x43723234) {
        throw new Error("Định dạng tập tin không hợp lệ: Không phải file CRX hoặc tập tin bị hỏng.");
    }

    const version = view.getUint32(4, true);
    let offset = 0;

    if (version === 3) {
        const headerLength = view.getUint32(8, true);
        offset = 12 + headerLength;
    } else if (version === 2) {
        const publicKeyLength = view.getUint32(8, true);
        const signatureLength = view.getUint32(12, true);
        offset = 16 + publicKeyLength + signatureLength;
    } else {
        throw new Error(`Phiên bản định dạng CRX không được hỗ trợ (Version: ${version}).`);
    }

    if (offset >= arrayBuffer.byteLength) {
        throw new Error("Lỗi phân tích cú pháp Header: Vượt quá chiều dài tập tin.");
    }

    return arrayBuffer.slice(offset);
}

/**
 * Triggers a browser download for a Blob object.
 * 
 * @param {Blob} blob - The blob data to download
 * @param {string} filename - The default filename for the download
 */
export function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}
