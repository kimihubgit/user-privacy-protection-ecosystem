import ModeratorDashboard from '../features/moderator/components/ModeratorDashboard';

export default function ModeratorDashboardPage({ addToast, onLogout }) {
  return <ModeratorDashboard addToast={addToast} onLogout={onLogout} />;
}
