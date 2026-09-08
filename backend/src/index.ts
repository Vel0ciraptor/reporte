import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import clientsRoutes from './routes/clients.routes';
import vehiclesRoutes from './routes/vehicles.routes';
import usersRoutes from './routes/users.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

const uploadsPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsPath));

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/users', usersRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: 'demo', timestamp: new Date().toISOString() });
});

console.log('🚀 Modo DEMO activo - usando base de datos en memoria');
console.log('📧 Credenciales de prueba:');
console.log('   Admin:  admin@demo.com / demo123');
console.log('   Promotor: maria@demo.com / demo123');

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

export default app;
