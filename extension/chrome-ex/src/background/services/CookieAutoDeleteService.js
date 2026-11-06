/**
 * CookieAutoDeleteService.js
 * High-performance Cookie Auto-Delete Service for KiGuard Extension.
 * Provides auto-deletion on tab close, domain change, cookie aging, scheduled cleanup,
 * whitelist/greylist management, and deletion logging.
 */

export class CookieAutoDeleteService {
    static ALARM_AGING = "cad_cookie_aging_check";
    static ALARM_SCHEDULED = "cad_scheduled_cleanup";

    static tabDomains = {};

    static async init() {
        console.log("[KiGuard CookieAutoDelete] Initializing CookieAutoDeleteService...");

        // Setup event listeners
        chrome.tabs.onRemoved.addListener((tabId, removeInfo) => this.handleTabRemoved(tabId, removeInfo));
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => this.handleTabUpdated(tabId, changeInfo, tab));
        chrome.alarms.onAlarm.addListener((alarm) => this.handleAlarm(alarm));

        // Rebuild open tab tracking map
        await this.rebuildTabTracking();

        // Setup scheduled alarms
        await this.setupAlarms();

        // Startup cleanup if enabled
        const res = await chrome.storage.local.get(["cad_deleteOnStartup", "cad_enabled"]);
        if (res.cad_enabled === true && res.cad_deleteOnStartup === true) {
            await this.cleanAllNonWhitelisted("startup");
        }
    }

    // Extract domain helper
    static extractDomain(urlStr) {
        if (!urlStr) return "";
        try {
            const parsed = new URL(urlStr);
            if (parsed.protocol === "chrome:" || parsed.protocol === "chrome-extension:" || parsed.protocol === "about:") {
                return "";
            }
            return parsed.hostname.toLowerCase();
        } catch {
            return "";
        }
    }

    static getBaseDomain(domain) {
        if (!domain) return "";
        const parts = domain.split(".");
        if (parts.length <= 2) return domain;
        // Basic second level domain handling
        return parts.slice(-2).join(".");
    }

    // Tab tracking
    static async rebuildTabTracking() {
        try {
            const tabs = await chrome.tabs.query({});
            this.tabDomains = {};
            tabs.forEach(tab => {
                const domain = this.extractDomain(tab.url);
                if (domain) {
                    this.tabDomains[tab.id] = domain;
                }
            });
        } catch (err) {
            console.warn("[KiGuard CookieAutoDelete] Error rebuilding tab tracking:", err);
        }
    }

    static async isDomainOpenInOtherTabs(domain, excludeTabId) {
        try {
            const tabs = await chrome.tabs.query({});
            const targetBase = this.getBaseDomain(domain);
            for (const tab of tabs) {
                if (tab.id === excludeTabId) continue;
                const tabDomain = this.extractDomain(tab.url);
                if (tabDomain && this.getBaseDomain(tabDomain) === targetBase) {
                    return true;
                }
            }
        } catch {}
        return false;
    }

    // Check Whitelist & Greylist
    static async isDomainProtected(domain) {
        if (!domain) return true;
        try {
            const res = await chrome.storage.local.get(["cad_whitelist", "cad_greylist"]);
            const whitelist = res.cad_whitelist || [];
            const greylist = res.cad_greylist || [];

            const isMatch = (list) => list.some(item => {
                if (typeof item === 'string') {
                    return domain === item || domain.endsWith('.' + item);
                }
                const d = item.domain;
                if (!d) return false;
                if (item.includeSubdomains) {
                    return domain === d || domain.endsWith('.' + d);
                }
                return domain === d;
            });

            return isMatch(whitelist) || isMatch(greylist);
        } catch {
            return false;
        }
    }

    // Core Cookie Deletion for a specific Domain
    static async deleteCookiesForDomain(domain, reason = "tab_close") {
        if (!domain) return 0;
        try {
            const isProtected = await this.isDomainProtected(domain);
            if (isProtected) {
                console.log(`[KiGuard CookieAutoDelete] Domain ${domain} is protected. Skipping deletion.`);
                return 0;
            }

            const resSettings = await chrome.storage.local.get(["cad_keepSessionCookies"]);
            const keepSession = resSettings.cad_keepSessionCookies === true;

            const baseDomain = this.getBaseDomain(domain);
            const allCookies = await chrome.cookies.getAll({});
            
            const targetCookies = allCookies.filter(cookie => {
                const cDomain = cookie.domain.startsWith(".") ? cookie.domain.substring(1) : cookie.domain;
                return cDomain === domain || cDomain === baseDomain || domain.endsWith("." + cDomain);
            });

            let deletedCount = 0;
            const logEntries = [];

            for (const cookie of targetCookies) {
                if (keepSession && cookie.session) {
                    continue;
                }

                const protocol = cookie.secure ? "https://" : "http://";
                const cleanDomain = cookie.domain.startsWith(".") ? cookie.domain.substring(1) : cookie.domain;
                const url = protocol + cleanDomain + cookie.path;

                try {
                    await chrome.cookies.remove({
                        url: url,
                        name: cookie.name,
                        storeId: cookie.storeId
                    });
                    deletedCount++;

                    logEntries.push({
                        timestamp: Date.now(),
                        domain: domain,
                        cookieName: cookie.name,
                        cookieDomain: cookie.domain,
                        path: cookie.path,
                        reason: reason
                    });
                } catch (e) {
                    console.warn(`[KiGuard CookieAutoDelete] Failed to remove cookie ${cookie.name}:`, e);
                }
            }

            if (deletedCount > 0) {
                await this.logDeletions(logEntries);
                await this.incrementStats(deletedCount);
                console.log(`[KiGuard CookieAutoDelete] Deleted ${deletedCount} cookies for ${domain} (Reason: ${reason})`);
            }

            return deletedCount;
        } catch (err) {
            console.error(`[KiGuard CookieAutoDelete] Error deleting cookies for ${domain}:`, err);
            return 0;
        }
    }

    // Clean all non-whitelisted cookies
    static async cleanAllNonWhitelisted(reason = "manual") {
        try {
            const allCookies = await chrome.cookies.getAll({});
            const resSettings = await chrome.storage.local.get(["cad_keepSessionCookies"]);
            const keepSession = resSettings.cad_keepSessionCookies === true;

            let deletedCount = 0;
            const logEntries = [];

            for (const cookie of allCookies) {
                if (keepSession && cookie.session) {
                    continue;
                }

                const cleanDomain = cookie.domain.startsWith(".") ? cookie.domain.substring(1) : cookie.domain;
                const isProtected = await this.isDomainProtected(cleanDomain);

                if (!isProtected) {
                    const protocol = cookie.secure ? "https://" : "http://";
                    const url = protocol + cleanDomain + cookie.path;

                    try {
                        await chrome.cookies.remove({
                            url: url,
                            name: cookie.name,
                            storeId: cookie.storeId
                        });
                        deletedCount++;

                        logEntries.push({
                            timestamp: Date.now(),
                            domain: cleanDomain,
                            cookieName: cookie.name,
                            cookieDomain: cookie.domain,
                            path: cookie.path,
                            reason: reason
                        });
                    } catch {}
                }
            }

            if (deletedCount > 0) {
                await this.logDeletions(logEntries);
                await this.incrementStats(deletedCount);
            }

            return deletedCount;
        } catch (err) {
            console.error("[KiGuard CookieAutoDelete] Error cleaning all non-whitelisted cookies:", err);
            return 0;
        }
    }

    // Log deletions to local storage
    static async logDeletions(newEntries) {
        if (!newEntries || newEntries.length === 0) return;
        try {
            const res = await chrome.storage.local.get(["cad_deletionLogs"]);
            const logs = res.cad_deletionLogs || [];
            // Keep last 200 log entries
            const updated = [...newEntries, ...logs].slice(0, 200);
            await chrome.storage.local.set({ cad_deletionLogs: updated });
        } catch (err) {
            console.warn("[KiGuard CookieAutoDelete] Error writing deletion log:", err);
        }
    }

    // Stats accumulator
    static async incrementStats(count) {
        if (count <= 0) return;
        try {
            const res = await chrome.storage.local.get(["cad_totalDeletedCount"]);
            const current = res.cad_totalDeletedCount || 0;
            await chrome.storage.local.set({ cad_totalDeletedCount: current + count });
        } catch {}
    }

    // Event: Tab Removed
    static async handleTabRemoved(tabId, removeInfo) {
        const domain = this.tabDomains[tabId];
        delete this.tabDomains[tabId];

        if (!domain) return;

        const res = await chrome.storage.local.get(["globalEnabled", "cad_enabled", "cad_deleteOnTabClose", "cad_cleanDelaySeconds"]);
        if (res.globalEnabled === false || res.cad_enabled !== true || res.cad_deleteOnTabClose !== true) {
            return;
        }

        const isOpenElsewhere = await this.isDomainOpenInOtherTabs(domain, tabId);
        if (isOpenElsewhere) {
            console.log(`[KiGuard CookieAutoDelete] Tab closed for ${domain}, but domain is active in other tabs.`);
            return;
        }

        const delay = parseInt(res.cad_cleanDelaySeconds || 0, 10);
        if (delay > 0) {
            const alarmName = `cad_delete_${domain}_${Date.now()}`;
            await chrome.alarms.create(alarmName, { delayInMinutes: Math.max(delay / 60, 0.1) });
            console.log(`[KiGuard CookieAutoDelete] Scheduled delayed deletion for ${domain} in ${delay}s`);
        } else {
            await this.deleteCookiesForDomain(domain, "tab_close");
        }
    }

    // Event: Tab Updated
    static async handleTabUpdated(tabId, changeInfo, tab) {
        if (changeInfo.status !== "complete" || !tab.url) return;

        const newDomain = this.extractDomain(tab.url);
        const oldDomain = this.tabDomains[tabId];
        this.tabDomains[tabId] = newDomain;

        if (!oldDomain || oldDomain === newDomain) return;

        const res = await chrome.storage.local.get(["globalEnabled", "cad_enabled", "cad_deleteOnDomainChange"]);
        if (res.globalEnabled === false || res.cad_enabled !== true || res.cad_deleteOnDomainChange !== true) {
            return;
        }

        const isOpenElsewhere = await this.isDomainOpenInOtherTabs(oldDomain, tabId);
        if (!isOpenElsewhere) {
            await this.deleteCookiesForDomain(oldDomain, "domain_change");
        }
    }

    // Alarms handler
    static async handleAlarm(alarm) {
        if (!alarm || !alarm.name) return;

        if (alarm.name.startsWith("cad_delete_")) {
            // Alarm format: cad_delete_{domain}_{timestamp}
            const parts = alarm.name.split("_");
            if (parts.length >= 3) {
                const domain = parts[2];
                const isOpen = await this.isDomainOpenInOtherTabs(domain, -1);
                if (!isOpen) {
                    await this.deleteCookiesForDomain(domain, "delayed_tab_close");
                }
            }
        } else if (alarm.name === this.ALARM_AGING) {
            await this.handleCookieAgingCheck();
        } else if (alarm.name === this.ALARM_SCHEDULED) {
            await this.cleanAllNonWhitelisted("scheduled_cleanup");
        }
    }

    // Setup recurring alarms
    static async setupAlarms() {
        try {
            const res = await chrome.storage.local.get([
                "cad_enableCookieAging", 
                "cad_enableScheduledCleanup", 
                "cad_scheduledCleanupInterval"
            ]);

            // Cookie aging alarm
            await chrome.alarms.clear(this.ALARM_AGING);
            if (res.cad_enableCookieAging === true) {
                await chrome.alarms.create(this.ALARM_AGING, { periodInMinutes: 60 });
            }

            // Scheduled cleanup alarm
            await chrome.alarms.clear(this.ALARM_SCHEDULED);
            if (res.cad_enableScheduledCleanup === true) {
                const interval = parseInt(res.cad_scheduledCleanupInterval || 60, 10);
                await chrome.alarms.create(this.ALARM_SCHEDULED, { periodInMinutes: interval });
            }
        } catch (err) {
            console.warn("[KiGuard CookieAutoDelete] Error setting up alarms:", err);
        }
    }

    // Cookie Aging
    static async handleCookieAgingCheck() {
        try {
            const res = await chrome.storage.local.get(["globalEnabled", "cad_enabled", "cad_enableCookieAging", "cad_cookieMaxAgeHours", "cad_cookieTracker"]);
            if (res.globalEnabled === false || res.cad_enabled !== true || res.cad_enableCookieAging !== true) return;

            const maxHours = parseInt(res.cad_cookieMaxAgeHours || 24, 10);
            const maxAgeMs = maxHours * 60 * 60 * 1000;
            const cutoffTime = Date.now() - maxAgeMs;

            const allCookies = await chrome.cookies.getAll({});
            const tracker = res.cad_cookieTracker || {};
            let dirty = false;
            let deletedCount = 0;
            const logEntries = [];

            for (const cookie of allCookies) {
                const cleanDomain = cookie.domain.startsWith(".") ? cookie.domain.substring(1) : cookie.domain;
                const isProtected = await this.isDomainProtected(cleanDomain);
                if (isProtected) continue;

                const cookieKey = `${cookie.domain}:${cookie.name}:${cookie.path}`;
                if (!tracker[cookieKey]) {
                    tracker[cookieKey] = Date.now();
                    dirty = true;
                    continue;
                }

                if (tracker[cookieKey] < cutoffTime) {
                    const protocol = cookie.secure ? "https://" : "http://";
                    const url = protocol + cleanDomain + cookie.path;
                    try {
                        await chrome.cookies.remove({
                            url: url,
                            name: cookie.name,
                            storeId: cookie.storeId
                        });
                        deletedCount++;
                        delete tracker[cookieKey];
                        dirty = true;

                        logEntries.push({
                            timestamp: Date.now(),
                            domain: cleanDomain,
                            cookieName: cookie.name,
                            cookieDomain: cookie.domain,
                            path: cookie.path,
                            reason: "cookie_aging"
                        });
                    } catch {}
                }
            }

            if (dirty) {
                await chrome.storage.local.set({ cad_cookieTracker: tracker });
            }

            if (deletedCount > 0) {
                await this.logDeletions(logEntries);
                await this.incrementStats(deletedCount);
                console.log(`[KiGuard CookieAutoDelete] Cookie aging cleaned ${deletedCount} aged cookies.`);
            }
        } catch (err) {
            console.error("[KiGuard CookieAutoDelete] Cookie aging error:", err);
        }
    }
}
