// controllers/citaController.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import { 
  enviarConfirmacionCita,
  enviarRecordatorioCita,
  enviarConfirmacionPago
} from '../services/emailService.js';

// Obtener todas las citas con filtros
export const obtenerCitas = async (req, res) => {
  try {
    const { 
      estado, 
      fecha_inicio, 
      fecha_fin, 
      id_cliente, 
      id_veterinario,
      id_mascota 
    } = req.query;

    // Construir filtros dinámicamente
    const where = {};
    
    if (estado) where.estado = estado;
    if (id_cliente) where.id_cliente = parseInt(id_cliente);
    if (id_veterinario) where.id_veterinario = parseInt(id_veterinario);
    if (id_mascota) where.id_mascota = parseInt(id_mascota);
    
    // Filtro de rango de fechas
    if (fecha_inicio || fecha_fin) {
      where.fecha_cita = {};
      if (fecha_inicio) where.fecha_cita.gte = new Date(fecha_inicio);
      if (fecha_fin) {
        const fechaFinAjustada = new Date(fecha_fin);
        fechaFinAjustada.setHours(23, 59, 59, 999);
        where.fecha_cita.lte = fechaFinAjustada;
      }
    }

    const citas = await prisma.cita.findMany({
      where,
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            telefono: true,
            email: true
          }
        },
        mascota: {
          select: {
            id: true,
            nombre: true,
            especie: true,
            raza: true
          }
        },
        veterinario: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        },
        servicio: {
          select: {
            id: true,
            nombre: true,
            precio_base: true,
            duracion_minutos: true,
            categoria: true
          }
        }
      },
      orderBy: [
        { fecha_cita: 'desc' },
        { hora_cita: 'desc' }
      ]
    });
    
    // Formatear fechas y horas para mejor legibilidad
    const citasFormateadas = citas.map(cita => ({
      ...cita,
      fecha_formateada: new Date(cita.fecha_cita).toLocaleDateString('es-CL'),
      hora_formateada: new Date(cita.hora_cita).toLocaleTimeString('es-CL', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }));
    
    res.json({
      success: true,
      data: citasFormateadas,
      total: citasFormateadas.length
    });
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener citas',
      error: error.message
    });
  }
};

// Obtener una cita por ID
export const obtenerCitaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cita = await prisma.cita.findUnique({
      where: { id: parseInt(id) },
      include: {
        cliente: true,
        mascota: {
          include: {
            cliente: {
              select: {
                nombre: true,
                apellido: true
              }
            }
          }
        },
        veterinario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            telefono: true
          }
        },
        servicio: true,
        historiales: {
          include: {
            veterinario: {
              select: {
                nombre: true,
                apellido: true
              }
            }
          }
        }
      }
    });
    
    if (!cita) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: cita
    });
  } catch (error) {
    console.error('Error al obtener cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cita',
      error: error.message
    });
  }
};

// Obtener citas por fecha específica
export const obtenerCitasPorFecha = async (req, res) => {
  try {
    const { fecha } = req.params;
    
    const fechaInicio = new Date(fecha);
    fechaInicio.setHours(0, 0, 0, 0);
    
    const fechaFin = new Date(fecha);
    fechaFin.setHours(23, 59, 59, 999);
    
    const citas = await prisma.cita.findMany({
      where: {
        fecha_cita: {
          gte: fechaInicio,
          lte: fechaFin
        },
        estado: { not: 'Cancelada' }
      },
      include: {
        cliente: {
          select: {
            nombre: true,
            apellido: true,
            telefono: true
          }
        },
        mascota: {
          select: {
            nombre: true,
            especie: true
          }
        },
        veterinario: {
          select: {
            nombre: true,
            apellido: true
          }
        },
        servicio: {
          select: {
            nombre: true,
            duracion_minutos: true
          }
        }
      },
      orderBy: {
        hora_cita: 'asc'
      }
    });
    
    res.json({
      success: true,
      fecha: fechaInicio.toLocaleDateString('es-CL'),
      data: citas,
      total: citas.length
    });
  } catch (error) {
    console.error('Error al obtener citas por fecha:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener citas',
      error: error.message
    });
  }
};

