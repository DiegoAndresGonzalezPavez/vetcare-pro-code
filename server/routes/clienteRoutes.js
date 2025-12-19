const express = require('express');
const router = express.Router();
const {
  registrarCliente,
  loginCliente,
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  buscarClientes
} = require('../controllers/clienteController');
const { verificarAuth, verificarRol } = require('../middleware/auth');

// ============================================
// RUTAS PÚBLICAS (sin autenticación)
// ============================================

// POST /api/clientes/register - Registro de cliente
router.post('/register', registrarCliente);

// POST /api/clientes/login - Login de cliente
router.post('/login', loginCliente);

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================

// GET /api/clientes - Obtener todos los clientes
router.get('/', verificarAuth, obtenerClientes);

// GET /api/clientes/buscar?termino=juan - Buscar clientes
router.get('/buscar', verificarAuth, buscarClientes);

// GET /api/clientes/:id - Obtener un cliente por ID
router.get('/:id', verificarAuth, obtenerClientePorId);

// POST /api/clientes - Crear cliente desde admin (Admin y Recepcionista)
router.post('/', verificarAuth, verificarRol('Admin', 'Recepcionista'), crearCliente);

// PUT /api/clientes/:id - Actualizar cliente (Admin y Recepcionista)
router.put('/:id', verificarAuth, verificarRol('Admin', 'Recepcionista'), actualizarCliente);

// DELETE /api/clientes/:id - Eliminar cliente (Solo Admin)
router.delete('/:id', verificarAuth, verificarRol('Admin'), eliminarCliente);

module.exports = router;