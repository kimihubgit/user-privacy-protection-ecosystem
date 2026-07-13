export class GpcService {
    static RULE_ID = 1002;

    static async updateScript() {
        try {
            const res = await chrome.storage.local.get("gpcEnabled");
            const isEnabled = res.gpcEnabled !== false;

            const scripts = await chrome.scripting.getRegisteredContentScripts();
            const hasScript = scripts.some(s => s.id === "gpc-script");

            const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
            const ruleExists = existingRules.some(r => r.id === GpcService.RULE_ID);

            const removeRuleIds = [];
            const addRules = [];

            if (ruleExists) {
                removeRuleIds.push(GpcService.RULE_ID);
            }

            if (isEnabled) {
                // 1. Register main world JS script
                if (!hasScript) {
                    await chrome.scripting.registerContentScripts([{
                        id: "gpc-script",
                        js: ["src/content/gpcWindowSetting.js"],
                        matches: ["<all_urls>"],
                        runAt: "document_start",
                        world: "MAIN"
                    }]);
                    console.log("[KiGuard GPC] Registered main world GPC script.");
                }

                // 2. Register declarativeNetRequest rule to modify request headers
                addRules.push({
                    id: GpcService.RULE_ID,
                    priority: 1,
                    action: {
                        type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
                        requestHeaders: [
                            {
                                operation: chrome.declarativeNetRequest.HeaderOperation.SET,
                                header: "sec-gpc",
                                value: "1"
                            },
                            {
                                operation: chrome.declarativeNetRequest.HeaderOperation.SET,
                                header: "dnt",
                                value: "1"
                            }
                        ]
                    },
                    condition: {
                        resourceTypes: [
                            chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
                            chrome.declarativeNetRequest.ResourceType.SUB_FRAME,
                            chrome.declarativeNetRequest.ResourceType.STYLESHEET,
                            chrome.declarativeNetRequest.ResourceType.SCRIPT,
                            chrome.declarativeNetRequest.ResourceType.IMAGE,
                            chrome.declarativeNetRequest.ResourceType.FONT,
                            chrome.declarativeNetRequest.ResourceType.OBJECT,
                            chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
                            chrome.declarativeNetRequest.ResourceType.PING,
                            chrome.declarativeNetRequest.ResourceType.CSP_REPORT,
                            chrome.declarativeNetRequest.ResourceType.MEDIA,
                            chrome.declarativeNetRequest.ResourceType.WEBSOCKET,
                            chrome.declarativeNetRequest.ResourceType.OTHER
                        ]
                    }
                });
                console.log("[KiGuard GPC] Registered dynamic DNR rule for GPC headers.");
            } else {
                // 1. Unregister main world JS script
                if (hasScript) {
                    await chrome.scripting.unregisterContentScripts({ ids: ["gpc-script"] });
                    console.log("[KiGuard GPC] Unregistered main world GPC script.");
                }
                console.log("[KiGuard GPC] Unregistered dynamic DNR rule for GPC headers.");
            }

            await chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds,
                addRules
            });
        } catch (err) {
            console.warn("[KiGuard GPC] Error updating GPC configurations:", err);
        }
    }
}

