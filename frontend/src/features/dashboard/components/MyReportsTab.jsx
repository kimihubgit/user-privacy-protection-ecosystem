import { useNavigate } from 'react-router-dom';
import { PlusCircle, FileText, Hourglass, CheckCircle, XCircle, Flag, FileX } from 'lucide-react';

export default function MyReportsTab({
  myReports,
  reportFilter,
  setReportFilter
}) {
  const navigate = useNavigate();

  const totalReportsCount = myReports.length;
  const pendingReportsCount = myReports.filter(r => r.status === 'pending').length;
  const approvedReportsCount = myReports.filter(r => r.status === 'approved').length;
  const rejectedReportsCount = myReports.filter(r => r.status === 'rejected').length;

  const filteredReports = myReports.filter(report => {
    if (reportFilter === 'all') return true;
    return report.status === reportFilter;
  });

  return (
    <div className="my-reports-section">
      {/* Header Section */}
      <div className="mr-header-wrap">
        <span className="mr-badge-pill">
          <span className="mr-badge-dot"></span>
          QUẢN LÝ TỐ CÁO
        </span>
        <h2 className="mr-main-title">Báo cáo của tôi</h2>
        <p className="mr-subtitle">
          Theo dõi và quản lý trạng thái các tố cáo bạn đã gửi lên hệ thống.
        </p>
        <button className="mr-submit-report-btn" onClick={() => navigate('/report')} title="Gửi báo cáo mới">
          <PlusCircle size={16} />
          <span>Gửi báo cáo mới</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="mr-metrics-grid">
        <div className="mr-metric-card">
          <div className="mr-card-top">
            <div className="mr-icon-wrap blue">
              <FileText size={18} />
            </div>
            <span className="mr-card-label">TỔNG BÁO CÁO</span>
          </div>
          <div className="mr-card-bottom">
            <h3 className="mr-card-value">{totalReportsCount}</h3>
            <span className="mr-card-desc">đơn đã gửi</span>
          </div>
        </div>

        <div className="mr-metric-card">
          <div className="mr-card-top">
            <div className="mr-icon-wrap yellow">
              <Hourglass size={18} />
            </div>
            <span className="mr-card-label">ĐANG XỬ LÝ</span>
          </div>
          <div className="mr-card-bottom">
            <h3 className="mr-card-value">{pendingReportsCount}</h3>
            <span className="mr-card-desc">chờ xét duyệt</span>
          </div>
        </div>

        <div className="mr-metric-card">
          <div className="mr-card-top">
            <div className="mr-icon-wrap green">
              <CheckCircle size={18} />
            </div>
            <span className="mr-card-label">ĐÃ DUYỆT</span>
          </div>
          <div className="mr-card-bottom">
            <h3 className="mr-card-value">{approvedReportsCount}</h3>
            <span className="mr-card-desc">đã xác nhận</span>
          </div>
        </div>

        <div className="mr-metric-card">
          <div className="mr-card-top">
            <div className="mr-icon-wrap grey">
              <XCircle size={18} />
            </div>
            <span className="mr-card-label">TỪ CHỐI</span>
          </div>
          <div className="mr-card-bottom">
            <h3 className="mr-card-value">{rejectedReportsCount}</h3>
            <span className="mr-card-desc">không xác nhận</span>
          </div>
        </div>
      </div>

      {/* List Header Section */}
      <div className="mr-list-header">
        <div className="mr-list-title-wrap">
          <Flag size={18} className="mr-list-flag-icon" />
          <span className="mr-list-title">Danh sách báo cáo</span>
          <span className="mr-list-count">({filteredReports.length})</span>
        </div>

        <div className="mr-filter-tabs">
          <button 
            className={`mr-filter-btn ${reportFilter === 'all' ? 'active' : ''}`}
            onClick={() => setReportFilter('all')}
          >
            Tất cả
          </button>
          <button 
            className={`mr-filter-btn ${reportFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setReportFilter('pending')}
          >
            Đang xử lý
          </button>
          <button 
            className={`mr-filter-btn ${reportFilter === 'approved' ? 'active' : ''}`}
            onClick={() => setReportFilter('approved')}
          >
            Đã duyệt
          </button>
          <button 
            className={`mr-filter-btn ${reportFilter === 'rejected' ? 'active' : ''}`}
            onClick={() => setReportFilter('rejected')}
          >
            Bị từ chối
          </button>
        </div>
      </div>

      {/* Main List Area */}
      <div className="mr-list-content-card">
        {filteredReports.length > 0 ? (
          <div className="db-reports-table-wrap">
            <table className="db-reports-table">
              <thead>
                <tr>
                  <th>Mục tiêu báo cáo</th>
                  <th>Phân loại</th>
                  <th>Ngày gửi báo cáo</th>
                  <th>Trạng thái duyệt</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map(report => (
                  <tr key={report.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{report.target}</td>
                    <td>{report.type}</td>
                    <td>{report.date}</td>
                    <td>
                      <span className={`status-badge ${
                        report.status === 'approved' ? 'approved' : 
                        report.status === 'pending' ? 'pending' : 'rejected'
                      }`}>
                        {report.status === 'approved' && 'Đã duyệt chặn'}
                        {report.status === 'pending' && 'Đang kiểm duyệt'}
                        {report.status === 'rejected' && 'Bị từ chối'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mr-empty-state-panel">
            <div className="mr-empty-icon-circle">
              <FileX size={26} />
            </div>
            <h3 className="mr-empty-title">Chưa có báo cáo nào</h3>
            <p className="mr-empty-subtitle">
              Bạn chưa gửi bất kỳ tố cáo lừa đảo nào. Hãy chung tay bảo vệ cộng đồng ngay hôm nay.
            </p>
            <button className="mr-empty-btn" onClick={() => navigate('/report')}>
              Tố cáo ngay
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
