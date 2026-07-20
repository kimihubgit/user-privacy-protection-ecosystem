/**
 * DataBlurShield – KiGuard Data Blur Module
 * Automatically detects and blurs sensitive PII on web pages.
 * Supports interactive Element Click-to-Blur, Area Drag-to-Blur, Custom Keywords, 
 * persistent storage, and an elegant floating toolbar control.
 */

const DataBlurShield = {
    active: false,
    options: {
        emails: true,
        phones: true,
        creditCard: true,
        ssn: false,
        password: false,
        secretKeys: false,
        money: false,
        cryptoWallet: false,
        highEntropy: false,
        keywords: ''
    },
    
    // Interactive states
    activeMode: 'normal', // 'normal' | 'element' | 'area' | 'text'
    customBlurs: [],      // Saved blurs for current page
    blurIntensity: 12,    // Default blur amount in px
    toolbarVisible: true, // Toolbar visibility
    keywords: [],         // Parsed array of keywords
    lastUrl: window.location.href, // Track URL for SPAs
    
    // DOM refs
    observer: null,
    _processing: false,
    toolbarEl: null,
    triggerEl: null,
    
    // Drag area select state
    dragStart: null,
    selectionBox: null,
    
    // Bound listeners for cleanup
    hoverListenerBound: null,
    clickListenerBound: null,
    dragStartListenerBound: null,
    dragMoveListenerBound: null,
    dragEndListenerBound: null,
    keydownListenerBound: null,
    selectionListenerBound: null,

    // ─── Initialization ───────────────────────────────────────────
    init() {
        chrome.storage.local.get(['dataBlurActive', 'dataBlurOptions', 'kiguardBlurIntensity', 'kiguardToolbarVisible'], (res) => {
            this.active = res.dataBlurActive === true;
            if (res.dataBlurOptions) {
                // Support credentials fallback to creditCard
                const opt = { ...res.dataBlurOptions };
                if (opt.creditCard === undefined && opt.credentials !== undefined) {
                    opt.creditCard = opt.credentials;
                }
                this.options = { ...this.options, ...opt };
            }
            if (res.kiguardBlurIntensity !== undefined) {
                this.blurIntensity = parseInt(res.kiguardBlurIntensity, 10);
            }
            if (res.kiguardToolbarVisible !== undefined) {
                this.toolbarVisible = res.kiguardToolbarVisible !== false;
            }
            
            // Set css variables on init
            this.updateBlurIntensityCSS();
            this.parseKeywords();

            if (this.active) {
                this.start();
            }
        });

        chrome.storage.onChanged.addListener((changes) => {
            if (changes.dataBlurActive || changes.dataBlurOptions || changes.kiguardBlurIntensity || changes.kiguardToolbarVisible) {
                chrome.storage.local.get(['dataBlurActive', 'dataBlurOptions', 'kiguardBlurIntensity', 'kiguardToolbarVisible'], (res) => {
                    const nextActive = res.dataBlurActive === true;
                    
                    const opt = { ...res.dataBlurOptions };
                    if (opt.creditCard === undefined && opt.credentials !== undefined) {
                        opt.creditCard = opt.credentials;
                    }
                    const nextOptions = res.dataBlurOptions ? { ...this.options, ...opt } : this.options;
                    const nextIntensity = res.kiguardBlurIntensity !== undefined ? parseInt(res.kiguardBlurIntensity, 10) : this.blurIntensity;
                    const nextToolbarVisible = res.kiguardToolbarVisible !== false;

                    const activeChanged = nextActive !== this.active;
                    const optionsChanged = JSON.stringify(nextOptions) !== JSON.stringify(this.options);
                    const intensityChanged = nextIntensity !== this.blurIntensity;
                    const toolbarVisibleChanged = nextToolbarVisible !== this.toolbarVisible;

                    this.active = nextActive;
                    this.options = nextOptions;
                    this.blurIntensity = nextIntensity;
                    this.toolbarVisible = nextToolbarVisible;
                    
                    if (intensityChanged) {
                        this.updateBlurIntensityCSS();
                    }
                    if (optionsChanged) {
                        this.parseKeywords();
                    }
                    if (toolbarVisibleChanged) {
                        this.toggleToolbarVisibility(nextToolbarVisible);
                    }

                    if (activeChanged || optionsChanged) {
                        if (this.active) {
                            this.restart();
                        } else {
                            this.stop();
                        }
                    }
                });
            }
        });

        // Setup global keydown shortcuts
        this.keydownListenerBound = this.handleKeydown.bind(this);
        window.addEventListener('keydown', this.keydownListenerBound);
    },

    parseKeywords() {
        if (this.options.keywords) {
            this.keywords = this.options.keywords
                .split(',')
                .map(kw => kw.trim())
                .filter(kw => kw.length > 0);
        } else {
            this.keywords = [];
        }
    },

    updateBlurIntensityCSS() {
        document.documentElement.style.setProperty('--kiguard-blur-val', `${this.blurIntensity}px`);
    },

    // ─── Lifecycle ────────────────────────────────────────────────
    start() {
        this.lastUrl = window.location.href;
        this.loadCustomBlurs(() => {
            this.applyCustomBlurs();
            if (document.body) {
                this.scanDOM(document.body);
                this.scanFormFields(document.body);
                this.observeDOM();
                this.setupInteractiveModes();
                this.renderToolbar();
            } else {
                document.addEventListener('DOMContentLoaded', () => {
                    this.scanDOM(document.body);
                    this.scanFormFields(document.body);
                    this.observeDOM();
                    this.setupInteractiveModes();
                    this.renderToolbar();
                }, { once: true });
            }
        });
    },

    stop() {
        // Disconnect MutationObserver
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        // Clean PII matched blurs
        document.querySelectorAll('.kiguard-blurred').forEach(span => {
            const textNode = document.createTextNode(span.textContent);
            if (span.parentNode) {
                span.parentNode.replaceChild(textNode, span);
            }
        });
        
        // Clean custom element blurs
        document.querySelectorAll('.kiguard-user-blurred').forEach(el => {
            el.classList.remove('kiguard-user-blurred');
        });

        // Remove custom area blur overlays
        document.querySelectorAll('.kiguard-area-blur-overlay').forEach(el => el.remove());

        // Remove selection highlight class
        document.querySelectorAll('.kiguard-blur-hover-highlight').forEach(el => {
            el.classList.remove('kiguard-blur-hover-highlight');
        });

        // Normalize text nodes
        document.body && document.body.normalize();

        // Remove toolbar
        if (this.toolbarEl) {
            this.toolbarEl.remove();
            this.toolbarEl = null;
        }

        this.cleanupInteractiveListeners();
        this.activeMode = 'normal';
    },

    restart() {
        this.stop();
        this.start();
    },

    // ─── Keyboard Shortcuts & Messages ────────────────────────────
    handleKeydown(e) {
        // Alt+Shift+T: Toggle toolbar visibility
        if (e.altKey && e.shiftKey && e.code === 'KeyT') {
            e.preventDefault();
            this.toggleToolbarVisibility();
        }
        
        // Alt+Shift+R: Remove all blurs on this host
        if (e.altKey && e.shiftKey && e.code === 'KeyR') {
            e.preventDefault();
            this.clearAllCustomBlurs();
        }

        // Alt+Shift+A: Quick toggle auto-detect scanner
        if (e.altKey && e.shiftKey && e.code === 'KeyA') {
            e.preventDefault();
            const nextActive = !this.active;
            chrome.storage.local.set({ dataBlurActive: nextActive });
        }

        // Alt+Shift+B: Blur highlighted text selection
        if (e.altKey && e.shiftKey && e.code === 'KeyB') {
            e.preventDefault();
            this.blurSelection();
        }
    },

    blurSelection() {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        if (selectedText.length >= 2) {
            const exists = this.customBlurs.some(b => b.type === 'text' && b.text === selectedText);
            if (!exists) {
                this.customBlurs.push({
                    type: 'text',
                    text: selectedText,
                    host: window.location.hostname
                });
                this.saveCustomBlurs();
                this.restart();
            }
            selection.removeAllRanges();
        }
    },

    // ─── Luhn Validation (Credit Cards) ───────────────────────────
    luhnCheck(numStr) {
        const digits = numStr.replace(/[\s-]/g, '');
        if (digits.length < 12 || digits.length > 19) return false;
        let sum = 0;
        let alt = false;
        for (let i = digits.length - 1; i >= 0; i--) {
            let n = parseInt(digits[i], 10);
            if (isNaN(n)) return false;
            if (alt) {
                n *= 2;
                if (n > 9) n -= 9;
            }
            sum += n;
            alt = !alt;
        }
        return sum % 10 === 0;
    },

    // ─── Regex Builders ───────────────────────────────────────────
    getRegexList() {
        const list = [];

        // 1. Email
        if (this.options.emails) {
            list.push({
                type: 'email',
                pattern: /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g
            });
        }

        // 2. Phone numbers (Vietnam + international)
        if (this.options.phones) {
            list.push({
                type: 'phone',
                pattern: /(?:\+?84|0)[35789]\d{8}\b|\b02\d{9}\b|\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b|\b\+?\d{1,4}[-.\s]?\(?\d{1,5}\)?[-.\s]?\d{2,5}[-.\s]?\d{2,5}\b/g
            });
        }

        // 3. Credit / Debit cards
        if (this.options.creditCard) {
            list.push({
                type: 'creditCard',
                pattern: /\b(?:\d[ \-]*?){13,19}\b/g,
                validate: (match) => this.luhnCheck(match)
            });
        }

        // 4. SSN (US Social Security Number)
        if (this.options.ssn) {
            list.push({
                type: 'ssn',
                pattern: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
                validate: (match) => {
                    const digits = match.replace(/[-\s]/g, '');
                    return digits.length === 9 &&
                        digits.substring(0, 3) !== '000' &&
                        digits.substring(3, 5) !== '00' &&
                        digits.substring(5) !== '0000';
                }
            });
        }

        // 5. Password fields (visible passwords)
        if (this.options.password) {
            list.push({
                type: 'password',
                pattern: /(?:password|mật\s*khẩu|pass(?:word)?)\s*[:=]\s*\S{4,}/gi
            });
        }

        // 6. Secret keys / API keys / tokens (includes Private Keys and DB connection strings)
        if (this.options.secretKeys) {
            list.push({
                type: 'secretKeys',
                pattern: /\b(?:AKIA|ABIA|ACCA|ASIA)[A-Z0-9]{16}\b/g
            });
            list.push({
                type: 'secretKeys',
                pattern: /\b(?:sk|pk|api|token|key|secret|access)[_\-][A-Za-z0-9_\-]{20,}\b/gi
            });
            list.push({
                type: 'secretKeys',
                pattern: /Bearer\s+[A-Za-z0-9\-._~+\/]+=*/g
            });
            // DB connection URLs
            list.push({
                type: 'secretKeys',
                pattern: /mongodb:\/\/[^:]+:[^@]+@[^\s"'`]+|postgresql:\/\/[^:]+:[^@]+@[^\s"'`]+|mysql:\/\/[^:]+:[^@]+@[^\s"'`]+|(database|db)_url=.*:\/\/[^:]+:[^@]+@[^\s"'`]+/gi
            });
            // PEM & PGP Private keys
            list.push({
                type: 'secretKeys',
                pattern: /-----BEGIN (?:RSA |DSA |EC )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |DSA |EC )?PRIVATE KEY-----|-----BEGIN PGP PRIVATE KEY BLOCK-----[\s\S]*?-----END PGP PRIVATE KEY BLOCK-----|-----BEGIN OPENSSH PRIVATE KEY-----[\s\S]*?-----END OPENSSH PRIVATE KEY-----/g
            });
        }

        // 7. Money amounts
        if (this.options.money) {
            list.push({
                type: 'money',
                pattern: /[$\u20ac\xa3\xa5\u20b9\u20bd\u20a9\u20ba\u20a6\u20b1\u20aa\u20ab₫đ]\s?\d{1,3}(?:[,.\s]\d{3})*(?:[.,]\d{0,2})?|\b\d{1,3}(?:[,.\s]\d{3})*(?:[.,]\d{2})?\s?(?:USD|EUR|GBP|JPY|CAD|AUD|CHF|CNY|INR|RUB|KRW|TRY|BRL|MXN|ZAR|SGD|HKD|SEK|NOK|DKK|PLN|VND|đ)\b/gi
            });
        }

        // 8. Crypto wallet addresses
        if (this.options.cryptoWallet) {
            list.push({
                type: 'cryptoWallet',
                pattern: /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b|\bbc1[a-z0-9]{39,87}\b|\b0x[a-fA-F0-9]{40}\b|\b[LM][a-km-zA-HJ-NP-Z1-9]{26,33}\b|\bltc1[a-z0-9]{39,87}\b|\br[a-km-zA-HJ-NP-Z1-9]{24,34}\b|\baddr1[a-z0-9]{58,98}\b|\bbitcoincash:[a-z0-9]{42}\b|(?<!bitcoincash:)\b[qp][a-z0-9]{41}\b|\bD[5-9A-HJ-NP-U][1-9A-HJ-NP-Za-km-z]{32}\b|(?<!bitcoincash:)\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/gi
            });
        }

        // 9. High-entropy strings
        if (this.options.highEntropy) {
            list.push({
                type: 'highEntropy',
                pattern: /\b(?!https?:\/\/)(?=[A-Za-z0-9]*[A-Z])(?=[A-Za-z0-9]*[a-z])(?=[A-Za-z0-9]*\d)[A-Za-z0-9]{20,}\b/g
            });
        }

        // 10. Custom Keywords (Global)
        if (this.keywords && this.keywords.length > 0) {
            const escaped = this.keywords.map(kw => kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
            list.push({
                type: 'keyword',
                pattern: new RegExp(escaped.join('|'), 'gi')
            });
        }

        // 11. Local Text Blurs (Host-specific text selections)
        const localTexts = this.customBlurs
            .filter(b => b.type === 'text' && b.text)
            .map(b => b.text);
        if (localTexts.length > 0) {
            const uniqueTexts = [...new Set(localTexts)];
            const escaped = uniqueTexts.map(txt => txt.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
            list.push({
                type: 'textSelection',
                pattern: new RegExp(escaped.join('|'), 'gi')
            });
        }

        return list;
    },

    // ─── DOM Scanning ─────────────────────────────────────────────
    scanDOM(root) {
        if (!root) return;
        const regexList = this.getRegexList();
        if (regexList.length === 0) return;

        const ignoreTags = new Set([
            'STYLE', 'SCRIPT', 'NOSCRIPT', 'TEXTAREA', 'INPUT',
            'SVG', 'IFRAME', 'CODE', 'PRE', 'KBD', 'SAMP'
        ]);

        const walk = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    const parent = node.parentNode;
                    if (!parent) return NodeFilter.FILTER_REJECT;
                    if (ignoreTags.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
                    if (parent.closest && (
                        parent.closest('.kiguard-blurred') ||
                        parent.closest('.kiguard-blur-toolbar') ||
                        parent.closest('.kiguard-blur-toolbar-trigger') ||
                        parent.closest('.kiguard-drag-selection-box') ||
                        parent.closest('.kiguard-area-blur-overlay') ||
                        parent.closest('#scam-guard-warning-overlay') ||
                        parent.closest('#kiguard-framing-warning-overlay')
                    )) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    if (parent.isContentEditable) return NodeFilter.FILTER_REJECT;
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const nodesToProcess = [];
        let currentNode;
        while (currentNode = walk.nextNode()) {
            nodesToProcess.push(currentNode);
        }

        nodesToProcess.forEach(node => {
            this.processTextNode(node, regexList);
        });
    },

    // Scan input, select, and textarea fields to match sensitive attributes or dynamic values
    scanFormFields(root) {
        if (!root) return;
        
        let inputs = [];
        if (root.tagName === 'INPUT' || root.tagName === 'TEXTAREA' || root.tagName === 'SELECT') {
            inputs = [root];
        } else {
            inputs = Array.from(root.querySelectorAll('input, textarea, select'));
        }

        inputs.forEach(input => {
            if (input.closest('.kiguard-blur-toolbar') || input.closest('.kiguard-blur-toolbar-trigger')) return;

            const type = (input.type || '').toLowerCase();
            const name = (input.name || '').toLowerCase();
            const id = (input.id || '').toLowerCase();
            const placeholder = (input.placeholder || '').toLowerCase();
            const autocomplete = (input.autocomplete || '').toLowerCase();
            const attrText = `${name} ${id} ${placeholder} ${autocomplete}`;

            let shouldBlur = false;

            // 1. Password
            if (this.options.password) {
                if (type === 'password' || /password|passwd|pwd/.test(attrText)) {
                    shouldBlur = true;
                }
            }
            // 2. Email
            if (!shouldBlur && this.options.emails) {
                if (type === 'email' || /email|e-mail|mail/.test(attrText)) {
                    shouldBlur = true;
                }
            }
            // 3. Phone
            if (!shouldBlur && this.options.phones) {
                if (type === 'tel' || /phone|tel|mobile|telephone/.test(attrText)) {
                    shouldBlur = true;
                }
            }
            // 4. Credit Card
            if (!shouldBlur && this.options.creditCard) {
                if (/cc-number|creditcard|card-number|cardnumber/.test(attrText)) {
                    shouldBlur = true;
                }
            }
            // 5. SSN
            if (!shouldBlur && this.options.ssn) {
                if (/ssn|social-security|social_security/.test(attrText)) {
                    shouldBlur = true;
                }
            }
            // 6. Secret keys / credentials
            if (!shouldBlur && this.options.secretKeys) {
                if (/api-key|api_key|apikey|token|secret|access-token|api-secret|auth-token|auth_token|jwt|bearer|access_token|refresh_token|private-key|private_key|privatekey|rsa-key|pem|secret-key/.test(attrText)) {
                    shouldBlur = true;
                }
            }
            // 7. Money
            if (!shouldBlur && this.options.money) {
                if (/amount|price|cost|salary|wage|income|balance|total|payment|revenue|budget/.test(attrText)) {
                    shouldBlur = true;
                }
            }
            // 8. Crypto Wallet
            if (!shouldBlur && this.options.cryptoWallet) {
                if (/wallet|wallet-address|wallet_address|walletaddress|crypto-address|crypto_address|bitcoin-address|btc-address|eth-address|ethereum-address|crypto-wallet|cryptocurrency|blockchain-address/.test(attrText)) {
                    shouldBlur = true;
                }
            }

            // Also check input typed value against current regexes
            if (!shouldBlur && input.value && input.value.trim().length >= 3) {
                const regexList = this.getRegexList();
                for (const { pattern } of regexList) {
                    pattern.lastIndex = 0;
                    if (pattern.test(input.value)) {
                        shouldBlur = true;
                        break;
                    }
                }
            }

            if (shouldBlur) {
                input.classList.add('kiguard-user-blurred');
            } else {
                // Ensure we don't clear if it was manually blurred by the user
                const selector = this.getUniqueSelector(input);
                const isSaved = this.customBlurs.some(b => b.selector === selector);
                if (!isSaved) {
                    input.classList.remove('kiguard-user-blurred');
                }
            }
        });
    },

    processTextNode(node, regexList) {
        const parent = node.parentNode;
        if (!parent) return;

        // Skip scanning if the parent is inside our own extension UI elements to prevent blurring them
        if (parent.closest && (
            parent.closest('.kiguard-blurred') ||
            parent.closest('.kiguard-blur-toolbar') ||
            parent.closest('.kiguard-blur-toolbar-trigger') ||
            parent.closest('.kiguard-drag-selection-box') ||
            parent.closest('.kiguard-area-blur-overlay') ||
            parent.closest('#scam-guard-warning-overlay') ||
            parent.closest('#kiguard-framing-warning-overlay')
        )) {
            return;
        }

        let text = node.nodeValue;
        if (!text || text.trim().length < 3) return;

        // Check if any regex matches
        let hasMatch = false;
        for (const { pattern } of regexList) {
            pattern.lastIndex = 0;
            if (pattern.test(text)) {
                hasMatch = true;
                break;
            }
        }
        if (!hasMatch) return;

        // Disconnect observer to prevent loops
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        const fragment = document.createDocumentFragment();
        let lastIdx = 0;

        // Gather all matches
        const matches = [];
        for (const { pattern, type, validate } of regexList) {
            pattern.lastIndex = 0;
            let match;
            let lastLastIndex = -1;
            while ((match = pattern.exec(text)) !== null) {
                if (pattern.lastIndex === lastLastIndex) {
                    pattern.lastIndex++;
                    continue;
                }
                lastLastIndex = pattern.lastIndex;
                const val = match[0];
                if (validate && !validate(val)) continue;
                matches.push({
                    start: match.index,
                    end: pattern.lastIndex,
                    val,
                    type
                });
            }
        }

        // Sort by start position
        matches.sort((a, b) => a.start - b.start);

        // Remove overlapping matches
        const cleanMatches = [];
        let currentEnd = 0;
        for (const m of matches) {
            if (m.start >= currentEnd) {
                cleanMatches.push(m);
                currentEnd = m.end;
            }
        }

        if (cleanMatches.length > 0) {
            cleanMatches.forEach(m => {
                if (m.start > lastIdx) {
                    fragment.appendChild(document.createTextNode(text.slice(lastIdx, m.start)));
                }
                const span = document.createElement('span');
                span.className = 'kiguard-blurred';
                span.textContent = m.val;
                span.dataset.kiguardBlurType = m.type;
                span.title = 'Hover to reveal • KiGuard Data Blur';
                fragment.appendChild(span);
                lastIdx = m.end;
            });

            if (lastIdx < text.length) {
                fragment.appendChild(document.createTextNode(text.slice(lastIdx)));
            }

            parent.replaceChild(fragment, node);
        }

        // Reconnect observer
        if (this.active) {
            this.observeDOM();
        }
    },

    // ─── MutationObserver & URL Check ─────────────────────────────
    checkUrlChange() {
        if (window.location.href !== this.lastUrl) {
            this.lastUrl = window.location.href;
            this.loadCustomBlurs(() => {
                document.querySelectorAll('.kiguard-area-blur-overlay').forEach(el => el.remove());
                this.applyCustomBlurs();
                this.scanDOM(document.body);
            });
        }
    },

    observeDOM() {
        if (this.observer) return;
        this.observer = new MutationObserver((mutations) => {
            if (this._processing) return;
            this._processing = true;

            this.checkUrlChange();
            this.applyCustomBlurs();

            for (const mutation of mutations) {
                if (mutation.type === 'characterData') {
                    const regexList = this.getRegexList();
                    this.processTextNode(mutation.target, regexList);
                } else if (mutation.type === 'childList') {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.scanDOM(node);
                            this.scanFormFields(node);
                        } else if (node.nodeType === Node.TEXT_NODE) {
                            const regexList = this.getRegexList();
                            this.processTextNode(node, regexList);
                        }
                    }
                }
            }

            this._processing = false;
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    },

    // ─── Interactive Features & Click-to-Blur ──────────────────────
    setupInteractiveModes() {
        this.cleanupInteractiveListeners();

        // 1. Hover listener for Element Blur Mode
        this.hoverListenerBound = (e) => {
            if (this.activeMode !== 'element') return;
            if (e.target.closest('.kiguard-blur-toolbar') || e.target.closest('.kiguard-blur-toolbar-trigger')) return;
            
            document.querySelectorAll('.kiguard-blur-hover-highlight').forEach(el => {
                if (el !== e.target) el.classList.remove('kiguard-blur-hover-highlight');
            });
            e.target.classList.add('kiguard-blur-hover-highlight');
        };

        // 2. Click listener to toggle blur on elements
        this.clickListenerBound = (e) => {
            if (this.activeMode !== 'element') return;
            if (e.target.closest('.kiguard-blur-toolbar') || e.target.closest('.kiguard-blur-toolbar-trigger')) return;
            
            e.preventDefault();
            e.stopPropagation();

            const target = e.target;
            target.classList.remove('kiguard-blur-hover-highlight');
            
            const isBlurred = target.classList.contains('kiguard-user-blurred');
            const selector = this.getUniqueSelector(target);

            if (isBlurred) {
                target.classList.remove('kiguard-user-blurred');
                this.customBlurs = this.customBlurs.filter(b => b.selector !== selector);
            } else {
                target.classList.add('kiguard-user-blurred');
                this.customBlurs.push({
                    type: 'element',
                    selector: selector,
                    host: window.location.hostname
                });
            }
            this.saveCustomBlurs();
        };

        // 3. Drag Selection for Area Blur Mode
        this.dragStartListenerBound = (e) => {
            if (this.activeMode !== 'area') return;
            if (e.target.closest('.kiguard-blur-toolbar') || e.target.closest('.kiguard-blur-toolbar-trigger')) return;
            if (e.button !== 0) return;

            e.preventDefault();
            this.dragStart = { x: e.clientX, y: e.clientY };

            this.selectionBox = document.createElement('div');
            this.selectionBox.className = 'kiguard-drag-selection-box';
            document.body.appendChild(this.selectionBox);
        };

        this.dragMoveListenerBound = (e) => {
            if (!this.dragStart || !this.selectionBox) return;

            const currentX = e.clientX;
            const currentY = e.clientY;

            const left = Math.min(this.dragStart.x, currentX);
            const top = Math.min(this.dragStart.y, currentY);
            const width = Math.abs(this.dragStart.x - currentX);
            const height = Math.abs(this.dragStart.y - currentY);

            this.selectionBox.style.left = `${left}px`;
            this.selectionBox.style.top = `${top}px`;
            this.selectionBox.style.width = `${width}px`;
            this.selectionBox.style.height = `${height}px`;
        };

        this.dragEndListenerBound = (e) => {
            if (!this.dragStart || !this.selectionBox) return;

            const currentX = e.clientX;
            const currentY = e.clientY;

            const width = Math.abs(this.dragStart.x - currentX);
            const height = Math.abs(this.dragStart.y - currentY);

            if (width > 5 && height > 5) {
                const scrollX = window.scrollX || window.pageXOffset;
                const scrollY = window.scrollY || window.pageYOffset;
                const docLeft = Math.min(this.dragStart.x, currentX) + scrollX;
                const docTop = Math.min(this.dragStart.y, currentY) + scrollY;

                const areaItem = {
                    type: 'area',
                    left: docLeft,
                    top: docTop,
                    width,
                    height,
                    host: window.location.hostname
                };

                this.customBlurs.push(areaItem);
                this.saveCustomBlurs();
                this.renderAreaBlurOverlay(areaItem);
            }

            this.selectionBox.remove();
            this.selectionBox = null;
            this.dragStart = null;
        };

        // 4. Mouse Up Text Selection Listener for Text Mode
        this.selectionListenerBound = () => {
            if (this.activeMode !== 'text') return;
            this.blurSelection();
        };

        // 5. Input listener to dynamically scan input field values as the user types
        this.inputListenerBound = (e) => {
            const input = e.target;
            if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
                this.scanFormFields(input);
            }
        };

        // Attach mouse & input events
        document.addEventListener('mouseover', this.hoverListenerBound);
        document.addEventListener('click', this.clickListenerBound, true);
        document.addEventListener('mousedown', this.dragStartListenerBound);
        document.addEventListener('mousemove', this.dragMoveListenerBound);
        document.addEventListener('mouseup', this.dragEndListenerBound);
        document.addEventListener('mouseup', this.selectionListenerBound);
        document.addEventListener('input', this.inputListenerBound);
    },

    cleanupInteractiveListeners() {
        if (this.hoverListenerBound) {
            document.removeEventListener('mouseover', this.hoverListenerBound);
        }
        if (this.clickListenerBound) {
            document.removeEventListener('click', this.clickListenerBound, true);
        }
        if (this.dragStartListenerBound) {
            document.removeEventListener('mousedown', this.dragStartListenerBound);
        }
        if (this.dragMoveListenerBound) {
            document.removeEventListener('mousemove', this.dragMoveListenerBound);
        }
        if (this.dragEndListenerBound) {
            document.removeEventListener('mouseup', this.dragEndListenerBound);
        }
        if (this.selectionListenerBound) {
            document.removeEventListener('mouseup', this.selectionListenerBound);
        }
        if (this.inputListenerBound) {
            document.removeEventListener('input', this.inputListenerBound);
        }
    },

    // Get unique CSS Selector for clicked element
    getUniqueSelector(el) {
        if (el.id) return `#${el.id}`;
        let path = [];
        while (el.nodeType === Node.ELEMENT_NODE) {
            let selector = el.nodeName.toLowerCase();
            if (el.className) {
                const classes = el.className.split(/\s+/).filter(c => 
                    c && 
                    !c.startsWith('kiguard-') && 
                    !c.includes('hover')
                );
                if (classes.length > 0) {
                    selector += '.' + classes.join('.');
                }
            }
            let sib = el, nth = 1;
            while (sib = sib.previousElementSibling) {
                if (sib.nodeName.toLowerCase() === el.nodeName.toLowerCase()) {
                    nth++;
                }
            }
            if (nth > 1) {
                selector += `:nth-of-type(${nth})`;
            }
            path.unshift(selector);
            el = el.parentNode;
        }
        return path.join(' > ');
    },

    // Render static area blur overlay box
    renderAreaBlurOverlay(item) {
        const overlay = document.createElement('div');
        overlay.className = 'kiguard-area-blur-overlay';
        overlay.style.left = `${item.left}px`;
        overlay.style.top = `${item.top}px`;
        overlay.style.width = `${item.width}px`;
        overlay.style.height = `${item.height}px`;

        // Click to remove individual overlay
        overlay.addEventListener('click', (e) => {
            e.stopPropagation();
            overlay.remove();
            this.customBlurs = this.customBlurs.filter(b => 
                !(b.type === 'area' && b.top === item.top && b.left === item.left)
            );
            this.saveCustomBlurs();
        });

        document.body.appendChild(overlay);
    },

    // Apply custom blurs on load / mutations
    applyCustomBlurs() {
        this.customBlurs.forEach(item => {
            if (item.type === 'element') {
                try {
                    const el = document.querySelector(item.selector);
                    if (el && !el.classList.contains('kiguard-user-blurred')) {
                        el.classList.add('kiguard-user-blurred');
                    }
                } catch (e) {
                    // Selector might be transient
                }
            } else if (item.type === 'area') {
                const exists = Array.from(document.querySelectorAll('.kiguard-area-blur-overlay'))
                    .some(ov => ov.style.left === `${item.left}px` && ov.style.top === `${item.top}px`);
                if (!exists) {
                    this.renderAreaBlurOverlay(item);
                }
            }
        });
    },

    // Storage interactions
    loadCustomBlurs(callback) {
        chrome.storage.local.get(['kiguardCustomBlurs'], (res) => {
            const allSaved = res.kiguardCustomBlurs || [];
            this.customBlurs = allSaved.filter(b => b.host === window.location.hostname);
            callback && callback();
        });
    },

    saveCustomBlurs() {
        chrome.storage.local.get(['kiguardCustomBlurs'], (res) => {
            const allSaved = res.kiguardCustomBlurs || [];
            const filtered = allSaved.filter(b => b.host !== window.location.hostname);
            const newSaved = [...filtered, ...this.customBlurs];
            chrome.storage.local.set({ kiguardCustomBlurs: newSaved });
        });
    },

    clearAllCustomBlurs() {
        document.querySelectorAll('.kiguard-user-blurred').forEach(el => {
            el.classList.remove('kiguard-user-blurred');
        });
        document.querySelectorAll('.kiguard-area-blur-overlay').forEach(el => el.remove());
        this.customBlurs = [];
        this.saveCustomBlurs();
    },

    // ─── Floating Toolbar Renderer ────────────────────────────────
    renderToolbar() {
        if (this.toolbarEl) this.toolbarEl.remove();

        const bar = document.createElement('div');
        bar.className = `kiguard-blur-toolbar ${this.toolbarVisible ? '' : 'collapsed'}`;
        
        bar.innerHTML = `
            <button class="kiguard-blur-toolbar-btn active" data-mode="normal" data-tooltip="Chế độ lướt web">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </button>
            <button class="kiguard-blur-toolbar-btn" data-mode="element" data-tooltip="Click để mờ phần tử (Element)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>
            </button>
            <button class="kiguard-blur-toolbar-btn" data-mode="area" data-tooltip="Kéo để mờ vùng chọn (Area)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-dasharray="4 4"/><circle cx="12" cy="12" r="2"/></svg>
            </button>
            <button class="kiguard-blur-toolbar-btn" data-mode="text" data-tooltip="Bôi đen để mờ chữ (Text)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>
            </button>
            
            <div class="kiguard-toolbar-divider"></div>
            
            <div class="kiguard-slider-container" data-tooltip="Độ mờ của nội dung">
                <span>Blur</span>
                <input type="range" min="2" max="30" value="${this.blurIntensity}">
            </div>
            
            <div class="kiguard-toolbar-divider"></div>
            
            <button class="kiguard-blur-toolbar-btn" id="kiguard-clear-btn" data-tooltip="Xóa hết các mờ">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
            <button class="kiguard-blur-toolbar-btn" id="kiguard-close-btn" data-tooltip="Ẩn thanh công cụ (Alt+Shift+T)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        `;

        bar.querySelectorAll('.kiguard-blur-toolbar-btn[data-mode]').forEach(btn => {
            btn.addEventListener('click', () => {
                bar.querySelectorAll('.kiguard-blur-toolbar-btn[data-mode]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeMode = btn.getAttribute('data-mode');
                
                document.querySelectorAll('.kiguard-blur-hover-highlight').forEach(el => {
                    el.classList.remove('kiguard-blur-hover-highlight');
                });
            });
        });

        const slider = bar.querySelector('.kiguard-slider-container input');
        slider.addEventListener('input', (e) => {
            this.blurIntensity = parseInt(e.target.value, 10);
            this.updateBlurIntensityCSS();
            chrome.storage.local.set({ kiguardBlurIntensity: this.blurIntensity });
        });

        bar.querySelector('#kiguard-clear-btn').addEventListener('click', () => {
            if (confirm('Bạn có chắc chắn muốn xóa mọi vùng mờ tự tạo trên trang này?')) {
                this.clearAllCustomBlurs();
            }
        });

        bar.querySelector('#kiguard-close-btn').addEventListener('click', () => {
            this.toggleToolbarVisibility(false);
        });

        document.body.appendChild(bar);
        this.toolbarEl = bar;
    },

    toggleToolbarVisibility(forceShow) {
        const show = forceShow !== undefined ? forceShow : !this.toolbarVisible;
        this.toolbarVisible = show;
        
        chrome.storage.local.set({ kiguardToolbarVisible: show });

        if (this.toolbarEl) {
            if (show) {
                this.toolbarEl.classList.remove('collapsed');
            } else {
                this.toolbarEl.classList.add('collapsed');
            }
        }
    }
};

// Auto-initialize
if (typeof window !== 'undefined') {
    DataBlurShield.init();
}

