// server/controllers/historialMedicoController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/historiales - Obtener todos los historiales
const obtenerHistoriales = async (req, res) => {
  try {
    const historiales = await prisma.historialMedico.findMany({
      include: {
        mascota: {
          include: {
            cliente: {
              select: { nombre: true, apellido: true }
            }
          }
        },
        veterinario: {
          select: { nombre: true, apellido: true }
        },
        cita: {
          select: { fecha_cita: true, hora_cita: true }
        }
      },
      orderBy: { fecha_atencion: 'desc' }
    });

    res.json({ success: true, data: historiales });
  } catch (error) {
    console.error('Error al obtener historiales:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/historiales/:id - Obtener un historial específico
const obtenerHistorialPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const historial = await prisma.historialMedico.findUnique({
      where: { id: parseInt(id) },
      include: {
        mascota: {
          include: {
            cliente: {
              select: { nombre: true, apellido: true, email: true, telefono: true }
            }
          }
        },
        veterinario: {
          select: { nombre: true, apellido: true, email: true }
        },
        cita: true
      }
    });

    if (!historial) {
      return res.status(404).json({ success: false, message: 'Historial no encontrado' });
    }

    res.json({ success: true, data: historial });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/historiales/mascota/:mascotaId - Historiales de una mascota
const obtenerHistorialesPorMascota = async (req, res) => {
  try {
    const { mascotaId } = req.params;

    const historiales = await prisma.historialMedico.findMany({
      where: { id_mascota: parseInt(mascotaId) },
      include: {
        veterinario: {
          select: { nombre: true, apellido: true }
        },
        cita: {
          select: { fecha_cita: true, hora_cita: true, motivo_consulta: true }
        }
      },
      orderBy: { fecha_atencion: 'desc' }
    });

    res.json({ success: true, data: historiales });
  } catch (error) {
    console.error('Error al obtener historiales de mascota:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/historiales - Crear historial médico
const crearHistorial = async (req, res) => {
  try {
    const {
      id_mascota,
      id_cita,
      id_veterinario,
      sintomas,
      diagnostico,
      tratamiento,
      medicamentos,
      peso_actual,
      temperatura,
      observaciones,
      recomendaciones,
      proxima_cita
    } = req.body;

    // Validaciones
    if (!id_mascota || !id_cita || !id_veterinario || !sintomas || !diagnostico || !tratamiento) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios (mascota, cita, veterinario, síntomas, diagnóstico, tratamiento)'
      });
    }

    // Verificar que la cita existe
    const cita = await prisma.cita.findUnique({
      where: { id: parseInt(id_cita) }
    });

    if (!cita) {
      return res.status(404).json({ success: false, message: 'Cita no encontrada' });
    }

    // Crear historial médico
    const nuevoHistorial = await prisma.historialMedico.create({
      data: {
        id_mascota: parseInt(id_mascota),
        id_cita: parseInt(id_cita),
        id_veterinario: parseInt(id_veterinario),
        sintomas,
        diagnostico,
        tratamiento,
        medicamentos: medicamentos || null,
        peso_actual: peso_actual ? parseFloat(peso_actual) : null,
        temperatura: temperatura ? parseFloat(temperatura) : null,
        observaciones: observaciones || null,
        recomendaciones: recomendaciones || null,
        proxima_cita: proxima_cita ? new Date(proxima_cita) : null
      },
      include: {
        mascota: true,
        veterinario: {
          select: { nombre: true, apellido: true }
        }
      }
    });

    // Actualizar estado de la cita a "Completada"
    await prisma.cita.update({
      where: { id: parseInt(id_cita) },
      data: { estado: 'Completada' }
    });

    res.status(201).json({
      success: true,
      message: 'Historial médico creado exitosamente',
      data: nuevoHistorial
    });
  } catch (error) {
    console.error('Error al crear historial:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/historiales/:id - Actualizar historial médico
const actualizarHistorial = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      sintomas,
      diagnostico,
      tratamiento,
      medicamentos,
      peso_actual,
      temperatura,
      observaciones,
      recomendaciones,
      proxima_cita
    } = req.body;

    const historialActualizado = await prisma.historialMedico.update({
      where: { id: parseInt(id) },
      data: {
        sintomas,
        diagnostico,
        tratamiento,
        medicamentos,
        peso_actual: peso_actual ? parseFloat(peso_actual) : null,
        temperatura: temperatura ? parseFloat(temperatura) : null,
        observaciones,
        recomendaciones,
        proxima_cita: proxima_cita ? new Date(proxima_cita) : null
      },
      include: {
        mascota: true,
        veterinario: {
          select: { nombre: true, apellido: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Historial actualizado exitosamente',
      data: historialActualizado
    });
  } catch (error) {
    console.error('Error al actualizar historial:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  obtenerHistoriales,
  obtenerHistorialPorId,
  obtenerHistorialesPorMascota,
  crearHistorial,
  actualizarHistorial
};