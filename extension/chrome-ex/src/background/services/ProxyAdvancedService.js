/**
 * ProxyAdvancedService.js
 * Quản lý các cài đặt Proxy nâng cao như bảo vệ rò rỉ WebRTC ở background.
 */
export class ProxyAdvancedService {
    static init() {
        ProxyAdvancedService.updateWebRTCPolicy();
        ProxyAdvancedService.updateUserAgentRule();
        ProxyAdvancedService.listenChanges();
    }

    static listenChanges() {
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (changes.proxyConfig || changes.proxyAdvancedSettings) {
                ProxyAdvancedService.updateWebRTCPolicy();
                ProxyAdvancedService.updateUserAgentRule();
            }
        });
    }

    static updateWebRTCPolicy() {
        if (!chrome.privacy || !chrome.privacy.network || !chrome.privacy.network.webRTCIPHandlingPolicy) {
            console.warn("[ProxyAdvancedService] Privacy API or webRTCIPHandlingPolicy not available.");
            return;
        }

        chrome.storage.local.get(['proxyConfig', 'proxyAdvancedSettings'], (result) => {
            const config = result.proxyConfig;
            const advSettings = result.proxyAdvancedSettings;

            if (config && config.enabled && advSettings && advSettings.webrtcEnabled) {
                let policy = advSettings.webrtcPolicy || 'disable_non_proxied_udp';
                // Chrome doesn't support 'block_entirely' as a native privacy policy value.
                // We map it to 'disable_non_proxied_udp' natively and block RTCPeerConnection in JS.
                if (policy === 'block_entirely') {
                    policy = 'disable_non_proxied_udp';
                }
                chrome.privacy.network.webRTCIPHandlingPolicy.set({
                    value: policy
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.error("[ProxyAdvancedService] Error setting WebRTC policy:", chrome.runtime.lastError);
                    } else {
                        console.log(`[ProxyAdvancedService] WebRTC IP policy set to: ${policy}`);
                    }
                });
            } else {
                chrome.privacy.network.webRTCIPHandlingPolicy.clear({}, () => {
                    if (chrome.runtime.lastError) {
                        console.error("[ProxyAdvancedService] Error clearing WebRTC policy:", chrome.runtime.lastError);
                    } else {
                        console.log("[ProxyAdvancedService] WebRTC IP policy cleared (restored to default).");
                    }
                });
            }
        });
    }

    static updateUserAgentRule() {
        if (!chrome.declarativeNetRequest) {
            console.warn("[ProxyAdvancedService] declarativeNetRequest API not available.");
            return;
        }

        chrome.storage.local.get(['proxyConfig', 'proxyAdvancedSettings'], (result) => {
            const config = result.proxyConfig;
            const advSettings = result.proxyAdvancedSettings;

            const ruleId = 150;

            if (config && config.enabled && advSettings && advSettings.uaEnabled && advSettings.userAgent) {
                const uaValue = advSettings.userAgent;
                const resourceTypes = [
                    "main_frame",
                    "sub_frame",
                    "stylesheet",
                    "script",
                    "image",
                    "font",
                    "object",
                    "xmlhttprequest",
                    "ping",
                    "csp_report",
                    "media",
                    "websocket",
                    "webtransport",
                    "webbundle",
                    "other"
                ];

                const rule = {
                    id: ruleId,
                    priority: 110,
                    action: {
                        type: "modifyHeaders",
                        requestHeaders: [
                            {
                                header: "User-Agent",
                                operation: "set",
                                value: uaValue
                            }
                        ]
                    },
                    condition: {
                        urlFilter: "*",
                        resourceTypes: resourceTypes
                    }
                };

                chrome.declarativeNetRequest.updateDynamicRules({
                    removeRuleIds: [ruleId],
                    addRules: [rule]
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.error("[ProxyAdvancedService] Error setting UA rule:", chrome.runtime.lastError);
                    } else {
                        console.log("[ProxyAdvancedService] Custom User-Agent rule registered:", uaValue);
                    }
                });
            } else {
                chrome.declarativeNetRequest.updateDynamicRules({
                    removeRuleIds: [ruleId]
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.error("[ProxyAdvancedService] Error clearing UA rule:", chrome.runtime.lastError);
                    } else {
                        console.log("[ProxyAdvancedService] Custom User-Agent rule cleared.");
                    }
                });
            }
        });
    }
}
