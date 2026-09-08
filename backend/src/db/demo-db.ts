// Demo in-memory database - no PostgreSQL needed
import bcrypt from 'bcryptjs';

let users = [
  { id: 1, name: 'Carlos Admin', email: 'admin@demo.com', password: '', role: 'admin', created_at: new Date('2026-01-15') },
  { id: 2, name: 'María García', email: 'maria@demo.com', password: '', role: 'promotor', created_at: new Date('2026-02-10') },
  { id: 3, name: 'Juan López', email: 'juan@demo.com', password: '', role: 'promotor', created_at: new Date('2026-03-05') },
  { id: 4, name: 'Ana Martínez', email: 'ana@demo.com', password: '', role: 'promotor', created_at: new Date('2026-04-01') },
];

let clients = [
  { id: 1, name: 'Pedro Sánchez', phone: '5551234567', email: 'pedro@email.com', vehicle: 'Toyota Corolla 2024', status: 'interesado', notes: 'Busca financiamiento a 36 meses', promotor_id: 2, last_contact_at: new Date('2026-09-07'), appointment_date: new Date('2026-09-10T10:00:00'), created_at: new Date('2026-09-01'), updated_at: new Date('2026-09-07') },
  { id: 2, name: 'Laura Díaz', phone: '5559876543', email: 'laura@email.com', vehicle: 'Honda CR-V 2024', status: 'sin_contacto', notes: '', promotor_id: 2, last_contact_at: null, appointment_date: null, created_at: new Date('2026-09-05'), updated_at: new Date('2026-09-05') },
  { id: 3, name: 'Roberto Fernández', phone: '5551122334', email: 'roberto@email.com', vehicle: 'Mazda CX-5 2024', status: 'en_proceso', notes: 'Quiere color azul', promotor_id: 2, last_contact_at: new Date('2026-09-06'), appointment_date: null, created_at: new Date('2026-08-28'), updated_at: new Date('2026-09-06') },
  { id: 4, name: 'Sofía Morales', phone: '5554433221', email: 'sofia@email.com', vehicle: 'Volkswagen Jetta 2024', status: 'citado', notes: 'Cita para el sábado a las 10am', promotor_id: 2, last_contact_at: new Date('2026-09-08'), appointment_date: new Date('2026-09-13T10:00:00'), created_at: new Date('2026-08-25'), updated_at: new Date('2026-09-08') },
  { id: 5, name: 'Miguel Torres', phone: '5556677889', email: 'miguel@email.com', vehicle: 'Nissan Sentra 2024', status: 'cerrado', notes: 'Venta completada', promotor_id: 3, last_contact_at: new Date('2026-09-04'), appointment_date: null, created_at: new Date('2026-08-15'), updated_at: new Date('2026-09-04') },
  { id: 6, name: 'Carmen Ruiz', phone: '5559988776', email: 'carmen@email.com', vehicle: 'Hyundai Tucson 2024', status: 'no_interesa', notes: 'Compró otra marca', promotor_id: 3, last_contact_at: new Date('2026-09-02'), appointment_date: null, created_at: new Date('2026-08-20'), updated_at: new Date('2026-09-02') },
  { id: 7, name: 'Fernando Reyes', phone: '5553344556', email: 'fernando@email.com', vehicle: 'Chevrolet Equinox 2024', status: 'sin_contacto', notes: '', promotor_id: 3, last_contact_at: null, appointment_date: null, created_at: new Date('2026-09-07'), updated_at: new Date('2026-09-07') },
  { id: 8, name: 'Isabela Cruz', phone: '5552211009', email: 'isabela@email.com', vehicle: 'Toyota RAV4 2024', status: 'interesado', notes: 'Viene con su esposo el fin de semana', promotor_id: 4, last_contact_at: new Date('2026-09-08'), appointment_date: new Date('2026-09-12T11:00:00'), created_at: new Date('2026-09-03'), updated_at: new Date('2026-09-08') },
  { id: 9, name: 'Diego Vargas', phone: '5557788990', email: 'diego@email.com', vehicle: 'Honda Civic 2024', status: 'en_proceso', notes: 'Comparando con el Corolla', promotor_id: 4, last_contact_at: new Date('2026-09-06'), appointment_date: null, created_at: new Date('2026-08-30'), updated_at: new Date('2026-09-06') },
  { id: 10, name: 'Valentina Ortiz', phone: '5558899001', email: 'valentina@email.com', vehicle: 'Mazda 3 2024', status: 'sin_contacto', notes: '', promotor_id: 4, last_contact_at: null, appointment_date: null, created_at: new Date('2026-09-08'), updated_at: new Date('2026-09-08') },
];

