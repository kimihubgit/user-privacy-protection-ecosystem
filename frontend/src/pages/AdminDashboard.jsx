import AdminDashboard from '../features/admin/components/AdminDashboard';

export default function AdminDashboardPage({ addToast, onLogout }) {
  return <AdminDashboard addToast={addToast} onLogout={onLogout} />;
}
