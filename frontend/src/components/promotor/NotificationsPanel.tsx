import { useState } from 'react';
import api from '../../lib/api';
import { formatPhone } from '../../lib/utils';
import { Bell, MessageCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface Client {
  id: number;
  name: string;
  phone: string;
  vehicle: string;
  status: string;
  last_contact_at: string | null;
  created_at: string;
}

interface NotificationsPanelProps {
  clients: Client[];
  onUpdate: (id: number, status: string) => void;
}

export default function NotificationsPanel({ clients, onUpdate }: NotificationsPanelProps) {
  const [expanded, setExpanded] = useState(true);

  const pendingClients = clients.filter(c => {
    if (c.status !== 'en_proceso' && c.status !== 'sin_contacto') return false;
    if (!c.last_contact_at) return true;
    const hoursSinceContact = (Date.now() - new Date(c.last_contact_at).getTime()) / (1000 * 60 * 60);
    return hoursSinceContact >= 24;
  });

  if (pendingClients.length === 0) return null;

  const sendWhatsApp = async (client: Client) => {
    const phone = client.phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Hola ${client.name}! Soy tu asesor de Automotors.\n\n` +
      `Te escribo de nuevo sobre el vehiculo: ${client.vehicle}\n\n` +
      `Tienes alguna consulta? Estoy para servirte.`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');

    try {
      await api.put(`/clients/${client.id}/status`, { status: 'en_proceso' });
      onUpdate(client.id, 'en_proceso');
      toast.success('Seguimiento registrado');
    } catch (error) {
      console.error('Error updating status');
    }
  };

  const markAsContacted = async (client: Client) => {
    try {
      await api.put(`/clients/${client.id}/status`, { status: 'en_proceso' });
      onUpdate(client.id, 'en_proceso');
      toast.success('Marcado como contactado');
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const getTimeAgo = (dateStr: string | null) => {
    if (!dateStr) return 'Sin contacto';
    const hours = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Hace minutos';
    if (hours < 24) return `Hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Hace ${days}d ${hours % 24}h`;
  };

  return (
    <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-amber-500/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/15 rounded-xl">
            <Bell className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-surface-800 text-base">Seguimiento pendiente</h3>
            <p className="text-gold-400 text-sm">
              {pendingClients.length} cliente{pendingClients.length > 1 ? 's' : ''} sin respuesta 24h+
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-amber-500/15 text-amber-500 text-sm font-bold px-3 py-1 rounded-full">
            {pendingClients.length}
          </span>
          <div className={`w-5 h-5 text-surface-500 transition-transform ${expanded ? 'rotate-180' : ''}`}>
            <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2.5">
          {pendingClients.map((client) => (
            <div key={client.id} className="bg-surface-100 rounded-xl p-4 border border-surface-200/50">
              <div className="flex items-start justify-between mb-2.5">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-surface-800 text-base truncate">{client.name}</h4>
                  <p className="text-gold-400 text-sm mt-0.5">{client.vehicle}</p>
                </div>
                <div className="flex items-center gap-1.5 text-amber-500 ml-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-semibold whitespace-nowrap">{getTimeAgo(client.last_contact_at)}</span>
                </div>
              </div>

              <p className="text-gold-400 text-sm mb-3">{formatPhone(client.phone)}</p>

              <div className="flex gap-2">
                <button
                  onClick={() => sendWhatsApp(client)}
                  className="flex-1 bg-emerald-500/10 text-emerald-500 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-emerald-500/20 transition-all"
                >
                  <MessageCircle className="w-4 h-4" /> Reenviar WhatsApp
                </button>
                <button
                  onClick={() => markAsContacted(client)}
                  className="flex-1 bg-primary-500/10 text-primary-500 py-2 rounded-lg text-sm font-semibold hover:bg-primary-500/20 transition-all"
                >
                  Marcar contactado
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
