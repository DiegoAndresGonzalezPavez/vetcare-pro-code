const express = require('express');
const router = express.Router();
const {
  obtenerServicios,
  obtenerServicioPorId,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
  obtenerServiciosPorCategoria
} = require('../controllers/servicioController');
const { verificarAuth, verificarRol } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verificarAuth);

// GET /api/servicios - Obtener todos los servicios (todos los roles)
router.get('/', obtenerServicios);

// GET /api/servicios/categoria/:categoria - Obtener servicios por categoría
router.get('/categoria/:categoria', obtenerServiciosPorCategoria);

// GET /api/servicios/:id - Obtener un servicio por ID
router.get('/:id', obtenerServicioPorId);

// POST /api/servicios - Crear servicio (Solo Admin)
router.post('/', verificarRol('Admin'), crearServicio);

// PUT /api/servicios/:id - Actualizar servicio (Solo Admin)
router.put('/:id', verificarRol('Admin'), actualizarServicio);

// DELETE /api/servicios/:id - Eliminar servicio (Solo Admin)
router.delete('/:id', verificarRol('Admin'), eliminarServicio);

module.exports = router;