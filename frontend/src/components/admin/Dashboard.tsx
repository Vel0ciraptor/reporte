import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { getStatusLabel, getStatusColor, formatDate } from '../../lib/utils';
import { Users, TrendingUp, AlertCircle, CheckCircle2, Clock, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

const VEHICLE_COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#d4a853', '#b8860b'];

interface Stats {
  total: number;
  byStatus: { status: string; count: string }[];
  totalPromotores: number;
  recentClients: any[];
  pendingContact: number;
}

interface VehicleStat { name: string; count: number; }
interface PromotorPerformance {
  id: number; name: string; total: number;
  sin_contacto: number; interesado: number; en_proceso: number;
  citado: number; cerrado: number; no_interesa: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [vehicleStats, setVehicleStats] = useState<VehicleStat[]>([]);
  const [performance, setPerformance] = useState<PromotorPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sRes, vRes, pRes] = await Promise.all([
        api.get('/clients/stats'),
        api.get('/users/vehicle-stats'),
        api.get('/users/promotor-performance'),
      ]);
      setStats(sRes.data);
      setVehicleStats(vRes.data);
      setPerformance(pRes.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent" /></div>;
  }

  if (!stats) return null;

  const cerrados = stats.byStatus.find(s => s.status === 'cerrado')?.count || 0;
  const enProceso = stats.byStatus.find(s => s.status === 'en_proceso')?.count || 0;
  const interesados = stats.byStatus.find(s => s.status === 'interesado')?.count || 0;

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-surface-800">Dashboard</h2>

      <div className="card p-0 overflow-hidden">
        <div className="grid grid-cols-4 divide-x divide-surface-200/50">
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-surface-800">{stats.total}</p>
            <p className="text-gold-400 text-xs font-semibold mt-0.5">Clientes</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-primary-400">{stats.totalPromotores}</p>
            <p className="text-gold-400 text-xs font-semibold mt-0.5">Promotores</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{cerrados}</p>
            <p className="text-gold-400 text-xs font-semibold mt-0.5">Cerrados</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.pendingContact}</p>
            <p className="text-gold-400 text-xs font-semibold mt-0.5">Pendientes</p>
          </div>
        </div>
        <div className="h-2 bg-surface-200/50 flex">
          {stats.byStatus.map(({ status, count }) => {
            const c = parseInt(count);
            if (c === 0) return null;
            const colors: Record<string, string> = {
              cerrado: 'bg-emerald-500', en_proceso: 'bg-primary-500',
              interesado: 'bg-amber-500', citado: 'bg-purple-500',
              sin_contacto: 'bg-red-400', no_interesa: 'bg-surface-400',
            };
            return <div key={status} className={`${colors[status] || 'bg-surface-400'} h-full`} style={{ width: `${(c / stats.total) * 100}%` }} />;
          })}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary-400" />
          <h3 className="font-bold text-surface-800 text-lg">Vehiculos mas buscados</h3>
        </div>
        {vehicleStats.length === 0 ? (
          <p className="text-gold-400 text-center py-8">Sin datos</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehicleStats.slice(0, 5)} layout="vertical" margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e2e33" />
                <XAxis type="number" tick={{ fill: '#d4a853', fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#d4d4d8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e1e22', border: '1px solid #2e2e33', borderRadius: 12 }}
                  labelStyle={{ color: '#d4d4d8' }}
                  itemStyle={{ color: '#d4a853' }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {vehicleStats.slice(0, 5).map((_, idx) => (
                    <Cell key={idx} fill={VEHICLE_COLORS[idx % VEHICLE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary-400" />
          <h3 className="font-bold text-surface-800 text-lg">Rendimiento por promotor</h3>
        </div>
        {performance.length === 0 ? (
          <p className="text-gold-400 text-center py-8">Sin datos</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performance} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e2e33" />
                <XAxis dataKey="name" tick={{ fill: '#d4d4d8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#d4a853', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e1e22', border: '1px solid #2e2e33', borderRadius: 12 }}
                  labelStyle={{ color: '#d4d4d8' }}
                />
                <Legend wrapperStyle={{ color: '#d4d4d8', fontSize: 12 }} />
                <Bar dataKey="cerrado" name="Cerrados" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="en_proceso" name="En proceso" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="interesado" name="Interesados" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sin_contacto" name="Sin contacto" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="text-center p-2.5 bg-emerald-500/10 rounded-xl">
            <p className="text-surface-800 text-lg font-bold">{cerrados}</p>
            <p className="text-gold-500 text-xs font-semibold">Cerrados</p>
          </div>
          <div className="text-center p-2.5 bg-primary-500/10 rounded-xl">
            <p className="text-surface-800 text-lg font-bold">{enProceso}</p>
            <p className="text-gold-500 text-xs font-semibold">En proceso</p>
          </div>
          <div className="text-center p-2.5 bg-amber-500/10 rounded-xl">
            <p className="text-surface-800 text-lg font-bold">{interesados}</p>
            <p className="text-gold-500 text-xs font-semibold">Interesados</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title mb-4">Ultimos Clientes</h3>
        <div className="space-y-3">
          {stats.recentClients.map((client) => (
            <div key={client.id} className="flex items-center justify-between py-2.5 border-b border-surface-200/50 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-surface-800 text-base truncate">{client.name}</p>
                <p className="text-gold-400 text-sm truncate">{client.vehicle}</p>
              </div>
              <div className="text-right ml-3">
                <span className={`status-badge ${getStatusColor(client.status)}`}>
                  {getStatusLabel(client.status)}
                </span>
                <p className="text-gold-500 text-sm mt-1">{formatDate(client.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
