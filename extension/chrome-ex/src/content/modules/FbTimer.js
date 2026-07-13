const FbTimer = {
    totalSec: 0,
    lastTimestamp: 0,
    el: null,
    isHidden: false,
    trackTimer: null,
    saveTimer: null,
    lastSavedSec: -1,

    init() {
        chrome.storage.local.get(['show_facebook_time_counter'], (result) => {
            if (result.show_facebook_time_counter === true) {
                this.start();
            }
        });

        // Listen for storage changes
        chrome.storage.onChanged.addListener((changes) => {
            if (changes.show_facebook_time_counter) {
                if (changes.show_facebook_time_counter.newValue === true) {
                    this.start();
                } else {
                    this.stop();
                }
            }
        });
    },

    start() {
        if (document.getElementById('kiguard_fb_timer')) return;

        // Create widget container
        const container = document.createElement('div');
        container.id = 'kiguard_fb_timer';
        container.title = 'Nhấp chuột để ẩn tạm thời. Bạn có thể bật/tắt trong cài đặt tiện ích.';
        
        container.style.cssText = `
            position: fixed !important;
            bottom: 52px !important;
            left: 15px !important;
            text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8) !important;
            color: #ffffff !important;
            padding: 6px 12px !important;
            background-color: rgba(30, 30, 45, 0.85) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 8px !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            font-family: 'Inter', sans-serif !important;
            z-index: 2147483647 !important;
            cursor: pointer !important;
            backdrop-filter: blur(5px) !important;
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
            transition: opacity 0.2s !important;
        `;

        if (document.querySelector('#facebook.__fb-dark-mode')) {
            container.style.color = '#50cd89'; // Metronic green accent for dark mode
        }

        container.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span class="kiguard_timer_val">00:00:00</span>
        `;

        this.el = container.querySelector('.kiguard_timer_val');
        document.body.appendChild(container);

        container.addEventListener('click', () => {
            container.style.display = 'none';
            this.isHidden = true;
        });

        this.loadSavedTime();
    },

    stop() {
        this.clearTimers();
        const container = document.getElementById('kiguard_fb_timer');
        if (container) container.remove();
        this.el = null;
    },

    clearTimers() {
        if (this.trackTimer) {
            clearTimeout(this.trackTimer);
            this.trackTimer = null;
        }
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
            this.saveTimer = null;
        }
    },

    loadSavedTime() {
        chrome.storage.local.get(['fb_timer_second', 'fb_timer_date'], (data) => {
            const today = this.getTodayString();
            if (data.fb_timer_date === today) {
                this.totalSec = parseInt(data.fb_timer_second || '0');
            } else {
                this.totalSec = 0;
            }
            this.lastTimestamp = today;

            if (!document.hidden) {
                this.track();
                this.autoSave();
            }

            document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
            window.addEventListener('unload', () => this.saveToStorage(true));
        });
    },

    handleVisibilityChange() {
        if (document.hidden) {
            this.clearTimers();
            this.saveToStorage(true);
        } else if (!this.isHidden) {
            this.clearTimers();
            this.track();
            this.autoSave();
        }
    },

    track() {
        const today = this.getTodayString();
        if (today !== this.lastTimestamp) {
            this.totalSec = 0;
            this.lastTimestamp = today;
        }

        this.totalSec++;
        this.updateUI();

        if (!this.isHidden && !document.hidden) {
            this.trackTimer = setTimeout(() => this.track(), 1000);
        } else {
            this.trackTimer = null;
        }
    },

    updateUI() {
        if (!this.el) return;
        const hrs = Math.floor(this.totalSec / 3600);
        const mins = Math.floor((this.totalSec % 3600) / 60);
        const secs = this.totalSec % 60;

        const pad = (num) => String(num).padStart(2, '0');
        this.el.textContent = `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    },

    getTodayString() {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}${mm}${dd}`;
    },

    autoSave() {
        this.saveToStorage();
        if (!document.hidden) {
            this.saveTimer = setTimeout(() => this.autoSave(), 30000);
        } else {
            this.saveTimer = null;
        }
    },

    saveToStorage(force = false) {
        if (force || this.totalSec !== this.lastSavedSec) {
            chrome.storage.local.set({
                fb_timer_second: this.totalSec,
                fb_timer_date: this.lastTimestamp
            }, () => {
                this.lastSavedSec = this.totalSec;
            });
        }
    }
};

// Auto initialize
FbTimer.init();
