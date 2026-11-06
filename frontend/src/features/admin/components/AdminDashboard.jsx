import { useState, useEffect } from 'react';
import { useNavigate, Navigate, useLocation, Routes, Route } from 'react-router-dom';
import {
  Shield, Grid, Clock, ShieldAlert, ShieldCheck, Users, Activity,
  LogOut, Plus, Search, Trash2, CheckCircle, X, Check, User, AlertCircle, ChevronDown, History
} from 'lucide-react';
import './AdminDashboard.css';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import AdminOverviewTab from './AdminOverviewTab';
import ReportsTab from './ReportsTab';
import UsersTab from './UsersTab';
import BlacklistTab from './BlacklistTab';
import WhitelistTab from './WhitelistTab';
import AuditLogTab from './AuditLogTab';
import ModeratorHistoryTab from './ModeratorHistoryTab';

function generateId(prefix) {
  return `${prefix}_${new Date().getTime()}_${Math.floor(Math.random() * 1000)}`;
}

export default function AdminDashboard({ addToast, onLogout }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const isAdmin = token && user.role === 'admin';

  // State management
  const location = useLocation();
  const pathSegments = location.pathname.split('/');
  const lastSegment = pathSegments[pathSegments.length - 1];
  const activeTab = ['overview', 'reports', 'blacklist', 'whitelist', 'users', 'audit', 'mod-history'].includes(lastSegment) ? lastSegment : 'overview';
  const [searchQuery, setSearchQuery] = useState('');
  const [reportsStats, setReportsStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [dashboardStats, setDashboardStats] = useState(null);

  // Fetch dashboard stats from API
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await api.getAdminDashboardStats(token);
        if (res && res.success && res.data) {
          setDashboardStats(res.data);
        }
      } catch (err) {
        console.warn("Failed to fetch dashboard stats from API, using fallback calculated values.", err);
      }
    };
    if (token) {
      fetchDashboardStats();
    }
  }, [token]);

  // Add User Form States
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [activeUserMenuId, setActiveUserMenuId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  // Selected item IDs
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [selectedBlacklistId, setSelectedBlacklistId] = useState(null);
  const [selectedWhitelistId, setSelectedWhitelistId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedAuditId, setSelectedAuditId] = useState(null);

  // --- MOCK/LOCAL STORAGE DATA SYNCHRONIZATION ---
  const [pendingReports, setPendingReports] = useState(() => {
    const saved = localStorage.getItem('admin_pending_reports');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'ap1', target: 'vietcombank-reward-cld.xyz', type: 'url', reporter: 'Nguyễn Văn Nam', email: 'nam.nv@gmail.com', date: '2026-07-06T15:30:00Z', description: 'Trang web mạo danh ngân hàng Vietcombank gửi tin nhắn quà tặng tri ân hòng đánh cắp mật khẩu e-banking.' },
      { id: 'ap2', target: '0398765432', type: 'phone', reporter: 'Trần Thị Mai', email: 'maitt99@yahoo.com', date: '2026-07-06T18:45:00Z', description: 'Số điện thoại xưng danh là công an Hà Nội đe dọa liên quan vụ án ma túy yêu cầu chuyển tiền xác minh.' },
      { id: 'ap3', target: '97042293849102', type: 'bank_account', bankName: 'MB Bank', reporter: 'Phan Minh', email: 'minhphan_cld@gmail.com', date: '2026-07-07T02:15:00Z', description: 'Tài khoản nhận tiền cọc bán điện thoại iPhone cũ giá siêu rẻ trên Marketplace, nhận tiền xong lập tức chặn chat.' }
    ];
  });

  const [blacklist, setBlacklist] = useState(() => {
    const saved = localStorage.getItem('admin_blacklist');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'bl1', target: 'vietcombank-otp-verify.com', type: 'url', category: 'phishing', severity: 'danger', description: 'Trang web giả mạo ngân hàng Vietcombank để đánh cắp mã OTP.', date: '2026-06-19T10:00:00Z' },
      { id: 'bl2', target: 'momo-nhan-loc-he.xyz', type: 'url', category: 'scam', severity: 'danger', description: 'Lừa đảo nhận lộc hè MoMo, dụ dỗ người dùng chuyển tiền.', date: '2026-06-19T09:30:00Z' },
      { id: 'bl4', target: '19035678912345', type: 'bank_account', bankName: 'Techcombank', category: 'financial', severity: 'danger', description: 'Lừa cọc mua xe máy giá rẻ trên Facebook.', date: '2026-06-19T10:00:00Z' }
    ];
  });

  const [whitelist, setWhitelist] = useState(() => {
    const saved = localStorage.getItem('admin_whitelist');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'wl1', domain: 'shield.vn', addedBy: 'Hệ thống', date: '2026-06-01T00:00:00Z', notes: 'Trang web chính thức dự án.' },
      { id: 'wl2', domain: 'vietcombank.com.vn', addedBy: 'Hệ thống', date: '2026-06-01T00:00:00Z', notes: 'Trang web chính thức ngân hàng Vietcombank.' }
    ];
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('admin_users');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'usr1', name: 'Emma Smith', email: 'smith@kpmg.com', role: 'admin', ipAddress: '3872.2342.123.12', reportsCount: 12, status: 'active', joined: '19 Aug 2023, 5:30 pm' },
      { id: 'usr2', name: 'Melody Macy', email: 'melody@altbox.com', role: 'user', ipAddress: '234.243.222.23', reportsCount: 26, status: 'active', joined: '20 Dec 2023, 10:30 am' },
      { id: 'usr3', name: 'Max Smith', email: 'max@kpmg.com', role: 'moderator', ipAddress: '192.168.4.15', reportsCount: 8, status: 'active', joined: '12 Jan 2024, 2:15 pm' },
      { id: 'usr4', name: 'Sean Bean', email: 'sean@dell.com', role: 'user', ipAddress: '202.12.87.41', reportsCount: 0, status: 'banned', joined: '05 Mar 2024, 9:00 am' }
    ];
  });
  const [usersTotal, setUsersTotal] = useState(4);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState(null);

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('admin_audit_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'log1', action: 'Phê duyệt Blacklist', target: 'vietcombank-reward-cld.xyz', operator: 'admin@shield.vn', date: '2026-07-08T15:20:00Z', details: 'Duyệt URL lừa đảo trúng thưởng của Vietcombank.' },
      { id: 'log2', action: 'Thêm Whitelist', target: 'bidv.com.vn', operator: 'admin@shield.vn', date: '2026-07-08T10:45:00Z', details: 'Thêm tên miền ngân hàng chính thống.' }
    ];
  });

  // State sync wrapper
  const savePendingReports = (data) => { setPendingReports(data); localStorage.setItem('admin_pending_reports', JSON.stringify(data)); };
  const saveBlacklist = (data) => { setBlacklist(data); localStorage.setItem('admin_blacklist', JSON.stringify(data)); };
  const saveWhitelist = (data) => { setWhitelist(data); localStorage.setItem('admin_whitelist', JSON.stringify(data)); };
  const saveUsers = (data) => { setUsers(data); localStorage.setItem('admin_users', JSON.stringify(data)); };
  const saveAuditLogs = (data) => { setAuditLogs(data); localStorage.setItem('admin_audit_logs', JSON.stringify(data)); };

  const addAuditLog = (action, target, details) => {
    const newLog = {
      id: generateId('log'),
      action,
      target,
      operator: user.email || 'admin@shield.vn',
      date: new Date().toISOString(),
      details
    };
    saveAuditLogs([newLog, ...auditLogs]);
  };

  // Sync Overview stats
  useEffect(() => {
    setReportsStats({
      total: blacklist.length + pendingReports.length + 5,
      pending: pendingReports.length,
      approved: blacklist.length,
      rejected: 5
    });
  }, [blacklist.length, pendingReports.length]);

  // Reset pagination on search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Fetch users list from backend API
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const res = await api.getAdminUsers(token, currentPage, usersPerPage, searchQuery);
        if (res && res.success && res.data) {
          const userList = Array.isArray(res.data) ? res.data : (res.data.users || []);

          const mappedUsers = userList.map(u => ({
            id: u.id,
            name: u.name || u.username || 'No Name',
            email: u.email,
            role: (u.role || 'user').toLowerCase(),
            status: u.status || 'active',
            ipAddress: u.ipAddress || '127.0.0.1',
            reportsCount: u.reportsCount || 0,
            joined: u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : '13/07/2026'
          }));

          setUsers(mappedUsers);
          setUsersError(null);

          let total = mappedUsers.length;
          if (res.data.total) {
            total = res.data.total;
          } else if (res.total) {
            total = res.total;
          }
          setUsersTotal(total);
        }
      } catch (err) {
        console.error("Failed to fetch users from backend:", err);
        setUsers([]);
        setUsersTotal(0);
        setUsersError("Không thể tải danh sách thành viên từ máy chủ!");
        if (addToast) addToast("Không thể kết nối đến máy chủ lấy danh sách thành viên!", "danger");
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [searchQuery, currentPage, usersPerPage, token]);

  // Handle redirect from /admin to /admin/overview
  useEffect(() => {
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
      navigate('/admin/overview', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Modal forms states
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

  const [activeApprovalReport, setActiveApprovalReport] = useState(null);
  const [approveDesc, setApproveDesc] = useState('');
  const [approveBank, setApproveBank] = useState('');
  const [approveCat, setApproveCat] = useState('phishing');
  const [approveSev, setApproveSev] = useState('danger');

  if (user.role === 'moderator') {
    return <Navigate to="/moderator" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  // --- ACTIONS HANDLERS ---
  const handleAddBlacklist = (e) => {
    e.preventDefault();
    if (!addBlackTarget.trim()) return;

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
    addAuditLog('Thêm Blacklist', newItem.target, 'Thêm đối tượng lừa đảo thủ công.');
    if (addToast) addToast(`Đã thêm "${newItem.target}" vào danh sách đen!`, 'success');

    setAddBlackTarget('');
    setAddBlackDescription('');
    setAddBlackBankName('');
    setShowAddBlackModal(false);
  };

  const handleDeleteBlacklist = (item) => {
    if (window.confirm(`Bạn có chắc muốn gỡ bỏ "${item.target}" khỏi danh sách đen?`)) {
      saveBlacklist(blacklist.filter(i => i.id !== item.id));
      addAuditLog('Gỡ Blacklist', item.target, 'Gỡ bỏ đối tượng lừa đảo khỏi hệ thống.');
      if (addToast) addToast(`Đã gỡ bỏ "${item.target}" thành công.`, 'success');
      setSelectedBlacklistId(null);
    }
  };

  const handleAddWhitelist = (e) => {
    e.preventDefault();
    if (!addWhiteDomain.trim()) return;

    const newItem = {
      id: generateId('wl'),
      domain: addWhiteDomain.trim().toLowerCase(),
      addedBy: user.email || 'Quản trị viên',
      date: new Date().toISOString(),
      notes: addWhiteNotes.trim() || 'Tên miền tin cậy xác thực.'
    };

    saveWhitelist([newItem, ...whitelist]);
    addAuditLog('Thêm Whitelist', newItem.domain, 'Thêm tên miền chính thống tin cậy.');
    if (addToast) addToast(`Đã thêm tên miền "${newItem.domain}" vào danh sách trắng!`, 'success');

    setAddWhiteDomain('');
    setAddWhiteNotes('');
    setShowAddWhiteModal(false);
  };

  const handleDeleteWhitelist = (item) => {
    if (window.confirm(`Bạn có chắc muốn gỡ bỏ tên miền "${item.domain}"?`)) {
      saveWhitelist(whitelist.filter(i => i.id !== item.id));
      addAuditLog('Gỡ Whitelist', item.domain, 'Gỡ bỏ tên miền khỏi danh sách trắng.');
      if (addToast) addToast(`Đã gỡ bỏ tên miền "${item.domain}".`, 'success');
      setSelectedWhitelistId(null);
    }
  };

  const handleAddUserSubmit = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      if (addToast) addToast('Vui lòng điền đầy đủ tên và email.', 'warning');
      return;
    }
    const newUser = {
      id: generateId('usr'),
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      role: newUserRole,
      ipAddress: '127.0.0.1',
      reportsCount: 0,
      status: 'active',
      joined: new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' }) + ', 12:00 am'
    };
    saveUsers([...users, newUser]);
    addAuditLog('Thêm Thành viên', newUser.email, `Đã thêm thành viên mới: ${newUser.name} vai trò ${newUser.role}`);
    if (addToast) addToast(`Đã thêm thành viên ${newUser.name}!`, 'success');

    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('user');
  };

  const handleUpdateUserRole = (userId, newRole) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        addAuditLog('Cập nhật quyền', u.email, `Thay đổi vai trò thành ${newRole}.`);
        if (addToast) addToast(`Đã cập nhật quyền thành công thành ${newRole}!`, 'success');
        return { ...u, role: newRole };
      }
      return u;
    });
    saveUsers(updated);
  };

  const handleToggleUserStatus = (userId) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'active' ? 'banned' : 'active';
        addAuditLog(nextStatus === 'banned' ? 'Khóa thành viên' : 'Mở khóa thành viên', u.email, `Thay đổi trạng thái tài khoản.`);
        if (addToast) addToast(`Đã thay đổi trạng thái tài khoản thành công!`, 'success');
        return { ...u, status: nextStatus };
      }
      return u;
    });
    saveUsers(updated);
  };

  const handleApproveReportClick = (report) => {
    setActiveApprovalReport(report);
    setApproveDesc(report.description);
    setApproveBank(report.bankName || '');
    setApproveCat(report.type === 'url' ? 'phishing' : 'financial');
    setApproveSev('danger');
  };

  const handleConfirmApproval = () => {
    if (!activeApprovalReport) return;

    const newItem = {
      id: generateId('bl'),
      target: activeApprovalReport.target,
      type: activeApprovalReport.type,
      category: approveCat,
      severity: approveSev,
      description: approveDesc,
      bankName: activeApprovalReport.type === 'bank_account' ? approveBank : undefined,
      date: new Date().toISOString()
    };

    saveBlacklist([newItem, ...blacklist]);
    savePendingReports(pendingReports.filter(r => r.id !== activeApprovalReport.id));
    addAuditLog('Duyệt Báo cáo', activeApprovalReport.target, `Phê duyệt đối tượng chặn. Loại: ${approveCat}`);
    if (addToast) addToast(`Đã duyệt chặn đối tượng "${activeApprovalReport.target}".`, 'success');

    setActiveApprovalReport(null);
    setSelectedReportId(null);
  };

  const handleRejectReport = (report) => {
    if (window.confirm(`Bạn có chắc muốn từ chối báo cáo đối với "${report.target}"?`)) {
      savePendingReports(pendingReports.filter(r => r.id !== report.id));
      addAuditLog('Từ chối Báo cáo', report.target, 'Từ chối yêu cầu tố cáo.');
      if (addToast) addToast(`Đã từ chối báo cáo đối với "${report.target}".`, 'info');
      setSelectedReportId(null);
    }
  };

  // --- FILTERS ---
  const filteredReports = pendingReports.filter(item =>
    item.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBlacklist = blacklist.filter(item =>
    item.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWhitelist = whitelist.filter(item =>
    item.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.notes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(usersTotal / usersPerPage) || 1;
  const activePage = Math.min(currentPage, totalPages);
  const indexOfFirstUser = (activePage - 1) * usersPerPage;
  const indexOfLastUser = indexOfFirstUser + users.length;

  const filteredLogs = auditLogs.filter(item =>
    item.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Selected entities references
  const selectedReport = pendingReports.find(r => r.id === selectedReportId);
  const selectedBlacklist = blacklist.find(b => b.id === selectedBlacklistId);
  const selectedWhitelist = whitelist.find(w => w.id === selectedWhitelistId);
  const selectedUser = users.find(u => u.id === selectedUserId);
  const selectedAudit = auditLogs.find(a => a.id === selectedAuditId);

  const getAvatarColor = (name) => {
    const colors = ['#2e7d32', '#1565c0', '#d84315', '#6a1b9a', '#00838f', '#ad1457', '#ef6c00'];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return colors[sum % colors.length];
  };

  return (
    <div className="admin-dashboard-container">

      {/* 1. SLIM SIDEBAR MENU */}
      <div className="cyber-sidebar-slim">
        <div>
          <div className="cyber-sidebar-logo-area">
            <Shield size={18} color="#23b56c" />
            <span>COMMAND CENTER</span>
          </div>

          <div className="cyber-menu-list">
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#565674', letterSpacing: '0.08em', padding: '0.5rem 1rem 0.25rem 1rem', textTransform: 'uppercase' }}>
              Dashboards
            </div>
            <button className={`cyber-menu-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => { navigate('/admin/overview'); setSearchQuery(''); }}>
              <Grid size={16} />
              <span>Tổng quan</span>
            </button>

            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#565674', letterSpacing: '0.08em', padding: '1rem 1rem 0.25rem 1rem', textTransform: 'uppercase' }}>
              Quản lý mặt hàng scan
            </div>
            <button className={`cyber-menu-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => { navigate('/admin/reports'); setSearchQuery(''); }}>
              <Clock size={16} />
              <span>Duyệt báo cáo</span>
              {pendingReports.length > 0 && <span className="telegram-badge-count">{pendingReports.length}</span>}
            </button>
            <button className={`cyber-menu-item ${activeTab === 'blacklist' ? 'active' : ''}`} onClick={() => { navigate('/admin/blacklist'); setSearchQuery(''); }}>
              <ShieldAlert size={16} />
              <span>Danh sách đen</span>
            </button>
            <button className={`cyber-menu-item ${activeTab === 'whitelist' ? 'active' : ''}`} onClick={() => { navigate('/admin/whitelist'); setSearchQuery(''); }}>
              <ShieldCheck size={16} />
              <span>Danh sách trắng</span>
            </button>

            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#565674', letterSpacing: '0.08em', padding: '1rem 1rem 0.25rem 1rem', textTransform: 'uppercase' }}>
              Pages
            </div>
            <button className={`cyber-menu-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => { navigate('/admin/users'); setSearchQuery(''); }}>
              <Users size={16} />
              <span>Quản lý Thành Viên</span>
            </button>
            <button className={`cyber-menu-item ${activeTab === 'mod-history' ? 'active' : ''}`} onClick={() => { navigate('/admin/mod-history'); setSearchQuery(''); }}>
              <History size={16} />
              <span>Lịch sử Kiểm duyệt</span>
            </button>

            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#565674', letterSpacing: '0.08em', padding: '1rem 1rem 0.25rem 1rem', textTransform: 'uppercase' }}>
              Help
            </div>
            <button className={`cyber-menu-item ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => { navigate('/admin/audit'); setSearchQuery(''); }}>
              <Activity size={16} />
              <span>Nhật ký hoạt động</span>
            </button>
          </div>
        </div>

        <div className="cyber-sidebar-footer">
          <button className="cyber-logout-btn" onClick={onLogout}>
            <LogOut size={14} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN AREA */}
      <div className="cyber-main-container">

        {/* Tab views layout router logic */}
        <Routes>
          <Route path="overview" element={
            <div className="cyber-overview-scroll">
              <AdminOverviewTab token={token} reportsStats={reportsStats} dashboardStats={dashboardStats} />
            </div>
          } />
          <Route path="users" element={
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              <UsersTab
                token={token}
                users={users}
                setUsers={setUsers}
                saveUsers={saveUsers}
                addAuditLog={addAuditLog}
                addToast={addToast}
                pendingReports={pendingReports}
              />
            </div>
          } />
          <Route path="reports" element={
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
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
            </div>
          } />
          <Route path="blacklist" element={
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              <BlacklistTab
                token={token}
                blacklist={blacklist}
                saveBlacklist={saveBlacklist}
                addAuditLog={addAuditLog}
                addToast={addToast}
              />
            </div>
          } />
          <Route path="whitelist" element={
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              <WhitelistTab
                token={token}
                whitelist={whitelist}
                saveWhitelist={saveWhitelist}
                addAuditLog={addAuditLog}
                addToast={addToast}
                currentUserEmail={user.email}
              />
            </div>
          } />
          <Route path="audit" element={
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              <AuditLogTab
                auditLogs={auditLogs}
                saveAuditLogs={saveAuditLogs}
                addToast={addToast}
              />
            </div>
          } />
          <Route path="mod-history" element={
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              <ModeratorHistoryTab
                auditLogs={auditLogs}
                addToast={addToast}
              />
            </div>
          } />
          <Route path="*" element={<Navigate to="overview" replace />} />
        </Routes>
      </div>

      {/* ======================================================== */}
      {/* DIRECT ADD BLACKLIST MODAL */}
      {/* ======================================================== */}
      {showAddBlackModal && (
        <div className="signature-modal-overlay">
          <form className="signature-modal" style={{ maxWidth: '500px', textAlign: 'left' }} onSubmit={handleAddBlacklist}>
            <h3 className="signature-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={20} color="var(--primary)" />
              Thêm Đối Tượng Vào Blacklist Thủ Công
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
                  style={{ height: '90px' }}
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
          <form className="signature-modal" style={{ maxWidth: '500px', textAlign: 'left' }} onSubmit={handleAddWhitelist}>
            <h3 className="signature-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={20} color="var(--primary)" />
              Thêm Tên Miền Vào Whitelist
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
                  style={{ height: '90px' }}
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

      {/* ======================================================== */}
      {/* APPROVAL DECISION MODAL FOR PENDING REPORTS */}
      {/* ======================================================== */}
      {activeApprovalReport && (
        <div className="signature-modal-overlay">
          <div className="signature-modal" style={{ maxWidth: '500px', textAlign: 'left' }}>
            <h3 className="signature-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} color="var(--primary)" />
              Xác Nhận Duyệt Chặn Đối Tượng
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '1rem 0' }}>
              <div className="profile-field-group">
                <label className="profile-field-label">Đối tượng duyệt chặn</label>
                <input
                  type="text"
                  className="profile-field-input"
                  value={activeApprovalReport.target}
                  readOnly
                  disabled
                  style={{ background: '#f5f8fa', color: '#5e6278', border: '1px solid #eff2f5', cursor: 'not-allowed' }}
                />
              </div>

              {activeApprovalReport.type === 'bank_account' && (
                <div className="profile-field-group">
                  <label className="profile-field-label">Tên ngân hàng</label>
                  <input
                    type="text"
                    className="profile-field-input"
                    value={approveBank}
                    onChange={(e) => setApproveBank(e.target.value)}
                  />
                </div>
              )}

              <div className="profile-field-group">
                <label className="profile-field-label">Thể loại vi phạm</label>
                <select
                  className="profile-field-input"
                  value={approveCat}
                  onChange={(e) => setApproveCat(e.target.value)}
                >
                  <option value="phishing">Giả mạo (Phishing)</option>
                  <option value="scam">Lừa đảo (Scam)</option>
                  <option value="financial">Lừa đảo tài chính (Financial Scam)</option>
                  <option value="romance">Lừa đảo tình cảm (Romance Scam)</option>
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
                      className={`admin-btn-select ${approveSev === sev ? `active-${sev}` : ''}`}
                      onClick={() => setApproveSev(sev)}
                      style={{ height: '36px', fontSize: '0.8rem' }}
                    >
                      {sev === 'danger' ? 'Nguy hiểm' : sev === 'warning' ? 'Cảnh báo' : 'Thông tin'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="profile-field-group">
                <label className="profile-field-label">Ghi chú lý do chặn</label>
                <textarea
                  className="report-textarea"
                  value={approveDesc}
                  onChange={(e) => setApproveDesc(e.target.value)}
                  style={{ height: '90px' }}
                />
              </div>
            </div>

            <div className="signature-actions">
              <button
                type="button"
                className="btn btn-secondary report-nav-btn"
                onClick={() => setActiveApprovalReport(null)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="btn btn-primary report-nav-btn"
                onClick={handleConfirmApproval}
              >
                Xác nhận Phê duyệt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* METRONIC ADD USER MODAL */}
      {showAddUserModal && (
        <div className="signature-modal-overlay">
          <form className="signature-modal" style={{ maxWidth: '500px', textAlign: 'left' }} onSubmit={handleAddUserSubmit}>
            <h3 className="signature-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={20} color="var(--primary)" />
              Thêm Thành Viên Mới
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', margin: '1rem 0' }}>
              <div className="profile-field-group">
                <label className="profile-field-label">Tên thành viên</label>
                <input
                  type="text"
                  className="profile-field-input"
                  placeholder="Nhập họ và tên..."
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                />
              </div>

              <div className="profile-field-group">
                <label className="profile-field-label">Địa chỉ Email</label>
                <input
                  type="email"
                  className="profile-field-input"
                  placeholder="name@company.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                />
              </div>

              <div className="profile-field-group">
                <label className="profile-field-label">Vai trò tài khoản</label>
                <select
                  className="profile-field-input"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  style={{ height: '38px', padding: '0 0.75rem', fontSize: '0.85rem' }}
                >
                  <option value="user">Hội viên (Standard User)</option>
                  <option value="moderator">Tư vấn viên (Moderator)</option>
                  <option value="admin">Quản trị viên (Administrator)</option>
                </select>
              </div>
            </div>

            <div className="signature-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAddUserModal(false)}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Thêm Thành Viên
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
