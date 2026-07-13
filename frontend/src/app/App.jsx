import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { X, CheckCircle2, Shield, Key, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SplashOverlay from '../components/SplashOverlay';
import Home from '../pages/Home/Home';

// Lazy loaded page components for bundle code splitting
const ReportForm = lazy(() => import('../pages/Report'));
const PrivacyPolicy = lazy(() => import('../pages/Privacy/PrivacyPolicy'));
const ScanDetail = lazy(() => import('../pages/ScanDetail'));
const AiChatbotFullPage = lazy(() => import('../pages/AiChatbot'));
const UserDashboard = lazy(() => import('../pages/Dashboard'));
const AdminLogin = lazy(() => import('../pages/AdminLogin'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const ModeratorDashboard = lazy(() => import('../pages/ModeratorDashboard'));

import { useToast } from '../hooks/useToast';

// Refactored common components
import BackgroundGlows from '../components/BackgroundGlows';
import FloatingActions from '../components/FloatingActions';
import FloatingChat from '../features/chatbot/components/FloatingChat';
import LoginModal from '../features/auth/components/LoginModal';
import ProtectedRoute from '../components/ProtectedRoute';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { toasts, addToast, removeToast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || "");
  const [userAvatar, setUserAvatar] = useState(() => localStorage.getItem('userAvatar') || '');

  const handleLogout = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.logout(token);
      }
    } catch (error) {
      console.warn('API logout failed, performing local logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userAvatar');
      setIsLoggedIn(false);
      setUserName('anonymous');
      setUserAvatar('');
      if (addToast) {
        addToast('Đã đăng xuất tài khoản thành công.', 'info');
      }
      navigate('/');
    }
  }, [navigate, addToast]);

  // Reopen floating chatbot if redirected from full-page view via minimize query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('chat') === 'open') {
      setTimeout(() => setIsAiChatOpen(true), 0);
      navigate('/', { replace: true });
    }
  }, [location.search, navigate]);

  // Fetch and update user profile on mount or when auth-change is dispatched
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        if (token.startsWith('mock-admin-') || token.startsWith('mock-moderator-')) {
          setIsLoggedIn(true);
          return;
        }
        try {
          const res = await api.getMe(token);
          let nameToSet = '';
          let emailToSet = '';
          let avatarToSet = '';

          if (res.user) {
            nameToSet = res.user.name || res.user.username || '';
            emailToSet = res.user.email || '';
            avatarToSet = res.user.avatar || '';
          } else {
            nameToSet = res.name || res.username || '';
            emailToSet = res.email || '';
            avatarToSet = res.avatar || '';
          }

          if (nameToSet) {
            setUserName(nameToSet);
            localStorage.setItem('userName', nameToSet);
          }
          if (emailToSet) {
            localStorage.setItem('userEmail', emailToSet);
          }
          if (avatarToSet) {
            setUserAvatar(avatarToSet);
            localStorage.setItem('userAvatar', avatarToSet);
          }
          setIsLoggedIn(true);
        } catch (error) {
          console.warn('Không thể đồng bộ thông tin tài khoản:', error);
          if (error.status) {
            handleLogout();
          }
        }
      } else {
        setIsLoggedIn(false);
        setUserName('');
        setUserAvatar('');
      }
    };
    
    fetchProfile();
    window.addEventListener('auth-change', fetchProfile);
    return () => {
      window.removeEventListener('auth-change', fetchProfile);
    };
  }, [handleLogout]);

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
    setIsDarkMode(prev => !prev);
  };

  // Determine activeTab based on pathname
  let activeTab = 'checker';
  const path = location.pathname.toLowerCase();

  if (path === '/report') activeTab = 'report';
  else if (path === '/privacy' || path === '/privacypolicies') activeTab = 'privacy';

  const isAdminPage = path.startsWith('/admin');

  const setActiveTab = (tab) => {
    if (tab === 'checker') {
      navigate('/');
    } else {
      navigate(`/${tab}`);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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


  return (
    <>
      <SplashOverlay />

      {/* Cyber ambient grid and glows background */}
      <BackgroundGlows />

      {/* Global Navigation */}
      {!isAdminPage && (
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onAiChatToggle={() => setIsAiChatOpen(!isAiChatOpen)}
          onLoginToggle={() => setIsLoginOpen(!isLoginOpen)}
          addToast={addToast}
          isLoggedIn={isLoggedIn}
          userName={userName}
          userAvatar={userAvatar}
          onLogout={handleLogout}
          onDashboardClick={() => navigate('/dashboard')}
        />
      )}

      {/* Tab Routing views using react-router-dom */}
      <main style={{ flexGrow: 1 }}>
        <Suspense fallback={
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '0.75rem', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ width: '24px', height: '24px', borderWidth: '2px', borderStyle: 'solid', color: 'var(--primary)' }}></div>
            <span style={{ fontSize: '0.85rem' }}>Đang tải trang...</span>
          </div>
        }>
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  addToast={addToast}
                  onAiChatToggle={() => setIsAiChatOpen(!isAiChatOpen)}
                />
              }
            />
          
            <Route path="/report" element={<ReportForm addToast={addToast} setActiveTab={setActiveTab} onLoginToggle={() => setIsLoginOpen(true)} />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/detail/:target" element={<ScanDetail addToast={addToast} />} />
            <Route path="/tro-ly-ai" element={<AiChatbotFullPage addToast={addToast} />} />
            <Route path="/dashboard/*" element={
              <ProtectedRoute>
                <UserDashboard addToast={addToast} onLogout={handleLogout} />
              </ProtectedRoute>
            } />
            <Route path="/admin/login" element={<AdminLogin addToast={addToast} />} />
            <Route path="/admin/*" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard addToast={addToast} onLogout={handleLogout} />
              </ProtectedRoute>
            } />

            <Route path="/moderator" element={
              <ProtectedRoute requiredRole="moderator">
                <ModeratorDashboard addToast={addToast} onLogout={handleLogout} />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {/* Redeveloped Authentic Footer */}
      {!isAdminPage && <Footer setActiveTab={setActiveTab} />}

      {/* Theme Toggling & Scroll Actions */}
      {!isAdminPage && (
        <FloatingActions
          showScrollTop={showScrollTop}
          scrollToTop={scrollToTop}
          isAiChatOpen={isAiChatOpen}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />
      )}

      {/* AI Floating Chat Assistant */}
      {!isAdminPage && (
        <FloatingChat
          isAiChatOpen={isAiChatOpen}
          setIsAiChatOpen={setIsAiChatOpen}
          showScrollTop={showScrollTop}
        />
      )}

      {/* Authentication Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        addToast={addToast}
        setIsLoggedIn={setIsLoggedIn}
        setUserName={setUserName}
        setUserAvatar={setUserAvatar}
      />

      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts && toasts.map((toast) => (
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
