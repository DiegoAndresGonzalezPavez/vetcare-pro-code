const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todas las mascotas
const obtenerMascotas = async (req, res) => {
  try {
    const mascotas = await prisma.mascota.findMany({
      where: { activo: true },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            telefono: true
          }
        }
      },
      orderBy: {
        fecha_registro: 'desc'
      }
    });
    
    res.json({
      success: true,
      data: mascotas,
      total: mascotas.length
    });
  } catch (error) {
    console.error('Error al obtener mascotas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mascotas',
      error: error.message
    });
  }
};

// Obtener una mascota por ID
const obtenerMascotaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const mascota = await prisma.mascota.findUnique({
      where: { id: parseInt(id) },
      include: {
        cliente: true,
        citas: {
          include: {
            servicio: true
          }
        },
        historiales: {
          orderBy: {
            fecha_atencion: 'desc'
          }
        }
      }
    });
    
    if (!mascota) {
      return res.status(404).json({
        success: false,
        message: 'Mascota no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: mascota
    });
  } catch (error) {
    console.error('Error al obtener mascota:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mascota',
      error: error.message
    });
  }
};

// Obtener mascotas por cliente
const obtenerMascotasPorCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;
    
    const mascotas = await prisma.mascota.findMany({
      where: {
        id_cliente: parseInt(clienteId),
        activo: true
      },
      orderBy: {
        nombre: 'asc'
      }
    });
    
    res.json({
      success: true,
      data: mascotas,
      total: mascotas.length
    });
  } catch (error) {
    console.error('Error al obtener mascotas por cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mascotas',
      error: error.message
    });
  }
};

// Crear una nueva mascota
const crearMascota = async (req, res) => {
  try {
    const {
      id_cliente,
      nombre,
      especie,
      raza,
      fecha_nacimiento,
      sexo,
      color,
      peso_kg,
      microchip,
      foto_url,
      observaciones
    } = req.body;
    
    // Validar campos requeridos
    if (!id_cliente || !nombre || !especie || !raza || !fecha_nacimiento || !sexo || !color || !peso_kg) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos'
      });
    }
    
    // Verificar que el cliente exista
    const clienteExiste = await prisma.cliente.findUnique({
      where: { id: parseInt(id_cliente) }
    });
    
    if (!clienteExiste) {
      return res.status(404).json({
        success: false,
        message: 'El cliente especificado no existe'
      });
    }
    
    const nuevaMascota = await prisma.mascota.create({
      data: {
        id_cliente: parseInt(id_cliente),
        nombre,
        especie,
        raza,
        fecha_nacimiento: new Date(fecha_nacimiento),
        sexo,
        color,
        peso_kg: parseFloat(peso_kg),
        microchip,
        foto_url,
        observaciones
      },
      include: {
        cliente: {
          select: {
            nombre: true,
            apellido: true
          }
        }
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Mascota creada exitosamente',
      data: nuevaMascota
    });
  } catch (error) {
    console.error('Error al crear mascota:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear mascota',
      error: error.message
    });
  }
};

// Actualizar una mascota
const actualizarMascota = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      especie,
      raza,
      fecha_nacimiento,
      sexo,
      color,
      peso_kg,
      microchip,
      foto_url,
      observaciones,
      activo
    } = req.body;
    
    // Verificar si la mascota existe
    const mascotaExiste = await prisma.mascota.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!mascotaExiste) {
      return res.status(404).json({
        success: false,
        message: 'Mascota no encontrada'
      });
    }
    
    const mascotaActualizada = await prisma.mascota.update({
      where: { id: parseInt(id) },
      data: {
        nombre: nombre || mascotaExiste.nombre,
        especie: especie || mascotaExiste.especie,
        raza: raza || mascotaExiste.raza,
        fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : mascotaExiste.fecha_nacimiento,
        sexo: sexo || mascotaExiste.sexo,
        color: color || mascotaExiste.color,
        peso_kg: peso_kg ? parseFloat(peso_kg) : mascotaExiste.peso_kg,
        microchip: microchip !== undefined ? microchip : mascotaExiste.microchip,
        foto_url: foto_url !== undefined ? foto_url : mascotaExiste.foto_url,
        observaciones: observaciones !== undefined ? observaciones : mascotaExiste.observaciones,
        activo: activo !== undefined ? activo : mascotaExiste.activo
      },
      include: {
        cliente: {
          select: {
            nombre: true,
            apellido: true
          }
        }
      }
    });
    
    res.json({
      success: true,
      message: 'Mascota actualizada exitosamente',
      data: mascotaActualizada
    });
  } catch (error) {
    console.error('Error al actualizar mascota:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar mascota',
      error: error.message
    });
  }
};

// Eliminar una mascota (soft delete)
const eliminarMascota = async (req, res) => {
  try {
    const { id } = req.params;
    
    const mascotaExiste = await prisma.mascota.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!mascotaExiste) {
      return res.status(404).json({
        success: false,
        message: 'Mascota no encontrada'
      });
    }
    
    await prisma.mascota.update({
      where: { id: parseInt(id) },
      data: { activo: false }
    });
    
    res.json({
      success: true,
      message: 'Mascota eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar mascota:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar mascota',
      error: error.message
    });
  }
};

// Buscar mascotas
const buscarMascotas = async (req, res) => {
  try {
    const { termino } = req.query;
    
    if (!termino) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar un término de búsqueda'
      });
    }
    
    const mascotas = await prisma.mascota.findMany({
      where: {
        AND: [
          { activo: true },
          {
            OR: [
              { nombre: { contains: termino, mode: 'insensitive' } },
              { especie: { contains: termino, mode: 'insensitive' } },
              { raza: { contains: termino, mode: 'insensitive' } },
              { microchip: { contains: termino, mode: 'insensitive' } }
            ]
          }
        ]
      },
      include: {
        cliente: {
          select: {
            nombre: true,
            apellido: true,
            telefono: true
          }
        }
      }
    });
    
    res.json({
      success: true,
      data: mascotas,
      total: mascotas.length
    });
  } catch (error) {
    console.error('Error al buscar mascotas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar mascotas',
      error: error.message
    });
  }
};

module.exports = {
  obtenerMascotas,
  obtenerMascotaPorId,
  obtenerMascotasPorCliente,
  crearMascota,
  actualizarMascota,
  eliminarMascota,
  buscarMascotas
};