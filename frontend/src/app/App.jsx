import { useState, useEffect, Suspense, useMemo } from 'react';
import { useLocation, useNavigate, useRoutes } from 'react-router-dom';
import { X, CheckCircle2, Shield, Key, AlertCircle } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import {
  Header,
  Footer,
  SplashOverlay,
  BackgroundGlows,
  FloatingActions
} from '@/components';
import FloatingChat from '@/features/chatbot/components/FloatingChat';
import LoginModal from '@/features/auth/components/LoginModal';
import { getAppRoutes } from './routes';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user, logout, isLoginOpen, setIsLoginOpen } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  const handleLogout = async () => {
    await logout(() => {
      addToast('Đã đăng xuất tài khoản thành công.', 'info');
      navigate('/');
    });
  };

  // Sync dark theme class on document body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Scroll to top on pathname change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Track window scroll for scroll-to-top button
  useEffect(() => {
    let hasCrossedThreshold = false;
    const handleScroll = () => {
      const isAboveThreshold = window.scrollY > 300;
      if (isAboveThreshold !== hasCrossedThreshold) {
        hasCrossedThreshold = isAboveThreshold;
        setShowScrollTop(isAboveThreshold);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Determine active tab & layout mode
  const path = location.pathname.toLowerCase();
  let activeTab = 'checker';
  if (path === '/report') activeTab = 'report';
  else if (path === '/privacy' || path === '/privacypolicies') activeTab = 'privacy';

  const isFullPage = path.startsWith('/admin') || path.startsWith('/moderator') || path === '/tro-ly-ai';

  const setActiveTab = (tab) => {
    if (tab === 'checker') {
      navigate('/');
    } else {
      navigate(`/${tab}`);
    }
  };

  // Centralized route elements hook
  const routeList = useMemo(
    () =>
      getAppRoutes({
        addToast,
        setActiveTab,
        onLoginToggle: () => setIsLoginOpen(true),
        onAiChatToggle: () => navigate('/tro-ly-ai'),
        onLogout: handleLogout
      }),
    [addToast, navigate, setIsLoginOpen]
  );

  const routeElements = useRoutes(routeList);

  return (
    <>
      <SplashOverlay />
      <BackgroundGlows />

      {/* Global Navigation */}
      {!isFullPage && (
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onAiChatToggle={() => navigate('/tro-ly-ai')}
          onLoginToggle={() => setIsLoginOpen(!isLoginOpen)}
          addToast={addToast}
          isLoggedIn={isLoggedIn}
          userName={user.name}
          userAvatar={user.avatar}
          onLogout={handleLogout}
          onDashboardClick={() => navigate('/dashboard')}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />
      )}

      {/* Main Routed Content with Suspense Loading */}
      <main style={{ flexGrow: 1 }}>
        <Suspense
          fallback={
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '50vh',
                gap: '0.75rem',
                color: 'var(--text-muted)'
              }}
            >
              <div
                className="spinner"
                style={{
                  width: '24px',
                  height: '24px',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  color: 'var(--primary)'
                }}
              />
              <span style={{ fontSize: '0.85rem' }}>Đang tải trang...</span>
            </div>
          }
        >
          {routeElements}
        </Suspense>
      </main>

      {/* Footer */}
      {!isFullPage && <Footer setActiveTab={setActiveTab} />}

      {/* Theme Toggling & Scroll Actions */}
      {!isFullPage && (
        <FloatingActions
          showScrollTop={showScrollTop}
          scrollToTop={scrollToTop}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />
      )}

      {/* AI Floating Chat Assistant */}
      {!isFullPage && (
        <FloatingChat
          showScrollTop={showScrollTop}
        />
      )}

      {/* Authentication Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        addToast={addToast}
      />

      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts &&
          toasts.map((toast) => (
            <div key={toast.id} className={`toast-item toast-${toast.type}`}>
              <div className="toast-icon-wrap">
                {toast.type === 'success' && <CheckCircle2 size={18} className="toast-icon success" />}
                {toast.type === 'error' && <AlertCircle size={18} className="toast-icon error" />}
                {toast.type === 'info' && <Shield size={18} className="toast-icon info" />}
                {toast.type === 'warning' && <Key size={18} className="toast-icon warning" />}
              </div>
              <div className="toast-message">{toast.message}</div>
              <button className="toast-close" onClick={() => removeToast(toast.id)}>
                <X size={14} />
              </button>
            </div>
          ))}
      </div>
    </>
  );
}
