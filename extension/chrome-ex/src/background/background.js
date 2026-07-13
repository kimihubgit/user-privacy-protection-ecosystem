
import { ApiSync } from './services/ApiSync.js';
import { GpcService } from './services/GpcService.js';
import { NavigationShield } from './services/NavigationShield.js';
import { TrackingParamsService } from './services/TrackingParamsService.js';
import { ProxyAuthService } from './services/ProxyAuthService.js';
import { ProxyAdvancedService } from './services/ProxyAdvancedService.js';
import { TranslateService } from './services/TranslateService.js';
import { CONFIG } from '../config.js';

const apiSync = new ApiSync(CONFIG.DEFAULT_API_URL, 60);

// Initialize managers
chrome.runtime.onInstalled.addListener((details) => {
    apiSync.fetchScamList();
    apiSync.initAlarm();
    chrome.storage.local.set({ tempWhitelist: [] });
    GpcService.updateScript();
    TrackingParamsService.updateRules();

    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        chrome.tabs.create({ url: chrome.runtime.getURL("src/welcome/welcome.html") });
    }

    // Create Context Menu item for CWS detail pages
    chrome.contextMenus.create({
        id: "view-extension-source",
        title: "Xem mã nguồn Extension này",
        contexts: ["page", "link"],
        documentUrlPatterns: [
            "*://chromewebstore.google.com/detail/*",
            "*://chrome.google.com/webstore/detail/*"
        ]
    }, () => {
        if (chrome.runtime.lastError) {
            console.log("Context menu creation log:", chrome.runtime.lastError.message);
        }
    });
});

// Context Menu click handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "view-extension-source") {
        const urlString = info.linkUrl || info.pageUrl || (tab && tab.url);
        if (urlString) {
            try {
                const url = new URL(urlString);
                const idMatch = url.pathname.match(/\/detail\/.*?\/([a-p]{32})/) || url.pathname.match(/\/([a-p]{32})(?:\/|\?|$)/);
                if (idMatch && idMatch[1]) {
                    const extId = idMatch[1];
                    chrome.tabs.create({
                        url: chrome.runtime.getURL(`src/options/options.html?id=${extId}`)
                    });
                }
            } catch (e) {
                console.error("Lỗi phân tích URL từ Context Menu:", e);
            }
        }
    }
});

chrome.runtime.onStartup.addListener(() => {
    chrome.storage.local.set({ tempWhitelist: [] });
    GpcService.updateScript();
    TrackingParamsService.updateRules();
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "updateScamList") {
        apiSync.fetchScamList();
    }
});

// Setup navigation blocking
NavigationShield.init();

// Handle messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "connectProxy") {
        console.log("[Background] Received connectProxy request:", request.proxyDetails?.host);
        ProxyAuthService.connectProxy(request.proxyDetails)
            .then(result => sendResponse(result))
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    }

    if (request.action === "disableProxy") {
        console.log("[Background] Received disableProxy request");
        ProxyAuthService.disableProxy()
            .then(result => sendResponse(result))
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    }

    if (request.action === "testProxy") {
        console.log("[Background] Received testProxy request:", request.proxyDetails?.host);
        ProxyAuthService.testProxy(request.proxyDetails)
            .then(result => sendResponse(result))
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    }

    if (request && request.name === "globalPrivacyControl.getState") {
        chrome.storage.local.get("gpcEnabled", (res) => {
            const isGpcEnabled = res.gpcEnabled !== false;
            sendResponse(isGpcEnabled);
        });
        return true;
    }

    if (request.action === "checkDomain") {
        NavigationShield.checkDomain(request.domain).then(status => {
            sendResponse({ 
                status, 
                isScam: status === 'unsafe' 
            });
        });
        return true;
    }

    if (request.action === "forceUpdate") {
        apiSync.fetchScamList().then(() => {
            sendResponse({ success: true });
        });
        return true;
    }

    if (request.action === "whitelistDomainTemp") {
        const domain = request.domain;
        chrome.storage.local.get("tempWhitelist", (result) => {
            const whitelist = result.tempWhitelist || [];
            if (!whitelist.includes(domain)) {
                whitelist.push(domain);
                chrome.storage.local.set({ tempWhitelist: whitelist }, () => {
                    sendResponse({ success: true });
                });
            } else {
                sendResponse({ success: true });
            }
        });
        return true;
    }

    if (request && (request.type === "TRANSLATE" || request.action === "translate")) {
        const payload = request.payload || request;
        TranslateService.translate(payload)
            .then(result => {
                sendResponse({ ok: true, ...result });
            })
            .catch(err => {
                sendResponse({ ok: false, error: err.message });
            });
        return true;
    }
});

