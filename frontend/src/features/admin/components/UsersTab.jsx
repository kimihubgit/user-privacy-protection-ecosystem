import { useState, useEffect, useRef } from 'react';
import { 
  Search, Eye, RefreshCw, ShieldX, UserCheck, Users, Activity, 
  ShieldAlert, Plus, Download, SlidersHorizontal, Trash2, 
  MoreHorizontal, X, UserPlus, ChevronLeft, ChevronRight 
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

  // Fetch users list from backend API or local fallback
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const res = await api.getAdminUsers(token, usersPage, usersLimit, searchQuery);
        if (res && res.success && res.data) {
          const userList = Array.isArray(res.data) ? res.data : (res.data.users || []);
          
          const mappedUsers = userList.map(u => ({
            id: u.id || u._id || ('usr_' + Math.random()),
            name: u.name || u.username,
            email: u.email,
            role: (u.role || 'user').toLowerCase(),
            status: u.status || 'active',
            joined: u.created_at || '2026-06-01T00:00:00Z',
            ipAddress: u.ip_address || u.ipAddress || (['113.161.43.12', '234.243.222.23', '127.0.0.1', '14.232.192.1'][Math.floor(Math.random() * 4)])
          }));

          setUsers(mappedUsers);
          if (res.data.total) {
            setUsersTotal(res.data.total);
          } else if (res.total) {
            setUsersTotal(res.total);
          } else {
            setUsersTotal(mappedUsers.length);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch users from backend, using local/mock list.", err);
        // Local fallback filtering
        const saved = localStorage.getItem('admin_users');
        if (saved) {
          try {
            const list = JSON.parse(saved);
            const filtered = list.filter(u => 
              u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
              u.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
            
            // Map default fields if missing
            const fullyMapped = filtered.map(u => ({
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
  }, [searchQuery, usersPage, usersLimit, token, setUsers]);

  // Format date helper to matching layout representation: e.g. "19 Aug 2023, 5:30 pm"
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
      hours = hours ? hours : 12; // 0 should be 12
      const minStr = minutes < 10 ? '0' + minutes : minutes;
      
      return `${day} ${month} ${year}, ${hours}:${minStr} ${ampm}`;
    } catch (e) {
      return dateStr;
    }
  };

  // Toggle user ban
  const handleToggleUserBan = (id, name, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'banned' : 'active';
    const msg = nextStatus === 'banned' ? 'Khóa tài khoản' : 'Mở khóa tài khoản';
    if (window.confirm(`Bạn có chắc chắn muốn ${msg.toLowerCase()} "${name}"?`)) {
      const updatedList = users.map(u => u.id === id ? { ...u, status: nextStatus } : u);
      saveUsers(updatedList);
      addAuditLog(msg, name, `${msg} thành viên trong hệ thống.`);
      if (addToast) addToast(`Đã ${nextStatus === 'banned' ? 'khóa' : 'kích hoạt'} tài khoản "${name}".`, 'info');
      setActiveDropdownUserId(null);
    }
  };

  // Change user role
  const handleChangeUserRole = (id, name, currentRole) => {
    const roles = ['user', 'moderator', 'admin'];
    const nextIndex = (roles.indexOf(currentRole) + 1) % roles.length;
    const nextRole = roles[nextIndex];

    const updatedList = users.map(u => u.id === id ? { ...u, role: nextRole } : u);
    saveUsers(updatedList);
    addAuditLog('Đổi Quyền hạn', name, `Thay đổi quyền hạn thành viên thành: ${nextRole.toUpperCase()}`);
    if (addToast) addToast(`Đã thay đổi quyền hạn của "${name}" thành ${nextRole.toUpperCase()}.`, 'success');
    setActiveDropdownUserId(null);
  };

  // Delete individual user
  const handleDeleteUser = (id, name) => {
    if (window.confirm(`Bạn có chắc muốn XÓA VĨNH VIỄN tài khoản "${name}" khỏi hệ thống?`)) {
      const updatedList = users.filter(u => u.id !== id);
      saveUsers(updatedList);
      addAuditLog('Xóa thành viên', name, `Xóa tài khoản thành viên vĩnh viễn.`);
      if (addToast) addToast(`Đã xóa tài khoản "${name}" thành công!`, 'warning');
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
  const handleBulkBan = () => {
    if (selectedUserIds.length === 0) return;
    if (window.confirm(`Khóa hàng loạt ${selectedUserIds.length} tài khoản đã chọn?`)) {
      const updatedList = users.map(u => 
        selectedUserIds.includes(u.id) ? { ...u, status: 'banned' } : u
      );
      saveUsers(updatedList);
      addAuditLog('Khóa hàng loạt', `${selectedUserIds.length} tài khoản`, 'Cập nhật trạng thái khóa hàng loạt.');
      if (addToast) addToast(`Đã khóa thành công ${selectedUserIds.length} tài khoản.`, 'info');
      setSelectedUserIds([]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedUserIds.length === 0) return;
    if (window.confirm(`XÓA VĨNH VIỄN ${selectedUserIds.length} tài khoản đã chọn?`)) {
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

  // Fetch user detailed statistics and reports
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
      // Fallback local calculation
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

  // Get Role Label
  const getRoleLabel = (role) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'Administrator';
      case 'moderator':
        return 'Analyst'; // Displays Analyst as requested in the design
      default:
        return 'User';
    }
  };

  // Filtered Users List (Local Search + Filters)
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filterRole === 'all' || u.role.toLowerCase() === filterRole.toLowerCase();
    const matchesStatus = filterStatus === 'all' || u.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination bounds
  const startIdx = (usersPage - 1) * usersLimit;
  const paginatedUsers = filteredUsers.slice(startIdx, startIdx + usersLimit);
  const totalPages = Math.ceil(filteredUsers.length / usersLimit) || 1;

  // Simple Avatar Initials Generator
  const getAvatarInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 1).toUpperCase();
  };

  // Simple Avatar Color Generator
  const getAvatarBgColor = (name) => {
    if (!name) return '#009ef7';
    const colors = ['#23b56c', '#009ef7', '#7239ea', '#f1416c', '#f59e0b', '#ec4899', '#8b5cf6'];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  return (
    <div className="admin-tab-view animate-fade-in">
      <div className="db-panel-card" style={{ padding: '2rem' }}>
        
        {/* Metronic Custom Toolbar Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '1rem', 
          marginBottom: '2rem' 
        }}>
          {/* Left search */}
          <div className="report-input-wrap header-search-box" style={{ maxWidth: '280px', margin: 0 }}>
            <Search size={16} className="report-input-icon" style={{ color: '#a1a5b7' }} />
            <input
              type="text"
              className="report-input"
              placeholder="Search user"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setUsersPage(1); }}
              style={{ 
                height: '42px', 
                fontSize: '0.85rem', 
                borderRadius: '8px', 
                background: '#f9f9fb', 
                border: '1px solid #eff2f5',
                paddingLeft: '2.5rem',
                color: '#181c32'
              }}
            />
          </div>

          {/* Right Action buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {/* Filter Toggle */}
            <div style={{ position: 'relative' }}>
              <button
                className="btn"
                onClick={() => setShowFilterPopover(!showFilterPopover)}
                style={{ 
                  background: '#f1f8fe', 
                  color: '#009ef7', 
                  border: 'none', 
                  padding: '0.6rem 1.25rem', 
                  borderRadius: '8px', 
                  fontWeight: '600', 
                  fontSize: '0.82rem', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem',
                  height: '42px'
                }}
              >
                <SlidersHorizontal size={14} />
                <span>Filter</span>
              </button>

              {showFilterPopover && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '48px',
                  width: '260px',
                  background: '#fff',
                  borderRadius: '8px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                  border: '1px solid #eff2f5',
                  padding: '1.25rem',
                  zIndex: 200
                }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', fontWeight: 700 }}>Filter Options</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    
                    <div className="profile-field-group">
                      <label className="profile-field-label" style={{ fontSize: '0.65rem' }}>Quyền hạn (Role)</label>
                      <select 
                        className="profile-field-input"
                        value={filterRole}
                        onChange={(e) => { setFilterRole(e.target.value); setUsersPage(1); }}
                        style={{ height: '34px', fontSize: '0.78rem' }}
                      >
                        <option value="all">All Roles</option>
                        <option value="admin">Administrator</option>
                        <option value="moderator">Analyst</option>
                        <option value="user">User</option>
                      </select>
                    </div>

                    <div className="profile-field-group">
                      <label className="profile-field-label" style={{ fontSize: '0.65rem' }}>Trạng thái (Status)</label>
                      <select 
                        className="profile-field-input"
                        value={filterStatus}
                        onChange={(e) => { setFilterStatus(e.target.value); setUsersPage(1); }}
                        style={{ height: '34px', fontSize: '0.78rem' }}
                      >
                        <option value="all">All Statuses</option>
                        <option value="active">Hoạt động</option>
                        <option value="banned">Đang khóa</option>
                      </select>
                    </div>

                    <button 
                      className="btn btn-secondary"
                      onClick={() => { setFilterRole('all'); setFilterStatus('all'); setShowFilterPopover(false); }}
                      style={{ height: '32px', fontSize: '0.75rem', marginTop: '0.5rem', width: '100%' }}
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Export */}
            <button
              className="btn"
              onClick={handleExportCSV}
              style={{ 
                background: '#f1f8fe', 
                color: '#009ef7', 
                border: 'none', 
                padding: '0.6rem 1.25rem', 
                borderRadius: '8px', 
                fontWeight: '600', 
                fontSize: '0.82rem', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem',
                height: '42px'
              }}
            >
              <Download size={14} />
              <span>Export</span>
            </button>

            {/* Add User */}
            <button
              className="btn"
              onClick={() => setIsAddUserOpen(true)}
              style={{ 
                background: '#009ef7', 
                color: '#ffffff', 
                border: 'none', 
                padding: '0.6rem 1.25rem', 
                borderRadius: '8px', 
                fontWeight: '600', 
                fontSize: '0.82rem', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem',
                height: '42px'
              }}
            >
              <Plus size={16} />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Bulk Action Header bar */}
        {selectedUserIds.length > 0 && (
          <div style={{
            background: 'rgba(0, 158, 247, 0.05)',
            border: '1px solid rgba(0, 158, 247, 0.15)',
            borderRadius: '8px',
            padding: '0.85rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#009ef7' }}>
              Đã chọn {selectedUserIds.length} tài khoản thành viên
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn btn-secondary"
                onClick={handleBulkBan}
                style={{ height: '32px', fontSize: '0.75rem', background: '#fff', color: '#ffc700' }}
              >
                Khóa hàng loạt
              </button>
              <button 
                className="btn btn-secondary"
                onClick={handleBulkDelete}
                style={{ height: '32px', fontSize: '0.75rem', background: '#fff', color: '#f1416c' }}
              >
                Xóa hàng loạt
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setSelectedUserIds([])}
                style={{ height: '32px', fontSize: '0.75rem', background: '#fff' }}
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        )}

        {/* Datatable Table View */}
        {isLoadingUsers ? (
          <div style={{ padding: '5rem', textAlign: 'center', color: '#a1a5b7' }}>
            <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 1rem auto', color: '#009ef7' }} />
            <span>Đang tải thông tin thành viên...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '5rem', textAlign: 'center', color: '#a1a5b7', border: '1px dashed #eff2f5', borderRadius: '8px' }}>
            Không tìm thấy thành viên nào phù hợp trong bộ lọc.
          </div>
        ) : (
          <div style={{ overflowX: 'auto', margin: '0 -1.5rem' }}>
            <table className="db-reports-table" style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #eff2f5', textAlign: 'left' }}>
                  <th style={{ width: '45px', padding: '1rem 1.5rem' }}>
                    <input
                      type="checkbox"
                      style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                      checked={users.length > 0 && selectedUserIds.length === users.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th style={{ color: '#b5b5c3', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', padding: '1rem' }}>User</th>
                  <th style={{ color: '#b5b5c3', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', padding: '1rem' }}>Role</th>
                  <th style={{ color: '#b5b5c3', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', padding: '1rem' }}>IP Address</th>
                  <th style={{ color: '#b5b5c3', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', padding: '1rem' }}>Joined Date</th>
                  <th style={{ color: '#b5b5c3', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map(usr => {
                  const isChecked = selectedUserIds.includes(usr.id);
                  const isDropdownOpen = activeDropdownUserId === usr.id;
                  
                  return (
                    <tr key={usr.id} style={{ 
                      borderBottom: '1px solid #eff2f5', 
                      backgroundColor: isChecked ? 'rgba(0, 158, 247, 0.02)' : 'transparent',
                      transition: 'background 0.15s ease'
                    }}>
                      {/* Checkbox cell */}
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <input
                          type="checkbox"
                          style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                          checked={isChecked}
                          onChange={() => handleSelectOne(usr.id)}
                        />
                      </td>

                      {/* User Cell: Avatar, Name, Email */}
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            color: '#ffffff',
                            backgroundColor: getAvatarBgColor(usr.name),
                            boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                          }}>
                            {getAvatarInitials(usr.name)}
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong style={{ 
                              color: usr.status === 'banned' ? '#a1a5b7' : '#181c32', 
                              fontSize: '0.88rem', 
                              fontFamily: 'var(--font-display)',
                              textDecoration: usr.status === 'banned' ? 'line-through' : 'none'
                            }}>
                              {usr.name}
                            </strong>
                            <span style={{ color: '#a1a5b7', fontSize: '0.78rem' }}>{usr.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role Cell */}
                      <td style={{ padding: '1rem', color: '#5e6278', fontSize: '0.85rem', fontWeight: 500 }}>
                        {getRoleLabel(usr.role)}
                      </td>

                      {/* IP Address Cell */}
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          display: 'inline-block',
                          backgroundColor: '#f5f8fa',
                          color: '#5e6278',
                          padding: '0.35rem 0.65rem',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontFamily: 'monospace',
                          fontWeight: 500
                        }}>
                          {usr.ipAddress}
                        </span>
                      </td>

                      {/* Joined Date Cell */}
                      <td style={{ padding: '1rem', color: '#7e8299', fontSize: '0.8rem' }}>
                        {formatJoinedDate(usr.joined)}
                      </td>

                      {/* Actions Dropdown Button */}
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right', position: 'relative' }}>
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setActiveDropdownUserId(isDropdownOpen ? null : usr.id); 
                          }}
                          style={{
                            background: '#f5f8fa',
                            border: 'none',
                            color: '#7e8299',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>Actions</span>
                          <span style={{ fontSize: '0.6rem' }}>▼</span>
                        </button>

                        {/* Absolutely positioned dropdown actions */}
                        {isDropdownOpen && (
                          <div 
                            ref={dropdownRef}
                            style={{
                              position: 'absolute',
                              right: '24px',
                              top: '48px',
                              width: '180px',
                              background: '#ffffff',
                              border: '1px solid #eff2f5',
                              boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                              borderRadius: '8px',
                              padding: '0.5rem 0',
                              zIndex: 150,
                              textAlign: 'left',
                              animation: 'fadeIn 0.15s ease-out'
                            }}
                          >
                            <button
                              onClick={() => handleOpenUserDetail(usr)}
                              style={{
                                width: '100%',
                                border: 'none',
                                background: 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.6rem 1rem',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                color: '#181c32'
                              }}
                            >
                              <Eye size={14} style={{ color: '#009ef7' }} />
                              <span>Xem chi tiết</span>
                            </button>

                            <button
                              onClick={() => handleChangeUserRole(usr.id, usr.name, usr.role)}
                              style={{
                                width: '100%',
                                border: 'none',
                                background: 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.6rem 1rem',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                color: '#181c32'
                              }}
                            >
                              <RefreshCw size={14} style={{ color: '#7239ea' }} />
                              <span>Đổi vai trò</span>
                            </button>

                            <button
                              onClick={() => handleToggleUserBan(usr.id, usr.name, usr.status)}
                              style={{
                                width: '100%',
                                border: 'none',
                                background: 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.6rem 1rem',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                color: usr.status === 'active' ? '#f1416c' : '#23b56c'
                              }}
                            >
                              {usr.status === 'active' ? (
                                <>
                                  <ShieldX size={14} />
                                  <span>Khóa tài khoản</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck size={14} />
                                  <span>Mở khóa</span>
                                </>
                              )}
                            </button>

                            <div style={{ borderTop: '1px solid #f1f3f9', margin: '0.25rem 0' }}></div>

                            <button
                              onClick={() => handleDeleteUser(usr.id, usr.name)}
                              style={{
                                width: '100%',
                                border: 'none',
                                background: 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.6rem 1rem',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                color: '#f1416c'
                              }}
                            >
                              <Trash2 size={14} />
                              <span>Xóa thành viên</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Metronic Custom Pagination Toolbar */}
        {totalPages > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginTop: '2rem', 
            borderTop: '1px solid #eff2f5', 
            paddingTop: '1.5rem' 
          }}>
            <span style={{ fontSize: '0.82rem', color: '#b5b5c3', fontWeight: 500 }}>
              Hiển thị {startIdx + 1} - {Math.min(startIdx + usersLimit, filteredUsers.length)} trong tổng số {filteredUsers.length} thành viên
            </span>
            
            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              {/* Previous page */}
              <button
                disabled={usersPage === 1}
                onClick={() => setUsersPage(prev => Math.max(prev - 1, 1))}
                style={{
                  border: 'none',
                  background: usersPage === 1 ? '#f5f8fa' : '#f1f8fe',
                  color: usersPage === 1 ? '#b5b5c3' : '#009ef7',
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: usersPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: usersPage === 1 ? 0.6 : 1
                }}
              >
                <ChevronLeft size={16} />
              </button>

              {/* Page indices */}
              {Array.from({ length: totalPages }).map((_, index) => {
                const pNum = index + 1;
                const isActive = usersPage === pNum;
                
                return (
                  <button
                    key={pNum}
                    onClick={() => setUsersPage(pNum)}
                    style={{
                      border: 'none',
                      background: isActive ? '#009ef7' : 'transparent',
                      color: isActive ? '#ffffff' : '#5e6278',
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {pNum}
                  </button>
                );
              })}

              {/* Next page */}
              <button
                disabled={usersPage >= totalPages}
                onClick={() => setUsersPage(prev => Math.min(prev + 1, totalPages))}
                style={{
                  border: 'none',
                  background: usersPage >= totalPages ? '#f5f8fa' : '#f1f8fe',
                  color: usersPage >= totalPages ? '#b5b5c3' : '#009ef7',
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: usersPage >= totalPages ? 'not-allowed' : 'pointer',
                  opacity: usersPage >= totalPages ? 0.6 : 1
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
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
                Add New User
              </h3>
              <button 
                type="button" 
                onClick={() => setIsAddUserOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#a1a5b7' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div className="profile-field-group">
                <label className="profile-field-label">Họ và tên (Name) <span style={{ color: '#f1416c' }}>*</span></label>
                <input
                  type="text"
                  className="profile-field-input"
                  placeholder="Emma Smith"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  required
                />
              </div>

              <div className="profile-field-group">
                <label className="profile-field-label">Địa chỉ Email <span style={{ color: '#f1416c' }}>*</span></label>
                <input
                  type="email"
                  className="profile-field-input"
                  placeholder="smith@kpmg.com"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="profile-field-group">
                  <label className="profile-field-label">Username</label>
                  <input
                    type="text"
                    className="profile-field-input"
                    placeholder="emma_smith"
                    value={addUsername}
                    onChange={(e) => setAddUsername(e.target.value)}
                  />
                </div>
                <div className="profile-field-group">
                  <label className="profile-field-label">Mật khẩu <span style={{ color: '#f1416c' }}>*</span></label>
                  <input
                    type="password"
                    className="profile-field-input"
                    placeholder="••••••••"
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="profile-field-group">
                  <label className="profile-field-label">Quyền hạn (Role)</label>
                  <select
                    className="profile-field-input"
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value)}
                    style={{ background: '#f5f8fa', cursor: 'pointer' }}
                  >
                    <option value="user">User</option>
                    <option value="moderator">Analyst</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                
                <div className="profile-field-group">
                  <label className="profile-field-label">Địa chỉ IP đăng nhập</label>
                  <input
                    type="text"
                    className="profile-field-input"
                    placeholder="3872.2342.123.12"
                    value={addIP}
                    onChange={(e) => setAddIP(e.target.value)}
                  />
                </div>
              </div>

            </div>

            <div className="signature-actions" style={{ borderTop: '1px solid #f1f3f9', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsAddUserOpen(false)}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Tạo tài khoản
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* USER DETAILS MODAL (SIDE-BY-SIDE) */}
      {/* ======================================================== */}
      {activeUserDetail && (
        <div className="signature-modal-overlay">
          <div className="signature-modal" style={{ maxWidth: '920px', width: '90%', textAlign: 'left' }}>
            <h3 className="signature-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <Users size={20} className="text-secondary" style={{ color: 'var(--secondary)' }} />
              Chi Tiết Thành Viên Hệ Thống
            </h3>

            {isLoadingDetail ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem' }}>
                <RefreshCw size={24} className="animate-spin" style={{ color: '#23b56c' }} />
                <span style={{ fontSize: '0.88rem', color: '#64748b' }}>Đang tải dữ liệu và thống kê từ máy chủ...</span>
              </div>
            ) : userDetailData ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                
                {/* Left Column: User Info & Statistics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Users size={14} color="#23b56c" /> Thông tin cơ bản
                  </h4>
                  
                  {/* Info grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--bg-card-subtle)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.1rem' }}>HỌ VÀ TÊN</span>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{userDetailData.user.name}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.1rem' }}>EMAIL</span>
                      <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{userDetailData.user.email}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.1rem' }}>VAI TRÒ</span>
                      <div>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.12rem 0.45rem',
                          borderRadius: '99px',
                          fontSize: '0.68rem',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          backgroundColor: userDetailData.user.role === 'admin' ? 'rgba(239, 68, 68, 0.15)' : userDetailData.user.role === 'moderator' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                          color: userDetailData.user.role === 'admin' ? '#ef4444' : userDetailData.user.role === 'moderator' ? '#f59e0b' : 'var(--text-secondary)'
                        }}>
                          {userDetailData.user.role}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.1rem' }}>TRẠNG THÁI</span>
                      <div>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.12rem 0.45rem',
                          borderRadius: '99px',
                          fontSize: '0.68rem',
                          fontWeight: 'bold',
                          backgroundColor: userDetailData.user.status === 'active' ? 'rgba(35, 181, 108, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: userDetailData.user.status === 'active' ? '#23b56c' : '#ef4444'
                        }}>
                          {userDetailData.user.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                        </span>
                      </div>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.1rem' }}>NGÀY GIA NHẬP</span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {formatJoinedDate(activeUserDetail.joined)}
                      </span>
                    </div>
                  </div>

                  {/* Reports statistics */}
                  <div>
                    <h4 style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Activity size={13} color="#23b56c" /> Thống kê báo cáo gửi lên
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
                        <div style={{ background: 'var(--bg-card-subtle)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Chờ duyệt</span>
                          <strong style={{ fontSize: '1rem', color: '#f59e0b' }}>{userDetailData.stats.pending}</strong>
                        </div>
                        <div style={{ background: 'var(--bg-card-subtle)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Đã duyệt (Đen)</span>
                          <strong style={{ fontSize: '1rem', color: '#23b56c' }}>{userDetailData.stats.approved}</strong>
                        </div>
                        <div style={{ background: 'var(--bg-card-subtle)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Từ chối</span>
                          <strong style={{ fontSize: '1rem', color: '#ef4444' }}>{userDetailData.stats.rejected}</strong>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', padding: '0.1rem 0' }}>
                        Tổng lượt tố cáo đã nhận: <strong style={{ color: 'var(--text-primary)' }}>{userDetailData.stats.total || (userDetailData.stats.pending + userDetailData.stats.approved + userDetailData.stats.rejected)} vụ</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Pending Reports List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ShieldAlert size={14} color="#d97706" /> Các báo cáo đang chờ xử lý
                  </h4>
                  {userDetailData.pending_reports.length === 0 ? (
                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card-subtle)', border: '1px dashed var(--border-color)', borderRadius: '8px', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', minHeight: '150px' }}>
                      Thành viên này hiện không có báo cáo nào đang chờ xử lý.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <div style={{ flexGrow: 1, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', maxHeight: '380px' }}>
                        <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse', background: 'var(--bg-card-main)' }}>
                          <thead>
                            <tr style={{ background: 'var(--bg-card-subtle)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', position: 'sticky', top: 0, zIndex: 1 }}>
                              <th style={{ padding: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Đối tượng</th>
                              <th style={{ padding: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Thể loại</th>
                              <th style={{ padding: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Thời gian</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userDetailData.pending_reports.map(p => (
                              <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color-light)' }}>
                                <td style={{ padding: '0.45rem 0.5rem', fontWeight: 'bold', color: 'var(--secondary)', wordBreak: 'break-all' }}>{p.target}</td>
                                <td style={{ padding: '0.45rem 0.5rem' }}>
                                  <span style={{
                                    display: 'inline-block',
                                    padding: '0.1rem 0.35rem',
                                    borderRadius: '4px',
                                    fontSize: '0.65rem',
                                    fontWeight: '500',
                                    backgroundColor: p.type === 'url' ? 'rgba(0, 180, 216, 0.15)' : p.type === 'phone' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                    color: p.type === 'url' ? '#00b4d8' : p.type === 'phone' ? '#f59e0b' : '#ef4444'
                                  }}>
                                    {p.type === 'url' ? 'Link' : p.type === 'phone' ? 'SĐT' : 'STK'}
                                  </span>
                                </td>
                                <td style={{ padding: '0.45rem 0.5rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(p.date || p.created_at).toLocaleDateString('vi-VN')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            <div className="signature-actions" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary report-nav-btn"
                onClick={() => {
                  setActiveUserDetail(null);
                  setUserDetailData(null);
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
