import { useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Car, UserCircle, LogOut, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Dashboard from '../components/admin/Dashboard';
import AllClients from '../components/admin/AllClients';
import PromotoresList from '../components/admin/PromotoresList';
import VehicleManager from '../components/admin/VehicleManager';
import AppointmentsPage from '../components/AppointmentsPage';

function AdminRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (location.pathname !== '/admin') {
      navigate('/admin', { replace: true });
    }
  }, [location.pathname, navigate]);
  return null;
}

export default function AdminPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-surface-50 pb-20">
      <header className="bg-surface-100/95 backdrop-blur-lg text-white p-4 flex items-center justify-between sticky top-0 z-40 border-b border-surface-200/50">
        <div>
          <h1 className="font-bold text-lg">Automotors</h1>
          <p className="text-primary-400 text-xs font-medium">Panel Admin</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm hidden sm:block text-surface-700">{user?.name}</span>
          <button onClick={logout} className="p-2 hover:bg-surface-200 rounded-xl transition-colors text-surface-600 hover:text-red-400">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="clientes" element={<AllClients />} />
          <Route path="citas" element={<AppointmentsPage />} />
          <Route path="promotores" element={<PromotoresList />} />
          <Route path="vehiculos" element={<VehicleManager />} />
          <Route path="*" element={<AdminRedirect />} />
        </Routes>
      </main>

      <nav className="bottom-nav">
        <NavLink to="/admin" end className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard className="w-5 h-5" />
          <span>Inicio</span>
        </NavLink>
        <NavLink to="/admin/clientes" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <Users className="w-5 h-5" />
          <span>Clientes</span>
        </NavLink>
        <NavLink to="/admin/citas" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <Calendar className="w-5 h-5" />
          <span>Citas</span>
        </NavLink>
        <NavLink to="/admin/vehiculos" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <Car className="w-5 h-5" />
          <span>Vehiculos</span>
        </NavLink>
        <NavLink to="/admin/promotores" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <UserCircle className="w-5 h-5" />
          <span>Promotores</span>
        </NavLink>
      </nav>
    </div>
  );
}
