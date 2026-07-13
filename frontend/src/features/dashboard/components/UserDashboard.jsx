import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Grid, User, BookOpen, FileText, Settings, AlignLeft, ArrowLeft, LogOut
} from 'lucide-react';
import './UserDashboard.css';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

// Import tab subcomponents
import UserOverviewTab from './UserOverviewTab';
import DigitalProfileTab from './DigitalProfileTab';
import ProfileTab from './ProfileTab';
import MyReportsTab from './MyReportsTab';
import SettingsTab from './SettingsTab';

export default function UserDashboard({ addToast, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract activeTab from URL, default to 'overview'
  const pathParts = location.pathname.toLowerCase().split('/').filter(Boolean);
  const activeTab = pathParts[1] || 'overview';

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // User details state
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || '');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail') || '');
  const [userPhone, setUserPhone] = useState(() => localStorage.getItem('userPhone') || '');
  const [userAvatar] = useState(() => localStorage.getItem('userAvatar') || '');
  const accountType = 'Hội viên tiêu chuẩn';

  const { user } = useAuth();

  // Safeguard: Redirect admin & moderator to their dashboards
  useEffect(() => {
    if (user.role === 'admin') {
      navigate('/admin');
    } else if (user.role === 'moderator') {
      navigate('/moderator');
    }
  }, [user.role, navigate]);


  // Interactive settings state
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [realtimeShield, setRealtimeShield] = useState(true);
  const [autoupdate, setAutoupdate] = useState(true);

  // Submitted reports state (loads from localStorage or sets defaults)
  const [myReports, setMyReports] = useState(() => {
    const saved = localStorage.getItem('user_reports');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    const defaultReports = [
      { id: 'r1', target: 'momo-nhan-loc-he.xyz', type: 'Website độc hại', date: '20-06-2026', status: 'approved' },
      { id: 'r2', target: 'shopee-khuyenmai-hot.top', type: 'Website độc hại', date: '18-06-2026', status: 'approved' },
      { id: 'r3', target: '0398765432', type: 'Số điện thoại', date: '15-06-2026', status: 'pending' },
      { id: 'r4', target: '1029837465', type: 'Tài khoản ngân hàng', date: '10-06-2026', status: 'rejected' }
    ];
    localStorage.setItem('user_reports', JSON.stringify(defaultReports));
    return defaultReports;
  });
  const [reportFilter, setReportFilter] = useState('all');

  useEffect(() => {
    const fetchMyReports = async () => {
      try {
        const res = await api.getMyReports(1, 20);
        if (res && res.data) {
          const mapped = res.data.map(item => {
            let targetText = 'Báo cáo';
            if (item.raw) {
              targetText = item.raw.url || (item.raw.other && (item.raw.other.phone?.[0] || item.raw.other.bank_account?.[0])) || item.raw.title || targetText;
            }
            let typeText = item.type === 1 ? 'Website độc hại' : 'Đối tượng lừa đảo';
            let formattedDate = item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : 'Mới';
            return {
              id: item.id || ('REP' + Math.floor(100000 + Math.random() * 900000)),
              target: targetText,
              type: typeText,
              date: formattedDate,
              status: item.status || 'pending'
            };
          });
          setMyReports(mapped);
          localStorage.setItem('user_reports', JSON.stringify(mapped));
        }
      } catch (error) {
        console.warn('Không thể lấy lịch sử báo cáo từ server, dùng local:', error);
      }
    };
    fetchMyReports();
  }, []);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem('userName', userName);
    localStorage.setItem('userEmail', userEmail);
    localStorage.setItem('userPhone', userPhone);
    if (addToast) {
      addToast('Cập nhật hồ sơ cá nhân thành công!', 'success');
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      if (addToast) {
        addToast('Đã đăng xuất tài khoản thành công.', 'info');
      }
      navigate('/');
    }
  };


  return (
    <div className="dashboard-container">
      {/* Laser Scanning Lines */}
      <div className="login-overlay-laser" style={{ opacity: 0.1 }}></div>

      {/* Sidebar */}
      <div className={`db-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div>
          <div className="db-sidebar-header">
            <span className="db-sidebar-title">MENU CHÍNH</span>
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
              onClick={() => navigate('/dashboard/overview')}
            >
              <Grid size={18} />
              <span>Tổng quan</span>
            </button>
            <button
              className={`db-menu-item ${activeTab === 'digitalprofile' ? 'active' : ''}`}
              onClick={() => navigate('/dashboard/digitalprofile')}
            >
              <BookOpen size={18} />
              <span>Hồ sơ số</span>
            </button>
            <button
              className={`db-menu-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => navigate('/dashboard/profile')}
            >
              <User size={18} />
              <span>Hồ sơ cá nhân</span>
            </button>
            <button
              className={`db-menu-item ${activeTab === 'myreports' ? 'active' : ''}`}
              onClick={() => navigate('/dashboard/myreports')}
            >
              <FileText size={18} />
              <span>Báo cáo của tôi</span>
            </button>
            <button
              className={`db-menu-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => navigate('/dashboard/settings')}
            >
              <Settings size={18} />
              <span>Cài đặt</span>
            </button>
          </div>
        </div>

        <div className="chat-sidebar-footer">
          <button className="sidebar-footer-item" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="db-main-area">
        {/* Header */}
        <header className="db-header">
          <div className="db-header-left">
            <span className="live-pulse-dot" style={{ backgroundColor: '#23B56C', boxShadow: '0 0 8px #23B56C' }}></span>
            <span className="db-header-title">BẢNG ĐIỀU KHIỂN HỘI VIÊN</span>
          </div>

          <button className="header-action-btn" onClick={() => navigate('/')} title="Về Trang chủ">
            <ArrowLeft size={15} />
            <span>Quay lại trang chủ</span>
          </button>
        </header>

        {/* Content */}
        <div className="db-content">

          {/* Overview Tab */}
          {activeTab === 'overview' && <UserOverviewTab />}

          {/* Digital Profile Tab (HỒ SƠ SỐ) */}
          {activeTab === 'digitalprofile' && <DigitalProfileTab addToast={addToast} />}

          {/* Personal Profile Tab */}
          {activeTab === 'profile' && (
            <ProfileTab
              userName={userName}
              setUserName={setUserName}
              userEmail={userEmail}
              setUserEmail={setUserEmail}
              userPhone={userPhone}
              setUserPhone={setUserPhone}
              accountType={accountType}
              userAvatar={userAvatar}
              handleSaveProfile={handleSaveProfile}
              addToast={addToast}
            />
          )}

          {/* My Reports Tab */}
          {activeTab === 'myreports' && (
            <MyReportsTab
              myReports={myReports}
              reportFilter={reportFilter}
              setReportFilter={setReportFilter}
            />
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <SettingsTab
              notifyEmail={notifyEmail}
              setNotifyEmail={setNotifyEmail}
              realtimeShield={realtimeShield}
              setRealtimeShield={setRealtimeShield}
              autoupdate={autoupdate}
              setAutoupdate={setAutoupdate}
              addToast={addToast}
            />
          )}

        </div>
      </div>
    </div>
  );
}

