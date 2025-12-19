// server/controllers/pagoController.js
const prisma = require('../prisma/client');
const { crearSesionPagoCita, verificarSesionPago } = require('../services/stripeService');
const { enviarConfirmacionPago } = require('../services/emailService');

const crearSesionPago = async (req, res) => {
  try {
    const { cita_id } = req.body;
    if (!cita_id) return res.status(400).json({ success: false, message: 'ID de cita requerido' });

    const cita = await prisma.cita.findUnique({
      where: { id: parseInt(cita_id) },
      include: { cliente: true, mascota: true, servicio: true, veterinario: true }
    });

    if (!cita) return res.status(404).json({ success: false, message: 'Cita no encontrada' });
    if (cita.estado_pago === 'pagado') return res.status(400).json({ success: false, message: 'Cita ya pagada' });

    const resultado = await crearSesionPagoCita(cita);
    if (!resultado.success) return res.status(500).json({ success: false, message: 'Error al crear sesión', error: resultado.error });

    res.json({ success: true, sessionId: resultado.sessionId, url: resultado.url });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error al procesar', error: error.message });
  }
};

const confirmarPago = async (req, res) => {
  try {
    const { session_id, cita_id } = req.body;
    if (!session_id || !cita_id) return res.status(400).json({ success: false, message: 'Datos incompletos' });

    const sesion = await verificarSesionPago(session_id);
    if (!sesion.success || sesion.payment_status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Pago no completado' });
    }

    const cita = await prisma.cita.findUnique({
      where: { id: parseInt(cita_id) },
      include: { cliente: true, mascota: true, servicio: true }
    });
    if (!cita) return res.status(404).json({ success: false, message: 'Cita no encontrada' });

    const citaActualizada = await prisma.cita.update({
      where: { id: parseInt(cita_id) },
      data: { estado_pago: 'pagado', estado: 'Confirmada' }
    });

    // ✅ CORREGIDO: Calcular montos correctamente
    const subtotal = parseFloat(cita.precio_servicio);
    const iva = Math.round(subtotal * 0.19); // Redondear IVA
    const total = subtotal + iva;
    
    const numeroFactura = `FACT-${Date.now()}`;
    
    console.log('💰 Creando factura:', {
      precio_servicio: cita.precio_servicio,
      subtotal,
      iva,
      total,
      numero_factura: numeroFactura
    });
    
    const factura = await prisma.factura.create({
      data: {
        id_cliente: cita.id_cliente,
        numero_factura: numeroFactura,
        subtotal: subtotal,
        iva: iva,
        impuestos: iva,
        descuento: 0, // ✅ Agregado explícitamente
        total: total,
        estado_pago: 'pagado',
        metodo_pago: 'Stripe'
      }
    });

    // ✅ CORREGIDO: Crear detalle con los montos correctos
    await prisma.detalleFactura.create({
      data: {
        id_factura: factura.id,
        id_producto: null,
        id_servicio: cita.id_servicio,
        descripcion: cita.servicio.nombre,
        cantidad: 1,
        precio_unitario: subtotal, // El precio sin IVA
        subtotal: subtotal // El subtotal sin IVA
      }
    });

    // ✅ CORREGIDO: El monto del pago debe ser el TOTAL (incluyendo IVA)
    const pago = await prisma.pago.create({
      data: {
        id_factura: factura.id,
        numero_transaccion: session_id,
        metodo_pago: 'Stripe',
        monto: total, // ✅ TOTAL, no subtotal
        estado: 'completado'
      }
    });

    // Enviar email de confirmación
    try {
      await enviarConfirmacionPago({
        emailCliente: cita.cliente.email,
        nombreCliente: `${cita.cliente.nombre} ${cita.cliente.apellido}`,
        numeroFactura,
        monto: total, // ✅ Enviar el total en el email
        metodoPago: 'Stripe'
      });
    } catch (e) { 
      console.error('Error al enviar email:', e); 
    }

    res.json({ 
      success: true, 
      message: 'Pago confirmado y factura generada', 
      cita: citaActualizada, 
      factura, 
      pago 
    });
  } catch (error) {
    console.error('Error al confirmar pago:', error);
    res.status(500).json({ success: false, message: 'Error al procesar pago', error: error.message });
  }
};

const obtenerPagos = async (req, res) => {
  try {
    const pagos = await prisma.pago.findMany({
      include: { 
        factura: { 
          include: { 
            cliente: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
                rut: true
              }
            }
          } 
        } 
      },
      orderBy: { fecha_pago: 'desc' }
    });
    res.json({ success: true, data: pagos });
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { crearSesionPago, confirmarPago, obtenerPagos };