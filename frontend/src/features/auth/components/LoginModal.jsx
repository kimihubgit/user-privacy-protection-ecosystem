import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Lock, Eye, EyeOff, CheckCircle2, User, Key } from 'lucide-react';
import { api } from '../../../lib/api';

export default function LoginModal({
  isOpen,
  onClose,
  addToast,
  setIsLoggedIn,
  setUserName,
  setUserAvatar
}) {
  const navigate = useNavigate();
  const [loginMode, setLoginMode] = useState('login'); // 'login' or 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [showRepassword, setShowRepassword] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [repasswordInput, setRepasswordInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const handleUsernameBlur = async () => {
    const val = usernameInput.trim();
    if (loginMode !== 'register' || val.length < 3) return;
    try {
      const res = await api.checkUsername(val);
      if (res && res.exists) {
        setUsernameError('Tên đăng nhập này đã được sử dụng!');
      } else {
        setUsernameError('');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const handleEmailBlur = async () => {
    const val = emailInput.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (loginMode !== 'register' || !emailRegex.test(val)) return;
    try {
      const res = await api.checkEmail(val);
      if (res && res.exists) {
        setEmailError('Địa chỉ email này đã được đăng ký!');
      } else {
        setEmailError('');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const syncProfile = (res, defaultName) => {
    let nameToSet = defaultName || 'Khải Nguyễn';
    const emailToSet = res.user ? (res.user.email || '') : (res.email || '');
    const avatarToSet = res.user ? (res.user.avatar || '') : (res.avatar || '');
    const roleToSet = res.user ? (res.user.role || 'user') : (res.role || 'user');

    if (res.user) {
      nameToSet = res.user.name || res.user.username || nameToSet;
    } else {
      nameToSet = res.name || res.username || nameToSet;
    }

    setUserName(nameToSet);
    localStorage.setItem('userName', nameToSet);
    if (emailToSet) {
      localStorage.setItem('userEmail', emailToSet);
    }
    if (avatarToSet) {
      localStorage.setItem('userAvatar', avatarToSet);
      if (setUserAvatar) {
        setUserAvatar(avatarToSet);
      }
    }
    localStorage.setItem('userRole', roleToSet);
  };

  const getRedirectPath = (res) => {
    const role = res.user ? (res.user.role || 'user') : (res.role || 'user');
    if (role === 'admin') return '/admin';
    if (role === 'moderator') return '/moderator';
    return '/dashboard';
  };

  if (!isOpen) return null;

  const handlePasskeyScan = async () => {
    try {
      addToast('Đang gọi Passkey / Windows Hello...', 'info');
      const res = await api.loginWithPasskey();


      const token = res.token || res.accessToken || (res.data && (res.data.token || res.data.accessToken));
      if (token) {
        localStorage.setItem('token', token);
      }

      syncProfile(res, 'Khải Nguyễn');

      setIsLoggedIn(true);
      window.dispatchEvent(new Event('auth-change'));
      addToast('Đăng nhập bằng Passkey thành công!', 'success');
      onClose();
      navigate(getRedirectPath(res));
    } catch (error) {
      console.error(error);
      addToast(error.message || 'Xác thực Passkey thất bại!', 'error');
    }
  };

  const handleWindowsHelloScan = handlePasskeyScan;

  const handleGoogleCredentialResponse = async (response) => {
    try {
      if (!response.credential) {
        addToast('Không nhận được thông tin xác thực từ Google.', 'error');
        return;
      }

      const res = await api.socialLogin('google', response.credential);

      const token = res.token || res.accessToken || (res.data && (res.data.token || res.data.accessToken));
      if (token) {
        localStorage.setItem('token', token);
      }

      let defaultName = 'Người dùng Google';
      try {
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          window.atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);
        defaultName = payload.name || payload.email || defaultName;
      } catch (e) {
        console.warn('Failed to parse Google credential fallback details:', e);
      }

      syncProfile(res, defaultName);

      setIsLoggedIn(true);
      window.dispatchEvent(new Event('auth-change'));
      addToast('Đăng nhập bằng Google thành công!', 'success');
      onClose();
      navigate(getRedirectPath(res));
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Đăng nhập Google thất bại!', 'error');
    }
  };

  const handleGoogleLogin = () => {
    try {
      if (!window.google) {
        addToast('Thư viện Google Sign-In đang tải. Vui lòng thử lại sau vài giây!', 'warning');
        return;
      }

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
        auto_select: false
      });

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          window.google.accounts.id.requestCode();
        }
      });
    } catch (e) {
      console.error(e);
      addToast('Không khởi tạo được dịch vụ đăng nhập Google.', 'error');
    }
  };

  const handleGithubLogin = async () => {
    try {
      addToast('Đang kết nối tới GitHub...', 'info');
      await new Promise(resolve => setTimeout(resolve, 800));

      const res = await api.socialLogin(
        'github',
        'git-mock-code-' + Math.floor(100000 + Math.random() * 900000)
      );

      const token = res.token || res.accessToken || (res.data && (res.data.token || res.data.accessToken));
      if (token) {
        localStorage.setItem('token', token);
      }

      syncProfile(res, 'Khải Nguyễn (GitHub)');

      setIsLoggedIn(true);
      window.dispatchEvent(new Event('auth-change'));
      addToast('Đăng nhập bằng GitHub thành công!', 'success');
      onClose();
      navigate(getRedirectPath(res));
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Đăng nhập GitHub thất bại!', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loginMode === 'login') {
      if (usernameInput.trim().length < 3) {
        addToast('Tên đăng nhập phải chứa ít nhất 3 ký tự!', 'error');
        return;
      }
      if (passwordInput.length < 6) {
        addToast('Mật khẩu phải chứa ít nhất 6 ký tự!', 'error');
        return;
      }

      try {
        const res = await api.login(usernameInput.trim(), passwordInput);

        addToast('Đăng nhập thành công!', 'success');

        const token = res.token || res.accessToken || (res.data && (res.data.token || res.data.accessToken));
        if (token) {
          localStorage.setItem('token', token);
        }
        syncProfile(res, usernameInput);

        setIsLoggedIn(true);
        window.dispatchEvent(new Event('auth-change'));
        onClose();
        navigate(getRedirectPath(res));

      } catch (error) {
        addToast(error.message || 'Tên đăng nhập hoặc mật khẩu không chính xác!', 'error');
      }
    } else {
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(usernameInput)) {
        addToast('Tên đăng nhập từ 3-20 ký tự, chỉ chứa chữ cái, số và dấu gạch dưới (_), không chứa khoảng trắng!', 'error');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput)) {
        addToast('Địa chỉ email không đúng định dạng!', 'error');
        return;
      }

      if (passwordInput.length < 6) {
        addToast('Mật khẩu phải có độ dài từ 6 ký tự trở lên!', 'error');
        return;
      }

      if (passwordInput !== repasswordInput) {
        addToast('Mật khẩu xác nhận không trùng khớp!', 'error');
        return;
      }

      if (usernameError) {
        addToast(usernameError, 'error');
        return;
      }

      if (emailError) {
        addToast(emailError, 'error');
        return;
      }

      try {
        const uCheck = await api.checkUsername(usernameInput);
        if (uCheck && uCheck.exists) {
          addToast('Tên đăng nhập này đã được sử dụng!', 'error');
          setUsernameError('Tên đăng nhập này đã được sử dụng!');
          return;
        }

        const eCheck = await api.checkEmail(emailInput);
        if (eCheck && eCheck.exists) {
          addToast('Địa chỉ email này đã được đăng ký!', 'error');
          setEmailError('Địa chỉ email này đã được đăng ký!');
          return;
        }
      } catch (err) {
        console.warn(err);
      }

      try {
        await api.register(usernameInput.trim(), emailInput.trim(), passwordInput, repasswordInput);
        addToast('Đăng ký tài khoản thành công! Hãy đăng nhập.', 'success');
        setLoginMode('login');
        setPasswordInput('');
        setRepasswordInput('');
      } catch (error) {
        addToast(error.message || 'Đăng ký không thành công!', 'error');
      }
    }
  };

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-overlay-laser"></div>
      <div className="login-overlay-laser"></div>

      <div className="login-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="login-left-pane">
          <div className="login-left-brand">
            <div className="login-left-logo-container">
              <svg viewBox="0 0 64 64" width="44" height="44" xmlns="http://www.w3.org/2000/svg" className="login-left-logo-svg">
                <defs>
                  <linearGradient id="shieldGradientLeft" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#22C55E" />
                    <stop offset="100%" stopColor="#065F46" />
                  </linearGradient>
                </defs>
                <path
                  d="M32 4 L56 13 V30 C56 48 45 58 32 62 C19 58 8 48 8 30 V13 Z"
                  fill="url(#shieldGradientLeft)"
                />
                <path
                  d="M32 11 L49 17 V30 C49 43 42 50 32 54 C22 50 15 43 15 30 V17 Z"
                  fill="#FFFFFF"
                  fillOpacity="0.15"
                />
                <path
                  d="M32 20 L35 27 L43 28 L37 33 L39 41 L32 37 L25 41 L27 33 L21 28 L29 27 Z"
                  fill="#FACC15"
                />
              </svg>
              <div className="login-left-logo-ring"></div>
            </div>
            <div>
              <h3>Chống Lừa Đảo</h3>
              <p>Hệ Sinh Thế Chống Lừa Đảo</p>
            </div>
          </div>

          <div className="login-features-wrap">
            <div className="login-feature-item">
              <div className="login-feature-icon">
                <CheckCircle2 size={16} />
              </div>
              <div className="login-feature-text">
                <h4>Lưu lịch sử tra cứu</h4>
                <p>Theo dõi và xem lại toàn bộ lịch sử các liên kết, số tài khoản đã kiểm tra.</p>
              </div>
            </div>

            <div className="login-feature-item">
              <div className="login-feature-icon">
                <CheckCircle2 size={16} />
              </div>
              <div className="login-feature-text">
                <h4>Gửi báo cáo nhanh hơn</h4>
                <p>Báo cáo nhanh các hành vi lừa đảo với mức độ ưu tiên duyệt cao từ ban quản trị.</p>
              </div>
            </div>

            <div className="login-feature-item">
              <div className="login-feature-icon">
                <CheckCircle2 size={16} />
              </div>
              <div className="login-feature-text">
                <h4>Giám sát thời gian thực</h4>
                <p> tính năng cảnh báo tự động 24/7 về nguy cơ rò rỉ dữ liệu cá nhân.</p>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'left', zIndex: 2 }}>
            Dự án an ninh mạng cộng đồng phi lợi nhuận.
          </div>
        </div>

        <div className="login-right-pane">
          <button className="login-close-btn" onClick={onClose}>
            <X size={18} />
          </button>

          <div>
            <h2 className="login-right-header">
              {loginMode === 'login' ? 'Đăng nhập' : 'Đăng ký tài khoản'}
            </h2>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-inputs-wrap">
                {loginMode === 'login' ? (
                  <div className="login-field-container">
                    <User size={16} className="login-field-icon" />
                    <input
                      type="text"
                      className="login-field-input"
                      placeholder="Tên đăng nhập hoặc email..."
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      required
                    />
                  </div>
                ) : (
                  <>
                    <div className="login-field-container">
                      <User size={16} className="login-field-icon" />
                      <input
                        type="text"
                        className="login-field-input"
                        placeholder="Tên đăng nhập (username)..."
                        value={usernameInput}
                        onChange={(e) => {
                          setUsernameInput(e.target.value);
                          setUsernameError('');
                        }}
                        onBlur={handleUsernameBlur}
                        required
                      />
                    </div>
                    {usernameError && (
                      <span style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '-0.5rem', marginBottom: '0.5rem', display: 'block', textAlign: 'left', paddingLeft: '0.5rem' }}>
                        {usernameError}
                      </span>
                    )}
                    <div className="login-field-container">
                      <Mail size={16} className="login-field-icon" />
                      <input
                        type="email"
                        className="login-field-input"
                        placeholder="Nhập địa chỉ email..."
                        value={emailInput}
                        onChange={(e) => {
                          setEmailInput(e.target.value);
                          setEmailError('');
                        }}
                        onBlur={handleEmailBlur}
                        required
                      />
                    </div>
                    {emailError && (
                      <span style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '-0.5rem', marginBottom: '0.5rem', display: 'block', textAlign: 'left', paddingLeft: '0.5rem' }}>
                        {emailError}
                      </span>
                    )}
                  </>
                )}

                <div className="login-field-container">
                  <Lock size={16} className="login-field-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="login-field-input"
                    placeholder="Nhập mật khẩu..."
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="login-eye-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {loginMode === 'register' && (
                  <div className="login-field-container">
                    <Lock size={16} className="login-field-icon" />
                    <input
                      type={showRepassword ? 'text' : 'password'}
                      className="login-field-input"
                      placeholder="Nhập lại mật khẩu..."
                      value={repasswordInput}
                      onChange={(e) => setRepasswordInput(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="login-eye-toggle"
                      onClick={() => setShowRepassword(!showRepassword)}
                    >
                      {showRepassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                )}

                {loginMode === 'login' && (
                  <div className="login-forgot-wrap">
                    <button
                      type="button"
                      className="login-forgot-btn"
                      onClick={() => addToast('Chức năng quên mật khẩu đang được xử lý...', 'info')}
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                )}
              </div>

              <button type="submit" className="login-btn-action btn-primary" style={{ width: '100%' }}>
                {loginMode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
              </button>

              <div
                className="login-switch-tab-link"
                onClick={() => {
                  setLoginMode(loginMode === 'login' ? 'register' : 'login');
                  setShowPassword(false);
                  setShowRepassword(false);
                  setPasswordInput('');
                  setRepasswordInput('');
                  setUsernameError('');
                  setEmailError('');
                }}
              >
                {loginMode === 'login' ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập ngay'}
              </div>
            </form>
          </div>

          <div className="login-social-footer">
            <span className="social-footer-label">Hoặc đăng nhập bằng</span>
            <div className="social-circle-row">
              <button
                type="button"
                className="social-circle-btn windows-hello-btn"
                onClick={handleWindowsHelloScan}
                title="Windows Hello"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  <circle cx="12" cy="12" r="4" />
                  <path d="M10 11.5a0.5.5 0 1 1-1 0 0.5.5 0 0 1 1 0zm5 0a0.5.5 0 1 1-1 0 0.5.5 0 0 1 1 0z" fill="currentColor" />
                  <path d="M10 15c.67.67 1.33 1 2 1s1.33-.33 2-1" strokeLinecap="round" />
                </svg>
              </button>
              <button
                type="button"
                className="social-circle-btn passkey-btn"
                onClick={handlePasskeyScan}
                title="Đăng nhập bằng Passkey / FaceID"
              >
                <Key size={18} />
              </button>
              <button
                type="button"
                className="social-circle-btn google-btn"
                onClick={handleGoogleLogin}
                title="Google"
              >
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </button>
              <button
                type="button"
                className="social-circle-btn github-btn"
                onClick={handleGithubLogin}
                title="GitHub"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.31.469-2.38 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.22.694.825.576C20.566 21.797 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </button>
              <button
                type="button"
                className="social-circle-btn facebook-btn"
                onClick={() => addToast('Đăng nhập Facebook đang đồng bộ...', 'info')}
                title="Facebook"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
              <button
                type="button"
                className="social-circle-btn telegram-btn"
                onClick={() => addToast('Đăng nhập Telegram đang đồng bộ...', 'info')}
                title="Telegram"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.82-.79 4.62-1.12 6.36-.14.74-.41.99-.68 1.01-.58.06-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.95 1.23-5.51 3.63-.52.36-.99.53-1.41.52-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.36-.49.99-.74 3.87-1.69 6.45-2.8 7.74-3.32 3.69-1.5 4.45-1.76 4.95-1.77.11 0 .36.03.52.16.13.11.17.26.19.37.02.13.02.43-.01.59z" />
                </svg>
              </button>
              <button
                type="button"
                className="social-circle-btn apple-btn"
                onClick={() => addToast('Đăng nhập Apple ID đang đồng bộ...', 'info')}
                title="Apple ID"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.64.73-1.2 1.87-1.05 2.98 1.12.09 2.27-.58 3-1.42z" />
                </svg>
              </button>
            </div>
          </div>

          <p className="login-legal-subtext">
            Bằng việc tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi.
          </p>
        </div>
      </div>
    </div>
  );
}
