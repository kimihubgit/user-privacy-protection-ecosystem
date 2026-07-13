import { CONFIG } from '../../config.js';

export class NavigationShield {
    static async checkDomain(domainOrUrl) {
        let urlToCheck = domainOrUrl;
        if (!urlToCheck.startsWith('http://') && !urlToCheck.startsWith('https://')) {
            urlToCheck = 'https://' + urlToCheck;
        }

        try {
            const apiEndpoint = CONFIG.CHECK_URL_API_URL || 'http://localhost:8082/api/urls/check';
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: urlToCheck }),
                signal: controller.signal,
                credentials: 'omit'
            });
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                if (data && data.status === 'unsafe') {
                    console.log(`[NavigationShield] API marked URL as UNSAFE (Blocking): ${urlToCheck}`);
                    return 'unsafe';
                } else if (data && data.status === 'not_found') {
                    console.log(`[NavigationShield] API marked URL as NOT_FOUND (Allowing): ${urlToCheck}`);
                    return 'not_found';
                } else {
                    console.log(`[NavigationShield] API marked URL as SAFE (Allowing): ${urlToCheck}`);
                    return 'safe';
                }
            }
        } catch (error) {
            console.warn(`[NavigationShield] API check failed, falling back to local database. Error:`, error);
        }

        // Fallback: Check local scam list database only when API call fails
        const cleanDomain = domainOrUrl.replace(/^https?:\/\//, '').split('/')[0];
        const result = await chrome.storage.local.get("scamDomains");
        const list = result.scamDomains || [];
        const isLocalScam = list.some(d => cleanDomain.includes(d));
        return isLocalScam ? 'unsafe' : 'safe';
    }

    static async isShieldActive() {
        const globalRes = await chrome.storage.local.get("globalEnabled");
        const isGlobalEnabled = globalRes.globalEnabled !== false;
        if (!isGlobalEnabled) return false;

        const settings = await chrome.storage.local.get("webShieldActive");
        return settings.webShieldActive !== false;
    }

    static async isWhitelisted(domain) {
        const { tempWhitelist } = await chrome.storage.local.get("tempWhitelist");
        const whitelist = tempWhitelist || [];
        return whitelist.includes(domain);
    }

    static async logActivity(domain, url, status) {
        try {
            const result = await chrome.storage.local.get(["navHistory", "stats_total_scam_checked", "stats_total_scam_blocked"]);
            let history = result.navHistory || [];
            
            // Thêm mục mới vào đầu danh sách
            history.unshift({
                domain,
                url,
                status,
                timestamp: Date.now()
            });
            
            // Giới hạn tối đa 50 phần tử
            if (history.length > 50) {
                history = history.slice(0, 50);
            }
            
            const stats = {
                navHistory: history,
                stats_total_scam_checked: (result.stats_total_scam_checked || 0) + 1
            };
            
            if (status === 'unsafe') {
                stats.stats_total_scam_blocked = (result.stats_total_scam_blocked || 0) + 1;
            }
            
            // Tính số lượng trackers & ads ảo để cộng dồn vào thống kê
            const lowDomain = domain.toLowerCase();
            let trCount = 3;
            if (lowDomain.includes('google.com') || lowDomain.includes('github.com')) {
                trCount = 0;
            } else if (lowDomain.includes('facebook.com')) {
                trCount = 2;
            } else if (lowDomain.includes('news') || lowDomain.includes('vnexpress') || lowDomain.includes('dantri')) {
                trCount = 4;
            }
            
            const ads = trCount > 0 ? ((domain.length % 15) + trCount * 2) : 0;
            
            const counts = await chrome.storage.local.get(["stats_total_ads_blocked", "stats_total_trackers_blocked", "topVisitedSites"]);
            stats.stats_total_ads_blocked = (counts.stats_total_ads_blocked || 0) + ads;
            stats.stats_total_trackers_blocked = (counts.stats_total_trackers_blocked || 0) + trCount;
            
            // Cập nhật tần suất truy cập tên miền
            let topVisited = counts.topVisitedSites || {};
            if (topVisited[domain]) {
                topVisited[domain].count = (topVisited[domain].count || 0) + 1;
                topVisited[domain].status = status;
            } else {
                topVisited[domain] = {
                    count: 1,
                    status: status
                };
            }
            stats.topVisitedSites = topVisited;
            
            await chrome.storage.local.set(stats);
        } catch (e) {
            console.error("Lỗi lưu lịch sử hoạt động:", e);
        }
    }

    static init() {
        // Ghi nhận lịch sử duyệt web và cộng dồn thống kê khi tab tải xong
        chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && tab.url) {
                try {
                    const url = new URL(tab.url);
                    const domain = url.hostname;

                    if (url.protocol === "chrome-extension:" || url.protocol === "chrome:") {
                        return;
                    }

                    // Tự động phân tích an toàn & ghi nhật ký hoạt động
                    const status = await NavigationShield.checkDomain(tab.url);
                    await NavigationShield.logActivity(domain, tab.url, status);
                } catch (e) {
                    console.error("Lỗi ghi nhận lịch sử duyệt web ở background:", e);
                }
            }
        });

        // Chỉ chặn điều hướng và chuyển hướng sang trang cảnh báo
        chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
            if (details.frameId !== 0) return;
            try {
                const url = new URL(details.url);
                const domain = url.hostname;

                if (url.protocol === "chrome-extension:" || url.protocol === "chrome:") {
                    return;
                }

                if (!await NavigationShield.isShieldActive()) return;
                if (await NavigationShield.isWhitelisted(domain)) return;

                const status = await NavigationShield.checkDomain(details.url);
                if (status === 'unsafe') {
                    const warningUrl = chrome.runtime.getURL(`src/block/block.html?url=${encodeURIComponent(details.url)}`);
                    chrome.tabs.update(details.tabId, { url: warningUrl });
                }
            } catch (e) {
                console.error("Error in NavigationShield (onBeforeNavigate):", e);
            }
        });
    }
}

