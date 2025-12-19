const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

// ============================================
// NUEVAS FUNCIONES PARA PORTAL DEL CLIENTE
// ============================================

// Registro de cliente (público - sin auth)
const registrarCliente = async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, direccion, rut, password } = req.body;
    
    // Validar campos requeridos
    if (!nombre || !apellido || !email || !telefono || !rut || !password) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos'
      });
    }

    // Verificar si el email ya existe
    const emailExiste = await prisma.cliente.findUnique({
      where: { email }
    });
    
    if (emailExiste) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }
    
    // Verificar si el RUT ya existe
    const rutExiste = await prisma.cliente.findUnique({
      where: { rut }
    });
    
    if (rutExiste) {
      return res.status(400).json({
        success: false,
        message: 'El RUT ya está registrado'
      });
    }

    // Hash de la contraseña
    const password_hash = await bcrypt.hash(password, 10);

    // Crear cliente
    const nuevoCliente = await prisma.cliente.create({
      data: {
        nombre,
        apellido,
        email,
        telefono,
        direccion,
        rut,
        password_hash
      }
    });

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: nuevoCliente.id, 
        email: nuevoCliente.email,
        tipo: 'cliente' 
      },
      process.env.JWT_SECRET || 'tu_secret_key_aqui',
      { expiresIn: '7d' }
    );

    // No devolver el password_hash
    const { password_hash: _, ...clienteSinPassword } = nuevoCliente;

    res.status(201).json({
      success: true,
      message: 'Cliente registrado exitosamente',
      token,
      cliente: clienteSinPassword
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar cliente',
      error: error.message
    });
  }
};

// Login de cliente (público - sin auth)
const loginCliente = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar cliente por email
    const cliente = await prisma.cliente.findUnique({
      where: { email }
    });

    if (!cliente) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos'
      });
    }

    // Verificar si el cliente está activo
    if (!cliente.activo) {
      return res.status(401).json({
        success: false,
        message: 'Cuenta desactivada. Contacte al administrador'
      });
    }

    // Verificar contraseña
    if (!cliente.password_hash) {
      return res.status(401).json({
        success: false,
        message: 'Esta cuenta no tiene contraseña configurada. Contacte al administrador'
      });
    }

    const passwordValido = await bcrypt.compare(password, cliente.password_hash);

    if (!passwordValido) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: cliente.id, 
        email: cliente.email,
        tipo: 'cliente'
      },
      process.env.JWT_SECRET || 'tu_secret_key_aqui',
      { expiresIn: '7d' }
    );

    // No devolver el password_hash
    const { password_hash: _, ...clienteSinPassword } = cliente;

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      cliente: clienteSinPassword
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

// ============================================
// FUNCIONES EXISTENTES (PARA ADMIN)
// ============================================

// Obtener todos los clientes
const obtenerClientes = async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany({
      where: { activo: true },
      include: {
        mascotas: true
      },
      orderBy: {
        fecha_registro: 'desc'
      }
    });
    
    // No devolver password_hash
    const clientesSinPassword = clientes.map(({ password_hash, ...cliente }) => cliente);
    
    res.json({
      success: true,
      data: clientesSinPassword,
      total: clientesSinPassword.length
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener clientes',
      error: error.message
    });
  }
};

// Obtener un cliente por ID
const obtenerClientePorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cliente = await prisma.cliente.findUnique({
      where: { id: parseInt(id) },
      include: {
        mascotas: true,
        citas: {
          include: {
            mascota: true,
            servicio: true
          }
        }
      }
    });
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // No devolver password_hash
    const { password_hash, ...clienteSinPassword } = cliente;
    
    res.json({
      success: true,
      data: clienteSinPassword
    });
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cliente',
      error: error.message
    });
  }
};

// Crear un nuevo cliente (desde admin)
const crearCliente = async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, direccion, rut } = req.body;
    
    // Validar campos requeridos
    if (!nombre || !apellido || !email || !telefono || !rut) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: nombre, apellido, email, telefono, rut'
      });
    }
    
    // Verificar si el email ya existe
    const emailExiste = await prisma.cliente.findUnique({
      where: { email }
    });
    
    if (emailExiste) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }
    
    // Verificar si el RUT ya existe
    const rutExiste = await prisma.cliente.findUnique({
      where: { rut }
    });
    
    if (rutExiste) {
      return res.status(400).json({
        success: false,
        message: 'El RUT ya está registrado'
      });
    }
    
    const nuevoCliente = await prisma.cliente.create({
      data: {
        nombre,
        apellido,
        email,
        telefono,
        direccion,
        rut
        // password_hash es opcional para clientes creados desde admin
      }
    });

    // No devolver password_hash
    const { password_hash, ...clienteSinPassword } = nuevoCliente;
    
    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: clienteSinPassword
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear cliente',
      error: error.message
    });
  }
};

// Actualizar un cliente
const actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, telefono, direccion, rut, activo } = req.body;
    
    // Verificar si el cliente existe
    const clienteExiste = await prisma.cliente.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!clienteExiste) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    
    // Si se está actualizando el email, verificar que no exista en otro cliente
    if (email && email !== clienteExiste.email) {
      const emailExiste = await prisma.cliente.findUnique({
        where: { email }
      });
      
      if (emailExiste) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado en otro cliente'
        });
      }
    }
    
    const clienteActualizado = await prisma.cliente.update({
      where: { id: parseInt(id) },
      data: {
        nombre: nombre || clienteExiste.nombre,
        apellido: apellido || clienteExiste.apellido,
        email: email || clienteExiste.email,
        telefono: telefono || clienteExiste.telefono,
        direccion: direccion || clienteExiste.direccion,
        rut: rut || clienteExiste.rut,
        activo: activo !== undefined ? activo : clienteExiste.activo
      }
    });

    // No devolver password_hash
    const { password_hash, ...clienteSinPassword } = clienteActualizado;
    
    res.json({
      success: true,
      message: 'Cliente actualizado exitosamente',
      data: clienteSinPassword
    });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cliente',
      error: error.message
    });
  }
};

// Eliminar un cliente (soft delete)
const eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    
    const clienteExiste = await prisma.cliente.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!clienteExiste) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    
    // Soft delete: solo marcamos como inactivo
    await prisma.cliente.update({
      where: { id: parseInt(id) },
      data: { activo: false }
    });
    
    res.json({
      success: true,
      message: 'Cliente eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar cliente',
      error: error.message
    });
  }
};

// Buscar clientes
const buscarClientes = async (req, res) => {
  try {
    const { termino } = req.query;
    
    if (!termino) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar un término de búsqueda'
      });
    }
    
    const clientes = await prisma.cliente.findMany({
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
      include: {
        mascotas: true
      }
    });

    // No devolver password_hash
    const clientesSinPassword = clientes.map(({ password_hash, ...cliente }) => cliente);
    
    res.json({
      success: true,
      data: clientesSinPassword,
      total: clientesSinPassword.length
    });
  } catch (error) {
    console.error('Error al buscar clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar clientes',
      error: error.message
    });
  }
};

module.exports = {
  // Nuevas funciones para portal del cliente
  registrarCliente,
  loginCliente,
  // Funciones existentes para admin
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  buscarClientes
};