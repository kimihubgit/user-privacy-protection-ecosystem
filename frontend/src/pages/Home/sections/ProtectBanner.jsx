import { Shield } from 'lucide-react';
import './ProtectBanner.css';

const ChromeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <line x1="21.17" x2="12" y1="8" y2="8" />
    <line x1="3.95" x2="8.54" y1="6.06" y2="14" />
    <line x1="10.88" x2="15.46" y1="21.94" y2="14" />
  </svg>
);

const EdgeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h5c2.76 0 5-2.24 5-5v-3c0-2.76-2.24-5-5-5h-5c-1.66 0-3 1.34-3 3s1.34 3 3 3h5" />
  </svg>
);

const FirefoxIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="M12 6c-3 0-4 2.5-4 4s1.5 3 4 5 4-2 4-4-1.5-5-4-5z" />
    <path d="M8 11.5c.5-1 1-1.5 2-1.5s1.5 1.5 1 2.5-1.5.5-1.5 1.5" />
  </svg>
);

const SafariIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

export default function ProtectBanner({ addToast }) {
  const handleInstallClick = (browserName, link) => {
    if (addToast) {
      addToast(`Đang mở trang tải tiện ích bảo vệ cho ${browserName}...`, 'success');
    }
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div id="download-extension" className="protect-banner-card">
      <div className="protect-left">
        <h2 className="protect-title">
          CÀI ĐẶT <span>TIỆN ÍCH</span>
        </h2>
      </div>
      <div className="protect-right">
        <p className="protect-desc">
          shield hoạt động hoàn toàn miễn phí vì cộng đồng. Tiện ích tự động cảnh báo và bảo vệ bạn an toàn trước các cuộc tấn công giả mạo và website lừa đảo.
        </p>
        <div className="protect-buttons-grid">
          <button
            onClick={() => handleInstallClick('Chrome', 'https://chrome.google.com/webstore')}
            className="grid-btn btn-chrome"
          >
            <ChromeIcon />
            Chrome Extension
          </button>
          <button
            onClick={() => handleInstallClick('Microsoft Edge', 'https://microsoftedge.microsoft.com/addons')}
            className="grid-btn btn-edge"
          >
            <EdgeIcon />
            Edge Extension
          </button>
          <button
            onClick={() => handleInstallClick('Mozilla Firefox', 'https://addons.mozilla.org')}
            className="grid-btn btn-firefox"
          >
            <FirefoxIcon />
            Firefox Extension
          </button>
          <button
            onClick={() => handleInstallClick('Safari & Khác', 'https://shield.vn')}
            className="grid-btn btn-safari"
          >
            <SafariIcon />
            Safari Extension
          </button>
        </div>
      </div>
      <Shield className="protect-watermark" style={{ opacity: 0.05, color: '#23b56c' }} />
    </div>
  );
}
