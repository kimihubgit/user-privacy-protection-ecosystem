const FbHideSuggested = {
    init() {
        chrome.storage.local.get(['block_suggested_posts'], (result) => {
            if (result.block_suggested_posts === true) {
                this.start();
            }
        });

        // Listen for storage changes
        chrome.storage.onChanged.addListener((changes, area) => {
            if (changes.block_suggested_posts) {
                if (changes.block_suggested_posts.newValue === true) {
                    this.start();
                } else {
                    this.stop();
                }
            }
        });
    },

    styleId: 'kiguard-hide-suggested-style',
    observer: null,

    start() {
        if (document.getElementById(this.styleId)) return;

        // Inject style to hide suggested posts
        const style = document.createElement('style');
        style.id = this.styleId;
        style.textContent = '.kiguard-hide-suggested { display: none !important; }';
        (document.head || document.documentElement).appendChild(style);

        // Run initial scan
        this.scan();

        // Observe dynamic updates
        this.observer = new MutationObserver(() => {
            this.scan();
        });
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    },

    stop() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        const style = document.getElementById(this.styleId);
        if (style) style.remove();

        document.querySelectorAll('.kiguard-hide-suggested').forEach(el => {
            el.classList.remove('kiguard-hide-suggested');
        });
    },

    scan() {
        const triggers = new Set(['Suggested for you', 'Đề xuất cho bạn', 'Suggested', 'Được tài trợ', 'Sponsored']);
        document.querySelectorAll('div[data-focus="feed_story"]').forEach(story => {
            const container = story.closest('div.x1lliihq') || story;
            if (container.classList.contains('kiguard-hide-suggested')) return;

            // Check if any span contains suggested keywords
            const spans = story.querySelectorAll('span');
            let isSuggested = false;
            for (const span of spans) {
                const text = span.textContent?.trim();
                if (text && triggers.has(text)) {
                    isSuggested = true;
                    break;
                }
            }

            if (isSuggested) {
                container.classList.add('kiguard-hide-suggested');
                console.log('[KiGuard] Blocked suggested Facebook post');
            }
        });
    }
};

// Auto initialize
FbHideSuggested.init();
