/**
 * Content script module for KiGuard Auto Translation.
 * Listens to word highlight/selection and triggers background translations.
 */

const TranslateShield = {
    active: false,
    tooltip: null,
    styleElement: null,

    init() {
        chrome.storage.local.get("autoTranslateActive", (res) => {
            const isEnabled = res.autoTranslateActive === true;
            if (isEnabled) {
                TranslateShield.enable();
            }
        });

        chrome.storage.onChanged.addListener((changes) => {
            if (changes.autoTranslateActive) {
                const isEnabled = changes.autoTranslateActive.newValue === true;
                if (isEnabled) {
                    TranslateShield.enable();
                } else {
                    TranslateShield.disable();
                }
            }
        });
    },

    enable() {
        if (TranslateShield.active) return;
        TranslateShield.active = true;
        TranslateShield.injectStyles();
        document.addEventListener('mouseup', TranslateShield.handleMouseUp);
        document.addEventListener('mousedown', TranslateShield.handleMouseDown);
    },

    disable() {
        if (!TranslateShield.active) return;
        TranslateShield.active = false;
        document.removeEventListener('mouseup', TranslateShield.handleMouseUp);
        document.removeEventListener('mousedown', TranslateShield.handleMouseDown);
        TranslateShield.removeTooltip();
        if (TranslateShield.styleElement) {
            TranslateShield.styleElement.remove();
            TranslateShield.styleElement = null;
        }
    },

    injectStyles() {
        if (TranslateShield.styleElement) return;
        const style = document.createElement('style');
        style.id = 'kiguard-translate-styles';
        style.textContent = `
            .kiguard-tr-tooltip {
                position: absolute;
                z-index: 2147483647;
                background: rgba(15, 23, 42, 0.96);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.12);
                border-radius: 12px;
                padding: 12px 14px;
                width: 290px;
                box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.5);
                color: #f8fafc;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                font-size: 13px;
                line-height: 1.5;
                text-align: left;
                box-sizing: border-box;
                animation: kiguard-tr-fade-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            @keyframes kiguard-tr-fade-in {
                from { opacity: 0; transform: translateY(8px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .kiguard-tr-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 8px;
                padding-bottom: 6px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            }
            .kiguard-tr-brand {
                font-weight: 700;
                font-size: 11px;
                color: #38bdf8;
                display: flex;
                align-items: center;
                gap: 5px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .kiguard-tr-brand svg {
                width: 12px;
                height: 12px;
            }
            .kiguard-tr-actions {
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .kiguard-tr-btn {
                background: none;
                border: none;
                cursor: pointer;
                padding: 3px;
                color: #94a3b8;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: color 0.15s, background-color 0.15s;
                outline: none;
            }
            .kiguard-tr-btn:hover {
                color: #f8fafc;
                background-color: rgba(255, 255, 255, 0.08);
            }
            .kiguard-tr-btn svg {
                width: 14px;
                height: 14px;
            }
            .kiguard-tr-body {
                word-break: break-word;
            }
            .kiguard-tr-text {
                margin: 0 0 6px 0;
                color: #f8fafc;
                font-weight: 500;
                font-size: 13.5px;
            }
            .kiguard-tr-phonetic {
                font-size: 11px;
                color: #38bdf8;
                font-family: monospace;
                margin: 0 0 6px 0;
            }
            .kiguard-tr-detected {
                display: inline-block;
                background-color: rgba(56, 189, 248, 0.12);
                color: #38bdf8;
                font-size: 9.5px;
                font-weight: 600;
                padding: 2px 6px;
                border-radius: 4px;
                text-transform: uppercase;
            }
            .kiguard-tr-loading {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 12px 0;
                gap: 8px;
                color: #94a3b8;
            }
            .kiguard-tr-spinner {
                width: 14px;
                height: 14px;
                border: 2px solid rgba(255, 255, 255, 0.1);
                border-top-color: #38bdf8;
                border-radius: 50%;
                animation: kiguard-tr-spin 0.6s linear infinite;
            }
            @keyframes kiguard-tr-spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        TranslateShield.styleElement = style;
    },

    handleMouseDown: (e) => {
        // If clicking outside the tooltip, remove it
        if (TranslateShield.tooltip && !TranslateShield.tooltip.contains(e.target)) {
            TranslateShield.removeTooltip();
        }
    },

    handleMouseUp: (e) => {
        // Check if inside tooltip to avoid re-triggering selection
        if (TranslateShield.tooltip && TranslateShield.tooltip.contains(e.target)) return;

        setTimeout(() => {
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();
            if (!selectedText) return;

            // Basic validation: must be at least 1 character and less than 2000
            if (selectedText.length < 1 || selectedText.length > 2000) return;

            // Simple check to make sure it's not all numbers or symbols
            if (/^[0-9\s!@#$%^&*()_+\-=\[\]{};':",./<>?\|\\`~]*$/.test(selectedText)) return;

            try {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                if (rect.width === 0 && rect.height === 0) return;

                TranslateShield.showTooltip(rect, selectedText);
            } catch (err) {
                console.warn("[TranslateShield] Failed to get selection bounding client rect:", err);
            }
        }, 10);
    },

    showTooltip(rect, text) {
        TranslateShield.removeTooltip();

        const tooltip = document.createElement('div');
        tooltip.className = 'kiguard-tr-tooltip';
        
        // Calculate coordinate positions avoiding window overflow
        const scrollY = window.scrollY || window.pageYOffset;
        const scrollX = window.scrollX || window.pageXOffset;
        
        // Place tooltip below the selection, centered
        let top = rect.bottom + scrollY + 8;
        let left = rect.left + scrollX + (rect.width / 2) - 145;

        // Prevent top/bottom overflow
        if (top + 150 > document.documentElement.scrollHeight) {
            top = rect.top + scrollY - 140;
        }
        // Prevent left/right overflow
        if (left < 10) left = 10;
        if (left + 300 > window.innerWidth) {
            left = window.innerWidth - 305;
        }

        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;

        tooltip.innerHTML = `
            <div class="kiguard-tr-header">
                <span class="kiguard-tr-brand">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    KiGuard Translate
                </span>
                <div class="kiguard-tr-actions">
                    <button class="kiguard-tr-btn" id="kiguard-tr-close" title="Đóng">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="kiguard-tr-loading">
                <div class="kiguard-tr-spinner"></div>
                <span>Đang dịch...</span>
            </div>
        `;

        document.body.appendChild(tooltip);
        TranslateShield.tooltip = tooltip;

        tooltip.querySelector('#kiguard-tr-close').addEventListener('click', (e) => {
            e.stopPropagation();
            TranslateShield.removeTooltip();
        });

        // Send translate request to background
        chrome.runtime.sendMessage({
            type: "TRANSLATE",
            payload: {
                provider: "google",
                text: text,
                source: "auto",
                target: "vi"
            }
        }, (response) => {
            if (!TranslateShield.tooltip || TranslateShield.tooltip !== tooltip) return;

            if (response && response.ok) {
                TranslateShield.renderTranslation(tooltip, text, response);
            } else {
                TranslateShield.renderError(tooltip, response ? response.error : "Không thể kết nối đến dịch vụ dịch thuật.");
            }
        });
    },

    renderTranslation(tooltip, originalText, result) {
        const { translated, detectedSource, phonetic } = result;

        const container = tooltip.querySelector('.kiguard-tr-loading');
        if (container) container.remove();

        const body = document.createElement('div');
        body.className = 'kiguard-tr-body';
        
        let phoneticHtml = '';
        if (phonetic) {
            phoneticHtml = `<div class="kiguard-tr-phonetic">${phonetic}</div>`;
        }

        let detectedHtml = '';
        if (detectedSource) {
            detectedHtml = `<div class="kiguard-tr-detected">${detectedSource}</div>`;
        }

        body.innerHTML = `
            <div class="kiguard-tr-text">${translated}</div>
            ${phoneticHtml}
            <div style="display:flex; align-items:center; justify-content:space-between; margin-top:8px;">
                ${detectedHtml}
                <div class="kiguard-tr-actions">
                    <button class="kiguard-tr-btn" id="kiguard-tr-tts" title="Đọc phát âm">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                    </button>
                    <button class="kiguard-tr-btn" id="kiguard-tr-copy" title="Sao chép">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        tooltip.appendChild(body);

        // Bind copy action
        tooltip.querySelector('#kiguard-tr-copy').addEventListener('click', (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(translated).then(() => {
                const copyBtn = tooltip.querySelector('#kiguard-tr-copy');
                if (copyBtn) {
                    copyBtn.innerHTML = `
                        <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    `;
                    setTimeout(() => {
                        if (copyBtn) {
                            copyBtn.innerHTML = `
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                            `;
                        }
                    }, 1500);
                }
            });
        });

        // Bind TTS pronunciation action using standard speechSynthesis API
        tooltip.querySelector('#kiguard-tr-tts').addEventListener('click', (e) => {
            e.stopPropagation();
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance(translated);
            utter.lang = 'vi-VN';
            window.speechSynthesis.speak(utter);
        });
    },

    renderError(tooltip, errorMsg) {
        const container = tooltip.querySelector('.kiguard-tr-loading');
        if (container) container.remove();

        const body = document.createElement('div');
        body.className = 'kiguard-tr-body';
        body.innerHTML = `
            <div style="color: #ef4444; font-weight: 500;">Lỗi dịch thuật:</div>
            <div style="color: #94a3b8; font-size:12px; margin-top:4px;">${errorMsg}</div>
        `;
        tooltip.appendChild(body);
    },

    removeTooltip() {
        if (TranslateShield.tooltip) {
            TranslateShield.tooltip.remove();
            TranslateShield.tooltip = null;
        }
    }
};

TranslateShield.init();
