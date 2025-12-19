// server/services/stripeService.js
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Crear sesión de pago para una cita
const crearSesionPagoCita = async (cita) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'clp', // Peso chileno
            product_data: {
              name: `Cita Veterinaria - ${cita.servicio.nombre}`,
              description: `Cita para ${cita.mascota.nombre} el ${new Date(cita.fecha_cita).toLocaleDateString('es-CL')}`,
              images: ['https://via.placeholder.com/300x200?text=VetCare+Pro'],
            },
            unit_amount: Math.round(parseFloat(cita.precio_servicio)), 
          },
          quantity: 1,
        },
      ],
      metadata: {
        cita_id: cita.id.toString(),
        cliente_id: cita.id_cliente.toString(),
        mascota_id: cita.id_mascota.toString(),
        tipo: 'cita_veterinaria'
      },
      success_url: `${process.env.FRONTEND_URL}/portal-cliente/pago-exitoso?session_id={CHECKOUT_SESSION_ID}&cita_id=${cita.id}`,
      cancel_url: `${process.env.FRONTEND_URL}/portal-cliente/mis-citas?pago=cancelado`,
      customer_email: cita.cliente.email,
    });

    return {
      success: true,
      sessionId: session.id,
      url: session.url
    };
  } catch (error) {
    console.error('Error al crear sesión de pago:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Verificar estado de una sesión de pago
const verificarSesionPago = async (sessionId) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    return {
      success: true,
      payment_status: session.payment_status,
      metadata: session.metadata,
      customer_email: session.customer_email,
      amount_total: session.amount_total 
    };
  } catch (error) {
    console.error('Error al verificar sesión:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Crear reembolso
const crearReembolso = async (paymentIntentId, amount) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount) : undefined, // 👈 Sin multiplicar por 100
    });

    return {
      success: true,
      refund
    };
  } catch (error) {
    console.error('Error al crear reembolso:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Crear sesión de checkout para tienda e-commerce
const createCheckoutSession = async ({ lineItems, metadata = {} }) => {
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/tienda/pago-exitoso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/tienda/carrito`,
      billing_address_collection: 'required',
      metadata,
    });

    return session;
  } catch (error) {
    console.error('Error al crear sesión de Stripe:', error);
    throw error;
  }
};

// Recuperar sesión de Stripe
const retrieveSession = async (sessionId) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error('Error al recuperar sesión:', error);
    throw error;
  }
};

module.exports = {
  crearSesionPagoCita,
  verificarSesionPago,
  crearReembolso,
  createCheckoutSession,
  retrieveSession
};