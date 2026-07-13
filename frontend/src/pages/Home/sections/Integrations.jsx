import { Globe, MessageSquare, Send, ShieldAlert, Cpu, CheckCircle } from 'lucide-react';
import '../../../features/scan/components/Checker.css';

export default function Integrations() {
  return (
    <section className="integrations-global-section">
      <div className="container">
        <div className="integrations-header">
          <span className="integrations-badge">Hệ Sinh Thái Bảo Vệ</span>
          <h2 className="integrations-title">Bảo vệ toàn diện trên mọi nền tảng</h2>
          <p className="integrations-subtitle">
            Cài đặt các công cụ chính thức để tự động ngăn chặn mã độc, cảnh báo lừa đảo trực tuyến và bảo vệ tài khoản của bạn mọi lúc, mọi nơi.
          </p>
        </div>

        <div className="integrations-grid">
          {/* Integration Card 1: Browser Extension */}
          <div className="integration-card card-extension">
            <div className="floating-visual-container">
              <div className="glow-sphere green-glow"></div>
              <div className="main-floating-icon ext-icon">
                <Globe size={46} />
              </div>
              <div className="sub-floating-badge ext-badge-1">
                <CheckCircle size={14} />
              </div>
              <div className="sub-floating-badge ext-badge-2">
                <Cpu size={12} />
              </div>
            </div>

            <div className="integration-content">
              <h3>Tiện ích mở rộng</h3>
              <p className="platform-tag">Dành cho Chrome, Edge, Brave, Cốc Cốc</p>
              <p className="platform-description">
                Tự động kiểm tra độ tin cậy của website bạn đang truy cập, chặn đứng các trang giả mạo ngân hàng, ví điện tử ngay khi vừa click vào.
              </p>
              <a href="#" className="integration-action-btn">
                <span>Cài đặt Extension</span>
                <span className="btn-arrow">→</span>
              </a>
            </div>
          </div>

          {/* Integration Card 2: Zalo OA */}
          <div className="integration-card card-zalo">
            <div className="floating-visual-container">
              <div className="glow-sphere blue-glow"></div>
              <div className="main-floating-icon zalo-icon">
                <MessageSquare size={46} />
              </div>
              <div className="sub-floating-badge zalo-badge-1">
                <span>z</span>
              </div>
              <div className="sub-floating-badge zalo-badge-2">
                <CheckCircle size={12} />
              </div>
            </div>

            <div className="integration-content">
              <h3>Zalo OA & Mini App</h3>
              <p className="platform-tag">Dành cho ứng dụng Zalo</p>
              <p className="platform-description">
                Tra cứu nhanh độ uy tín của số điện thoại, tài khoản ngân hàng hoặc link web nghi ngờ trực tiếp qua tin nhắn Zalo OA, an toàn và nhanh chóng.
              </p>
              <a href="#" className="integration-action-btn">
                <span>Quan tâm trên Zalo</span>
                <span className="btn-arrow">→</span>
              </a>
            </div>
          </div>

          {/* Integration Card 3: Telegram Bot */}
          <div className="integration-card card-telegram">
            <div className="floating-visual-container">
              <div className="glow-sphere cyan-glow"></div>
              <div className="main-floating-icon telegram-icon">
                <Send size={46} />
              </div>
              <div className="sub-floating-badge tele-badge-1">
                <ShieldAlert size={14} />
              </div>
              <div className="sub-floating-badge tele-badge-2">
                <span>bot</span>
              </div>
            </div>

            <div className="integration-content">
              <h3>Telegram Security Bot</h3>
              <p className="platform-tag">Dành cho ứng dụng Telegram</p>
              <p className="platform-description">
                Tích hợp bot bảo mật thông minh vào nhóm chat của bạn để tự động quét link spam, phát hiện tin nhắn lừa đảo và cảnh báo thành viên lập tức.
              </p>
              <a href="#" className="integration-action-btn">
                <span>Kết nối Telegram Bot</span>
                <span className="btn-arrow">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
