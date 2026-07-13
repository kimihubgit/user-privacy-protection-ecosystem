document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const targetUrl = urlParams.get('url');
    const domainDisplay = document.getElementById('domain-display');
    const btnBack = document.getElementById('btn-back');
    const btnContinue = document.getElementById('btn-continue');
    const linkReport = document.getElementById('link-report');

    let domain = "Không xác định";
    if (targetUrl) {
        try {
            const parsedUrl = new URL(targetUrl);
            domain = parsedUrl.hostname;
        } catch (e) {
            console.error("Invalid URL:", targetUrl);
        }
    }
    domainDisplay.textContent = domain;

    // Quay lại trang an toàn
    btnBack.addEventListener('click', () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // Nếu không quay lại được (tab mới), cố gắng đóng tab hoặc về trang chủ
            window.close();
            setTimeout(() => {
                window.location.href = "https://www.google.com";
            }, 200);
        }
    });

    // Vẫn tiếp tục truy cập (Tạm thời bỏ qua bảo vệ cho tên miền này)
    btnContinue.addEventListener('click', () => {
        if (targetUrl && domain !== "Không xác định") {
            // Gửi tin nhắn để background.js bỏ qua tên miền này trong phiên làm việc hiện tại
            chrome.runtime.sendMessage({ action: "whitelistDomainTemp", domain: domain }, () => {
                window.location.href = targetUrl;
            });
        }
    });

    // Báo cáo nhầm lẫn
    linkReport.addEventListener('click', (e) => {
        e.preventDefault();
        alert(`Cảm ơn bạn. Yêu cầu xem xét lại trang web ${domain} đã được ghi nhận.`);
    });
});
