export default function ProfileTab({
  userName,
  setUserName,
  userEmail,
  setUserEmail,
  userPhone,
  setUserPhone,
  userAvatar,
  handleSaveProfile,
  addToast
}) {
  return (
    <div className="db-panel-card" style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div className="db-card-header">
        <h3 className="db-card-title">Chỉnh sửa hồ sơ cá nhân</h3>
      </div>

      <form onSubmit={handleSaveProfile} className="profile-form-wrap">
        <div className="profile-avatar-row">
          <div className="profile-avatar-circle" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {userAvatar ? (
              <img src={userAvatar} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              userName ? userName[0] : 'K'
            )}
          </div>
          <div>
            <button
              type="button"
              className="profile-avatar-btn"
              onClick={() => addToast && addToast('Chức năng tải ảnh đại diện đang được đồng bộ...', 'info')}
            >
              Thay đổi ảnh đại diện
            </button>
          </div>
        </div>

        <div className="profile-field-group">
          <span className="profile-field-label">Họ và tên</span>
          <input
            type="text"
            className="profile-field-input"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />
        </div>

        <div className="profile-field-group">
          <span className="profile-field-label">Địa chỉ Email</span>
          <input
            type="email"
            className="profile-field-input"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            required
          />
        </div>

        <div className="profile-field-group">
          <span className="profile-field-label">Số điện thoại</span>
          <input
            type="text"
            className="profile-field-input"
            value={userPhone}
            onChange={(e) => setUserPhone(e.target.value)}
          />
        </div>

        <button type="submit" className="profile-save-btn">Lưu các thay đổi</button>
      </form>
    </div>
  );
}

