const express = require('express');
const router = express.Router();
const {
  obtenerCitas,
  obtenerCitaPorId,
  obtenerCitasPorFecha,
  obtenerCitasPorCliente,
  crearCita,
  actualizarCita,
  cancelarCita
} = require('../controllers/citaController');
const { verificarAuth, verificarRol } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verificarAuth);

// GET /api/citas - Obtener todas las citas (todos los roles autenticados)
router.get('/', obtenerCitas);

// GET /api/citas/fecha/:fecha - Obtener citas por fecha
router.get('/fecha/:fecha', obtenerCitasPorFecha);

// GET /api/citas/cliente/:clienteId - Obtener citas por cliente
router.get('/cliente/:clienteId', obtenerCitasPorCliente);

// GET /api/citas/:id - Obtener una cita por ID
router.get('/:id', obtenerCitaPorId);

// POST /api/citas - Crear cita (Admin, Veterinario, Recepcionista)
router.post('/', verificarRol('Admin', 'Veterinario', 'Recepcionista'), crearCita);

// PUT /api/citas/:id - Actualizar cita (Admin, Veterinario, Recepcionista)
router.put('/:id', verificarRol('Admin', 'Veterinario', 'Recepcionista'), actualizarCita);

// PATCH /api/citas/:id/cancelar - Cancelar cita (Admin, Recepcionista)
router.patch('/:id/cancelar', verificarRol('Admin', 'Recepcionista'), cancelarCita);

module.exports = router;
