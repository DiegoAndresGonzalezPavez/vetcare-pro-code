// server/services/emailService.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Email del remitente (debe estar verificado en Resend)
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

// 📧 EMAIL: Confirmación de Cita Agendada
export const enviarConfirmacionCita = async (datosEmail) => {
  const { 
    emailCliente, 
    nombreCliente, 
    nombreMascota, 
    fechaCita, 
    horaCita, 
    nombreServicio, 
    veterinario 
  } = datosEmail;

  try {
    const { data, error } = await resend.emails.send({
      from: `VetCare Pro <${FROM_EMAIL}>`,
      to: emailCliente,
      subject: '✅ Confirmación de Cita - VetCare Pro',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            
            <!-- Header -->
            <div style="background-color: #16a34a; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🐾 VetCare Pro</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #16a34a; margin-top: 0;">¡Cita Agendada Exitosamente! ✅</h2>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Hola <strong>${nombreCliente}</strong>,
              </p>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Tu cita para <strong>${nombreMascota}</strong> ha sido agendada correctamente. 
                Te esperamos en nuestra clínica.
              </p>
              
              <!-- Detalles Card -->
              <div style="background-color: #f9fafb; border-left: 4px solid #16a34a; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h3 style="color: #16a34a; margin-top: 0; margin-bottom: 15px;">📋 Detalles de la Cita</h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">🐕 Mascota:</td>
                    <td style="padding: 8px 0; color: #111827;">${nombreMascota}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">🩺 Servicio:</td>
                    <td style="padding: 8px 0; color: #111827;">${nombreServicio}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">📅 Fecha:</td>
                    <td style="padding: 8px 0; color: #111827;">${new Date(fechaCita).toLocaleDateString('es-CL', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">⏰ Hora:</td>
                    <td style="padding: 8px 0; color: #111827;">${horaCita}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">👨‍⚕️ Veterinario:</td>
                    <td style="padding: 8px 0; color: #111827;">${veterinario}</td>
                  </tr>
                </table>
              </div>
              
              <!-- Importante -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>⚠️ Importante:</strong> Por favor llega 10 minutos antes de tu cita.
                </p>
              </div>
              
              <!-- Estado Pago -->
              <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #991b1b; font-size: 14px;">
                  <strong>💳 Estado de pago:</strong> Pendiente
                </p>
                <p style="margin: 10px 0 0 0; color: #991b1b; font-size: 14px;">
                  Puedes pagar en la clínica o a través del portal de clientes.
                </p>
              </div>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 30px;">
                ¡Gracias por confiar en nosotros! 🐾
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                VetCare Pro - Sistema de Gestión Veterinaria<br>
                Si no agendaste esta cita, por favor contacta a nuestra clínica.
              </p>
            </div>
            
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('❌ Error de Resend:', error);
      return { success: false, message: 'Error al enviar email', error };
    }

    console.log('✅ Email enviado exitosamente a:', emailCliente);
    console.log('📧 ID de email:', data.id);
    return { success: true, message: 'Email enviado correctamente', data };

  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    return { success: false, message: 'Error al enviar email', error };
  }
};

// 📧 EMAIL: Recordatorio de Cita
export const enviarRecordatorioCita = async (datosEmail) => {
  const { emailCliente, nombreCliente, nombreMascota, fechaCita, horaCita } = datosEmail;

  try {
    const { data, error } = await resend.emails.send({
      from: `VetCare Pro <${FROM_EMAIL}>`,
      to: emailCliente,
      subject: '⏰ Recordatorio de Cita - Mañana - VetCare Pro',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <div style="background-color: #f59e0b; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0;">⏰ Recordatorio</h1>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #f59e0b;">¡Tu cita es mañana!</h2>
              <p>Hola <strong>${nombreCliente}</strong>,</p>
              <p>Tu cita para <strong>${nombreMascota}</strong> es mañana.</p>
              <div style="background-color: #fef3c7; padding: 20px; margin: 20px 0;">
                <p><strong>📅 Fecha:</strong> ${new Date(fechaCita).toLocaleDateString('es-CL')}</p>
                <p><strong>⏰ Hora:</strong> ${horaCita}</p>
              </div>
              <p>¡Te esperamos! 🐾</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('❌ Error:', error);
      return { success: false, error };
    }

    console.log('✅ Recordatorio enviado');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error };
  }
};

// 📧 EMAIL: Confirmación de Pago
export const enviarConfirmacionPago = async (datosEmail) => {
  const { emailCliente, nombreCliente, numeroFactura, monto, metodoPago } = datosEmail;

  try {
    const { data, error } = await resend.emails.send({
      from: `VetCare Pro <${FROM_EMAIL}>`,
      to: emailCliente,
      subject: '💳 Confirmación de Pago - VetCare Pro',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto;">
            <div style="background-color: #16a34a; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff;">✅ Pago Recibido</h1>
            </div>
            <div style="padding: 40px 30px;">
              <p>Hola <strong>${nombreCliente}</strong>,</p>
              <p>Hemos recibido tu pago correctamente.</p>
              <div style="background-color: #dcfce7; padding: 20px; margin: 20px 0;">
                <p><strong>Factura N°:</strong> ${numeroFactura}</p>
                <p><strong>Monto:</strong> $${monto.toLocaleString('es-CL')}</p>
                <p><strong>Método:</strong> ${metodoPago}</p>
              </div>
              <p>¡Gracias! 🐾</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) return { success: false, error };
    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
};

// 📧 EMAIL: Bienvenida
export const enviarEmailBienvenida = async (datosEmail) => {
  const { emailCliente, nombreCliente, password } = datosEmail;

  try {
    const { data, error } = await resend.emails.send({
      from: `VetCare Pro <${FROM_EMAIL}>`,
      to: emailCliente,
      subject: '🎉 ¡Bienvenido a VetCare Pro!',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto;">
            <div style="background-color: #16a34a; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff;">🎉 ¡Bienvenido!</h1>
            </div>
            <div style="padding: 40px 30px;">
              <p>Hola <strong>${nombreCliente}</strong>,</p>
              <p>Tu cuenta ha sido creada exitosamente.</p>
              <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0;">
                <p><strong>Email:</strong> ${emailCliente}</p>
                <p><strong>Contraseña:</strong> ${password}</p>
              </div>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/portal-clientes/login" 
                 style="display: inline-block; background-color: #16a34a; color: white; 
                        padding: 12px 30px; text-decoration: none; border-radius: 6px;">
                Acceder al Portal
              </a>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) return { success: false, error };
    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
};

export default {
  enviarConfirmacionCita,
  enviarRecordatorioCita,
  enviarConfirmacionPago,
  enviarEmailBienvenida
};