// Obtener citas por cliente
export const obtenerCitasPorCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;
    const { estado, limite } = req.query;
    
    const where = { id_cliente: parseInt(clienteId) };
    if (estado) where.estado = estado;
    
    const citas = await prisma.cita.findMany({
      where,
      include: {
        mascota: {
          select: {
            id: true,
            nombre: true,
            especie: true
          }
        },
        veterinario: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        },
        servicio: {
          select: {
            nombre: true,
            precio_base: true
          }
        }
      },
      orderBy: {
        fecha_cita: 'desc'
      },
      take: limite ? parseInt(limite) : undefined
    });
    
    res.json({
      success: true,
      data: citas,
      total: citas.length
    });
  } catch (error) {
    console.error('Error al obtener citas por cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener citas',
      error: error.message
    });
  }
};

// 🆕 Crear una nueva cita CON NOTIFICACIONES
export const crearCita = async (req, res) => {
  try {
    const {
      id_cliente,
      id_mascota,
      id_veterinario,
      fecha_cita,
      hora_cita,
      id_servicio,
      estado,
      motivo_consulta,
      precio_servicio,
      observaciones
    } = req.body;
    
    // Validar campos requeridos
    if (!id_cliente || !id_mascota || !fecha_cita || !hora_cita || !id_servicio) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: id_cliente, id_mascota, fecha_cita, hora_cita, id_servicio'
      });
    }
    
    // Verificar que la mascota pertenezca al cliente
    const mascota = await prisma.mascota.findFirst({
      where: {
        id: parseInt(id_mascota),
        id_cliente: parseInt(id_cliente)
      }
    });
    
    if (!mascota) {
      return res.status(404).json({
        success: false,
        message: 'La mascota no existe o no pertenece al cliente'
      });
    }
    
    // Obtener información del servicio
    const servicio = await prisma.servicio.findUnique({
      where: { id: parseInt(id_servicio) }
    });
    
    if (!servicio) {
      return res.status(404).json({
        success: false,
        message: 'El servicio especificado no existe'
      });
    }
    
    // Verificar disponibilidad del horario
    const citaExistente = await prisma.cita.findFirst({
      where: {
        fecha_cita: new Date(fecha_cita),
        hora_cita: new Date(`2000-01-01T${hora_cita}`),
        id_veterinario: id_veterinario ? parseInt(id_veterinario) : null,
        estado: { not: 'Cancelada' }
      }
    });
    
    if (citaExistente) {
      return res.status(400).json({
        success: false,
        message: 'El horario seleccionado no está disponible'
      });
    }
    
    // 🆕 Crear la cita con estado de pago pendiente
    const nuevaCita = await prisma.cita.create({
      data: {
        id_cliente: parseInt(id_cliente),
        id_mascota: parseInt(id_mascota),
        id_veterinario: id_veterinario ? parseInt(id_veterinario) : null,
        id_servicio: parseInt(id_servicio),
        fecha_cita: new Date(fecha_cita),
        hora_cita: new Date(`2000-01-01T${hora_cita}`),
        estado: estado || 'Pendiente',
        estado_pago: 'pendiente', // 👈 NUEVO CAMPO
        motivo_consulta: motivo_consulta || '',
        precio_servicio: precio_servicio || servicio.precio_base,
        observaciones: observaciones || ''
      },
      include: {
        cliente: true,
        mascota: true,
        veterinario: true,
        servicio: true
      }
    });

    // 📧 Enviar email de confirmación (sin bloquear la respuesta)
    if (process.env.RESEND_API_KEY) {  // 👈 Cambiar de EMAIL_USER a RESEND_API_KEY
      try {
        const datosEmail = {
          emailCliente: nuevaCita.cliente.email,
          nombreCliente: `${nuevaCita.cliente.nombre} ${nuevaCita.cliente.apellido}`,
          nombreMascota: nuevaCita.mascota.nombre,
          fechaCita: nuevaCita.fecha_cita,
          horaCita: hora_cita,
          nombreServicio: nuevaCita.servicio.nombre,
          veterinario: nuevaCita.veterinario 
            ? `${nuevaCita.veterinario.nombre} ${nuevaCita.veterinario.apellido}` 
            : 'Por asignar'
        };

        await enviarConfirmacionCita(datosEmail);
        console.log('✅ Email de confirmación enviado');
      } catch (emailError) {
        console.error('⚠️ Error enviando email (cita creada correctamente):', emailError);
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Cita creada exitosamente. Se ha enviado un email de confirmación.',
      data: nuevaCita
    });
  } catch (error) {
    console.error('Error al crear cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear cita',
      error: error.message
    });
  }
};

