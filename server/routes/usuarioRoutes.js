const express = require('express');
const router = express.Router();
const {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  buscarUsuarios
} = require('../controllers/usuarioController');
const { verificarAuth, verificarRol } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verificarAuth);

// GET /api/usuarios - Obtener todos los usuarios (Solo Admin)
router.get('/', verificarRol('Admin'), obtenerUsuarios);

// GET /api/usuarios/buscar?termino=juan
router.get('/buscar', verificarRol('Admin'), buscarUsuarios);

// GET /api/usuarios/:id - Obtener un usuario (Solo Admin)
router.get('/:id', verificarRol('Admin'), obtenerUsuarioPorId);

// POST /api/usuarios - Crear usuario (Solo Admin)
router.post('/', verificarRol('Admin'), crearUsuario);

// PUT /api/usuarios/:id - Actualizar usuario (Solo Admin)
router.put('/:id', verificarRol('Admin'), actualizarUsuario);

// DELETE /api/usuarios/:id - Eliminar usuario (Solo Admin)
router.delete('/:id', verificarRol('Admin'), eliminarUsuario);

module.exports = router;