/**
 * ReportService.js
 * 
 * Handles crowdsourced scam reporting from context menus and popup UI.
 * Submits reports to KiGuard Backend Auth (/api/v1/reports) and queues offline reports if needed.
 */

import { CONFIG } from '../../config.js';

export class ReportService {
    static init() {
        ReportService.createContextMenu();
        ReportService.listenContextMenu();
        ReportService.listenMessages();
    }

    static createContextMenu() {
        chrome.contextMenus.create({
            id: "report-scam-page",
            title: "🚩 Báo cáo trang này là lừa đảo (KiGuard)",
            contexts: ["page", "link"]
        }, () => {
            if (chrome.runtime.lastError) {
                // Ignore duplicate menu item errors on reload
            }
        });
    }

    static listenContextMenu() {
        chrome.contextMenus.onClicked.addListener((info, tab) => {
            if (info.menuItemId === "report-scam-page") {
                const targetUrl = info.linkUrl || info.pageUrl || (tab && tab.url);
                if (!targetUrl || targetUrl.startsWith('chrome://') || targetUrl.startsWith('chrome-extension://')) {
                    ReportService.showNotification('Không thể báo cáo', 'Trang nội bộ trình duyệt không thể báo cáo.');
                    return;
                }

                let domain = '';
                try {
                    domain = new URL(targetUrl).hostname;
                } catch (e) {
                    domain = targetUrl;
                }

                ReportService.submitReport({
                    url: targetUrl,
                    domain: domain,
                    title: `Báo cáo nghi vấn lừa đảo: ${domain}`,
                    detail: `Người dùng gửi báo cáo 1-Click từ Context Menu trên trang ${tab && tab.title ? tab.title : domain}`
                }).then(result => {
                    if (result.success) {
                        ReportService.showNotification(
                            'Đã gửi báo cáo thành công! 🚩',
                            `Cảm ơn bạn! Báo cáo về "${domain}" đã được chuyển tới hệ thống AI và kiểm duyệt viên.`
                        );
                    } else {
                        ReportService.showNotification(
                            'Báo cáo đã được lưu',
                            `Báo cáo về "${domain}" đã được lưu vào hàng đợi và sẽ tự động gửi khi có kết nối.`
                        );
                    }
                });
            }
        });
    }

    static listenMessages() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request && request.action === "SUBMIT_SCAM_REPORT") {
                ReportService.submitReport(request.data)
                    .then(res => sendResponse(res))
                    .catch(err => sendResponse({ success: false, error: err.message }));
                return true; // Keep channel open for async response
            }
        });
    }

    static async submitReport({ url, domain, title, detail, reason, reporterEmail }) {
        if (!domain && url) {
            try {
                domain = new URL(url).hostname;
            } catch (e) {
                domain = url;
            }
        }

        const payload = {
            type: 1, // 1: URL report
            reporter: {
                name: "KiGuard Community User",
                role: "visitor",
                contact: [
                    { type: "email", value: reporterEmail || "community@kiguard.local" }
                ]
            },
            raw: {
                title: title || `Báo cáo website nghi vấn: ${domain}`,
                url: url || `https://${domain}`,
                domain: domain,
                detail: detail || reason || "Báo cáo nhanh từ tiện ích KiGuard"
            }
        };

        const apiUrl = CONFIG.REPORT_API_URL || "http://localhost:8081/api/v1/reports";

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                console.log("[ReportService] Report successfully submitted:", data);
                return { success: true, data };
            } else {
                console.warn("[ReportService] Server rejected report with status:", response.status);
                // Save to local retry queue
                await ReportService.queueOfflineReport(payload);
                return { success: false, queued: true, error: `HTTP ${response.status}` };
            }
        } catch (error) {
            console.warn("[ReportService] Network error sending report, queuing locally:", error.message);
            await ReportService.queueOfflineReport(payload);
            return { success: false, queued: true, error: error.message };
        }
    }

    static async queueOfflineReport(reportPayload) {
        try {
            const data = await chrome.storage.local.get(['pendingReports']);
            const list = Array.isArray(data.pendingReports) ? data.pendingReports : [];
            list.push({ ...reportPayload, timestamp: Date.now() });
            // Keep at most 50 queued reports
            if (list.length > 50) list.shift();
            await chrome.storage.local.set({ pendingReports: list });
        } catch (e) {}
    }

    static showNotification(title, message) {
        try {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: chrome.runtime.getURL('assets/icons/ki64o.png'),
                title: title,
                message: message
            });
        } catch (e) {
            console.log(`[Notification] ${title}: ${message}`);
        }
    }
}

