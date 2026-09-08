export const formatPhone = (phone: string) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    sin_contacto: 'bg-red-500/15 text-red-400 border border-red-500/20',
    interesado: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    en_proceso: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
    citado: 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
    cerrado: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    no_interesa: 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/20',
  };
  return colors[status] || 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/20';
};

export const getStatusDot = (status: string) => {
  const colors: Record<string, string> = {
    sin_contacto: 'bg-red-400',
    interesado: 'bg-amber-400',
    en_proceso: 'bg-blue-400',
    citado: 'bg-purple-400',
    cerrado: 'bg-emerald-400',
    no_interesa: 'bg-zinc-400',
  };
  return colors[status] || 'bg-zinc-400';
};

export const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    sin_contacto: 'Sin contacto',
    interesado: 'Interesado',
    en_proceso: 'En proceso',
    citado: 'Citado',
    cerrado: 'Cerrado',
    no_interesa: 'No interesa',
  };
  return labels[status] || status;
};

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
};
