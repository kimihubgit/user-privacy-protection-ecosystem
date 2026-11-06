import { Sparkles, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import './AiChatbotIntro.css';

export default function AiChatbotIntro({ onAiChatToggle }) {
  return (
    <section className="chatbot-intro-section">
      <div className="container chatbot-intro-container">

        {/* Left Column: Info & Action */}
        <div className="chatbot-intro-content">
          <div className="chatbot-intro-badge">
            <Sparkles size={14} className="sparkle-icon-spin" />
            <span>Trợ Lý Trí Tuệ Nhân Tạo</span>
          </div>

          <h2 className="chatbot-intro-title">
            Trò chuyện cùng <span>Trợ lý AI Bảo mật</span>
          </h2>

          <p className="chatbot-intro-desc">
            Trải nghiệm công nghệ AI thế hệ mới được tối ưu riêng để bảo vệ người dùng trước các nguy cơ mạng. Giải đáp thắc mắc, phân tích nguy cơ và hướng dẫn bảo mật thời gian thực.
          </p>

          <div className="chatbot-intro-features">
            <div className="chatbot-intro-feat-item">
              <div className="chatbot-intro-feat-icon">
                <ShieldCheck size={18} />
              </div>
              <div className="chatbot-intro-feat-text">
                <h4>Hỗ trợ bảo mật 24/7</h4>
                <p>Luôn sẵn sàng trả lời các câu hỏi về dấu hiệu lừa đảo và cách xử lý sự cố an toàn thông tin.</p>
              </div>
            </div>

            <div className="chatbot-intro-feat-item">
              <div className="chatbot-intro-feat-icon">
                <Zap size={18} />
              </div>
              <div className="chatbot-intro-feat-text">
                <h4>Phân tích nhanh & Chính xác</h4>
                <p>Nhận diện các đường link giả mạo và phân tích rủi ro tên miền chỉ trong vài giây.</p>
              </div>
            </div>
          </div>

          <button className="chatbot-intro-cta-btn" onClick={onAiChatToggle}>
            <span>Trò chuyện ngay</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Right Column: Chat UI Mockup */}
        <div className="chatbot-intro-mockup">
          <div className="chat-mockup-window">
            <div className="chat-mockup-header">
              <div className="chat-mockup-status">
                <span className="chat-mockup-pulse"></span>
                <span>Trợ lý AI shield</span>
              </div>
              <div className="chat-mockup-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>

            <div className="chat-mockup-body">
              <div className="chat-mockup-bubble bot">
                <div className="chat-mockup-avatar">AI</div>
                <div className="chat-mockup-text-wrapper">
                  <p>Xin chào! Tôi có thể giúp gì cho bạn hôm nay?</p>
                </div>
              </div>

              <div className="chat-mockup-bubble user">
                <div className="chat-mockup-avatar user-avatar">U</div>
                <div className="chat-mockup-text-wrapper">
                  <p>Làm sao để tôi biết một trang web có lừa đảo không?</p>
                </div>
              </div>

              <div className="chat-mockup-bubble bot">
                <div className="chat-mockup-avatar">AI</div>
                <div className="chat-mockup-text-wrapper">
                  <p>Hãy dán đường link vào thanh tìm kiếm ở đầu trang để hệ thống đối soát cơ sở dữ liệu. Hoặc gửi trực tiếp link ở đây, tôi sẽ hướng dẫn bạn phân tích các dấu hiệu lừa đảo phổ biến.</p>
                </div>
              </div>

              <div className="chat-mockup-bubble user">
                <div className="chat-mockup-avatar user-avatar">U</div>
                <div className="chat-mockup-text-wrapper">
                  <p>Tuyệt vời! Cảm ơn AI.</p>
                </div>
              </div>
            </div>

            <div className="chat-mockup-footer">
              <div className="chat-mockup-input-sim">
                <span>Hỏi trợ lý AI về an toàn mạng...</span>
              </div>
              <button className="chat-mockup-send-sim">
                Gửi
              </button>
            </div>
          </div>

          {/* Decorative glows */}
          <div className="mockup-background-glow"></div>
        </div>

      </div>
    </section>
  );
}
