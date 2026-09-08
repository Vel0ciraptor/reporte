import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'automotors',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

async function initDB() {
  let retries = 10;
  while (retries > 0) {
    try {
      const client = await pool.connect();
      try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');
        await client.query(schema);
        console.log('Tablas creadas/verificadas');

        const { rows } = await client.query('SELECT COUNT(*) as count FROM users');
        if (parseInt(rows[0].count) === 0) {
          console.log('Insertando datos demo...');
          await seed(client);
          console.log('Datos demo insertados');
        }
        return;
      } finally {
        client.release();
      }
    } catch (error) {
      retries--;
      console.log(`Esperando PostgreSQL... (${retries} intentos restantes)`);
      if (retries === 0) throw error;
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

async function seed(client: any) {
  const hash = await bcrypt.hash('demo123', 10);

  const usersResult = await client.query(
    `INSERT INTO users (name, email, password, role) VALUES
     ('Carlos Admin', 'admin@demo.com', $1, 'admin'),
     ('María García', 'maria@demo.com', $1, 'promotor'),
     ('Juan López', 'juan@demo.com', $1, 'promotor'),
     ('Ana Martínez', 'ana@demo.com', $1, 'promotor')
     RETURNING id, role`,
    [hash]
  );

  const adminId = usersResult.rows.find((r: any) => r.role === 'admin').id;
  const mariaId = usersResult.rows.find((r: any) => r.email === 'maria@demo.com').id;
  const juanId = usersResult.rows.find((r: any) => r.email === 'juan@demo.com').id;
  const anaId = usersResult.rows.find((r: any) => r.email === 'ana@demo.com').id;

  await client.query(
    `INSERT INTO clients (name, phone, email, vehicle, status, notes, promotor_id, last_contact_at, appointment_date, created_at) VALUES
     ('Pedro Sánchez', '5551234567', 'pedro@email.com', 'Toyota Corolla 2024', 'interesado', 'Busca financiamiento a 36 meses', $1, NOW() - INTERVAL '1 day', NOW() + INTERVAL '2 days', NOW() - INTERVAL '7 days'),
     ('Laura Díaz', '5559876543', 'laura@email.com', 'Honda CR-V 2024', 'sin_contacto', '', $1, NULL, NULL, NOW() - INTERVAL '3 days'),
     ('Roberto Fernández', '5551122334', 'roberto@email.com', 'Mazda CX-5 2024', 'en_proceso', 'Quiere color azul', $1, NOW() - INTERVAL '2 days', NULL, NOW() - INTERVAL '10 days'),
     ('Sofía Morales', '5554433221', 'sofia@email.com', 'Volkswagen Jetta 2024', 'citado', 'Cita para el sábado a las 10am', $1, NOW(), NOW() + INTERVAL '5 days', NOW() - INTERVAL '13 days'),
     ('Miguel Torres', '5556677889', 'miguel@email.com', 'Nissan Sentra 2024', 'cerrado', 'Venta completada', $2, NOW() - INTERVAL '4 days', NULL, NOW() - INTERVAL '23 days'),
     ('Carmen Ruiz', '5559988776', 'carmen@email.com', 'Hyundai Tucson 2024', 'no_interesa', 'Compró otra marca', $2, NOW() - INTERVAL '6 days', NULL, NOW() - INTERVAL '18 days'),
     ('Fernando Reyes', '5553344556', 'fernando@email.com', 'Chevrolet Equinox 2024', 'sin_contacto', '', $2, NULL, NULL, NOW() - INTERVAL '1 day'),
     ('Isabela Cruz', '5552211009', 'isabela@email.com', 'Toyota RAV4 2024', 'interesado', 'Viene con su esposo el fin de semana', $3, NOW(), NOW() + INTERVAL '4 days', NOW() - INTERVAL '5 days'),
     ('Diego Vargas', '5557788990', 'diego@email.com', 'Honda Civic 2024', 'en_proceso', 'Comparando con el Corolla', $3, NOW() - INTERVAL '2 days', NULL, NOW() - INTERVAL '8 days'),
     ('Valentina Ortiz', '5558899001', 'valentina@email.com', 'Mazda 3 2024', 'sin_contacto', '', $3, NULL, NULL, NOW())`,
    [mariaId, juanId, anaId]
  );

  await client.query(
    `INSERT INTO vehicles (name, description, price, image_url, pdf_url, status, created_by) VALUES
     ('Toyota Corolla 2024', 'Sedán compacto, motor 1.8L, transmisión CVT. Excelente eficiencia de combustible.', 459900, 'corolla.jpg', 'corolla.pdf', 'disponible', $1),
     ('Honda CR-V 2024', 'SUV familiar, motor 1.5L Turbo, tracción frontal. Amplio espacio interior.', 689900, 'crv.jpg', 'crv.pdf', 'disponible', $1),
     ('Mazda CX-5 2024', 'SUV deportivo, motor 2.5L, tracción inteligente AWD. Diseño elegante.', 729900, 'cx5.jpg', 'cx5.pdf', 'disponible', $1),
     ('Volkswagen Jetta 2024', 'Sedán ejecutivo, motor 1.4L Turbo, transmisión automática de 8 velocidades.', 519900, 'jetta.jpg', 'jetta.pdf', 'disponible', $1),
     ('Nissan Sentra 2024', 'Sedán moderno, motor 2.0L, tecnología ProPILOT. Comfort y seguridad.', 439900, 'sentra.jpg', 'sentra.pdf', 'disponible', $1)`,
    [adminId]
  );
}

const db = {
  users: {
    findByEmail: async (email: string) => {
      const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      return rows[0] || null;
    },
    findById: async (id: number) => {
      const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return rows[0] || null;
    },
    findPromotores: async () => {
      const { rows } = await pool.query(`
        SELECT u.id, u.name, u.email, u.created_at,
               COUNT(c.id)::int as client_count
        FROM users u
        LEFT JOIN clients c ON c.promotor_id = u.id
        WHERE u.role = 'promotor'
        GROUP BY u.id
        ORDER BY u.name
      `);
      return rows;
    },
    create: async (data: any) => {
      const { rows } = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
        [data.name, data.email, data.password, data.role]
      );
      return rows[0];
    },
  },
  clients: {
    findById: async (id: number) => {
      const { rows } = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
      return rows[0] || null;
    },
    findByPromotor: async (promotorId: number, status?: string) => {
      let query = 'SELECT * FROM clients WHERE promotor_id = $1';
      const params: any[] = [promotorId];
      if (status && status !== 'todos') {
        query += ' AND status = $2';
        params.push(status);
      }
      query += ' ORDER BY created_at DESC';
      const { rows } = await pool.query(query, params);
      return rows;
    },
    findAll: async (filters?: { status?: string; promotor_id?: number }) => {
      let query = `
        SELECT c.*, u.name as promotor_name
        FROM clients c
        LEFT JOIN users u ON u.id = c.promotor_id
        WHERE 1=1
      `;
      const params: any[] = [];
      let idx = 1;
      if (filters?.status && filters.status !== 'todos') {
        query += ` AND c.status = $${idx++}`;
        params.push(filters.status);
      }
      if (filters?.promotor_id) {
        query += ` AND c.promotor_id = $${idx++}`;
        params.push(filters.promotor_id);
      }
      query += ' ORDER BY c.created_at DESC';
      const { rows } = await pool.query(query, params);
      return rows;
    },
    create: async (data: any) => {
      const { rows } = await pool.query(
        `INSERT INTO clients (name, phone, email, vehicle, notes, promotor_id, appointment_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [data.name, data.phone, data.email || null, data.vehicle, data.notes || null, data.promotor_id, data.appointment_date || null]
      );
      return rows[0];
    },
    update: async (id: number, data: any) => {
      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;
      for (const [key, val] of Object.entries(data)) {
        if (val !== undefined) {
          fields.push(`${key} = $${idx++}`);
          values.push(val);
        }
      }
      if (fields.length === 0) return null;
      values.push(id);
      const { rows } = await pool.query(
        `UPDATE clients SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
        values
      );
      return rows[0] || null;
    },
    delete: async (id: number) => {
      const { rowCount } = await pool.query('DELETE FROM clients WHERE id = $1', [id]);
      return (rowCount || 0) > 0;
    },
    getStats: async () => {
      const totalResult = await pool.query('SELECT COUNT(*)::int as total FROM clients');
      const total = totalResult.rows[0].total;

      const statusResult = await pool.query(
        'SELECT status, COUNT(*)::int as count FROM clients GROUP BY status'
      );
      const byStatus = statusResult.rows.map((r: any) => ({ status: r.status, count: r.count.toString() }));

      const promotoresResult = await pool.query("SELECT COUNT(*)::int as total FROM users WHERE role = 'promotor'");
      const totalPromotores = promotoresResult.rows[0].total;

      const recentResult = await pool.query(`
        SELECT c.*, u.name as promotor_name
        FROM clients c LEFT JOIN users u ON u.id = c.promotor_id
        ORDER BY c.created_at DESC LIMIT 5
      `);

      const pendingResult = await pool.query(`
        SELECT COUNT(*)::int as pending FROM clients
        WHERE status = 'sin_contacto'
        AND (last_contact_at IS NULL OR last_contact_at < NOW() - INTERVAL '24 hours')
      `);

      return {
        total,
        byStatus,
        totalPromotores,
        recentClients: recentResult.rows,
        pendingContact: pendingResult.rows[0].pending,
      };
    },
  },
  vehicles: {
    findById: async (id: number) => {
      const { rows } = await pool.query('SELECT * FROM vehicles WHERE id = $1', [id]);
      return rows[0] || null;
    },
    findAll: async (status?: string) => {
      let query = `
        SELECT v.*, u.name as created_by_name
        FROM vehicles v LEFT JOIN users u ON u.id = v.created_by
        WHERE 1=1
      `;
      const params: any[] = [];
      if (status && status !== 'todos') {
        query += ' AND v.status = $1';
        params.push(status);
      }
      query += ' ORDER BY v.created_at DESC';
      const { rows } = await pool.query(query, params);
      return rows;
    },
    create: async (data: any) => {
      const { rows } = await pool.query(
        `INSERT INTO vehicles (name, description, price, image_url, pdf_url, status, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [data.name, data.description, data.price, data.image_url, data.pdf_url, data.status, data.created_by]
      );
      return rows[0];
    },
    update: async (id: number, data: any) => {
      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;
      for (const [key, val] of Object.entries(data)) {
        if (val !== undefined) {
          fields.push(`${key} = $${idx++}`);
          values.push(val);
        }
      }
      if (fields.length === 0) return null;
      values.push(id);
      const { rows } = await pool.query(
        `UPDATE vehicles SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
        values
      );
      return rows[0] || null;
    },
    delete: async (id: number) => {
      const { rowCount } = await pool.query('DELETE FROM vehicles WHERE id = $1', [id]);
      return (rowCount || 0) > 0;
    },
  },
};

export { initDB };
export default db;
