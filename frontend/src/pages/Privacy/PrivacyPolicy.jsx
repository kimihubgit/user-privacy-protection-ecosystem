import { useState, useEffect } from 'react';
import { Shield, Eye, Lock, FileText, ChevronRight, Mail, Server, ShieldCheck, HelpCircle } from 'lucide-react';
import './PrivacyPolicy.css';

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState('introduction');

  useEffect(() => {
    // Scroll page to top when component is rendered
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const sections = [
    {
      id: 'introduction',
      title: 'Giới thiệu chung',
      icon: Shield,
      heading: 'Cam kết bảo mật & quyền riêng tư',
      content: (
        <>
          <p>
            Chào mừng bạn đến với hệ thống <strong>Chống Lừa Đảo</strong>. Chúng tôi hiểu rằng quyền riêng tư và an toàn thông tin trực tuyến là mối quan tâm hàng đầu của người dùng Việt Nam. 
          </p>
          <p>
            Chính sách bảo mật này giải thích cách chúng tôi xử lý thông tin khi bạn sử dụng trang web, tiện ích mở rộng (Extension), chatbot Zalo/Telegram/Discord, và các dịch vụ tích hợp API khác thuộc hệ sinh thái Chống Lừa Đảo.
          </p>
          <div className="policy-highlight-box">
            <ShieldCheck className="highlight-icon" size={24} />
            <div>
              <strong>Nguyên tắc cốt lõi của chúng tôi:</strong>
              <p>Chỉ thu thập những gì thực sự cần thiết để bảo vệ bạn khỏi các vụ lừa đảo trực tuyến. Không bán, không thương mại hóa dữ liệu cá nhân của người dùng dưới bất kỳ hình thức nào.</p>
            </div>
          </div>
        </>
      )
    },
    {
      id: 'collect',
      title: '1. Thu thập thông tin',
      icon: Eye,
      heading: 'Các loại thông tin chúng tôi thu thập',
      content: (
        <>
          <p>
            Để duy trì khả năng cảnh báo thời gian thực và cập nhật cơ sở dữ liệu danh sách đen (blacklist) chính xác nhất, chúng tôi thu thập các nhóm thông tin sau:
          </p>
          <ul className="policy-list">
            <li>
              <strong>Dữ liệu truy vấn tên miền (Domain Checks):</strong> Khi bạn sử dụng extension hoặc nhập link kiểm tra trên web, chúng tôi chỉ nhận dạng phần tên miền chính (ví dụ: <code>example.com</code>) để đối soát với hệ thống. Chúng tôi <strong>không bao giờ</strong> ghi lại lịch sử duyệt web hoặc lưu trữ toàn bộ các URL mà bạn truy cập.
            </li>
            <li>
              <strong>Dữ liệu báo cáo lừa đảo (Scam Reports):</strong> Khi bạn gửi báo cáo lừa đảo, chúng tôi thu thập các bằng chứng bạn cung cấp như: liên kết độc hại, số điện thoại mạo danh, số tài khoản ngân hàng lừa đảo, hình ảnh bằng chứng và mô tả hành vi lừa đảo.
            </li>
            <li>
              <strong>Thông tin ẩn danh kỹ thuật:</strong> Địa chỉ IP ẩn danh, phiên bản trình duyệt, hệ điều hành thiết bị để phòng chống các đợt tấn công spam (DDoS) vào máy chủ kiểm tra của chúng tôi.
            </li>
          </ul>
        </>
      )
    },
    {
      id: 'usage',
      title: '2. Sử dụng thông tin',
      icon: Server,
      heading: 'Mục đích sử dụng dữ liệu thu thập',
      content: (
        <>
          <p>
            Tất cả thông tin được thu thập chỉ được dùng vào các mục đích phi lợi nhuận hướng tới bảo vệ cộng đồng:
          </p>
          <ul className="policy-list">
            <li><strong>Phát hiện & Ngăn chặn:</strong> Xác minh và cập nhật các nguồn lừa đảo trực tuyến vào cơ sở dữ liệu tập trung.</li>
            <li><strong>Đồng bộ hóa bảo mật:</strong> Cung cấp danh sách tên miền độc hại thời gian thực cho các tiện ích bảo vệ cài trên trình duyệt của người dùng.</li>
            <li><strong>Cải thiện công nghệ:</strong> Huấn luyện thuật toán học máy (Heuristic AI) để phát hiện sớm các hành vi giả mạo giao diện ngân hàng hoặc ví điện tử.</li>
            <li><strong>Hỗ trợ cộng đồng:</strong> Trả lời các yêu cầu tra cứu và giải đáp thắc mắc thông qua chatbot AI tư vấn bảo mật trực tuyến.</li>
          </ul>
        </>
      )
    },
    {
      id: 'sharing',
      title: '3. Chia sẻ dữ liệu',
      icon: Lock,
      heading: 'Chính sách chia sẻ dữ liệu với đối tác',
      content: (
        <>
          <p>
            Chống Lừa Đảo là một dự án xã hội phi lợi nhuận. Chúng tôi chỉ chia sẻ dữ liệu cảnh báo dưới dạng danh sách tên miền/số tài khoản đã xác minh độc hại với các bên liên quan sau:
          </p>
          <ul className="policy-list">
            <li>
              <strong>Các cơ quan chức năng & Hiệp hội an ninh mạng:</strong> Chia sẻ thông tin với Hiệp hội An ninh mạng Quốc gia (NCA) và Trung tâm Giám sát an toàn không gian mạng quốc gia (NCSC) để phối hợp gỡ bỏ các trang web lừa đảo.
            </li>
            <li>
              <strong>Liên minh bảo mật:</strong> Các đối tác công nghệ như Cloudflare (Dự án Galileo), ViSecurity để chặn các luồng độc hại trực tiếp từ tầng hạ tầng mạng.
            </li>
            <li>
              <strong>Cộng đồng lập trình:</strong> Cung cấp Public API miễn phí giúp các nhà phát triển tích hợp bộ lọc chặn link lừa đảo vào sản phẩm của họ. Dữ liệu chia sẻ qua API hoàn toàn phi cá nhân hóa.
            </li>
          </ul>
        </>
      )
    },
    {
      id: 'security',
      title: '4. Bảo vệ dữ liệu',
      icon: ShieldCheck,
      heading: 'Biện pháp bảo đảm an toàn thông tin',
      content: (
        <>
          <p>
            Chúng tôi áp dụng các tiêu chuẩn an toàn kỹ thuật nghiêm ngặt nhất để bảo vệ cơ sở dữ liệu chống lại sự truy cập trái phép:
          </p>
          <ul className="policy-list">
            <li>Mã hóa toàn bộ đường truyền dữ liệu thông qua giao thức HTTPS bảo mật cao.</li>
            <li>Lưu trữ cơ sở dữ liệu trên hệ thống máy chủ đám mây an toàn, được phân quyền truy cập chặt chẽ và giám sát 24/7.</li>
            <li>Tự động lọc và xóa bỏ các thông tin nhạy cảm của người dùng vô tình gửi kèm trong các tệp hình ảnh bằng chứng khi báo cáo.</li>
          </ul>
        </>
      )
    },
    {
      id: 'contact',
      title: '5. Liên hệ',
      icon: Mail,
      heading: 'Thông tin liên hệ & Quyền của người dùng',
      content: (
        <>
          <p>
            Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này, hoặc muốn yêu cầu chỉnh sửa/gỡ bỏ thông tin liên quan đến các báo cáo hoặc dữ liệu của bạn trên hệ thống, xin vui lòng liên hệ:
          </p>
          <div className="contact-card-policy">
            <h4>Doanh Nghiệp Xã Hội Chống Lừa Đảo</h4>
            <p><strong>Email tiếp nhận:</strong> <a href="mailto:privacy@chongluadao.vn">privacy@chongluadao.vn</a> hoặc <a href="mailto:info@chongluadao.vn">info@chongluadao.vn</a></p>
            <p><strong>Văn phòng:</strong> Tòa nhà bảo mật CLD, Quận 1, TP. Hồ Chí Minh, Việt Nam</p>
            <p><strong>Thời gian xử lý:</strong> Phản hồi yêu cầu trong vòng 24 - 48 giờ làm việc.</p>
          </div>
        </>
      )
    }
  ];

  return (
    <div className="policy-page-container">
      <div className="container">
        
        {/* Policy Header Banner */}
        <div className="policy-header-banner">
          <div className="policy-icon-badge">
            <FileText size={32} color="var(--secondary)" />
          </div>
          <h1 className="policy-main-title">Chính Sách <span className="gradient-text">Bảo Mật Quyền Riêng Tư</span></h1>
          <p className="policy-subtitle">
            Cập nhật lần cuối: Ngày 21 tháng 06 năm 2026. Chúng tôi cam kết bảo vệ tuyệt đối thông tin của người dùng trong quá trình đồng hành phòng chống tội phạm mạng.
          </p>
        </div>

        {/* Policy Layout with Sidebar and Content */}
        <div className="policy-content-layout">
          
          {/* Sidebar navigation */}
          <aside className="policy-sidebar">
            <div className="policy-sidebar-sticky">
              <h3 className="sidebar-title">Mục lục chi tiết</h3>
              <div className="sidebar-links-list">
                {sections.map((sec) => {
                  const Icon = sec.icon;
                  return (
                    <button
                      key={sec.id}
                      className={`sidebar-nav-btn ${activeSection === sec.id ? 'active' : ''}`}
                      onClick={() => {
                        setActiveSection(sec.id);
                        const element = document.getElementById(sec.id);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }}
                    >
                      <Icon size={16} className="btn-icon-left" />
                      <span>{sec.title}</span>
                      <ChevronRight size={14} className="btn-icon-right" />
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Main policy body text */}
          <main className="policy-main-content">
            {sections.map((sec) => {
              const Icon = sec.icon;
              return (
                <section
                  key={sec.id}
                  id={sec.id}
                  className={`policy-section-card glass-card ${activeSection === sec.id ? 'highlighted-card' : ''}`}
                  onMouseEnter={() => setActiveSection(sec.id)}
                >
                  <div className="section-card-header">
                    <div className="section-icon-wrapper">
                      <Icon size={20} />
                    </div>
                    <h2>{sec.heading}</h2>
                  </div>
                  <div className="section-card-body">
                    {sec.content}
                  </div>
                </section>
              );
            })}
          </main>

        </div>

        {/* Quick FAQ / Note Box */}
        <div className="policy-footer-note glass-card">
          <HelpCircle size={28} color="var(--warning)" style={{ flexShrink: 0 }} />
          <div>
            <h4>Bạn có thắc mắc về quyền riêng tư kỹ thuật?</h4>
            <p>
              Mã nguồn của hệ sinh thái tiện ích mở rộng Chống Lừa Đảo hoàn toàn là mã nguồn mở. Bạn có thể kiểm tra mọi dòng code và cách thức dữ liệu được truyền tải trực tiếp trên kho lưu trữ Github của dự án.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
