document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const targetUrl = urlParams.get('url');
    const reason = urlParams.get('reason');
    const spoof = urlParams.get('spoof');
    const unicode = urlParams.get('unicode');
    const desc = urlParams.get('desc');
    const punycode = urlParams.get('punycode');

    const domainDisplay = document.getElementById('domain-display');
    const btnBack = document.getElementById('btn-back');
    const btnContinue = document.getElementById('btn-continue');
    const linkReport = document.getElementById('link-report');
    const blockTitle = document.getElementById('block-title');
    const blockDesc = document.getElementById('block-desc');
    const homographDetails = document.getElementById('homograph-details');

    let domain = "Không xác định";
    if (targetUrl) {
        try {
            const parsedUrl = new URL(targetUrl);
            domain = parsedUrl.hostname;
        } catch (e) {
            console.error("Invalid URL:", targetUrl);
        }
    }
    if (domainDisplay) {
        domainDisplay.textContent = unicode || domain;
    }

    // Check if blocked due to IDN Homograph / Punycode Attack
    if (reason === 'homograph') {
        if (blockTitle) {
            blockTitle.textContent = 'Cảnh báo tên miền giả mạo';
        }
        if (blockDesc) {
            blockDesc.textContent = 'Trang web này sử dụng các ký tự nhìn giống chữ cái thông thường để mạo danh một thương hiệu khác. Việc truy cập có thể khiến bạn bị đánh cắp tài khoản hoặc dữ liệu quan trọng.';
        }
        if (homographDetails) {
            homographDetails.style.display = 'block';
            const brandEl = document.getElementById('homograph-brand');
            const unicodeEl = document.getElementById('homograph-unicode');
            const punycodeEl = document.getElementById('homograph-punycode');
            const reasonEl = document.getElementById('homograph-reason');

            if (brandEl) brandEl.textContent = spoof ? spoof.toUpperCase() : 'Chưa xác định';
            if (unicodeEl) unicodeEl.textContent = unicode || domain;
            if (punycodeEl) punycodeEl.textContent = punycode || domain;
            if (reasonEl) reasonEl.textContent = desc || 'Phát hiện ký tự phi Latin có hình dáng tương tự chữ cái Latin.';
        }
    }

    // Quay lại an toàn
    if (btnBack) {
        btnBack.addEventListener('click', () => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                closeTab();
            }
        });
    }

    function closeTab() {
        if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.getCurrent) {
            chrome.tabs.getCurrent((tab) => {
                if (tab && typeof tab.id !== 'undefined') {
                    chrome.tabs.remove(tab.id);
                } else {
                    window.close();
                }
            });
        } else {
            window.close();
        }
    }

    // Tiếp tục truy cập
    if (btnContinue) {
        btnContinue.addEventListener('click', () => {
            if (targetUrl && domain !== "Không xác định") {
                chrome.runtime.sendMessage({ action: "whitelistDomainTemp", domain: domain }, () => {
                    window.location.href = targetUrl;
                });
            }
        });
    }

    // Báo cáo nhầm lẫn
    if (linkReport) {
        linkReport.addEventListener('click', (e) => {
            e.preventDefault();
            alert(`Cảm ơn bạn. Yêu cầu xem xét trang web ${domain} đã được ghi nhận.`);
        });
    }
});
