const express = require('express');
const router = express.Router();
const {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerProductosStockBajo,
  buscarProductos
} = require('../controllers/productoController');
const { verificarAuth, verificarRol } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verificarAuth);

// GET /api/productos - Obtener todos los productos
router.get('/', obtenerProductos);

// GET /api/productos/stock-bajo - Productos con stock bajo
router.get('/stock-bajo', obtenerProductosStockBajo);

// GET /api/productos/buscar?termino=antibiotico
router.get('/buscar', buscarProductos);

// GET /api/productos/:id - Obtener un producto
router.get('/:id', obtenerProductoPorId);

// POST /api/productos - Crear producto (Admin, Veterinario)
router.post('/', verificarRol('Admin', 'Veterinario'), crearProducto);

// PUT /api/productos/:id - Actualizar producto
router.put('/:id', verificarRol('Admin', 'Veterinario'), actualizarProducto);

// DELETE /api/productos/:id - Eliminar producto (Solo Admin)
router.delete('/:id', verificarRol('Admin'), eliminarProducto);

module.exports = router;