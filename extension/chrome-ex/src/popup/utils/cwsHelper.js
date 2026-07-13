import { crxToZip, triggerDownload } from '../../shared/crx.js';

/**
 * Open CWS extension source code in viewer tab
 * @param {string} extId 
 */
export function cwsViewSource(extId) {
  if (extId) {
    chrome.tabs.create({ url: chrome.runtime.getURL(`src/options/options.html?id=${extId}`) });
  }
}

/**
 * Download ZIP of a CWS extension
 * @param {string} extId 
 * @param {import('vue').Ref<boolean>} downloadingZipRef 
 * @param {boolean} isDownloadingGlobal 
 */
export async function cwsDownloadZip(extId, downloadingZipRef, isDownloadingGlobal) {
  if (isDownloadingGlobal || !extId) return;
  downloadingZipRef.value = true;
  const crxUrl = `https://clients2.google.com/service/update2/crx?response=redirect&os=win&arch=x86-64&os_arch=x86-64&nacl_arch=x86-64&prod=chromecrx&prodchannel=unknown&prodversion=149.0.0.0&acceptformat=crx2,crx3&x=id%3D${extId}%26uc`;
  try {
    const res = await fetch(crxUrl);
    if (!res.ok) throw new Error("Fetch error: " + res.status);
    const buf = await res.arrayBuffer();
    const zipBuf = crxToZip(buf);
    const blob = new Blob([zipBuf], { type: 'application/zip' });
    triggerDownload(blob, `${extId}.zip`);
  } catch (err) {
    console.error(err);
    alert("Lỗi tải/chuyển đổi ZIP: " + err.message);
  } finally {
    downloadingZipRef.value = false;
  }
}

/**
 * Download CRX of a CWS extension
 * @param {string} extId 
 * @param {import('vue').Ref<boolean>} downloadingCrxRef 
 * @param {boolean} isDownloadingGlobal 
 */
export async function cwsDownloadCrx(extId, downloadingCrxRef, isDownloadingGlobal) {
  if (isDownloadingGlobal || !extId) return;
  downloadingCrxRef.value = true;
  const crxUrl = `https://clients2.google.com/service/update2/crx?response=redirect&os=win&arch=x86-64&os_arch=x86-64&nacl_arch=x86-64&prod=chromecrx&prodchannel=unknown&prodversion=149.0.0.0&acceptformat=crx2,crx3&x=id%3D${extId}%26uc`;
  try {
    const res = await fetch(crxUrl);
    if (!res.ok) throw new Error("Fetch error: " + res.status);
    const buf = await res.arrayBuffer();
    const blob = new Blob([buf], { type: 'application/octet-stream' });
    triggerDownload(blob, `${extId}.crx`);
  } catch (err) {
    console.error(err);
    alert("Lỗi tải CRX: " + err.message);
  } finally {
    downloadingCrxRef.value = false;
  }
}
