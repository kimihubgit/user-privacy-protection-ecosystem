export default function SettingsTab({
  notifyEmail,
  setNotifyEmail,
  realtimeShield,
  setRealtimeShield,
  autoupdate,
  setAutoupdate,
  addToast
}) {
  return (
    <div className="db-panel-card" style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div className="db-card-header">
        <h3 className="db-card-title">Cấu hình bảo mật & Thông báo</h3>
      </div>

      <div className="settings-options-list">
        <div className="setting-toggle-row">
          <div className="setting-toggle-info">
            <span className="setting-toggle-title">Thông báo email</span>
            <span className="setting-toggle-desc">Nhận thông tin cảnh báo hàng tuần về chiến dịch phishing nguy hiểm mới phát hiện tại Việt Nam.</span>
          </div>
          <label className="db-switch">
            <input 
              type="checkbox" 
              checked={notifyEmail} 
              onChange={(e) => {
                setNotifyEmail(e.target.checked);
                if (addToast) addToast(`Đã ${e.target.checked ? 'bật' : 'tắt'} nhận email thông báo.`, 'success');
              }} 
            />
            <span className="db-slider"></span>
          </label>
        </div>

        <div className="setting-toggle-row">
          <div className="setting-toggle-info">
            <span className="setting-toggle-title">Giám sát web thời gian thực</span>
            <span className="setting-toggle-desc">Cho phép tiện ích mở rộng VTrust chạy quét ngầm để tự động phát hiện rủi ro khi bạn lướt web.</span>
          </div>
          <label className="db-switch">
            <input 
              type="checkbox" 
              checked={realtimeShield} 
              onChange={(e) => {
                setRealtimeShield(e.target.checked);
                if (addToast) addToast(`Đã ${e.target.checked ? 'bật' : 'tắt'} giám sát web ngầm.`, 'success');
              }} 
            />
            <span className="db-slider"></span>
          </label>
        </div>

        <div className="setting-toggle-row">
          <div className="setting-toggle-info">
            <span className="setting-toggle-title">Tự động đồng bộ danh sách đen</span>
            <span className="setting-toggle-desc">Cập nhật định kỳ cơ sở dữ liệu website độc hại từ hệ thống mỗi 10 phút.</span>
          </div>
          <label className="db-switch">
            <input 
              type="checkbox" 
              checked={autoupdate} 
              onChange={(e) => {
                setAutoupdate(e.target.checked);
                if (addToast) addToast(`Đã ${e.target.checked ? 'bật' : 'tắt'} đồng bộ dữ liệu tự động.`, 'success');
              }} 
            />
            <span className="db-slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
}
