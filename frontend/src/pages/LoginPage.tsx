import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Car, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      toast.success(isLogin ? 'Bienvenido!' : 'Cuenta creada!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-surface-100 to-primary-900/30 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500/10 rounded-2xl mb-4 border border-primary-500/20">
            <Car className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-surface-800">Automotors</h1>
          <p className="text-surface-500 mt-1 text-sm">CRM de Ventas</p>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold text-center mb-5 text-surface-800">
            {isLogin ? 'Iniciar Sesion' : 'Crear Cuenta'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field pl-10 text-sm py-2.5"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input
                type="email"
                placeholder="Correo electronico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10 text-sm py-2.5"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contrasena"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10 pr-10 text-sm py-2.5"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button type="submit" className="btn-primary text-sm" disabled={loading}>
              {loading ? 'Cargando...' : isLogin ? 'Entrar' : 'Registrarse'}
            </button>
          </form>

          <div className="mt-4 p-3 bg-surface-200/50 rounded-xl">
            <p className="text-surface-500 text-center mb-1.5 text-xs">Credenciales de prueba:</p>
            <div className="text-surface-600 space-y-0.5 text-xs">
              <p><strong className="text-surface-700">Admin:</strong> admin@demo.com / demo123</p>
              <p><strong className="text-surface-700">Promotor:</strong> maria@demo.com / demo123</p>
            </div>
          </div>

          <button
            onClick={() => setIsLogin(!isLogin)}
            className="w-full mt-3 text-center text-xs text-surface-500 hover:text-primary-400 transition-colors"
          >
            {isLogin ? 'No tienes cuenta? Registrate' : 'Ya tienes cuenta? Inicia sesion'}
          </button>
        </div>
      </div>
    </div>
  );
}
