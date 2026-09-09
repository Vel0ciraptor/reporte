import { useEffect, useState, useMemo } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Clock, Timer, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
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

function parseRawDate(dateStr: string) {
  const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match;
  return { year: parseInt(year), month: parseInt(month), day: parseInt(day), hour, minute };
}

function formatTime(dateStr: string): string {
  const p = parseRawDate(dateStr);
  if (!p) return '';
  const h = parseInt(p.hour);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${p.minute} ${ampm}`;
}

function getDaysUntil(dateStr: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const p = parseRawDate(dateStr);
  if (!p) return 0;
  const target = new Date(p.year, p.month - 1, p.day);
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
  const p = parseRawDate(dateStr);
  if (!p) return '';
  const d = new Date(p.year, p.month - 1, p.day);
  return d.toLocaleDateString('es-MX', { weekday: 'short' });
}

function getMonthDay(dateStr: string) {
  const p = parseRawDate(dateStr);
  if (!p) return { day: 0, month: '' };
  const d = new Date(p.year, p.month - 1, p.day);
  return { day: p.day, month: d.toLocaleDateString('es-MX', { month: 'short' }) };
}

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'year'>('month');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

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
    const p = parseRawDate(appointment.appointment_date);
    const dateObj = p ? new Date(p.year, p.month - 1, p.day) : new Date();
    const dateStr = dateObj.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
    const timeStr = formatTime(appointment.appointment_date);

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
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const up: Appointment[] = [];
    const pa: Appointment[] = [];
    const td: Appointment[] = [];

    appointments.forEach(a => {
      const p = parseRawDate(a.appointment_date);
      if (!p) return;
      const apptKey = `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
      const days = getDaysUntil(a.appointment_date);

      if (days < 0) pa.push(a);
      else if (days === 0) td.push(a);
      else up.push(a);
    });

    return { upcoming: up, past: pa.sort((a, b) => b.appointment_date.localeCompare(a.appointment_date)), todayAppts: td };
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
                {(() => {
                  const p = parseRawDate(nextAppointment.appointment_date);
                  if (!p) return '';
                  const d = new Date(p.year, p.month - 1, p.day);
                  return `${d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })} - ${formatTime(nextAppointment.appointment_date)}`;
                })()}
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

      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-surface-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-400" />
            Calendario
          </h3>
          <div className="flex gap-1 bg-surface-200/50 p-1 rounded-xl">
            {(['week', 'month', 'year'] as const).map(v => (
              <button
                key={v}
                onClick={() => { setCalendarView(v); setSelectedDay(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  calendarView === v ? 'bg-surface-100 text-surface-800 shadow-sm' : 'text-gold-400 hover:text-gold-300'
                }`}
              >
                {v === 'week' ? 'Semana' : v === 'month' ? 'Mes' : 'Año'}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <CalendarHeader
            view={calendarView}
            date={calendarDate}
            onPrev={() => {
              const d = new Date(calendarDate);
              if (calendarView === 'week') d.setDate(d.getDate() - 7);
              else if (calendarView === 'month') d.setMonth(d.getMonth() - 1);
              else d.setFullYear(d.getFullYear() - 1);
              setCalendarDate(d);
              setSelectedDay(null);
            }}
            onNext={() => {
              const d = new Date(calendarDate);
              if (calendarView === 'week') d.setDate(d.getDate() + 7);
              else if (calendarView === 'month') d.setMonth(d.getMonth() + 1);
              else d.setFullYear(d.getFullYear() + 1);
              setCalendarDate(d);
              setSelectedDay(null);
            }}
            onToday={() => { setCalendarDate(new Date()); setSelectedDay(null); }}
          />

          {calendarView === 'week' && (
            <WeekView
              date={calendarDate}
              appointments={appointments}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
            />
          )}
          {calendarView === 'month' && (
            <MonthView
              date={calendarDate}
              appointments={appointments}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
            />
          )}
          {calendarView === 'year' && (
            <YearView
              date={calendarDate}
              appointments={appointments}
              onMonthClick={(m) => {
                const d = new Date(calendarDate);
                d.setMonth(m);
                setCalendarDate(d);
                setCalendarView('month');
              }}
            />
          )}
        </div>

        {selectedDay && (
          <div className="mt-3">
            <h4 className="text-sm font-bold text-gold-400 uppercase tracking-wider mb-2 px-1">
              Citas del {new Date(selectedDay + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h4>
            <div className="space-y-2">
              {appointments
                .filter(a => {
                  const d = new Date(a.appointment_date);
                  const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                  return ds === selectedDay;
                })
                .map(a => (
                  <AppointmentCard key={a.id} appointment={a} onReminder={sendReminder} isPast={getDaysUntil(a.appointment_date) < 0} />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AppointmentCard({ appointment, onReminder, isPast }: { appointment: Appointment; onReminder: (a: Appointment) => void; isPast?: boolean }) {
  const days = getDaysUntil(appointment.appointment_date);
  const label = getRelativeLabel(days);
  const { day, month } = getMonthDay(appointment.appointment_date);
  const dow = getDayOfWeek(appointment.appointment_date);
  const time = formatTime(appointment.appointment_date);

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

function getAppointmentsForDay(appointments: Appointment[], dateStr: string): Appointment[] {
  return appointments.filter(a => {
    const p = parseRawDate(a.appointment_date);
    if (!p) return false;
    const ds = `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
    return ds === dateStr;
  });
}

function DateToKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function CalendarHeader({ view, date, onPrev, onNext, onToday }: { view: string; date: Date; onPrev: () => void; onNext: () => void; onToday: () => void }) {
  let title = '';
  if (view === 'week') {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    title = `${start.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  } else if (view === 'month') {
    title = date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  } else {
    title = date.getFullYear().toString();
  }

  return (
    <div className="flex items-center justify-between mb-4">
      <button onClick={onPrev} className="p-2 hover:bg-surface-200 rounded-lg transition-colors text-surface-600">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-3">
        <h4 className="font-bold text-surface-800 text-base capitalize">{title}</h4>
        <button onClick={onToday} className="text-xs font-semibold text-primary-400 hover:text-primary-500 px-2 py-1 rounded-lg hover:bg-primary-500/10 transition-all">
          Hoy
        </button>
      </div>
      <button onClick={onNext} className="p-2 hover:bg-surface-200 rounded-lg transition-colors text-surface-600">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

function WeekView({ date, appointments, selectedDay, onSelectDay }: { date: Date; appointments: Appointment[]; selectedDay: string | null; onSelectDay: (d: string) => void }) {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  const today = DateToKey(new Date());
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(d => (
          <div key={d} className="text-center text-xs font-bold text-gold-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map(d => {
          const key = DateToKey(d);
          const dayAppts = getAppointmentsForDay(appointments, key);
          const isToday = key === today;
          const isSelected = key === selectedDay;
          const isCurrentMonth = d.getMonth() === date.getMonth();

          return (
            <button
              key={key}
              onClick={() => onSelectDay(key)}
              className={`relative p-2 rounded-xl text-center transition-all min-h-[60px] ${
                isSelected ? 'bg-primary-500/15 border border-primary-500/30' :
                isToday ? 'bg-amber-500/10 border border-amber-500/20' :
                'hover:bg-surface-200 border border-transparent'
              } ${!isCurrentMonth ? 'opacity-40' : ''}`}
            >
              <span className={`text-sm font-bold ${isToday ? 'text-amber-500' : isSelected ? 'text-primary-400' : 'text-surface-700'}`}>
                {d.getDate()}
              </span>
              {dayAppts.length > 0 && (
                <div className="mt-1">
                  <span className="inline-block bg-primary-500 text-white text-[10px] font-bold rounded-full w-5 h-5 leading-5">
                    {dayAppts.length}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MonthView({ date, appointments, selectedDay, onSelectDay }: { date: Date; appointments: Appointment[]; selectedDay: string | null; onSelectDay: (d: string) => void }) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const today = DateToKey(new Date());
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(d => (
          <div key={d} className="text-center text-xs font-bold text-gold-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={`pad-${i}`} />;
          const key = DateToKey(d);
          const dayAppts = getAppointmentsForDay(appointments, key);
          const isToday = key === today;
          const isSelected = key === selectedDay;

          return (
            <button
              key={key}
              onClick={() => onSelectDay(key)}
              className={`relative p-1.5 rounded-xl text-center transition-all min-h-[52px] ${
                isSelected ? 'bg-primary-500/15 border border-primary-500/30' :
                isToday ? 'bg-amber-500/10 border border-amber-500/20' :
                'hover:bg-surface-200 border border-transparent'
              }`}
            >
              <span className={`text-xs font-bold ${isToday ? 'text-amber-500' : isSelected ? 'text-primary-400' : 'text-surface-700'}`}>
                {d.getDate()}
              </span>
              {dayAppts.length > 0 && (
                <div className="mt-0.5">
                  <span className="inline-block bg-primary-500 text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] leading-[18px]">
                    {dayAppts.length}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function YearView({ date, appointments, onMonthClick }: { date: Date; appointments: Appointment[]; onMonthClick: (month: number) => void }) {
  const year = date.getFullYear();
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const now = new Date();

  return (
    <div className="grid grid-cols-3 gap-3">
      {monthNames.map((name, m) => {
        const monthAppts = appointments.filter(a => {
          const d = new Date(a.appointment_date);
          return d.getFullYear() === year && d.getMonth() === m;
        });
        const isCurrentMonth = now.getFullYear() === year && now.getMonth() === m;

        return (
          <button
            key={m}
            onClick={() => onMonthClick(m)}
            className={`p-4 rounded-xl text-center transition-all ${
              isCurrentMonth ? 'bg-primary-500/10 border border-primary-500/20' : 'bg-surface-200/50 hover:bg-surface-200 border border-transparent'
            }`}
          >
            <span className={`text-sm font-bold ${isCurrentMonth ? 'text-primary-400' : 'text-surface-700'}`}>{name}</span>
            {monthAppts.length > 0 && (
              <div className="mt-2">
                <span className="inline-block bg-primary-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                  {monthAppts.length}
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
