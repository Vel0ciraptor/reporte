import { useEffect, useState, useMemo } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Clock, Timer, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Appointment {
  id: number;
  name: string;
  phone: string;
  vehicle: string;
  appointment_date: string;
  status: string;
  notes: string;
  promotor_name?: string;
}

function getDaysUntil(dateStr: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getRelativeLabel(days: number) {
  if (days < 0) return { text: `${Math.abs(days)}d atras`, color: 'text-gold-500', bg: 'bg-surface-200' };
  if (days === 0) return { text: 'Hoy', color: 'text-amber-500', bg: 'bg-amber-500/15' };
  if (days === 1) return { text: 'Manana', color: 'text-orange-500', bg: 'bg-orange-500/15' };
  if (days <= 7) return { text: `En ${days} dias`, color: 'text-blue-400', bg: 'bg-blue-500/15' };
  return { text: `En ${days} dias`, color: 'text-gold-400', bg: 'bg-surface-200' };
}

function getDayOfWeek(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-MX', { weekday: 'short' });
}

function getMonthDay(dateStr: string) {
  const d = new Date(dateStr);
  return { day: d.getDate(), month: d.toLocaleDateString('es-MX', { month: 'short' }) };
}

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const endpoint = isAdmin ? '/clients/all-appointments' : '/clients/appointments';
      const { data } = await api.get(endpoint);
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = (appointment: Appointment) => {
    const phone = appointment.phone.replace(/\D/g, '');
    const date = new Date(appointment.appointment_date);
    const dateStr = date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
    const timeStr = date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

    const message = encodeURIComponent(
      `Hola ${appointment.name}! Soy tu asesor de Automotors.\n\n` +
      `Te recuerdo que tienes una cita programada:\n` +
      `Fecha: ${dateStr}\n` +
      `Hora: ${timeStr}\n` +
      `Vehiculo: ${appointment.vehicle}\n\n` +
      `Te esperamos! Si necesitas reprogramar, avisanos.`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    toast.success('Recordatorio enviado');
  };

  const { upcoming, past, todayAppts } = useMemo(() => {
    const now = new Date();
    const up: Appointment[] = [];
    const pa: Appointment[] = [];
    const td: Appointment[] = [];

    appointments.forEach(a => {
      const d = new Date(a.appointment_date);
      d.setHours(0, 0, 0, 0);
      const diff = d.getTime() - now.setHours(0, 0, 0, 0);
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

      if (days < 0) pa.push(a);
      else if (days === 0) td.push(a);
      else up.push(a);
    });

    return { upcoming: up, past: pa.sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()), todayAppts: td };
  }, [appointments]);

  const nextAppointment = upcoming[0];
  const nextDays = nextAppointment ? getDaysUntil(nextAppointment.appointment_date) : null;

  if (loading) {
    return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-surface-800">Citas</h2>
        <p className="text-gold-400 text-sm">{appointments.length} en total</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <div className="p-2.5 bg-amber-500/10 rounded-xl mx-auto w-fit mb-2">
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-surface-800">{todayAppts.length}</p>
          <p className="text-gold-400 text-sm font-medium">Hoy</p>
        </div>
        <div className="card text-center">
          <div className="p-2.5 bg-blue-500/10 rounded-xl mx-auto w-fit mb-2">
            <Timer className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-surface-800">{upcoming.length}</p>
          <p className="text-gold-400 text-sm font-medium">Proximas</p>
        </div>
        <div className="card text-center">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl mx-auto w-fit mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-surface-800">{past.length}</p>
          <p className="text-gold-400 text-sm font-medium">Pasadas</p>
        </div>
      </div>

      {nextAppointment && (
        <div className="bg-gradient-to-r from-primary-500/10 to-primary-600/5 border border-primary-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-primary-400" />
            <span className="text-primary-500 text-sm font-bold uppercase tracking-wider">Siguiente cita</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-surface-800 text-xl">{nextAppointment.name}</p>
              <p className="text-gold-400 text-base mt-0.5">{nextAppointment.vehicle}</p>
              <p className="text-primary-500 text-sm font-semibold mt-1">
                {new Date(nextAppointment.appointment_date).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })} - {new Date(nextAppointment.appointment_date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="text-right">
              <div className="bg-primary-500 text-white text-3xl font-bold w-16 h-16 rounded-2xl flex items-center justify-center">
                {nextDays === 0 ? '!' : nextDays}
              </div>
              <p className="text-gold-400 text-sm font-medium mt-1.5">{nextDays === 0 ? 'Hoy' : `dias`}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-1.5 bg-surface-200/50 p-1 rounded-xl">
        {(['upcoming', 'past', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              filter === f ? 'bg-surface-100 text-surface-800 shadow-sm' : 'text-gold-400 hover:text-gold-300'
            }`}
          >
            {f === 'upcoming' ? 'Proximas' : f === 'past' ? 'Pasadas' : 'Todas'}
          </button>
        ))}
      </div>

      {todayAppts.length > 0 && filter !== 'past' && (
        <div>
          <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider mb-3 px-1">Hoy</h3>
          <div className="space-y-3">
            {todayAppts.map(a => (
              <AppointmentCard key={a.id} appointment={a} onReminder={sendReminder} />
            ))}
          </div>
        </div>
      )}

      {filter === 'upcoming' && (
        <div>
          <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider mb-3 px-1">Proximas</h3>
          {upcoming.length === 0 ? (
            <p className="text-gold-400 text-base text-center py-10">No hay citas proximas</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map(a => (
                <AppointmentCard key={a.id} appointment={a} onReminder={sendReminder} />
              ))}
            </div>
          )}
        </div>
      )}

      {filter === 'past' && (
        <div>
          <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider mb-3 px-1">Pasadas</h3>
          {past.length === 0 ? (
            <p className="text-gold-400 text-base text-center py-10">No hay citas pasadas</p>
          ) : (
            <div className="space-y-3">
              {past.map(a => (
                <AppointmentCard key={a.id} appointment={a} onReminder={sendReminder} isPast />
              ))}
            </div>
          )}
        </div>
      )}

      {filter === 'all' && (
        <div>
          <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider mb-3 px-1">Todas</h3>
          {appointments.length === 0 ? (
            <p className="text-gold-400 text-base text-center py-10">No hay citas programadas</p>
          ) : (
            <div className="space-y-3">
              {appointments.map(a => (
                <AppointmentCard key={a.id} appointment={a} onReminder={sendReminder} isPast={getDaysUntil(a.appointment_date) < 0} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AppointmentCard({ appointment, onReminder, isPast }: { appointment: Appointment; onReminder: (a: Appointment) => void; isPast?: boolean }) {
  const days = getDaysUntil(appointment.appointment_date);
  const label = getRelativeLabel(days);
  const { day, month } = getMonthDay(appointment.appointment_date);
  const dow = getDayOfWeek(appointment.appointment_date);
  const time = new Date(appointment.appointment_date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`card-compact flex items-center gap-4 ${isPast ? 'opacity-60' : ''}`}>
      <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${days === 0 ? 'bg-amber-500/15' : days === 1 ? 'bg-orange-500/15' : 'bg-surface-200'}`}>
        <span className={`text-xs font-semibold uppercase ${days === 0 ? 'text-amber-500' : days === 1 ? 'text-orange-500' : 'text-gold-400'}`}>{dow}</span>
        <span className={`text-2xl font-bold leading-tight ${days === 0 ? 'text-amber-500' : days === 1 ? 'text-orange-500' : 'text-surface-800'}`}>{day}</span>
        <span className={`text-[11px] font-medium ${days === 0 ? 'text-amber-500' : days === 1 ? 'text-orange-500' : 'text-gold-400'}`}>{month}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5">
          <p className="font-bold text-surface-800 text-base truncate">{appointment.name}</p>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${label.bg} ${label.color}`}>{label.text}</span>
        </div>
        <p className="text-gold-400 text-sm mt-0.5 truncate">{appointment.vehicle}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-primary-500 text-sm font-bold">{time}</span>
          {appointment.promotor_name && (
            <span className="text-gold-400 text-sm">{appointment.promotor_name}</span>
          )}
        </div>
      </div>

      <button
        onClick={() => onReminder(appointment)}
        className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition-all flex-shrink-0"
      >
        <MessageCircle className="w-5 h-5" />
      </button>
    </div>
  );
}
