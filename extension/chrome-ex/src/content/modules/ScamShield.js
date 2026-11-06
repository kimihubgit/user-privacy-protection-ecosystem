const ScamShield = {
    init() {
        const currentDomain = window.location.hostname;
        
        // Query background script to check domain safety
        chrome.runtime.sendMessage({ action: "checkDomain", domain: currentDomain }, (response) => {
            if (response && response.isScam) {
                this.showWarning(currentDomain, response.homograph);
            }
        });
    },

    showWarning(domain, homographData) {
        if (document.getElementById("scam-guard-warning-overlay")) return;

        const isHomograph = !!homographData;
        const title = isHomograph ? "Cảnh báo tên miền giả mạo" : "Cảnh báo trang web lừa đảo";
        
        let messageHtml = '';
        if (isHomograph) {
            const brand = homographData.spoofedBrand ? homographData.spoofedBrand.toUpperCase() : 'thương hiệu uy tín';
            messageHtml = `
                <p style="margin-bottom: 12px; color: #cbd5e1; font-size: 14px; line-height: 1.5;">
                    Trang web này đang sử dụng tên miền có ký tự tương tự để mạo danh <strong>${brand}</strong>.
                </p>
                <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px; font-size: 12.5px; text-align: left; margin-bottom: 14px; line-height: 1.6;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span style="color: #94a3b8;">Tên miền hiển thị:</span>
                        <code style="color: #f8fafc; font-weight: 500;">${homographData.unicodeDomain || domain}</code>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span style="color: #94a3b8;">Tên miền thực tế (Punycode):</span>
                        <code style="color: #93c5fd; font-weight: 500;">${homographData.punycodeDomain || domain}</code>
                    </div>
                    <div style="color: #fca5a5; font-size: 12px; margin-top: 6px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 6px;">
                        ${homographData.reason || 'Ký tự hiển thị không khớp với bảng mã ký tự tiêu chuẩn.'}
                    </div>
                </div>
                <p style="color: #f87171; font-size: 13px; margin: 0 0 16px; font-weight: 500;">
                    Không nhập thông tin đăng nhập hoặc dữ liệu tài chính tại đây.
                </p>
            `;
        } else {
            messageHtml = `
                <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 18px;">
                    Trang web <strong>${domain}</strong> nằm trong danh sách cảnh báo lừa đảo. Vui lòng không cung cấp thông tin cá nhân.
                </p>
            `;
        }

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
                <h1 class="scam-guard-title">${title}</h1>
                <div class="scam-guard-message">
                    ${messageHtml}
                </div>
                <div class="scam-guard-actions">
                    <button id="scam-guard-back-btn" class="scam-guard-btn primary">Quay lại an toàn</button>
                    <button id="scam-guard-continue-btn" class="scam-guard-btn secondary">Bỏ qua và tiếp tục</button>
                </div>
                <div class="scam-guard-footer">
                    Bảo vệ bởi KiGuard
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
