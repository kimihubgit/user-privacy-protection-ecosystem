if (typeof Navigator !== 'undefined' && Navigator.prototype) {
    try {
        Object.defineProperty(Navigator.prototype, 'globalPrivacyControl', {
            get: () => true,
            configurable: true,
            enumerable: true
        });
    } catch (e) {
        console.warn("[KiGuard GPC] Failed to define GPC on prototype:", e);
    }
} else {
    try {
        Object.defineProperty(navigator, 'globalPrivacyControl', {
            value: true,
            configurable: true,
            writable: true,
            enumerable: true
        });
    } catch (e) {
        console.warn("[KiGuard GPC] Failed to define GPC on navigator:", e);
    }
}