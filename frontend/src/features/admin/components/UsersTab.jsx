import { useState, useEffect } from 'react';
import { Search, Eye, RefreshCw, ShieldX, UserCheck, Users, Activity, ShieldAlert } from 'lucide-react';
import { api } from '../../../lib/api';

export default function UsersTab({ token, users, setUsers, saveUsers, addAuditLog, addToast, pendingReports }) {
  const [usersPage, setUsersPage] = useState(1);
  const usersLimit = 20;
  const [usersTotal, setUsersTotal] = useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // User Detail modal states
  const [activeUserDetail, setActiveUserDetail] = useState(null);
  const [userDetailData, setUserDetailData] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Fetch users list from backend API
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const res = await api.getAdminUsers(token, usersPage, usersLimit, searchQuery);
        if (res && res.success && res.data) {
          const userList = Array.isArray(res.data) ? res.data : (res.data.users || []);
          
          const mappedUsers = userList.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: (u.role || 'user').toLowerCase(),
            status: u.status || 'active',
            joined: u.created_at ? u.created_at.split('T')[0] : '2026-06-01'
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
            setUsers(filtered);
            setUsersTotal(filtered.length);
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

  // Toggle user ban
  const handleToggleUserBan = (id, name, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'banned' : 'active';
    const msg = nextStatus === 'banned' ? 'Khóa tài khoản' : 'Mở khóa tài khoản';
    if (window.confirm(`Bạn có chắc chắn muốn ${msg.toLowerCase()} "${name}"?`)) {
      saveUsers(users.map(u => u.id === id ? { ...u, status: nextStatus } : u));
      addAuditLog(msg, name, `${msg} thành viên trong hệ thống.`);
      if (addToast) addToast(`Đã ${nextStatus === 'banned' ? 'khóa' : 'kích hoạt'} tài khoản "${name}".`, 'info');
    }
  };

  // Change user role
  const handleChangeUserRole = (id, name, currentRole) => {
    const roles = ['user', 'moderator', 'admin'];
    const nextIndex = (roles.indexOf(currentRole) + 1) % roles.length;
    const nextRole = roles[nextIndex];

    saveUsers(users.map(u => u.id === id ? { ...u, role: nextRole } : u));
    addAuditLog('Đổi Quyền hạn', name, `Thay đổi quyền hạn thành viên thành: ${nextRole.toUpperCase()}`);
    if (addToast) addToast(`Đã thay đổi quyền hạn của "${name}" thành ${nextRole.toUpperCase()}.`, 'success');
  };

  // Fetch user detailed statistics and reports
  const handleOpenUserDetail = async (usr) => {
    setActiveUserDetail(usr);
    setIsLoadingDetail(true);
    setUserDetailData(null);
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

  return (
    <div className="admin-tab-view animate-fade-in">
      <div className="db-panel-card">
        <div className="db-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h3 className="db-card-title">Quản lý thành viên hệ thống</h3>
          
          {/* Internal Search box for users */}
          <div className="report-input-wrap header-search-box" style={{ maxWidth: '280px', margin: 0 }}>
            <Search size={14} className="report-input-icon" />
            <input
              type="text"
              className="report-input"
              placeholder="Tìm kiếm thành viên..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setUsersPage(1); }}
              style={{ height: '36px', fontSize: '0.8rem', borderRadius: '8px' }}
            />
          </div>
        </div>

        {isLoadingUsers ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem auto', color: '#23b56c' }} />
            Đang tải danh sách thành viên...
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
            Không tìm thấy thành viên nào phù hợp.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="db-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th>Tên thành viên</th>
                  <th>Địa chỉ Email</th>
                  <th>Quyền hạn</th>
                  <th>Trạng thái</th>
                  <th>Ngày gia nhập</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map(usr => (
                  <tr key={usr.id}>
                    <td>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{usr.name}</strong>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{usr.email}</td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '99px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        backgroundColor: usr.role === 'admin' ? 'rgba(239, 68, 68, 0.15)' : usr.role === 'moderator' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                        color: usr.role === 'admin' ? '#ef4444' : usr.role === 'moderator' ? '#f59e0b' : 'var(--text-secondary)'
                      }}>
                        {usr.role === 'admin' ? 'Admin' : usr.role === 'moderator' ? 'Mod' : 'User'}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '99px',
                        fontSize: '0.72rem',
                        fontWeight: '600',
                        backgroundColor: usr.status === 'active' ? 'rgba(35, 181, 108, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: usr.status === 'active' ? '#23b56c' : '#ef4444'
                      }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: usr.status === 'active' ? '#23b56c' : '#ef4444'
                        }}></span>
                        {usr.status === 'active' ? 'Hoạt động' : 'Đang khóa'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{usr.joined}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {/* View details action */}
                        <button
                          onClick={() => handleOpenUserDetail(usr)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            borderRadius: '6px',
                            backgroundColor: 'var(--bg-button-sec)',
                            border: '1px solid var(--border-button-sec)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          title="Xem thống kê và chi tiết thành viên"
                        >
                          <Eye size={12} />
                          <span>Chi tiết</span>
                        </button>

                        {/* Change role action */}
                        <button
                          onClick={() => handleChangeUserRole(usr.id, usr.name, usr.role)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            borderRadius: '6px',
                            backgroundColor: 'var(--bg-button-sec)',
                            border: '1px solid var(--border-button-sec)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          title="Đổi vai trò thành viên"
                        >
                          <RefreshCw size={12} />
                          <span>Đổi quyền</span>
                        </button>

                        {/* Lock / Unlock account */}
                        <button
                          onClick={() => handleToggleUserBan(usr.id, usr.name, usr.status)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            borderRadius: '6px',
                            backgroundColor: usr.status === 'active' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(35, 181, 108, 0.08)',
                            border: '1px solid',
                            borderColor: usr.status === 'active' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(35, 181, 108, 0.2)',
                            color: usr.status === 'active' ? '#ef4444' : '#23b56c',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          title={usr.status === 'active' ? "Khóa tài khoản thành viên" : "Mở khóa tài khoản thành viên"}
                        >
                          {usr.status === 'active' ? <ShieldX size={12} /> : <UserCheck size={12} />}
                          <span>{usr.status === 'active' ? 'Khóa' : 'Mở khóa'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar for Users */}
        {usersTotal > usersLimit && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', paddingRight: '1rem', paddingBottom: '1rem' }}>
            <button
              disabled={usersPage === 1}
              onClick={() => setUsersPage(prev => Math.max(prev - 1, 1))}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '4px', cursor: usersPage === 1 ? 'not-allowed' : 'pointer', opacity: usersPage === 1 ? 0.5 : 1 }}
            >
              Trước
            </button>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Trang {usersPage} / {Math.ceil(usersTotal / usersLimit)}
            </span>
            <button
              disabled={usersPage >= Math.ceil(usersTotal / usersLimit)}
              onClick={() => setUsersPage(prev => prev + 1)}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '4px', cursor: usersPage >= Math.ceil(usersTotal / usersLimit) ? 'not-allowed' : 'pointer', opacity: usersPage >= Math.ceil(usersTotal / usersLimit) ? 0.5 : 1 }}
            >
              Sau
            </button>
          </div>
        )}
      </div>

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
                        {new Date(userDetailData.user.joined || userDetailData.user.created_at).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}
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
