/**
 * KiGuard Page Context Interceptor (MAIN World)
 * 
 * Injected natively via Manifest V3 "world": "MAIN" at document_start.
 * Completely immune to website Content Security Policy (CSP).
 * Hooks window.open, DataTransfer.setData, and navigator.clipboard.writeText.
 */

(function() {
    if (window.__kiguard_interceptor_loaded__) return;
    window.__kiguard_interceptor_loaded__ = true;

    console.log('%c[KiGuard]%c Active: Pop-up & Clipboard Shields Loaded in Page Context', 'color: #3b82f6; font-weight: bold;', 'color: #10b981;');

    // ----------------------------------------------------
    // 1. POP-UP & POPUNDER SHIELD INTERCEPTOR
    // ----------------------------------------------------
    const AD_NETWORKS = [
        'popads.net', 'popcash.net', 'adsterra.com', 'propellerads.com', 'exoclick.com', 'yllix.com',
        'clickadu.com', 'trafficstars.com', 'juicyads.com', 'hilltopads.com', 'monetag.com',
        'adcash.com', 'richads.com', 'bidvertiser.com', 'evadav.com', 'onclickalgo.com',
        'onclickperformance.com', 'directrev.com', 'oclaserver.com', 'exdynsrv.com', 'adnxs.com'
    ];

    const GAMBLING_KEYWORDS = [
        'kubet', 'thabet', 'w88', 'fb88', 'fun88', 'm88', 'bk8', '188bet', 'dafabet', 'jun88',
        'shbet', 'hi88', '789bet', 'new88', 'f8bet', 'sv388', 'keonhacai', 'soikeo', 'gamebai',
        'nohu', 'banca', 'taixiu', 'xocdia', 'lode', 'casinowin', 'bet365', '1xbet', 'casino'
    ];

    const OAUTH_PROVIDERS = [
        'accounts.google.com', 'facebook.com', 'appleid.apple.com', 'github.com',
        'login.microsoftonline.com', 'twitter.com', 'x.com', 'linkedin.com', 'auth0.com', 'zalo.me'
    ];

    let lastUserClickTarget = null;
    let lastUserClickTime = 0;
    let lastUserAnchorHref = null;
    let lastUserIsButton = false;

    // Track genuine user click interactions
    function handlePointerOrClick(e) {
        lastUserClickTime = Date.now();
        lastUserClickTarget = e.target;
        
        const anchor = e.target && e.target.closest ? e.target.closest('a') : null;
        lastUserAnchorHref = anchor ? anchor.href : null;

        const button = e.target && e.target.closest ? e.target.closest('button, [role="button"], input[type="button"], input[type="submit"]') : null;
        lastUserIsButton = Boolean(button);

        // Neutralize full-screen transparent overlay click traps
        if (e.target && e.target !== document.body && e.target !== document.documentElement) {
            try {
                const rect = e.target.getBoundingClientRect();
                const isLarge = rect.width >= window.innerWidth * 0.75 && rect.height >= window.innerHeight * 0.75;
                if (isLarge) {
                    const style = window.getComputedStyle(e.target);
                    const isPositioned = style.position === 'fixed' || style.position === 'absolute';
                    const isTransparent = style.opacity === '0' || style.visibility === 'hidden' || 
                        style.backgroundColor === 'transparent' || style.backgroundColor === 'rgba(0, 0, 0, 0)';
                    const isHighZ = parseInt(style.zIndex, 10) > 100;

                    if (isPositioned && isTransparent && isHighZ) {
                        console.warn('[KiGuard] Neutralized invisible click-trap overlay:', e.target);
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        e.target.remove();
                    }
                }
            } catch (err) {}
        }
    }

    window.addEventListener('pointerdown', handlePointerOrClick, true);
    window.addEventListener('mousedown', handlePointerOrClick, true);
    window.addEventListener('click', handlePointerOrClick, true);

    function shouldBlockPopup(targetUrl) {
        if (!targetUrl || typeof targetUrl !== 'string') return false;

        let targetOrigin = '';
        let targetHostname = '';
        let targetPath = '';
        try {
            const parsed = new URL(targetUrl, window.location.href);
            targetOrigin = parsed.origin;
            targetHostname = parsed.hostname.toLowerCase();
            targetPath = parsed.pathname.toLowerCase();
        } catch (e) {
            return false;
        }

        // 1. Same origin -> ALLOW
        if (targetOrigin === window.location.origin || targetHostname === window.location.hostname.toLowerCase()) {
            return false;
        }

        // 2. OAuth authentication -> ALLOW
        const isOAuth = OAUTH_PROVIDERS.some(p => targetHostname.includes(p) || targetPath.includes('/oauth'));
        if (isOAuth) {
            return false;
        }

        // 3. Known Ad networks or Gambling keywords -> ALWAYS BLOCK
        const isAd = AD_NETWORKS.some(net => targetHostname.includes(net));
        const isGambling = GAMBLING_KEYWORDS.some(kw => targetHostname.includes(kw) || targetPath.includes(kw));
        if (isAd || isGambling) {
            return {
                block: true,
                reason: isGambling ? 'Trang cá cược / cờ bạc' : 'Mạng lưới quảng cáo Popunder',
                domain: targetHostname
            };
        }

        // 4. Check user intent for other external URLs:
        const isRecentClick = (Date.now() - lastUserClickTime) < 1800;

        // Auto-popup without user interaction
        if (!isRecentClick) {
            return {
                block: true,
                reason: 'Pop-up tự động mở ngầm không qua tương tác',
                domain: targetHostname
            };
        }

        // User clicked an explicit anchor link
        if (lastUserAnchorHref) {
            try {
                const anchorUrl = new URL(lastUserAnchorHref, window.location.href);
                if (anchorUrl.href === targetUrl || (anchorUrl.hostname === targetHostname && anchorUrl.pathname === targetPath)) {
                    return false; // User genuinely intended to visit this link!
                }
            } catch (e) {}
        }

        // User clicked a genuine button for an external service
        if (lastUserIsButton) {
            return false;
        }

        // Click-trap: User clicked on generic background or element, triggering an external tab
        return {
            block: true,
            reason: 'Bẫy click mở tab lạ (Click-trap / Popunder)',
            domain: targetHostname
        };
    }

    function dispatchBlockedEvent(url, domain, reason) {
        try {
            document.dispatchEvent(new CustomEvent('__KIGUARD_POPUP_BLOCKED__', {
                detail: { url, domain, reason }
            }));
        } catch (err) {}
    }

    // Hook window.open
    const originalOpen = window.open;
    window.open = function(url, target, features) {
        if (url) {
            const check = shouldBlockPopup(url);
            if (check && check.block) {
                console.warn('[KiGuard] Blocked uninvited pop-up:', url, check.reason);
                dispatchBlockedEvent(url, check.domain || 'Trang ngoài', check.reason);
                
                // Return safe dummy window object
                return {
                    closed: true,
                    focus: function() {},
                    blur: function() {},
                    close: function() {},
                    postMessage: function() {}
                };
            }
        }
        return originalOpen.apply(this, arguments);
    };

    // Hook HTMLAnchorElement.prototype.click
    const originalAnchorClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function() {
        const href = this.href;
        const target = this.target;
        if (href && (target === '_blank' || !target)) {
            const check = shouldBlockPopup(href);
            if (check && check.block) {
                console.warn('[KiGuard] Blocked synthetic link click pop-up:', href, check.reason);
                dispatchBlockedEvent(href, check.domain || 'Trang ngoài', check.reason);
                return;
            }
        }
        return originalAnchorClick.apply(this, arguments);
    };

    // ----------------------------------------------------
    // 2. ANTI-CLIPBOARD HIJACKING INTERCEPTOR
    // ----------------------------------------------------
    let lastUserSelection = '';
    let lastSelectionTime = 0;

    function getActiveSelection() {
        try {
            const activeEl = document.activeElement;
            if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
                const start = activeEl.selectionStart;
                const end = activeEl.selectionEnd;
                if (typeof start === 'number' && typeof end === 'number' && start !== end) {
                    return activeEl.value.substring(start, end);
                }
            }
            const sel = window.getSelection();
            if (sel && !sel.isCollapsed) {
                return sel.toString();
            }
        } catch (e) {}
        return '';
    }

    document.addEventListener('selectionchange', () => {
        const text = getActiveSelection();
        if (text && text.trim().length > 0) {
            lastUserSelection = text;
            lastSelectionTime = Date.now();
        }
    }, true);

    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
            const text = getActiveSelection();
            if (text && text.trim().length > 0) {
                lastUserSelection = text;
                lastSelectionTime = Date.now();
            }
        }
    }, true);

    function isClipboardHijack(selectedText, incomingData) {
        if (!selectedText || typeof selectedText !== 'string') return false;
        if (!incomingData || typeof incomingData !== 'string') return false;

        const selTrim = selectedText.trim();
        const incTrim = incomingData.trim();

        if (selTrim.length === 0) return false;
        if (selTrim === incTrim) return false;
        if (selTrim.replace(/\s+/g, ' ') === incTrim.replace(/\s+/g, ' ')) return false;

        // Crypto wallet addresses or bank accounts (digits 6 to 24)
        const isCryptoOrBank = (
            /^(0x[a-fA-F0-9]{40}|[13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59}|T[A-Za-z1-9]{33})$/.test(selTrim) ||
            /^\d{6,24}$/.test(selTrim)
        );

        if (isCryptoOrBank) return true;
        if (!incomingData.includes(selTrim)) return true;

        return false;
    }

    function dispatchClipboardHijackAlert(original, hijacked) {
        try {
            document.dispatchEvent(new CustomEvent('__KIGUARD_CLIPBOARD_HIJACK__', {
                detail: { original, hijacked }
            }));
        } catch (err) {}
    }

    // Hook DataTransfer.prototype.setData
    if (typeof DataTransfer !== 'undefined' && DataTransfer.prototype.setData) {
        const originalSetData = DataTransfer.prototype.setData;
        DataTransfer.prototype.setData = function(format, data) {
            if (typeof format === 'string' && (format.toLowerCase() === 'text/plain' || format.toLowerCase() === 'text')) {
                let currentSel = getActiveSelection();
                if (!currentSel && (Date.now() - lastSelectionTime < 1800)) {
                    currentSel = lastUserSelection;
                }

                if (currentSel && isClipboardHijack(currentSel, data)) {
                    console.warn('[KiGuard] Prevented clipboard hijack in copy event!', { original: currentSel, hijacked: data });
                    dispatchClipboardHijackAlert(currentSel, data);
                    // Retain user's authentic selection instead of hacker's data
                    return originalSetData.call(this, format, currentSel);
                }
            }
            return originalSetData.apply(this, arguments);
        };
    }

    // Hook navigator.clipboard.writeText
    if (navigator.clipboard && navigator.clipboard.writeText) {
        const originalWriteText = navigator.clipboard.writeText.bind(navigator.clipboard);
        navigator.clipboard.writeText = function(text) {
            let currentSel = getActiveSelection();
            if (!currentSel && (Date.now() - lastSelectionTime < 1800)) {
                currentSel = lastUserSelection;
            }

            if (currentSel && isClipboardHijack(currentSel, text)) {
                console.warn('[KiGuard] Prevented clipboard hijack in writeText!', { original: currentSel, hijacked: text });
                dispatchClipboardHijackAlert(currentSel, text);
                // Retain user's authentic selection
                return originalWriteText(currentSel);
            }
            return originalWriteText(text);
        };
    }

    // ----------------------------------------------------
    // 3. WEBRTC IP LEAK PROTECTION (MAIN World)
    // ----------------------------------------------------
    const OrigRTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection;
    if (OrigRTCPeerConnection) {
        const sanitizeCandidate = (candStr) => {
            if (!candStr || typeof candStr !== 'string') return candStr;
            // Drop host candidates (private LAN IPs: 192.168.x.x, 10.x.x.x, mDNS)
            if (candStr.includes('typ host')) {
                return '';
            }
            return candStr;
        };

        const WrappedRTCPeerConnection = function(config, constraints) {
            const pc = new OrigRTCPeerConnection(config, constraints);

            let userHandler = null;
            Object.defineProperty(pc, 'onicecandidate', {
                get: () => userHandler,
                set: (fn) => {
                    if (typeof fn !== 'function') {
                        userHandler = null;
                        return;
                    }
                    userHandler = function(e) {
                        if (e && e.candidate && e.candidate.candidate) {
                            const sanitized = sanitizeCandidate(e.candidate.candidate);
                            if (!sanitized) return; // Dropped to protect private LAN IP
                        }
                        return fn.apply(this, arguments);
                    };
                }
            });

            const origAddEventListener = pc.addEventListener.bind(pc);
            pc.addEventListener = function(type, listener, options) {
                if (type === 'icecandidate' && typeof listener === 'function') {
                    const wrappedListener = function(e) {
                        if (e && e.candidate && e.candidate.candidate) {
                            const sanitized = sanitizeCandidate(e.candidate.candidate);
                            if (!sanitized) return;
                        }
                        return listener.apply(this, arguments);
                    };
                    return origAddEventListener(type, wrappedListener, options);
                }
                return origAddEventListener.apply(this, arguments);
            };

            return pc;
        };

        WrappedRTCPeerConnection.prototype = OrigRTCPeerConnection.prototype;
        window.RTCPeerConnection = WrappedRTCPeerConnection;
        if (window.webkitRTCPeerConnection) {
            window.webkitRTCPeerConnection = WrappedRTCPeerConnection;
        }
    }
})();
