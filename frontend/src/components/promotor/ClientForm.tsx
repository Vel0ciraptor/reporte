import { useState } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { User, Phone, Mail, Car, FileText, CheckCircle, Calendar } from 'lucide-react';

function getLocalTimezoneOffset(): string {
  const offset = -new Date().getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const hours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
  const mins = String(Math.abs(offset) % 60).padStart(2, '0');
  return `${sign}${hours}:${mins}`;
}

export default function ClientForm({ onSaved }: { onSaved?: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [notes, setNotes] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/clients', {
        name,
        phone,
        email,
        vehicle,
        notes,
        appointment_date: appointmentDate ? appointmentDate + getLocalTimezoneOffset() : null,
      });
      toast.success('Cliente registrado exitosamente');
      if (onSaved) {
        onSaved();
      } else {
        setSuccess(true);
        setName('');
        setPhone('');
        setEmail('');
        setVehicle('');
        setNotes('');
        setAppointmentDate('');
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al registrar cliente');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="w-16 h-16 bg-emerald-500/15 rounded-full flex items-center justify-center">
          <CheckCircle className="w-9 h-9 text-emerald-400" />
        </div>
        <h2 className="text-lg font-bold text-surface-800">Cliente Registrado</h2>
        <p className="text-surface-500 text-sm text-center">El cliente se ha guardado correctamente</p>
        <button onClick={() => setSuccess(false)} className="btn-primary w-auto px-6">
          Registrar otro
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-surface-800">Registrar Cliente</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="label mb-1 block">Nombre *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del cliente"
              className="input-field pl-10 text-sm py-2.5"
              required
            />
          </div>
        </div>

        <div>
          <label className="label mb-1 block">Telefono *</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Numero de celular"
              className="input-field pl-10 text-sm py-2.5"
              required
            />
          </div>
        </div>

        <div>
          <label className="label mb-1 block">Correo electronico</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="input-field pl-10 text-sm py-2.5"
            />
          </div>
        </div>

        <div>
          <label className="label mb-1 block">Vehiculo de interes *</label>
          <div className="relative">
            <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input
              type="text"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              placeholder="Ej: Toyota Corolla 2024"
              className="input-field pl-10 text-sm py-2.5"
              required
            />
          </div>
        </div>

        <div>
          <label className="label mb-1 block">Fecha y hora de cita</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input
              type="datetime-local"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              className="input-field pl-10 text-sm py-2.5"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
          {appointmentDate && (
            <p className="text-primary-400 text-xs mt-1">
              Cita: {new Date(appointmentDate).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        <div>
          <label className="label mb-1 block">Notas</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-4 h-4 text-surface-500" />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales..."
              className="input-field pl-10 min-h-[80px] text-sm py-2.5"
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrar Cliente'}
        </button>
      </form>
    </div>
  );
}
