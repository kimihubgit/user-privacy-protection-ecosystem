import { useState, useEffect, useRef } from 'react';
import {
  Search, Eye, RefreshCw, ShieldX, UserCheck, Users, Activity,
  ShieldAlert, Plus, Download, SlidersHorizontal, Trash2,
  X, UserPlus, ChevronLeft, ChevronRight, ChevronDown
} from 'lucide-react';
import { api } from '../../../lib/api';

export default function UsersTab({ token, users, setUsers, saveUsers, addAuditLog, addToast, pendingReports }) {
  const [usersPage, setUsersPage] = useState(1);
  const usersLimit = 10;
  const [usersTotal, setUsersTotal] = useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Custom interactive states
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [activeDropdownUserId, setActiveDropdownUserId] = useState(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [showFilterPopover, setShowFilterPopover] = useState(false);

  // Filter settings
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Add User Form States
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addUsername, setAddUsername] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addRole, setAddRole] = useState('user');
  const [addIP, setAddIP] = useState('');

  // User Detail modal states
  const [activeUserDetail, setActiveUserDetail] = useState(null);
  const [userDetailData, setUserDetailData] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdownUserId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch users list
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const res = await api.getAdminUsers(token, 1, 1000, '');
        if (res && res.success && res.data) {
          const userList = Array.isArray(res.data) ? res.data : (res.data.users || []);

          const mappedUsers = userList.map(u => ({
            id: u.id || u._id || ('usr_' + Math.random()),
            name: u.name || u.username,
            email: u.email,
            role: (u.role || 'user').toLowerCase(),
            status: u.status || 'active',
            joined: u.created_at || '2026-06-01T00:00:00Z',
            ipAddress: u.ip_address || u.ipAddress || '127.0.0.1'
          }));

          setUsers(mappedUsers);
          setUsersTotal(mappedUsers.length);
        }
      } catch (err) {
        console.warn("Failed to fetch users from backend, using local/mock list.", err);
        const saved = localStorage.getItem('admin_users');
        if (saved) {
          try {
            const list = JSON.parse(saved);
            const fullyMapped = list.map(u => ({
              ...u,
              ipAddress: u.ipAddress || '127.0.0.1',
              joined: u.joined || new Date().toISOString()
            }));

            setUsers(fullyMapped);
            setUsersTotal(fullyMapped.length);
          } catch (e) {
            console.error(e);
          }
        }
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [token, setUsers]);

  // Format date helper
  const formatJoinedDate = (dateStr) => {
    if (!dateStr) return 'Mới';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;

      const day = d.getDate();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[d.getMonth()];
      const year = d.getFullYear();

      let hours = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minStr = minutes < 10 ? '0' + minutes : minutes;

      return `${day} ${month} ${year}, ${hours}:${minStr} ${ampm}`;
    } catch (e) {
      return dateStr;
    }
  };

  // Toggle user ban
  const handleToggleUserBan = async (id, name, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'banned' : 'active';
    const msg = nextStatus === 'banned' ? 'Khóa tài khoản' : 'Mở khóa tài khoản';
    if (window.confirm(`Bạn có chắc chắn muốn ${msg.toLowerCase()} "${name}"?`)) {
      try {
        await api.updateAdminUserStatus(token, id, nextStatus);
        addAuditLog(msg, name, `${msg} thành viên trong hệ thống.`);
        if (addToast) addToast(`Đã ${nextStatus === 'banned' ? 'khóa' : 'kích hoạt'} tài khoản "${name}".`, 'info');
      } catch (err) {
        console.error("Failed to update user status on backend, using local fallback.", err);
        addAuditLog(`${msg} (Offline)`, name, `${msg} thành viên (Offline).`);
        if (addToast) addToast(`Đã ${nextStatus === 'banned' ? 'khóa' : 'kích hoạt'} tài khoản "${name}" (Offline).`, 'info');
      }
      const updatedList = users.map(u => u.id === id ? { ...u, status: nextStatus } : u);
      saveUsers(updatedList);
      setActiveDropdownUserId(null);
    }
  };

  // Change user role
  const handleChangeUserRole = async (id, name, currentRole) => {
    const roles = ['user', 'moderator', 'admin'];
    const nextIndex = (roles.indexOf(currentRole) + 1) % roles.length;
    const nextRole = roles[nextIndex];

    if (window.confirm(`Bạn có chắc chắn đổi quyền hạn của "${name}" thành ${nextRole.toUpperCase()}?`)) {
      try {
        await api.updateAdminUserRole(token, id, nextRole);
        addAuditLog('Đổi Quyền hạn', name, `Thay đổi quyền hạn thành viên thành: ${nextRole.toUpperCase()}`);
        if (addToast) addToast(`Đã thay đổi quyền hạn của "${name}" thành ${nextRole.toUpperCase()}.`, 'success');
      } catch (err) {
        console.error("Failed to update user role on backend, using local fallback.", err);
        addAuditLog('Đổi Quyền hạn (Offline)', name, `Thay đổi quyền hạn (Offline): ${nextRole.toUpperCase()}`);
        if (addToast) addToast(`Đã thay đổi quyền hạn của "${name}" thành ${nextRole.toUpperCase()} (Offline).`, 'success');
      }
      const updatedList = users.map(u => u.id === id ? { ...u, role: nextRole } : u);
      saveUsers(updatedList);
      setActiveDropdownUserId(null);
    }
  };

  // Delete individual user
  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Bạn có chắc muốn XÓA VĨNH VIỄN tài khoản "${name}" khỏi hệ thống?`)) {
      try {
        await api.deleteAdminUser(token, id);
        addAuditLog('Xóa thành viên', name, `Xóa tài khoản thành viên vĩnh viễn.`);
        if (addToast) addToast(`Đã xóa tài khoản "${name}" thành công!`, 'warning');
      } catch (err) {
        console.error("Failed to delete user on backend, using local fallback.", err);
        addAuditLog('Xóa thành viên (Offline)', name, `Xóa tài khoản thành viên (Offline).`);
        if (addToast) addToast(`Đã xóa tài khoản "${name}" (Offline)!`, 'warning');
      }
      const updatedList = users.filter(u => u.id !== id);
      saveUsers(updatedList);
      setSelectedUserIds(prev => prev.filter(uid => uid !== id));
      setActiveDropdownUserId(null);
    }
  };

  // Add user logic
  const handleAddUserSubmit = (e) => {
    e.preventDefault();
    if (!addName.trim() || !addEmail.trim() || !addPassword) {
      if (addToast) addToast('Vui lòng điền đầy đủ các thông tin bắt buộc!', 'error');
      return;
    }

    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.floor(Math.random() * 100),
      name: addName.trim(),
      email: addEmail.trim(),
      username: addUsername.trim() || addEmail.split('@')[0],
      role: addRole,
      status: 'active',
      joined: new Date().toISOString(),
      ipAddress: addIP.trim() || '127.0.0.1'
    };

    const updatedList = [newUser, ...users];
    saveUsers(updatedList);
    addAuditLog('Thêm thành viên', newUser.name, `Thêm thủ công thành viên mới vào hệ thống.`);
    if (addToast) addToast(`Đã thêm thành viên "${newUser.name}" thành công!`, 'success');

    // Clean states
    setAddName('');
    setAddEmail('');
    setAddUsername('');
    setAddPassword('');
    setAddRole('user');
    setAddIP('');
    setIsAddUserOpen(false);
  };

  // Bulk actions
  const handleBulkBan = async () => {
    if (selectedUserIds.length === 0) return;
    if (window.confirm(`Khóa hàng loạt ${selectedUserIds.length} tài khoản đã chọn?`)) {
      await Promise.all(selectedUserIds.map(id => api.updateAdminUserStatus(token, id, 'banned').catch(() => null)));
      const updatedList = users.map(u =>
        selectedUserIds.includes(u.id) ? { ...u, status: 'banned' } : u
      );
      saveUsers(updatedList);
      addAuditLog('Khóa hàng loạt', `${selectedUserIds.length} tài khoản`, 'Cập nhật trạng thái khóa hàng loạt.');
      if (addToast) addToast(`Đã khóa thành công ${selectedUserIds.length} tài khoản.`, 'info');
      setSelectedUserIds([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUserIds.length === 0) return;
    if (window.confirm(`XÓA VĨNH VIỄN ${selectedUserIds.length} tài khoản đã chọn?`)) {
      await Promise.all(selectedUserIds.map(id => api.deleteAdminUser(token, id).catch(() => null)));
      const updatedList = users.filter(u => !selectedUserIds.includes(u.id));
      saveUsers(updatedList);
      addAuditLog('Xóa hàng loạt', `${selectedUserIds.length} tài khoản`, 'Xóa tài khoản hàng loạt khỏi CSDL.');
      if (addToast) addToast(`Đã xóa thành công ${selectedUserIds.length} tài khoản.`, 'warning');
      setSelectedUserIds([]);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    try {
      const headers = ['ID', 'Tên', 'Email', 'Quyền hạn', 'Trạng thái', 'Địa chỉ IP', 'Ngày tham gia'];
      const rows = users.map(u => [
        u.id,
        u.name,
        u.email,
        u.role === 'admin' ? 'Administrator' : u.role === 'moderator' ? 'Moderator' : 'User',
        u.status === 'active' ? 'Hoạt động' : 'Đang khóa',
        u.ipAddress,
        formatJoinedDate(u.joined)
      ]);

      const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
        + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `CLD_UsersList_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (addToast) addToast('Đã xuất danh sách thành viên ra file CSV thành công!', 'success');
    } catch (e) {
      console.error(e);
      if (addToast) addToast('Xuất dữ liệu thất bại!', 'error');
    }
  };

  // Toggle selection check
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUserIds(users.map(u => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedUserIds(prev =>
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  // Fetch detailed info
  const handleOpenUserDetail = async (usr) => {
    setActiveUserDetail(usr);
    setIsLoadingDetail(true);
    setUserDetailData(null);
    setActiveDropdownUserId(null);
    try {
      const res = await api.getAdminUserDetail(token, usr.id);
      if (res && res.success && res.data) {
        const d = res.data;
        setUserDetailData({
          user: {
            id: d.user.id || usr.id,
            name: d.user.name || usr.name,
            email: d.user.email || usr.email,
            role: (d.user.role || usr.role).toLowerCase(),
            status: d.user.status || usr.status,
            joined: d.user.created_at ? d.user.created_at.split('T')[0] : usr.joined
          },
          stats: {
            pending: d.stats.pending || 0,
            approved: d.stats.approved || 0,
            rejected: d.stats.rejected || 0,
            total: d.stats.total || 0
          },
          pending_reports: (d.pending_reports || []).map(p => ({
            id: p.id,
            target: p.target,
            type: p.type === 'Link' ? 'url' : p.type === 'SĐT' ? 'phone' : p.type === 'STK' ? 'bank_account' : (p.type || 'url').toLowerCase(),
            date: p.created_at || new Date().toISOString()
          }))
        });
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) {
      console.warn("Failed to fetch user detail from backend, generating mock fallback.", err);
      const userPending = pendingReports.filter(r => r.email === usr.email || r.reporter.toLowerCase() === usr.name.toLowerCase());
      const dummyApprovedCount = usr.id === 'usr1' ? 7 : usr.id === 'usr2' ? 3 : usr.id === 'usr4' ? 14 : 0;
      const dummyRejectedCount = usr.id === 'usr1' ? 1 : usr.id === 'usr2' ? 0 : usr.id === 'usr4' ? 5 : 0;

      setUserDetailData({
        user: {
          id: usr.id,
          name: usr.name,
          email: usr.email,
          role: usr.role,
          status: usr.status,
          joined: usr.joined
        },
        stats: {
          pending: userPending.length,
          approved: dummyApprovedCount,
          rejected: dummyRejectedCount,
          total: userPending.length + dummyApprovedCount + dummyRejectedCount
        },
        pending_reports: userPending.map(p => ({
          id: p.id,
          target: p.target,
          type: p.type,
          date: p.date
        }))
      });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Filtered Users List
  const filteredUsers = users.filter(u => {
    const name = u.name || '';
    const email = u.email || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === 'all' || u.role.toLowerCase() === filterRole.toLowerCase();
    const matchesStatus = filterStatus === 'all' || u.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const startIdx = (usersPage - 1) * usersLimit;
  const paginatedUsers = filteredUsers.slice(startIdx, startIdx + usersLimit);
  const totalPages = Math.ceil(filteredUsers.length / usersLimit) || 1;

  const getAvatarInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 1).toUpperCase();
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
                placeholder="Tìm kiếm thành viên..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setUsersPage(1); }}
                style={{ height: '40px', fontSize: '0.9rem', borderRadius: '6px', paddingLeft: '3rem', border: 'none', background: '#f5f8fa', color: '#5e6278', outline: 'none' }}
              />
            </div>
          </div>

          {/* Card toolbar */}
          <div className="card-toolbar">
            <div className="d-flex justify-content-end" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {/* Filter Button */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="btn btn-light-primary me-3"
                  onClick={() => setShowFilterPopover(!showFilterPopover)}
                >
                  Bộ lọc
                </button>
                {showFilterPopover && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '48px',
                    width: '240px',
                    background: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                    border: '1px solid #eff2f5',
                    padding: '1.25rem',
                    zIndex: 200,
                    textAlign: 'left'
                  }}>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', fontWeight: 700 }}>Tùy chọn lọc</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div className="profile-field-group">
                        <label className="profile-field-label">Quyền hạn</label>
                        <select className="profile-field-input" value={filterRole} onChange={(e) => { setFilterRole(e.target.value); setUsersPage(1); }} style={{ height: '34px', fontSize: '0.78rem' }}>
                          <option value="all">Tất cả</option>
                          <option value="admin">Admin</option>
                          <option value="moderator">Moderator</option>
                          <option value="user">User</option>
                        </select>
                      </div>
                      <div className="profile-field-group">
                        <label className="profile-field-label">Trạng thái</label>
                        <select className="profile-field-input" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setUsersPage(1); }} style={{ height: '34px', fontSize: '0.78rem' }}>
                          <option value="all">Tất cả</option>
                          <option value="active">Hoạt động</option>
                          <option value="banned">Bị khóa</option>
                        </select>
                      </div>
                      <button className="btn btn-secondary" onClick={() => { setFilterRole('all'); setFilterStatus('all'); setShowFilterPopover(false); }} style={{ height: '32px', fontSize: '0.75rem', width: '100%' }}>
                        Đặt lại bộ lọc
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Export Button */}
              <button type="button" className="btn btn-light-primary me-3" onClick={handleExportCSV}>
                Xuất file CSV
              </button>

              {/* Add User Button */}
              <button type="button" className="btn btn-primary" onClick={() => setIsAddUserOpen(true)}>
                Thêm Thành Viên
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Action Header bar */}
        {selectedUserIds.length > 0 && (
          <div style={{
            background: 'rgba(0, 158, 247, 0.05)',
            border: '1px solid rgba(0, 158, 247, 0.15)',
            borderRadius: '8px',
            padding: '0.85rem 1.25rem',
            margin: '0 2.25rem 1.25rem 2.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#009ef7' }}>
              Đã chọn {selectedUserIds.length} tài khoản thành viên
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={handleBulkBan} style={{ height: '32px', fontSize: '0.75rem', background: '#fff', color: '#ffc700' }}>
                Khóa hàng loạt
              </button>
              <button className="btn btn-secondary" onClick={handleBulkDelete} style={{ height: '32px', fontSize: '0.75rem', background: '#fff', color: '#f1416c' }}>
                Xóa hàng loạt
              </button>
              <button className="btn btn-secondary" onClick={() => setSelectedUserIds([])} style={{ height: '32px', fontSize: '0.75rem', background: '#fff' }}>
                Hủy bỏ
              </button>
            </div>
          </div>
        )}

        {/* Card body */}
        <div className="card-body py-4">
          <div className="table-responsive">
            <table className="table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer">
              <thead>
                <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0" style={{ borderBottom: '1px solid #eff2f5' }}>
                  <th style={{ width: '45px', padding: '1rem 1.5rem' }}>
                    <input
                      type="checkbox"
                      style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                      checked={users.length > 0 && selectedUserIds.length === users.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th style={{ width: '250px' }}>Thành Viên</th>
                  <th style={{ width: '120px' }}>Quyền Hạn</th>
                  <th style={{ width: '150px' }}>Địa Chỉ IP</th>
                  <th style={{ width: '180px' }}>Ngày Tham Gia</th>
                  <th style={{ width: '120px' }}>Trạng Thái</th>
                  <th className="text-end" style={{ width: '120px', textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 fw-semibold">
                {isLoadingUsers ? (
                  <tr>
                    <td colSpan="7" className="text-center" style={{ padding: '3rem', textAlign: 'center', color: '#a1a5b7' }}>
                      Đang tải danh sách thành viên...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center" style={{ padding: '3rem', textAlign: 'center', color: '#a1a5b7' }}>
                      Không tìm thấy thành viên nào.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((usr, index) => {
                    const isChecked = selectedUserIds.includes(usr.id);
                    const isDropdownOpen = activeDropdownUserId === usr.id;

                    return (
                      <tr key={usr.id} className={index % 2 === 0 ? 'odd' : 'even'}>
                        {/* Checkbox */}
                        <td>
                          <input
                            type="checkbox"
                            style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                            checked={isChecked}
                            onChange={() => handleSelectOne(usr.id)}
                          />
                        </td>

                        {/* Name & Avatar */}
                        <td style={{ display: 'flex', alignItems: 'center', borderBottom: 'none' }}>
                          <div className="symbol symbol-circle symbol-50px overflow-hidden me-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0, marginRight: '0.75rem' }}>
                            <div className={`symbol-label fs-3 ${index % 2 === 0 ? 'bg-light-danger text-danger' : 'bg-light-primary text-primary'}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', fontWeight: 700, fontSize: '0.9rem' }}>
                              {getAvatarInitials(usr.name)}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className="text-gray-800 text-hover-primary mb-1" style={{ fontWeight: 700, color: '#181c32', fontSize: '0.9rem' }}>
                              {usr.name}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: '#a1a5b7' }}>{usr.email}</span>
                          </div>
                        </td>

                        {/* Role */}
                        <td>
                          <span className="badge badge-light" style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                            {usr.role}
                          </span>
                        </td>

                        {/* IP Address */}
                        <td>
                          <span style={{ fontSize: '0.85rem', color: '#5e6278', fontFamily: 'monospace' }}>
                            {usr.ipAddress}
                          </span>
                        </td>

                        {/* Joined Date */}
                        <td>
                          <span style={{ fontSize: '0.82rem', color: '#7e8299' }}>
                            {formatJoinedDate(usr.joined)}
                          </span>
                        </td>

                        {/* Status */}
                        <td>
                          <span className={`badge ${usr.status === 'active' ? 'badge-light-success' : 'badge-light'}`}>
                            {usr.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="text-end" style={{ textAlign: 'right', position: 'relative' }}>
                          <div style={{ display: 'inline-block' }}>
                            <button
                              type="button"
                              className="btn btn-light btn-active-light-primary btn-flex btn-center btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownUserId(isDropdownOpen ? null : usr.id);
                              }}
                            >
                              Actions <ChevronDown size={12} style={{ marginLeft: '0.25rem', color: '#a1a5b7' }} />
                            </button>

                            {isDropdownOpen && (
                              <div
                                ref={dropdownRef}
                                style={{
                                  position: 'absolute',
                                  right: 0,
                                  top: '36px',
                                  width: '150px',
                                  background: '#ffffff',
                                  border: '1px solid #eff2f5',
                                  borderRadius: '6px',
                                  boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                                  zIndex: 100,
                                  padding: '0.5rem 0',
                                  textAlign: 'left'
                                }}
                              >
                                <button
                                  className="dropdown-item-btn"
                                  onClick={() => handleOpenUserDetail(usr)}
                                  style={{ width: '100%', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.8rem', cursor: 'pointer', color: '#3f4254' }}
                                >
                                  Xem chi tiết
                                </button>
                                <button
                                  className="dropdown-item-btn"
                                  onClick={() => handleChangeUserRole(usr.id, usr.name, usr.role)}
                                  style={{ width: '100%', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.8rem', cursor: 'pointer', color: '#3f4254' }}
                                >
                                  Đổi vai trò
                                </button>
                                <button
                                  className="dropdown-item-btn"
                                  onClick={() => handleToggleUserBan(usr.id, usr.name, usr.status)}
                                  style={{ width: '100%', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.8rem', cursor: 'pointer', color: usr.status === 'active' ? '#f1416c' : '#50cd89' }}
                                >
                                  {usr.status === 'active' ? 'Khóa thẻ' : 'Mở khóa'}
                                </button>
                                <hr style={{ border: 'none', borderTop: '1px solid #eff2f5', margin: '0.25rem 0' }} />
                                <button
                                  className="dropdown-item-btn"
                                  onClick={() => handleDeleteUser(usr.id, usr.name)}
                                  style={{ width: '100%', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.8rem', cursor: 'pointer', color: '#f1416c' }}
                                >
                                  Xóa vĩnh viễn
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="row" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="col-sm-12 col-md-5 d-flex align-items-center justify-content-center justify-content-md-start" style={{ color: '#a1a5b7', fontSize: '0.85rem' }}>
              Hiển thị {filteredUsers.length > 0 ? startIdx + 1 : 0} - {Math.min(startIdx + usersLimit, filteredUsers.length)} trong tổng số {filteredUsers.length} thành viên
            </div>
            <div className="col-sm-12 col-md-7 d-flex align-items-center justify-content-center justify-content-md-end" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div className="dataTables_paginate paging_simple_numbers">
                <ul className="pagination" style={{ display: 'flex', listStyle: 'none', padding: 0, gap: '0.25rem', margin: 0 }}>
                  <li className={`paginate_button page-item previous ${usersPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      disabled={usersPage === 1}
                      onClick={() => setUsersPage(prev => Math.max(prev - 1, 1))}
                    >
                      &lt;
                    </button>
                  </li>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const p = i + 1;
                    return (
                      <li key={p} className={`paginate_button page-item ${usersPage === p ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => setUsersPage(p)}>
                          {p}
                        </button>
                      </li>
                    );
                  })}

                  <li className={`paginate_button page-item next ${usersPage >= totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      disabled={usersPage >= totalPages}
                      onClick={() => setUsersPage(prev => Math.min(prev + 1, totalPages))}
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
      {/* ADD USER MODAL */}
      {/* ======================================================== */}
      {isAddUserOpen && (
        <div className="signature-modal-overlay">
          <form className="signature-modal" style={{ maxWidth: '520px', width: '90%', textAlign: 'left' }} onSubmit={handleAddUserSubmit}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f3f9', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 className="signature-modal-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={20} style={{ color: '#009ef7' }} />
                Tạo Tài Khoản Mới
              </h3>
              <button type="button" onClick={() => setIsAddUserOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#a1a5b7' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="profile-field-group">
                <label className="profile-field-label">Họ và tên <span style={{ color: '#f1416c' }}>*</span></label>
                <input type="text" className="profile-field-input" placeholder="Nguyễn Văn A" value={addName} onChange={(e) => setAddName(e.target.value)} required />
              </div>

              <div className="profile-field-group">
                <label className="profile-field-label">Địa chỉ Email <span style={{ color: '#f1416c' }}>*</span></label>
                <input type="email" className="profile-field-input" placeholder="nguyenvana@gmail.com" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="profile-field-group">
                  <label className="profile-field-label">Username</label>
                  <input type="text" className="profile-field-input" placeholder="vana_nguyen" value={addUsername} onChange={(e) => setAddUsername(e.target.value)} />
                </div>
                <div className="profile-field-group">
                  <label className="profile-field-label">Mật khẩu <span style={{ color: '#f1416c' }}>*</span></label>
                  <input type="password" className="profile-field-input" placeholder="••••••••" value={addPassword} onChange={(e) => setAddPassword(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="profile-field-group">
                  <label className="profile-field-label">Quyền hạn (Role)</label>
                  <select className="profile-field-input" value={addRole} onChange={(e) => setAddRole(e.target.value)} style={{ background: '#f5f8fa', cursor: 'pointer' }}>
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="profile-field-group">
                  <label className="profile-field-label">Địa chỉ IP khởi tạo</label>
                  <input type="text" className="profile-field-input" placeholder="127.0.0.1" value={addIP} onChange={(e) => setAddIP(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="signature-actions" style={{ borderTop: '1px solid #f1f3f9', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsAddUserOpen(false)}>
                Hủy bỏ
              </button>
              <button type="submit" className="btn btn-primary">
                Tạo tài khoản
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* USER DETAILS MODAL */}
      {/* ======================================================== */}
      {activeUserDetail && (
        <div className="signature-modal-overlay">
          <div className="signature-modal" style={{ maxWidth: '850px', width: '90%', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f3f9', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 className="signature-modal-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={20} style={{ color: '#009ef7' }} />
                Chi Tiết Thành Viên & Thống Kê
              </h3>
              <button type="button" onClick={() => { setActiveUserDetail(null); setUserDetailData(null); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#a1a5b7' }}>
                <X size={18} />
              </button>
            </div>

            {isLoadingDetail ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem' }}>
                <RefreshCw size={24} className="animate-spin" style={{ color: '#009ef7' }} />
                <span style={{ fontSize: '0.88rem', color: '#64748b' }}>Đang tải thống kê từ máy chủ...</span>
              </div>
            ) : userDetailData ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.75rem' }}>
                
                {/* Account info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <span className="profile-field-label" style={{ borderBottom: '1px solid #eff2f5', paddingBottom: '0.35rem', color: '#009ef7' }}>Thông tin cơ bản</span>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f5f8fa', padding: '1rem', borderRadius: '8px', border: '1px solid #eff2f5' }}>
                    <div>
                      <span className="profile-field-label">Họ và tên</span>
                      <strong style={{ fontSize: '0.88rem', color: '#181c32', display: 'block', marginTop: '0.15rem' }}>{userDetailData.user.name}</strong>
                    </div>
                    <div>
                      <span className="profile-field-label">Email</span>
                      <strong style={{ fontSize: '0.82rem', color: '#181c32', display: 'block', marginTop: '0.15rem', wordBreak: 'break-all' }}>{userDetailData.user.email}</strong>
                    </div>
                    <div>
                      <span className="profile-field-label">Vai trò</span>
                      <div style={{ marginTop: '0.2rem' }}>
                        <span className="badge badge-light" style={{ textTransform: 'uppercase', fontSize: '0.68rem', fontWeight: 'bold' }}>
                          {userDetailData.user.role}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="profile-field-label">Trạng thái</span>
                      <div style={{ marginTop: '0.2rem' }}>
                        <span className={`badge ${userDetailData.user.status === 'active' ? 'badge-light-success' : 'badge-light'}`} style={{ fontSize: '0.68rem', fontWeight: 'bold' }}>
                          {userDetailData.user.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                        </span>
                      </div>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <span className="profile-field-label">Ngày tham gia</span>
                      <span style={{ fontSize: '0.82rem', color: '#5e6278', display: 'block', marginTop: '0.15rem' }}>
                        {formatJoinedDate(activeUserDetail.joined)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="profile-field-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Thống kê lượt tố cáo gửi lên</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
                      <div style={{ background: '#fff8dd', padding: '0.65rem 0.5rem', borderRadius: '6px', border: '1px solid #ffebcd' }}>
                        <span style={{ fontSize: '0.65rem', color: '#ffc700', fontWeight: 'bold', textTransform: 'uppercase' }}>Chờ duyệt</span>
                        <strong style={{ fontSize: '1.15rem', color: '#ffc700', display: 'block' }}>{userDetailData.stats.pending}</strong>
                      </div>
                      <div style={{ background: '#e8fff3', padding: '0.65rem 0.5rem', borderRadius: '6px', border: '1px solid #c1f0d0' }}>
                        <span style={{ fontSize: '0.65rem', color: '#50cd89', fontWeight: 'bold', textTransform: 'uppercase' }}>Đã duyệt</span>
                        <strong style={{ fontSize: '1.15rem', color: '#50cd89', display: 'block' }}>{userDetailData.stats.approved}</strong>
                      </div>
                      <div style={{ background: '#fff5f8', padding: '0.65rem 0.5rem', borderRadius: '6px', border: '1px solid #fcd2d9' }}>
                        <span style={{ fontSize: '0.65rem', color: '#f1416c', fontWeight: 'bold', textTransform: 'uppercase' }}>Từ chối</span>
                        <strong style={{ fontSize: '1.15rem', color: '#f1416c', display: 'block' }}>{userDetailData.stats.rejected}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reports list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderLeft: '1px solid #eff2f5', paddingLeft: '1.5rem' }}>
                  <span className="profile-field-label" style={{ borderBottom: '1px solid #eff2f5', paddingBottom: '0.35rem', color: '#f59e0b' }}>Các báo cáo chờ xử lý</span>
                  {userDetailData.pending_reports.length === 0 ? (
                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f5f8fa', border: '1px dashed #eff2f5', borderRadius: '8px', padding: '2rem', textAlign: 'center', color: '#a1a5b7', fontSize: '0.8rem', minHeight: '180px' }}>
                      Thành viên này hiện không có báo cáo nào đang chờ xử lý.
                    </div>
                  ) : (
                    <div style={{ overflowY: 'auto', border: '1px solid #eff2f5', borderRadius: '8px', maxHeight: '300px' }}>
                      <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#f5f8fa', borderBottom: '1px solid #eff2f5', textAlign: 'left' }}>
                            <th style={{ padding: '0.6rem 0.75rem', fontWeight: 700 }}>Đối tượng</th>
                            <th style={{ padding: '0.6rem 0.75rem', fontWeight: 700 }}>Phân loại</th>
                            <th style={{ padding: '0.6rem 0.75rem', fontWeight: 700 }}>Thời gian</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userDetailData.pending_reports.map(p => (
                            <tr key={p.id} style={{ borderBottom: '1px solid #eff2f5' }}>
                              <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: '#009ef7', wordBreak: 'break-all' }}>{p.target}</td>
                              <td style={{ padding: '0.6rem 0.75rem' }}>
                                <span className="badge badge-light" style={{ fontSize: '0.62rem', textTransform: 'uppercase' }}>
                                  {p.type === 'url' ? 'Tên miền' : p.type === 'phone' ? 'SĐT' : 'Tài khoản'}
                                </span>
                              </td>
                              <td style={{ padding: '0.6rem 0.75rem', color: '#7e8299' }}>
                                {new Date(p.date || p.created_at).toLocaleDateString('vi-VN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            ) : null}

            <div className="signature-actions" style={{ borderTop: '1px solid #f1f3f9', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setActiveUserDetail(null);
                  setUserDetailData(null);
                }}
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
