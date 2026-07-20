import { useState, useEffect } from 'react';
import { Search, Clock, Trash2, Eye, X, ShieldAlert, ChevronLeft, ChevronRight, Activity } from 'lucide-react';

export default function AuditLogTab({ auditLogs, saveAuditLogs, addToast }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsLimit = 10;

  // Selected Log state for Detail Modal
  const [selectedLog, setSelectedLog] = useState(null);

  // Reset pagination on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Filtering logs
  const filteredLogs = auditLogs.filter(log => {
    const action = log.action || '';
    const target = log.target || '';
    const operator = log.operator || '';
    const details = log.details || '';

    return action.toLowerCase().includes(searchQuery.toLowerCase()) ||
           target.toLowerCase().includes(searchQuery.toLowerCase()) ||
           operator.toLowerCase().includes(searchQuery.toLowerCase()) ||
           details.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Pagination Bounds
  const startIdx = (currentPage - 1) * itemsLimit;
  const paginatedLogs = filteredLogs.slice(startIdx, startIdx + itemsLimit);
  const totalPages = Math.ceil(filteredLogs.length / itemsLimit) || 1;

  // Clear all logs
  const handleClearLogs = () => {
    if (window.confirm("CẢNH BÁO: Bạn có chắc chắn muốn xóa toàn bộ lịch sử nhật ký hoạt động hệ thống? Thao tác này không thể hoàn tác!")) {
      saveAuditLogs([]);
      if (addToast) addToast("Đã xóa sạch nhật ký hoạt động hệ thống.", "success");
    }
  };

  const getActionBadgeClass = (action) => {
    const lower = action.toLowerCase();
    if (lower.includes('thêm') || lower.includes('duyệt') || lower.includes('phê duyệt')) {
      return 'badge-light-success';
    }
    if (lower.includes('xóa') || lower.includes('gỡ') || lower.includes('khóa')) {
      return 'badge-light-danger';
    }
    if (lower.includes('sửa') || lower.includes('đổi') || lower.includes('cập nhật')) {
      return 'badge-light-warning';
    }
    return 'badge-light';
  };

  return (
    <div id="kt_app_content_container" className="app-container container-xxl" style={{ padding: '1.75rem' }}>
      <div className="card">
        {/* Card header */}
        <div className="card-header border-0 pt-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: 'none' }}>
          
          {/* Card title (Search) */}
          <div className="card-title">
            <div className="d-flex align-items-center position-relative my-1" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <Search className="position-absolute ms-5" size={18} style={{ position: 'absolute', marginLeft: '1.25rem', color: '#a1a5b7' }} />
              <input
                type="text"
                className="form-control form-control-solid w-250px ps-13"
                placeholder="Tìm kiếm nhật ký..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ height: '40px', fontSize: '0.9rem', borderRadius: '6px', paddingLeft: '3rem', border: 'none', background: '#f5f8fa', color: '#5e6278', outline: 'none' }}
              />
            </div>
          </div>

          {/* Card toolbar */}
          <div className="card-toolbar">
            <div className="d-flex justify-content-end">
              {auditLogs.length > 0 && (
                <button type="button" className="btn btn-light-danger" onClick={handleClearLogs} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', height: '40px', padding: '0 1rem', borderRadius: '6px' }}>
                  <Trash2 size={16} /> Xóa Lịch Sử
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Card body */}
        <div className="card-body py-4">
          <div className="table-responsive">
            <table className="table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer">
              <thead>
                <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0" style={{ borderBottom: '1px solid #eff2f5' }}>
                  <th style={{ width: '160px' }}>Thời Gian</th>
                  <th style={{ width: '150px' }}>Người Thực Hiện</th>
                  <th style={{ width: '180px' }}>Hành Động</th>
                  <th style={{ width: '220px' }}>Đối Tượng Tác Động</th>
                  <th>Chi Tiết Hoạt Động</th>
                  <th className="text-end" style={{ width: '100px', textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 fw-semibold">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center" style={{ padding: '3rem', textAlign: 'center', color: '#a1a5b7' }}>
                      Chưa có bản ghi hoạt động nào.
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log, index) => (
                    <tr key={log.id} className={index % 2 === 0 ? 'odd' : 'even'}>
                      
                      {/* Date */}
                      <td>
                        <span style={{ fontSize: '0.82rem', color: '#7e8299', fontFamily: 'monospace' }}>
                          {new Date(log.date).toLocaleString('vi-VN')}
                        </span>
                      </td>

                      {/* Operator */}
                      <td>
                        <span style={{ fontSize: '0.85rem', color: '#181c32', fontWeight: 600 }}>
                          {log.operator}
                        </span>
                      </td>

                      {/* Action */}
                      <td>
                        <span className={`badge ${getActionBadgeClass(log.action)}`} style={{ fontSize: '0.68rem', fontWeight: 'bold' }}>
                          {log.action}
                        </span>
                      </td>

                      {/* Target */}
                      <td>
                        <span className="text-hover-primary" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#5e6278', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                          {log.target}
                        </span>
                      </td>

                      {/* Details */}
                      <td>
                        <span style={{ fontSize: '0.85rem', color: '#5e6278', display: 'inline-block', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.details}>
                          {log.details}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="text-end" style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-light btn-sm"
                          onClick={() => setSelectedLog(log)}
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
              Hiển thị {filteredLogs.length > 0 ? startIdx + 1 : 0} - {Math.min(startIdx + itemsLimit, filteredLogs.length)} trong tổng số {filteredLogs.length} bản ghi
            </div>
            <div className="col-sm-12 col-md-7 d-flex align-items-center justify-content-center justify-content-md-end" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div className="dataTables_paginate paging_simple_numbers">
                <ul className="pagination" style={{ display: 'flex', listStyle: 'none', padding: 0, gap: '0.25rem', margin: 0 }}>
                  <li className={`paginate_button page-item previous ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    >
                      &lt;
                    </button>
                  </li>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const p = i + 1;
                    return (
                      <li key={p} className={`paginate_button page-item ${currentPage === p ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage(p)}>
                          {p}
                        </button>
                      </li>
                    );
                  })}

                  <li className={`paginate_button page-item next ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
      {/* DETAIL MODAL */}
      {/* ======================================================== */}
      {selectedLog && (
        <div className="signature-modal-overlay">
          <div className="signature-modal" style={{ maxWidth: '520px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f3f9', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 className="signature-modal-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} color="#009ef7" />
                Chi Tiết Bản Ghi Hệ Thống
              </h3>
              <button type="button" onClick={() => setSelectedLog(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#a1a5b7' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: '#f1f8ff', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(0, 158, 247, 0.15)' }}>
                <span style={{ fontSize: '0.72rem', color: '#009ef7', display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>HÀNH ĐỘNG HỆ THỐNG</span>
                <strong style={{ fontSize: '1.1rem', color: '#181c32' }}>{selectedLog.action}</strong>
              </div>

              <div>
                <span className="profile-field-label" style={{ display: 'block', marginBottom: '0.25rem' }}>NGƯỜI THỰC HIỆN OPERATOR</span>
                <strong style={{ fontSize: '0.9rem', color: '#181c32' }}>{selectedLog.operator}</strong>
              </div>

              <div>
                <span className="profile-field-label" style={{ display: 'block', marginBottom: '0.25rem' }}>ĐỐI TƯỢNG BỊ TÁC ĐỘNG (TARGET)</span>
                <span style={{ fontSize: '0.85rem', color: '#5e6278', fontFamily: 'monospace', display: 'block', padding: '0.65rem', background: '#f5f8fa', borderRadius: '6px', wordBreak: 'break-all' }}>
                  {selectedLog.target}
                </span>
              </div>

              <div>
                <span className="profile-field-label" style={{ display: 'block', marginBottom: '0.25rem' }}>NỘI DUNG CHI TIẾT (DETAILS)</span>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#5e6278', lineHeight: 1.5, background: '#f5f8fa', padding: '0.85rem', borderRadius: '6px', whiteSpace: 'pre-wrap' }}>
                  {selectedLog.details}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#a1a5b7', borderTop: '1px solid #eff2f5', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                <span>Log ID: {selectedLog.id}</span>
                <span>{new Date(selectedLog.date).toLocaleString('vi-VN')}</span>
              </div>
            </div>

            <div className="signature-actions" style={{ borderTop: '1px solid #f1f3f9', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedLog(null)}
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