let vehicles = [
  { id: 1, name: 'Toyota Corolla 2024', description: 'Sedán compacto, motor 1.8L, transmisión CVT. Excelente eficiencia de combustible.', price: 459900, image_url: 'corolla.jpg', pdf_url: 'corolla.pdf', status: 'disponible', created_by: 1, created_at: new Date('2026-01-20'), updated_at: new Date('2026-01-20') },
  { id: 2, name: 'Honda CR-V 2024', description: 'SUV familiar, motor 1.5L Turbo, tracción frontal. Amplio espacio interior.', price: 689900, image_url: 'crv.jpg', pdf_url: 'crv.pdf', status: 'disponible', created_by: 1, created_at: new Date('2026-02-15'), updated_at: new Date('2026-02-15') },
  { id: 3, name: 'Mazda CX-5 2024', description: 'SUV deportivo, motor 2.5L, tracción inteligente AWD. Diseño elegante.', price: 729900, image_url: 'cx5.jpg', pdf_url: 'cx5.pdf', status: 'disponible', created_by: 1, created_at: new Date('2026-03-10'), updated_at: new Date('2026-03-10') },
  { id: 4, name: 'Volkswagen Jetta 2024', description: 'Sedán ejecutivo, motor 1.4L Turbo, transmisión automática de 8 velocidades.', price: 519900, image_url: 'jetta.jpg', pdf_url: 'jetta.pdf', status: 'disponible', created_by: 1, created_at: new Date('2026-04-05'), updated_at: new Date('2026-04-05') },
  { id: 5, name: 'Nissan Sentra 2024', description: 'Sedán moderno, motor 2.0L, tecnología ProPILOT. Comfort y seguridad.', price: 439900, image_url: 'sentra.jpg', pdf_url: 'sentra.pdf', status: 'disponible', created_by: 1, created_at: new Date('2026-05-01'), updated_at: new Date('2026-05-01') },
];

let nextUserId = 5;
let nextClientId = 11;
let nextVehicleId = 6;

// Hash passwords
const hashPasswords = async () => {
  const hash = await bcrypt.hash('demo123', 10);
  users.forEach(u => u.password = hash);
};
hashPasswords();

// Simulated DB queries
const db = {
  users: {
    findByEmail: (email: string) => users.find(u => u.email === email),
    findById: (id: number) => users.find(u => u.id === id),
    findAll: () => users.map(({ password, ...u }) => u),
    findPromotores: () => users
      .filter(u => u.role === 'promotor')
      .map(({ password, ...u }) => ({
        ...u,
        client_count: clients.filter(c => c.promotor_id === u.id).length,
      })),
    create: (data: any) => {
      const user = { id: nextUserId++, ...data, created_at: new Date() };
      users.push(user);
      const { password, ...rest } = user;
      return rest;
    },
  },
  clients: {
    findById: (id: number) => clients.find(c => c.id === id),
    findByPromotor: (promotorId: number, status?: string) => {
      let result = clients.filter(c => c.promotor_id === promotorId);
      if (status && status !== 'todos') result = result.filter(c => c.status === status);
      return result.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    },
    findAll: (filters?: { status?: string; promotor_id?: number }) => {
      let result = [...clients];
      if (filters?.status && filters.status !== 'todos') {
        result = result.filter(c => c.status === filters.status);
      }
      if (filters?.promotor_id) {
        result = result.filter(c => c.promotor_id === filters.promotor_id);
      }
      return result
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
        .map(c => ({
          ...c,
          promotor_name: users.find(u => u.id === c.promotor_id)?.name,
        }));
    },
    create: (data: any) => {
      const client = {
        id: nextClientId++,
        ...data,
        status: 'sin_contacto',
        last_contact_at: null,
        appointment_date: data.appointment_date || null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      clients.push(client);
      return client;
    },
    update: (id: number, data: any) => {
      const idx = clients.findIndex(c => c.id === id);
      if (idx === -1) return null;
      clients[idx] = { ...clients[idx], ...data, updated_at: new Date() };
      return clients[idx];
    },
    delete: (id: number) => {
      const idx = clients.findIndex(c => c.id === id);
      if (idx === -1) return false;
      clients.splice(idx, 1);
      return true;
    },
    getStats: () => {
      const statusCounts = clients.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total: clients.length,
        byStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count: count.toString() })),
        totalPromotores: users.filter(u => u.role === 'promotor').length,
        recentClients: clients
          .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
          .slice(0, 5)
          .map(c => ({ ...c, promotor_name: users.find(u => u.id === c.promotor_id)?.name })),
        pendingContact: clients.filter(c =>
          c.status === 'sin_contacto' &&
          (!c.last_contact_at || c.last_contact_at < new Date(Date.now() - 24 * 60 * 60 * 1000))
        ).length,
      };
    },
  },
  vehicles: {
    findById: (id: number) => vehicles.find(v => v.id === id),
    findAll: (status?: string) => {
      let result = [...vehicles];
      if (status && status !== 'todos') {
        result = result.filter(v => v.status === status);
      }
      return result
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
        .map(v => ({
          ...v,
          created_by_name: users.find(u => u.id === v.created_by)?.name,
        }));
    },
    create: (data: any) => {
      const vehicle = {
        id: nextVehicleId++,
        ...data,
        created_at: new Date(),
        updated_at: new Date(),
      };
      vehicles.push(vehicle);
      return vehicle;
    },
    update: (id: number, data: any) => {
      const idx = vehicles.findIndex(v => v.id === id);
      if (idx === -1) return null;
      vehicles[idx] = { ...vehicles[idx], ...data, updated_at: new Date() };
      return vehicles[idx];
    },
    delete: (id: number) => {
      const idx = vehicles.findIndex(v => v.id === id);
      if (idx === -1) return false;
      vehicles.splice(idx, 1);
      return true;
    },
  },
};

export default db;
