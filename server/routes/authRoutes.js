const express = require('express');
const router = express.Router();
const {
  registrar,
  login,
  obtenerPerfil,
  cambiarPassword,
  verificarToken
} = require('../controllers/authController');
const { verificarAuth } = require('../middleware/auth');

// Rutas públicas (no requieren autenticación)
// POST /api/auth/registrar - Registrar nuevo usuario
router.post('/registrar', registrar);

// POST /api/auth/login - Iniciar sesión
router.post('/login', login);

// Rutas protegidas (requieren autenticación)
// GET /api/auth/perfil - Obtener perfil del usuario autenticado
router.get('/perfil', verificarAuth, obtenerPerfil);

// PUT /api/auth/cambiar-password - Cambiar contraseña
router.put('/cambiar-password', verificarAuth, cambiarPassword);

// GET /api/auth/verificar - Verificar si el token es válido
router.get('/verificar', verificarAuth, verificarToken);

module.exports = router;

// Al inicio del archivo authRoutes.js, después de las importaciones
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Autenticación VetCare Pro',
    endpoints: {
      'POST /api/auth/registrar': 'Registrar nuevo usuario',
      'POST /api/auth/login': 'Iniciar sesión',
      'GET /api/auth/perfil': 'Obtener perfil (requiere token)',
      'PUT /api/auth/cambiar-password': 'Cambiar contraseña (requiere token)',
      'GET /api/auth/verificar': 'Verificar token (requiere token)'
    }
  });
});