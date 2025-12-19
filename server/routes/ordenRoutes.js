const express = require('express');
const router = express.Router();
const stripeService = require('../services/stripeService');
const { prisma } = require('../prisma/client');

// Crear orden
router.post('/', async (req, res) => {
  try {
    const { cliente, items, total } = req.body;

    // Validar datos
    if (!cliente || !items || !total) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    // Crear o encontrar cliente
    let clienteData = await prisma.cliente.findUnique({
      where: { email: cliente.email },
    });

    if (!clienteData) {
      clienteData = await prisma.cliente.create({
        data: {
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          email: cliente.email,
          telefono: cliente.telefono,
          direccion: cliente.direccion,
          rut: cliente.email.split('@')[0], // Placeholder
          activo: true,
        },
      });
    }

    // Crear orden/factura
    const factura = await prisma.factura.create({
      data: {
        id_cliente: clienteData.id,
        total: total,
        fecha_emision: new Date(),
        estado: 'pendiente',
        observaciones: `Dirección: ${cliente.direccion}, ${cliente.ciudad} ${cliente.codigoPostal}`,
      },
    });

    // Crear sesión de Stripe
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'clp',
        product_data: {
          name: item.nombre || `Producto ${item.productId}`,
        },
        unit_amount: Math.round(item.precio * 100),
      },
      quantity: item.cantidad,
    }));

    const session = await stripeService.createCheckoutSession({
      lineItems,
      metadata: {
        facturaId: factura.id,
        clienteId: clienteData.id,
      },
    });

    res.json({ sessionUrl: session.url });
  } catch (error) {
    console.error('Error al crear orden:', error);
    res.status(500).json({ error: 'Error al crear la orden' });
  }
});

// Obtener órdenes del cliente
router.get('/cliente/:clienteId', async (req, res) => {
  try {
    const facturas = await prisma.factura.findMany({
      where: { id_cliente: parseInt(req.params.clienteId) },
      orderBy: { fecha_emision: 'desc' },
    });

    res.json(facturas);
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
});

// Obtener orden por ID
router.get('/:id', async (req, res) => {
  try {
    const factura = await prisma.factura.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { cliente: true },
    });

    if (!factura) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    res.json(factura);
  } catch (error) {
    console.error('Error al obtener orden:', error);
    res.status(500).json({ error: 'Error al obtener orden' });
  }
});

module.exports = router;
