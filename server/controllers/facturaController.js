const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/facturas - Obtener todas las facturas
const obtenerFacturas = async (req, res) => {
  try {
    const facturas = await prisma.factura.findMany({
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            rut: true,
            telefono: true
          }
        },
        detalles: {
          include: {
            producto: {
              select: {
                id: true,
                nombre: true,
                categoria: true
              }
            }
          }
        },
        pagos: true
      },
      orderBy: {
        fecha_emision: 'desc'
      }
    });

    res.json({
      success: true,
      data: facturas,
      total: facturas.length
    });
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener facturas',
      error: error.message
    });
  }
};

// GET /api/facturas/cliente/:clienteId - Obtener facturas de un cliente
const obtenerFacturasPorCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;

    // Validar que clienteId sea un número
    const id = parseInt(clienteId);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de cliente inválido'
      });
    }

    const facturas = await prisma.factura.findMany({
      where: {
        id_cliente: id
      },
      include: {
        detalles: true,  // ✅ SIMPLIFICADO: Solo traer detalles
        pagos: {
          orderBy: {
            fecha_pago: 'desc'
          }
        }
      },
      orderBy: {
        fecha_emision: 'desc'
      }
    });

    console.log(`Facturas encontradas para cliente ${id}:`, facturas.length); // Debug

    res.json({
      success: true,
      data: facturas,
      total: facturas.length
    });
  } catch (error) {
    console.error('Error al obtener facturas del cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener facturas del cliente',
      error: error.message
    });
  }
};

// GET /api/facturas/:id - Obtener una factura por ID
const obtenerFacturaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que id sea un número
    const facturaId = parseInt(id);
    if (isNaN(facturaId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de factura inválido'
      });
    }

    const factura = await prisma.factura.findUnique({
      where: {
        id: facturaId
      },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            rut: true,
            telefono: true,
            direccion: true
          }
        },
        detalles: {
          include: {
            producto: {
              select: {
                id: true,
                nombre: true,
                categoria: true,
                marca: true
              }
            }
          }
        },
        pagos: {
          orderBy: {
            fecha_pago: 'desc'
          }
        }
      }
    });

    if (!factura) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    res.json({
      success: true,
      data: factura
    });
  } catch (error) {
    console.error('Error al obtener factura:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener factura',
      error: error.message
    });
  }
};

// POST /api/facturas - Crear una nueva factura
const crearFactura = async (req, res) => {
  try {
    const {
      id_cliente,
      detalles, // Array de { id_producto?, id_servicio?, descripcion, cantidad, precio_unitario }
      descuento = 0,
      metodo_pago,
      observaciones
    } = req.body;

    // Validaciones básicas
    if (!id_cliente || !detalles || detalles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos obligatorios (id_cliente, detalles)'
      });
    }

    // Calcular totales
    const subtotal = detalles.reduce((sum, det) => {
      const cantidad = parseFloat(det.cantidad) || 1;
      const precio = parseFloat(det.precio_unitario) || 0;
      return sum + (cantidad * precio);
    }, 0);

    const descuentoValor = parseFloat(descuento) || 0;
    const subtotalConDescuento = subtotal - descuentoValor;
    const iva = subtotalConDescuento * 0.19; // IVA 19%
    const total = subtotalConDescuento + iva;

    // Generar número de factura único
    const ultimaFactura = await prisma.factura.findFirst({
      orderBy: { id: 'desc' },
      select: { numero_factura: true }
    });

    let numeroFactura;
    if (ultimaFactura && ultimaFactura.numero_factura) {
      const ultimoNumero = parseInt(ultimaFactura.numero_factura.split('-')[1]);
      numeroFactura = `FAC-${String(ultimoNumero + 1).padStart(6, '0')}`;
    } else {
      numeroFactura = 'FAC-000001';
    }

    // Crear factura con detalles en una transacción
    const factura = await prisma.$transaction(async (tx) => {
      // Crear factura
      const nuevaFactura = await tx.factura.create({
        data: {
          id_cliente,
          numero_factura: numeroFactura,
          subtotal,
          iva,
          impuestos: iva, // Por ahora, impuestos = iva
          descuento: descuentoValor,
          total,
          estado_pago: 'pendiente',
          metodo_pago: metodo_pago || 'efectivo',
          observaciones
        }
      });

      // Crear detalles de factura
      const detallesCreados = await Promise.all(
        detalles.map(detalle => {
          const cantidad = parseFloat(detalle.cantidad) || 1;
          const precioUnitario = parseFloat(detalle.precio_unitario) || 0;
          const subtotalDetalle = cantidad * precioUnitario;

          return tx.detalleFactura.create({
            data: {
              id_factura: nuevaFactura.id,
              id_producto: detalle.id_producto || null,
              id_servicio: detalle.id_servicio || null,
              descripcion: detalle.descripcion,
              cantidad,
              precio_unitario: precioUnitario,
              subtotal: subtotalDetalle
            }
          });
        })
      );

      // Retornar factura con detalles
      return {
        ...nuevaFactura,
        detalles: detallesCreados
      };
    });

    res.status(201).json({
      success: true,
      message: 'Factura creada exitosamente',
      data: factura
    });
  } catch (error) {
    console.error('Error al crear factura:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear factura',
      error: error.message
    });
  }
};

// PATCH /api/facturas/:id/estado - Actualizar estado de pago
const actualizarEstadoPago = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado_pago, metodo_pago } = req.body;

    // Validar que id sea un número
    const facturaId = parseInt(id);
    if (isNaN(facturaId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de factura inválido'
      });
    }

    // Validar estado de pago
    const estadosValidos = ['pendiente', 'pagado', 'vencido', 'cancelado'];
    if (estado_pago && !estadosValidos.includes(estado_pago)) {
      return res.status(400).json({
        success: false,
        message: 'Estado de pago inválido'
      });
    }

    // Verificar que la factura existe
    const facturaExistente = await prisma.factura.findUnique({
      where: { id: facturaId }
    });

    if (!facturaExistente) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    // Actualizar factura
    const facturaActualizada = await prisma.factura.update({
      where: { id: facturaId },
      data: {
        estado_pago,
        metodo_pago: metodo_pago || facturaExistente.metodo_pago
      },
      include: {
        cliente: {
          select: {
            nombre: true,
            apellido: true,
            email: true
          }
        },
        detalles: true
      }
    });

    res.json({
      success: true,
      message: 'Estado de factura actualizado',
      data: facturaActualizada
    });
  } catch (error) {
    console.error('Error al actualizar estado de factura:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado de factura',
      error: error.message
    });
  }
};

module.exports = {
  obtenerFacturas,
  obtenerFacturaPorId,
  obtenerFacturasPorCliente,
  crearFactura,
  actualizarEstadoPago
};