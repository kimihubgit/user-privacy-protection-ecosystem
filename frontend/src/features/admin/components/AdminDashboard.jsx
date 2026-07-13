import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Shield, AlignLeft, LogOut, Grid, Clock, ShieldAlert,
  ShieldCheck, Users, Activity, Plus, Search, Trash2
} from 'lucide-react';
import './AdminDashboard.css';
import { api } from '../../../lib/api';
import AdminOverviewTab from './AdminOverviewTab';
import ReportsTab from './ReportsTab';
import UsersTab from './UsersTab';

function generateId(prefix) {
  return `${prefix}_${new Date().getTime()}_${Math.floor(Math.random() * 1000)}`;
}

export default function AdminDashboard({ addToast, onLogout }) {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'reports' | 'blacklist' | 'whitelist' | 'users' | 'audit' | 'settings'
  const [searchQuery, setSearchQuery] = useState('');
  const [reportsStats, setReportsStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  // Auth check
  const token = localStorage.getItem('token');
  const userEmail = localStorage.getItem('userEmail');
  const isAdmin = token && (token.startsWith('mock-admin-') || userEmail === 'admin@chongluadao.vn');

  // --- STATE INITIALIZATION & SYNC ---

  // Pending Reports State
  const [pendingReports, setPendingReports] = useState(() => {
    const saved = localStorage.getItem('admin_pending_reports');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    const defaults = [
      { id: 'ap1', target: 'vietcombank-reward-cld.xyz', type: 'url', reporter: 'Nguyễn Văn Nam', email: 'nam.nv@gmail.com', date: '2026-07-06T15:30:00Z', description: 'Trang web mạo danh ngân hàng Vietcombank gửi tin nhắn quà tặng tri ân hòng đánh cắp mật khẩu e-banking.' },
      { id: 'ap2', target: '0398765432', type: 'phone', reporter: 'Trần Thị Mai', email: 'maitt99@yahoo.com', date: '2026-07-06T18:45:00Z', description: 'Số điện thoại xưng danh là công an Hà Nội đe dọa liên quan vụ án ma túy yêu cầu chuyển tiền xác minh.' },
      { id: 'ap3', target: '97042293849102', type: 'bank_account', bankName: 'MB Bank', reporter: 'Phan Minh', email: 'minhphan_cld@gmail.com', date: '2026-07-07T02:15:00Z', description: 'Tài khoản nhận tiền cọc bán điện thoại iPhone cũ giá siêu rẻ trên Marketplace, nhận tiền xong lập tức chặn chat.' },
      { id: 'ap4', target: 'shopee-uu-dai-cld.xyz', type: 'url', reporter: 'Lê Văn Hải', email: 'hailevan@gmail.com', date: '2026-07-07T08:30:00Z', description: 'Quảng cáo Shopee tặng quà miễn phí, bắt nhập số điện thoại và mã OTP để nhận.' }
    ];
    localStorage.setItem('admin_pending_reports', JSON.stringify(defaults));
    return defaults;
  });

  // Blacklist state
  const [blacklist, setBlacklist] = useState(() => {
    const saved = localStorage.getItem('admin_blacklist');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    const defaults = [
      { id: 'bl1', target: 'vietcombank-otp-verify.com', type: 'url', category: 'phishing', severity: 'danger', description: 'Trang web giả mạo ngân hàng Vietcombank để đánh cắp mã OTP.', date: '2026-06-19T10:00:00Z' },
      { id: 'bl2', target: 'momo-nhan-loc-he.xyz', type: 'url', category: 'scam', severity: 'danger', description: 'Lừa đảo nhận lộc hè MoMo, dụ dỗ người dùng chuyển tiền.', date: '2026-06-19T09:30:00Z' },
      { id: 'bl3', target: 'shopee-khuyenmai-hot.top', type: 'url', category: 'scam', severity: 'warning', description: 'Trang web mạo danh Shopee trúng thưởng tri ân khách hàng.', date: '2026-06-18T15:45:00Z' },
      { id: 'bl4', target: '19035678912345', type: 'bank_account', bankName: 'Techcombank', category: 'financial', severity: 'danger', description: 'Lừa cọc mua xe máy giá rẻ trên Facebook.', date: '2026-06-19T10:00:00Z' },
      { id: 'bl5', target: '0987654321', type: 'phone', category: 'romance', severity: 'warning', description: 'Số điện thoại mạo danh VTV báo trúng quà tri ân đóng phí ship.', date: '2026-06-18T08:20:00Z' }
    ];
    localStorage.setItem('admin_blacklist', JSON.stringify(defaults));
    return defaults;
  });

  // Whitelist state
  const [whitelist, setWhitelist] = useState(() => {
    const saved = localStorage.getItem('admin_whitelist');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    const defaults = [
      { id: 'wl1', domain: 'chongluadao.vn', addedBy: 'Hệ thống', date: '2026-06-01T00:00:00Z', notes: 'Trang web chính thức dự án.' },
      { id: 'wl2', domain: 'vietcombank.com.vn', addedBy: 'Hệ thống', date: '2026-06-01T00:00:00Z', notes: 'Trang web chính thức ngân hàng Vietcombank.' },
      { id: 'wl3', domain: 'shopee.vn', addedBy: 'Hệ thống', date: '2026-06-01T00:00:00Z', notes: 'Trang thương mại điện tử Shopee chính thức.' },
      { id: 'wl4', domain: 'momo.vn', addedBy: 'Hệ thống', date: '2026-06-01T00:00:00Z', notes: 'Ví điện tử MoMo chính thức.' }
    ];
    localStorage.setItem('admin_whitelist', JSON.stringify(defaults));
    return defaults;
  });

  // Registered Users State
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('admin_users');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    const defaults = [
      { id: 'usr1', name: 'Nguyễn Văn Nam', email: 'nam.nv@gmail.com', role: 'user', status: 'active', joined: '2026-05-12' },
      { id: 'usr2', name: 'Trần Thị Mai', email: 'maitt99@yahoo.com', role: 'user', status: 'active', joined: '2026-06-01' },
      { id: 'usr3', name: 'Admin CLD', email: 'admin@chongluadao.vn', role: 'admin', status: 'active', joined: '2026-01-01' },
      { id: 'usr4', name: 'Lê Văn Hải', email: 'hailevan@gmail.com', role: 'user', status: 'banned', joined: '2026-06-15' },
      { id: 'usr5', name: 'Phạm Văn Đạt', email: 'datpham@gmail.com', role: 'moderator', status: 'active', joined: '2026-07-02' }
    ];
    localStorage.setItem('admin_users', JSON.stringify(defaults));
    return defaults;
  });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('admin_audit_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    const defaults = [
      { id: 'log1', action: 'Phê duyệt Blacklist', target: 'vietcombank-reward-cld.xyz', operator: 'admin@chongluadao.vn', date: '2026-07-08T15:20:00Z', details: 'Duyệt URL lừa đảo trúng thưởng của Vietcombank.' },
      { id: 'log2', action: 'Thêm Whitelist', target: 'bidv.com.vn', operator: 'admin@chongluadao.vn', date: '2026-07-08T10:45:00Z', details: 'Thêm tên miền ngân hàng chính thống.' },
      { id: 'log3', action: 'Cập nhật Cấu hình', target: 'Heuristics Level', operator: 'admin@chongluadao.vn', date: '2026-07-07T18:00:00Z', details: 'Tăng cường cấu hình quét tự động lên mức Cao.' },
      { id: 'log4', action: 'Khóa Thành viên', target: 'hailevan@gmail.com', operator: 'admin@chongluadao.vn', date: '2026-07-07T09:12:00Z', details: 'Khóa tài khoản do spam gửi báo cáo giả mạo.' }
    ];
    localStorage.setItem('admin_audit_logs', JSON.stringify(defaults));
    return defaults;
  });

  // System Settings (mocked/not used in layout)

  // Sync wrappers
  const savePendingReports = (data) => {
    setPendingReports(data);
    localStorage.setItem('admin_pending_reports', JSON.stringify(data));
  };
  const saveBlacklist = (data) => {
    setBlacklist(data);
    localStorage.setItem('admin_blacklist', JSON.stringify(data));
  };
  const saveWhitelist = (data) => {
    setWhitelist(data);
    localStorage.setItem('admin_whitelist', JSON.stringify(data));
  };
  const saveUsers = (data) => {
    setUsers(data);
    localStorage.setItem('admin_users', JSON.stringify(data));
  };
  const saveAuditLogs = (data) => {
    setAuditLogs(data);
    localStorage.setItem('admin_audit_logs', JSON.stringify(data));
  };

  // Add audit log helper
  const addAuditLog = (action, target, details) => {
    const newLog = {
      id: generateId('log'),
      action,
      target,
      operator: userEmail || 'admin@chongluadao.vn',
      date: new Date().toISOString(),
      details
    };
    saveAuditLogs([newLog, ...auditLogs]);
  };

  // --- MODALS & FORM STATES ---
  const [showAddBlackModal, setShowAddBlackModal] = useState(false);
  const [addBlackType, setAddBlackType] = useState('url');
  const [addBlackTarget, setAddBlackTarget] = useState('');
  const [addBlackCategory, setAddBlackCategory] = useState('phishing');
  const [addBlackSeverity, setAddBlackSeverity] = useState('danger');
  const [addBlackDescription, setAddBlackDescription] = useState('');
  const [addBlackBankName, setAddBlackBankName] = useState('');

  const [showAddWhiteModal, setShowAddWhiteModal] = useState(false);
  const [addWhiteDomain, setAddWhiteDomain] = useState('');
  const [addWhiteNotes, setAddWhiteNotes] = useState('');

  // Fetch system-wide overview statistics for reports
  useEffect(() => {
    if (!isAdmin || activeTab !== 'overview') return;

    const fetchStats = async () => {
      try {
        const res = await api.getAdminReportsStats(token);
        if (res && res.success && res.data) {
          setReportsStats({
            total: res.data.total || 0,
            pending: res.data.pending || 0,
            approved: res.data.approved || 0,
            rejected: res.data.rejected || 0
          });
        }
      } catch (err) {
        console.warn("Failed to fetch reports stats from backend, using calculated local counts.", err);
        setReportsStats({
          total: blacklist.length + pendingReports.length,
          pending: pendingReports.length,
          approved: blacklist.length,
          rejected: 0
        });
      }
    };

    fetchStats();
  }, [activeTab, blacklist.length, pendingReports.length, token, isAdmin]);

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  // --- HANDLERS ---

  const handleAdminLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      if (addToast) addToast('Đã đăng xuất tài khoản quản trị.', 'info');
      navigate('/admin/login');
    }
  };



  // Add Blacklist Direct
  const handleAddBlacklistDirect = (e) => {
    e.preventDefault();
    if (!addBlackTarget.trim()) {
      if (addToast) addToast('Vui lòng nhập đối tượng lừa đảo', 'error');
      return;
    }

    const newItem = {
      id: generateId('bl'),
      target: addBlackTarget.trim(),
      type: addBlackType,
      category: addBlackCategory,
      severity: addBlackSeverity,
      description: addBlackDescription.trim() || 'Thêm thủ công bởi Quản trị viên.',
      bankName: addBlackType === 'bank_account' ? addBlackBankName.trim() : undefined,
      date: new Date().toISOString()
    };

    saveBlacklist([newItem, ...blacklist]);
    addAuditLog('Thêm Blacklist', newItem.target, `Thêm thủ công đối tượng lừa đảo.`);
    if (addToast) addToast(`Đã thêm thành công "${newItem.target}" vào danh sách đen!`, 'success');

    setAddBlackTarget('');
    setAddBlackDescription('');
    setAddBlackBankName('');
    setShowAddBlackModal(false);
  };

  const handleDeleteBlacklist = (id, target) => {
    if (window.confirm(`Bạn có chắc muốn gỡ bỏ "${target}" khỏi danh sách đen?`)) {
      saveBlacklist(blacklist.filter(i => i.id !== id));
      addAuditLog('Gỡ Blacklist', target, 'Gỡ bỏ đối tượng lừa đảo khỏi hệ thống cơ sở dữ liệu.');
      if (addToast) addToast(`Đã gỡ bỏ "${target}" khỏi danh sách đen.`, 'success');
    }
  };

  // Add Whitelist Direct
  const handleAddWhitelistDirect = (e) => {
    e.preventDefault();
    if (!addWhiteDomain.trim()) {
      if (addToast) addToast('Vui lòng nhập tên miền tin cậy', 'error');
      return;
    }

    const newItem = {
      id: generateId('wl'),
      domain: addWhiteDomain.trim().toLowerCase(),
      addedBy: userEmail || 'Quản trị viên',
      date: new Date().toISOString(),
      notes: addWhiteNotes.trim() || 'Tên miền tin cậy xác thực bởi CLD.'
    };

    saveWhitelist([newItem, ...whitelist]);
    addAuditLog('Thêm Whitelist', newItem.domain, 'Thêm tên miền chính thống tin cậy.');
    if (addToast) addToast(`Đã thêm tên miền "${newItem.domain}" vào danh sách trắng!`, 'success');

    setAddWhiteDomain('');
    setAddWhiteNotes('');
    setShowAddWhiteModal(false);
  };

  const handleDeleteWhitelist = (id, domain) => {
    if (window.confirm(`Bạn có chắc muốn gỡ bỏ tên miền tin cậy "${domain}"?`)) {
      saveWhitelist(whitelist.filter(i => i.id !== id));
      addAuditLog('Gỡ Whitelist', domain, 'Gỡ bỏ tên miền an toàn khỏi danh sách trắng.');
      if (addToast) addToast(`Đã gỡ bỏ tên miền tin cậy "${domain}".`, 'success');
    }
  };



  // --- FILTERS ---
  const filteredBlacklist = blacklist.filter(item =>
    item.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.bankName && item.bankName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredWhitelist = whitelist.filter(item =>
    item.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.notes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLogs = auditLogs.filter(log =>
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-dashboard-container">
      {/* Background overlay glow */}
      <div className="login-overlay-laser" style={{ opacity: 0.08 }}></div>

      {/* SIDEBAR NAVIGATION */}
      <div className={`db-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div>
          <div className="db-sidebar-header">
            <div className="admin-sidebar-logo">
              <Shield size={20} color="#23b56c" className="pulse-success-glow" />
              <span className="db-sidebar-title">QUẢN TRỊ C.L.D</span>
            </div>
            <button
              className="collapse-sidebar-btn"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              title={isSidebarCollapsed ? "Mở rộng" : "Thu gọn"}
            >
              <AlignLeft size={16} />
            </button>
          </div>

          <div className="db-menu-list">
            <button
              className={`db-menu-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => { setActiveTab('overview'); setSearchQuery(''); }}
            >
              <Grid size={18} />
              <span>Tổng quan</span>
            </button>

            <button
              className={`db-menu-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => { setActiveTab('reports'); setSearchQuery(''); }}
            >
              <Clock size={18} />
              <span>Duyệt báo cáo</span>
              {pendingReports.length > 0 && (
                <span className="nav-badge pending-count-badge">{pendingReports.length}</span>
              )}
            </button>

            <button
              className={`db-menu-item ${activeTab === 'blacklist' ? 'active' : ''}`}
              onClick={() => { setActiveTab('blacklist'); setSearchQuery(''); }}
            >
              <ShieldAlert size={18} />
              <span>Danh sách đen</span>
            </button>

            <button
              className={`db-menu-item ${activeTab === 'whitelist' ? 'active' : ''}`}
              onClick={() => { setActiveTab('whitelist'); setSearchQuery(''); }}
            >
              <ShieldCheck size={18} />
              <span>Danh sách trắng</span>
            </button>

            <button
              className={`db-menu-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => { setActiveTab('users'); setSearchQuery(''); }}
            >
              <Users size={18} />
              <span>Thành viên</span>
            </button>

            <button
              className={`db-menu-item ${activeTab === 'audit' ? 'active' : ''}`}
              onClick={() => { setActiveTab('audit'); setSearchQuery(''); }}
            >
              <Activity size={18} />
              <span>Nhật ký hệ thống</span>
            </button>
          </div>
        </div>

        <div className="chat-sidebar-footer">
          <button className="sidebar-footer-item" onClick={handleAdminLogout}>
            <LogOut size={16} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="db-main-area">
        {/* Header */}
        <header className="db-header">
          <div className="db-header-left">
            <span className="live-pulse-dot" style={{ backgroundColor: '#23b56c', boxShadow: '0 0 8px #23b56c' }}></span>
            <span className="db-header-title" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>
              HỆ THỐNG GIÁM SÁT TRUNG TÂM CLD
            </span>
          </div>

          {/* Quick Search - only shown on tabs that utilize this global state to filter */}
          {['blacklist', 'whitelist', 'audit'].includes(activeTab) && (
            <div className="report-input-wrap header-search-box" style={{ maxWidth: '320px', marginRight: '1.50rem' }}>
              <Search size={14} className="report-input-icon" />
              <input
                type="text"
                className="report-input"
                placeholder={`Tìm kiếm nhanh...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ height: '36px', fontSize: '0.8rem', borderRadius: '8px' }}
              />
            </div>
          )}
        </header>

        {/* Content body wrapper */}
        <div className="db-content" style={{ overflowY: 'auto', padding: '1.75rem' }}>

          {activeTab === 'overview' && (
            <AdminOverviewTab reportsStats={reportsStats} />
          )}

          {/* ======================================================== */}
          {/* TAB 2: PENDING REPORTS REVIEW */}
          {/* ======================================================== */}
          {activeTab === 'reports' && (
            <ReportsTab
              token={token}
              pendingReports={pendingReports}
              setPendingReports={setPendingReports}
              savePendingReports={savePendingReports}
              blacklist={blacklist}
              saveBlacklist={saveBlacklist}
              addAuditLog={addAuditLog}
              addToast={addToast}
            />
          )}

          {/* ======================================================== */}
          {/* TAB 3: BLACKLIST MANAGER */}
          {/* ======================================================== */}
          {activeTab === 'blacklist' && (
            <div className="admin-tab-view animate-fade-in">
              <div className="db-panel-card">
                <div className="db-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="db-card-title">Cơ sở dữ liệu Danh sách đen</h3>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowAddBlackModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', height: '36px', padding: '0 0.85rem', fontSize: '0.78rem', borderRadius: '8px' }}
                  >
                    <Plus size={14} /> Thêm thủ công
                  </button>
                </div>

                <div className="db-reports-table-wrap">
                  {filteredBlacklist.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Không tìm thấy đối tượng nào trùng khớp trong Danh sách đen.
                    </div>
                  ) : (
                    <table className="db-reports-table">
                      <thead>
                        <tr>
                          <th>Đối tượng</th>
                          <th>Phân loại</th>
                          <th>Thể loại</th>
                          <th>Mức độ</th>
                          <th>Mô tả hành vi</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBlacklist.map(item => (
                          <tr key={item.id}>
                            <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>{item.target}</td>
                            <td>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {item.type === 'url' ? 'Tên miền' : item.type === 'bank_account' ? `Ngân hàng (${item.bankName})` : 'Số điện thoại'}
                              </span>
                            </td>
                            <td>
                              <span style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>
                                {item.category === 'phishing' ? 'Giả mạo (Phishing)' :
                                  item.category === 'malware' ? 'Mã độc (Malware)' :
                                    item.category === 'financial' ? 'Tài chính / Đa cấp' :
                                      item.category === 'romance' ? 'Tình cảm' : 'Khác'}
                              </span>
                            </td>
                            <td>
                              <span className={`status-badge ${item.severity === 'danger' ? 'rejected' : 'pending'}`} style={{ fontSize: '0.65rem' }}>
                                {item.severity === 'danger' ? 'Critical' : 'Warning'}
                              </span>
                            </td>
                            <td style={{ maxWidth: '240px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontSize: '0.8rem' }} title={item.description}>
                              {item.description}
                            </td>
                            <td>
                              <button
                                className="admin-delete-btn"
                                onClick={() => handleDeleteBlacklist(item.id, item.target)}
                                title="Xóa bỏ khỏi Blacklist"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: WHITELIST MANAGER */}
          {/* ======================================================== */}
          {activeTab === 'whitelist' && (
            <div className="admin-tab-view animate-fade-in">
              <div className="db-panel-card">
                <div className="db-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="db-card-title">Cơ sở dữ liệu Danh sách trắng</h3>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowAddWhiteModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', height: '36px', padding: '0 0.85rem', fontSize: '0.78rem', borderRadius: '8px' }}
                  >
                    <Plus size={14} /> Thêm thủ công
                  </button>
                </div>

                <div className="db-reports-table-wrap">
                  {filteredWhitelist.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Không tìm thấy tên miền nào trùng khớp trong Danh sách trắng.
                    </div>
                  ) : (
                    <table className="db-reports-table">
                      <thead>
                        <tr>
                          <th>Tên miền an toàn</th>
                          <th>Người thêm</th>
                          <th>Ngày thêm</th>
                          <th>Ghi chú</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredWhitelist.map(item => (
                          <tr key={item.id}>
                            <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#23b56c', fontSize: '0.88rem' }}>{item.domain}</td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.addedBy}</td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(item.date).toLocaleDateString('vi-VN')}</td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.notes}</td>
                            <td>
                              <button
                                className="admin-delete-btn"
                                onClick={() => handleDeleteWhitelist(item.id, item.domain)}
                                title="Xóa bỏ khỏi Whitelist"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: USER LIST MANAGEMENT */}
          {/* ======================================================== */}
          {activeTab === 'users' && (
            <UsersTab
              token={token}
              users={users}
              setUsers={setUsers}
              saveUsers={saveUsers}
              addAuditLog={addAuditLog}
              addToast={addToast}
              pendingReports={pendingReports}
            />
          )}

          {/* ======================================================== */}
          {/* TAB 6: AUDIT LOGS */}
          {/* ======================================================== */}
          {activeTab === 'audit' && (
            <div className="admin-tab-view animate-fade-in">
              <div className="db-panel-card">
                <div className="db-card-header">
                  <h3 className="db-card-title">Nhật ký hoạt động quản trị</h3>
                </div>

                <div className="db-reports-table-wrap">
                  {filteredLogs.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Không tìm thấy bản ghi nhật ký hoạt động nào.
                    </div>
                  ) : (
                    <table className="db-reports-table">
                      <thead>
                        <tr>
                          <th>Thời gian</th>
                          <th>Hành động</th>
                          <th>Đối tượng tác động</th>
                          <th>Người thực hiện</th>
                          <th>Mô tả chi tiết</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLogs.map(log => (
                          <tr key={log.id}>
                            <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{new Date(log.date).toLocaleString('vi-VN')}</td>
                            <td>
                              <span style={{
                                fontSize: '0.72rem',
                                fontWeight: 'bold',
                                padding: '0.15rem 0.4rem',
                                borderRadius: '4px',
                                background: log.action.includes('Khóa') || log.action.includes('Gỡ') ? 'rgba(239,68,68,0.15)' : 'rgba(35,181,108,0.15)',
                                color: log.action.includes('Khóa') || log.action.includes('Gỡ') ? '#ef4444' : '#23b56c'
                              }}>
                                {log.action}
                              </span>
                            </td>
                            <td style={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#fff' }}>{log.target}</td>
                            <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{log.operator}</td>
                            <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{log.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}



        </div>
      </div>



      {/* ======================================================== */}
      {/* DIRECT ADD BLACKLIST MODAL */}
      {/* ======================================================== */}
      {showAddBlackModal && (
        <div className="signature-modal-overlay">
          <form className="signature-modal" style={{ maxWidth: '500px', textAlign: 'left' }} onSubmit={handleAddBlacklistDirect}>
            <h3 className="signature-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={20} className="text-secondary" style={{ color: 'var(--secondary)' }} />
              Thêm Đối Tượng Vào Blacklist Trực Tiếp
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '1rem 0' }}>
              <div className="profile-field-group">
                <label className="profile-field-label">Loại đối tượng</label>
                <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                  {['url', 'bank_account', 'phone'].map(t => (
                    <button
                      key={t}
                      type="button"
                      className="profile-avatar-btn"
                      onClick={() => setAddBlackType(t)}
                      style={{
                        flex: 1,
                        background: addBlackType === t ? 'rgba(35, 181, 108, 0.08)' : 'transparent',
                        color: addBlackType === t ? '#23b56c' : 'var(--text-secondary)',
                        borderColor: addBlackType === t ? 'rgba(35, 181, 108, 0.15)' : 'var(--border-color)'
                      }}
                    >
                      {t === 'url' ? 'Tên miền' : t === 'bank_account' ? 'Số tài khoản' : 'Số điện thoại'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="profile-field-group">
                <label className="profile-field-label">
                  {addBlackType === 'url' ? 'Địa chỉ tên miền / URL' : addBlackType === 'bank_account' ? 'Số tài khoản ngân hàng' : 'Số điện thoại lừa đảo'}
                </label>
                <input
                  type="text"
                  className="profile-field-input"
                  placeholder={addBlackType === 'url' ? 'vietcombank-login.xyz' : addBlackType === 'bank_account' ? '97042293849102' : '0912345678'}
                  value={addBlackTarget}
                  onChange={(e) => setAddBlackTarget(e.target.value)}
                  required
                />
              </div>

              {addBlackType === 'bank_account' && (
                <div className="profile-field-group">
                  <label className="profile-field-label">Tên Ngân Hàng</label>
                  <input
                    type="text"
                    className="profile-field-input"
                    placeholder="MB Bank, Techcombank, Vietinbank..."
                    value={addBlackBankName}
                    onChange={(e) => setAddBlackBankName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="profile-field-group">
                  <label className="profile-field-label">Thể loại lừa đảo</label>
                  <select
                    className="profile-field-input"
                    value={addBlackCategory}
                    onChange={(e) => setAddBlackCategory(e.target.value)}
                    style={{ background: 'rgba(0,0,0,0.02)', cursor: 'pointer' }}
                  >
                    <option value="phishing">Giả mạo (Phishing)</option>
                    <option value="malware">Mã độc (Malware)</option>
                    <option value="financial">Tài chính / Đa cấp</option>
                    <option value="romance">Tình cảm / Mạng XH</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div className="profile-field-group">
                  <label className="profile-field-label">Mức độ nguy hại</label>
                  <select
                    className="profile-field-input"
                    value={addBlackSeverity}
                    onChange={(e) => setAddBlackSeverity(e.target.value)}
                    style={{ background: 'rgba(0,0,0,0.02)', cursor: 'pointer' }}
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
                  value={addBlackDescription}
                  onChange={(e) => setAddBlackDescription(e.target.value)}
                  placeholder="Mô tả cụ thể hành vi hoặc phương thức lừa đảo của đối tượng..."
                  style={{ height: '90px', padding: '0.75rem', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            <div className="signature-actions">
              <button
                type="button"
                className="btn btn-secondary report-nav-btn"
                onClick={() => setShowAddBlackModal(false)}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="btn btn-primary report-nav-btn"
              >
                Thêm Blacklist
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* DIRECT ADD WHITELIST MODAL */}
      {/* ======================================================== */}
      {showAddWhiteModal && (
        <div className="signature-modal-overlay">
          <form className="signature-modal" style={{ maxWidth: '500px', textAlign: 'left' }} onSubmit={handleAddWhitelistDirect}>
            <h3 className="signature-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={20} className="text-secondary" style={{ color: 'var(--secondary)' }} />
              Thêm Tên Miền Vào Whitelist (Danh Sách Trắng)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '1rem 0' }}>
              <div className="profile-field-group">
                <label className="profile-field-label">Tên miền an toàn (Domain)</label>
                <input
                  type="text"
                  className="profile-field-input"
                  placeholder="vietcombank.com.vn hoặc techcombank.com"
                  value={addWhiteDomain}
                  onChange={(e) => setAddWhiteDomain(e.target.value)}
                  required
                />
              </div>

              <div className="profile-field-group">
                <label className="profile-field-label">Ghi chú nguồn tin cậy</label>
                <textarea
                  className="report-textarea"
                  value={addWhiteNotes}
                  onChange={(e) => setAddWhiteNotes(e.target.value)}
                  placeholder="Ghi chú nguồn gốc tên miền chính chủ..."
                  style={{ height: '90px', padding: '0.75rem', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            <div className="signature-actions">
              <button
                type="button"
                className="btn btn-secondary report-nav-btn"
                onClick={() => setShowAddWhiteModal(false)}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="btn btn-primary report-nav-btn"
              >
                Thêm Whitelist
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
