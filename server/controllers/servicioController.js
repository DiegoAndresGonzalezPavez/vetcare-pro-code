const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todos los servicios
const obtenerServicios = async (req, res) => {
  try {
    const servicios = await prisma.servicio.findMany({
      where: { activo: true },
      orderBy: {
        nombre: 'asc'
      }
    });
    
    res.json({
      success: true,
      data: servicios,
      total: servicios.length
    });
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener servicios',
      error: error.message
    });
  }
};

// Obtener un servicio por ID
const obtenerServicioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const servicio = await prisma.servicio.findUnique({
      where: { id: parseInt(id) },
      include: {
        citas: {
          include: {
            cliente: {
              select: {
                nombre: true,
                apellido: true
              }
            },
            mascota: {
              select: {
                nombre: true
              }
            }
          }
        }
      }
    });
    
    if (!servicio) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: servicio
    });
  } catch (error) {
    console.error('Error al obtener servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener servicio',
      error: error.message
    });
  }
};

// Crear un nuevo servicio
const crearServicio = async (req, res) => {
  try {
    const { nombre, descripcion, precio_base, duracion_minutos, categoria } = req.body;
    
    // Validar campos requeridos
    if (!nombre || !precio_base || !duracion_minutos || !categoria) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: nombre, precio_base, duracion_minutos, categoria'
      });
    }
    
    const nuevoServicio = await prisma.servicio.create({
      data: {
        nombre,
        descripcion,
        precio_base: parseFloat(precio_base),
        duracion_minutos: parseInt(duracion_minutos),
        categoria
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Servicio creado exitosamente',
      data: nuevoServicio
    });
  } catch (error) {
    console.error('Error al crear servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear servicio',
      error: error.message
    });
  }
};

// Actualizar un servicio
const actualizarServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio_base, duracion_minutos, categoria, activo } = req.body;
    
    // Verificar si el servicio existe
    const servicioExiste = await prisma.servicio.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!servicioExiste) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }
    
    const servicioActualizado = await prisma.servicio.update({
      where: { id: parseInt(id) },
      data: {
        nombre: nombre || servicioExiste.nombre,
        descripcion: descripcion !== undefined ? descripcion : servicioExiste.descripcion,
        precio_base: precio_base ? parseFloat(precio_base) : servicioExiste.precio_base,
        duracion_minutos: duracion_minutos ? parseInt(duracion_minutos) : servicioExiste.duracion_minutos,
        categoria: categoria || servicioExiste.categoria,
        activo: activo !== undefined ? activo : servicioExiste.activo
      }
    });
    
    res.json({
      success: true,
      message: 'Servicio actualizado exitosamente',
      data: servicioActualizado
    });
  } catch (error) {
    console.error('Error al actualizar servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar servicio',
      error: error.message
    });
  }
};

// Eliminar un servicio (soft delete)
const eliminarServicio = async (req, res) => {
  try {
    const { id } = req.params;
    
    const servicioExiste = await prisma.servicio.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!servicioExiste) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }
    
    await prisma.servicio.update({
      where: { id: parseInt(id) },
      data: { activo: false }
    });
    
    res.json({
      success: true,
      message: 'Servicio eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar servicio',
      error: error.message
    });
  }
};

// Obtener servicios por categoría
const obtenerServiciosPorCategoria = async (req, res) => {
  try {
    const { categoria } = req.params;
    
    const servicios = await prisma.servicio.findMany({
      where: {
        categoria: categoria,
        activo: true
      },
      orderBy: {
        nombre: 'asc'
      }
    });
    
    res.json({
      success: true,
      data: servicios,
      total: servicios.length
    });
  } catch (error) {
    console.error('Error al obtener servicios por categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener servicios',
      error: error.message
    });
  }
};

module.exports = {
  obtenerServicios,
  obtenerServicioPorId,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
  obtenerServiciosPorCategoria
};