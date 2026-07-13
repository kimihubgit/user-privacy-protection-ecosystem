import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import './SecurityDashboard.css';

export default function SecurityDashboard({ addToast }) {
  const [liveThreats, setLiveThreats] = useState([
    { id: 1, domain: 'vcb.rewards-ebanking.cf', type: 'Giả mạo Ngân hàng', time: '2 phút trước', severity: 'danger' },
    { id: 2, domain: 'nhan-qua-freefire-garena.info', type: 'Lừa đảo Game', time: '8 phút trước', severity: 'warning' },
    { id: 3, domain: 'shopee-uu-dai-mua-sam.net', type: 'Giả mạo Shopee', time: '14 phút trước', severity: 'danger' },
    { id: 4, domain: 'momo-xac-thuc-lien-ket.cc', type: 'Lừa đảo Tài chính', time: '25 phút trước', severity: 'danger' },
    { id: 5, domain: 'fb-business-verification.support', type: 'Giả mạo Facebook', time: '1 giờ trước', severity: 'warning' },
    { id: 6, domain: 'quay-so-trung-thuong-vinaphone.xyz', type: 'Trúng thưởng giả', time: '2 giờ trước', severity: 'warning' }
  ]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto add new threat alerts dynamically to make the feed feel alive
  useEffect(() => {
    const domains = [
      'bidv.nhan-qua-online.com',
      'telegram.quatang-sinh-nhat.info',
      'viettel-pay.xac-minh-tai-khoan.top',
      'meta.support-ads-manager.com',
      'co-bac-online-uy-tin.bet'
    ];
    const types = ['Giả mạo Ngân hàng', 'Lừa đảo mạng xã hội', 'Lừa đảo Tài chính', 'Giả mạo Facebook', 'Cờ bạc trực tuyến'];
    const severities = ['danger', 'warning', 'danger', 'warning', 'danger'];

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * domains.length);
      const newThreat = {
        id: Date.now(),
        domain: domains[randomIndex],
        type: types[randomIndex],
        time: 'Vừa xong',
        severity: severities[randomIndex]
      };

      setLiveThreats((prev) => {
        const updated = [newThreat, ...prev];
        return updated.slice(0, 6);
      });
    }, 12000);

    return () => clearInterval(interval);
  }, [addToast]);

  const handleRefreshThreats = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      if (addToast) {
        addToast('Đã đồng bộ hóa cơ sở dữ liệu danh sách đen mới nhất!', 'success');
      }
    }, 1000);
  };

  return (
    <section className="security-dashboard-section">
      <div className="container">

        {/* Glow Effects */}
        <div className="dashboard-glow-1"></div>
        <div className="dashboard-glow-2"></div>

        {/* Section 1: Cyber Security Command Console */}
        <div className="security-command-console">

          {/* Left Console Panel - Core Shield status */}
          <div className="console-panel primary-console">
            <div className="console-header">
              <span className="console-title-tag">HỆ THỐNG GIÁM SÁT TRUNG TÂM</span>
              <div className="system-status-indicator">
                <span className="pulse-dot-green"></span>
                <span className="status-text">SHIELD STATUS: SECURED</span>
              </div>
            </div>

            <div className="primary-console-body">
              <div className="primary-stat-wrap">
                <span className="stat-label">NGƯỜI DÙNG ĐANG ĐƯỢC BẢO VỆ</span>
                <h3 className="stat-number">5.420.183+</h3>
                <p className="primary-stat-sub">+12.4% tăng trưởng tài khoản bảo mật mới tháng này</p>
              </div>

              {/* Central Radar Core Visual */}
              <div className="console-core-radar">
                <svg viewBox="0 0 120 120" className="radar-core-svg">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(35, 181, 108, 0.08)" strokeWidth="1" strokeDasharray="4,4" />
                  <circle cx="60" cy="60" r="42" fill="none" stroke="rgba(35, 181, 108, 0.15)" strokeWidth="1" />
                  <circle cx="60" cy="60" r="28" fill="none" stroke="rgba(35, 181, 108, 0.25)" strokeWidth="1" strokeDasharray="2,2" />
                  <circle cx="60" cy="60" r="14" fill="none" stroke="rgba(35, 181, 108, 0.4)" strokeWidth="1.5" />

                  <line x1="60" y1="6" x2="60" y2="114" stroke="rgba(35, 181, 108, 0.12)" strokeWidth="1" />
                  <line x1="6" y1="60" x2="114" y2="60" stroke="rgba(35, 181, 108, 0.12)" strokeWidth="1" />

                  <line x1="60" y1="60" x2="60" y2="8" stroke="#23b56c" strokeWidth="2.5" strokeLinecap="round" className="console-radar-sweep" />

                  <circle cx="35" cy="40" r="3.5" fill="#00b4d8" className="radar-node node-a" />
                  <circle cx="85" cy="80" r="4.5" fill="#ef4444" className="radar-node node-b" />
                  <circle cx="60" cy="60" r="3" fill="#23b56c" />
                </svg>
              </div>
            </div>

            {/* Bottom status feed */}
            <div className="console-status-feed">
              <div className="feed-row"><span className="feed-time">OK</span> <span className="feed-msg">GATEWAY_HANOI: Đồng bộ thành công. Trễ: 8ms</span></div>
              <div className="feed-row"><span className="feed-time">OK</span> <span className="feed-msg">AI_ENGINE: Cập nhật mẫu nhận diện lừa đảo v4.82</span></div>
              <div className="feed-row"><span className="feed-time">OK</span> <span className="feed-msg">GATEWAY_SAIGON: Tường lửa bảo vệ đang hoạt động.</span></div>
            </div>
          </div>

          {/* Right Console Panel - Diagnostic Feeds */}
          <div className="console-panel secondary-console">

            {/* Feed Item 1: Web Blocked */}
            <div className="console-feed-item">
              <div className="feed-item-info">
                <span className="feed-item-label">TRANG WEB ĐÃ CHẶN</span>
                <h4 className="feed-item-value text-danger">148.932+</h4>
                <span className="feed-item-sub">+942 trang phát hiện độc hại hôm nay</span>
              </div>
              <div className="feed-item-visual">
                <svg viewBox="0 0 80 40" className="mini-hud-svg">
                  <path d="M 15,32 A 20,20 0 0,1 65,32" fill="none" stroke="rgba(220, 38, 38, 0.1)" strokeWidth="4" />
                  <path d="M 15,32 A 20,20 0 0,1 55,16" fill="none" stroke="var(--danger)" strokeWidth="4" />
                  <line x1="40" y1="32" x2="52" y2="15" stroke="var(--danger)" strokeWidth="2.5" strokeLinecap="round" className="dial-needle" />
                  <circle cx="40" cy="32" r="2.5" fill="var(--danger)" />
                </svg>
              </div>
            </div>

            {/* Feed Item 2: Reports */}
            <div className="console-feed-item">
              <div className="feed-item-info">
                <span className="feed-item-label">BÁO CÁO CỘNG ĐỒNG</span>
                <h4 className="feed-item-value text-green">42.392</h4>
                <span className="feed-item-sub">+156 báo cáo đang được kiểm duyệt</span>
              </div>
              <div className="feed-item-visual">
                <div className="hud-bars-container">
                  <div className="hud-bar bar-1" style={{ height: '35%' }}></div>
                  <div className="hud-bar bar-2" style={{ height: '65%' }}></div>
                  <div className="hud-bar bar-3" style={{ height: '85%' }}></div>
                  <div className="hud-bar bar-4" style={{ height: '40%' }}></div>
                  <div className="hud-bar bar-5" style={{ height: '70%' }}></div>
                </div>
              </div>
            </div>

            {/* Feed Item 3: AI Engine */}
            <div className="console-feed-item">
              <div className="feed-item-info">
                <span className="feed-item-label">TỶ LỆ AI CHÍNH XÁC</span>
                <h4 className="feed-item-value text-pink">99.98%</h4>
                <span className="feed-item-sub">Thời gian quét máy học: 10ms</span>
              </div>
              <div className="feed-item-visual">
                <svg viewBox="0 0 80 40" className="mini-hud-svg">
                  <circle cx="40" cy="20" r="15" fill="none" stroke="rgba(35, 181, 108, 0.15)" strokeWidth="1" strokeDasharray="3,2" />
                  <circle cx="40" cy="20" r="8" fill="none" stroke="rgba(35, 181, 108, 0.25)" strokeWidth="1" />
                  <line x1="40" y1="20" x2="51" y2="10" stroke="#23b56c" strokeWidth="1.5" strokeLinecap="round" className="radar-sweep" />
                </svg>
              </div>
            </div>

          </div>

        </div>

        {/* Section 2: Online Threat Feed & Process Timeline */}
        <div className="dashboard-two-col-layout">
          {/* Left Panel - Live threat updates */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <div className="panel-live-indicator" style={{ display: 'flex', alignItems: 'center' }}>
                <span className="live-pulse"></span>
                <span className="panel-title" style={{ marginLeft: '0.75rem' }}>DANH SÁCH ĐEN CẬP NHẬT TRỰC TUYẾN</span>
              </div>
              <button 
                className={`refresh-threat-btn ${isRefreshing ? 'spinning' : ''}`}
                onClick={handleRefreshThreats}
                title="Đồng bộ danh sách đen"
                disabled={isRefreshing}
              >
                <RefreshCw size={16} />
              </button>
            </div>

            <div className="threats-list-wrapper">
              {liveThreats.map((threat) => (
                <div key={threat.id} className="threat-item-card">
                  <div className="threat-domain-info">
                    <AlertTriangle size={16} className={`text-${threat.severity}`} />
                    <span className="threat-domain-text" title={threat.domain}>{threat.domain}</span>
                    <span className={`threat-badge ${threat.severity}`}>
                      {threat.type}
                    </span>
                  </div>
                  <div className="threat-action-info">
                    <span className="threat-time">{threat.time}</span>
                    <span className="threat-status-tag">ĐÃ CHẶN</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Audit workflow timeline */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <span className="panel-title">QUY TRÌNH KIỂM DUYỆT & XỬ LÝ</span>
            </div>

            <div className="process-timeline">
              <div className="process-step-row">
                <div className="step-number-wrap">
                  <span className="step-num">1</span>
                  <span className="step-connector"></span>
                </div>
                <div className="step-detail-card">
                  <h5 className="step-card-title">Tiếp nhận báo cáo</h5>
                  <p className="step-card-text">Người dùng báo cáo qua extension/website hoặc hệ thống crawler tự động phát hiện.</p>
                </div>
              </div>

              <div className="process-step-row">
                <div className="step-number-wrap">
                  <span className="step-num">2</span>
                  <span className="step-connector"></span>
                </div>
                <div className="step-detail-card">
                  <h5 className="step-card-title">Phân tích hành vi bằng AI</h5>
                  <p className="step-card-text">AI phân tích mã nguồn, kiểm tra chứng chỉ SSL, cấu trúc tên miền và đối chiếu cơ sở dữ liệu.</p>
                </div>
              </div>

              <div className="process-step-row">
                <div className="step-number-wrap">
                  <span className="step-num">3</span>
                  <span className="step-connector"></span>
                </div>
                <div className="step-detail-card">
                  <h5 className="step-card-title">Xác minh & Gán nhãn</h5>
                  <p className="step-card-text">Chuyên viên bảo mật phê duyệt và cập nhật mức độ độc hại (Nguy hiểm / Cảnh báo).</p>
                </div>
              </div>

              <div className="process-step-row">
                <div className="step-number-wrap">
                  <span className="step-num">4</span>
                </div>
                <div className="step-detail-card">
                  <h5 className="step-card-title">Chặn thời gian thực</h5>
                  <p className="step-card-text">Tên miền được đưa vào danh sách đen, bảo vệ người dùng trên toàn bộ hệ sinh thái.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
