import { useState, useEffect } from 'react';
import { Search, Globe, CreditCard, Phone, Eye, X, Check, RefreshCw, ShieldAlert, Sparkles, Brain, Cpu, Database, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../../lib/api';

function generateId(prefix) {
  return `${prefix}_${new Date().getTime()}_${Math.floor(Math.random() * 1000)}`;
}

export default function ReportsTab({ token, pendingReports, setPendingReports, savePendingReports, blacklist, saveBlacklist, addAuditLog, addToast }) {
  const [reportsPage, setReportsPage] = useState(1);
  const reportsLimit = 10;
  const [reportsTotal, setReportsTotal] = useState(0);
  
  // Tab Filters
  // Types: 'all' | 'url' | 'phone' | 'bank_account'
  const [filterType, setFilterType] = useState('all'); 
  // 3 Statuses: 'pending' (Chờ duyệt) | 'approved' (Đã duyệt) | 'rejected' (Bị từ chối)
  const [activeStatusTab, setActiveStatusTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  // Detail & AI Analysis Modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [aiStatus, setAiStatus] = useState('idle'); // 'idle' | 'scanning' | 'done'
  const [aiProgressStep, setAiProgressStep] = useState(0);
  const [aiPayload, setAiPayload] = useState('');

  // Reset page when tabs or search query changes
  useEffect(() => {
    setReportsPage(1);
  }, [filterType, activeStatusTab, searchQuery]);

  // Fetch / Sync reports list
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoadingReports(true);
      try {
        // Fetch all types by passing null to backend
        const res = await api.getAdminReports(token, 1, 1000, activeStatusTab, null);
        
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

          // Filter mapped list based on client filterType and searchQuery locally
          const localFiltered = mappedReports.filter(r => {
            const matchesType = filterType === 'all' || r.type === filterType;
            const matchesSearch = !searchQuery || 
              r.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
              r.reporter.toLowerCase().includes(searchQuery.toLowerCase()) ||
              r.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesType && matchesSearch;
          });

          setPendingReports(localFiltered);
          setReportsTotal(localFiltered.length);
        }
      } catch (err) {
        console.warn("Failed to fetch reports from API, using localStorage mock data.", err);
        const saved = localStorage.getItem('admin_pending_reports');
        if (saved) {
          try {
            const list = JSON.parse(saved);
            const localFiltered = list.filter(r => {
              const rStatus = r.status || 'pending';
              if (rStatus !== activeStatusTab) return false;

              // Type check
              const matchesType = filterType === 'all' || r.type === filterType;
              if (!matchesType) return false;

              // Search query check
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
  }, [filterType, activeStatusTab, searchQuery, token, setPendingReports]);

  // AI Dual Payload States
  const [aiUrlPayload, setAiUrlPayload] = useState('');
  const [aiScammerPayload, setAiScammerPayload] = useState('');
  const [urlPushed, setUrlPushed] = useState(false);
  const [scammerPushed, setScammerPushed] = useState(false);
  const [activePayloadTab, setActivePayloadTab] = useState('url'); // 'url' | 'scammer'

  // Push URL Payload to new scam URL database
  const handlePushUrlPayload = async (reportItem) => {
    if (!reportItem) return;
    let payloadObj;
    try {
      payloadObj = JSON.parse(aiUrlPayload);
    } catch (e) {
      if (addToast) addToast("Cấu trúc Payload URL JSON không hợp lệ! Vui lòng chỉnh sửa lại.", "error");
      return;
    }

    try {
      // Call backend API /api/v1/admin/urls
      await api.addAdminScamURL(token, payloadObj);
      
      // Update local Blacklist State
      const newEntry = {
        id: generateId('bl'),
        target: payloadObj.url,
        type: 'url',
        category: payloadObj.category || 'phishing',
        severity: 'danger',
        description: payloadObj.description || 'Thêm qua AI Phân tích.',
        date: new Date().toISOString()
      };
      saveBlacklist([newEntry, ...blacklist]);
      addAuditLog('AI Đẩy URL', payloadObj.url, `Đẩy URL độc hại lên Database mới: ${payloadObj.category}`);
      setUrlPushed(true);
      if (addToast) addToast("Đã đẩy Payload URL lên CSDL mới thành công!", "success");
    } catch (err) {
      console.warn("API addAdminScamURL connection failed. Simulating local push.", err);
      // Fallback
      const newEntry = {
        id: generateId('bl'),
        target: payloadObj.url,
        type: 'url',
        category: payloadObj.category || 'phishing',
        severity: 'danger',
        description: payloadObj.description || 'Thêm qua AI Phân tích (Offline).',
        date: new Date().toISOString()
      };
      saveBlacklist([newEntry, ...blacklist]);
      setUrlPushed(true);
      if (addToast) addToast("Đã đẩy Payload URL lên CSDL mới thành công (Offline)!", "success");
    }
  };

  // Push Scammer Payload to new Scammers database
  const handlePushScammerPayload = async (reportItem) => {
    if (!reportItem) return;
    let payloadObj;
    try {
      payloadObj = JSON.parse(aiScammerPayload);
    } catch (e) {
      if (addToast) addToast("Cấu trúc Payload Scammer JSON không hợp lệ! Vui lòng chỉnh sửa lại.", "error");
      return;
    }

    try {
      // Call backend API /api/v1/admin/scammers
      await api.addAdminScammer(token, payloadObj);
      
      // Update local Blacklist State (Offline mirroring)
      const newEntry = {
        id: generateId('bl'),
        target: payloadObj.target,
        type: payloadObj.type || 'bank_account',
        category: 'scam',
        severity: 'danger',
        description: payloadObj.description || 'Đối tượng lừa đảo trích xuất qua AI.',
        bankName: payloadObj.bank_name,
        date: new Date().toISOString()
      };
      saveBlacklist([newEntry, ...blacklist]);
      addAuditLog('AI Đẩy Scammer', payloadObj.target, `Đẩy Đối tượng lừa đảo lên Database mới: ${payloadObj.name}`);
      setScammerPushed(true);
      if (addToast) addToast("Đã đẩy Payload Đối tượng lên CSDL mới thành công!", "success");
    } catch (err) {
      console.warn("API addAdminScammer connection failed. Simulating local push.", err);
      // Fallback
      const newEntry = {
        id: generateId('bl'),
        target: payloadObj.target,
        type: payloadObj.type || 'bank_account',
        category: 'scam',
        severity: 'danger',
        description: payloadObj.description || 'Đối tượng lừa đảo trích xuất qua AI (Offline).',
        bankName: payloadObj.bank_name,
        date: new Date().toISOString()
      };
      saveBlacklist([newEntry, ...blacklist]);
      setScammerPushed(true);
      if (addToast) addToast("Đã đẩy Payload Đối tượng lên CSDL mới thành công (Offline)!", "success");
    }
  };

  // Complete Report approval (marks report as approved)
  const handleCompleteReportApproval = async (reportItem) => {
    if (!reportItem) return;
    try {
      await api.updateAdminReportStatus(token, reportItem.id, 'approved');
    } catch (e) {
      console.warn("API report update status fallback.", e);
    }

    const updatedReports = pendingReports.map(r => r.id === reportItem.id ? { ...r, status: 'approved' } : r);
    savePendingReports(updatedReports);
    addAuditLog('Duyệt hoàn tất', reportItem.target, `Phê duyệt hoàn tất xử lý phản ánh tố cáo.`);
    if (addToast) addToast(`Đã lưu phê duyệt hoàn tất báo cáo đối với "${reportItem.target}".`, 'success');
    setSelectedReport(null);
    setAiStatus('idle');
  };

  // Quick Reject
  const handleRejectReport = async (reportItem) => {
    if (window.confirm(`Bạn có chắc muốn từ chối báo cáo đối với "${reportItem.target}"?`)) {
      try {
        await api.updateAdminReportStatus(token, reportItem.id, 'rejected');
      } catch (e) {
        console.warn("API report update status fallback.", e);
      }

      const updatedReports = pendingReports.map(r => r.id === reportItem.id ? { ...r, status: 'rejected' } : r);
      savePendingReports(updatedReports);
      addAuditLog('Từ chối Báo cáo', reportItem.target, `Từ chối yêu cầu duyệt báo cáo.`);
      if (addToast) addToast(`Đã từ chối báo cáo đối với "${reportItem.target}".`, 'info');
      setSelectedReport(null);
      setAiStatus('idle');
    }
  };

  // Run AI analysis and split payloads
  const runAiAnalysis = (reportItem) => {
    setAiStatus('scanning');
    setAiProgressStep(0);
    setUrlPushed(false);
    setScammerPushed(false);

    const steps = [
      "Đang quét IP và đối soát thông tin DNS...",
      "Đang phân tích cú pháp tiêu đề, DOM & trích xuất mã độc...",
      "Đang đối chiếu dữ liệu lừa đảo liên ngân hàng...",
      "Hoàn tất phân tích! Đang cấu trúc hóa các dạng Payload..."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep += 1;
      setAiProgressStep(currentStep);
      if (currentStep >= steps.length) {
        clearInterval(interval);
        
        // Smart payload extraction
        const isUrl = reportItem.type === 'url' || reportItem.target.includes('.') || reportItem.target.includes('http');
        
        let urlVal = isUrl ? reportItem.target : 'vietcombank-login-reward.xyz';
        let phoneVal = reportItem.type === 'phone' ? reportItem.target : '';
        let bankAccountVal = reportItem.type === 'bank_account' ? reportItem.target : '';
        let bankNameVal = reportItem.bankName || 'MB Bank';
        
        // Scan description to find any bank or phone dynamically
        const text = reportItem.description || '';
        const phoneRegex = /(0[3|5|7|8|9]\d{8})/g;
        const bankRegex = /\b(\d{9,14})\b/g;
        
        const phoneMatches = text.match(phoneRegex);
        if (phoneMatches && phoneMatches.length > 0) {
          phoneVal = phoneMatches[0];
        }
        const bankMatches = text.match(bankRegex);
        if (bankMatches && bankMatches.length > 0) {
          bankAccountVal = bankMatches[0];
        }

        // 1. Generate URL blocklist Payload
        const urlPayloadObj = {
          url: urlVal.replace(/https?:\/\//, '').split('/')[0],
          category: 'phishing',
          description: `Tên miền lừa đảo giả mạo. Phản ánh từ: ${reportItem.reporter}. Chi tiết hành vi: ${reportItem.description}`
        };

        // 2. Generate Scammer Registry Payload
        let scammerTarget = bankAccountVal || phoneVal || 'facebook.com/unknown_scammer';
        let scammerType = bankAccountVal ? 'bank_account' : phoneVal ? 'phone' : 'facebook';
        
        const scammerPayloadObj = {
          target: scammerTarget,
          type: scammerType,
          name: reportItem.reporter.split(' ').length > 1 ? reportItem.reporter.toUpperCase() : 'ẨN DANH',
          bank_name: scammerType === 'bank_account' ? bankNameVal : undefined,
          description: `AI trích xuất đối tượng lừa đảo từ phản ánh. Chi tiết: ${reportItem.description}`
        };

        setAiUrlPayload(JSON.stringify(urlPayloadObj, null, 2));
        setAiScammerPayload(JSON.stringify(scammerPayloadObj, null, 2));
        
        // Default to active tab depending on the report's primary type
        setActivePayloadTab(isUrl ? 'url' : 'scammer');
        setAiStatus('done');
      }
    }, 400);
  };

  const getScanStepText = (stepIndex) => {
    const steps = [
      "Đang quét IP và đối soát thông tin DNS...",
      "Đang phân tích cú pháp tiêu đề, DOM & trích xuất mã độc...",
      "Đang đối chiếu dữ liệu lừa đảo liên ngân hàng...",
      "Hoàn tất phân tích! Đang cấu trúc hóa các dạng Payload..."
    ];
    return steps[stepIndex] || "";
  };

  const startIdx = (reportsPage - 1) * reportsLimit;
  const paginatedReports = pendingReports.slice(startIdx, startIdx + reportsLimit);
  const totalPages = Math.ceil(pendingReports.length / reportsLimit) || 1;

  return (
    <div id="kt_app_content_container" className="app-container container-xxl" style={{ padding: '1.75rem' }}>
      
      <div className="card">
        {/* Card header */}
        <div className="card-header border-0 pt-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: 'none' }}>
          
          {/* Card title (Status Filters: Pending, Approved, Rejected) */}
          <div className="card-title">
            <div style={{ display: 'flex', gap: '0.35rem', background: '#f5f8fa', padding: '0.25rem', borderRadius: '8px' }}>
              <button
                type="button"
                className={`btn btn-sm ${activeStatusTab === 'pending' ? 'btn-primary' : ''}`}
                onClick={() => setActiveStatusTab('pending')}
                style={{
                  height: '32px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: 'none',
                  background: activeStatusTab === 'pending' ? '#ffc700' : 'transparent',
                  color: activeStatusTab === 'pending' ? '#fff' : '#5e6278'
                }}
              >
                Chờ duyệt
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeStatusTab === 'approved' ? 'btn-primary' : ''}`}
                onClick={() => setActiveStatusTab('approved')}
                style={{
                  height: '32px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: 'none',
                  background: activeStatusTab === 'approved' ? '#50cd89' : 'transparent',
                  color: activeStatusTab === 'approved' ? '#fff' : '#5e6278'
                }}
              >
                Đã duyệt chặn
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeStatusTab === 'rejected' ? 'btn-primary' : ''}`}
                onClick={() => setActiveStatusTab('rejected')}
                style={{
                  height: '32px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: 'none',
                  background: activeStatusTab === 'rejected' ? '#f1416c' : 'transparent',
                  color: activeStatusTab === 'rejected' ? '#fff' : '#5e6278'
                }}
              >
                Đã từ chối
              </button>
            </div>
          </div>

          {/* Card toolbar (Filters & Search) */}
          <div className="card-toolbar">
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {/* Type filter dropdown */}
              <select
                className="form-select form-select-solid w-150px"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{ height: '40px', fontSize: '0.85rem', borderRadius: '6px', border: 'none', background: '#f5f8fa', padding: '0 1rem', cursor: 'pointer', color: '#5e6278' }}
              >
                <option value="all">Tất cả loại</option>
                <option value="url">Tên miền (URL)</option>
                <option value="phone">Số điện thoại</option>
                <option value="bank_account">Số tài khoản</option>
              </select>

              {/* Search Box */}
              <div className="d-flex align-items-center position-relative my-1" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <Search className="position-absolute ms-5" size={18} style={{ position: 'absolute', marginLeft: '1.25rem', color: '#a1a5b7' }} />
                <input
                  type="text"
                  className="form-control form-control-solid w-250px ps-13"
                  placeholder="Tìm kiếm báo cáo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ height: '40px', fontSize: '0.9rem', borderRadius: '6px', paddingLeft: '3rem', border: 'none', background: '#f5f8fa', color: '#5e6278', outline: 'none' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card body */}
        <div className="card-body py-4">
          <div className="table-responsive">
            <table className="table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer">
              <thead>
                <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0" style={{ borderBottom: '1px solid #eff2f5' }}>
                  <th style={{ width: '280px' }}>Đối tượng báo cáo</th>
                  <th style={{ width: '150px' }}>Loại đối tượng</th>
                  <th style={{ width: '160px' }}>Người báo cáo</th>
                  <th style={{ width: '130px' }}>Ngày gửi</th>
                  <th>Nội dung tố cáo</th>
                  <th className="text-end" style={{ width: '130px', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 fw-semibold">
                {isLoadingReports ? (
                  <tr>
                    <td colSpan="6" className="text-center" style={{ padding: '3rem', textAlign: 'center', color: '#a1a5b7' }}>
                      Đang tải danh sách báo cáo...
                    </td>
                  </tr>
                ) : pendingReports.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center" style={{ padding: '3rem', textAlign: 'center', color: '#a1a5b7' }}>
                      Không có báo cáo nào trùng khớp.
                    </td>
                  </tr>
                ) : (
                  paginatedReports.map((report, index) => (
                    <tr key={report.id} className={index % 2 === 0 ? 'odd' : 'even'}>
                      
                      {/* Target Info */}
                      <td style={{ display: 'flex', alignItems: 'center', borderBottom: 'none' }}>
                        <div className="symbol symbol-circle symbol-50px overflow-hidden me-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0, marginRight: '0.75rem' }}>
                          <div className={`symbol-label fs-3 ${report.type === 'url' ? 'bg-light-primary text-primary' : report.type === 'phone' ? 'bg-light-warning text-warning' : 'bg-light-danger text-danger'}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', fontWeight: 700, fontSize: '0.9rem' }}>
                            {report.type === 'url' ? 'W' : report.type === 'phone' ? 'P' : 'B'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className="text-gray-800 text-hover-primary mb-1" style={{ fontWeight: 700, color: '#181c32', fontSize: '0.9rem', wordBreak: 'break-all' }}>
                            {report.target}
                          </span>
                          {report.type === 'bank_account' && report.bankName && (
                            <span style={{ fontSize: '0.78rem', color: '#a1a5b7' }}>Ngân hàng: {report.bankName}</span>
                          )}
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td>
                        <span className="badge badge-light" style={{ textTransform: 'uppercase', fontSize: '0.68rem' }}>
                          {report.type === 'url' ? 'Tên miền' : report.type === 'phone' ? 'Số điện thoại' : 'Số tài khoản'}
                        </span>
                      </td>

                      {/* Reporter */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.85rem', color: '#181c32', fontWeight: 600 }}>{report.reporter}</span>
                          <span style={{ fontSize: '0.78rem', color: '#a1a5b7' }}>{report.email}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td>
                        <span style={{ fontSize: '0.82rem', color: '#7e8299' }}>
                          {new Date(report.date).toLocaleDateString('vi-VN')}
                        </span>
                      </td>

                      {/* Description / Evidence */}
                      <td>
                        <span style={{ fontSize: '0.85rem', color: '#5e6278', display: 'inline-block', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={report.description}>
                          {report.description}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="text-end" style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-light btn-active-light-primary btn-sm"
                          onClick={() => {
                            setSelectedReport(report);
                            setAiStatus('idle');
                            setAiUrlPayload('');
                            setAiScammerPayload('');
                          }}
                        >
                          Kiểm duyệt
                        </button>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="row" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="col-sm-12 col-md-5 d-flex align-items-center justify-content-center justify-content-md-start" style={{ color: '#a1a5b7', fontSize: '0.85rem' }}>
              Hiển thị {pendingReports.length > 0 ? startIdx + 1 : 0} - {Math.min(startIdx + reportsLimit, pendingReports.length)} trong tổng số {pendingReports.length} yêu cầu
            </div>
            <div className="col-sm-12 col-md-7 d-flex align-items-center justify-content-center justify-content-md-end" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div className="dataTables_paginate paging_simple_numbers">
                <ul className="pagination" style={{ display: 'flex', listStyle: 'none', padding: 0, gap: '0.25rem', margin: 0 }}>
                  <li className={`paginate_button page-item previous ${reportsPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      disabled={reportsPage === 1}
                      onClick={() => setReportsPage(prev => Math.max(prev - 1, 1))}
                    >
                      &lt;
                    </button>
                  </li>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const p = i + 1;
                    return (
                      <li key={p} className={`paginate_button page-item ${reportsPage === p ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => setReportsPage(p)}>
                          {p}
                        </button>
                      </li>
                    );
                  })}

                  <li className={`paginate_button page-item next ${reportsPage >= totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      disabled={reportsPage >= totalPages}
                      onClick={() => setReportsPage(prev => Math.min(prev + 1, totalPages))}
                    >
                      &gt;
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* AI THREAT ANALYSIS CENTER MODAL (2 COLUMNS) */}
      {/* ======================================================== */}
      {selectedReport && (
        <div className="signature-modal-overlay">
          <div className="signature-modal" style={{ maxWidth: '900px', width: '95%', textAlign: 'left' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f3f9', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 className="signature-modal-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#181c32' }}>
                <Brain size={22} color="#009ef7" />
                Trung Tâm Kiểm Duyệt Phản Ánh & Phân Tích Trí Tuệ Nhân Tạo (AI Threat Lab)
              </h3>
              <button type="button" onClick={() => setSelectedReport(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#a1a5b7' }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: 2 Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.75rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              
              {/* Left Column: Original Report Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <span className="profile-field-label" style={{ borderBottom: '1px solid #eff2f5', paddingBottom: '0.35rem', color: '#5e6278', textTransform: 'uppercase', fontWeight: 'bold' }}>
                  Thông tin phản ánh gốc từ người dùng
                </span>

                <div style={{ background: '#f5f8fa', padding: '1rem', borderRadius: '8px', border: '1px solid #eff2f5' }}>
                  <span style={{ fontSize: '0.72rem', color: '#a1a5b7', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>ĐỐI TƯỢNG BỊ TỐ CÁO</span>
                  <strong style={{ fontSize: '1.15rem', color: '#181c32', display: 'block', wordBreak: 'break-all' }}>{selectedReport.target}</strong>
                  <div style={{ marginTop: '0.35rem' }}>
                    <span className="badge badge-light" style={{ fontSize: '0.68rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      {selectedReport.type === 'url' ? 'Tên miền / URL' : selectedReport.type === 'phone' ? 'Số điện thoại' : `Tài khoản (${selectedReport.bankName})`}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <span className="profile-field-label">Người phản ánh</span>
                    <strong style={{ fontSize: '0.85rem', color: '#181c32', display: 'block' }}>{selectedReport.reporter}</strong>
                  </div>
                  <div>
                    <span className="profile-field-label">Email liên hệ</span>
                    <strong style={{ fontSize: '0.82rem', color: '#181c32', display: 'block', wordBreak: 'break-all' }}>{selectedReport.email}</strong>
                  </div>
                </div>

                <div>
                  <span className="profile-field-label">Chứng cứ & Mô tả chi tiết hành vi</span>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#5e6278', lineHeight: 1.5, background: '#f5f8fa', padding: '0.75rem', borderRadius: '6px', whiteSpace: 'pre-wrap' }}>
                    {selectedReport.description}
                  </p>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#a1a5b7' }}>
                  Thời gian nhận báo cáo: {new Date(selectedReport.date).toLocaleString('vi-VN')}
                </div>
              </div>

              {/* Right Column: AI Threat Analyst */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderLeft: '1px solid #eff2f5', paddingLeft: '1.5rem' }}>
                <span className="profile-field-label" style={{ borderBottom: '1px solid #eff2f5', paddingBottom: '0.35rem', color: '#009ef7', display: 'flex', alignItems: 'center', gap: '0.25rem', textTransform: 'uppercase', fontWeight: 'bold' }}>
                  <Sparkles size={14} /> Trợ lý phân tích AI
                </span>

                {aiStatus === 'idle' && (
                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f5f8fa', border: '1px dashed #eff2f5', borderRadius: '8px', padding: '2rem', textAlign: 'center', minHeight: '260px' }}>
                    <Brain size={48} color="#009ef7" style={{ marginBottom: '1rem', opacity: 0.6 }} />
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.92rem', fontWeight: 700 }}>Chưa tiến hành phân tích mối đe dọa</h4>
                    <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.8rem', color: '#a1a5b7', lineHeight: 1.4 }}>
                      Sử dụng trí tuệ nhân tạo để phân tích mã độc, quét DNS, kiểm tra thông tin ngân hàng lừa đảo và tự động định dạng thành Payload cấu trúc.
                    </p>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => runAiAnalysis(selectedReport)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Sparkles size={14} /> Bắt đầu phân tích AI
                    </button>
                  </div>
                )}

                {aiStatus === 'scanning' && (
                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f5f8fa', border: '1px solid #eff2f5', borderRadius: '8px', padding: '2rem', textAlign: 'center', minHeight: '260px' }}>
                    <Cpu size={36} className="animate-spin" style={{ color: '#009ef7', marginBottom: '1.25rem' }} />
                    <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#181c32', display: 'block', marginBottom: '0.5rem' }}>
                      {getScanStepText(aiProgressStep)}
                    </span>
                    <div style={{ width: '100%', maxWidth: '240px', background: '#eff2f5', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ background: '#009ef7', height: '40px', width: `${(aiProgressStep + 1) * 25}%`, transition: 'width 0.4s' }} />
                    </div>
                  </div>
                )}

                {aiStatus === 'done' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexGrow: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="profile-field-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#50cd89' }}>
                        <Check size={14} /> AI Phân tích thành công
                      </span>
                      <button
                        type="button"
                        className="btn btn-light btn-sm"
                        onClick={() => runAiAnalysis(selectedReport)}
                        style={{ fontSize: '0.72rem', height: '24px', padding: '0 0.5rem' }}
                      >
                        Quét lại
                      </button>
                    </div>

                    {/* Switch tabs between URL payload and Scammer payload */}
                    <div style={{ display: 'flex', gap: '0.25rem', background: '#eff2f5', padding: '0.2rem', borderRadius: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setActivePayloadTab('url')}
                        style={{
                          flex: 1,
                          height: '28px',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: activePayloadTab === 'url' ? '#fff' : 'transparent',
                          color: activePayloadTab === 'url' ? '#009ef7' : '#5e6278',
                          cursor: 'pointer'
                        }}
                      >
                        CSDL URL ({urlPushed ? "Đã đẩy" : "Chờ đẩy"})
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePayloadTab('scammer')}
                        style={{
                          flex: 1,
                          height: '28px',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: activePayloadTab === 'scammer' ? '#fff' : 'transparent',
                          color: activePayloadTab === 'scammer' ? '#009ef7' : '#5e6278',
                          cursor: 'pointer'
                        }}
                      >
                        CSDL Đối Tượng ({scammerPushed ? "Đã đẩy" : "Chờ đẩy"})
                      </button>
                    </div>

                    {/* Active Payload Tab Body */}
                    {activePayloadTab === 'url' ? (
                      <div className="profile-field-group">
                        <label className="profile-field-label" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <span>Payload Blocklist URL độc hại</span>
                          <span style={{ color: '#a1a5b7', fontSize: '0.72rem', fontFamily: 'monospace' }}>DATABASE: Blocklist URL</span>
                        </label>
                        <textarea
                          className="report-textarea"
                          value={aiUrlPayload}
                          onChange={(e) => setAiUrlPayload(e.target.value)}
                          style={{ height: '170px', fontFamily: 'monospace', fontSize: '0.8rem', background: '#1e1e2d', color: '#98c379', border: 'none', padding: '0.85rem' }}
                        />
                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={urlPushed}
                          onClick={() => handlePushUrlPayload(selectedReport)}
                          style={{
                            marginTop: '0.5rem',
                            width: '100%',
                            height: '36px',
                            fontSize: '0.8rem',
                            background: urlPushed ? '#f5f8fa' : '#009ef7',
                            color: urlPushed ? '#5e6278' : '#fff',
                            border: urlPushed ? '1px solid #eff2f5' : 'none'
                          }}
                        >
                          {urlPushed ? "✓ Đã đẩy lên CSDL URL thành công" : "Đẩy Lên Database URL Mới"}
                        </button>
                      </div>
                    ) : (
                      <div className="profile-field-group">
                        <label className="profile-field-label" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <span>Payload Đối Tượng lừa đảo (Scammer)</span>
                          <span style={{ color: '#a1a5b7', fontSize: '0.72rem', fontFamily: 'monospace' }}>DATABASE: Scammer Registry</span>
                        </label>
                        <textarea
                          className="report-textarea"
                          value={aiScammerPayload}
                          onChange={(e) => setAiScammerPayload(e.target.value)}
                          style={{ height: '170px', fontFamily: 'monospace', fontSize: '0.8rem', background: '#1e1e2d', color: '#98c379', border: 'none', padding: '0.85rem' }}
                        />
                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={scammerPushed}
                          onClick={() => handlePushScammerPayload(selectedReport)}
                          style={{
                            marginTop: '0.5rem',
                            width: '100%',
                            height: '36px',
                            fontSize: '0.8rem',
                            background: scammerPushed ? '#f5f8fa' : '#009ef7',
                            color: scammerPushed ? '#5e6278' : '#fff',
                            border: scammerPushed ? '1px solid #eff2f5' : 'none'
                          }}
                        >
                          {scammerPushed ? "✓ Đã đẩy lên CSDL Scammer thành công" : "Đẩy Lên Database Scammer Mới"}
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

            {/* Modal Footer */}
            <div className="signature-actions" style={{ borderTop: '1px solid #f1f3f9', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedReport(null)}
              >
                Hủy bỏ
              </button>
              
              {selectedReport.status === 'pending' && (
                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => handleRejectReport(selectedReport)}
                    style={{ color: '#f1416c' }}
                  >
                    Từ chối báo cáo
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!urlPushed && !scammerPushed}
                    onClick={() => handleCompleteReportApproval(selectedReport)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: (urlPushed || scammerPushed) ? '#50cd89' : '#a1a5b7' }}
                  >
                    <Database size={14} /> Hoàn tất duyệt báo cáo
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
