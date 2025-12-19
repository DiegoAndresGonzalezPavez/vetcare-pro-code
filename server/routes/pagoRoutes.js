// server/routes/pagoRoutes.js
const express = require('express');
const router = express.Router();
const pagoController = require('../controllers/pagoController');

// Crear sesión de pago
router.post('/crear-sesion', pagoController.crearSesionPago);

// Confirmar pago exitoso
router.post('/confirmar', pagoController.confirmarPago);

// Obtener todos los pagos
router.get('/', pagoController.obtenerPagos);

module.exports = router;