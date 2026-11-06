import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components';
import Home from '@/pages/Home/Home';

// Lazy loaded page components for bundle code splitting
const ReportForm = lazy(() => import('@/pages/Report'));
const PrivacyPolicy = lazy(() => import('@/pages/Privacy/PrivacyPolicy'));
const ScanDetail = lazy(() => import('@/pages/ScanDetail'));
const AiChatbotFullPage = lazy(() => import('@/pages/AiChatbot'));
const TikTokNewsPage = lazy(() => import('@/pages/News'));
const UserDashboard = lazy(() => import('@/pages/Dashboard'));
const AdminLogin = lazy(() => import('@/pages/AdminLogin'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const ModeratorDashboard = lazy(() => import('@/pages/ModeratorDashboard'));

/**
 * Global application routes configuration
 * @param {Object} props
 * @param {Function} props.addToast
 * @param {Function} props.setActiveTab
 * @param {Function} props.onLoginToggle
 * @param {Function} props.onAiChatToggle
 * @param {Function} props.onLogout
 */
export const getAppRoutes = ({ addToast, setActiveTab, onLoginToggle, onAiChatToggle, onLogout }) => [
  {
    path: '/',
    element: <Home addToast={addToast} onAiChatToggle={onAiChatToggle} />
  },
  {
    path: '/report',
    element: <ReportForm addToast={addToast} setActiveTab={setActiveTab} onLoginToggle={onLoginToggle} />
  },
  {
    path: '/privacy',
    element: <PrivacyPolicy />
  },
  {
    path: '/privacypolicies',
    element: <Navigate to="/privacy" replace />
  },
  {
    path: '/news',
    element: <TikTokNewsPage />
  },
  {
    path: '/detail/:target',
    element: <ScanDetail addToast={addToast} />
  },
  {
    path: '/tro-ly-ai',
    element: <AiChatbotFullPage addToast={addToast} />
  },
  {
    path: '/dashboard/*',
    element: (
      <ProtectedRoute>
        <UserDashboard addToast={addToast} onLogout={onLogout} />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/login',
    element: <AdminLogin addToast={addToast} />
  },
  {
    path: '/admin/*',
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminDashboard addToast={addToast} onLogout={onLogout} />
      </ProtectedRoute>
    )
  },
  {
    path: '/moderator',
    element: (
      <ProtectedRoute requiredRole="moderator">
        <ModeratorDashboard addToast={addToast} onLogout={onLogout} />
      </ProtectedRoute>
    )
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
];
