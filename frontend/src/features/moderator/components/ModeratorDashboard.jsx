import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Search, MessageSquare, Clock, Send, User, LogOut,
  Globe, CreditCard, Phone, CheckCircle, Eye, AlertCircle, X, Check
} from 'lucide-react';
import './ModeratorDashboard.css';
import { api } from '../../../lib/api';

function generateId(prefix) {
  return `${prefix}_${new Date().getTime()}_${Math.floor(Math.random() * 1000)}`;
}

export default function ModeratorDashboard({ addToast, onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('reports'); // 'reports' | 'chat'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Auth details
  const token = localStorage.getItem('token');
  const userEmail = localStorage.getItem('userEmail');

  // Selected item tracking
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [selectedChatUserId, setSelectedChatUserId] = useState(null);

  // States
  const [pendingReports, setPendingReports] = useState([]);
  const [blacklist, setBlacklist] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  // Detail Modal view (in case they want to open full details dialog)
  const [activeReportDetail, setActiveReportDetail] = useState(null);
  const [approveCategory, setApproveCategory] = useState('phishing');
  const [approveSeverity, setApproveSeverity] = useState('danger');
  const [approveDescription, setApproveDescription] = useState('');
  const [approveBankName, setApproveBankName] = useState('');

  // 1. Sync Reports & Blacklist (localStorage fallback)
  useEffect(() => {
    const loadInitialData = () => {
      // Blacklist load
      const savedBlack = localStorage.getItem('admin_blacklist');
      if (savedBlack) {
        try { setBlacklist(JSON.parse(savedBlack)); } catch (e) { console.error(e); }
      } else {
        const defaults = [
          { id: 'bl1', target: 'vietcombank-otp-verify.com', type: 'url', category: 'phishing', severity: 'danger', description: 'Trang web giả mạo ngân hàng Vietcombank để đánh cắp mã OTP.', date: '2026-06-19T10:00:00Z' },
          { id: 'bl2', target: 'momo-nhan-loc-he.xyz', type: 'url', category: 'scam', severity: 'danger', description: 'Lừa đảo nhận lộc hè MoMo, dụ dỗ người dùng chuyển tiền.', date: '2026-06-19T09:30:00Z' }
        ];
        setBlacklist(defaults);
        localStorage.setItem('admin_blacklist', JSON.stringify(defaults));
      }

      // Reports load
      const savedReports = localStorage.getItem('admin_pending_reports');
      if (savedReports) {
        try { setPendingReports(JSON.parse(savedReports)); } catch (e) { console.error(e); }
      } else {
        const defaults = [
          { id: 'ap1', target: 'vietcombank-reward-cld.xyz', type: 'url', reporter: 'Nguyễn Văn Nam', email: 'nam.nv@gmail.com', date: '2026-07-06T15:30:00Z', description: 'Trang web mạo danh ngân hàng Vietcombank gửi tin nhắn quà tặng tri ân hòng đánh cắp mật khẩu e-banking.' },
          { id: 'ap2', target: '0398765432', type: 'phone', reporter: 'Trần Thị Mai', email: 'maitt99@yahoo.com', date: '2026-07-06T18:45:00Z', description: 'Số điện thoại xưng danh là công an Hà Nội đe dọa liên quan vụ án ma túy yêu cầu chuyển tiền xác minh.' },
          { id: 'ap3', target: '97042293849102', type: 'bank_account', bankName: 'MB Bank', reporter: 'Phan Minh', email: 'minhphan_cld@gmail.com', date: '2026-07-07T02:15:00Z', description: 'Tài khoản nhận tiền cọc bán điện thoại iPhone cũ giá siêu rẻ trên Marketplace, nhận tiền xong lập tức chặn chat.' }
        ];
        setPendingReports(defaults);
        localStorage.setItem('admin_pending_reports', JSON.stringify(defaults));
      }
    };

    const fetchReportsFromAPI = async () => {
      setIsLoadingReports(true);
      try {
        const res = await api.getAdminReports(token, 1, 50, 'pending', null);
        if (res && res.success && res.data) {
          const reportList = Array.isArray(res.data) ? res.data : (res.data.reports || []);
          const mapped = reportList.map(r => {
            let targetVal = r.raw?.url || r.target || '';
            let rawType = 'url';
            if (r.type === 0) {
              if (r.raw?.other?.phone?.length > 0) {
                targetVal = r.raw.other.phone[0];
                rawType = 'phone';
              } else if (r.raw?.other?.bank_account?.length > 0) {
                targetVal = r.raw.other.bank_account[0];
                rawType = 'bank_account';
              } else {
                rawType = 'phone';
              }
            }
            return {
              id: r.id || r._id,
              target: targetVal,
              type: rawType,
              bankName: r.raw?.other?.bank_name?.[0] || r.bankName || '',
              reporter: r.reporter?.name || 'Ẩn danh',
              email: r.reporter?.contact?.find(c => c.type === 'email')?.value || r.email || '',
              date: r.created_at || r.date || new Date().toISOString(),
              description: r.raw?.detail || r.description || '',
              status: r.status || 'pending'
            };
          });
          setPendingReports(mapped);
        } else {
          loadInitialData();
        }
      } catch (err) {
        console.warn("Failed to fetch reports from backend API, fallback to local storage.", err);
        loadInitialData();
      } finally {
        setIsLoadingReports(false);
      }
    };

    fetchReportsFromAPI();
  }, [token]);

  // Sync state helpers
  const savePendingReportsData = (data) => {
    setPendingReports(data);
    localStorage.setItem('admin_pending_reports', JSON.stringify(data));
  };
  const saveBlacklistData = (data) => {
    setBlacklist(data);
    localStorage.setItem('admin_blacklist', JSON.stringify(data));
  };

  const addAuditLog = (action, target, details) => {
    const saved = localStorage.getItem('admin_audit_logs');
    let logs = [];
    if (saved) {
      try { logs = JSON.parse(saved); } catch (e) { console.error(e); }
    }
    const newLog = {
      id: generateId('log'),
      action,
      target,
      operator: userEmail || 'support@chongluadao.vn',
      date: new Date().toISOString(),
      details
    };
    localStorage.setItem('admin_audit_logs', JSON.stringify([newLog, ...logs]));
  };

  // Live support chat state
  const [chatUsers, setChatUsers] = useState([
    { id: 'u1', name: 'Nguyễn Văn Nam', lastMsg: 'Tài khoản ngân hàng MB này lừa đảo cọc xe...', time: '14:20', active: true, unread: true },
    { id: 'u2', name: 'Trần Thị Mai', lastMsg: 'Mình vừa click vào link shopee-uu-dai...', time: '13:45', active: true, unread: false },
    { id: 'u3', name: 'Lê Văn Hải', lastMsg: 'Sao báo cáo của mình chưa được duyệt vậy ạ?', time: 'Hôm qua', active: false, unread: false }
  ]);
  
  const [chatThreads, setChatThreads] = useState({
    u1: [
      { id: 'm1', sender: 'user', text: 'Chào ad, mình bị lừa cọc tiền mua điện thoại qua STK ngân hàng này.', time: '14:15' },
      { id: 'm2', sender: 'user', text: 'Số tài khoản MB Bank: 97042293849102. Tên chủ tài khoản: PHAN MINH.', time: '14:16' },
      { id: 'm3', sender: 'moderator', text: 'Chào bạn Nam, bạn đã gửi tố cáo lên hệ thống chưa ạ? Vui lòng đính kèm hình ảnh giao dịch để làm bằng chứng nhé.', time: '14:18' },
      { id: 'm4', sender: 'user', text: 'Mình gửi báo cáo rồi ad, mã báo cáo ap3. Nhờ ad duyệt chặn giúp để cảnh báo người khác.', time: '14:20' }
    ],
    u2: [
      { id: 'm21', sender: 'user', text: 'Ad ơi, link shopee-uu-dai-cld.xyz có phải lừa đảo không? Mình lỡ điền OTP rồi.', time: '13:40' },
      { id: 'm22', sender: 'moderator', text: 'Chào bạn Mai, liên kết này là liên kết độc hại giả mạo Shopee. Bạn cần lập tức liên hệ tổng đài ngân hàng hoặc nhà mạng để khóa tài khoản/khóa sim khẩn cấp nhé!', time: '13:45' }
    ],
    u3: [
      { id: 'm31', sender: 'user', text: 'Báo cáo số điện thoại giả mạo công an của mình gửi từ hôm qua sao chưa thấy duyệt?', time: 'Hôm qua' },
      { id: 'm32', sender: 'moderator', text: 'Chào bạn Hải, ban quản trị đang xác minh số điện thoại trên. Báo cáo sẽ sớm được xử lý.', time: 'Hôm qua' }
    ]
  });

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatThreads, selectedChatUserId]);

  // Handlers for support chat
  const handleSendMessage = () => {
    if (!inputMessage.trim() || !selectedChatUserId) return;

    const newMessage = {
      id: `msg_${Date.now()}`,
      sender: 'moderator',
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setChatThreads(prev => ({
      ...prev,
      [selectedChatUserId]: [...(prev[selectedChatUserId] || []), newMessage]
    }));

    setChatUsers(prev => prev.map(u => {
      if (u.id === selectedChatUserId) {
        return { ...u, lastMsg: inputMessage.trim(), time: 'Vừa xong', unread: false };
      }
      return u;
    }));

    setInputMessage('');

    // Simulate auto reply
    setTimeout(() => {
      const reply = {
        id: `reply_${Date.now()}`,
        sender: 'user',
        text: 'Dạ vâng, cảm ơn ad hỗ trợ! Mình sẽ làm theo hướng dẫn.',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setChatThreads(prev => ({
        ...prev,
        [selectedChatUserId]: [...(prev[selectedChatUserId] || []), reply]
      }));
      setChatUsers(prev => prev.map(u => {
        if (u.id === selectedChatUserId) {
          return { ...u, lastMsg: reply.text, time: 'Vừa xong' };
        }
        return u;
      }));
    }, 2500);
  };

  const handleQuickReply = (text) => {
    setInputMessage(text);
  };

  const quickReplies = [
    'Chào bạn! Chúng tôi đã tiếp nhận báo cáo của bạn và đang tiến hành xác minh.',
    'Bạn vui lòng cung cấp thêm hình ảnh bằng chứng giao dịch chuyển khoản hoặc tin nhắn lừa đảo nhé.',
    'Tên miền này đã bị khóa và đưa vào Blacklist cảnh báo toàn cầu. Cảm ơn bạn!',
    'Bạn hãy lập tức liên hệ ngân hàng để khóa tài khoản khẩn cấp nhé.'
  ];

  // Handlers for reports
  const handleApproveReport = (report) => {
    setActiveReportDetail(report);
    setApproveDescription(report.description);
    setApproveBankName(report.bankName || '');
    setApproveCategory(report.type === 'url' ? 'phishing' : 'financial');
    setApproveSeverity('danger');
  };

  const handleApproveConfirm = async () => {
    if (!activeReportDetail) return;

    try {
      await api.updateAdminReportStatus(token, activeReportDetail.id, 'approved');
    } catch (e) {
      console.warn(e);
    }

    const newItem = {
      id: generateId('bl'),
      target: activeReportDetail.target,
      type: activeReportDetail.type,
      category: approveCategory,
      severity: approveSeverity,
      description: approveDescription,
      bankName: activeReportDetail.type === 'bank_account' ? approveBankName : undefined,
      date: new Date().toISOString()
    };

    saveBlacklistData([newItem, ...blacklist]);
    const updatedReports = pendingReports.filter(r => r.id !== activeReportDetail.id);
    savePendingReportsData(updatedReports);
    addAuditLog('Duyệt Báo cáo', activeReportDetail.target, `Phê duyệt đối tượng lừa đảo. Phân loại: ${approveCategory}`);

    if (addToast) addToast(`Đã duyệt chặn đối tượng "${activeReportDetail.target}" vào danh sách đen!`, 'success');
    setActiveReportDetail(null);
    setSelectedReportId(null);
  };

  const handleRejectReport = async (report) => {
    if (window.confirm(`Bạn có chắc muốn từ chối báo cáo đối với "${report.target}"?`)) {
      try {
        await api.updateAdminReportStatus(token, report.id, 'rejected');
      } catch (e) {
        console.warn(e);
      }

      const updatedReports = pendingReports.filter(r => r.id !== report.id);
      savePendingReportsData(updatedReports);
      addAuditLog('Từ chối Báo cáo', report.target, `Từ chối yêu cầu duyệt báo cáo.`);
      if (addToast) addToast(`Đã từ chối báo cáo đối với "${report.target}".`, 'info');
      setSelectedReportId(null);
    }
  };

  // Filters based on query
  const filteredReports = pendingReports.filter(r =>
    r.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.reporter.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChatUsers = chatUsers.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastMsg.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedReport = pendingReports.find(r => r.id === selectedReportId);
  const selectedChatUser = chatUsers.find(u => u.id === selectedChatUserId);

  // Avatar generator helper
  const getInitials = (name) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Color generator based on name hash
  const getAvatarColor = (name) => {
    const colors = ['#2e7d32', '#1565c0', '#d84315', '#6a1b9a', '#00838f', '#ad1457', '#ef6c00'];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return colors[sum % colors.length];
  };

  return (
    <div className="telegram-moderator-container">
      
      {/* 1. LEFT SIDEBAR: ITEMS LIST & TABS */}
      <div className="telegram-left-sidebar">
        
        {/* Sidebar Header */}
        <div className="telegram-sidebar-header">
          <div className="telegram-sidebar-logo">
            <Shield size={18} color="#5288c1" />
            <span>COMMAND CENTER</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#7f91a4', fontWeight: 'bold' }}>T.V.V</span>
        </div>

        {/* Search Input */}
        <div className="telegram-search-container">
          <div className="telegram-search-bar">
            <Search size={14} color="#7f91a4" />
            <input
              type="text"
              className="telegram-search-input"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="telegram-tabs-row">
          <button
            className={`telegram-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => { setActiveTab('reports'); setSearchQuery(''); }}
          >
            <Clock size={15} />
            <span>Kiểm duyệt</span>
            {pendingReports.length > 0 && (
              <span className="telegram-badge-count">{pendingReports.length}</span>
            )}
          </button>

          <button
            className={`telegram-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => { setActiveTab('chat'); setSearchQuery(''); }}
          >
            <MessageSquare size={15} />
            <span>Tư vấn</span>
            {chatUsers.some(u => u.unread) && (
              <span className="telegram-badge-count unread">New</span>
            )}
          </button>
        </div>

        {/* Sidebar Items Scrollable List */}
        <div className="telegram-items-scroll">
          {activeTab === 'reports' ? (
            filteredReports.length === 0 ? (
              <div style={{ padding: '2rem', textStyle: 'center', color: '#7f91a4', fontSize: '0.8rem', textAlign: 'center' }}>
                Không tìm thấy báo cáo nào
              </div>
            ) : (
              filteredReports.map(report => (
                <button
                  key={report.id}
                  className={`telegram-item-row ${selectedReportId === report.id ? 'active' : ''}`}
                  onClick={() => { setSelectedReportId(report.id); setSelectedChatUserId(null); }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <div
                      className="telegram-item-avatar"
                      style={{ backgroundColor: getAvatarColor(report.target) }}
                    >
                      {report.type === 'url' ? 'W' : report.type === 'phone' ? 'P' : 'B'}
                    </div>
                    <div className="telegram-item-details">
                      <div className="telegram-item-meta">
                        <span className="telegram-item-name">{report.target}</span>
                        <span className="telegram-item-time">
                          {new Date(report.date).toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' })}
                        </span>
                      </div>
                      <span className="telegram-item-snippet">{report.description}</span>
                    </div>
                  </div>
                </button>
              ))
            )
          ) : (
            filteredChatUsers.length === 0 ? (
              <div style={{ padding: '2rem', textStyle: 'center', color: '#7f91a4', fontSize: '0.8rem', textAlign: 'center' }}>
                Không tìm thấy phiên chat nào
              </div>
            ) : (
              filteredChatUsers.map(user => (
                <button
                  key={user.id}
                  className={`telegram-item-row ${selectedChatUserId === user.id ? 'active' : ''}`}
                  onClick={() => { setSelectedChatUserId(user.id); setSelectedReportId(null); }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <div
                      className="telegram-item-avatar"
                      style={{ backgroundColor: getAvatarColor(user.name) }}
                    >
                      {getInitials(user.name)}
                    </div>
                    <div className="telegram-item-details">
                      <div className="telegram-item-meta">
                        <span className="telegram-item-name">{user.name}</span>
                        <span className="telegram-item-time">{user.time}</span>
                      </div>
                      <span className="telegram-item-snippet" style={{ color: user.unread ? '#fff' : '#7f91a4', fontWeight: user.unread ? 'bold' : 'normal' }}>
                        {user.lastMsg}
                      </span>
                    </div>
                    {user.unread && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', marginLeft: '0.5rem', flexShrink: 0 }}></span>
                    )}
                  </div>
                </button>
              ))
            )
          )}
        </div>

        {/* Sidebar Footer Logout */}
        <div className="telegram-sidebar-footer">
          <button className="telegram-logout-btn" onClick={onLogout}>
            <LogOut size={14} />
            <span>Thoát hệ thống</span>
          </button>
        </div>

      </div>

      {/* 2. RIGHT MAIN VIEW AREA */}
      <div className="telegram-main-area">
        
        {/* CASE A: NO SELECTION */}
        {!selectedReport && !selectedChatUser && (
          <div className="telegram-empty-view">
            <div className="telegram-empty-circle">
              <Shield size={48} color="#7f91a4" />
            </div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '1rem' }}>Chào mừng bạn đến với Command Center</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', maxWidth: '300px', lineHeight: 1.5 }}>
              Chọn một phiên hỗ trợ chat hoặc một yêu cầu báo cáo vi phạm ở cột bên trái để bắt đầu xử lý công việc.
            </p>
          </div>
        )}

        {/* CASE B: REPORT IS SELECTED */}
        {selectedReport && (
          <>
            {/* Header */}
            <div className="telegram-main-header">
              <div className="telegram-header-info">
                <span className="telegram-header-title">{selectedReport.target}</span>
                <span className="telegram-header-subtitle" style={{ color: '#ffb300' }}>● Yêu cầu xác minh & kiểm duyệt</span>
              </div>
              <span className={`status-badge pending`} style={{ fontSize: '0.68rem', fontWeight: 'bold' }}>
                {selectedReport.type === 'url' ? 'Tên miền' : selectedReport.type === 'bank_account' ? `Số tài khoản (${selectedReport.bankName})` : 'Số điện thoại'}
              </span>
            </div>

            {/* Scrollable details view */}
            <div className="telegram-report-scroll">
              <div className="telegram-report-card">
                <div className="telegram-report-section-title">Đối tượng bị phản ánh</div>
                <div className="telegram-report-value" style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#5288c1' }}>
                  {selectedReport.target}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.25rem' }}>
                  <div>
                    <div className="telegram-report-section-title">Người báo cáo</div>
                    <div className="telegram-report-value">{selectedReport.reporter}</div>
                  </div>
                  <div>
                    <div className="telegram-report-section-title">Địa chỉ liên hệ</div>
                    <div className="telegram-report-value" style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{selectedReport.email || 'Ẩn danh'}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                  <div>
                    <div className="telegram-report-section-title">Thời gian phản ánh</div>
                    <div className="telegram-report-value" style={{ fontSize: '0.85rem' }}>{new Date(selectedReport.date).toLocaleString('vi-VN')}</div>
                  </div>
                  <div>
                    <div className="telegram-report-section-title">Phân loại tố cáo</div>
                    <div className="telegram-report-value" style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>
                      {selectedReport.type === 'url' ? 'Tên miền độc hại / Lừa đảo' : 'Đối tượng lừa đảo tài chính'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="telegram-report-card">
                <div className="telegram-report-section-title">Mô tả hành vi chi tiết từ nạn nhân</div>
                <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5, color: '#cbd5e1', whiteSpace: 'pre-wrap' }}>
                  {selectedReport.description}
                </p>
              </div>

              {/* Visual warning alerts */}
              <div style={{ display: 'flex', gap: '0.75rem', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)', padding: '1rem', borderRadius: '10px', alignItems: 'flex-start', color: '#ffb300', fontSize: '0.8rem', lineHeight: 1.4 }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Chú ý kiểm duyệt viên:</strong> Vui lòng rà soát kỹ thông tin tên miền hoặc số tài khoản thông qua các nguồn tin cậy của bên thứ ba trước khi duyệt. Đối tượng được duyệt sẽ ngay lập tức được cập nhật vào danh sách đen bảo vệ thời gian thực trên Chrome Extension và Bot Cảnh báo.
                </div>
              </div>
            </div>

            {/* Actions footer */}
            <div className="telegram-action-footer">
              <button
                className="btn btn-secondary"
                onClick={() => handleRejectReport(selectedReport)}
                style={{ height: '42px', borderRadius: '8px', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <X size={14} /> Từ chối báo cáo
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleApproveReport(selectedReport)}
                style={{ height: '42px', borderRadius: '8px', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#23b56c', borderColor: '#23b56c' }}
              >
                <Check size={14} /> Phê duyệt & Chặn
              </button>
            </div>
          </>
        )}

        {/* CASE C: ACTIVE CHAT SUPPORT IS SELECTED */}
        {selectedChatUser && (
          <>
            {/* Header */}
            <div className="telegram-main-header">
              <div className="telegram-header-info">
                <span className="telegram-header-title">{selectedChatUser.name}</span>
                <span className="telegram-header-subtitle" style={{ color: '#10b981' }}>● Tư vấn viên đang hỗ trợ trực tuyến</span>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => addToast('Đã đánh dấu cuộc hội thoại giải quyết thành công.', 'success')}
                style={{ height: '32px', fontSize: '0.72rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0 0.75rem' }}
              >
                <CheckCircle size={12} /> Đã giải quyết
              </button>
            </div>

            {/* Messages scrolling area */}
            <div className="telegram-messages-scroll">
              {chatThreads[selectedChatUser.id]?.map(msg => (
                <div key={msg.id} className={`telegram-message-wrap ${msg.sender}`}>
                  <div className="telegram-message-bubble">
                    <p style={{ margin: 0 }}>{msg.text}</p>
                    <span className="telegram-message-time">{msg.time}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick response row */}
            <div className="telegram-quick-reply-bar">
              {quickReplies.map((reply, idx) => (
                <button
                  key={idx}
                  className="telegram-quick-chip"
                  onClick={() => handleQuickReply(reply)}
                >
                  {reply.length > 28 ? reply.slice(0, 28) + '...' : reply}
                </button>
              ))}
            </div>

            {/* Inputs footer */}
            <div className="telegram-input-bar">
              <input
                type="text"
                className="telegram-input-box"
                placeholder={`Trả lời ${selectedChatUser.name}...`}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
              />
              <button className="telegram-send-btn" onClick={handleSendMessage}>
                <Send size={16} />
              </button>
            </div>
          </>
        )}

      </div>

      {/* 3. MODAL FOR APPROVAL PARAMETERS */}
      {activeReportDetail && (
        <div className="signature-modal-overlay">
          <div className="signature-modal" style={{ maxWidth: '500px', textAlign: 'left' }}>
            <h3 className="signature-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
              <Shield size={20} color="#23b56c" />
              Xác Nhận Đưa Đối Tượng Vào Blacklist
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '1rem 0' }}>
              <div className="profile-field-group">
                <label className="profile-field-label">Đối tượng chặn</label>
                <input
                  type="text"
                  className="profile-field-input"
                  value={activeReportDetail.target}
                  readOnly
                  disabled
                  style={{ background: '#1c2430', color: '#94a3b8', border: '1px solid #24303f', cursor: 'not-allowed' }}
                />
              </div>

              {activeReportDetail.type === 'bank_account' && (
                <div className="profile-field-group">
                  <label className="profile-field-label">Tên ngân hàng</label>
                  <input
                    type="text"
                    className="profile-field-input"
                    value={approveBankName}
                    onChange={(e) => setApproveBankName(e.target.value)}
                    style={{ background: '#24303f', border: '1px solid #101921', color: '#fff' }}
                  />
                </div>
              )}

              <div className="profile-field-group">
                <label className="profile-field-label">Thể loại vi phạm</label>
                <select
                  className="profile-field-input"
                  value={approveCategory}
                  onChange={(e) => setApproveCategory(e.target.value)}
                  style={{ background: '#24303f', border: '1px solid #101921', color: '#fff' }}
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
                      className={`admin-btn-select ${approveSeverity === sev ? `active-${sev}` : ''}`}
                      onClick={() => setApproveSeverity(sev)}
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
                  value={approveDescription}
                  onChange={(e) => setApproveDescription(e.target.value)}
                  style={{ height: '90px', padding: '0.75rem', fontSize: '0.88rem', background: '#24303f', color: '#fff', border: '1px solid #101921' }}
                />
              </div>
            </div>

            <div className="signature-actions" style={{ marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary report-nav-btn"
                onClick={() => setActiveReportDetail(null)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="btn btn-primary report-nav-btn"
                onClick={handleApproveConfirm}
                style={{ backgroundColor: '#23b56c', borderColor: '#23b56c' }}
              >
                Phê duyệt đưa vào Blacklist
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
