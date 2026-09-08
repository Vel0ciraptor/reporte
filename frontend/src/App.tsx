import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import PromotorPage from './pages/PromotorPage';
import AdminPage from './pages/AdminPage';

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !user) return;

    const path = location.pathname;

    if (path === '/login' || (!path.startsWith('/admin') && !path.startsWith('/promotor'))) {
      navigate(user.role === 'admin' ? '/admin' : '/promotor', { replace: true });
    } else if (path.startsWith('/admin') && user.role !== 'admin') {
      navigate('/promotor', { replace: true });
    } else if (path.startsWith('/promotor') && user.role !== 'promotor') {
      navigate('/admin', { replace: true });
    }
  }, [loading, user, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Toaster position="top-center" />
        <LoginPage />
      </>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="/promotor/*" element={<PromotorPage />} />
      </Routes>
    </>
  );
}

export default App;
