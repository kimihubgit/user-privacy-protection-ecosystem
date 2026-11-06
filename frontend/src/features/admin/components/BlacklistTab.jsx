import { useState, useEffect } from 'react';
import { Search, Globe, CreditCard, Phone, Trash2, Eye, Plus, ShieldAlert, X, ShieldX, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../../lib/api';

function generateId(prefix) {
  return `${prefix}_${new Date().getTime()}_${Math.floor(Math.random() * 1000)}`;
}

export default function BlacklistTab({ token, blacklist: initialBlacklist, saveBlacklist, addAuditLog, addToast }) {
  const [blacklist, setLocalBlacklist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsLimit = 10;
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch from backend
  const fetchBlacklist = async () => {
    setIsLoading(true);
    try {
      let merged = [];
      let totalCount = 0;

      if (filterType === 'url') {
        const urlsRes = await api.getAdminScamURLs(token, currentPage, itemsLimit);
        const scamUrls = (urlsRes && urlsRes.data) ? urlsRes.data : [];
        totalCount = urlsRes.total || scamUrls.length;

        merged = scamUrls.map(item => ({
          id: item._id || item.id,
          target: item.url,
          type: 'url',
          category: item.category || 'phishing',
          severity: 'danger',
          description: item.description || 'N/A',
          date: item.created_at || item.date || new Date().toISOString()
        }));
      } else if (filterType === 'phone' || filterType === 'bank_account') {
        const scammersRes = await api.getAdminScammers(token, currentPage, itemsLimit, filterType);
        const scammers = (scammersRes && scammersRes.data) ? scammersRes.data : [];
        totalCount = scammersRes.total || scammers.length;

        merged = scammers.map(item => ({
          id: item._id || item.id,
          target: item.target,
          type: item.type || 'phone',
          bankName: item.bank_name || '',
          category: 'scam',
          severity: 'danger',
          description: item.description || 'N/A',
          date: item.created_at || item.date || new Date().toISOString()
        }));
      } else {
        // 'all' - load both urls and scammers. Since we merge them, divide limit by 2.
        const halfLimit = Math.ceil(itemsLimit / 2);
        const urlsRes = await api.getAdminScamURLs(token, currentPage, halfLimit);
        const scammersRes = await api.getAdminScammers(token, currentPage, halfLimit);

        const scamUrls = (urlsRes && urlsRes.data) ? urlsRes.data : [];
        const scammers = (scammersRes && scammersRes.data) ? scammersRes.data : [];

        const totalUrls = urlsRes.total || scamUrls.length;
        const totalScammers = scammersRes.total || scammers.length;
        totalCount = totalUrls + totalScammers;

        const mappedUrls = scamUrls.map(item => ({
          id: item._id || item.id,
          target: item.url,
          type: 'url',
          category: item.category || 'phishing',
          severity: 'danger',
          description: item.description || 'N/A',
          date: item.created_at || item.date || new Date().toISOString()
        }));

        const mappedScammers = scammers.map(item => ({
          id: item._id || item.id,
          target: item.target,
          type: item.type || 'phone',
          bankName: item.bank_name || '',
          category: 'scam',
          severity: 'danger',
          description: item.description || 'N/A',
          date: item.created_at || item.date || new Date().toISOString()
        }));

        merged = [...mappedUrls, ...mappedScammers];
      }

      setLocalBlacklist(merged);
      setTotalItems(totalCount);
    } catch (e) {
      console.warn("Failed to fetch blacklist from API, using fallback local/mock data.", e);
      setLocalBlacklist(initialBlacklist);
      setTotalItems(initialBlacklist.length);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlacklist();
  }, [token, currentPage, filterType]);

  // Add Blacklist Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState('url');
  const [addTarget, setAddTarget] = useState('');
  const [addCategory, setAddCategory] = useState('phishing');
  const [addSeverity, setAddSeverity] = useState('danger');
  const [addDescription, setAddDescription] = useState('');
  const [addBankName, setAddBankName] = useState('');

  // Detail Modal State
  const [selectedItem, setSelectedItem] = useState(null);

  // Reset pagination on filter type change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterCategory, filterSeverity]);

  // Filtering Logic
  const filteredItems = blacklist.filter(item => {
    const target = item.target || '';
    const desc = item.description || '';
    const bank = item.bankName || '';

    const matchesSearch = 
      target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bank.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesSeverity = filterSeverity === 'all' || item.severity === filterSeverity;

    return matchesSearch && matchesCategory && matchesSeverity;
  });

  // Pagination Bounds (data is already paginated on server)
  const paginatedItems = filteredItems;
  const totalPages = Math.ceil(totalItems / itemsLimit) || 1;

  // Handle Add Item Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addTarget.trim()) {
      if (addToast) addToast('Vui lòng nhập đối tượng chặn!', 'warning');
      return;
    }

    try {
      if (addType === 'url') {
        const payloadObj = {
          url: addTarget.trim(),
          category: addCategory,
          description: addDescription.trim() || 'Thêm thủ công bởi Quản trị viên.'
        };
        await api.addAdminScamURL(token, payloadObj);
      } else {
        const payloadObj = {
          target: addTarget.trim(),
          type: addType,
          name: 'QUẢN TRỊ VIÊN',
          bank_name: addType === 'bank_account' ? addBankName.trim() : undefined,
          description: addDescription.trim() || 'Thêm thủ công bởi Quản trị viên.'
        };
        await api.addAdminScammer(token, payloadObj);
      }

      addAuditLog('Thêm Blacklist', addTarget.trim(), `Thêm thủ công vào danh sách đen. Thể loại: ${addCategory}`);
      if (addToast) addToast(`Đã thêm "${addTarget.trim()}" vào danh sách đen thành công!`, 'success');
      fetchBlacklist();
    } catch (err) {
      console.error("Failed to add to blacklist database, using local fallback.", err);
      // Fallback
      const newItem = {
        id: generateId('bl'),
        target: addTarget.trim(),
        type: addType,
        category: addCategory,
        severity: addSeverity,
        description: addDescription.trim() || 'Thêm thủ công bởi Quản trị viên.',
        bankName: addType === 'bank_account' ? addBankName.trim() : undefined,
        date: new Date().toISOString()
      };
      const updated = [newItem, ...blacklist];
      setLocalBlacklist(updated);
      saveBlacklist(updated);
      addAuditLog('Thêm Blacklist (Offline)', newItem.target, `Thêm thủ công vào danh sách đen.`);
      if (addToast) addToast(`Đã thêm "${newItem.target}" vào danh sách đen thành công (Offline)!`, 'success');
    }

    // Reset Form
    setAddTarget('');
    setAddDescription('');
    setAddBankName('');
    setAddType('url');
    setAddCategory('phishing');
    setAddSeverity('danger');
    setShowAddModal(false);
  };

  // Edit Blacklist Modal States
  const [editingItem, setEditingItem] = useState(null);
  const [editType, setEditType] = useState('url');
  const [editTarget, setEditTarget] = useState('');
  const [editCategory, setEditCategory] = useState('phishing');
  const [editSeverity, setEditSeverity] = useState('danger');
  const [editDescription, setEditDescription] = useState('');
  const [editBankName, setEditBankName] = useState('');

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditType(item.type || 'url');
    setEditTarget(item.target || '');
    setEditCategory(item.category || 'phishing');
    setEditSeverity(item.severity || 'danger');
    setEditDescription(item.description || '');
    setEditBankName(item.bankName || '');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTarget.trim()) {
      if (addToast) addToast('Vui lòng nhập đối tượng chặn!', 'warning');
      return;
    }

    try {
      if (editType === 'url') {
        const payloadObj = {
          url: editTarget.trim(),
          category: editCategory,
          description: editDescription.trim(),
          severity: editSeverity
        };
        await api.updateAdminScamURL(token, editingItem.id, payloadObj);
      } else {
        const payloadObj = {
          target: editTarget.trim(),
          type: editType,
          category: editCategory,
          bank_name: editType === 'bank_account' ? editBankName.trim() : undefined,
          description: editDescription.trim()
        };
        await api.updateAdminScammer(token, editingItem.id, payloadObj);
      }

      addAuditLog('Cập nhật Blacklist', editTarget.trim(), `Sửa thông tin đối tượng chặn. Thể loại: ${editCategory}`);
      if (addToast) addToast(`Đã cập nhật "${editTarget.trim()}" thành công!`, 'success');
      fetchBlacklist();
    } catch (err) {
      console.error("Failed to update blacklist database, using local fallback.", err);
      const updated = blacklist.map(i => i.id === editingItem.id ? {
        ...i,
        target: editTarget.trim(),
        type: editType,
        category: editCategory,
        severity: editSeverity,
        description: editDescription.trim(),
        bankName: editType === 'bank_account' ? editBankName.trim() : undefined
      } : i);
      setLocalBlacklist(updated);
      saveBlacklist(updated);
      addAuditLog('Cập nhật Blacklist (Offline)', editTarget.trim(), `Sửa thông tin đối tượng chặn (Offline).`);
      if (addToast) addToast(`Đã cập nhật "${editTarget.trim()}" thành công (Offline)!`, 'success');
    }

    setEditingItem(null);
  };

  // Open Detail (fetches fresh detail if scammer)
  const handleOpenDetail = async (item) => {
    if (item.type !== 'url') {
      try {
        const res = await api.getAdminScammerDetail(token, item.id);
        if (res && res.data) {
          const detail = res.data;
          setSelectedItem({
            id: detail._id || detail.id || item.id,
            target: detail.target || item.target,
            type: detail.type || item.type,
            category: detail.category || item.category,
            severity: item.severity,
            description: detail.description || item.description,
            bankName: detail.bank_name || item.bankName,
            date: detail.created_at || item.date
          });
          return;
        }
      } catch (err) {
        console.warn("Failed to fetch scammer detail from backend API, using row item.", err);
      }
    }
    setSelectedItem(item);
  };

  // Handle Delete Item
  const handleDeleteItem = async (item) => {
    if (window.confirm(`Bạn có chắc muốn gỡ bỏ "${item.target}" khỏi danh sách đen?`)) {
      try {
        if (item.type === 'url') {
          await api.deleteAdminScamURL(token, item.id);
        } else {
          await api.deleteAdminScammer(token, item.id);
        }
        addAuditLog('Gỡ Blacklist', item.target, 'Gỡ bỏ đối tượng khỏi hệ thống.');
        if (addToast) addToast(`Đã gỡ bỏ "${item.target}" thành công.`, 'success');
        fetchBlacklist();
      } catch (err) {
        console.error("Failed to delete from blacklist database, using local fallback.", err);
        const updated = blacklist.filter(i => i.id !== item.id);
        setLocalBlacklist(updated);
        saveBlacklist(updated);
        addAuditLog('Gỡ Blacklist (Offline)', item.target, 'Gỡ bỏ đối tượng khỏi hệ thống.');
        if (addToast) addToast(`Đã gỡ bỏ "${item.target}" thành công (Offline).`, 'success');
      }
      if (selectedItem && selectedItem.id === item.id) setSelectedItem(null);
    }
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'phishing': return 'Giả mạo (Phishing)';
      case 'malware': return 'Mã độc (Malware)';
      case 'financial': return 'Tài chính / Đa cấp';
      case 'scam': return 'Lừa đảo (Scam)';
      case 'romance': return 'Tình cảm / Mạng XH';
      default: return cat || 'Khác';
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
                placeholder="Tìm kiếm đối tượng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ height: '40px', fontSize: '0.9rem', borderRadius: '6px', paddingLeft: '3rem', border: 'none', background: '#f5f8fa', color: '#5e6278', outline: 'none' }}
              />
            </div>
          </div>

          {/* Card toolbar (Filters & Add button) */}
          <div className="card-toolbar">
            <div className="d-flex justify-content-end" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              
              {/* Type filter */}
              <select
                className="form-select form-select-solid w-130px"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{ height: '40px', fontSize: '0.85rem', borderRadius: '6px', border: 'none', background: '#f5f8fa', padding: '0 1rem', cursor: 'pointer', color: '#5e6278' }}
              >
                <option value="all">Tất cả loại</option>
                <option value="url">Tên miền (URL)</option>
                <option value="phone">Số điện thoại</option>
                <option value="bank_account">Số tài khoản</option>
              </select>

              {/* Category filter */}
              <select
                className="form-select form-select-solid w-150px"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{ height: '40px', fontSize: '0.85rem', borderRadius: '6px', border: 'none', background: '#f5f8fa', padding: '0 1rem', cursor: 'pointer', color: '#5e6278' }}
              >
                <option value="all">Tất cả hình thức</option>
                <option value="phishing">Giả mạo (Phishing)</option>
                <option value="malware">Mã độc (Malware)</option>
                <option value="financial">Tài chính / Đa cấp</option>
                <option value="scam">Lừa đảo (Scam)</option>
                <option value="romance">Tình cảm / Mạng XH</option>
              </select>

              {/* Add Blacklist button */}
              <button type="button" className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                Thêm Blacklist
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
                  <th style={{ width: '300px' }}>Đối Tượng Chặn</th>
                  <th style={{ width: '130px' }}>Phân Loại</th>
                  <th style={{ width: '180px' }}>Hình Thức Vi Phạm</th>
                  <th style={{ width: '130px' }}>Mức Độ</th>
                  <th style={{ width: '150px' }}>Ngày Cập Nhật</th>
                  <th className="text-end" style={{ width: '160px', textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 fw-semibold">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center" style={{ padding: '3rem', textAlign: 'center', color: '#a1a5b7' }}>
                      Không tìm thấy đối tượng nào trùng khớp.
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'odd' : 'even'}>
                      
                      {/* Target Info */}
                      <td style={{ display: 'flex', alignItems: 'center', borderBottom: 'none' }}>
                        <div className="symbol symbol-circle symbol-50px overflow-hidden me-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0, marginRight: '0.75rem' }}>
                          <div className={`symbol-label fs-3 ${item.type === 'url' ? 'bg-light-primary text-primary' : item.type === 'phone' ? 'bg-light-warning text-warning' : 'bg-light-danger text-danger'}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', fontWeight: 700, fontSize: '0.9rem' }}>
                            {item.type === 'url' ? 'W' : item.type === 'phone' ? 'P' : 'B'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className="text-gray-800 text-hover-primary mb-1" style={{ fontWeight: 700, color: '#181c32', fontSize: '0.9rem' }}>
                            {item.target}
                          </span>
                          {item.type === 'bank_account' && item.bankName && (
                            <span style={{ fontSize: '0.78rem', color: '#a1a5b7' }}>Ngân hàng: {item.bankName}</span>
                          )}
                        </div>
                      </td>

                      {/* Type */}
                      <td>
                        <span className="badge badge-light" style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                          {item.type === 'url' ? 'Tên miền' : item.type === 'phone' ? 'SĐT' : 'Tài khoản'}
                        </span>
                      </td>

                      {/* Category */}
                      <td>
                        <span style={{ fontSize: '0.85rem', color: '#5e6278', fontWeight: 500 }}>
                          {getCategoryLabel(item.category)}
                        </span>
                      </td>

                      {/* Severity */}
                      <td>
                        <span className={`status-badge ${item.severity === 'danger' ? 'rejected' : 'pending'}`} style={{ textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 700 }}>
                          {item.severity === 'danger' ? 'Nguy hiểm' : 'Cảnh báo'}
                        </span>
                      </td>

                      {/* Date */}
                      <td>
                        <span style={{ fontSize: '0.82rem', color: '#7e8299' }}>
                          {new Date(item.date).toLocaleDateString('vi-VN')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="text-end" style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            className="btn btn-light btn-active-light-primary btn-sm"
                            onClick={() => handleOpenDetail(item)}
                          >
                            Chi tiết
                          </button>
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
              Hiển thị {totalItems > 0 ? ((currentPage - 1) * itemsLimit + 1) : 0} - {Math.min(currentPage * itemsLimit, totalItems)} trong tổng số {totalItems} đối tượng
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
      {/* ADD BLACKLIST MODAL */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="signature-modal-overlay">
          <form className="signature-modal" style={{ maxWidth: '500px', textAlign: 'left' }} onSubmit={handleAddSubmit}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f3f9', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 className="signature-modal-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={20} color="var(--primary)" />
                Thêm Blacklist Thủ Công
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#a1a5b7' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="profile-field-group">
                <label className="profile-field-label">Loại đối tượng</label>
                <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                  {['url', 'bank_account', 'phone'].map(t => (
                    <button
                      key={t}
                      type="button"
                      className="profile-avatar-btn"
                      onClick={() => setAddType(t)}
                      style={{
                        flex: 1,
                        background: addType === t ? '#f1f8ff' : 'transparent',
                        color: addType === t ? '#009ef7' : '#5e6278',
                        borderColor: addType === t ? '#009ef7' : '#eff2f5',
                        height: '38px',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    >
                      {t === 'url' ? 'Tên miền' : t === 'bank_account' ? 'Số tài khoản' : 'Số điện thoại'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="profile-field-group">
                <label className="profile-field-label">
                  {addType === 'url' ? 'Địa chỉ tên miền / URL' : addType === 'bank_account' ? 'Số tài khoản ngân hàng' : 'Số điện thoại'}
                </label>
                <input
                  type="text"
                  className="profile-field-input"
                  placeholder={addType === 'url' ? 'vietcombank-login.xyz' : addType === 'bank_account' ? '97042293849102' : '0912345678'}
                  value={addTarget}
                  onChange={(e) => setAddTarget(e.target.value)}
                  required
                />
              </div>

              {addType === 'bank_account' && (
                <div className="profile-field-group">
                  <label className="profile-field-label">Tên Ngân Hàng</label>
                  <input
                    type="text"
                    className="profile-field-input"
                    placeholder="MB Bank, Techcombank, Vietinbank..."
                    value={addBankName}
                    onChange={(e) => setAddBankName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="profile-field-group">
                  <label className="profile-field-label">Thể loại vi phạm</label>
                  <select
                    className="profile-field-input"
                    value={addCategory}
                    onChange={(e) => setAddCategory(e.target.value)}
                    style={{ background: '#f5f8fa', cursor: 'pointer' }}
                  >
                    <option value="phishing">Giả mạo (Phishing)</option>
                    <option value="malware">Mã độc (Malware)</option>
                    <option value="financial">Tài chính / Đa cấp</option>
                    <option value="scam">Lừa đảo (Scam)</option>
                    <option value="romance">Tình cảm / Mạng XH</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div className="profile-field-group">
                  <label className="profile-field-label">Mức độ cảnh báo</label>
                  <select
                    className="profile-field-input"
                    value={addSeverity}
                    onChange={(e) => setAddSeverity(e.target.value)}
                    style={{ background: '#f5f8fa', cursor: 'pointer' }}
                  >
                    <option value="danger">Nguy hiểm (Critical)</option>
                    <option value="warning">Cảnh báo (Heuristic)</option>
                  </select>
                </div>
              </div>

              <div className="profile-field-group">
                <label className="profile-field-label">Mô tả hành vi chi tiết</label>
                <textarea
                  className="report-textarea"
                  value={addDescription}
                  onChange={(e) => setAddDescription(e.target.value)}
                  placeholder="Ghi chú chứng cứ hoặc hành vi vi phạm..."
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
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Tạo Blacklist
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* DETAIL MODAL */}
      {/* ======================================================== */}
      {selectedItem && (
        <div className="signature-modal-overlay">
          <div className="signature-modal" style={{ maxWidth: '500px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f3f9', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 className="signature-modal-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={20} color="var(--danger)" />
                Chi Tiết Đối Tượng Blacklist
              </h3>
              <button type="button" onClick={() => setSelectedItem(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#a1a5b7' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: '#fff5f8', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(241, 65, 108, 0.15)' }}>
                <span style={{ fontSize: '0.72rem', color: '#f1416c', display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>ĐỐI TƯỢNG BỊ CHẶN</span>
                <strong style={{ fontSize: '1.2rem', color: '#f1416c', wordBreak: 'break-all' }}>{selectedItem.target}</strong>
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                  <span className="badge badge-light" style={{ fontSize: '0.68rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {selectedItem.type === 'url' ? 'Tên miền' : selectedItem.type === 'phone' ? 'Số điện thoại' : 'Số tài khoản'}
                  </span>
                  <span className="badge badge-light-success" style={{ fontSize: '0.68rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {getCategoryLabel(selectedItem.category)}
                  </span>
                </div>
              </div>

              {selectedItem.type === 'bank_account' && selectedItem.bankName && (
                <div>
                  <span className="profile-field-label" style={{ display: 'block', marginBottom: '0.25rem' }}>NGÂN HÀNG</span>
                  <strong style={{ fontSize: '0.92rem', color: '#181c32' }}>{selectedItem.bankName}</strong>
                </div>
              )}

              <div>
                <span className="profile-field-label" style={{ display: 'block', marginBottom: '0.25rem' }}>MỨC ĐỘ NGUY HẠI</span>
                <span className={`status-badge ${selectedItem.severity === 'danger' ? 'rejected' : 'pending'}`} style={{ textTransform: 'uppercase', fontSize: '0.68rem', fontWeight: 700 }}>
                  {selectedItem.severity === 'danger' ? 'Nguy hiểm cao' : 'Cảnh báo'}
                </span>
              </div>

              <div>
                <span className="profile-field-label" style={{ display: 'block', marginBottom: '0.25rem' }}>MÔ TẢ HÀNH VI CHI TIẾT</span>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#5e6278', lineHeight: 1.5, background: '#f5f8fa', padding: '0.85rem', borderRadius: '6px', whiteSpace: 'pre-wrap' }}>
                  {selectedItem.description}
                </p>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#a1a5b7', textAlign: 'right' }}>
                Thời gian tạo: {new Date(selectedItem.date).toLocaleString('vi-VN')}
              </div>
            </div>

            <div className="signature-actions" style={{ borderTop: '1px solid #f1f3f9', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedItem(null)}
              >
                Đóng lại
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const toDelete = selectedItem;
                  setSelectedItem(null);
                  handleDeleteItem(toDelete);
                }}
                style={{ background: '#f1416c' }}
              >
                Gỡ khỏi Blacklist
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ======================================================== */}
      {/* EDIT BLACKLIST MODAL */}
      {/* ======================================================== */}
      {editingItem && (
        <div className="signature-modal-overlay">
          <form className="signature-modal" style={{ maxWidth: '500px', textAlign: 'left' }} onSubmit={handleEditSubmit}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f3f9', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 className="signature-modal-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={20} color="var(--primary)" />
                Sửa Thông Tin Blacklist
              </h3>
              <button type="button" onClick={() => setEditingItem(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#a1a5b7' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="profile-field-group">
                <label className="profile-field-label">Loại đối tượng</label>
                <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                  {['url', 'bank_account', 'phone'].map(t => (
                    <button
                      key={t}
                      type="button"
                      className="profile-avatar-btn"
                      onClick={() => setEditType(t)}
                      style={{
                        flex: 1,
                        background: editType === t ? '#f1f8ff' : 'transparent',
                        color: editType === t ? '#009ef7' : '#5e6278',
                        borderColor: editType === t ? '#009ef7' : '#eff2f5',
                        height: '38px',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    >
                      {t === 'url' ? 'Tên miền' : t === 'bank_account' ? 'Số tài khoản' : 'Số điện thoại'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="profile-field-group">
                <label className="profile-field-label">
                  {editType === 'url' ? 'Địa chỉ tên miền / URL' : editType === 'bank_account' ? 'Số tài khoản ngân hàng' : 'Số điện thoại'}
                </label>
                <input
                  type="text"
                  className="profile-field-input"
                  placeholder={editType === 'url' ? 'vietcombank-login.xyz' : editType === 'bank_account' ? '97042293849102' : '0912345678'}
                  value={editTarget}
                  onChange={(e) => setEditTarget(e.target.value)}
                  required
                />
              </div>

              {editType === 'bank_account' && (
                <div className="profile-field-group">
                  <label className="profile-field-label">Tên Ngân Hàng</label>
                  <input
                    type="text"
                    className="profile-field-input"
                    placeholder="MB Bank, Techcombank, Vietinbank..."
                    value={editBankName}
                    onChange={(e) => setEditBankName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="profile-field-group">
                  <label className="profile-field-label">Thể loại vi phạm</label>
                  <select
                    className="profile-field-input"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    style={{ background: '#f5f8fa', cursor: 'pointer' }}
                  >
                    <option value="phishing">Giả mạo (Phishing)</option>
                    <option value="malware">Mã độc (Malware)</option>
                    <option value="financial">Tài chính / Đa cấp</option>
                    <option value="scam">Lừa đảo (Scam)</option>
                    <option value="romance">Tình cảm / Mạng XH</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div className="profile-field-group">
                  <label className="profile-field-label">Mức độ cảnh báo</label>
                  <select
                    className="profile-field-input"
                    value={editSeverity}
                    onChange={(e) => setEditSeverity(e.target.value)}
                    style={{ background: '#f5f8fa', cursor: 'pointer' }}
                  >
                    <option value="danger">Nguy hiểm (Critical)</option>
                    <option value="warning">Cảnh báo (Heuristic)</option>
                  </select>
                </div>
              </div>

              <div className="profile-field-group">
                <label className="profile-field-label">Mô tả hành vi chi tiết</label>
                <textarea
                  className="report-textarea"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Ghi chú chứng cứ hoặc hành vi vi phạm..."
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
                Hủy bỏ
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
