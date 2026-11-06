/**
 * KiGuard Anti-Clipboard Hijacking Module (Isolated Content Script)
 * 
 * Listens for hijack events dispatched by the MAIN-world interceptor
 * and presents an alert Toast notification showing original vs hijacked text.
 */

const ClipboardShield = {
    toastTimer: null,

    init() {
        chrome.storage.local.get(['antiClipboardHijack', 'globalEnabled'], (res) => {
            const isGlobal = res.globalEnabled !== false;
            const isShieldActive = res.antiClipboardHijack !== false;
            if (!isGlobal || !isShieldActive) return;

            // Listen for hijack alerts dispatched from MAIN world interceptor
            this.listenForEvents();
        });
    },

    listenForEvents() {
        document.addEventListener('__KIGUARD_CLIPBOARD_HIJACK__', (e) => {
            const detail = e.detail || {};
            if (detail.original && detail.hijacked) {
                this.showHijackToast(detail.original, detail.hijacked);
                
                // Log stat to background
                try {
                    chrome.runtime.sendMessage({ action: "logClipboardHijackBlocked" });
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

    truncate(str, max = 36) {
        if (!str) return '';
        if (str.length <= max) return str;
        return str.substring(0, max) + '...';
    },

    showHijackToast(original, hijacked) {
        let existing = document.getElementById('kiguard-clipboard-toast');
        if (existing) {
            existing.remove();
        }

        if (this.toastTimer) {
            clearTimeout(this.toastTimer);
        }

        const toast = document.createElement('div');
        toast.id = 'kiguard-clipboard-toast';
        toast.className = 'kiguard-clipboard-toast-box';

        const safeOriginal = this.escapeHtml(this.truncate(original, 40));
        const safeHijacked = this.escapeHtml(this.truncate(hijacked, 40));

        toast.innerHTML = `
            <div class="kiguard-clip-header">
                <div class="kiguard-clip-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                        <line x1="12" y1="11" x2="12" y2="15"></line>
                        <circle cx="12" cy="18" r="0.75" fill="currentColor"></circle>
                    </svg>
                </div>
                <div class="kiguard-clip-title-group">
                    <div class="kiguard-clip-title">Cảnh báo: Dữ liệu sao chép bị can thiệp!</div>
                    <div class="kiguard-clip-sub">Trang web này vừa cố gắng tráo đổi dữ liệu bạn đã sao chép. KiGuard đã tự động giữ lại nội dung gốc.</div>
                </div>
                <button class="kiguard-clip-close-btn" id="kiguard-clip-close" title="Đóng">&times;</button>
            </div>
            <div class="kiguard-clip-body">
                <div class="kiguard-clip-row">
                    <span class="kiguard-clip-label">Nội dung bạn chọn:</span>
                    <code class="kiguard-clip-val orig" title="${this.escapeHtml(original)}">${safeOriginal}</code>
                </div>
                <div class="kiguard-clip-row">
                    <span class="kiguard-clip-label">Dữ liệu định tráo:</span>
                    <code class="kiguard-clip-val fake" title="${this.escapeHtml(hijacked)}">${safeHijacked}</code>
                </div>
            </div>
            <div class="kiguard-clip-footer">
                <button class="kiguard-clip-btn primary" id="kiguard-clip-dismiss">Đã hiểu</button>
                <button class="kiguard-clip-btn secondary" id="kiguard-clip-allow">Vẫn dùng dữ liệu trang web</button>
            </div>
        `;

        (document.body || document.documentElement).appendChild(toast);

        // Bind events
        document.getElementById('kiguard-clip-close')?.addEventListener('click', () => this.dismissToast());
        document.getElementById('kiguard-clip-dismiss')?.addEventListener('click', () => this.dismissToast());
        
        document.getElementById('kiguard-clip-allow')?.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(hijacked);
            } catch (e) {}
            this.dismissToast();
        });

        // Auto dismiss after 8 seconds
        this.toastTimer = setTimeout(() => {
            this.dismissToast();
        }, 8000);
    },

    dismissToast() {
        if (this.toastTimer) {
            clearTimeout(this.toastTimer);
            this.toastTimer = null;
        }
        const toast = document.getElementById('kiguard-clipboard-toast');
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
