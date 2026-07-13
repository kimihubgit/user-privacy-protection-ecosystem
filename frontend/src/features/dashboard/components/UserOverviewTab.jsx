import { Cpu, BarChart2, Bell, FileText } from 'lucide-react';

export default function UserOverviewTab() {
  return (
    <div className="coming-soon-panel">
      <div className="cs-icon-sphere">
        <Cpu size={32} />
      </div>
      
      <p className="cs-sub">Sắp ra mắt!</p>
      <h2>Chức năng đang được phát triển.</h2>
      <p className="cs-desc">
        Hệ thống đang hoàn thiện các tính năng thống kê và phân tích tổng quan để mang đến trải nghiệm tốt nhất cho hội viên.
      </p>

      <div className="cs-cards-grid">
        <div className="cs-option-card">
          <div className="cs-card-icon-sphere" style={{ background: 'rgba(35, 181, 108, 0.08)', color: '#23b56c' }}>
            <BarChart2 size={18} />
          </div>
          <span className="cs-card-title">Phân tích xu hướng<br />lừa đảo</span>
        </div>

        <div className="cs-option-card">
          <div className="cs-card-icon-sphere" style={{ background: 'rgba(0, 122, 255, 0.08)', color: '#007aff' }}>
            <Bell size={18} />
          </div>
          <span className="cs-card-title">Cảnh báo thời gian<br />thực</span>
        </div>

        <div className="cs-option-card">
          <div className="cs-card-icon-sphere" style={{ background: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b' }}>
            <FileText size={18} />
          </div>
          <span className="cs-card-title">Báo cáo thông<br />minh</span>
        </div>
      </div>
    </div>
  );
}
