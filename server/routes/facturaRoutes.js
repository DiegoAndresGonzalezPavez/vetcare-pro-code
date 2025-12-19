const express = require('express');
const router = express.Router();
const {
  obtenerFacturas,
  obtenerFacturaPorId,
  obtenerFacturasPorCliente,
  crearFactura,
  actualizarEstadoPago
} = require('../controllers/facturaController');
const { verificarAuth, verificarRol } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verificarAuth);

// GET /api/facturas - Obtener todas las facturas
router.get('/', obtenerFacturas);

// GET /api/facturas/cliente/:clienteId - Facturas de un cliente
// IMPORTANTE: Esta ruta debe ir ANTES de /:id para evitar conflictos
router.get('/cliente/:clienteId', obtenerFacturasPorCliente);

// GET /api/facturas/:id - Obtener una factura
router.get('/:id', obtenerFacturaPorId);

// POST /api/facturas - Crear factura (Admin, Recepcionista)
router.post('/', verificarRol('Admin', 'Recepcionista'), crearFactura);

// PATCH /api/facturas/:id/estado - Actualizar estado de pago
router.patch('/:id/estado', verificarRol('Admin', 'Recepcionista'), actualizarEstadoPago);

module.exports = router;