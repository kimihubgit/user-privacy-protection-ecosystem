const ScamShield = {
    init() {
        const currentDomain = window.location.hostname;
        
        // Query background script to check domain safety
        chrome.runtime.sendMessage({ action: "checkDomain", domain: currentDomain }, (response) => {
            if (response && response.isScam) {
                this.showWarning(currentDomain);
            }
        });
    },

    showWarning(domain) {
        if (document.getElementById("scam-guard-warning-overlay")) return;

        const overlay = document.createElement("div");
        overlay.id = "scam-guard-warning-overlay";
        overlay.innerHTML = `
            <div class="scam-guard-container">
                <div class="scam-guard-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                </div>
                <h1 class="scam-guard-title">CẢNH BÁO LỪA ĐẢO!</h1>
                <p class="scam-guard-message">
                    Trang web <strong>${domain}</strong> đã bị báo cáo là trang web lừa đảo, giả mạo hoặc chứa mã độc. 
                    Vì sự an toàn của bạn, chúng tôi khuyên bạn không nên tiếp tục truy cập hoặc nhập bất kỳ thông tin nhạy cảm nào tại đây.
                </p>
                <div class="scam-guard-actions">
                    <button id="scam-guard-back-btn" class="scam-guard-btn primary">Quay lại an toàn</button>
                    <button id="scam-guard-continue-btn" class="scam-guard-btn secondary">Tôi hiểu rủi ro, tiếp tục truy cập</button>
                </div>
                <div class="scam-guard-footer">
                    Bảo vệ bởi Scam Guard Extension &bull; Dữ liệu từ Hệ thống Telegram Bot
                </div>
            </div>
        `;

        document.documentElement.appendChild(overlay);

        document.getElementById("scam-guard-back-btn").addEventListener("click", () => {
            window.history.back();
            setTimeout(() => {
                window.close();
                window.location.href = "https://www.google.com";
            }, 300);
        });

        document.getElementById("scam-guard-continue-btn").addEventListener("click", () => {
            overlay.style.display = "none";
        });
    }
};
