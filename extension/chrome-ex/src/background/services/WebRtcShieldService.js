/**
 * WebRtcShieldService.js
 * 
 * Protects users against WebRTC IP leakage (both private LAN IPs and real ISP IPs)
 * using Chrome's native privacy network API and content script hooks.
 */

export class WebRtcShieldService {
    static init() {
        WebRtcShieldService.updatePolicy();
        WebRtcShieldService.listenChanges();
    }

    static listenChanges() {
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace !== 'local') return;
            if (changes.webrtcShieldActive || changes.webrtcPolicy || changes.proxyConfig || changes.proxyAdvancedSettings) {
                WebRtcShieldService.updatePolicy();
            }
        });
    }

    static updatePolicy() {
        if (!chrome.privacy || !chrome.privacy.network || !chrome.privacy.network.webRTCIPHandlingPolicy) {
            console.warn("[WebRtcShieldService] chrome.privacy.network.webRTCIPHandlingPolicy not available.");
            return;
        }

        chrome.storage.local.get(['webrtcShieldActive', 'webrtcPolicy', 'proxyConfig', 'proxyAdvancedSettings'], (res) => {
            const isStandaloneActive = res.webrtcShieldActive !== false; // Default: active
            const proxyConfig = res.proxyConfig;
            const advSettings = res.proxyAdvancedSettings;
            const isProxyWebRtcActive = Boolean(proxyConfig && proxyConfig.enabled && advSettings && advSettings.webrtcEnabled);

            const shouldProtect = isStandaloneActive || isProxyWebRtcActive;

            if (shouldProtect) {
                // If proxy is active or strict policy selected, disable non-proxied UDP completely
                let targetPolicy = 'default_public_interface_only';
                if (isProxyWebRtcActive || res.webrtcPolicy === 'disable_non_proxied_udp') {
                    targetPolicy = 'disable_non_proxied_udp';
                }

                chrome.privacy.network.webRTCIPHandlingPolicy.set({
                    value: targetPolicy
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.error("[WebRtcShieldService] Failed to set WebRTC policy:", chrome.runtime.lastError.message);
                    } else {
                        console.log(`[WebRtcShieldService] WebRTC IP protection active: ${targetPolicy}`);
                    }
                });
            } else {
                chrome.privacy.network.webRTCIPHandlingPolicy.clear({}, () => {
                    if (chrome.runtime.lastError) {
                        console.error("[WebRtcShieldService] Failed to clear WebRTC policy:", chrome.runtime.lastError.message);
                    } else {
                        console.log("[WebRtcShieldService] WebRTC IP protection cleared (restored default).");
                    }
                });
            }
        });
    }
}

