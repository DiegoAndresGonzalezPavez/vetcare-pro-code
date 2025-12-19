'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Footer from '../../components/Footer';

export default function MisFacturas() {
  const router = useRouter();
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('clientData'));
    const token = localStorage.getItem('clientToken');
    
    if (!data || !token) {
      router.push('/portal-cliente/login');
      return;
    }
    
    setClientData(data);
    
    fetch(`http://localhost:5000/api/facturas/cliente/${data.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setFacturas(data.data || []))
      .catch(() => setFacturas([]))
      .finally(() => setLoading(false));
  }, [router]);

  const descargarComprobante = (factura) => {
    const doc = new jsPDF();
    const blue = [37, 99, 235];
    const green = [34, 197, 94];
    
    // Header con logo
    doc.setFillColor(...blue);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('VetCare Pro', 105, 20, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Clínica Veterinaria', 105, 28, { align: 'center' });
    doc.text('Tel: +56 2 2345 6789 | www.vetcarepro.cl', 105, 35, { align: 'center' });
    
    // Título del comprobante
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('COMPROBANTE DE PAGO', 105, 60, { align: 'center' });
    
    // Número de factura y estado
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Factura N°: ${factura.numero_factura}`, 105, 70, { align: 'center' });
    
    // Estado PAGADO en verde
    if (factura.estado_pago === 'pagado') {
      doc.setFillColor(...green);
      doc.roundedRect(75, 75, 60, 10, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('✓ PAGADO', 105, 82, { align: 'center' });
    }
    
    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, 92, 190, 92);
    
    // Información del cliente
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL CLIENTE', 20, 102);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nombre: ${clientData?.nombre} ${clientData?.apellido}`, 20, 110);
    doc.text(`RUT: ${clientData?.rut}`, 20, 117);
    doc.text(`Email: ${clientData?.email}`, 20, 124);
    doc.text(`Teléfono: ${clientData?.telefono || 'N/A'}`, 20, 131);
    
    // Información de pago
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DE PAGO', 120, 102);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${new Date(factura.fecha_emision).toLocaleDateString('es-CL')}`, 120, 110);
    doc.text(`Método: ${factura.metodo_pago || 'Tarjeta'}`, 120, 117);

  // Tabla de servicios/productos
  autoTable(doc, {  // ✅ Agregada la coma
    startY: 145,
    head: [['Descripción', 'Cantidad', 'Precio Unit.', 'Subtotal']],
    body: factura.detalles?.map(d => [
      d.descripcion,
      d.cantidad || 1,
      `$${parseFloat(d.precio_unitario || 0).toLocaleString('es-CL')}`,
      `$${parseFloat(d.subtotal || 0).toLocaleString('es-CL')}`
    ]) || [],
    theme: 'grid',
    headStyles: {
      fillColor: blue,
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 85 },
      1: { halign: 'center', cellWidth: 25 },
      2: { halign: 'right', cellWidth: 40 },
      3: { halign: 'right', cellWidth: 40 }
    },
    margin: { left: 20, right: 20 }
  });

    // Totales
    const finalY = doc.lastAutoTable.finalY + 15;
    const rightX = 190;
    
    // Caja de totales
    doc.setFillColor(245, 245, 245);
    doc.rect(115, finalY - 5, 75, 35, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', 120, finalY + 2);
    doc.text(`$${parseFloat(factura.subtotal).toLocaleString('es-CL')}`, rightX, finalY + 2, { align: 'right' });
    
    doc.text('IVA (19%):', 120, finalY + 10);
    doc.text(`$${parseFloat(factura.iva).toLocaleString('es-CL')}`, rightX, finalY + 10, { align: 'right' });
    
    // Total destacado
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...blue);
    doc.text('TOTAL PAGADO:', 120, finalY + 22);
    doc.text(`$${parseFloat(factura.total).toLocaleString('es-CL')}`, rightX, finalY + 22, { align: 'right' });
    
    // Observaciones si existen
    if (factura.observaciones) {
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('OBSERVACIONES:', 20, finalY + 50);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const obs = doc.splitTextToSize(factura.observaciones, 170);
      doc.text(obs, 20, finalY + 57);
    }
    
    // Footer
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 270, 190, 270);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Este es un comprobante válido de pago', 105, 277, { align: 'center' });
    doc.text('Gracias por confiar en VetCare Pro', 105, 283, { align: 'center' });
    doc.text(`Documento generado el ${new Date().toLocaleDateString('es-CL')}`, 105, 289, { align: 'center' });
    
    // Guardar
    doc.save(`Comprobante-${factura.numero_factura}.pdf`);
  };

  const handleLogout = () => {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientData');
    router.push('/portal-cliente/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div 
                className="flex items-center cursor-pointer"
                onClick={() => router.push('/portal-cliente/dashboard-cliente')}
              >
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">VetCare Pro</span>
              </div>
              
              <div className="hidden md:flex space-x-4">
                <button
                  onClick={() => router.push('/portal-cliente/dashboard-cliente')}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Inicio
                </button>
                <button
                  onClick={() => router.push('/portal-cliente/mis-mascotas')}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Mis Mascotas
                </button>
                <button
                  onClick={() => router.push('/portal-cliente/mis-citas')}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Mis Citas
                </button>
                <button className="text-blue-600 border-b-2 border-blue-600 px-3 py-2 text-sm font-medium">
                  Mis Facturas
                </button>
                <button
                onClick={() => router.push('/portal-cliente/historial-medico')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Historial Médico
              </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{clientData?.nombre} {clientData?.apellido}</p>
                <p className="text-xs text-gray-500">Cliente</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <h1 className="text-3xl font-bold mb-2">💼 Mis Comprobantes de Pago</h1>
          <p className="text-blue-100">Descarga los comprobantes de tus citas y servicios pagados</p>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <p className="text-sm font-medium text-gray-600">Total Facturas</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{facturas.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <p className="text-sm font-medium text-gray-600">Pagadas</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {facturas.filter(f => f.estado_pago === 'pagado').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
            <p className="text-sm font-medium text-gray-600">Pendientes</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {facturas.filter(f => f.estado_pago === 'pendiente').length}
            </p>
          </div>
        </div>

        {/* Lista de Facturas */}
        {facturas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes facturas aún</h3>
            <p className="text-gray-600 mb-6">Tus comprobantes aparecerán aquí cuando realices pagos</p>
            <button
              onClick={() => router.push('/portal-cliente/agendar-cita')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Agendar Primera Cita
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {facturas.map(f => (
              <div key={f.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{f.numero_factura}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        f.estado_pago === 'pagado' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {f.estado_pago === 'pagado' ? '✓ PAGADO' : 'PENDIENTE'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      📅 {new Date(f.fecha_emision).toLocaleDateString('es-CL', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-gray-600">Total:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ${parseFloat(f.total).toLocaleString('es-CL')}
                      </span>
                    </div>
                  </div>
                  
                  {/* Botón descarga solo para pagadas */}
                  {f.estado_pago === 'pagado' && (
                    <div className="flex items-center">
                      <button
                        onClick={() => descargarComprobante(f)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Descargar Comprobante
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}