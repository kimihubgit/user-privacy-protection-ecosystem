import { useState, useEffect } from 'react';
import { Search, Globe, Plus, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../../lib/api';

function generateId(prefix) {
  return `${prefix}_${new Date().getTime()}_${Math.floor(Math.random() * 1000)}`;
}

export default function WhitelistTab({ token, whitelist: initialWhitelist, saveWhitelist, addAuditLog, addToast, currentUserEmail }) {
  const [whitelist, setLocalWhitelist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsLimit = 10;
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch allowlist from backend
  const fetchWhitelist = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminAllowlist(token, currentPage, itemsLimit);
      const allowlist = (res && res.data) ? res.data : [];
      const totalCount = res.total || allowlist.length;

      const mapped = allowlist.map(item => ({
        id: item._id || item.id,
        domain: item.url, // allowlist url is domain
        addedBy: 'Hệ thống',
        date: item.created_at || new Date().toISOString(),
        notes: item.description || 'Tên miền tin cậy xác thực.'
      }));

      setLocalWhitelist(mapped);
      setTotalItems(totalCount);
    } catch (e) {
      console.warn("Failed to fetch whitelist from API, using local/mock data fallback.", e);
      setLocalWhitelist(initialWhitelist);
      setTotalItems(initialWhitelist.length);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWhitelist();
  }, [token, currentPage]);

  // Add Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addDomain, setAddDomain] = useState('');
  const [addNotes, setAddNotes] = useState('');

  // Reset pagination on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Filtering Whitelist domains
  const filteredItems = whitelist.filter(item => {
    const domain = item.domain || '';
    const notes = item.notes || '';
    const addedBy = item.addedBy || '';

    return domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      addedBy.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Pagination Bounds (data is already paginated on server)
  const paginatedItems = filteredItems;
  const totalPages = Math.ceil(totalItems / itemsLimit) || 1;

  // Add Whitelist item
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addDomain.trim()) {
      if (addToast) addToast('Vui lòng nhập tên miền!', 'warning');
      return;
    }

    try {
      const payloadObj = {
        url: addDomain.trim().toLowerCase(),
        description: addNotes.trim() || 'Tên miền tin cậy xác thực.'
      };
      await api.addAdminAllowlist(token, payloadObj);

      addAuditLog('Thêm Whitelist', addDomain.trim().toLowerCase(), 'Thêm tên miền chính thống tin cậy.');
      if (addToast) addToast(`Đã thêm tên miền "${addDomain.trim().toLowerCase()}" vào danh sách trắng!`, 'success');
      fetchWhitelist();
    } catch (err) {
      console.error("Failed to add to allowlist database, using local fallback.", err);
      // Fallback
      const newItem = {
        id: generateId('wl'),
        domain: addDomain.trim().toLowerCase(),
        addedBy: currentUserEmail || 'Quản trị viên',
        date: new Date().toISOString(),
        notes: addNotes.trim() || 'Tên miền tin cậy xác thực.'
      };
      const updated = [newItem, ...whitelist];
      setLocalWhitelist(updated);
      saveWhitelist(updated);
      addAuditLog('Thêm Whitelist (Offline)', newItem.domain, 'Thêm tên miền chính thống tin cậy.');
      if (addToast) addToast(`Đã thêm tên miền "${newItem.domain}" vào danh sách trắng! (Offline)`, 'success');
    }

    // Reset fields
    setAddDomain('');
    setAddNotes('');
    setShowAddModal(false);
  };

  // Edit Modal state
  const [editingItem, setEditingItem] = useState(null);
  const [editDomain, setEditDomain] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditDomain(item.domain || '');
    setEditNotes(item.notes || '');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editDomain.trim()) {
      if (addToast) addToast('Vui lòng nhập tên miền!', 'warning');
      return;
    }

    try {
      const payloadObj = {
        url: editDomain.trim().toLowerCase(),
        description: editNotes.trim() || 'Tên miền tin cậy xác thực.'
      };
      await api.updateAdminAllowlist(token, editingItem.id, payloadObj);

      addAuditLog('Cập nhật Whitelist', editDomain.trim().toLowerCase(), 'Cập nhật thông tin tên miền an toàn (Cuckoo Filter updated).');
      if (addToast) addToast(`Đã cập nhật tên miền "${editDomain.trim().toLowerCase()}" thành công!`, 'success');
      fetchWhitelist();
    } catch (err) {
      console.error("Failed to update allowlist database, using local fallback.", err);
      const updated = whitelist.map(i => i.id === editingItem.id ? {
        ...i,
        domain: editDomain.trim().toLowerCase(),
        notes: editNotes.trim() || 'Tên miền tin cậy xác thực.'
      } : i);
      setLocalWhitelist(updated);
      saveWhitelist(updated);
      addAuditLog('Cập nhật Whitelist (Offline)', editDomain.trim().toLowerCase(), 'Cập nhật tên miền an toàn (Offline).');
      if (addToast) addToast(`Đã cập nhật tên miền "${editDomain.trim().toLowerCase()}" (Offline)!`, 'success');
    }

    setEditingItem(null);
  };

  // Delete Whitelist item
  const handleDeleteItem = async (item) => {
    if (window.confirm(`Bạn có chắc muốn gỡ bỏ tên miền "${item.domain}" khỏi Whitelist?`)) {
      try {
        await api.deleteAdminAllowlist(token, item.id);
        addAuditLog('Gỡ Whitelist', item.domain, 'Gỡ bỏ tên miền khỏi danh sách trắng.');
        if (addToast) addToast(`Đã gỡ bỏ tên miền "${item.domain}".`, 'success');
        fetchWhitelist();
      } catch (err) {
        console.error("Failed to delete from allowlist database, using local fallback.", err);
        const updated = whitelist.filter(i => i.id !== item.id);
        setLocalWhitelist(updated);
        saveWhitelist(updated);
        addAuditLog('Gỡ Whitelist (Offline)', item.domain, 'Gỡ bỏ tên miền khỏi danh sách trắng.');
        if (addToast) addToast(`Đã gỡ bỏ tên miền "${item.domain}" (Offline).`, 'success');
      }
    }
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
                placeholder="Tìm kiếm tên miền..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ height: '40px', fontSize: '0.9rem', borderRadius: '6px', paddingLeft: '3rem', border: 'none', background: '#f5f8fa', color: '#5e6278', outline: 'none' }}
              />
            </div>
          </div>

          {/* Card toolbar */}
          <div className="card-toolbar">
            <div className="d-flex justify-content-end">
              <button type="button" className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                Thêm Whitelist
              </button>
            </div>
          </div>
        </div>

        {/* Card body */}
        <div className="card-body py-4">
          <div className="table-responsive">
            <table className="table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer">
              <thead>
                <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0" style={{ borderBottom: '1px solid #eff2f5' }}>
                  <th style={{ width: '280px' }}>Tên Miền An Toàn</th>
                  <th style={{ width: '180px' }}>Người Phê Duyệt</th>
                  <th style={{ width: '150px' }}>Ngày Thêm</th>
                  <th>Ghi Chú Nguồn Gốc</th>
                  <th className="text-end" style={{ width: '120px', textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 fw-semibold">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center" style={{ padding: '3rem', textAlign: 'center', color: '#a1a5b7' }}>
                      Không tìm thấy tên miền an toàn nào.
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'odd' : 'even'}>

                      {/* Domain Cell */}
                      <td style={{ display: 'flex', alignItems: 'center', borderBottom: 'none' }}>
                        <div className="symbol symbol-circle symbol-50px overflow-hidden me-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0, marginRight: '0.75rem' }}>
                          <div className="symbol-label fs-3 bg-light-primary text-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', fontWeight: 700, fontSize: '0.9rem' }}>
                            W
                          </div>
                        </div>
                        <span className="text-gray-800 text-hover-primary mb-1" style={{ fontWeight: 700, color: '#009ef7', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                          {item.domain}
                        </span>
                      </td>

                      {/* Added By */}
                      <td>
                        <span style={{ fontSize: '0.85rem', color: '#5e6278', fontWeight: 600 }}>
                          {item.addedBy}
                        </span>
                      </td>

                      {/* Date */}
                      <td>
                        <span style={{ fontSize: '0.82rem', color: '#7e8299' }}>
                          {new Date(item.date).toLocaleDateString('vi-VN')}
                        </span>
                      </td>

                      {/* Notes */}
                      <td>
                        <span style={{ fontSize: '0.85rem', color: '#5e6278', display: 'inline-block', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.notes}>
                          {item.notes}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="text-end" style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            className="btn btn-light btn-active-light-primary btn-sm"
                            onClick={() => handleOpenEdit(item)}
                          >
                            Chỉnh sửa
                          </button>
                          <button
                            type="button"
                            className="btn btn-light btn-sm"
                            onClick={() => handleDeleteItem(item)}
                            style={{ color: '#f1416c' }}
                          >
                            Gỡ bỏ
                          </button>
                        </div>
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
              Hiển thị {totalItems > 0 ? ((currentPage - 1) * itemsLimit + 1) : 0} - {Math.min(currentPage * itemsLimit, totalItems)} trong tổng số {totalItems} tên miền
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

                  {(() => {
                    const pages = [];
                    const maxVisiblePages = 5;

                    if (totalPages <= maxVisiblePages) {
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      pages.push(1);
                      const start = Math.max(2, currentPage - 1);
                      const end = Math.min(totalPages - 1, currentPage + 1);

                      if (start > 2) {
                        pages.push('...');
                      }

                      for (let i = start; i <= end; i++) {
                        pages.push(i);
                      }

                      if (end < totalPages - 1) {
                        pages.push('...');
                      }

                      pages.push(totalPages);
                    }

                    return pages.map((p, idx) => {
                      if (p === '...') {
                        return (
                          <li key={`dots-${idx}`} className="paginate_button page-item disabled">
                            <span className="page-link" style={{ border: 'none', background: 'transparent', cursor: 'default' }}>...</span>
                          </li>
                        );
                      }
                      return (
                        <li key={p} className={`paginate_button page-item ${currentPage === p ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setCurrentPage(p)}>
                            {p}
                          </button>
                        </li>
                      );
                    });
                  })()}

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
      {/* ADD WHITELIST MODAL */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="signature-modal-overlay">
          <form className="signature-modal" style={{ maxWidth: '500px', textAlign: 'left' }} onSubmit={handleAddSubmit}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f3f9', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 className="signature-modal-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={20} color="#23b56c" />
                Thêm Tên Miền Whitelist
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#a1a5b7' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="profile-field-group">
                <label className="profile-field-label">Tên miền an toàn (Domain)</label>
                <input
                  type="text"
                  className="profile-field-input"
                  placeholder="vietcombank.com.vn hoặc shield.vn"
                  value={addDomain}
                  onChange={(e) => setAddDomain(e.target.value)}
                  required
                />
              </div>

              <div className="profile-field-group">
                <label className="profile-field-label">Ghi chú xác minh nguồn gốc</label>
                <textarea
                  className="report-textarea"
                  value={addNotes}
                  onChange={(e) => setAddNotes(e.target.value)}
                  placeholder="Ghi chú cụ thể chứng cứ hoặc nguồn an toàn..."
                  style={{ height: '90px' }}
                />
              </div>
            </div>

            <div className="signature-actions" style={{ borderTop: '1px solid #f1f3f9', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAddModal(false)}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ background: '#23b56c' }}
              >
                Tạo Whitelist
              </button>
            </div>
          </form>
        </div>
      )}
      {/* ======================================================== */}
      {/* EDIT WHITELIST MODAL */}
      {/* ======================================================== */}
      {editingItem && (
        <div className="signature-modal-overlay">
          <form className="signature-modal" style={{ maxWidth: '500px', textAlign: 'left' }} onSubmit={handleEditSubmit}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f3f9', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 className="signature-modal-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={20} color="#009ef7" />
                Sửa Tên Miền Whitelist
              </h3>
              <button type="button" onClick={() => setEditingItem(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#a1a5b7' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="profile-field-group">
                <label className="profile-field-label">Tên miền an toàn (Domain)</label>
                <input
                  type="text"
                  className="profile-field-input"
                  placeholder="vietcombank.com.vn hoặc shield.vn"
                  value={editDomain}
                  onChange={(e) => setEditDomain(e.target.value)}
                  required
                />
              </div>

              <div className="profile-field-group">
                <label className="profile-field-label">Ghi chú xác minh nguồn gốc</label>
                <textarea
                  className="report-textarea"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Ghi chú cụ thể chứng cứ hoặc nguồn an toàn..."
                  style={{ height: '90px' }}
                />
              </div>
            </div>

            <div className="signature-actions" style={{ borderTop: '1px solid #f1f3f9', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditingItem(null)}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
