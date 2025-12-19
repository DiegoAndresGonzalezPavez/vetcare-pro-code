# VetCare Pro - E-Commerce Platform

Sistema integral de e-commerce para una clínica veterinaria con frontend en Next.js, backend en Express.js, y landing page en Astro.

## 📋 Características

- **Frontend (Next.js)**: Tienda de productos, portal de cliente, gestión de citas
- **Backend (Express.js)**: API REST con autenticación, pagos Stripe, gestión de órdenes
- **Landing (Astro)**: Página de bienvenida y marketing
- **Base de datos**: PostgreSQL con Prisma ORM
- **Pagos**: Integración con Stripe
- **Autenticación**: JWT con tokens

## 🚀 Instalación y Uso

### Requisitos
- Node.js 18+
- npm o yarn
- PostgreSQL
- Cuentas en Stripe y Cloudinary (opcional)

### Setup Rápido

1. **Instalar dependencias:**
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   cd ../landing && npm install
   ```

2. **Configurar variables de entorno:**
   - Crear `.env` en `server/` con credenciales de BD, JWT, Stripe, etc.
   - Crear `.env.local` en `client/` para API_URL

3. **Ejecutar en desarrollo:**
   ```bash
   npm start  # Desde raíz, ejecuta los 3 servidores
   ```

### Servidores

- **Client (Next.js)**: http://localhost:3000
- **Server (Express)**: http://localhost:5000
- **Landing (Astro)**: http://localhost:4321

## 📁 Estructura del Proyecto

```
vetcare-pro/
├── client/           # Frontend Next.js
│   ├── src/app/      # Rutas y páginas
│   └── src/          # Componentes y servicios
├── server/           # Backend Express
│   ├── controllers/  # Lógica de negocio
│   ├── routes/       # Endpoints API
│   ├── prisma/       # Modelos de BD
│   └── services/     # Stripe, Email, etc.
└── landing/          # Landing Astro
    └── src/          # Páginas Astro
```

## 🔗 Deployment

### Vercel (Frontend)
```bash
# El proyecto está configurado para desplegarse en Vercel
vercel deploy
```

### Railway (Backend - Opcional)
El servidor puede desplegarse en Railway configurando las variables de entorno apropiadas.

## 📝 Licencia

Proyecto de educación. Uso libre.
