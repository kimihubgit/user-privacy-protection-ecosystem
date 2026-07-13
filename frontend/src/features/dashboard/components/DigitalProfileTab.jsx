import { ShieldCheck, BadgeCheck, Shield, TrendingUp, PlusCircle, ArrowLeft } from 'lucide-react';

export default function DigitalProfileTab({ addToast }) {
  return (
    <div className="digital-profile-panel">
      {/* Top Badge Circle */}
      <div className="dp-status-badge-wrap">
        <div className="dp-status-icon-circle">
          <ShieldCheck size={28} className="dp-status-icon" />
        </div>
      </div>

      {/* Main Heading */}
      <h2 className="dp-main-title">Chưa có hồ sơ Tín nhiệm số</h2>
      
      {/* Description */}
      <p className="dp-description">
        Đăng ký hồ sơ Tín nhiệm số để xác minh thương hiệu, bảo vệ doanh nghiệp khỏi giả mạo và tăng uy tín với khách hàng.
      </p>

      {/* Three Feature Cards */}
      <div className="dp-feature-cards-grid">
        <div className="dp-feature-card">
          <div className="dp-card-icon-wrap">
            <BadgeCheck size={22} />
          </div>
          <h4 className="dp-card-title">Xác minh thương hiệu</h4>
          <p className="dp-card-desc">Chứng nhận tài sản số chính hãng</p>
        </div>

        <div className="dp-feature-card">
          <div className="dp-card-icon-wrap">
            <Shield size={22} />
          </div>
          <h4 className="dp-card-title">Chống giả mạo</h4>
          <p className="dp-card-desc">Cảnh báo website, hotline giả</p>
        </div>

        <div className="dp-feature-card">
          <div className="dp-card-icon-wrap">
            <TrendingUp size={22} />
          </div>
          <h4 className="dp-card-title">Tăng uy tín</h4>
          <p className="dp-card-desc">Nâng cao niềm tin khách hàng</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="dp-action-buttons-wrap">
        <button 
          className="dp-btn-primary" 
          onClick={() => addToast && addToast('Chức năng đăng ký hồ sơ Tín nhiệm số đang được chuẩn bị...', 'info')}
        >
          <PlusCircle size={18} />
          <span>Đăng ký hồ sơ Tín nhiệm số</span>
        </button>
        
        <button 
          className="dp-btn-secondary"
          onClick={() => addToast && addToast('Danh sách doanh nghiệp đang được cập nhật...', 'info')}
        >
          <ArrowLeft size={18} />
          <span>Xem danh sách doanh nghiệp</span>
        </button>
      </div>
    </div>
  );
}
