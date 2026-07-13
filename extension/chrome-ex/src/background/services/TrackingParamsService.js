export class TrackingParamsService {
    static RULE_ID = 1001;
    static PARAMS = [
        "fbclid", "igshid", "gclid", "gclsrc", "dclid",
        "_ga", "_gl", "msclkid", "utm_source", "utm_medium",
        "utm_campaign", "utm_term", "utm_content", "utm_id",
        "mc_cid", "mc_eid", "yclid", "twclid", "ttclid",
        "_hsenc", "_hsmi", "web_id", "sender_device", "is_from_webapp"
    ];

    static async updateRules() {
        try {
            const res = await chrome.storage.local.get("removeTrackingParams");
            const isEnabled = res.removeTrackingParams === true;

            const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
            const ruleExists = existingRules.some(r => r.id === this.RULE_ID);

            const removeRuleIds = [];
            const addRules = [];

            if (ruleExists) {
                removeRuleIds.push(this.RULE_ID);
            }

            if (isEnabled) {
                addRules.push({
                    id: this.RULE_ID,
                    priority: 1,
                    action: {
                        type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
                        redirect: {
                            transform: {
                                queryTransform: {
                                    removeParams: this.PARAMS
                                }
                            }
                        }
                    },
                    condition: {
                        resourceTypes: [
                            chrome.declarativeNetRequest.ResourceType.MAIN_FRAME
                        ]
                    }
                });
                console.log("[KiGuard TrackingParams] Registered rule to strip tracking parameters.");
            } else {
                console.log("[KiGuard TrackingParams] Unregistered rule for tracking parameters.");
            }

            await chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds,
                addRules
            });
        } catch (err) {
            console.warn("[KiGuard TrackingParams] Error updating dynamic rules:", err);
        }
    }
}
