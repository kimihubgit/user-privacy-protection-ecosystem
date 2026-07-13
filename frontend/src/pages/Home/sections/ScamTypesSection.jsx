import { useState } from 'react';
import { Search, AlertTriangle, ShieldAlert, Briefcase, Coins, Smartphone, HeartCrack, Gift, ChevronRight, HelpCircle } from 'lucide-react';
import './ScamTypesSection.css';

const scamTypesData = [
  {
    id: 'phishing',
    category: 'phishing',
    icon: <ShieldAlert size={24} />,
    dangerLevel: 'Cực kỳ nguy hiểm',
    dangerClass: 'danger-high',
    title: 'Giả mạo thương hiệu (Phishing)',
    desc: 'Kẻ xấu giả mạo tin nhắn SMS Brandname của Ngân hàng, Ví điện tử hoặc cơ quan thuế gửi đường link lạ yêu cầu đăng nhập tài khoản.',
    flags: [
      'Đường link truy cập sai lệch vài ký tự (ví dụ: vcb-digibank.cc thay vì vietcombank.com.vn)',
      'Yêu cầu cung cấp thông tin đăng nhập, mật khẩu và mã OTP khẩn cấp',
      'Đe dọa khóa tài khoản hoặc xử phạt nếu không làm theo ngay lập tức'
    ]
  },
  {
    id: 'job',
    category: 'financial',
    icon: <Briefcase size={24} />,
    dangerLevel: 'Phổ biến',
    dangerClass: 'danger-medium',
    title: 'Tuyển dụng việc nhẹ lương cao',
    desc: 'Tuyển CTV làm nhiệm vụ mua sắm đơn hàng ảo trên Tiki, Shopee hoặc tương tác TikTok để nhận hoa hồng lớn, sau đó yêu cầu nạp tiền đặt cọc rồi chiếm đoạt.',
    flags: [
      'Hứa hẹn mức thu nhập quá cao so với công việc thực tế (300k - 1M/ngày)',
      'Yêu cầu nạp tiền trước vào tài khoản cá nhân để làm nhiệm vụ hoặc ký quỹ',
      'Mọi liên lạc chỉ qua Telegram hoặc Zalo, không có trụ sở công ty rõ ràng'
    ]
  },
  {
    id: 'investment',
    category: 'financial',
    icon: <Coins size={24} />,
    dangerLevel: 'Cực kỳ nguy hiểm',
    dangerClass: 'danger-high',
    title: 'Đầu tư tài chính siêu lợi nhuận',
    desc: 'Lôi kéo tham gia các sàn giao dịch chứng khoán quốc tế, robot giao dịch vàng, ngoại hối, tiền ảo đa cấp với cam kết bao lỗ và lợi nhuận 20 - 30% mỗi tháng.',
    flags: [
      'Cam kết lợi nhuận cố định cực cao không có rủi ro',
      'Thường xuyên khoe tiền, khoe xe sang để đánh vào lòng tham',
      'Không cho rút tiền hoặc yêu cầu đóng thêm các khoản thuế/phí vô lý để rút tiền'
    ]
  },
  {
    id: 'takeover',
    category: 'phishing',
    icon: <Smartphone size={24} />,
    dangerLevel: 'Tinh vi',
    dangerClass: 'danger-high',
    title: 'Đoạt quyền điều khiển thiết bị',
    desc: 'Giả danh Công an, Viện kiểm sát gọi điện yêu cầu cài đặt ứng dụng Dịch vụ công (file .APK giả mạo) chứa mã độc trojan để đọc trộm OTP và chuyển tiền.',
    flags: [
      'Yêu cầu tải ứng dụng ngoài kho ứng dụng chính thức (App Store, Google Play)',
      'Yêu cầu quyền trợ năng (Accessibility Service) để tự động điều khiển màn hình',
      'Hối thúc thực hiện cuộc gọi video xác thực khuôn mặt từ xa'
    ]
  },
  {
    id: 'romance',
    category: 'social',
    icon: <HeartCrack size={24} />,
    dangerLevel: 'Phổ biến',
    dangerClass: 'danger-medium',
    title: 'Lừa đảo tình cảm (Romance/Pig Butchering)',
    desc: 'Kẻ lừa đảo đóng vai doanh nhân thành đạt, người nước ngoài nhắn tin làm quen tạo tình cảm yêu đương sâu đậm, sau đó rủ đầu tư chung hoặc viện cớ gửi quà.',
    flags: [
      'Chỉ nhắn tin nói lời ngọt ngào nhưng luôn né tránh gọi video hoặc gặp mặt trực tiếp',
      'Chủ động đề cập hoặc hướng dẫn đầu tư vào các trang web tiền ảo, cổ phiếu lạ',
      'Hỏi mượn tiền khẩn cấp do gặp nạn hoặc yêu cầu nạp phí hải quan để nhận quà'
    ]
  },
  {
    id: 'prize',
    category: 'social',
    icon: <Gift size={24} />,
    dangerLevel: 'Phổ biến',
    dangerClass: 'danger-low',
    title: 'Nhận quà tri ân & trúng thưởng',
    desc: 'Thông báo trúng giải thưởng lớn (xe máy, điện thoại) từ sự kiện hoặc được tặng quà tri ân miễn phí của các hãng thời trang, mỹ phẩm nổi tiếng.',
    flags: [
      'Yêu cầu chuyển tiền trước để thanh toán thuế thu nhập cá nhân hoặc phí vận chuyển',
      'Gửi kèm thẻ cào điện thoại hoặc bắt mua thẻ cào để nộp mã xác nhận trúng thưởng',
      'Liên tục gọi điện thúc ép chuyển khoản gấp nếu không giải thưởng sẽ bị hủy'
    ]
  }
];