// Update icon helper
function updateExtensionIcon(isEnabled) {
    const suffix = isEnabled ? "o" : "f";
    chrome.action.setIcon({
        path: {
            "16": `/assets/icons/ki16${suffix}.png`,
            "32": `/assets/icons/ki32${suffix}.png`,
            "64": `/assets/icons/ki64${suffix}.png`,
            "128": `/assets/icons/ki128${suffix}.png`
        }
    });
}

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.globalEnabled) {
        updateExtensionIcon(changes.globalEnabled.newValue !== false);
    }
    if (changes.gpcEnabled) {
        GpcService.updateScript();
    }
    if (changes.removeTrackingParams) {
        TrackingParamsService.updateRules();
    }
    if (changes.apiUrl) {
        apiSync.fetchScamList();
    }
});

// Sync initial icon, script & rules
chrome.storage.local.get("globalEnabled", (result) => {
    updateExtensionIcon(result.globalEnabled !== false);
    GpcService.updateScript();
    TrackingParamsService.updateRules();
});

// Initialize Proxy Authentication Service
ProxyAuthService.init();

// Initialize Proxy Advanced Service (Anti-detect, WebRTC, GPS, Timezone)
ProxyAdvancedService.init();

// Lắng nghe sự kiện truyền cookie từ trang web chia sẻ (externally_connectable)
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
    console.log("[Background] Nhận message từ trang web ngoài:", request);

    // 1. Chỉ lưu cookies vào danh sách profile của extension, không nạp trực tiếp vào trình duyệt
    if (request && request.action === "IMPORT_COOKIES") {
        const cookies = request.cookies;
        if (!cookies || !Array.isArray(cookies)) {
            sendResponse({ success: false, error: "Dữ liệu cookie không hợp lệ." });
            return true;
        }

        let domain = request.domain;
        if (!domain && cookies.length > 0) {
            const firstCookie = cookies[0];
            if (firstCookie.domain) {
                domain = firstCookie.domain.startsWith('.') ? firstCookie.domain.substring(1) : firstCookie.domain;
            }
        }

        if (!domain) {
            sendResponse({ success: false, error: "Không tìm thấy domain hợp lệ trong dữ liệu cookie." });
            return true;
        }

        const profileName = request.profileName || `${domain}_shared`;
        const storageKey = `cookie_profiles_${domain}`;

        chrome.storage.local.get([storageKey], (res) => {
            const savedProfiles = res[storageKey] || [];
            const newProfileId = Date.now().toString();
            
            const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            let randSuffix = '';
            for (let i = 0; i < 3; i++) {
                randSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            
            const finalProfileName = `${profileName}_${randSuffix}`;

            const newProfile = {
                id: newProfileId,
                name: finalProfileName,
                cookiesCount: cookies.length,
                cookies: cookies,
                createdAt: Date.now()
            };

            savedProfiles.push(newProfile);

            chrome.storage.local.set({
                [storageKey]: JSON.parse(JSON.stringify(savedProfiles))
            }, () => {
                sendResponse({ 
                    success: true, 
                    profileName: finalProfileName, 
                    totalCount: cookies.length
                });
                
                chrome.notifications.create({
                    type: "basic",
                    iconUrl: "/assets/icons/ki64o.png",
                    title: "KiGuard Cookie Manager",
                    message: `Đã nhập và lưu Profile Cookie mới: ${finalProfileName}`
                });
            });
        });
        return true;
    }

    // 2. Vừa lưu profile vừa kích hoạt/nạp ngay lập tức vào trình duyệt
    if (request && request.action === "importSharedCookie") {
        const { profileName, domain, cookies } = request;
        if (!cookies || !Array.isArray(cookies) || !domain) {
            sendResponse({ success: false, error: "Dữ liệu cookie không hợp lệ hoặc thiếu thông tin domain." });
            return true;
        }

        let restoredCount = 0;
        let errorCount = 0;
        const totalToRestore = cookies.length;

        const saveProfileAndRespond = () => {
            const storageKey = `cookie_profiles_${domain}`;
            const activeKey = `active_profile_id_${domain}`;

            chrome.storage.local.get([storageKey], (res) => {
                const savedProfiles = res[storageKey] || [];
                const newProfileId = Date.now().toString();
                
                const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                let randSuffix = '';
                for (let i = 0; i < 3; i++) {
                    randSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                
                const finalProfileName = profileName || `${domain}_shared_${randSuffix}`;

                const newProfile = {
                    id: newProfileId,
                    name: finalProfileName,
                    cookiesCount: totalToRestore,
                    cookies: cookies,
                    createdAt: Date.now()
                };

                savedProfiles.push(newProfile);

                chrome.storage.local.set({
                    [storageKey]: JSON.parse(JSON.stringify(savedProfiles)),
                    [activeKey]: newProfileId
                }, () => {
                    sendResponse({ 
                        success: true, 
                        profileName: finalProfileName, 
                        restoredCount: totalToRestore - errorCount,
                        totalCount: totalToRestore
                    });
                    
                    chrome.notifications.create({
                        type: "basic",
                        iconUrl: "/assets/icons/ki64o.png",
                        title: "KiGuard Cookie Manager",
                        message: `Đã tự động nhận và kích hoạt Profile Cookie: ${finalProfileName}`
                    });
                });
            });
        };

        if (totalToRestore === 0) {
            saveProfileAndRespond();
            return true;
        }

        // Xóa sạch cookie của domain trước khi khôi phục cookie mới
        chrome.cookies.getAll({ domain: domain }, (currentCookies) => {
            let clearedCount = 0;
            const totalToClear = currentCookies ? currentCookies.length : 0;

            const proceedToRestore = () => {
                cookies.forEach(c => {
                    const cleanDomain = c.domain.startsWith('.') ? c.domain.substring(1) : c.domain;
                    const url = (c.secure ? 'https://' : 'http://') + cleanDomain + c.path;

                    const setDetails = {
                        url,
                        name: c.name,
                        value: c.value || '',
                        path: c.path || '/',
                        secure: c.secure !== undefined ? c.secure : false,
                        httpOnly: c.httpOnly !== undefined ? c.httpOnly : false
                    };

                    if (c.domain && !c.hostOnly) setDetails.domain = c.domain;
                    if (c.sameSite && c.sameSite !== 'unspecified') setDetails.sameSite = c.sameSite;
                    if (c.expirationDate && !c.session) setDetails.expirationDate = c.expirationDate;
                    if (c.storeId) setDetails.storeId = c.storeId;

                    chrome.cookies.set(setDetails, () => {
                        restoredCount++;
                        if (chrome.runtime.lastError) {
                            console.error("[Background] Set cookie error:", chrome.runtime.lastError.message);
                            errorCount++;
                        }
                        if (restoredCount === totalToRestore) {
                            saveProfileAndRespond();
                        }
                    });
                });
            };

            if (totalToClear === 0) {
                proceedToRestore();
            } else {
                currentCookies.forEach(cookie => {
                    const cleanDomain = cookie.domain.replace(/^\./, '');
                    const url = (cookie.secure ? 'https://' : 'http://') + cleanDomain + cookie.path;

                    chrome.cookies.remove({
                        url,
                        name: cookie.name,
                        storeId: cookie.storeId
                    }, () => {
                        clearedCount++;
                        if (clearedCount === totalToClear) {
                            proceedToRestore();
                        }
                    });
                });
            }
        });

        return true; // Giữ kết nối tin nhắn bất đồng bộ
    }
});
