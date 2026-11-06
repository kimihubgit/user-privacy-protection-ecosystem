import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Lock, Eye, EyeOff, CheckCircle2, User, Key } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function LoginModal({
  isOpen,
  onClose,
  addToast,
  setIsLoggedIn,
  setUserName,
  setUserAvatar
}) {
  const navigate = useNavigate();
  const auth = useAuth();
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
    const userObj = res.user || res;
    let nameToSet = userObj.name || userObj.username || defaultName || 'Hội viên';
    const emailToSet = userObj.email || '';
    const avatarToSet = userObj.avatar || '';
    const roleToSet = userObj.role || 'user';

    const token = res.token || res.accessToken || (res.data && (res.data.token || res.data.accessToken));
    if (token) {
      auth.login(token, {
        name: nameToSet,
        email: emailToSet,
        avatar: avatarToSet,
        role: roleToSet
      });
    }

    if (setIsLoggedIn) setIsLoggedIn(true);
    if (setUserName) setUserName(nameToSet);
    if (setUserAvatar && avatarToSet) setUserAvatar(avatarToSet);
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
      addToast?.('Đang gọi Passkey / Windows Hello...', 'info');
      const res = await api.loginWithPasskey();
      syncProfile(res, 'Khải Nguyễn');
      addToast?.('Đăng nhập bằng Passkey thành công!', 'success');
      onClose();
      navigate(getRedirectPath(res));
    } catch (error) {
      console.error(error);
      addToast?.(error.message || 'Xác thực Passkey thất bại!', 'error');
    }
  };

  const handleWindowsHelloScan = handlePasskeyScan;

  const handleGoogleCredentialResponse = async (response) => {
    try {
      if (!response.credential) {
        addToast?.('Không nhận được thông tin xác thực từ Google.', 'error');
        return;
      }

      const res = await api.socialLogin('google', response.credential);
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
        if (payload.name) defaultName = payload.name;
      } catch (e) {
        console.warn('Decode Google JWT failed:', e);
      }

      syncProfile(res, defaultName);
      addToast?.('Đăng nhập bằng Google thành công!', 'success');
      onClose();
      navigate(getRedirectPath(res));
    } catch (error) {
      console.error(error);
      addToast?.(error.message || 'Đăng nhập Google thất bại!', 'error');
    }
  };

  const handleGithubLogin = async () => {
    try {
      addToast?.('Đang kết nối tới GitHub...', 'info');
      const res = await api.socialLogin(
        'github',
        'git-mock-code-' + Math.floor(100000 + Math.random() * 900000)
      );

      syncProfile(res, 'Khải Nguyễn (GitHub)');
      addToast?.('Đăng nhập bằng GitHub thành công!', 'success');
      onClose();
      navigate(getRedirectPath(res));
    } catch (err) {
      console.error(err);
      addToast?.(err.message || 'Đăng nhập GitHub thất bại!', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loginMode === 'login') {
      if (usernameInput.trim().length < 3) {
        addToast?.('Tên đăng nhập phải chứa ít nhất 3 ký tự!', 'error');
        return;
      }
      if (passwordInput.length < 6) {
        addToast?.('Mật khẩu phải chứa ít nhất 6 ký tự!', 'error');
        return;
      }

      try {
        const res = await api.login(usernameInput.trim(), passwordInput);
        addToast?.('Đăng nhập thành công!', 'success');
        syncProfile(res, usernameInput);
        onClose();
        navigate(getRedirectPath(res));
      } catch (error) {
        addToast?.(error.message || 'Tên đăng nhập hoặc mật khẩu không chính xác!', 'error');
      }
    } else {
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(usernameInput)) {
        addToast?.('Tên đăng nhập từ 3-20 ký tự, chỉ chứa chữ cái, số và dấu gạch dưới (_), không chứa khoảng trắng!', 'error');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput)) {
        addToast?.('Email không đúng định dạng!', 'error');
        return;
      }

      if (passwordInput.length < 6) {
        addToast?.('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
        return;
      }

      if (passwordInput !== repasswordInput) {
        addToast?.('Mật khẩu nhập lại không khớp!', 'error');
        return;
      }

      try {
        await api.register(usernameInput.trim(), emailInput.trim(), passwordInput);
        addToast?.('Đăng ký tài khoản thành công! Hãy đăng nhập.', 'success');
        setLoginMode('login');
      } catch (error) {
        addToast?.(error.message || 'Đăng ký thất bại, vui lòng thử lại!', 'error');
      }
    }
  };

  return (
    <div className="login-modal-backdrop" onClick={onClose}>
      <div className="login-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <button className="login-modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="login-modal-header">
          <h2>{loginMode === 'login' ? 'Đăng nhập hệ thống' : 'Đăng ký tài khoản'}</h2>
          <p>Hệ sinh thái bảo vệ quyền riêng tư & An toàn mạng Việt Nam</p>
        </div>

        <div className="login-modal-tabs">
          <button
            type="button"
            className={`login-tab-btn ${loginMode === 'login' ? 'active' : ''}`}
            onClick={() => setLoginMode('login')}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            className={`login-tab-btn ${loginMode === 'register' ? 'active' : ''}`}
            onClick={() => setLoginMode('register')}
          >
            Đăng ký
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên đăng nhập</label>
            <div className="input-group">
              <span className="input-icon"><User size={18} /></span>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                onBlur={handleUsernameBlur}
                placeholder="Nhập tên đăng nhập"
                required
              />
            </div>
            {usernameError && <p className="error-text">{usernameError}</p>}
          </div>

          {loginMode === 'register' && (
            <div className="form-group">
              <label>Địa chỉ Email</label>
              <div className="input-group">
                <span className="input-icon"><Mail size={18} /></span>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onBlur={handleEmailBlur}
                  placeholder="name@domain.com"
                  required
                />
              </div>
              {emailError && <p className="error-text">{emailError}</p>}
            </div>
          )}

          <div className="form-group">
            <label>Mật khẩu</label>
            <div className="input-group">
              <span className="input-icon"><Lock size={18} /></span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Nhập mật khẩu"
                required
              />
              <button
                type="button"
                className="input-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {loginMode === 'register' && (
            <div className="form-group">
              <label>Xác nhận mật khẩu</label>
              <div className="input-group">
                <span className="input-icon"><Lock size={18} /></span>
                <input
                  type={showRepassword ? 'text' : 'password'}
                  value={repasswordInput}
                  onChange={(e) => setRepasswordInput(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  required
                />
                <button
                  type="button"
                  className="input-eye-btn"
                  onClick={() => setShowRepassword(!showRepassword)}
                >
                  {showRepassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="login-submit-btn">
            {loginMode === 'login' ? 'Đăng nhập ngay' : 'Đăng ký ngay'}
          </button>
        </form>

        <div className="social-divider">
          <span>Hoặc tiếp tục với</span>
        </div>

        <div className="social-actions-grid">
          <button type="button" className="social-btn passkey-btn" onClick={handlePasskeyScan}>
            <Key size={18} />
            <span>Passkey / Hello</span>
          </button>
          <button type="button" className="social-btn github-btn" onClick={handleGithubLogin}>
            <span>GitHub</span>
          </button>
        </div>
      </div>
    </div>
  );
}