// Actualizar una cita CON NOTIFICACIONES
export const actualizarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizar = req.body;
    
    // Verificar si la cita existe
    const citaActual = await prisma.cita.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!citaActual) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }
    
    // Preparar datos para actualizar
    const dataToUpdate = {};
    const cambiosImportantes = [];
    
    // Detectar cambios importantes para notificación
    if (datosActualizar.fecha_cita && 
        new Date(datosActualizar.fecha_cita).getTime() !== citaActual.fecha_cita.getTime()) {
      dataToUpdate.fecha_cita = new Date(datosActualizar.fecha_cita);
      cambiosImportantes.push('Fecha modificada');
    }
    
    if (datosActualizar.hora_cita) {
      const nuevaHora = new Date(`2000-01-01T${datosActualizar.hora_cita}`);
      if (nuevaHora.getTime() !== citaActual.hora_cita.getTime()) {
        dataToUpdate.hora_cita = nuevaHora;
        cambiosImportantes.push('Hora modificada');
      }
    }
    
    if (datosActualizar.id_veterinario !== undefined && 
        datosActualizar.id_veterinario !== citaActual.id_veterinario) {
      dataToUpdate.id_veterinario = datosActualizar.id_veterinario ? 
        parseInt(datosActualizar.id_veterinario) : null;
      cambiosImportantes.push('Veterinario cambiado');
    }
    
    // Actualizar otros campos
    if (datosActualizar.estado !== undefined) dataToUpdate.estado = datosActualizar.estado;
    if (datosActualizar.estado_pago !== undefined) dataToUpdate.estado_pago = datosActualizar.estado_pago;
    if (datosActualizar.motivo_consulta !== undefined) dataToUpdate.motivo_consulta = datosActualizar.motivo_consulta;
    if (datosActualizar.precio_servicio !== undefined) dataToUpdate.precio_servicio = parseFloat(datosActualizar.precio_servicio);
    if (datosActualizar.observaciones !== undefined) dataToUpdate.observaciones = datosActualizar.observaciones;
    
    if (datosActualizar.id_servicio !== undefined) {
      dataToUpdate.id_servicio = parseInt(datosActualizar.id_servicio);
      cambiosImportantes.push('Servicio modificado');
    }
    
    // Actualizar fecha de modificación
    dataToUpdate.fecha_modificacion = new Date();
    
    const citaActualizada = await prisma.cita.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
      include: {
        cliente: true,
        mascota: true,
        veterinario: true,
        servicio: true
      }
    });
    
    res.json({
      success: true,
      message: cambiosImportantes.length > 0 
        ? 'Cita actualizada. Se ha enviado un email de notificación.' 
        : 'Cita actualizada exitosamente.',
      data: citaActualizada
    });
  } catch (error) {
    console.error('Error al actualizar cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cita',
      error: error.message
    });
  }
};

// Cancelar una cita CON NOTIFICACIÓN
export const cancelarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    
    const citaExiste = await prisma.cita.findUnique({
      where: { id: parseInt(id) },
      include: {
        cliente: true,
        mascota: true,
        servicio: true
      }
    });
    
    if (!citaExiste) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }
    
    if (citaExiste.estado === 'Cancelada') {
      return res.status(400).json({
        success: false,
        message: 'La cita ya está cancelada'
      });
    }
    
    const citaCancelada = await prisma.cita.update({
      where: { id: parseInt(id) },
      data: { 
        estado: 'Cancelada',
        observaciones: motivo ? 
          `${citaExiste.observaciones}\nMotivo cancelación: ${motivo}` : 
          citaExiste.observaciones,
        fecha_modificacion: new Date()
      }
    });
    
    res.json({
      success: true,
      message: 'Cita cancelada exitosamente. Se ha enviado una notificación al cliente.',
      data: citaCancelada
    });
  } catch (error) {
    console.error('Error al cancelar cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar cita',
      error: error.message
    });
  }
};

