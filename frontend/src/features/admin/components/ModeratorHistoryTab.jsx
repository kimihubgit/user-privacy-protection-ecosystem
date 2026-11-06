import { useState, useEffect } from 'react';
import { Search, Globe, CreditCard, Phone, Eye, X, Check, RefreshCw, User, ShieldAlert, Sparkles, Brain, Cpu, Database, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ModeratorHistoryTab({ auditLogs, addToast }) {
  const [historyPage, setHistoryPage] = useState(1);
  const historyLimit = 10;
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModerator, setFilterModerator] = useState('all');
  const [filterAction, setFilterAction] = useState('all');

  // Selected detail modal state
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Default past moderator activities
  const defaultHistory = [
    {
      id: 'h_mock1',
      operator: 'hoang.nguyen@protect.vn',
      operatorName: 'Nguyễn Văn Hoàng',
      action: 'Duyệt chặn (Approve)',
      target: 'vietcombank-reward-cld.xyz',
      type: 'url',
      date: '2026-07-14T09:30:00Z',
      details: 'Phát hiện website giả mạo thương hiệu ngân hàng lớn để đánh cắp mật khẩu OTP. Khuyến nghị đưa vào Blacklist bảo vệ.',
      payload: {
        scam_type: 'phishing_link',
        scam_value: 'vietcombank-reward-cld.xyz',
        severity_level: 'danger',
        hosting_provider: 'Cloudflare Inc.',
        ip_address: '104.21.36.90',
        status: 'approved_block'
      }
    },
    {
      id: 'h_mock2',
      operator: 'mai.tran@protect.vn',
      operatorName: 'Trần Thị Mai',
      action: 'Từ chối (Reject)',
      target: '0988222333',
      type: 'phone',
      date: '2026-07-14T08:15:00Z',
      details: 'Báo cáo số điện thoại spam tiếp thị không đủ chứng cứ cấu thành lừa đảo tài sản.',
      payload: null
    },
    {
      id: 'h_mock3',
      operator: 'khoa.vu@protect.vn',
      operatorName: 'Vũ Minh Khoa',
      action: 'Duyệt chặn (Approve)',
      target: '97040228839401',
      type: 'bank_account',
      bankName: 'MB Bank',
      date: '2026-07-13T16:20:00Z',
      details: 'Tài khoản lừa đảo nhận tiền đặt cọc nhà trọ của sinh viên sau đó chặn liên lạc.',
      payload: {
        scam_type: 'bank_fraud',
        scam_value: '97040228839401',
        bank_name: 'MB Bank',
        name: 'NGUYEN VAN A',
        status: 'approved_block'
      }
    },
    {
      id: 'h_mock4',
      operator: 'tuan.le@protect.vn',
      operatorName: 'Lê Anh Tuấn',
      action: 'Duyệt chặn (Approve)',
      target: 'momo-nhanloc-he2026.com',
      type: 'url',
      date: '2026-07-13T14:10:00Z',
      details: 'Trang web mạo danh ví điện tử MoMo trúng thưởng hè để lừa mã xác thực.',
      payload: {
        scam_type: 'phishing_link',
        scam_value: 'momo-nhanloc-he2026.com',
        severity_level: 'danger',
        hosting_provider: 'Cloudflare Inc.',
        ip_address: '104.21.36.91',
        status: 'approved_block'
      }
    }
  ];

  // Map system audit logs to moderator history style
  const systemHistory = auditLogs
    .filter(log => log.action.includes('Duyệt') || log.action.includes('Từ chối') || log.action.includes('AI'))
    .map(log => {
      const isApprove = log.action.toLowerCase().includes('duyệt') || log.action.toLowerCase().includes('đẩy');

      // Determine type
      let type = 'url';
      if (log.target.match(/^\d{9,14}$/)) type = 'bank_account';
      else if (log.target.match(/^0\d{9}$/)) type = 'phone';

      return {
        id: log.id,
        operator: log.operator,
        operatorName: log.operator === 'admin@shield.vn' ? 'Quản trị viên (Admin)' : log.operator.split('@')[0],
        action: isApprove ? 'Duyệt chặn (Approve)' : 'Từ chối (Reject)',
        target: log.target,
        type: type,
        date: log.date,
        details: log.details,
        payload: isApprove ? {
          scam_type: type === 'url' ? 'phishing_link' : type === 'phone' ? 'telecom_scam' : 'bank_fraud',
          scam_value: log.target,
          status: 'approved_block',
          analyst_opinion: log.details
        } : null
      };
    });

  // Combine both default list and live system logs
  const combinedHistory = [...systemHistory, ...defaultHistory];

  // Filter history records
  const filteredHistory = combinedHistory.filter(record => {
    // Moderator filter
    if (filterModerator !== 'all') {
      if (filterModerator === 'admin' && record.operator !== 'admin@shield.vn') return false;
      if (filterModerator === 'hoang' && record.operator !== 'hoang.nguyen@protect.vn') return false;
      if (filterModerator === 'mai' && record.operator !== 'mai.tran@protect.vn') return false;
      if (filterModerator === 'khoa' && record.operator !== 'khoa.vu@protect.vn') return false;
      if (filterModerator === 'tuan' && record.operator !== 'tuan.le@protect.vn') return false;
    }

    // Action filter
    if (filterAction !== 'all') {
      if (filterAction === 'approve' && !record.action.includes('Duyệt')) return false;
      if (filterAction === 'reject' && !record.action.includes('Từ chối')) return false;
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return record.target.toLowerCase().includes(query) ||
        record.operatorName.toLowerCase().includes(query) ||
        record.details.toLowerCase().includes(query);
    }

    return true;
  });

  // Reset page when filters change
  useEffect(() => {
    setHistoryPage(1);
  }, [filterModerator, filterAction, searchQuery]);

  const startIdx = (historyPage - 1) * historyLimit;
  const paginatedHistory = filteredHistory.slice(startIdx, startIdx + historyLimit);
  const totalPages = Math.ceil(filteredHistory.length / historyLimit) || 1;

  return (
    <div id="kt_app_content_container" className="app-container container-xxl" style={{ padding: '1.75rem' }}>
      <div className="card">
        {/* Card header */}
        <div className="card-header border-0 pt-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: 'none' }}>

          <div className="card-title">
            <h3 className="card-label fw-bold fs-3 mb-1" style={{ color: '#181c32', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
              Lịch sử kiểm duyệt viên (Moderator Audit Trail)
            </h3>
          </div>

          {/* Filters and search toolbar */}
          <div className="card-toolbar">
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>

              {/* Filter Moderator */}
              <select
                className="form-select form-select-solid w-180px"
                value={filterModerator}
                onChange={(e) => setFilterModerator(e.target.value)}
                style={{ height: '40px', fontSize: '0.85rem', borderRadius: '6px', border: 'none', background: '#f5f8fa', padding: '0 1rem', color: '#5e6278' }}
              >
                <option value="all">Tất cả kiểm duyệt viên</option>
                <option value="admin">Quản trị viên (Admin)</option>
                <option value="hoang">Nguyễn Văn Hoàng</option>
                <option value="mai">Trần Thị Mai</option>
                <option value="khoa">Vũ Minh Khoa</option>
                <option value="tuan">Lê Anh Tuấn</option>
              </select>

              {/* Filter Action */}
              <select
                className="form-select form-select-solid w-150px"
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                style={{ height: '40px', fontSize: '0.85rem', borderRadius: '6px', border: 'none', background: '#f5f8fa', padding: '0 1rem', color: '#5e6278' }}
              >
                <option value="all">Tất cả hành động</option>
                <option value="approve">Đã duyệt chặn</option>
                <option value="reject">Đã từ chối</option>
              </select>

              {/* Search Box */}
              <div className="d-flex align-items-center position-relative my-1" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <Search className="position-absolute ms-5" size={18} style={{ position: 'absolute', marginLeft: '1.25rem', color: '#a1a5b7' }} />
                <input
                  type="text"
                  className="form-control form-control-solid w-250px ps-13"
                  placeholder="Tìm đối tượng, kiểm duyệt viên..."
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
                  <th style={{ width: '220px' }}>Kiểm duyệt viên</th>
                  <th style={{ width: '150px' }}>Hành động</th>
                  <th style={{ width: '250px' }}>Đối tượng tác động</th>
                  <th style={{ width: '120px' }}>Loại đối tượng</th>
                  <th style={{ width: '160px' }}>Thời gian thực hiện</th>
                  <th>Mô tả chi tiết</th>
                  <th className="text-end" style={{ width: '100px', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 fw-semibold">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center" style={{ padding: '3rem', textAlign: 'center', color: '#a1a5b7' }}>
                      Không tìm thấy lịch sử kiểm duyệt trùng khớp.
                    </td>
                  </tr>
                ) : (
                  paginatedHistory.map((record, index) => (
                    <tr key={record.id} className={index % 2 === 0 ? 'odd' : 'even'}>

                      {/* Operator Name */}
                      <td style={{ display: 'flex', alignItems: 'center', borderBottom: 'none' }}>
                        <div
                          className="symbol symbol-circle symbol-35px me-3"
                          style={{
                            width: '35px',
                            height: '35px',
                            borderRadius: '50%',
                            backgroundColor: record.operator === 'admin@shield.vn' ? '#009ef7' : '#7239ea',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            marginRight: '0.75rem'
                          }}
                        >
                          {record.operatorName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, color: '#181c32', fontSize: '0.88rem' }}>{record.operatorName}</span>
                          <span style={{ fontSize: '0.75rem', color: '#a1a5b7' }}>{record.operator}</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td>
                        <span className={`badge ${record.action.includes('Duyệt') ? 'badge-light-success' : 'badge-light-danger'}`} style={{ fontSize: '0.72rem', textTransform: 'uppercase', padding: '0.25rem 0.5rem' }}>
                          {record.action.includes('Duyệt') ? 'Đã Duyệt Chặn' : 'Từ Chối'}
                        </span>
                      </td>

                      {/* Target */}
                      <td>
                        <strong style={{ fontSize: '0.9rem', color: '#181c32', wordBreak: 'break-all' }}>{record.target}</strong>
                        {record.type === 'bank_account' && record.bankName && (
                          <span style={{ display: 'block', fontSize: '0.75rem', color: '#a1a5b7' }}>Ngân hàng: {record.bankName}</span>
                        )}
                      </td>

                      {/* Type */}
                      <td>
                        <span className="badge badge-light" style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}>
                          {record.type === 'url' ? 'Tên miền' : record.type === 'phone' ? 'Số điện thoại' : 'Số tài khoản'}
                        </span>
                      </td>

                      {/* Date */}
                      <td>
                        <span style={{ fontSize: '0.82rem', color: '#7e8299' }}>
                          {new Date(record.date).toLocaleString('vi-VN')}
                        </span>
                      </td>

                      {/* Details */}
                      <td>
                        <span style={{ fontSize: '0.82rem', color: '#5e6278', display: 'inline-block', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={record.details}>
                          {record.details}
                        </span>
                      </td>

                      {/* Action details */}
                      <td className="text-end" style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-light btn-active-light-primary btn-sm"
                          onClick={() => setSelectedRecord(record)}
                        >
                          Chi tiết
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
              Hiển thị {filteredHistory.length > 0 ? startIdx + 1 : 0} - {Math.min(startIdx + historyLimit, filteredHistory.length)} trong tổng số {filteredHistory.length} dòng
            </div>
            <div className="col-sm-12 col-md-7 d-flex align-items-center justify-content-center justify-content-md-end" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div className="dataTables_paginate paging_simple_numbers">
                <ul className="pagination" style={{ display: 'flex', listStyle: 'none', padding: 0, gap: '0.25rem', margin: 0 }}>
                  <li className={`paginate_button page-item previous ${historyPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      disabled={historyPage === 1}
                      onClick={() => setHistoryPage(prev => Math.max(prev - 1, 1))}
                    >
                      &lt;
                    </button>
                  </li>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const p = i + 1;
                    return (
                      <li key={p} className={`paginate_button page-item ${historyPage === p ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => setHistoryPage(p)}>
                          {p}
                        </button>
                      </li>
                    );
                  })}

                  <li className={`paginate_button page-item next ${historyPage >= totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      disabled={historyPage >= totalPages}
                      onClick={() => setHistoryPage(prev => Math.min(prev + 1, totalPages))}
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
      {/* HISTORY RECORD DETAILS MODAL */}
      {/* ======================================================== */}
      {selectedRecord && (
        <div className="signature-modal-overlay">
          <div className="signature-modal" style={{ maxWidth: '600px', width: '90%', textAlign: 'left' }}>

            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f3f9', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 className="signature-modal-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#181c32' }}>
                <Sparkles size={20} color="#7239ea" />
                Chi tiết xử lý kiểm duyệt
              </h3>
              <button type="button" onClick={() => setSelectedRecord(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#a1a5b7' }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span className="profile-field-label">Kiểm duyệt viên thực hiện</span>
                  <strong style={{ fontSize: '0.9rem', color: '#181c32', display: 'block' }}>{selectedRecord.operatorName}</strong>
                  <span style={{ fontSize: '0.78rem', color: '#a1a5b7' }}>{selectedRecord.operator}</span>
                </div>
                <div>
                  <span className="profile-field-label">Thời gian tác vụ</span>
                  <strong style={{ fontSize: '0.85rem', color: '#181c32', display: 'block' }}>
                    {new Date(selectedRecord.date).toLocaleString('vi-VN')}
                  </strong>
                </div>
              </div>

              <div style={{ background: '#f5f8fa', padding: '1rem', borderRadius: '8px', border: '1px solid #eff2f5' }}>
                <span style={{ fontSize: '0.72rem', color: '#a1a5b7', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>ĐỐI TƯỢNG XỬ LÝ</span>
                <strong style={{ fontSize: '1.1rem', color: '#181c32', display: 'block', wordBreak: 'break-all' }}>{selectedRecord.target}</strong>
                <div style={{ marginTop: '0.35rem', display: 'flex', gap: '0.35rem' }}>
                  <span className="badge badge-light" style={{ fontSize: '0.68rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {selectedRecord.type === 'url' ? 'Tên miền / URL' : selectedRecord.type === 'phone' ? 'Số điện thoại' : 'Tài khoản ngân hàng'}
                  </span>
                  <span className={`badge ${selectedRecord.action.includes('Duyệt') ? 'badge-light-success' : 'badge-light-danger'}`} style={{ fontSize: '0.68rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {selectedRecord.action}
                  </span>
                </div>
              </div>

              <div>
                <span className="profile-field-label">Nhận định / Lý do quyết định</span>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#5e6278', lineHeight: 1.5, background: '#f5f8fa', padding: '0.85rem', borderRadius: '6px' }}>
                  {selectedRecord.details}
                </p>
              </div>

              {selectedRecord.payload && (
                <div>
                  <span className="profile-field-label">Payload trích xuất gửi lên CSDL mới</span>
                  <pre style={{ margin: 0, padding: '0.85rem', background: '#1e1e2d', color: '#98c379', borderRadius: '6px', fontSize: '0.78rem', fontFamily: 'monospace', overflowX: 'auto' }}>
                    {JSON.stringify(selectedRecord.payload, null, 2)}
                  </pre>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="signature-actions" style={{ borderTop: '1px solid #f1f3f9', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedRecord(null)}
                style={{ marginLeft: 'auto' }}
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
