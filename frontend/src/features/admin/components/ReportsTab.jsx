import { useState, useEffect } from 'react';
import { Search, Globe, CreditCard, Phone, Eye, X, Check, RefreshCw, ShieldAlert } from 'lucide-react';
import { api } from '../../../lib/api';

function generateId(prefix) {
  return `${prefix}_${new Date().getTime()}_${Math.floor(Math.random() * 1000)}`;
}

export default function ReportsTab({ token, pendingReports, setPendingReports, savePendingReports, blacklist, saveBlacklist, addAuditLog, addToast }) {
  const [reportsPage, setReportsPage] = useState(1);
  const reportsLimit = 10;
  const [reportsTotal, setReportsTotal] = useState(0);
  const [reportsStatusFilter, setReportsStatusFilter] = useState('pending'); // 'pending' | 'approved' | 'rejected'
  const [reportsTypeFilter, setReportsTypeFilter] = useState(null); // null | 0 | 1
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Report details modal states
  const [activeReportDetail, setActiveReportDetail] = useState(null);
  const [reportDetailData, setReportDetailData] = useState(null);
  const [isLoadingReportDetail, setIsLoadingReportDetail] = useState(false);

  // Approval form states
  const [activeApproval, setActiveApproval] = useState(null);
  const [approveCategory, setApproveCategory] = useState('phishing');
  const [approveSeverity, setApproveSeverity] = useState('danger');
  const [approveDescription, setApproveDescription] = useState('');
  const [approveBankName, setApproveBankName] = useState('');

  // Fetch reports list (paginated & filtered) from backend API
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoadingReports(true);
      try {
        const res = await api.getAdminReports(token, reportsPage, reportsLimit, reportsStatusFilter, reportsTypeFilter);
        if (res && res.success && res.data) {
          const reportList = Array.isArray(res.data) ? res.data : (res.data.reports || []);
          
          const mappedReports = reportList.map(r => {
            let targetVal = r.raw?.url || '';
            let rawType = 'url';
            if (r.type === 0) {
              if (r.raw?.other?.phone && r.raw.other.phone.length > 0) {
                targetVal = r.raw.other.phone[0];
                rawType = 'phone';
              } else if (r.raw?.other?.bank_account && r.raw.other.bank_account.length > 0) {
                targetVal = r.raw.other.bank_account[0];
                rawType = 'bank_account';
              } else {
                targetVal = r.target || '';
                rawType = 'phone';
              }
            }

            return {
              id: r.id || r._id,
              target: targetVal || r.target || '',
              type: rawType,
              bankName: r.raw?.other?.bank_name?.[0] || r.bankName || '',
              reporter: r.reporter?.name || 'Ẩn danh',
              email: r.reporter?.contact?.find(c => c.type === 'email')?.value || r.email || '',
              date: r.created_at || r.date || new Date().toISOString(),
              description: r.raw?.detail || r.description || '',
              status: r.status || 'pending'
            };
          });

          setPendingReports(mappedReports);
          if (res.data.total) {
            setReportsTotal(res.data.total);
          } else if (res.total) {
            setReportsTotal(res.total);
          } else {
            setReportsTotal(mappedReports.length);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch reports list from backend, using localStorage data.", err);
        const saved = localStorage.getItem('admin_pending_reports');
        if (saved) {
          try {
            const defaults = JSON.parse(saved);
            const localFiltered = defaults.filter(r => {
              const rStatus = r.status || 'pending';
              if (rStatus !== reportsStatusFilter) return false;
              if (reportsTypeFilter !== null) {
                if (reportsTypeFilter === 1 && r.type !== 'url') return false;
                if (reportsTypeFilter === 0 && r.type === 'url') return false;
              }
              // Local query filtering
              if (searchQuery) {
                return r.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       r.reporter.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       r.description.toLowerCase().includes(searchQuery.toLowerCase());
              }
              return true;
            });
            setPendingReports(localFiltered);
            setReportsTotal(localFiltered.length);
          } catch (e) {
            console.error(e);
          }
        }
      } finally {
        setIsLoadingReports(false);
      }
    };

    fetchReports();
  }, [reportsPage, reportsLimit, reportsStatusFilter, reportsTypeFilter, searchQuery, token, setPendingReports]);

  // Fetch report detailed statistics and files
  const handleOpenReportDetail = async (report) => {
    setActiveReportDetail(report);
    setIsLoadingReportDetail(true);
    setReportDetailData(null);
    try {
      const res = await api.getAdminReportDetail(token, report.id);
      if (res && res.success && res.data) {
        setReportDetailData(res.data);
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) {
      console.warn("Failed to fetch report detail from backend, using mock/local fallback.", err);
      setReportDetailData({
        id: report.id,
        target: report.target,
        type: report.type,
        status: report.status || 'pending',
        created_at: report.date,
        description: report.description,
        evidence_image: '',
        loss_amount: report.type === 'bank_account' ? 2500000 : 0,
        victim: {
          name: report.reporter,
          email: report.email,
          phone: report.type === 'phone' ? report.target : ''
        }
      });
    } finally {
      setIsLoadingReportDetail(false);
    }
  };

  // Open Approve Modal
  const handleOpenApproveModal = (report) => {
    setActiveApproval(report);
    setApproveDescription(report.description);
    setApproveBankName(report.bankName || '');
    setApproveCategory(report.type === 'url' ? 'phishing' : 'financial');
    setApproveSeverity('danger');
  };

  const handleApproveConfirm = async () => {
    if (!activeApproval) return;

    try {
      await api.updateAdminReportStatus(token, activeApproval.id, 'approved');
      if (addToast) addToast(`Đã lưu phê duyệt thành công trên hệ thống.`, 'success');
    } catch (e) {
      console.warn("Backend API updateAdminReportStatus failed, fallback to mock approve.", e);
    }

    const newItem = {
      id: generateId('bl'),
      target: activeApproval.target,
      type: activeApproval.type,
      category: approveCategory,
      severity: approveSeverity,
      description: approveDescription,
      bankName: activeApproval.type === 'bank_account' ? approveBankName : undefined,
      date: new Date().toISOString()
    };

    saveBlacklist([newItem, ...blacklist]);
    savePendingReports(pendingReports.filter(r => r.id !== activeApproval.id));
    addAuditLog('Duyệt Báo cáo', activeApproval.target, `Phê duyệt báo cáo chờ vào danh sách đen. Thể loại: ${approveCategory}`);

    if (addToast) addToast(`Đã phê duyệt đối tượng "${activeApproval.target}" vào danh sách đen.`, 'success');
    setActiveApproval(null);
  };

  const handleRejectReport = async (report) => {
    if (window.confirm(`Bạn có chắc muốn từ chối báo cáo đối với "${report.target}"?`)) {
      try {
        await api.updateAdminReportStatus(token, report.id, 'rejected');
        if (addToast) addToast(`Đã lưu từ chối báo cáo thành công trên hệ thống.`, 'info');
      } catch (e) {
        console.warn("Backend API updateAdminReportStatus failed, fallback to mock reject.", e);
      }

      savePendingReports(pendingReports.filter(r => r.id !== report.id));
      addAuditLog('Từ chối Báo cáo', report.target, `Từ chối yêu cầu duyệt báo cáo.`);
      if (addToast) addToast(`Đã từ chối báo cáo đối với "${report.target}".`, 'info');
    }
  };

  return (
    <div className="admin-tab-view animate-fade-in">
      <div className="db-panel-card" style={{ padding: 0 }}>
        <div className="db-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', padding: '1.25rem 1.5rem', margin: 0, borderBottom: '1px solid var(--border-color)' }}>
          <h3 className="db-card-title" style={{ margin: 0 }}>
            {reportsStatusFilter === 'pending' ? 'Danh sách yêu cầu đang chờ duyệt' :
             reportsStatusFilter === 'approved' ? 'Danh sách yêu cầu đã phê duyệt chặn' :
             'Danh sách yêu cầu đã từ chối'}
          </h3>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {/* Search query for reports */}
            <div className="report-input-wrap header-search-box" style={{ maxWidth: '240px', margin: 0 }}>
              <Search size={14} className="report-input-icon" />
              <input
                type="text"
                className="report-input"
                placeholder="Tìm kiếm nhanh..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setReportsPage(1); }}
                style={{ height: '36px', fontSize: '0.8rem', borderRadius: '8px' }}
              />
            </div>
            
            <span className={`status-badge ${reportsStatusFilter}`}>
              {reportsTotal} yêu cầu
            </span>
          </div>
        </div>

        {/* Filtering Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1rem 1.25rem',
          background: 'var(--bg-card-subtle)',
          borderBottom: '1px solid var(--border-color)'
        }}>
          {/* Status filter buttons */}
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              onClick={() => { setReportsStatusFilter('pending'); setReportsPage(1); }}
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: '600',
                borderRadius: '6px',
                cursor: 'pointer',
                border: '1px solid',
                borderColor: reportsStatusFilter === 'pending' ? '#f59e0b' : 'var(--border-color)',
                backgroundColor: reportsStatusFilter === 'pending' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                color: reportsStatusFilter === 'pending' ? '#f59e0b' : 'var(--text-secondary)',
                transition: 'all 0.15s ease'
              }}
            >
              Chờ duyệt
            </button>
            <button
              onClick={() => { setReportsStatusFilter('approved'); setReportsPage(1); }}
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: '600',
                borderRadius: '6px',
                cursor: 'pointer',
                border: '1px solid',
                borderColor: reportsStatusFilter === 'approved' ? '#23b56c' : 'var(--border-color)',
                backgroundColor: reportsStatusFilter === 'approved' ? 'rgba(35, 181, 108, 0.15)' : 'transparent',
                color: reportsStatusFilter === 'approved' ? '#23b56c' : 'var(--text-secondary)',
                transition: 'all 0.15s ease'
              }}
            >
              Đã duyệt chặn
            </button>
            <button
              onClick={() => { setReportsStatusFilter('rejected'); setReportsPage(1); }}
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: '600',
                borderRadius: '6px',
                cursor: 'pointer',
                border: '1px solid',
                borderColor: reportsStatusFilter === 'rejected' ? '#ef4444' : 'var(--border-color)',
                backgroundColor: reportsStatusFilter === 'rejected' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                color: reportsStatusFilter === 'rejected' ? '#ef4444' : 'var(--text-secondary)',
                transition: 'all 0.15s ease'
              }}
            >
              Đã từ chối
            </button>
          </div>

          {/* Type filter buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>Phân loại:</span>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                onClick={() => { setReportsTypeFilter(null); setReportsPage(1); }}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: reportsTypeFilter === null ? '600' : 'normal',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: reportsTypeFilter === null ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  color: reportsTypeFilter === null ? 'var(--text-primary)' : 'var(--text-muted)'
                }}
              >
                Tất cả
              </button>
              <button
                onClick={() => { setReportsTypeFilter(1); setReportsPage(1); }}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: reportsTypeFilter === 1 ? '600' : 'normal',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: reportsTypeFilter === 1 ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  color: reportsTypeFilter === 1 ? 'var(--text-primary)' : 'var(--text-muted)'
                }}
              >
                Trang web
              </button>
              <button
                onClick={() => { setReportsTypeFilter(0); setReportsPage(1); }}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: reportsTypeFilter === 0 ? '600' : 'normal',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: reportsTypeFilter === 0 ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  color: reportsTypeFilter === 0 ? 'var(--text-primary)' : 'var(--text-muted)'
                }}
              >
                SĐT/STK lừa đảo
              </button>
            </div>
          </div>
        </div>

        {isLoadingReports ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem auto', color: '#23b56c' }} />
            Đang tải danh sách báo cáo...
          </div>
        ) : pendingReports.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Không có yêu cầu báo cáo nào tương ứng với bộ lọc hiện tại.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingReports.map(report => (
                <div key={report.id} className="db-history-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem', padding: '1.25rem', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {report.type === 'url' && <Globe size={16} color="var(--secondary)" />}
                      {report.type === 'bank_account' && <CreditCard size={16} color="var(--warning)" />}
                      {report.type === 'phone' && <Phone size={16} color="var(--primary)" />}
                      <span style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                        {report.target}
                      </span>
                      <span className="status-badge pending" style={{ textTransform: 'uppercase', fontSize: '0.62rem', fontWeight: 'bold' }}>
                        {report.type === 'url' ? 'Trang web' : report.type === 'bank_account' ? `STK (${report.bankName})` : 'Số điện thoại'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {/* View Report Detail Action */}
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleOpenReportDetail(report)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.85rem', fontSize: '0.78rem', borderRadius: '6px', backgroundColor: 'var(--bg-button-sec)', border: '1px solid var(--border-button-sec)', color: 'var(--text-primary)' }}
                      >
                        <Eye size={13} /> Chi tiết
                      </button>

                      {reportsStatusFilter === 'pending' ? (
                        <>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleRejectReport(report)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.85rem', fontSize: '0.78rem', borderRadius: '6px' }}
                          >
                            <X size={13} /> Từ chối
                          </button>
                          <button
                            className="btn btn-primary"
                            onClick={() => handleOpenApproveModal(report)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.85rem', fontSize: '0.78rem', borderRadius: '6px' }}
                          >
                            <Check size={13} /> Phê duyệt
                          </button>
                        </>
                      ) : (
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '99px',
                          fontSize: '0.72rem',
                          fontWeight: '600',
                          backgroundColor: reportsStatusFilter === 'approved' ? 'rgba(35, 181, 108, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: reportsStatusFilter === 'approved' ? '#23b56c' : '#ef4444'
                        }}>
                          {reportsStatusFilter === 'approved' ? 'Đã duyệt chặn' : 'Đã từ chối'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.03)',
                    borderRadius: '6px',
                    padding: '0.85rem',
                    fontSize: '0.82rem',
                    color: '#cbd5e1'
                  }}>
                    <p style={{ margin: '0 0 0.5rem 0', lineHeight: 1.45 }}>{report.description}</p>
                    <div style={{ display: 'flex', justifySelf: 'flex-start', flexWrap: 'wrap', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '0.4rem', marginTop: '0.4rem' }}>
                      <span>Người báo cáo: <strong>{report.reporter}</strong> ({report.email})</span>
                      <span>Thời gian: {new Date(report.date).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Bar */}
            {reportsTotal > reportsLimit && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <button
                  disabled={reportsPage === 1}
                  onClick={() => { setReportsPage(prev => Math.max(prev - 1, 1)); window.scrollTo(0, 0); }}
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '4px', cursor: reportsPage === 1 ? 'not-allowed' : 'pointer', opacity: reportsPage === 1 ? 0.5 : 1 }}
                >
                  Trước
                </button>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Trang {reportsPage} / {Math.ceil(reportsTotal / reportsLimit)}
                </span>
                <button
                  disabled={reportsPage >= Math.ceil(reportsTotal / reportsLimit)}
                  onClick={() => { setReportsPage(prev => prev + 1); window.scrollTo(0, 0); }}
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '4px', cursor: reportsPage >= Math.ceil(reportsTotal / reportsLimit) ? 'not-allowed' : 'pointer', opacity: reportsPage >= Math.ceil(reportsTotal / reportsLimit) ? 0.5 : 1 }}
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* APPROVE REPORT MODAL */}
      {/* ======================================================== */}
      {activeApproval && (
        <div className="signature-modal-overlay">
          <div className="signature-modal" style={{ maxWidth: '500px', textAlign: 'left' }}>
            <h3 className="signature-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={20} className="text-secondary" style={{ color: 'var(--secondary)' }} />
              Duyệt Đối Tượng Vào Danh Sách Đen
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '1rem 0' }}>
              <div className="profile-field-group">
                <label className="profile-field-label">Đối tượng chặn</label>
                <input
                  type="text"
                  className="profile-field-input"
                  value={activeApproval.target}
                  readOnly
                  disabled
                  style={{ background: '#f1f5f9', cursor: 'not-allowed' }}
                />
              </div>

              {activeApproval.type === 'bank_account' && (
                <div className="profile-field-group">
                  <label className="profile-field-label">Tên ngân hàng</label>
                  <input
                    type="text"
                    className="profile-field-input"
                    value={approveBankName}
                    onChange={(e) => setApproveBankName(e.target.value)}
                    placeholder="Ví dụ: Techcombank, Vietcombank..."
                  />
                </div>
              )}

              <div className="profile-field-group">
                <label className="profile-field-label">Thể loại vi phạm</label>
                <select
                  className="profile-field-input"
                  value={approveCategory}
                  onChange={(e) => setApproveCategory(e.target.value)}
                >
                  <option value="phishing">Giả mạo (Phishing)</option>
                  <option value="scam">Lừa đảo (Scam)</option>
                  <option value="financial">Lừa đảo tài chính (Financial Scam)</option>
                  <option value="romance">Lừa đảo tình cảm (Romance Scam)</option>
                  <option value="impersonation">Giả danh cơ quan công quyền</option>
                  <option value="other">Vi phạm khác</option>
                </select>
              </div>

              <div className="profile-field-group">
                <label className="profile-field-label">Mức độ nguy hại</label>
                <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                  {['danger', 'warning', 'info'].map(sev => (
                    <button
                      key={sev}
                      type="button"
                      className={`admin-btn-select ${approveSeverity === sev ? `active-${sev}` : ''}`}
                      onClick={() => setApproveSeverity(sev)}
                    >
                      {sev === 'danger' ? 'Nguy hiểm' : sev === 'warning' ? 'Cảnh báo' : 'Thông tin'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="profile-field-group">
                <label className="profile-field-label">Mô tả lý do chặn</label>
                <textarea
                  className="report-textarea"
                  value={approveDescription}
                  onChange={(e) => setApproveDescription(e.target.value)}
                  placeholder="Ghi chú chi tiết lý do đưa vào danh sách đen..."
                  style={{ height: '90px', padding: '0.75rem', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            <div className="signature-actions">
              <button
                type="button"
                className="btn btn-secondary report-nav-btn"
                onClick={() => setActiveApproval(null)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="btn btn-primary report-nav-btn"
                onClick={handleApproveConfirm}
              >
                Xác nhận Duyệt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* REPORT DETAILS MODAL */}
      {/* ======================================================== */}
      {activeReportDetail && (
        <div className="signature-modal-overlay">
          <div className="signature-modal" style={{ maxWidth: '800px', width: '90%', textAlign: 'left' }}>
            <h3 className="signature-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <ShieldAlert size={20} className="text-secondary" style={{ color: 'var(--secondary)' }} />
              Chi Tiết Báo Cáo Tố Cáo
            </h3>

            {isLoadingReportDetail ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem' }}>
                <RefreshCw size={24} className="animate-spin" style={{ color: '#23b56c' }} />
                <span style={{ fontSize: '0.88rem', color: '#64748b' }}>Đang tải chi tiết báo cáo từ máy chủ...</span>
              </div>
            ) : reportDetailData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* 2-Column top overview */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  
                  {/* Object Info */}
                  <div style={{ background: 'var(--bg-card-subtle)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>ĐỐI TƯỢNG BỊ TỐ CÁO</span>
                    <strong style={{ fontSize: '1.15rem', color: 'var(--secondary)', fontFamily: 'var(--font-display)', wordBreak: 'break-all' }}>{reportDetailData.target}</strong>
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className="status-badge" style={{
                        textTransform: 'uppercase',
                        fontSize: '0.62rem',
                        fontWeight: 'bold',
                        backgroundColor: reportDetailData.type === 'url' || reportDetailData.type === 'Link' ? 'rgba(0, 180, 216, 0.15)' : reportDetailData.type === 'phone' || reportDetailData.type === 'SĐT' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: reportDetailData.type === 'url' || reportDetailData.type === 'Link' ? '#00b4d8' : reportDetailData.type === 'phone' || reportDetailData.type === 'SĐT' ? '#f59e0b' : '#ef4444'
                      }}>
                        {reportDetailData.type === 'url' || reportDetailData.type === 'Link' ? 'Trang web' : reportDetailData.type === 'phone' || reportDetailData.type === 'SĐT' ? 'Số điện thoại' : 'Số tài khoản'}
                      </span>
                      <span className="status-badge" style={{
                        textTransform: 'uppercase',
                        fontSize: '0.62rem',
                        fontWeight: 'bold',
                        backgroundColor: reportDetailData.status === 'pending' ? 'rgba(245, 158, 11, 0.15)' : reportDetailData.status === 'approved' ? 'rgba(35, 181, 108, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: reportDetailData.status === 'pending' ? '#f59e0b' : reportDetailData.status === 'approved' ? '#23b56c' : '#ef4444'
                      }}>
                        {reportDetailData.status === 'pending' ? 'Chờ duyệt' : reportDetailData.status === 'approved' ? 'Đã chặn' : 'Đã từ chối'}
                      </span>
                    </div>
                  </div>

                  {/* Victim / Reporter info */}
                  <div style={{ background: 'var(--bg-card-subtle)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>THÔNG TIN NGƯỜI BÁO CÁO</span>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      <div>Họ tên: <strong>{reportDetailData.victim?.name || 'Ẩn danh'}</strong></div>
                      {reportDetailData.victim?.email && <div>Email: <span style={{ color: 'var(--text-secondary)' }}>{reportDetailData.victim.email}</span></div>}
                      {reportDetailData.victim?.phone && <div>SĐT liên hệ: <span style={{ color: 'var(--text-secondary)' }}>{reportDetailData.victim.phone}</span></div>}
                    </div>
                  </div>
                </div>

                {/* Description & Financial Info */}
                <div style={{ background: 'var(--bg-card-main)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>Nội dung chi tiết vụ việc</h4>
                    {reportDetailData.loss_amount > 0 && (
                      <span style={{ fontSize: '0.82rem', color: '#ff3e6c', fontWeight: 'bold' }}>
                        Thiệt hại: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(reportDetailData.loss_amount)}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {reportDetailData.description || 'Không có mô tả chi tiết kèm theo.'}
                  </p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                    Thời gian gửi báo cáo: {new Date(reportDetailData.created_at || reportDetailData.date).toLocaleString('vi-VN')}
                  </div>
                </div>

                {/* Evidence Image */}
                {reportDetailData.evidence_image && (
                  <div style={{ background: 'var(--bg-card-main)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Hình ảnh bằng chứng đính kèm</h4>
                    <div style={{ textAlign: 'center', background: 'var(--bg-card-subtle)', padding: '0.5rem', borderRadius: '6px', overflow: 'hidden' }}>
                      <img 
                         src={reportDetailData.evidence_image} 
                        alt="Bằng chứng tố cáo" 
                        style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '4px' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            <div className="signature-actions" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              {reportDetailData && reportDetailData.status === 'pending' && (
                <>
                  <button
                    type="button"
                    className="btn btn-secondary report-nav-btn"
                    onClick={() => {
                      const repToReject = {
                        id: reportDetailData.id,
                        target: reportDetailData.target
                      };
                      setActiveReportDetail(null);
                      setReportDetailData(null);
                      handleRejectReport(repToReject);
                    }}
                    style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <X size={14} /> Từ chối
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary report-nav-btn"
                    onClick={() => {
                      const repToApprove = {
                        id: reportDetailData.id,
                        target: reportDetailData.target,
                        type: reportDetailData.type,
                        description: reportDetailData.description
                      };
                      setActiveReportDetail(null);
                      setReportDetailData(null);
                      handleOpenApproveModal(repToApprove);
                    }}
                    style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <Check size={14} /> Phê duyệt
                  </button>
                </>
              )}
              <button
                type="button"
                className="btn btn-secondary report-nav-btn"
                onClick={() => {
                  setActiveReportDetail(null);
                  setReportDetailData(null);
                }}
                style={{ padding: '0.5rem 1.5rem', borderRadius: '8px', fontSize: '0.82rem' }}
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
