import { Sparkles, Terminal, FileCode, Zap, Database, BarChart3, Key, ChevronRight } from 'lucide-react';
import './DeveloperApiBanner.css';

export default function DeveloperApiBanner({ addToast }) {
  const handleCtaClick = (actionName, link) => {
    if (addToast) {
      addToast(`Đang chuyển hướng đến tài liệu: ${actionName}...`, 'success');
    }
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="dev-api-section-wrapper">
      <div className="dev-api-banner-card">

        {/* Left Column: Title & Badge */}
        <div className="dev-api-left">
          <div className="dev-api-badge">
            <Sparkles size={12} className="dev-api-badge-icon" />
            <span>PUBLIC API MIỄN PHÍ</span>
          </div>
          <h2 className="dev-api-title">Tích hợp Hệ thống</h2>
          <p className="dev-api-desc">
            Sử dụng cơ sở dữ liệu bảo mật thời gian thực của shield để tự động nhận diện và chặn các website lừa đảo, giả mạo, mã độc trên ứng dụng, bot hoặc tiện ích của bạn.
          </p>

          {/* Overlapping glowing platform circles */}
          <div className="dev-api-platforms">
            <div className="platform-circle plat-discord" title="Tích hợp Discord Bot">
              <svg width="22" height="22" viewBox="0 0 127.14 96.36" fill="currentColor">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.9-.65,1.76-1.34,2.58-2a75.58,75.58,0,0,0,72.9,0c.82.71,1.68,1.4,2.58,2a68.66,68.66,0,0,1-10.5,5,77.55,77.55,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129.87,49.58,123.6,26.9,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
              </svg>
            </div>
            <div className="platform-circle plat-telegram" title="Tích hợp Telegram Bot">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </div>
            <div className="platform-circle plat-web" title="Tích hợp Website / API Server">
              <Terminal size={22} />
            </div>
          </div>
        </div>

        {/* Middle Column: 2x2 Feature Grid */}
        <div className="dev-api-middle">
          <button
            onClick={() => handleCtaClick('Tài liệu API', 'https://docs.shield.vn')}
            className="dev-api-grid-item"
          >
            <div className="dev-api-icon-wrap wrap-docs">
              <FileCode size={20} />
            </div>
            <div className="dev-api-item-text">
              <span className="dev-api-item-title">Tài liệu API</span>
              <span className="dev-api-item-subtitle">Cổng tích hợp chính thức</span>
            </div>
            <ChevronRight size={16} className="dev-api-arrow" />
          </button>

          <button
            onClick={() => handleCtaClick('Rate Limits', 'https://docs.shield.vn/rate-limits')}
            className="dev-api-grid-item"
          >
            <div className="dev-api-icon-wrap wrap-limits">
              <Zap size={20} />
            </div>
            <div className="dev-api-item-text">
              <span className="dev-api-item-title">Rate Limits</span>
              <span className="dev-api-item-subtitle">Tần suất truy vấn miễn phí</span>
            </div>
            <ChevronRight size={16} className="dev-api-arrow" />
          </button>

          <button
            onClick={() => handleCtaClick('JSON Support', 'https://docs.shield.vn/formats')}
            className="dev-api-grid-item"
          >
            <div className="dev-api-icon-wrap wrap-json">
              <Database size={20} />
            </div>
            <div className="dev-api-item-text">
              <span className="dev-api-item-title">Hỗ trợ JSON</span>
              <span className="dev-api-item-subtitle">Phản hồi chuẩn & SDK</span>
            </div>
            <ChevronRight size={16} className="dev-api-arrow" />
          </button>

          <button
            onClick={() => handleCtaClick('So sánh giới hạn', 'https://docs.shield.vn/pricing')}
            className="dev-api-grid-item"
          >
            <div className="dev-api-icon-wrap wrap-compare">
              <BarChart3 size={20} />
            </div>
            <div className="dev-api-item-text">
              <span className="dev-api-item-title">So sánh giới hạn</span>
              <span className="dev-api-item-subtitle">Gói miễn phí & thương mại</span>
            </div>
            <ChevronRight size={16} className="dev-api-arrow" />
          </button>
        </div>

        {/* Right Column: Blue CTA Card */}
        <div className="dev-api-right-cta">
          <div className="dev-api-cta-radial"></div>

          <div className="dev-api-cta-icon-container">
            <Key size={22} className="dev-api-cta-key-icon" />
          </div>

          <button
            onClick={() => handleCtaClick('Đăng ký API Key', 'https://shield.vn/developer')}
            className="dev-api-cta-button"
          >
            Kết nối API ngay
            <ChevronRight size={18} />
          </button>

          <span className="dev-api-cta-subtext">✓ Đăng ký nhanh. Nhận API Key tức thì.</span>
        </div>

      </div>
    </div>
  );
}
