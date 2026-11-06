/**
 * KiGuard Anti-Popup & Popunder Shield (Isolated Content Script)
 * 
 * Listens for blocked popup events dispatched by the MAIN-world interceptor
 * and presents a non-intrusive warning Toast notification to the user.
 */

const PopupBlockShield = {
    toastTimer: null,

    init() {
        chrome.storage.local.get(['popupBlockShieldActive', 'globalEnabled'], (res) => {
            const isGlobal = res.globalEnabled !== false;
            const isShieldActive = res.popupBlockShieldActive !== false;
            if (!isGlobal || !isShieldActive) return;

            // Listen for blocked popup events dispatched by MAIN world interceptor
            this.listenForEvents();
        });
    },

    listenForEvents() {
        document.addEventListener('__KIGUARD_POPUP_BLOCKED__', (e) => {
            const detail = e.detail || {};
            if (detail.url) {
                this.showBlockedToast(detail.url, detail.domain, detail.reason);

                // Increment stat in background
                try {
                    chrome.runtime.sendMessage({ action: "logPopupBlocked" });
                } catch (err) {}
            }
        });
    },

    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },

    truncate(str, max = 35) {
        if (!str) return '';
        if (str.length <= max) return str;
        return str.substring(0, max) + '...';
    },

    showBlockedToast(url, domain, reason) {
        let existing = document.getElementById('kiguard-popup-toast');
        if (existing) {
            existing.remove();
        }

        if (this.toastTimer) {
            clearTimeout(this.toastTimer);
        }

        const toast = document.createElement('div');
        toast.id = 'kiguard-popup-toast';
        toast.className = 'kiguard-popup-toast-box';

        const safeDomain = this.escapeHtml(this.truncate(domain || 'Trang ngoài', 35));
        const safeReason = this.escapeHtml(reason || 'Pop-up tự mở ngầm');

        toast.innerHTML = `
            <div class="kiguard-pop-header">
                <div class="kiguard-pop-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                    </svg>
                </div>
                <div class="kiguard-pop-title-group">
                    <div class="kiguard-pop-title">Đã chặn 1 Pop-up tự mở ngầm</div>
                    <div class="kiguard-pop-sub">Trang web vừa cố ý mở một tab mới: <strong>${safeDomain}</strong></div>
                </div>
                <button class="kiguard-pop-close-btn" id="kiguard-pop-close" title="Đóng">&times;</button>
            </div>
            <div class="kiguard-pop-body">
                <span class="kiguard-pop-tag">${safeReason}</span>
            </div>
            <div class="kiguard-pop-footer">
                <button class="kiguard-pop-btn primary" id="kiguard-pop-dismiss">Bỏ qua</button>
                <button class="kiguard-pop-btn secondary" id="kiguard-pop-allow">Vẫn mở tab này</button>
            </div>
        `;

        (document.body || document.documentElement).appendChild(toast);

        // Bind events
        document.getElementById('kiguard-pop-close')?.addEventListener('click', () => this.dismissToast());
        document.getElementById('kiguard-pop-dismiss')?.addEventListener('click', () => this.dismissToast());

        document.getElementById('kiguard-pop-allow')?.addEventListener('click', () => {
            try {
                window.open(url, '_blank', 'noopener,noreferrer');
            } catch (e) {}
            this.dismissToast();
        });

        // Auto dismiss after 7 seconds
        this.toastTimer = setTimeout(() => {
            this.dismissToast();
        }, 7000);
    },

    dismissToast() {
        if (this.toastTimer) {
            clearTimeout(this.toastTimer);
            this.toastTimer = null;
        }
        const toast = document.getElementById('kiguard-popup-toast');
        if (toast) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            toast.style.transition = 'all 0.2s ease';
            setTimeout(() => {
                toast.remove();
            }, 200);
        }
    }
};
