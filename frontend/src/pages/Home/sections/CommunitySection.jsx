import { Users, Send, MessageSquare, ShieldAlert, CheckCircle } from 'lucide-react';
import '../../../features/scan/components/Checker.css';

export default function CommunitySection() {
  return (
    <section className="community-global-section">
      <div className="container">
        <div className="community-grid">
          {/* Left Column: Title & Intro */}
          <div className="community-intro">
            <div className="community-badge">
              <Users size={14} />
              <span>Cộng Đồng Phòng Chống Lừa Đảo</span>
            </div>
            <h2 className="community-title">
              Chung tay vì một<br />
              <span className="text-gradient">Internet An Toàn hơn</span>
            </h2>
            <p className="community-description">
              Hơn 50,000+ thành viên trong liên minh đang hoạt động tích cực để phát hiện, báo cáo và đẩy lùi các chiến dịch lừa đảo trực tuyến tinh vi tại Việt Nam. Tham gia cùng chúng tôi ngay hôm nay để bảo vệ bản thân và những người xung quanh.
            </p>
            
            <div className="community-cta-buttons">
              <a href="https://t.me/chongluadao" target="_blank" rel="noreferrer" className="community-btn btn-telegram">
                <Send size={18} />
                <span>Kênh Cảnh Báo Telegram</span>
              </a>
              <a href="https://facebook.com/groups/chongluadao" target="_blank" rel="noreferrer" className="community-btn btn-facebook">
                <Users size={18} />
                <span>Nhóm Facebook hỗ trợ</span>
              </a>
            </div>
          </div>

          {/* Right Column: Benefit Cards */}
          <div className="community-benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon-wrapper">
                <CheckCircle size={22} />
              </div>
              <div className="benefit-content">
                <h3>Nhận cảnh báo sớm</h3>
                <p>Cập nhật liên tục danh sách các website lừa đảo, giả mạo ngân hàng và độc hại mới xuất hiện.</p>
              </div>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon-wrapper">
                <ShieldAlert size={22} />
              </div>
              <div className="benefit-content">
                <h3>Chủ động báo cáo</h3>
                <p>Gửi báo cáo trực tiếp khi phát hiện dấu hiệu lừa đảo để cùng cộng đồng phân tích, chặn đứng rủi ro.</p>
              </div>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon-wrapper">
                <MessageSquare size={22} />
              </div>
              <div className="benefit-content">
                <h3>Hỗ trợ kỹ thuật 24/7</h3>
                <p>Trao đổi trực tiếp với các chuyên gia an ninh mạng để tư vấn, giải quyết các sự cố lừa đảo trực tuyến.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
