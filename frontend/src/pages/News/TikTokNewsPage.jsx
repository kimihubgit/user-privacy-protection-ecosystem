import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, User, Search, RefreshCw, ShieldAlert, Share2, FileText, ChevronRight, AlertTriangle, BookOpen, ExternalLink } from 'lucide-react';
import './TikTokNewsPage.css';

const NEWS_POSTS_DATA = [
  {
    id: 'post-1',
    title: 'Cảnh báo chiêu trò lừa đảo giả danh công an gọi điện yêu cầu định danh VNeID mức 2',
    slug: 'canh-bao-gia-danh-cong-an-vneid',
    category: 'scam',
    categoryLabel: 'Cảnh báo Scam',
    author: 'Ban Biên Tập Shield',
    date: '28/07/2026',
    readTime: '4 phút đọc',
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
    excerpt: 'Đối tượng xấu giả danh cán bộ công an phường/huyện hướng dẫn cài ứng dụng VNeID giả chứa phần mềm độc hại để lấy cắp tài khoản ngân hàng của nạn nhân.',
    videoLink: 'https://www.tiktok.com/@buoihongdasac/video/7635400431740505364',
    contentParagraphs: [
      'Thời gian gần đây, cơ quan an ninh mạng liên tục ghi nhận nhiều trường hợp người dân bị các đối tượng lừa đảo gọi điện tự xưng là cán bộ công an quận, huyện hoặc công an thành phố yêu cầu cập nhật, đồng bộ thông tin định danh điện tử VNeID mức 2.',
      'Các đối tượng sử dụng thủ đoạn hết sức tinh vi: Gửi đường link giả mạo cổng dịch vụ công hoặc gửi file ứng dụng định dạng APK trực tiếp qua ứng dụng Zalo, Telegram và yêu cầu nạn nhân cài đặt vào điện thoại.',
      'Ngay sau khi nạn nhân cài đặt ứng dụng giả mạo, mã độc ngầm sẽ kích hoạt quyền Accessibility (Quyền hỗ trợ truy cập) trên thiết bị di động, tự động theo dõi thao tác bàn phím, đánh cắp mật khẩu đăng nhập ứng dụng ngân hàng và tự động đánh chặn mã xác thực OTP giao dịch.'
    ],
    warningPoints: [
      'Công an KHÔNG BAO GIỜ làm việc qua điện thoại hoặc yêu cầu cài đặt phần mềm qua đường link lạ.',
      'Mọi thao tác định danh điện tử mức 2 bắt buộc phải thực hiện trực tiếp tại Trụ sở Công an xã/phường/thị trấn.',
      'Tuyệt đối không cấp quyền Accessibility (Hỗ trợ truy cập) cho các file APK tải từ ngoài CH Play hay App Store.'
    ]
  },
  {
    id: 'post-2',
    title: 'Thủ đoạn nhử mồi việc làm online sang Campuchia & Myanmar hứa hẹn lương trăm triệu',
    slug: 'thu-doan-nhu-moi-viec-lam-online',
    category: 'new_threat',
    categoryLabel: 'Thủ đoạn mới',
    author: 'Trung Tâm Cyber Safety',
    date: '26/07/2026',
    readTime: '5 phút đọc',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    excerpt: 'Phân tích chi tiết quy trình các hội nhóm dụ dỗ tuyển dụng việc nhẹ lương cao để khống chế và tống tiền gia đình nạn nhân.',
    videoLink: 'https://www.tiktok.com/@buoihongdasac/video/7635400431740505364',
    contentParagraphs: [
      'Bộ Công an liên tục đưa ra cảnh báo về tình trạng các tổ chức tội phạm xuyên quốc gia thiết lập hàng trăm fanpage tuyển dụng giả mạo trên Facebook, TikTok nhằm dụ dỗ thanh thiếu niên nhẹ dạ.',
      'Chiêu trò chung của các đối tượng là hứa hẹn công việc đánh máy, chăm sóc khách hàng trực tuyến với mức lương từ 30 đến 50 triệu đồng/tháng. Khi nạn nhân sập bẫy, chúng hỗ trợ toàn bộ chi phí di chuyển rồi lừa sang các khu kinh tế tự viện tại biên giới.',
      'Tại đây, nạn nhân bị thu giữ toàn bộ giấy tờ tùy thân, điện thoại cá nhân và bị cưỡng bức tham gia vào các đường dây lừa đảo tài chính qua mạng.'
    ],
    warningPoints: [
      'Cảnh giác trước mọi thông báo tuyển dụng việc nhẹ lương cao không yêu cầu bằng cấp.',
      'Kiểm tra kỹ pháp lý của công ty tuyển dụng trước khi thực hiện phỏng vấn hoặc di chuyển.',
      'Liên hệ ngay hotline Cục Quản lý Lao động Ngoài nước nếu nghi vấn hành vi mua bán người.'
    ]
  },
  {
    id: 'post-3',
    title: 'Top 5 mẹo bảo mật tài khoản ngân hàng tuyệt đối không thể bỏ qua năm 2026',
    slug: 'top-5-meo-bao-mat-tai-khoan-ngan-hang',
    category: 'security_tips',
    categoryLabel: 'Mẹo bảo mật',
    author: 'Chuyên Gia An Ninh Mạng',
    date: '24/07/2026',
    readTime: '3 phút đọc',
    thumbnail: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&auto=format&fit=crop&q=80',
    excerpt: 'Hướng dẫn cài đặt sinh trắc học khuôn mặt, hạn chế quyền ứng dụng và bật cảnh báo OTP an toàn trên thiết bị di động.',
    contentParagraphs: [
      'Với sự phát triển mạnh mẽ của công nghệ thanh toán trực tuyến, việc bảo vệ tài khoản ngân hàng trở thành ưu tiên hàng đầu của mọi cá nhân.',
      'Các chuyên gia an ninh khuyến nghị người dùng bắt buộc kích hoạt tính năng xác thực sinh trắc học (Khuôn mặt/Vân tay) cho tất cả các giao dịch chuyển tiền trên 10 triệu đồng theo Quyết định 2345/QĐ-NHNN.',
      'Bên cạnh đó, việc phân chia tài khoản chi tiêu hàng ngày và tài khoản tiết kiệm tích lũy riêng biệt cũng giúp giảm thiểu tối đa tổn thất trong trường hợp thiết bị bị rơi vào tay đối tượng xấu.'
    ],
    warningPoints: [
      'Không lưu mật khẩu ngân hàng hay mã PIN trong ghi chú điện thoại hoặc ứng dụng nhắn tin.',
      'Luôn kiểm tra tên người thụ hưởng và số tài khoản trước khi bấm xác nhận chuyển tiền.',
      'Khóa thẻ khẩn cấp qua ứng dụng ngân hàng ngay khi phát hiện thiết bị di động bị thất lạc.'
    ]
  },
  {
    id: 'post-4',
    title: 'Cảnh báo trang web giả mạo dịch vụ trúng thưởng MoMo & Shopee nhận quà Tết',
    slug: 'canh-bao-web-gia-mao-momo-shopee',
    category: 'scam',
    categoryLabel: 'Cảnh báo Scam',
    author: 'Ban Biên Tập Shield',
    date: '22/07/2026',
    readTime: '4 phút đọc',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    excerpt: 'Vạch trần giao diện nhái các ví điện tử hòng lừa mã xác thực OTP giao dịch chuyển tiền trực tuyến của người tiêu dùng.',
    contentParagraphs: [
      'Trung tâm Giám sát an toàn không gian mạng quốc gia (NCSC) phát hiện hàng chục tên miền giả mạo thương hiệu Shopee, MoMo, Tiki đang được phát tán rầm rộ qua tin nhắn SMS rác và các quảng cáo giả mạo trên mạng xã hội.',
      'Khi truy cập vào các đường link này, giao diện trang web được thiết kế hoàn toàn giống với ứng dụng gốc. Người dùng được yêu cầu nhập số điện thoại, mật khẩu và mã OTP để nhận vòng quay may mắn trúng xe máy, điện thoại.',
      'Ngay khi người dùng nhập mã OTP, đối tượng xấu sẽ dùng OTP đó để hoàn tất lệnh rút toàn bộ tiền trong ví điện tử hoặc tài khoản ngân hàng liên kết.'
    ],
    warningPoints: [
      'Chỉ truy cập các trang web chính thức có tên miền kết thúc bằng .vn hoặc địa chỉ đã được xác minh.',
      'Tất cả thông báo trúng thưởng của ví điện tử đều hiển thị trực tiếp trong ứng dụng chính thức.',
      'Không bao giờ chia sẻ mã xác thực OTP cho bất kỳ ai, kể cả người tự xưng nhân viên tổng đài.'
    ]
  },
  {
    id: 'post-5',
    title: 'Tin nóng: Triệt phá đường dây lừa đảo qua mạng quy mô 1.000 tỷ đồng tại TP.HCM',
    slug: 'triet-pha-duong-day-lua-dao-1000-ty',
    category: 'news',
    categoryLabel: 'Tin tức An ninh',
    author: 'Tin Tức An Ninh 24h',
    date: '20/07/2026',
    readTime: '6 phút đọc',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    excerpt: 'Cơ quan công an vừa bắt giữ nhóm đối tượng giả danh ngân hàng gọi điện lừa đảo mã OTP gia hạn thẻ tín dụng quy mô lớn.',
    contentParagraphs: [
      'Công an TP.HCM phối hợp với Cục Cảnh sát hình sự vừa triệt phá thành công một ổ nhóm tội phạm công nghệ cao chuyên giả danh nhân viên ngân hàng để lừa đảo chiếm đoạt tài sản.',
      'Qua điều tra ban đầu, nhóm đối tượng mua dữ liệu cá nhân của hàng ngàn khách hàng có dùng thẻ tín dụng, sau đó phân công đồng bọn gọi điện mời chào gia hạn hạn mức thẻ tín dụng hoặc rút tiền mặt phí thấp.',
      'Số tiền chiếm đoạt được chúng chuyển qua hàng chục tài khoản ngân hàng rác và đổi sang tiền điện tử USDT để tẩu tán ra nước ngoài.'
    ],
    warningPoints: [
      'Ngân hàng không triển khai dịch vụ rút tiền mặt thẻ tín dụng qua các số điện thoại cá nhân.',
      'Người dân tuyệt đối không cung cấp mã CVV (3 số mặt sau thẻ) cho bất kỳ ai.',
      'Báo cáo ngay cho cơ quan công an khi nhận được các cuộc gọi nghi vấn lừa đảo.'
    ]
  },
  {
    id: 'post-6',
    title: 'Cách nhận biết cuộc gọi Deepfake AI mạo danh người thân mượn tiền gấp',
    slug: 'cach-nhan-biet-cuoc-goi-deepfake-ai',
    category: 'security_tips',
    categoryLabel: 'Mẹo bảo mật',
    author: 'Chuyên Gia An Ninh Mạng',
    date: '18/07/2026',
    readTime: '4 phút đọc',
    thumbnail: 'https://images.unsplash.com/photo-1579869847557-1f67382cc158?w=800&auto=format&fit=crop&q=80',
    excerpt: 'Hướng dẫn mẹo đặt câu hỏi xác nhận thông tin gia đình và quan sát cử động mắt/miệng để nhận biết video Deepfake.',
    contentParagraphs: [
      'Công nghệ trí tuệ nhân tạo (AI) phát triển giúp các đối tượng lừa đảo có thể sao chép giọng nói và khuôn mặt của bất kỳ ai chỉ từ một đoạn video ngắn trên TikTok hoặc Facebook.',
      'Khi gọi video cho nạn nhân, kẻ lừa đảo thường cố tình làm nhiễu sóng, tín hiệu chập chờn hoặc chỉ phát video trong vài giây ngắn ngủi rồi ngắt kết nối với lý do mạng yếu.',
      'Ngay sau đó, đối tượng sẽ nhắn tin yêu cầu chuyển tiền gấp vào một tài khoản ngân hàng lạ với lý do vay nợ hoặc xử lý sự cố cấp bách.'
    ],
    warningPoints: [
      'Luôn gọi điện lại trực tiếp qua số di động thông thường để xác nhận với người thân.',
      'Hỏi các câu hỏi riêng tư mà chỉ người thân mới biết trước khi thực hiện chuyển tiền.',
      'Cảnh giác khi tài khoản nhận tiền có tên người thụ hưởng khác với tên người thân.'
    ]
  }
];

