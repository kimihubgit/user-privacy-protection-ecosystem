import { CONFIG } from '../config.js';

// Populate dynamic values from CONFIG
document.addEventListener('DOMContentLoaded', () => {
    const welcomeAppName = document.getElementById('welcome-app-name');
    const welcomeAppVersion = document.getElementById('welcome-app-version');
    const welcomeFooterAppName = document.getElementById('welcome-footer-app-name');
    const welcomeFooterAuthorLink = document.getElementById('welcome-footer-author-link');

    if (welcomeAppName) welcomeAppName.textContent = `Chào mừng tới ${CONFIG.APP_NAME}`;
    if (welcomeAppVersion) welcomeAppVersion.textContent = `v${CONFIG.VERSION}`;
    if (welcomeFooterAppName) welcomeFooterAppName.textContent = `${CONFIG.APP_NAME} Detector`;
    if (welcomeFooterAuthorLink) {
        welcomeFooterAuthorLink.href = CONFIG.HOMEPAGE_URL;
        welcomeFooterAuthorLink.textContent = CONFIG.AUTHOR;
    }
});

document.getElementById('btn-start').addEventListener('click', () => {
    chrome.storage.local.set({ termsAccepted: true }, () => {
        chrome.tabs.getCurrent((tab) => {
            if (tab && tab.id) {
                chrome.tabs.remove(tab.id);
            } else {
                window.close();
            }
        });
    });
});

// Check if extension is pinned on toolbar and update the UI dynamically
function checkPinStatus() {
    if (typeof chrome !== 'undefined' && chrome.action && typeof chrome.action.getUserSettings === 'function') {
        chrome.action.getUserSettings().then(settings => {
            if (settings.isOnToolbar) {
                const pinGuide = document.querySelector('.pin-guide');
                if (pinGuide) {
                    pinGuide.style.background = 'rgba(80, 205, 137, 0.04)';
                    pinGuide.style.borderColor = 'rgba(80, 205, 137, 0.25)';

                    const icon = pinGuide.querySelector('.pin-icon');
                    if (icon) {
                        icon.textContent = '✅';
                        icon.style.animation = 'none';
                    }

                    const title = pinGuide.querySelector('.pin-text-title');
                    if (title) title.textContent = 'Đã ghim KiGuard thành công!';

                    const desc = pinGuide.querySelector('.pin-text-desc');
                    if (desc) {
                        desc.textContent = 'Cảm ơn bạn! Biểu tượng KiGuard hiện đã xuất hiện trên thanh công cụ.';
                        desc.style.marginBottom = '0px';
                    }

                    const imgWrapper = pinGuide.querySelector('.pin-image-wrapper');
                    if (imgWrapper) imgWrapper.style.display = 'none';
                }
            }
        }).catch(err => console.log('Error checking pin status:', err));
    }
}

// Initial check & poll every second to update UI instantly when user pins it
checkPinStatus();
setInterval(checkPinStatus, 1000);

