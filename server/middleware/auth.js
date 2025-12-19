const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware para verificar token JWT
const verificarAuth = async (req, res, next) => {
  try {
    // Obtener token del header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. No se proporcionó token de autenticación'
      });
    }
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario en la base de datos
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        activo: true
      }
    });
    
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido. Usuario no encontrado'
      });
    }
    
    if (!usuario.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo. Contacte al administrador'
      });
    }
    
    // Agregar usuario al request
    req.usuario = usuario;
    next();
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado. Por favor inicie sesión nuevamente'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    console.error('Error en middleware de autenticación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar autenticación',
      error: error.message
    });
  }
};

// Middleware para verificar roles específicos
const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }
    
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere rol: ${rolesPermitidos.join(' o ')}`
      });
    }
    
    next();
  };
};

// Middleware para verificar que el usuario solo acceda a sus propios datos
const verificarPropietario = (tipoDato) => {
  return async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      // Si es Admin, puede ver todo
      if (req.usuario.rol === 'Admin') {
        return next();
      }
      
      // Verificar según el tipo de dato
      switch (tipoDato) {
        case 'usuario':
          if (req.usuario.id !== id) {
            return res.status(403).json({
              success: false,
              message: 'No tienes permiso para acceder a este recurso'
            });
          }
          break;
          
        case 'cita':
          const cita = await prisma.cita.findUnique({
            where: { id }
          });
          
          if (cita && cita.id_veterinario !== req.usuario.id) {
            return res.status(403).json({
              success: false,
              message: 'No tienes permiso para acceder a esta cita'
            });
          }
          break;
          
        // Puedes agregar más casos según necesites
      }
      
      next();
    } catch (error) {
      console.error('Error en verificación de propietario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar permisos'
      });
    }
  };
};

module.exports = {
  verificarAuth,
  verificarRol,
  verificarPropietario
};