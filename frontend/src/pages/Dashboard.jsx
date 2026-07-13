import UserDashboard from '../features/dashboard/components/UserDashboard';

export default function DashboardPage({ addToast, onLogout }) {
  return <UserDashboard addToast={addToast} onLogout={onLogout} />;
}
