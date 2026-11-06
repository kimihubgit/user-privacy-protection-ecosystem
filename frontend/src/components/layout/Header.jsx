import { useState, useEffect } from 'react';
import { Menu, X, LogIn, LogOut, Grid, FileText, User, ShieldCheck, Settings, ShieldAlert, Search, Clipboard, Sun, Moon, MessageSquare, HelpCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function Header({
  activeTab,
  setActiveTab,
  onLoginToggle,
  isLoggedIn: propIsLoggedIn,
  onLogout: propOnLogout,
  onDashboardClick,
  userName: propUserName,
  userAvatar: propUserAvatar,
  isDarkMode,
  toggleTheme
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  const isScanDetailPage = location.pathname.startsWith('/detail');
  const currentTarget = isScanDetailPage ? decodeURIComponent(location.pathname.replace(/^\/detail\/?/, '')) : '';

  const [headerSearchVal, setHeaderSearchVal] = useState(currentTarget);

  useEffect(() => {
    if (isScanDetailPage) {
      setHeaderSearchVal(currentTarget);
    }
  }, [currentTarget, isScanDetailPage]);

  const handleHeaderSearch = (e) => {
    if (e) e.preventDefault();
    const trimmed = headerSearchVal.trim();
    if (!trimmed) return;
    navigate(`/detail/${encodeURIComponent(trimmed)}`, { state: { autoScan: true } });
  };

  const handleHeaderPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setHeaderSearchVal(text);
    } catch (err) {
      console.error('Failed to paste from clipboard: ', err);
    }
  };

  const isLoggedIn = propIsLoggedIn !== undefined ? propIsLoggedIn : auth.isLoggedIn;
  const userName = propUserName !== undefined ? propUserName : (auth.user?.name || '');
  const userAvatar = propUserAvatar !== undefined ? propUserAvatar : (auth.user?.avatar || '');
  const onLogout = propOnLogout || auth.logout;
  const handleOpenLogin = onLoginToggle || (() => auth.setIsLoginOpen(true));

  const [isOpen, setIsOpen] = useState(false);
  const [tiltStyle, setTiltStyle] = useState({ transform: 'perspective(300px) rotateX(0deg) rotateY(0deg) scale(1)' });
  const [isVisible, setIsVisible] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.header-profile-dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isDropdownOpen]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateHeaderVisibility = () => {
      const currentScrollY = window.scrollY;

      // If mobile drawer menu is open, do not hide the header
      if (isOpen) {
        setIsVisible(true);
        lastScrollY = currentScrollY;
        ticking = false;
        return;
      }

      // Add tolerance (e.g. scroll at least 10px to trigger change) to prevent jitter
      if (Math.abs(currentScrollY - lastScrollY) < 10) {
        ticking = false;
        return;
      }

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      lastScrollY = currentScrollY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeaderVisibility);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [isOpen]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Max angle in degrees for the tilt effect
    const maxTilt = 22;

    // Closer to mouse tilts inward/backward (sinks down)
    const tiltX = ((y - centerY) / centerY) * maxTilt;
    const tiltY = -((x - centerX) / centerX) * maxTilt;

    setTiltStyle({
      transform: `perspective(300px) rotateX(${tiltX.toFixed(1)}deg) rotateY(${tiltY.toFixed(1)}deg) scale(1.05)`,
      transition: 'transform 0.05s linear' // Snappy movement to track pointer
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(300px) rotateX(0deg) rotateY(0deg) scale(1)',
      transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)' // Smooth snapback animation
    });
  };

  const handleNavClick = (id) => {
    setIsOpen(false);

    const sectionMap = {
      'scam-types': '.scam-types-section',
      'features': '.connection-flow-section',
      'process': '.process-steps-section',
      'faq': '.faq-dashboard-section',
      'partners': '.partners-global-section',
      'extensions': '#download-extension'
    };

    const targetSelector = sectionMap[id];

    if (targetSelector) {
      const scrollWithOffset = (sel) => {
        const el = document.querySelector(sel);
        if (el) {
          const topOffset = el.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: topOffset, behavior: 'smooth' });
        }
      };

      if (window.location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          scrollWithOffset(targetSelector);
        }, 250);
      } else {
        scrollWithOffset(targetSelector);
      }
    } else {
      setActiveTab(id);
    }
  };

  return (
    <header className={`app-header ${!isVisible ? 'header-hidden' : ''} ${isScanDetailPage ? 'vt-header-bar' : ''}`}>
      {isScanDetailPage ? (
        /* ================= VIRUSTOTAL FULL-WIDTH HEADER ================= */
        <div className="vt-header-inner">
          {/* Authentic Logo */}
          <div
            className="brand vt-brand-compact"
            onClick={() => handleNavClick('checker')}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              perspective: '300px',
              padding: '2px 4px',
              flexShrink: 0
            }}
          >
            <div style={{ ...tiltStyle, display: 'flex', transformStyle: 'preserve-3d' }}>
              <svg viewBox="0 0 64 64" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="shieldGradientVT" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#22C55E" />
                    <stop offset="100%" stopColor="#065F46" />
                  </linearGradient>
                </defs>
                <path
                  d="M32 4 L56 13 V30 C56 48 45 58 32 62 C19 58 8 48 8 30 V13 Z"
                  fill="url(#shieldGradientVT)"
                />
                <path
                  d="M32 11 L49 17 V30 C49 43 42 50 32 54 C22 50 15 43 15 30 V17 Z"
                  fill="#FFFFFF"
                  fillOpacity="0.18"
                />
                <path
                  d="M32 20 L35 27 L43 28 L37 33 L39 41 L32 37 L25 41 L27 33 L21 28 L29 27 Z"
                  fill="#FACC15"
                />
              </svg>
            </div>
          </div>

          {/* Full-width Search Bar (Stretches all the way across) */}
          <form className="vt-header-search-form" onSubmit={handleHeaderSearch}>
            <Search size={15} className="vt-header-search-icon" />
            <input
              type="text"
              className="vt-header-search-input"
              value={headerSearchVal}
              onChange={(e) => setHeaderSearchVal(e.target.value)}
              placeholder="Nhập URL, IP, tên miền, số điện thoại, số tài khoản, email..."
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            {headerSearchVal ? (
              <button
                type="button"
                className="vt-header-clear-btn"
                onClick={() => setHeaderSearchVal('')}
                title="Xóa nội dung"
              >
                <X size={13} />
              </button>
            ) : (
              <button
                type="button"
                className="vt-header-paste-btn"
                onClick={handleHeaderPaste}
                title="Dán từ Clipboard"
              >
                <Clipboard size={13} />
              </button>
            )}
            <button
              type="submit"
              className="vt-header-submit-btn"
              title="Phân tích mục tiêu (Enter)"
              disabled={!headerSearchVal.trim()}
            >
              <kbd className="vt-header-enter-kbd">↵</kbd>
            </button>
          </form>

          {/* VirusTotal Right Utility Tools */}
          <div className="vt-header-right-tools">
            <div className="vt-tool-divider"></div>

            <button
              type="button"
              className="vt-tool-icon-btn"
              onClick={() => navigate('/tro-ly-ai')}
              title="Trợ lý AI"
            >
              <MessageSquare size={16} />
              <span className="vt-tool-badge-dot"></span>
            </button>

            <button
              type="button"
              className="vt-tool-icon-btn"
              onClick={toggleTheme}
              title={isDarkMode ? "Giao diện sáng" : "Giao diện tối"}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <div className="vt-tool-divider"></div>

            {!isLoggedIn ? (
              <div className="vt-header-auth-group">
                <button
                  type="button"
                  className="vt-header-signin-text"
                  onClick={handleOpenLogin}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  className="vt-header-signup-pill"
                  onClick={() => handleNavClick('report')}
                >
                  Báo cáo
                </button>
              </div>
            ) : (
              <div className="header-profile-dropdown-container">
                <button
                  className="header-avatar-btn vt-avatar-btn"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  title="Tài khoản"
                >
                  <div className="header-avatar-circle" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {userAvatar ? (
                      <img src={userAvatar} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      userName ? userName.charAt(0).toUpperCase() : 'U'
                    )}
                  </div>
                  <span className="live-pulse-dot header-avatar-pulse"></span>
                </button>

                {isDropdownOpen && (
                  <div className="header-profile-dropdown-menu">
                    <div className="dropdown-user-info">
                      <p className="dropdown-username">{userName || 'Hội viên'}</p>
                      <p className="dropdown-role">{userName && userName.toLowerCase().includes('admin') ? 'Quản trị viên' : 'Thành viên'}</p>
                    </div>
                    <hr className="dropdown-divider" />
                    {userName && userName.toLowerCase().includes('admin') && (
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate('/dashboard/admin');
                        }}
                        style={{ color: 'var(--primary)', fontWeight: 'bold' }}
                      >
                        <ShieldAlert size={16} className="dropdown-item-icon" style={{ color: 'var(--primary)' }} />
                        Quản lý hệ thống
                      </button>
                    )}
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate('/dashboard/overview');
                      }}
                    >
                      <Grid size={16} className="dropdown-item-icon" />
                      Bảng điều khiển
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate('/dashboard/myreports');
                      }}
                    >
                      <FileText size={16} className="dropdown-item-icon" />
                      Báo cáo của tôi
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate('/dashboard/profile');
                      }}
                    >
                      <User size={16} className="dropdown-item-icon" />
                      Hồ sơ cá nhân
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate('/dashboard/digitalprofile');
                      }}
                    >
                      <ShieldCheck size={16} className="dropdown-item-icon" />
                      Hồ sơ số
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate('/dashboard/settings');
                      }}
                    >
                      <Settings size={16} className="dropdown-item-icon" />
                      Cài đặt
                    </button>
                    <button
                      className="dropdown-item logout"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onLogout();
                      }}
                    >
                      <LogOut size={16} className="dropdown-item-icon" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================= STANDARD FULL HEADER ================= */
        <div className="container header-container">

          {/* Left Side: Authentic Logo with 3D Parallax Tilt */}
          <div
            className="brand"
            onClick={() => handleNavClick('checker')}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              perspective: '300px',
              padding: '4px',
              flexShrink: 0
            }}
          >
            <div style={{ ...tiltStyle, display: 'flex', transformStyle: 'preserve-3d' }}>
              <svg viewBox="0 0 64 64" width="38" height="38" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="shieldGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#22C55E" />
                    <stop offset="100%" stopColor="#065F46" />
                  </linearGradient>
                </defs>
                <path
                  d="M32 4 L56 13 V30 C56 48 45 58 32 62 C19 58 8 48 8 30 V13 Z"
                  fill="url(#shieldGradient)"
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
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav" style={{ marginLeft: '2.5rem', marginRight: 'auto' }}>
            <ul className="nav-menu">
              <li>
                <button
                  className="nav-link"
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/news');
                  }}
                >
                  Tin tức
                </button>
              </li>

              <li>
                <button
                  className="nav-link"
                  onClick={() => handleNavClick('scam-types')}
                >
                  Loại lừa đảo
                </button>
              </li>

              <li>
                <button
                  className="nav-link"
                  onClick={() => handleNavClick('features')}
                >
                  Tính năng
                </button>
              </li>

              <li>
                <button
                  className="nav-link"
                  onClick={() => handleNavClick('process')}
                >
                  Quy trình
                </button>
              </li>

              <li>
                <button
                  className="nav-link"
                  onClick={() => handleNavClick('faq')}
                >
                  Hỏi đáp
                </button>
              </li>
            </ul>
          </nav>

          {/* Right Side: Statuses & Call To Action Buttons */}
          <div className="header-actions-wrap">
            <div className="vn-flag-circle" title="Tiếng Việt">
              <svg viewBox="0 0 30 30" width="22" height="22">
                <circle cx="15" cy="15" r="15" fill="#DA251D" />
                <polygon points="15,7.5 17,11.5 21.5,12 18,15 19,19.5 15,17 11,19.5 12,15 8.5,12 13,11.5" fill="#FFFF00" />
              </svg>
            </div>

            <button className="header-action-btn primary-btn" onClick={() => handleNavClick('extensions')}>
              Bảo vệ ngay
            </button>

            <button className="header-action-btn danger-btn" onClick={() => handleNavClick('report')}>
              Báo cáo
            </button>

            {!isLoggedIn && (
              <button className="header-action-btn outline-btn" onClick={handleOpenLogin}>
                <LogIn size={15} />
                <span>Đăng nhập</span>
              </button>
            )}

          {isLoggedIn && (
            <div className="header-profile-dropdown-container">
              <button
                className="header-avatar-btn"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                title="Tài khoản"
              >
                <div className="header-avatar-circle" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {userAvatar ? (
                    <img src={userAvatar} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    userName ? userName.charAt(0).toUpperCase() : 'U'
                  )}
                </div>
                <span className="live-pulse-dot header-avatar-pulse"></span>
              </button>

              {isDropdownOpen && (
                <div className="header-profile-dropdown-menu">
                  <div className="dropdown-user-info">
                    <p className="dropdown-username">{userName || 'Hội viên'}</p>
                    <p className="dropdown-role">{userName && userName.toLowerCase().includes('admin') ? 'Quản trị viên' : 'Thành viên'}</p>
                  </div>
                  <hr className="dropdown-divider" />
                  {userName && userName.toLowerCase().includes('admin') && (
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate('/dashboard/admin');
                      }}
                      style={{ color: 'var(--primary)', fontWeight: 'bold' }}
                    >
                      <ShieldAlert size={16} className="dropdown-item-icon" style={{ color: 'var(--primary)' }} />
                      Quản lý hệ thống
                    </button>
                  )}
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate('/dashboard/overview');
                    }}
                  >
                    <Grid size={16} className="dropdown-item-icon" />
                    Bảng điều khiển
                  </button>

                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate('/dashboard/myreports');
                    }}
                  >
                    <FileText size={16} className="dropdown-item-icon" />
                    Báo cáo của tôi
                  </button>

                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate('/dashboard/profile');
                    }}
                  >
                    <User size={16} className="dropdown-item-icon" />
                    Hồ sơ cá nhân
                  </button>

                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate('/dashboard/digitalprofile');
                    }}
                  >
                    <ShieldCheck size={16} className="dropdown-item-icon" />
                    Hồ sơ số
                  </button>

                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate('/dashboard/settings');
                    }}
                  >
                    <Settings size={16} className="dropdown-item-icon" />
                    Cài đặt
                  </button>

                  <button
                    className="dropdown-item logout"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onLogout();
                    }}
                  >
                    <LogOut size={16} className="dropdown-item-icon" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}

          <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

      </div>
      )}

      {/* Mobile Drawer Navigation */}
      {isOpen && (
        <div className="mobile-drawer-nav">
          <button
            className="mobile-nav-item"
            onClick={() => {
              setIsOpen(false);
              navigate('/news');
            }}
          >
            Tin tức
          </button>

          <button className="mobile-nav-item" onClick={() => handleNavClick('scam-types')}>
            Loại lừa đảo
          </button>

          <button className="mobile-nav-item" onClick={() => handleNavClick('features')}>
            Tính năng
          </button>

          <button className="mobile-nav-item" onClick={() => handleNavClick('process')}>
            Quy trình
          </button>

          <button className="mobile-nav-item" onClick={() => handleNavClick('faq')}>
            Hỏi đáp
          </button>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }} />
          {isLoggedIn ? (
            <>
              <button className="mobile-nav-item" onClick={() => { setIsOpen(false); onDashboardClick(); }}>
                Bảng điều khiển ({userName})
              </button>
              <button className="mobile-nav-item" style={{ color: '#ef4444' }} onClick={() => { setIsOpen(false); onLogout(); }}>
                Đăng xuất
              </button>
            </>
          ) : (
            <button className="mobile-nav-item" onClick={() => { setIsOpen(false); handleOpenLogin(); }}>
              Đăng nhập
            </button>
          )}
          <button className="mobile-nav-item green-highlight" onClick={() => handleNavClick('extensions')}>
            Bảo vệ ngay
          </button>
          <button className="mobile-nav-item green-highlight" onClick={() => handleNavClick('report')}>
            Báo cáo
          </button>
        </div>
      )}
    </header>
  );
}
