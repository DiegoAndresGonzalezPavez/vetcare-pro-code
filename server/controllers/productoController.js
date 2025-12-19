const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todos los productos
const obtenerProductos = async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      where: { activo: true },
      orderBy: {
        nombre: 'asc'
      }
    });
    
    res.json({
      success: true,
      data: productos,
      total: productos.length
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error.message
    });
  }
};

// Obtener un producto por ID
const obtenerProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const producto = await prisma.producto.findUnique({
      where: { id: parseInt(id) },
      include: {
        movimientos: {
          orderBy: {
            fecha_creacion: 'desc'
          },
          take: 10
        }
      }
    });
    
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: producto
    });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener producto',
      error: error.message
    });
  }
};

// Crear un nuevo producto
const crearProducto = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      categoria,
      marca,
      unidad_medida,
      precio_compra,
      precio_venta,
      stock_minimo,
      stock_actual,
      fecha_vencimiento,
      lote,
      proveedor
    } = req.body;
    
    // Validar campos requeridos
    if (!nombre || !categoria || !unidad_medida || !precio_compra || !precio_venta || stock_minimo === undefined || stock_actual === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos'
      });
    }
    
    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre,
        descripcion,
        categoria,
        marca,
        unidad_medida,
        precio_compra: parseFloat(precio_compra),
        precio_venta: parseFloat(precio_venta),
        stock_minimo: parseInt(stock_minimo),
        stock_actual: parseInt(stock_actual),
        fecha_vencimiento: fecha_vencimiento ? new Date(fecha_vencimiento) : null,
        lote,
        proveedor
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: nuevoProducto
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear producto',
      error: error.message
    });
  }
};

// Actualizar un producto
const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      categoria,
      marca,
      unidad_medida,
      precio_compra,
      precio_venta,
      stock_minimo,
      stock_actual,
      fecha_vencimiento,
      lote,
      proveedor,
      activo
    } = req.body;
    
    const productoExiste = await prisma.producto.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!productoExiste) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    const productoActualizado = await prisma.producto.update({
      where: { id: parseInt(id) },
      data: {
        nombre: nombre || productoExiste.nombre,
        descripcion: descripcion !== undefined ? descripcion : productoExiste.descripcion,
        categoria: categoria || productoExiste.categoria,
        marca: marca !== undefined ? marca : productoExiste.marca,
        unidad_medida: unidad_medida || productoExiste.unidad_medida,
        precio_compra: precio_compra ? parseFloat(precio_compra) : productoExiste.precio_compra,
        precio_venta: precio_venta ? parseFloat(precio_venta) : productoExiste.precio_venta,
        stock_minimo: stock_minimo !== undefined ? parseInt(stock_minimo) : productoExiste.stock_minimo,
        stock_actual: stock_actual !== undefined ? parseInt(stock_actual) : productoExiste.stock_actual,
        fecha_vencimiento: fecha_vencimiento !== undefined ? (fecha_vencimiento ? new Date(fecha_vencimiento) : null) : productoExiste.fecha_vencimiento,
        lote: lote !== undefined ? lote : productoExiste.lote,
        proveedor: proveedor !== undefined ? proveedor : productoExiste.proveedor,
        activo: activo !== undefined ? activo : productoExiste.activo
      }
    });
    
    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: productoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar producto',
      error: error.message
    });
  }
};

// Eliminar un producto (soft delete)
const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    
    const productoExiste = await prisma.producto.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!productoExiste) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    await prisma.producto.update({
      where: { id: parseInt(id) },
      data: { activo: false }
    });
    
    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar producto',
      error: error.message
    });
  }
};

// Obtener productos con stock bajo
const obtenerProductosStockBajo = async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      where: {
        activo: true,
        stock_actual: {
          lte: prisma.producto.fields.stock_minimo
        }
      },
      orderBy: {
        stock_actual: 'asc'
      }
    });
    
    res.json({
      success: true,
      data: productos,
      total: productos.length
    });
  } catch (error) {
    console.error('Error al obtener productos con stock bajo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error.message
    });
  }
};

// Buscar productos
const buscarProductos = async (req, res) => {
  try {
    const { termino } = req.query;
    
    if (!termino) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar un término de búsqueda'
      });
    }
    
    const productos = await prisma.producto.findMany({
      where: {
        AND: [
          { activo: true },
          {
            OR: [
              { nombre: { contains: termino, mode: 'insensitive' } },
              { categoria: { contains: termino, mode: 'insensitive' } },
              { marca: { contains: termino, mode: 'insensitive' } }
            ]
          }
        ]
      }
    });
    
    res.json({
      success: true,
      data: productos,
      total: productos.length
    });
  } catch (error) {
    console.error('Error al buscar productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar productos',
      error: error.message
    });
  }
};

module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerProductosStockBajo,
  buscarProductos
};