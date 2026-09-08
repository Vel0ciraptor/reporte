import { useEffect, useState } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, Plus, ClipboardList, Car, LogOut, X, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import HomePromotor from '../components/promotor/HomePromotor';
import ClientForm from '../components/promotor/ClientForm';
import ClientList from '../components/promotor/ClientList';
import VehicleCatalog from '../components/promotor/VehicleCatalog';
import AppointmentsPage from '../components/AppointmentsPage';

function PromotorRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (location.pathname !== '/promotor') {
      navigate('/promotor', { replace: true });
    }
  }, [location.pathname, navigate]);
  return null;
}

export default function PromotorPage() {
  const { user, logout } = useAuth();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-surface-50 pb-20">
      <header className="bg-surface-100/95 backdrop-blur-lg text-white p-4 flex items-center justify-between sticky top-0 z-40 border-b border-surface-200/50">
        <div>
          <h1 className="font-bold text-lg">Automotors</h1>
          <p className="text-primary-400 text-xs font-medium">Panel Promotor</p>
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
          <Route index element={<HomePromotor />} />
          <Route path="clientes" element={<ClientList />} />
          <Route path="citas" element={<AppointmentsPage />} />
          <Route path="vehiculos" element={<VehicleCatalog />} />
          <Route path="*" element={<PromotorRedirect />} />
        </Routes>
      </main>

      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-24 right-5 z-40 w-14 h-14 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg shadow-primary-500/30 flex items-center justify-center transition-all active:scale-95"
      >
        <Plus className="w-6 h-6" />
      </button>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-surface-200/50">
              <h3 className="font-bold text-surface-800">Nuevo Cliente</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-surface-200 rounded-lg transition-colors text-surface-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <ClientForm onSaved={() => setShowForm(false)} />
            </div>
          </div>
        </div>
      )}

      <nav className="bottom-nav">
        <NavLink to="/promotor" end className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <Home className="w-5 h-5" />
          <span>Inicio</span>
        </NavLink>
        <NavLink to="/promotor/clientes" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <ClipboardList className="w-5 h-5" />
          <span>Clientes</span>
        </NavLink>
        <NavLink to="/promotor/citas" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <Calendar className="w-5 h-5" />
          <span>Citas</span>
        </NavLink>
        <NavLink to="/promotor/vehiculos" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <Car className="w-5 h-5" />
          <span>Vehiculos</span>
        </NavLink>
      </nav>
    </div>
  );
}
