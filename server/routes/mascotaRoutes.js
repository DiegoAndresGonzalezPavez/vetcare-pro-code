const express = require('express');
const router = express.Router();
const {
  obtenerMascotas,
  obtenerMascotaPorId,
  obtenerMascotasPorCliente,
  crearMascota,
  actualizarMascota,
  eliminarMascota,
  buscarMascotas
} = require('../controllers/mascotaController');
const { verificarAuth, verificarRol } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verificarAuth);

// GET /api/mascotas - Obtener todas las mascotas
router.get('/', obtenerMascotas);

// GET /api/mascotas/buscar?termino=firulais
router.get('/buscar', buscarMascotas);

// GET /api/mascotas/cliente/:clienteId - Mascotas de un cliente
router.get('/cliente/:clienteId', obtenerMascotasPorCliente);

// GET /api/mascotas/:id - Obtener una mascota
router.get('/:id', obtenerMascotaPorId);

// POST /api/mascotas - Crear mascota (Admin, Veterinario, Recepcionista)
router.post('/', verificarRol('Admin', 'Veterinario', 'Recepcionista'), crearMascota);

// PUT /api/mascotas/:id - Actualizar mascota
router.put('/:id', verificarRol('Admin', 'Veterinario', 'Recepcionista'), actualizarMascota);

// DELETE /api/mascotas/:id - Eliminar mascota (Solo Admin)
router.delete('/:id', verificarRol('Admin'), eliminarMascota);

module.exports = router;