import { useAuth } from '../../context/AuthContext.jsx';
import AdminDashboard from '../../components/dashboard/AdminDashboard.jsx';
import UserDashboard from '../../components/dashboard/UserDashboard.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const role = String(user?.role ?? user?.roleName ?? '').toLowerCase();

  return role === 'user' ? <UserDashboard /> : <AdminDashboard />;
}
