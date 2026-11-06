/**
 * ProxyAuthService — Handles proxy authentication and proxy configuration changes.
 * Keeps credentials in memory and applies settings in a centralized background service.
 */
export class ProxyAuthService {
    static currentAuth = null;
    static testOriginalAuth = null;
    static testOriginalConfig = null;
    static restoreTimer = null;
    static suppliedRequestIds = new Set();

    static init() {
        ProxyAuthService._loadCache();
        ProxyAuthService._listenChanges();
        ProxyAuthService._interceptAuth();
        if (chrome.proxy && chrome.proxy.onProxyError) {
            chrome.proxy.onProxyError.addListener((details) => {
                console.warn("[ProxyAuthService] Chrome Proxy Error:", details);
            });
        }
    }

    static _loadCache() {
        chrome.storage.local.get(['proxyConfig'], (result) => {
            const config = result.proxyConfig;
            if (config && config.enabled && config.useAuth && config.username) {
                ProxyAuthService.currentAuth = {
                    username: config.username,
                    password: config.password || ''
                };
            } else {
                ProxyAuthService.currentAuth = null;
            }
        });
    }

    static _listenChanges() {
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (changes.proxyConfig) {
                const config = changes.proxyConfig.newValue;
                if (config && config.enabled && config.useAuth && config.username) {
                    ProxyAuthService.currentAuth = {
                        username: config.username,
                        password: config.password || ''
                    };
                } else {
                    ProxyAuthService.currentAuth = null;
                }
            }
        });
    }

    static _interceptAuth() {
        chrome.webRequest.onAuthRequired.addListener(
            (details, callback) => {
                if (details.isProxy) {
                    if (ProxyAuthService.currentAuth) {
                        if (ProxyAuthService.suppliedRequestIds.has(details.requestId)) {
                            console.warn("[ProxyAuthService] Auth retry requested - credentials likely incorrect. Cancelling request to prevent native prompt.");
                            callback({ cancel: true });
                        } else {
                            ProxyAuthService.suppliedRequestIds.add(details.requestId);
                            setTimeout(() => {
                                ProxyAuthService.suppliedRequestIds.delete(details.requestId);
                            }, 30000);

                            callback({
                                authCredentials: ProxyAuthService.currentAuth
                            });
                        }
                    } else {
                        console.warn("[ProxyAuthService] Proxy authentication requested but no credentials set. Cancelling request.");
                        callback({ cancel: true });
                    }
                } else {
                    callback();
                }
            },
            { urls: ["<all_urls>"] },
            ["asyncBlocking"]
        );
    }

    /**
     * Gets actual real-time proxy state directly from Chrome's proxy engine API
     */
    static getActualProxyState() {
        return new Promise((resolve) => {
            if (!chrome.proxy || !chrome.proxy.settings) {
                resolve({ enabled: false, mode: 'direct' });
                return;
            }
            chrome.proxy.settings.get({ incognito: false }, (details) => {
                if (chrome.runtime.lastError || !details || !details.value) {
                    resolve({ enabled: false, mode: 'direct' });
                    return;
                }
                const mode = details.value.mode;
                const isEnabled = (mode === 'fixed_servers' || mode === 'pac_script');
                
                let host = '';
                let port = 0;
                let scheme = 'http';

                if (mode === 'fixed_servers' && details.value.rules && details.value.rules.singleProxy) {
                    host = details.value.rules.singleProxy.host || '';
                    port = details.value.rules.singleProxy.port || 0;
                    scheme = details.value.rules.singleProxy.scheme || 'http';
                }

                resolve({
                    enabled: isEnabled,
                    mode,
                    host,
                    port,
                    scheme,
                    levelOfControl: details.levelOfControl
                });
            });
        });
    }

    /**
     * Multi-endpoint resilient fetchIp helper
     */
    static async fetchIp() {
        const endpoints = [
            { url: 'https://api.ipify.org?format=json', parse: async (r) => (await r.json()).ip },
            { url: 'https://ipinfo.io/json', parse: async (r) => (await r.json()).ip },
            { url: 'https://api.my-ip.io/v2/ip.json', parse: async (r) => (await r.json()).ip },
            { url: 'https://icanhazip.com', parse: async (r) => (await r.text()).trim() }
        ];

        for (const ep of endpoints) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 4000);
                const response = await fetch(ep.url, {
                    signal: controller.signal,
                    cache: 'no-store'
                });
                clearTimeout(timeoutId);
                if (response.ok) {
                    const ip = await ep.parse(response);
                    if (ip && typeof ip === 'string' && ip.trim().length >= 7) {
                        return ip.trim();
                    }
                }
            } catch (e) {
                // Try next IP endpoint
            }
        }
        return null;
    }

    /**
     * Resilient multi-endpoint GeoIP details fetcher (latitude, longitude, timezone, ip)
     */
    static async fetchGeoDetails() {
        const endpoints = [
            {
                url: 'https://ipapi.co/json/',
                parse: async (r) => {
                    const d = await r.json();
                    if (d && d.latitude && d.longitude) {
                        return { latitude: d.latitude, longitude: d.longitude, timezone: d.timezone, liveIp: d.ip };
                    }
                    return null;
                }
            },
            {
                url: 'http://ip-api.com/json/',
                parse: async (r) => {
                    const d = await r.json();
                    if (d && d.lat && d.lon) {
                        return { latitude: d.lat, longitude: d.lon, timezone: d.timezone, liveIp: d.query };
                    }
                    return null;
                }
            },
            {
                url: 'https://ipinfo.io/json',
                parse: async (r) => {
                    const d = await r.json();
                    if (d && d.loc) {
                        const [lat, lon] = d.loc.split(',');
                        return { latitude: parseFloat(lat), longitude: parseFloat(lon), timezone: d.timezone, liveIp: d.ip };
                    }
                    return null;
                }
            }
        ];

        for (const ep of endpoints) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 4000);
                const response = await fetch(ep.url, { signal: controller.signal, cache: 'no-store' });
                clearTimeout(timeoutId);
                if (response.ok) {
                    const geo = await ep.parse(response);
                    if (geo) return geo;
                }
            } catch (e) {}
        }
        return null;
    }

    /**
     * Connects to a proxy.
     */
    static async connectProxy(proxyDetails) {
        try {
            if (!chrome.proxy || !chrome.proxy.settings) {
                throw new Error("Proxy API không khả dụng trên trình duyệt.");
            }

            if (!proxyDetails) {
                throw new Error("Dữ liệu Proxy không hợp lệ!");
            }

            let chromeConfig;
            let proxyConfig;

            if (proxyDetails.scheme === 'pac') {
                if (!proxyDetails.pacUrl) {
                    throw new Error("Đường dẫn PAC URL không được để trống!");
                }
                proxyConfig = {
                    enabled: true,
                    scheme: 'pac',
                    pacUrl: proxyDetails.pacUrl,
                    name: proxyDetails.name || 'PAC Proxy'
                };
                chromeConfig = {
                    mode: "pac_script",
                    pacScript: { url: proxyDetails.pacUrl }
                };
            } else {
                const cleanedHost = String(proxyDetails.host || '').trim();
                const portInt = parseInt(proxyDetails.port, 10);
                if (!cleanedHost || isNaN(portInt) || portInt <= 0 || portInt > 65535) {
                    throw new Error("Thông tin Host hoặc Port proxy không hợp lệ (1 - 65535)!");
                }

                const bypassList = (proxyDetails.bypass || '').split('\n').map(d => d.trim()).filter(Boolean);

                proxyConfig = {
                    enabled: true,
                    scheme: proxyDetails.scheme || 'http',
                    host: cleanedHost,
                    port: portInt,
                    useAuth: !!proxyDetails.useAuth,
                    username: proxyDetails.username || '',
                    password: proxyDetails.password || '',
                    bypass: proxyDetails.bypass || '',
                    name: proxyDetails.name || `${cleanedHost}:${portInt}`
                };

                const validScheme = ['http', 'https', 'socks4', 'socks5'].includes(proxyDetails.scheme) ? proxyDetails.scheme : 'http';

                const rulesObj = {
                    singleProxy: {
                        scheme: validScheme,
                        host: cleanedHost,
                        port: portInt
                    }
                };
                if (bypassList.length > 0) {
                    rulesObj.bypassList = bypassList;
                }

                chromeConfig = {
                    mode: "fixed_servers",
                    rules: rulesObj
                };
            }

            // 3. Apply proxy settings in Chrome FIRST
            await new Promise((resolve, reject) => {
                chrome.proxy.settings.set({ value: chromeConfig, scope: 'regular' }, () => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve();
                    }
                });
            });

            // 4. Save to storage IMMEDIATELY
            await new Promise(r => {
                chrome.storage.local.set({ proxyConfig, activeProxyId: proxyDetails.id, proxyActive: true }, r);
            });

            // 5. Asynchronously fetch GeoIP details (lat, lng, timezone, liveIp)
            ProxyAuthService.fetchGeoDetails().then(geo => {
                if (geo) {
                    chrome.storage.local.get(['proxyConfig'], (res) => {
                        if (res.proxyConfig && res.proxyConfig.enabled) {
                            chrome.storage.local.set({ proxyConfig: { ...res.proxyConfig, ...geo } });
                        }
                    });
                }
            }).catch(() => {});

            return { success: true, proxyConfig };
        } catch (e) {
            console.error("[Proxy Service] connectProxy error:", e);
            ProxyAuthService.currentAuth = null;
            chrome.proxy.settings.clear({ scope: 'regular' }, () => {});
            chrome.storage.local.set({ proxyConfig: { enabled: false }, activeProxyId: null, proxyActive: false }, () => {});
            return { success: false, error: e.message };
        }
    }

    /**
     * Disables the proxy connection cleanly.
     */
    static async disableProxy() {
        try {
            ProxyAuthService.currentAuth = null;

            await new Promise(r => {
                chrome.storage.local.set({ proxyConfig: { enabled: false }, activeProxyId: null, proxyActive: false }, r);
            });

            if (chrome.proxy && chrome.proxy.settings) {
                await new Promise((resolve) => {
                    chrome.proxy.settings.clear({ scope: 'regular' }, () => {
                        const err = chrome.runtime.lastError;
                        if (err) console.warn("[Proxy Service] clear warning:", err.message);
                        resolve();
                    });
                });
            }

            return { success: true };
        } catch (e) {
            console.error("[Proxy Service] disableProxy error:", e);
            chrome.storage.local.set({ proxyConfig: { enabled: false }, activeProxyId: null, proxyActive: false }, () => {});
            return { success: true };
        }
    }

    /**
     * Performs proxy connectivity test by temporarily configuring Chrome's proxy engine.
     */
    static async testProxy(proxyDetails) {
        if (!proxyDetails || !proxyDetails.host) {
            return { success: false, error: "Thông tin Host và Port không được để trống!" };
        }

        const cleanedHost = String(proxyDetails.host).trim();
        const portInt = parseInt(proxyDetails.port, 10);
        if (isNaN(portInt) || portInt <= 0 || portInt > 65535) {
            return { success: false, error: "Cổng Port Proxy không hợp lệ (1 - 65535)!" };
        }

        const originalAuth = ProxyAuthService.currentAuth;
        const result = await new Promise(resolve => {
            chrome.storage.local.get(['proxyConfig'], resolve);
        });
        const originalConfig = result.proxyConfig;

        if (proxyDetails.useAuth && proxyDetails.username) {
            ProxyAuthService.currentAuth = {
                username: proxyDetails.username,
                password: proxyDetails.password || ''
            };
        } else {
            ProxyAuthService.currentAuth = null;
        }

        const restoreSettings = () => {
            ProxyAuthService.currentAuth = originalAuth;
            if (originalConfig && originalConfig.enabled) {
                const restorePortInt = parseInt(originalConfig.port, 10) || 80;
                const validScheme = ['http', 'https', 'socks4', 'socks5'].includes(originalConfig.scheme) ? originalConfig.scheme : 'http';
                const restoreRules = {
                    singleProxy: {
                        scheme: validScheme,
                        host: String(originalConfig.host).trim(),
                        port: restorePortInt
                    }
                };
                const restoreBypassList = (originalConfig.bypass || '').split('\n').map(d => d.trim()).filter(Boolean);
                if (restoreBypassList.length > 0) {
                    restoreRules.bypassList = restoreBypassList;
                }
                const restoreChromeConfig = {
                    mode: "fixed_servers",
                    rules: restoreRules
                };
                chrome.proxy.settings.set({ value: restoreChromeConfig, scope: 'regular' }, () => {});
            } else {
                chrome.proxy.settings.clear({ scope: 'regular' }, () => {
                    ProxyAuthService.currentAuth = null;
                });
            }
        };

        try {
            if (!chrome.proxy || !chrome.proxy.settings) {
                throw new Error("Proxy API không khả dụng.");
            }

            const validScheme = ['http', 'https', 'socks4', 'socks5'].includes(proxyDetails.scheme) ? proxyDetails.scheme : 'http';
            const rulesObj = {
                singleProxy: {
                    scheme: validScheme,
                    host: cleanedHost,
                    port: portInt
                }
            };
            const bypassList = (proxyDetails.bypass || '').split('\n').map(d => d.trim()).filter(Boolean);
            if (bypassList.length > 0) {
                rulesObj.bypassList = bypassList;
            }

            const testChromeConfig = {
                mode: "fixed_servers",
                rules: rulesObj
            };

            await new Promise((resolve, reject) => {
                chrome.proxy.settings.set({ value: testChromeConfig, scope: 'regular' }, () => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve();
                    }
                });
            });

            const startTime = performance.now();
            const returnedIp = await ProxyAuthService.fetchIp();
            const latency = Math.round(performance.now() - startTime);

            restoreSettings();

            if (!returnedIp) {
                return { success: false, error: "Máy chủ Proxy không phản hồi hoặc bị Offline (Cổng hoặc IP không kết nối được)." };
            } else {
                return { success: true, latency, ip: returnedIp };
            }
        } catch (e) {
            console.error("[Proxy Test Service] Error:", e);
            restoreSettings();
            return { success: false, error: e.message };
        }
    }
}
