import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { getStatusColor, getStatusLabel, formatPhone, formatDate } from '../../lib/utils';
import { Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUSES = ['todos', 'sin_contacto', 'interesado', 'en_proceso', 'citado', 'cerrado', 'no_interesa'];

export default function AllClients() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadClients();
  }, [filter]);

  const loadClients = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'todos') params.append('status', filter);
      const { data } = await api.get(`/clients?${params}`);
      setClients(data);
    } catch (error) {
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/clients/${id}/status`, { status });
      setClients(clients.map(c => c.id === id ? { ...c, status } : c));
      toast.success('Estado actualizado');
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.vehicle.toLowerCase().includes(search.toLowerCase())
  );

  const statusCounts = clients.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-800">Clientes</h2>
          <p className="text-gold-400 text-sm">{clients.length} total</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-400" />
        <input
          type="text"
          placeholder="Buscar nombre, telefono o vehiculo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-11 text-base py-3"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gold-400 hover:text-gold-300">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3.5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              filter === s
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                : 'bg-surface-200 text-gold-400 hover:bg-surface-300'
            }`}
          >
            {getStatusLabel(s)}
            {s !== 'todos' && statusCounts[s] ? (
              <span className="ml-1 opacity-70">{statusCounts[s]}</span>
            ) : null}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent" />
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-16 text-gold-400 text-base">
          No se encontraron clientes
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredClients.map((client) => (
            <div key={client.id} className="card-compact group">
              <div className="flex items-start justify-between mb-2.5">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-surface-800 text-base truncate">{client.name}</h3>
                  <p className="text-gold-400 text-sm">{formatPhone(client.phone)}</p>
                </div>
                <span className={`status-badge ml-2 flex-shrink-0 ${getStatusColor(client.status)}`}>
                  {getStatusLabel(client.status)}
                </span>
              </div>

              <p className="text-primary-500 text-sm font-semibold mb-1.5 truncate">{client.vehicle}</p>

              {client.email && (
                <p className="text-gold-400 text-sm truncate mb-1">{client.email}</p>
              )}

              {client.promotor_name && (
                <p className="text-gold-400 text-sm mb-1.5">
                  <span className="text-gold-500">Promotor:</span> {client.promotor_name}
                </p>
              )}

              {client.notes && (
                <p className="text-gold-500 text-sm truncate mb-2 italic">{client.notes}</p>
              )}

              <div className="flex items-center justify-between pt-2.5 border-t border-surface-200/50">
                <span className="text-gold-500 text-sm">{formatDate(client.created_at)}</span>
                <select
                  value={client.status}
                  onChange={(e) => updateStatus(client.id, e.target.value)}
                  className="bg-surface-200 text-surface-700 text-sm px-2.5 py-2 rounded-lg border-0 focus:ring-1 focus:ring-primary-500 cursor-pointer font-medium"
                >
                  {STATUSES.slice(1).map((s) => (
                    <option key={s} value={s}>{getStatusLabel(s)}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
