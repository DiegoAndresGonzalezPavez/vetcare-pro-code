const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todos los movimientos
const obtenerMovimientos = async (req, res) => {
  try {
    const movimientos = await prisma.inventarioMovimiento.findMany({
      include: {
        producto: {
          select: {
            nombre: true,
            categoria: true
          }
        },
        usuario: {
          select: {
            nombre: true,
            apellido: true,
            rol: true
          }
        }
      },
      orderBy: {
        fecha_creacion: 'desc'
      }
    });
    
    res.json({
      success: true,
      data: movimientos,
      total: movimientos.length
    });
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener movimientos de inventario',
      error: error.message
    });
  }
};

// Obtener un movimiento por ID
const obtenerMovimientoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const movimiento = await prisma.inventarioMovimiento.findUnique({
      where: { id: parseInt(id) },
      include: {
        producto: true,
        usuario: {
          select: {
            nombre: true,
            apellido: true
          }
        }
      }
    });
    
    if (!movimiento) {
      return res.status(404).json({
        success: false,
        message: 'Movimiento no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: movimiento
    });
  } catch (error) {
    console.error('Error al obtener movimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener movimiento',
      error: error.message
    });
  }
};

// Obtener movimientos por producto
const obtenerMovimientosPorProducto = async (req, res) => {
  try {
    const { productoId } = req.params;
    
    const movimientos = await prisma.inventarioMovimiento.findMany({
      where: {
        id_producto: parseInt(productoId)
      },
      include: {
        usuario: {
          select: {
            nombre: true,
            apellido: true
          }
        }
      },
      orderBy: {
        fecha_creacion: 'desc'
      }
    });
    
    res.json({
      success: true,
      data: movimientos,
      total: movimientos.length
    });
  } catch (error) {
    console.error('Error al obtener movimientos por producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener movimientos',
      error: error.message
    });
  }
};

// Crear un nuevo movimiento de inventario
const crearMovimiento = async (req, res) => {
  try {
    const {
      id_producto,
      id_usuario,
      tipo_movimiento,
      cantidad,
      motivo,
      precio_unitario,
      referencia_id,
      referencia_tipo
    } = req.body;
    
    // Validar campos requeridos
    if (!id_producto || !id_usuario || !tipo_movimiento || !cantidad) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos'
      });
    }
    
    // Validar tipo de movimiento
    const tiposValidos = ['entrada', 'salida', 'ajuste'];
    if (!tiposValidos.includes(tipo_movimiento)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de movimiento inválido. Tipos válidos: entrada, salida, ajuste'
      });
    }
    
    // Verificar que el producto exista
    const productoExiste = await prisma.producto.findUnique({
      where: { id: parseInt(id_producto) }
    });
    
    if (!productoExiste) {
      return res.status(404).json({
        success: false,
        message: 'El producto especificado no existe'
      });
    }
    
    // Verificar que el usuario exista
    const usuarioExiste = await prisma.usuario.findUnique({
      where: { id: parseInt(id_usuario) }
    });
    
    if (!usuarioExiste) {
      return res.status(404).json({
        success: false,
        message: 'El usuario especificado no existe'
      });
    }
    
    // Calcular nuevo stock según tipo de movimiento
    const stockAnterior = productoExiste.stock_actual;
    let stockNuevo = stockAnterior;
    
    if (tipo_movimiento === 'entrada') {
      stockNuevo = stockAnterior + parseInt(cantidad);
    } else if (tipo_movimiento === 'salida') {
      stockNuevo = stockAnterior - parseInt(cantidad);
      
      // Verificar que haya stock suficiente
      if (stockNuevo < 0) {
        return res.status(400).json({
          success: false,
          message: 'Stock insuficiente para realizar la salida'
        });
      }
    } else if (tipo_movimiento === 'ajuste') {
      stockNuevo = parseInt(cantidad); // En ajuste, la cantidad es el nuevo stock
    }
    
    // Crear el movimiento
    const nuevoMovimiento = await prisma.inventarioMovimiento.create({
      data: {
        id_producto: parseInt(id_producto),
        id_usuario: parseInt(id_usuario),
        tipo_movimiento,
        cantidad: parseInt(cantidad),
        motivo,
        precio_unitario: precio_unitario ? parseFloat(precio_unitario) : null,
        referencia_id: referencia_id ? parseInt(referencia_id) : null,
        referencia_tipo,
        stock_anterior: stockAnterior,
        stock_nuevo: stockNuevo
      },
      include: {
        producto: {
          select: {
            nombre: true
          }
        },
        usuario: {
          select: {
            nombre: true,
            apellido: true
          }
        }
      }
    });
    
    // Actualizar el stock del producto
    await prisma.producto.update({
      where: { id: parseInt(id_producto) },
      data: { stock_actual: stockNuevo }
    });
    
    res.status(201).json({
      success: true,
      message: 'Movimiento de inventario registrado exitosamente',
      data: nuevoMovimiento
    });
  } catch (error) {
    console.error('Error al crear movimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear movimiento',
      error: error.message
    });
  }
};

// Obtener movimientos por tipo
const obtenerMovimientosPorTipo = async (req, res) => {
  try {
    const { tipo } = req.params;
    
    const movimientos = await prisma.inventarioMovimiento.findMany({
      where: {
        tipo_movimiento: tipo
      },
      include: {
        producto: {
          select: {
            nombre: true
          }
        },
        usuario: {
          select: {
            nombre: true,
            apellido: true
          }
        }
      },
      orderBy: {
        fecha_creacion: 'desc'
      }
    });
    
    res.json({
      success: true,
      data: movimientos,
      total: movimientos.length
    });
  } catch (error) {
    console.error('Error al obtener movimientos por tipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener movimientos',
      error: error.message
    });
  }
};

module.exports = {
  obtenerMovimientos,
  obtenerMovimientoPorId,
  obtenerMovimientosPorProducto,
  crearMovimiento,
  obtenerMovimientosPorTipo
};