import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Key, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import './AdminLogin.css';

export default function AdminLogin({ addToast }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      addToast('Vui lòng nhập đầy đủ thông tin đăng nhập', 'error');
      return;
    }

    setIsLoading(true);

    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock admin credentials check — only available in development environment
    if (import.meta.env.DEV && username.trim().toLowerCase() === 'admin' && password.trim() === 'admin123') {
      localStorage.setItem('token', 'mock-admin-token-' + Date.now());
      localStorage.setItem('userName', 'Quản trị viên');
      localStorage.setItem('userEmail', 'admin@shield.vn');
      window.dispatchEvent(new Event('auth-change'));

      addToast('Đăng nhập Quản trị viên thành công! (DEV Mode)', 'success');

      // Delay redirect slightly
      setTimeout(() => {
        setIsLoading(false);
        navigate('/admin');
      }, 800);
    } else {
      addToast('Tên đăng nhập hoặc mật khẩu không chính xác! (Trong môi trường PROD, hệ thống yêu cầu cấu hình API xác thực)', 'error');
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-ambient-grid"></div>

      <div className="admin-login-container">

        {/* Logo Shield Header */}
        <div className="admin-login-header">
          <div className="admin-login-shield-sphere">
            <Shield size={36} />
            <div className="admin-shield-glow"></div>
          </div>
          <h1 className="admin-login-title">
            COMMAND <span className="gradient-text-danger">CENTER</span>
          </h1>
          <p className="admin-login-subtitle">Hệ thống quản trị an ninh mạng S.H.I.E.L.D</p>
        </div>

        {/* Login Panel */}
        <div className="admin-login-card glass-card">
          <div className="admin-card-glow"></div>

          <form className="admin-login-form" onSubmit={handleLogin}>

            <div className="report-field">
              <label className="report-field-label">Tài khoản quản trị</label>
              <div className="report-input-wrap">
                <Shield size={16} className="report-input-icon" />
                <input
                  type="text"
                  className="report-input"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="report-field" style={{ marginTop: '1.25rem' }}>
              <label className="report-field-label">Mật khẩu bảo mật</label>
              <div className="report-input-wrap">
                <Key size={16} className="report-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="report-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '15px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                height: '52px',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: 800,
                marginTop: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 6px 20px rgba(239, 68, 68, 0.15)',
                background: 'linear-gradient(135deg, #ef4444 0%, #ff3e6c 100%)',
                borderColor: '#ef4444'
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  Đang xác thực...
                </>
              ) : (
                <>
                  <Shield size={18} />
                  Đăng nhập hệ thống
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back Link */}
        <button
          className="admin-login-back-btn"
          onClick={() => navigate('/')}
          disabled={isLoading}
        >
          <ArrowLeft size={16} />
          Quay lại Trang chủ
        </button>

      </div>
    </div>
  );
}
