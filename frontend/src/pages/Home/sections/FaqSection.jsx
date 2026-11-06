import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './SecurityDashboard.css'; // Reuses existing FAQ styling

export default function FaqSection() {
  const [activeFaq, setActiveFaq] = useState(null);

  const faqData = [
    {
      q: "Dự án S.H.I.E.L.D hoạt động như thế nào?",
      a: "Chúng tôi bảo vệ bạn bằng cách thu thập, phân tích và cung cấp danh sách đen các trang web lừa đảo, giả mạo, mã độc và cờ bạc. Tiện ích mở rộng trên trình duyệt sẽ đối chiếu địa chỉ bạn truy cập với cơ sở dữ liệu thời gian thực và hiển thị cảnh báo đỏ ngay lập tức nếu phát hiện rủi ro."
    },
    {
      q: "shield có thu thập dữ liệu cá nhân hay lịch sử duyệt web không?",
      a: "Hoàn toàn KHÔNG. shield là một dự án phi lợi nhuận hoạt động vì cộng đồng. Chúng tôi cam kết không thu thập lịch sử duyệt web, thông tin cá nhân hay bất kỳ dữ liệu nhạy cảm nào của bạn. Tiện ích chỉ đối chiếu tên miền (domain) ẩn danh qua giao thức bảo mật."
    },
    {
      q: "Làm thế nào để tôi báo cáo một trang web lừa đảo?",
      a: "Bạn có thể báo cáo trực tiếp bằng cách nhấp vào tab 'Báo cáo' trên thanh điều hướng đầu trang, nhập đường link nghi ngờ và gửi thông tin. Đội ngũ chuyên gia và AI của chúng tôi sẽ phân tích và đưa vào danh sách chặn trong vòng ít phút nếu xác định là độc hại."
    },
    {
      q: "Tại sao dự án S.H.I.E.L.D lại miễn phí?",
      a: "shield được xây dựng trên sứ mệnh phi lợi nhuận nhằm bảo vệ người dùng Internet Việt Nam, đặc biệt là những người yếu thế (người cao tuổi, học sinh) trước vấn nạn lừa đảo mạng ngày càng tinh vi. Dự án được hỗ trợ bởi các tình nguyện viên, đối tác an ninh mạng quốc gia và đóng góp của cộng đồng."
    }
  ];

  return (
    <section className="faq-dashboard-section" style={{ padding: '6rem 0' }}>
      <div className="container">
        <div className="faq-grid-layout">

          {/* Left Column: Title and Contact CTA */}
          <div className="faq-left-col">
            <span className="faq-badge">FAQ</span>
            <h2 className="faq-main-title">Câu hỏi thường gặp</h2>
            <p className="faq-subtitle">
              Mọi điều bạn cần biết về dự án S.H.I.E.L.D. Không tìm thấy câu trả lời? Hãy liên hệ với chúng tôi để nhận hỗ trợ nhanh nhất.
            </p>

            {/* Still have questions? CTA card */}
            <a
              href="https://t.me/shieldvietnam"
              target="_blank"
              rel="noopener noreferrer"
              className="faq-contact-card"
            >
              <div className="faq-contact-icon-wrap">
                <svg className="faq-contact-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.82-.79 4.62-1.12 6.36-.14.74-.41.99-.68 1.01-.58.06-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.95 1.23-5.51 3.63-.52.36-.99.53-1.41.52-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.36-.49.99-.74 3.87-1.69 6.45-2.8 7.74-3.32 3.69-1.5 4.45-1.76 4.95-1.77.11 0 .36.03.52.16.13.11.17.26.19.37.02.13.02.43-.01.59z" />
                </svg>
              </div>
              <div className="faq-contact-info">
                <span className="faq-contact-title">Bạn vẫn còn câu hỏi?</span>
                <span className="faq-contact-link">t.me/shieldvietnam</span>
              </div>
              <svg className="faq-contact-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>

          {/* Right Column: Accordion list */}
          <div className="faq-accordion-container">
            {faqData.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className={`faq-accordion-item ${isOpen ? 'open' : ''}`}
                >
                  <button
                    className="faq-question-trigger"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className="faq-arrow-icon" size={18} />
                  </button>
                  <div className="faq-answer-collapse">
                    <p className="faq-answer-text">{faq.a}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
