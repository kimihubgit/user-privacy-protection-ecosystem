/**
 * SearchResultShield – KiGuard Search Results Safety Inspector
 * Automatically inspects search result links on search engines (Google, Bing, DuckDuckGo, Yahoo, Yandex, Baidu)
 * and renders safety badges (Safe / Warning / Neutral) next to each result.
 */

const SearchResultShield = {
    domainCache: {},
    observer: null,

    init() {
        chrome.storage.local.get(['globalEnabled', 'webShieldActive'], (res) => {
            const isGlobal = res.globalEnabled !== false;
            const isShieldActive = res.webShieldActive !== false;
            if (isGlobal && isShieldActive) {
                this.start();
            }
        });

        chrome.storage.onChanged.addListener((changes, area) => {
            if (area === 'local' && (changes.globalEnabled || changes.webShieldActive)) {
                chrome.storage.local.get(['globalEnabled', 'webShieldActive'], (res) => {
                    const isGlobal = res.globalEnabled !== false;
                    const isShieldActive = res.webShieldActive !== false;
                    if (isGlobal && isShieldActive) {
                        this.start();
                    } else {
                        this.stop();
                    }
                });
            }
        });
    },

    isSearchEnginePage() {
        const host = window.location.hostname.toLowerCase();
        return /google\.|bing\.|yahoo\.|duckduckgo\.|baidu\.|yandex\.|ecosia\.|startpage\./i.test(host);
    },

    start() {
        if (!this.isSearchEnginePage()) return;

        this.scanSearchResults();

        if (!this.observer && document.body) {
            let debounceTimer = null;
            this.observer = new MutationObserver(() => {
                if (debounceTimer) clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.scanSearchResults();
                }, 400);
            });

            this.observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    },

    stop() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        document.querySelectorAll('.kiguard-search-badge').forEach(badge => badge.remove());
        document.querySelectorAll('[data-kiguard-checked]').forEach(el => el.removeAttribute('data-kiguard-checked'));
    },

    scanSearchResults() {
        const host = window.location.hostname.toLowerCase();
        let selectors = [];

        if (host.includes('google.')) {
            selectors = [
                '#search div.g a[href^="http"]',
                '#rso div.g a[href^="http"]',
                'div.tF2Cfa > a[href^="http"]',
                'div.yuRUbf > a[href^="http"]',
                'div[data-sokoban-container] a[href^="http"]'
            ];
        } else if (host.includes('bing.')) {
            selectors = [
                '#b_results li.b_algo h2 a[href^="http"]',
                '#b_results li.b_ad h2 a[href^="http"]'
            ];
        } else if (host.includes('duckduckgo.')) {
            selectors = [
                'a[data-testid="result-title-a"]',
                'article h2 a[href^="http"]'
            ];
        } else if (host.includes('yahoo.')) {
            selectors = [
                '#web ol.reg li div.compTitle a[href^="http"]'
            ];
        } else if (host.includes('yandex.')) {
            selectors = [
                'li.serp-item a.link_theme_normal[href^="http"]',
                'div.serp-item h2 a[href^="http"]'
            ];
        } else if (host.includes('baidu.')) {
            selectors = [
                'div.result h3 a[href^="http"]'
            ];
        } else {
            selectors = [
                '.result h2 a[href^="http"]',
                '.search-result h3 a[href^="http"]'
            ];
        }

        const anchors = Array.from(document.querySelectorAll(selectors.join(',')));

        anchors.forEach(a => {
            if (a.dataset.kiguardChecked) return;

            const href = a.getAttribute('href') || a.href;
            if (!href || href.startsWith('javascript:') || href.startsWith('#')) return;

            let targetUrl;
            try {
                targetUrl = new URL(href, window.location.origin);
            } catch (e) {
                return;
            }

            const targetDomain = targetUrl.hostname.toLowerCase();
            const currentDomain = window.location.hostname.toLowerCase();
            const baseCurrentDomain = currentDomain.replace(/^www\./, '');

            // Exclude search engine internal links
            if (targetDomain.includes(baseCurrentDomain) ||
                targetDomain.includes('google.') ||
                targetDomain.includes('gstatic.com') ||
                targetDomain.includes('bing.com') ||
                targetDomain.includes('microsoft.com') ||
                targetDomain.includes('yahoo.com') ||
                targetDomain.includes('duckduckgo.com') ||
                targetDomain.includes('yandex.')) {
                return;
            }

            if (!a.textContent || a.textContent.trim().length < 2) return;

            a.dataset.kiguardChecked = "true";

            // If status is cached
            if (this.domainCache[targetDomain]) {
                this.renderBadge(a, targetDomain, this.domainCache[targetDomain]);
                return;
            }

            // Query background Service Worker
            try {
                chrome.runtime.sendMessage({ action: "checkDomain", domain: targetDomain }, (response) => {
                    const status = (response && response.status) ? response.status : 'checking';
                    this.domainCache[targetDomain] = status;
                    this.renderBadge(a, targetDomain, status);
                });
            } catch (err) {
                // Extension context invalidated, ignore
            }
        });
    },

    renderBadge(linkEl, domain, status) {
        if (!linkEl || !linkEl.parentNode) return;
        if (linkEl.querySelector('.kiguard-search-badge')) return;

        const badge = document.createElement('span');
        badge.className = `kiguard-search-badge kiguard-badge-${status}`;

        let iconSvg = '';
        let labelText = '';
        let tooltipText = '';

        if (status === 'unsafe') {
            // Dangerous / Phishing / Scam Site
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
            labelText = `Lừa đảo!`;
            tooltipText = `KiGuard CẢNH BÁO: ${domain} có trong danh sách đen lừa đảo!`;

            // Highlight container
            const container = linkEl.closest('div.g, li.b_algo, article, div.result, div.serp-item');
            if (container) {
                container.style.borderLeft = '3px solid #ef4444';
                container.style.paddingLeft = '8px';
                container.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
                container.style.borderRadius = '4px';
            }
        } else if (status === 'safe') {
            // Safe site
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>`;
            labelText = `An toàn`;
            tooltipText = `KiGuard: ${domain} được xác nhận an toàn.`;
        } else {
            // Neutral / Checking / Not Found
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="12" r="2"/></svg>`;
            labelText = `KiGuard`;
            tooltipText = `KiGuard: ${domain} chưa có báo cáo xấu.`;
        }

        badge.innerHTML = `
            <span class="kiguard-badge-icon">${iconSvg}</span>
            <span class="kiguard-badge-text">${labelText}</span>
            <span class="kiguard-badge-tooltip">${tooltipText}</span>
        `;

        linkEl.insertBefore(badge, linkEl.firstChild);
    }
};

if (typeof document !== 'undefined') {
    SearchResultShield.init();
}
