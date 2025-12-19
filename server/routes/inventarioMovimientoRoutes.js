const express = require('express');
const router = express.Router();
const {
  obtenerMovimientos,
  obtenerMovimientoPorId,
  obtenerMovimientosPorProducto,
  crearMovimiento,
  obtenerMovimientosPorTipo
} = require('../controllers/inventarioMovimientoController');
const { verificarAuth, verificarRol } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verificarAuth);

// GET /api/inventario-movimientos - Obtener todos los movimientos
router.get('/', obtenerMovimientos);

// GET /api/inventario-movimientos/tipo/:tipo - Movimientos por tipo
router.get('/tipo/:tipo', obtenerMovimientosPorTipo);

// GET /api/inventario-movimientos/producto/:productoId
router.get('/producto/:productoId', obtenerMovimientosPorProducto);

// GET /api/inventario-movimientos/:id - Obtener un movimiento
router.get('/:id', obtenerMovimientoPorId);

// POST /api/inventario-movimientos - Crear movimiento (Admin, Veterinario, Asistente)
router.post('/', verificarRol('Admin', 'Veterinario', 'Asistente'), crearMovimiento);

module.exports = router;