const CATEGORIES = [
  { key: 'all', label: 'Tất cả Bài viết' },
  { key: 'scam', label: 'Cảnh báo Scam' },
  { key: 'new_threat', label: 'Thủ đoạn mới' },
  { key: 'security_tips', label: 'Mẹo bảo mật' },
  { key: 'news', label: 'Tin tức An ninh' }
];

const POSTS_PER_PAGE = 6;

export default function NewsPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Filter posts by category & search query
  const filteredPosts = useMemo(() => {
    return NEWS_POSTS_DATA.filter(post => {
      const matchCategory = selectedCategory === 'all' || post.category === selectedCategory;
      const matchQuery = !searchQuery.trim() ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  // Paginated posts slice
  const visiblePosts = useMemo(() => {
    return filteredPosts.slice(0, visibleCount);
  }, [filteredPosts, visibleCount]);

  const hasMore = visibleCount < filteredPosts.length;
  const remainingCount = filteredPosts.length - visibleCount;

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + POSTS_PER_PAGE);
      setIsLoadingMore(false);
    }, 400);
  };

  const handleCategoryChange = (key) => {
    setSelectedCategory(key);
    setVisibleCount(POSTS_PER_PAGE);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setVisibleCount(POSTS_PER_PAGE);
  };

  const handleOpenPost = (post) => {
    setSelectedPost(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // FULL ARTICLE READER VIEW (CLEAN & ERROR-FREE)
  if (selectedPost) {
    return (
      <div className="news-page">
        <div className="news-container">
          <div className="article-detail-wrapper">
            
            {/* Back Button */}
            <button
              type="button"
              className="article-back-btn"
              onClick={() => {
                setSelectedPost(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <ArrowLeft size={18} />
              <span>Quay lại danh sách bài viết</span>
            </button>

            {/* Article Header */}
            <header className="article-header">
              <div className="article-meta-row">
                <span className="article-cat-badge">{selectedPost.categoryLabel}</span>
                <span className="article-meta-item">
                  <User size={14} />
                  <span>{selectedPost.author}</span>
                </span>
                <span className="article-meta-item">
                  <Calendar size={14} />
                  <span>{selectedPost.date}</span>
                </span>
                <span className="article-meta-item">
                  <Clock size={14} />
                  <span>{selectedPost.readTime}</span>
                </span>
              </div>

              <h1 className="article-title">{selectedPost.title}</h1>
              
              <div className="article-excerpt">
                {selectedPost.excerpt}
              </div>
            </header>

            {/* Article Hero Banner Image */}
            <div className="article-hero-banner">
              <img src={selectedPost.thumbnail} alt={selectedPost.title} />
            </div>

            {/* Article Body Content */}
            <div className="article-content-body">
              {selectedPost.contentParagraphs.map((paragraph, pIdx) => (
                <p key={pIdx}>{paragraph}</p>
              ))}

              {/* Warning Alert Callout Box */}
              {selectedPost.warningPoints && (
                <div className="article-warning-box">
                  <h4>
                    <AlertTriangle size={20} />
                    <span>Cảnh báo quan trọng cần lưu ý:</span>
                  </h4>
                  <ul style={{ margin: '0.75rem 0 0 1.25rem', padding: 0 }}>
                    {selectedPost.warningPoints.map((point, wIdx) => (
                      <li key={wIdx} style={{ marginBottom: '0.5rem', lineHeight: '1.6' }}>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Video Reference Link if available */}
              {selectedPost.videoLink && (
                <div style={{ background: '#f1f5f9', borderRadius: '14px', padding: '1.25rem', margin: '2rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <BookOpen size={20} color="#00b4d8" />
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>Video Truyền Thông Liên Quan</strong>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Xem clip truyền thông thực tế trên TikTok</p>
                    </div>
                  </div>
                  <a
                    href={selectedPost.videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="read-more-link"
                    style={{ background: '#00b4d8', color: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', textDecoration: 'none' }}
                  >
                    <span>Mở TikTok</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </div>

            {/* Article Action Footer */}
            <div className="article-action-bar">
              <button
                type="button"
                className="btn danger-btn"
                style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => navigate('/report')}
              >
                <ShieldAlert size={16} />
                <span>Báo cáo vụ việc lừa đảo tương tự</span>
              </button>

              <button
                type="button"
                className="btn outline-btn"
                style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Đã chép liên kết bài viết vào bộ nhớ tạm!');
                }}
              >
                <Share2 size={16} />
                <span>Chia sẻ bài viết</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // DEFAULT VIEW: LIST OF POSTS (GRID)
  return (
    <div className="news-page">
      <div className="news-container">
        
        {/* HERO HEADER SECTION */}
        <section className="news-hero-section">
          <div className="news-hero-badge">
            <FileText size={16} />
            <span>TIN TỨC & BẢO MẬT CYBER</span>
          </div>
          <h1 className="news-hero-title">
            Tin Tức & <span className="gradient-text-danger">Cảnh Báo An Ninh</span>
          </h1>
          <p className="news-hero-desc">
            Cập nhật các bài viết phân tích thủ đoạn lừa đảo mạng mới nhất, khuyến cáo phòng tránh và bảo vệ an toàn thông tin cá nhân.
          </p>
        </section>

        {/* TOOLBAR & FILTERS */}
        <div className="news-toolbar">
          <div className="news-categories">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                type="button"
                className={`category-chip-btn ${selectedCategory === cat.key ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="news-search-box">
            <Search className="news-search-icon" size={16} />
            <input
              type="text"
              className="news-search-input"
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* POST CARDS GRID */}
        {filteredPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#ffffff', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.06)' }}>
            <ShieldAlert size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.1rem', color: '#1e293b', fontWeight: 700 }}>Không tìm thấy bài viết trùng khớp</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '0.35rem' }}>Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác.</p>
          </div>
        ) : (
          <div className="posts-grid">
            {visiblePosts.map(post => (
              <div
                key={post.id}
                className="post-card"
                onClick={() => handleOpenPost(post)}
              >
                {/* Cover Image & Category Badge */}
                <div className="post-thumb-wrap">
                  <img src={post.thumbnail} alt={post.title} className="post-thumb-img" />
                  <span className="post-cat-badge">{post.categoryLabel}</span>
                </div>

                {/* Post Info */}
                <div className="post-card-body">
                  <div className="post-meta-row">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>

                  <h3 className="post-card-title">{post.title}</h3>
                  <p className="post-card-excerpt">{post.excerpt}</p>

                  <div className="post-card-footer">
                    <span className="read-more-link">
                      <span>Đọc bài viết</span>
                      <ChevronRight size={16} />
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* LOAD MORE BUTTON SECTION */}
        {hasMore && (
          <div className="load-more-container">
            <button
              type="button"
              className="load-more-btn"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <>
                  <RefreshCw size={18} className="btn-icon-spin" />
                  <span>Đang tải thêm bài viết...</span>
                </>
              ) : (
                <>
                  <span>TẢI THÊM BÀI VIẾT</span>
                  <RefreshCw size={16} />
                </>
              )}
            </button>
            <span className="load-more-count">
              Hiển thị {visiblePosts.length} / {filteredPosts.length} bài viết (Còn {remainingCount} bài nữa)
            </span>
          </div>
        )}

        {!hasMore && filteredPosts.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '2rem', color: '#94a3b8', fontSize: '0.88rem', fontWeight: 500 }}>
            • Đã hiển thị toàn bộ {filteredPosts.length} bài viết tin tức mới nhất •
          </div>
        )}

      </div>
    </div>
  );
}
