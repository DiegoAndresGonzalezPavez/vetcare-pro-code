const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// Obtener todos los usuarios
const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: { activo: true },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        telefono: true,
        rut: true,
        activo: true,
        fecha_creacion: true
      },
      orderBy: {
        fecha_creacion: 'desc'
      }
    });
    
    res.json({
      success: true,
      data: usuarios,
      total: usuarios.length
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
};

// Obtener un usuario por ID
const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
  if (!id) return res.status(400).json({ success: false, message: 'ID requerido' });
    
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        telefono: true,
        rut: true,
        activo: true,
        fecha_creacion: true,
        citas: {
          include: {
            mascota: true,
            cliente: true
          }
        }
      }
    });
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error.message
    });
  }
};

// Crear un nuevo usuario
const crearUsuario = async (req, res) => {
  try {
    const { nombre, apellido, email, password, rol, telefono, rut } = req.body;
    
    // Validar campos requeridos
    if (!nombre || !apellido || !email || !password || !rol || !rut) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: nombre, apellido, email, password, rol, rut'
      });
    }
    
    // Validar rol
    const rolesValidos = ['Admin', 'Veterinario', 'Recepcionista', 'Asistente'];
    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido. Roles válidos: Admin, Veterinario, Recepcionista, Asistente'
      });
    }
    
    // Verificar si el email ya existe
    const emailExiste = await prisma.usuario.findUnique({
      where: { email }
    });
    
    if (emailExiste) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }
    
    // Verificar si el RUT ya existe
    const rutExiste = await prisma.usuario.findUnique({
      where: { rut }
    });
    
    if (rutExiste) {
      return res.status(400).json({
        success: false,
        message: 'El RUT ya está registrado'
      });
    }
    
    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre,
        apellido,
        email,
        password_hash,
        rol,
        telefono,
        rut
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        telefono: true,
        rut: true,
        fecha_creacion: true
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: nuevoUsuario
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario',
      error: error.message
    });
  }
};

// Actualizar un usuario
const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, password, rol, telefono, activo } = req.body;
    
    const usuarioExiste = await prisma.usuario.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!usuarioExiste) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Si se está actualizando el email, verificar que no exista en otro usuario
    if (email && email !== usuarioExiste.email) {
      const emailExiste = await prisma.usuario.findUnique({
        where: { email }
      });
      
      if (emailExiste) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado en otro usuario'
        });
      }
    }
    
    // Preparar datos de actualización
    const datosActualizacion = {
      nombre: nombre || usuarioExiste.nombre,
      apellido: apellido || usuarioExiste.apellido,
      email: email || usuarioExiste.email,
      rol: rol || usuarioExiste.rol,
      telefono: telefono !== undefined ? telefono : usuarioExiste.telefono,
      activo: activo !== undefined ? activo : usuarioExiste.activo
    };
    
    // Si se proporcionó nueva contraseña, encriptarla
    if (password) {
      const salt = await bcrypt.genSalt(10);
      datosActualizacion.password_hash = await bcrypt.hash(password, salt);
    }
    
    const usuarioActualizado = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: datosActualizacion,
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        telefono: true,
        rut: true,
        activo: true,
        fecha_creacion: true
      }
    });
    
    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: usuarioActualizado
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: error.message
    });
  }
};

// Eliminar un usuario (soft delete)
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    
    const usuarioExiste = await prisma.usuario.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!usuarioExiste) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: { activo: false }
    });
    
    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error.message
    });
  }
};

// Obtener usuarios por rol
const obtenerUsuariosPorRol = async (req, res) => {
  try {
    const { rol } = req.params;
    
    const usuarios = await prisma.usuario.findMany({
      where: {
        rol: rol,
        activo: true
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true
      },
      orderBy: {
        nombre: 'asc'
      }
    });
    
    res.json({
      success: true,
      data: usuarios,
      total: usuarios.length
    });
  } catch (error) {
    console.error('Error al obtener usuarios por rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
};

// Buscar usuarios
const buscarUsuarios = async (req, res) => {
  try {
    const { termino } = req.query;
    
    if (!termino) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar un término de búsqueda'
      });
    }
    
    const usuarios = await prisma.usuario.findMany({
      where: {
        AND: [
          { activo: true },
          {
            OR: [
              { nombre: { contains: termino, mode: 'insensitive' } },
              { apellido: { contains: termino, mode: 'insensitive' } },
              { email: { contains: termino, mode: 'insensitive' } },
              { rut: { contains: termino, mode: 'insensitive' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        telefono: true,
        rut: true
      }
    });
    
    res.json({
      success: true,
      data: usuarios,
      total: usuarios.length
    });
  } catch (error) {
    console.error('Error al buscar usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar usuarios',
      error: error.message
    });
  }
};

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  obtenerUsuariosPorRol,
  buscarUsuarios
};