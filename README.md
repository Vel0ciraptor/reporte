# Automotors CRM

Sistema de gestión de clientes para venta de vehículos con roles de Administrador y Promotor.

## Stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Base de datos:** PostgreSQL
- **Autenticación:** JWT (email + contraseña)
- **WhatsApp:** Integración vía wa.me

## Requisitos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

## Instalación

### 1. Configurar Base de Datos

```sql
-- Crear la base de datos
CREATE DATABASE automotors;

-- Ejecutar el schema
\i backend/src/db/schema.sql
```

### 2. Configurar Backend

```bash
cd backend
npm install

# Editar .env con tus datos de PostgreSQL
# DB_PASSWORD=tu_password
# JWT_SECRET=tu_secreto_seguido

# Crear usuario admin (opcional, el schema crea uno por defecto)
# Recuerda hashear la contraseña con bcrypt antes de insertar

npm run dev
```

El backend correrá en `http://localhost:3000`

### 3. Configurar Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend correrá en `http://localhost:5173`

### 4. Crear Usuario Admin

```sql
-- Ejecutar en PostgreSQL (reemplaza la contraseña hasheada)
-- Contraseña de ejemplo: admin123
INSERT INTO users (name, email, password, role) 
VALUES ('Administrador', 'admin@automotors.com', '$2a$10$8KzpQ1z5v5z5z5z5z5z5zOeS5z5z5z5z5z5z5z5z5z5z5z5z5z', 'admin');
```

O usa la API:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@automotors.com","password":"admin123"}'
```

## Estructura del Proyecto

```
Automotors/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── db/             # Conexión y schema
│   │   ├── middleware/      # Auth y roles
│   │   ├── routes/         # Endpoints
│   │   └── types/          # Tipos TypeScript
│   └── uploads/            # Archivos subidos
├── frontend/
│   └── src/
│       ├── components/     # Componentes React
│       │   ├── admin/      # Vistas del admin
│       │   └── promotor/   # Vistas del promotor
│       ├── context/        # Auth context
│       ├── lib/            # Utilidades
│       └── pages/          # Páginas principales
└── README.md
```

## Funcionalidades

### Admin
- Dashboard con métricas de clientes
- Ver y gestionar todos los clientes
- Ver lista de promotores con conteo de clientes
- CRUD de vehículos (nombre, imagen JPG, ficha PDF, precio)
- Cambiar estado de cualquier cliente

### Promotor
- Registrar nuevos clientes
- Ver y filtrar sus clientes por estado
- Enviar información por WhatsApp con un toque
- Ver catálogo de vehículos con imágenes
- Ver fichas técnicas (PDF) en pantalla completa
- Notificaciones de clientes sin contacto > 24h

### Estados del Cliente
- `sin_contacto` - Sin contacto aún
- `interesado` - Cliente interesado
- `en_proceso` - En proceso de negociación
- `citado` - Citado para visita
- `cerrado` - Venta cerrada
- `no_interesa` - No le interesa

## Deploy en VPS

### Backend

```bash
# Instalar PM2
npm install -g pm2

# Build
cd backend
npm run build

# Iniciar con PM2
pm2 start dist/index.js --name automotors-api

# Guardar configuración
pm2 save
pm2 startup
```

### Frontend

```bash
cd frontend
npm run build

# Copiar dist a /var/www/html o configurar nginx
cp -r dist/* /var/www/html/
```

### Nginx (ejemplo)

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /ruta/a/Automotors/backend/uploads;
    }
}
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil

### Clients
- `POST /api/clients` - Crear cliente (promotor)
- `GET /api/clients/my` - Mis clientes (promotor)
- `GET /api/clients` - Todos los clientes (admin)
- `GET /api/clients/stats` - Estadísticas (admin)
- `PUT /api/clients/:id/status` - Actualizar estado
- `PUT /api/clients/:id` - Actualizar cliente
- `DELETE /api/clients/:id` - Eliminar cliente (admin)

### Vehicles
- `GET /api/vehicles` - Listar vehículos
- `GET /api/vehicles/:id` - Detalle vehículo
- `POST /api/vehicles` - Crear vehículo (admin, con archivos)
- `PUT /api/vehicles/:id` - Actualizar vehículo (admin)
- `DELETE /api/vehicles/:id` - Eliminar vehículo (admin)

### Users
- `GET /api/users/promotores` - Listar promotores (admin)
- `GET /api/users/promotores/:id/clients` - Clientes de un promotor (admin)