// Confirmar cita (después del pago)
export const confirmarCita = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cita = await prisma.cita.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!cita) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }
    
    if (cita.estado === 'Confirmada') {
      return res.status(400).json({
        success: false,
        message: 'La cita ya está confirmada'
      });
    }
    
    const citaConfirmada = await prisma.cita.update({
      where: { id: parseInt(id) },
      data: {
        estado: 'Confirmada',
        estado_pago: 'pagado',
        fecha_modificacion: new Date()
      },
      include: {
        cliente: true,
        mascota: true,
        servicio: true,
        veterinario: true
      }
    });
    
    res.json({
      success: true,
      message: 'Cita confirmada exitosamente',
      data: citaConfirmada
    });
  } catch (error) {
    console.error('Error confirmando cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error al confirmar la cita',
      error: error.message
    });
  }
};

// Obtener horarios disponibles
export const obtenerHorariosDisponibles = async (req, res) => {
  try {
    const { fecha, id_veterinario, id_servicio } = req.query;
    
    if (!fecha || !id_servicio) {
      return res.status(400).json({
        success: false,
        message: 'Fecha y servicio son requeridos'
      });
    }
    
    // Obtener duración del servicio
    const servicio = await prisma.servicio.findUnique({
      where: { id: parseInt(id_servicio) }
    });
    
    if (!servicio) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }
    
    // Obtener citas existentes para esa fecha
    const citasExistentes = await prisma.cita.findMany({
      where: {
        fecha_cita: new Date(fecha),
        estado: { not: 'Cancelada' },
        ...(id_veterinario && { id_veterinario: parseInt(id_veterinario) })
      },
      select: {
        hora_cita: true,
        servicio: {
          select: {
            duracion_minutos: true
          }
        }
      }
    });
    
    // Generar horarios disponibles (9:00 a 18:00, cada 30 minutos)
    const horariosDisponibles = [];
    const horaInicio = 9;
    const horaFin = 18;
    const intervalo = 30;
    
    for (let hora = horaInicio; hora < horaFin; hora++) {
      for (let minuto = 0; minuto < 60; minuto += intervalo) {
        const horarioStr = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
        
        // Verificar si el horario está ocupado
        const estaOcupado = citasExistentes.some(cita => {
          const horaCita = new Date(cita.hora_cita).toTimeString().slice(0, 5);
          return horaCita === horarioStr;
        });
        
        if (!estaOcupado) {
          horariosDisponibles.push(horarioStr);
        }
      }
    }
    
    res.json({
      success: true,
      fecha: new Date(fecha).toLocaleDateString('es-CL'),
      servicio: servicio.nombre,
      duracion_minutos: servicio.duracion_minutos,
      horarios_disponibles: horariosDisponibles
    });
  } catch (error) {
    console.error('Error obteniendo horarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener horarios disponibles',
      error: error.message
    });
  }
};

// Obtener citas del día (dashboard)
export const obtenerCitasDelDia = async (req, res) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    
    const citas = await prisma.cita.findMany({
      where: {
        fecha_cita: {
          gte: hoy,
          lt: manana
        },
        estado: { not: 'Cancelada' }
      },
      include: {
        cliente: true,
        mascota: true,
        servicio: true,
        veterinario: true
      },
      orderBy: {
        hora_cita: 'asc'
      }
    });
    
    // Estadísticas del día
    const estadisticas = {
      total: citas.length,
      pendientes: citas.filter(c => c.estado === 'Pendiente').length,
      confirmadas: citas.filter(c => c.estado === 'Confirmada').length,
      completadas: citas.filter(c => c.estado === 'Completada').length
    };
    
    res.json({
      success: true,
      fecha: hoy.toLocaleDateString('es-CL'),
      estadisticas,
      data: citas
    });
  } catch (error) {
    console.error('Error obteniendo citas del día:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las citas del día',
      error: error.message
    });
  }
};

export default {
  obtenerCitas,
  obtenerCitaPorId,
  obtenerCitasPorFecha,
  obtenerCitasPorCliente,
  crearCita,
  actualizarCita,
  cancelarCita,
  confirmarCita,
  obtenerHorariosDisponibles,
  obtenerCitasDelDia
};