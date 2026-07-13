(() => {
    let preventReloadEnabled = false;

    // Spoof visibility properties if enabled
    const origHidden = Object.getOwnPropertyDescriptor(Document.prototype, 'hidden');
    const origVisibilityState = Object.getOwnPropertyDescriptor(Document.prototype, 'visibilityState');

    Object.defineProperty(document, 'hidden', {
        configurable: true,
        get() {
            return preventReloadEnabled ? false : (origHidden?.get?.call(this) ?? false);
        }
    });

    Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get() {
            return preventReloadEnabled ? 'visible' : (origVisibilityState?.get?.call(this) ?? 'visible');
        }
    });

    // Block page visibility listeners
    const blockedEvents = new Set(['visibilitychange', 'focus', 'blur', 'pageshow', 'pagehide']);
    const origDocAddListener = document.addEventListener.bind(document);
    const origWinAddListener = window.addEventListener.bind(window);

    const wrapAddListener = (originalFn) => {
        return (...args) => {
            const eventName = args[0];
            if (preventReloadEnabled && blockedEvents.has(eventName)) {
                return; // block registration
            }
            originalFn(...args);
        };
    };

    document.addEventListener = wrapAddListener(origDocAddListener);
    window.addEventListener = wrapAddListener(origWinAddListener);

    // Listen to bridge events from isolated world
    origDocAddListener('__KIGUARD_FB_NO_RELOAD__', (e) => {
        preventReloadEnabled = !!e.detail?.enabled;
        console.log('[KiGuard] Prevent Facebook Feed Reload:', preventReloadEnabled);
    });
})();
