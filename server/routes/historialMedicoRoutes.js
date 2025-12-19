// server/routes/historialMedicoRoutes.js
const express = require('express');
const router = express.Router();
const { verificarAuth, verificarRol } = require('../middleware/auth');
const {
  obtenerHistoriales,
  obtenerHistorialPorId,
  obtenerHistorialesPorMascota,
  crearHistorial,
  actualizarHistorial
} = require('../controllers/historialMedicoController');

// Todas las rutas requieren autenticación
router.use(verificarAuth);

// GET /api/historiales - Obtener todos los historiales (Admin, Veterinario)
router.get('/', verificarRol('Admin', 'Veterinario'), obtenerHistoriales);

// GET /api/historiales/mascota/:mascotaId - Historiales de una mascota
router.get('/mascota/:mascotaId', obtenerHistorialesPorMascota);

// GET /api/historiales/:id - Obtener un historial específico
router.get('/:id', obtenerHistorialPorId);

// POST /api/historiales - Crear historial (Veterinario)
router.post('/', verificarRol('Veterinario'), crearHistorial);

// PUT /api/historiales/:id - Actualizar historial (Veterinario)
router.put('/:id', verificarRol('Veterinario'), actualizarHistorial);

module.exports = router;