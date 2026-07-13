const ClickjackingShield = {
    flaggedPairs: [],
    isListeningToEvents: false,

    init() {
        chrome.storage.local.get(['anti_clickjacking'], (result) => {
            if (result.anti_clickjacking !== false) {
                // 1. Detect cross-origin framing
                this.detectFraming();

                // 2. Scan and monitor elements for clickjacking patterns (invisible overlays)
                if (window.self === window.top) {
                    if (document.readyState === 'loading') {
                        document.addEventListener('DOMContentLoaded', () => {
                            this.scanForInvisibleIframes();
                            this.observeDomForIframes();
                        });
                    } else {
                        this.scanForInvisibleIframes();
                        this.observeDomForIframes();
                    }
                }
            }
        });
    },

    detectFraming() {
        if (window.self !== window.top) {
            try {
                const topHost = window.top.location.host;
            } catch (e) {
                console.warn("[KiGuard Clickjacking] Cross-origin framing detected. Show framing alert.");
                this.showFramingWarning();
            }
        }
    },

    showFramingWarning() {
        if (document.getElementById('kiguard-framing-warning-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'kiguard-framing-warning-overlay';
        overlay.innerHTML = `
            <div class="kiguard-framing-box">
                <div class="kiguard-framing-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                </div>
                <h3>Cảnh Báo Clickjacking!</h3>
                <p>
                    Trang web này đang bị nhúng (frame) trái phép bởi một bên thứ ba. 
                    Các lượt click chuột hoặc thao tác bàn phím của bạn có thể bị cướp hoặc theo dõi.
                </p>
                <div class="kiguard-framing-actions">
                    <button id="kiguard-framing-bust-btn" class="kiguard-btn primary">Mở trong tab mới an toàn</button>
                    <button id="kiguard-framing-ignore-btn" class="kiguard-btn secondary">Bỏ qua cảnh báo</button>
                </div>
            </div>
        `;

        document.documentElement.appendChild(overlay);

        document.getElementById('kiguard-framing-bust-btn').addEventListener('click', () => {
            try {
                window.top.location.href = window.location.href;
            } catch (e) {
                window.open(window.location.href, '_blank');
            }
        });

        document.getElementById('kiguard-framing-ignore-btn').addEventListener('click', () => {
            overlay.remove();
        });
    },

    scanForInvisibleIframes() {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            if (iframe.dataset.kiguardFlagged) return;

            try {
                const rect = iframe.getBoundingClientRect();
                if (rect.width < 10 || rect.height < 10) return;

                const style = window.getComputedStyle(iframe);
                const opacity = parseFloat(style.opacity);
                const visibility = style.visibility;
                const display = style.display;
                const pointerEvents = style.pointerEvents;

                if (opacity < 0.1 && visibility !== 'hidden' && display !== 'none' && pointerEvents !== 'none') {
                    console.warn("[KiGuard Clickjacking] Suspicious invisible iframe detected:", iframe);
                    this.flagSuspiciousIframe(iframe, rect);
                }
            } catch (e) {
                // Ignore errors
            }
        });
    },

    flagSuspiciousIframe(iframe, rect) {
        iframe.dataset.kiguardFlagged = "true";

        iframe.style.setProperty('opacity', '0.75', 'important');
        iframe.style.setProperty('border', '3px dashed #ef4444', 'important');
        iframe.style.setProperty('background-color', 'rgba(239, 68, 68, 0.05)', 'important');

        const warningLabel = document.createElement('div');
        warningLabel.className = 'kiguard-clickjacking-warning';
        warningLabel.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 12px; height: 12px; margin-right: 4px; display: inline-block; vertical-align: middle;">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>Phát hiện Iframe ẩn (Clickjacking Risk)</span>
        `;

        this.positionLabel(iframe, warningLabel, rect);
        document.body.appendChild(warningLabel);

        this.flaggedPairs.push({ iframe, warningLabel });
        this.setupGlobalListeners();
    },

    positionLabel(iframe, warningLabel, cachedRect = null) {
        try {
            const rect = cachedRect || iframe.getBoundingClientRect();
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            warningLabel.style.left = `${rect.left + scrollLeft + 4}px`;
            warningLabel.style.top = `${rect.top + scrollTop + 4}px`;
        } catch (e) {
            // Ignore position error
        }
    },

    setupGlobalListeners() {
        if (this.isListeningToEvents) return;
        this.isListeningToEvents = true;

        const updateAllPositions = () => {
            this.flaggedPairs = this.flaggedPairs.filter(pair => {
                if (!pair.iframe.isConnected || !pair.warningLabel.isConnected) {
                    if (pair.warningLabel.isConnected) {
                        pair.warningLabel.remove();
                    }
                    return false;
                }
                this.positionLabel(pair.iframe, pair.warningLabel);
                return true;
            });
        };

        window.addEventListener('scroll', updateAllPositions, { passive: true });
        window.addEventListener('resize', updateAllPositions, { passive: true });

        // Run a slower periodic cleanup and position sync (every 4 seconds) to handle dynamic layout shifts not covered by scroll/resize
        setInterval(updateAllPositions, 4000);
    },

    observeDomForIframes() {
        const observer = new MutationObserver((mutations) => {
            let shouldScan = false;
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeName === 'IFRAME' || (node.querySelectorAll && node.querySelectorAll('iframe').length > 0)) {
                            shouldScan = true;
                            break;
                        }
                    }
                }
                if (shouldScan) break;
            }
            if (shouldScan) {
                setTimeout(() => this.scanForInvisibleIframes(), 100);
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }
};
