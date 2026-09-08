import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Users, X, UserPlus } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

interface Promotor {
  id: number;
  name: string;
  email: string;
  client_count: number;
  created_at: string;
}

export default function PromotoresList() {
  const [promotores, setPromotores] = useState<Promotor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    loadPromotores();
  }, []);

  const loadPromotores = async () => {
    try {
      const { data } = await api.get('/users/promotores');
      setPromotores(data);
    } catch (error) {
      console.error('Error loading promotores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error('Todos los campos son requeridos');
      return;
    }
    setCreating(true);
    try {
      await api.post('/users/promotores', form);
      toast.success('Promotor creado');
      setShowCreate(false);
      setForm({ name: '', email: '', password: '' });
      loadPromotores();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al crear');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-800">Promotores</h2>
          <p className="text-gold-400 text-sm">{promotores.length} en equipo</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-600 transition-all"
        >
          <UserPlus className="w-4 h-4" /> Nuevo
        </button>
      </div>

      <div className="space-y-3">
        {promotores.length === 0 ? (
          <div className="text-center py-16 text-gold-400 text-base">No hay promotores</div>
        ) : (
          promotores.map((p) => (
            <div key={p.id} className="card-compact">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-500/15 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-surface-800 text-base">{p.name}</h3>
                    <p className="text-gold-400 text-sm">{p.email}</p>
                    <p className="text-gold-500 text-sm">Desde {formatDate(p.created_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-400">{p.client_count}</p>
                  <p className="text-gold-400 text-sm">clientes</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-surface-200/50">
              <h3 className="font-bold text-surface-800 text-lg">Nuevo Promotor</h3>
              <button onClick={() => setShowCreate(false)} className="p-1.5 hover:bg-surface-200 rounded-lg transition-colors text-gold-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label">Nombre completo</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field text-base"
                  placeholder="Ej: Carlos Hernandez"
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field text-base"
                  placeholder="carlos@automotors.com"
                />
              </div>
              <div>
                <label className="label">Contrasena</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field text-base"
                  placeholder="Minimo 6 caracteres"
                />
              </div>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {creating ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <><UserPlus className="w-5 h-5" /> Crear Promotor</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
