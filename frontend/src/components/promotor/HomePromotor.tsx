import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { getStatusLabel, getStatusColor } from '../../lib/utils';
import { AlertCircle, Users, TrendingUp } from 'lucide-react';
import NotificationsPanel from './NotificationsPanel';

export default function HomePromotor() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, closed: 0 });
  const [recentClients, setRecentClients] = useState<any[]>([]);
  const [allClients, setAllClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: clients } = await api.get('/clients/my');
      const pending = clients.filter((c: any) =>
        c.status === 'sin_contacto' &&
        (!c.last_contact_at || new Date(c.last_contact_at) < new Date(Date.now() - 24 * 60 * 60 * 1000))
      ).length;
      const closed = clients.filter((c: any) => c.status === 'cerrado').length;

      setStats({ total: clients.length, pending, closed });
      setRecentClients(clients.slice(0, 5));
      setAllClients(clients);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClientUpdate = (id: number, status: string) => {
    setAllClients(prev => prev.map(c => c.id === id ? { ...c, status, last_contact_at: new Date().toISOString() } : c));
    setRecentClients(prev => prev.map(c => c.id === id ? { ...c, status } : c).slice(0, 5));
  };

  if (loading) {
    return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-surface-800">Hola, {user?.name}!</h2>
        <p className="text-gold-400 text-base">Resumen de tu dia</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <Users className="w-5 h-5 text-blue-400 mx-auto mb-1.5" />
          <p className="text-2xl font-bold text-surface-800">{stats.total}</p>
          <p className="text-gold-400 text-sm font-medium">Mis clientes</p>
        </div>

        <div className="card text-center">
          <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
          <p className="text-2xl font-bold text-surface-800">{stats.closed}</p>
          <p className="text-gold-400 text-sm font-medium">Cerrados</p>
        </div>

        <div className="card text-center">
          <AlertCircle className="w-5 h-5 text-red-400 mx-auto mb-1.5" />
          <p className="text-2xl font-bold text-surface-800">{stats.pending}</p>
          <p className="text-gold-400 text-sm font-medium">Pendientes</p>
        </div>
      </div>

      <NotificationsPanel clients={allClients} onUpdate={handleClientUpdate} />

      <div className="card">
        <h3 className="section-title mb-4">Ultimos Clientes</h3>
        {recentClients.length === 0 ? (
          <p className="text-gold-400 text-base text-center py-6">Aun no tienes clientes registrados</p>
        ) : (
          <div className="space-y-3">
            {recentClients.map((client) => (
              <div key={client.id} className="flex items-center justify-between py-2.5 border-b border-surface-200/50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-surface-800 text-base truncate">{client.name}</p>
                  <p className="text-gold-400 text-sm truncate">{client.vehicle}</p>
                </div>
                <span className={`status-badge ml-2 flex-shrink-0 ${getStatusColor(client.status)}`}>
                  {getStatusLabel(client.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
