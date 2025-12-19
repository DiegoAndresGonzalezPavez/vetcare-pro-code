const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Importar rutas
const clienteRoutes = require('./routes/clienteRoutes');
const mascotaRoutes = require('./routes/mascotaRoutes');
const servicioRoutes = require('./routes/servicioRoutes');
const citaRoutes = require('./routes/citaRoutes');
const productoRoutes = require('./routes/productoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const historialMedicoRoutes = require('./routes/historialMedicoRoutes');
const facturaRoutes = require('./routes/facturaRoutes');
const pagoRoutes = require('./routes/pagoRoutes');
const authRoutes = require('./routes/authRoutes');
const inventarioMovimientoRoutes = require('./routes/inventarioMovimientoRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const ordenRoutes = require('./routes/ordenRoutes');

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'VetCare API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Rutas de la API
app.use('/api/clientes', clienteRoutes);
app.use('/api/mascotas', mascotaRoutes);
app.use('/api/servicios', servicioRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/historiales', historialMedicoRoutes);
app.use('/api/facturas', facturaRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/inventario-movimientos', inventarioMovimientoRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ordenes', ordenRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo salió mal en el servidor',
    message: err.message 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor VetCare corriendo en http://localhost:${PORT}`);
  console.log(`📡 Prueba la API en http://localhost:${PORT}/api/test`);
  console.log(`📸 API Upload: http://localhost:${PORT}/api/upload`);
});