export default function ScamTypesSection({ addToast }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleLearnMore = (title) => {
    if (addToast) {
      addToast(`Đang tải cẩm nang phòng tránh cho hình thức: ${title}...`, 'info');
    }
  };

  const filteredTypes = scamTypesData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.flags.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="scam-types-section">
      <div className="scam-types-container">

        {/* Section Header */}
        <div className="scam-types-header">
          <div className="scam-types-badge">
            <AlertTriangle size={14} className="scam-types-badge-icon" />
            <span>CẢNH GIÁC CAO ĐỘ</span>
          </div>
          <h2 className="scam-types-heading">Phân Loại Hình Thức Lừa Đảo Phổ Biến</h2>
        </div>

        {/* Filter and Search Bar */}
        <div className="scam-types-toolbar">
          <div className="scam-types-categories">
            <button
              className={`category-tab ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              Tất cả
            </button>
            <button
              className={`category-tab ${selectedCategory === 'phishing' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('phishing')}
            >
              Giả mạo & Mã độc
            </button>
            <button
              className={`category-tab ${selectedCategory === 'financial' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('financial')}
            >
              Tài chính & Việc làm
            </button>
            <button
              className={`category-tab ${selectedCategory === 'social' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('social')}
            >
              Mạng xã hội & Tình cảm
            </button>
          </div>

          <div className="scam-types-search-wrap">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm thủ đoạn, dấu hiệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="scam-types-search-input"
            />
          </div>
        </div>

        {/* Cards Grid */}
        {filteredTypes.length > 0 ? (
          <div className="scam-types-grid">
            {filteredTypes.map((item) => (
              <div key={item.id} className="scam-type-card">
                <div className="card-top-row">
                  <div className="scam-icon-box">
                    {item.icon}
                  </div>
                  <span className={`danger-badge ${item.dangerClass}`}>
                    {item.dangerLevel}
                  </span>
                </div>

                <h3 className="scam-card-title">{item.title}</h3>
                <p className="scam-card-desc">{item.desc}</p>

                <div className="red-flags-block">
                  <div className="flags-title">
                    <HelpCircle size={14} className="flags-info-icon" />
                    <span>Dấu hiệu nhận biết:</span>
                  </div>
                  <ul className="flags-list">
                    {item.flags.map((flag, idx) => (
                      <li key={idx} className="flag-item">{flag}</li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleLearnMore(item.title)}
                  className="scam-learn-more-btn"
                >
                  Cách phòng tránh
                  <ChevronRight size={16} className="btn-arrow" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="scam-types-empty">
            <AlertTriangle size={48} className="empty-warn-icon" />
            <p>Không tìm thấy hình thức lừa đảo phù hợp với từ khóa của bạn.</p>
          </div>
        )}

      </div>
    </section>
  );
}
