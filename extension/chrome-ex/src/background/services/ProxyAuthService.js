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
     * Build a PAC (Proxy Auto-Config) script string
     */
    static buildPacScript(scheme, host, port, bypassList = []) {
        const pacDirectiveMap = {
            "http": "PROXY",
            "https": "HTTPS",
            "socks4": "SOCKS",
            "socks5": "SOCKS5",
            "quic": "PROXY",
            "privoxy": "PROXY",
            "psiphon": "PROXY",
            "shadowsocks": "SOCKS5",
            "tor": "SOCKS5",
            "nekoray": "SOCKS5",
            "v2ray": "SOCKS5"
        };
        const directive = pacDirectiveMap[scheme] || "PROXY";
        const proxyString = directive + ' ' + host + ':' + port;

        let bypassChecks = '';
        for (const pattern of bypassList) {
            const p = pattern.trim();
            if (!p) continue;
            if (p === '<local>') {
                bypassChecks += '    if (isPlainHostName(host)) return "DIRECT";\n';
            } else if (p.includes('*')) {
                bypassChecks += '    if (shExpMatch(host, "' + p + '")) return "DIRECT";\n';
            } else {
                bypassChecks += '    if (dnsDomainIs(host, "' + p + '") || host === "' + p + '") return "DIRECT";\n';
            }
        }

        return 'function FindProxyForURL(url, host) {\n' + bypassChecks + '    return "' + proxyString + '";\n}';
    }

    /**
     * Connects to a proxy. Sets credentials in memory synchronously BEFORE settings take effect,
     * resolving race conditions that prompt the user for password.
     */
    static async connectProxy(proxyDetails) {
        try {
            if (!chrome.proxy || !chrome.proxy.settings) {
                throw new Error("Proxy API is not available.");
            }

            // 1. Set credentials in memory synchronously
            if (proxyDetails.useAuth && proxyDetails.username) {
                ProxyAuthService.currentAuth = {
                    username: proxyDetails.username,
                    password: proxyDetails.password || ''
                };
            } else {
                ProxyAuthService.currentAuth = null;
            }

            // 2. Prepare configurations
            let chromeConfig;
            let proxyConfig;

            if (proxyDetails.scheme === 'pac') {
                proxyConfig = {
                    enabled: true,
                    scheme: 'pac',
                    pacUrl: proxyDetails.pacUrl,
                    name: proxyDetails.name || ''
                };
                chromeConfig = {
                    mode: "pac_script",
                    pacScript: { url: proxyDetails.pacUrl }
                };
            } else {
                const bypassList = (proxyDetails.bypass || '').split('\n').map(d => d.trim()).filter(Boolean);
                const portInt = parseInt(proxyDetails.port);
                if (isNaN(portInt)) {
                    throw new Error("Port proxy không hợp lệ!");
                }

                proxyConfig = {
                    enabled: true,
                    scheme: proxyDetails.scheme,
                    host: proxyDetails.host,
                    port: portInt,
                    useAuth: !!proxyDetails.useAuth,
                    username: proxyDetails.username || '',
                    password: proxyDetails.password || '',
                    bypass: proxyDetails.bypass || '',
                    name: proxyDetails.name || ''
                };

                chromeConfig = {
                    mode: "pac_script",
                    pacScript: {
                        data: ProxyAuthService.buildPacScript(proxyDetails.scheme, proxyDetails.host, portInt, bypassList),
                        mandatory: true
                    }
                };
            }

            // 3. Save to storage
            await new Promise(r => {
                chrome.storage.local.set({ proxyConfig, activeProxyId: proxyDetails.id }, r);
            });

            // 4. Apply proxy settings
            await new Promise((resolve, reject) => {
                chrome.proxy.settings.set({ value: chromeConfig, scope: 'regular' }, () => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve();
                    }
                });
            });

            return { success: true, proxyConfig };
        } catch (e) {
            console.error("[Proxy Service] connectProxy error:", e);
            ProxyAuthService.currentAuth = null;
            return { success: false, error: e.message };
        }
    }

    /**
     * Disables the proxy connection cleanly.
     */
    static async disableProxy() {
        try {
            if (!chrome.proxy || !chrome.proxy.settings) {
                throw new Error("Proxy API is not available.");
            }

            ProxyAuthService.currentAuth = null;

            await new Promise(r => {
                chrome.storage.local.set({ proxyConfig: { enabled: false }, activeProxyId: null }, r);
            });

            await new Promise((resolve, reject) => {
                chrome.proxy.settings.clear({ scope: 'regular' }, () => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve();
                    }
                });
            });

            return { success: true };
        } catch (e) {
            console.error("[Proxy Service] disableProxy error:", e);
            return { success: false, error: e.message };
        }
    }

    static async fetchIp() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            const response = await fetch('https://api.ipify.org?format=json', {
                signal: controller.signal,
                cache: 'no-store'
            });
            clearTimeout(timeoutId);
            if (response.ok) {
                const data = await response.json();
                return data.ip;
            }
            return null;
        } catch (e) {
            console.error("[Proxy Test Service] fetchIp error:", e);
            return null;
        }
    }

    /**
     * Performs direct-vs-proxy IP testing completely in background.
     */
    static async testProxy(proxyDetails) {
        const originalAuth = ProxyAuthService.currentAuth;

        // Retrieve original config synchronously by awaiting it
        const result = await new Promise(resolve => {
            chrome.storage.local.get(['proxyConfig'], resolve);
        });
        const originalConfig = result.proxyConfig;

        // Temporarily set credentials in memory for the test proxy
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
                let restoreChromeConfig;
                if (originalConfig.scheme === 'pac') {
                    restoreChromeConfig = {
                        mode: "pac_script",
                        pacScript: {
                            url: originalConfig.pacUrl
                        }
                    };
                } else {
                    const restoreBypassList = (originalConfig.bypass || '').split('\n').map(d => d.trim()).filter(Boolean);
                    restoreChromeConfig = {
                        mode: "pac_script",
                        pacScript: {
                            data: ProxyAuthService.buildPacScript(originalConfig.scheme, originalConfig.host, originalConfig.port, restoreBypassList),
                            mandatory: true
                        }
                    };
                }
                chrome.proxy.settings.set({ value: restoreChromeConfig, scope: 'regular' }, () => {
                    if (originalConfig.useAuth && originalConfig.username) {
                        ProxyAuthService.currentAuth = {
                            username: originalConfig.username,
                            password: originalConfig.password || ''
                        };
                    } else {
                        ProxyAuthService.currentAuth = null;
                    }
                });
            } else {
                chrome.proxy.settings.clear({ scope: 'regular' }, () => {
                    ProxyAuthService.currentAuth = null;
                });
            }
        };

        try {
            if (!chrome.proxy || !chrome.proxy.settings) {
                throw new Error("Proxy API is not available in extension context.");
            }

            // Clear proxy settings to measure the base direct IP
            await new Promise(r => chrome.proxy.settings.clear({ scope: 'regular' }, r));
            await new Promise(r => setTimeout(r, 200));
            const baseIp = await ProxyAuthService.fetchIp();

            // Apply test proxy settings
            let testChromeConfig;
            if (proxyDetails.scheme === 'pac') {
                testChromeConfig = {
                    mode: "pac_script",
                    pacScript: {
                        url: proxyDetails.pacUrl
                    }
                };
            } else {
                const bypassList = (proxyDetails.bypass || '').split('\n').map(d => d.trim()).filter(Boolean);
                const portInt = parseInt(proxyDetails.port);
                testChromeConfig = {
                    mode: "pac_script",
                    pacScript: {
                        data: ProxyAuthService.buildPacScript(proxyDetails.scheme, proxyDetails.host, portInt, bypassList),
                        mandatory: true
                    }
                };
            }

            await new Promise(r => chrome.proxy.settings.set({ value: testChromeConfig, scope: 'regular' }, r));
            await new Promise(r => setTimeout(r, 200));

            const startTime = performance.now();
            const returnedIp = await ProxyAuthService.fetchIp();
            const latency = Math.round(performance.now() - startTime);

            restoreSettings();

            if (!returnedIp) {
                return { success: false, error: "Không thể lấy IP qua Proxy (Kết nối lỗi hoặc sai thông tin xác thực)." };
            } else if (baseIp && returnedIp === baseIp) {
                // Returned IP matches base IP, meaning it fell back to DIRECT (auth failed)
                return { success: false, error: "Proxy bị lỗi hoặc không thể xác thực (bị fallback về IP thật)." };
            } else {
                return { success: true, latency };
            }
        } catch (e) {
            console.error("[Proxy Test Service] Error:", e);
            restoreSettings();
            return { success: false, error: e.message };
        }
    }
}
