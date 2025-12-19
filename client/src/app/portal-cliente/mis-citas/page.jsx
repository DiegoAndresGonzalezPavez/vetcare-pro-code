'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '../../components/Footer';   

export default function MisCitasPage() {
  const router = useRouter();
  const [cliente, setCliente] = useState(null);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas');
  const [procesandoPago, setProcesandoPago] = useState(null); // 👈 NUEVO

  useEffect(() => {
    verificarAuth();
    cargarCitas();
  }, []);

  const verificarAuth = () => {
    const token = localStorage.getItem('clientToken');
    const clientData = localStorage.getItem('clientData');
    
    if (!token || !clientData) {
      router.push('/portal-cliente/login');
      return;
    }
    
    setCliente(JSON.parse(clientData));
  };

  const cargarCitas = async () => {
    try {
      const token = localStorage.getItem('clientToken');
      const clientData = JSON.parse(localStorage.getItem('clientData'));
      
      const response = await fetch(`http://localhost:5000/api/citas/cliente/${clientData.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      const citasOrdenadas = (data.data || []).sort((a, b) => {
        return new Date(b.fecha_cita) - new Date(a.fecha_cita);
      });
      
      setCitas(citasOrdenadas);
    } catch (error) {
      console.error('Error al cargar citas:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🆕 FUNCIÓN PARA PAGAR
  const handlePagar = async (citaId) => {
    setProcesandoPago(citaId);
    
    try {
      const token = localStorage.getItem('clientToken');
      
      const response = await fetch('http://localhost:5000/api/pagos/crear-sesion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cita_id: citaId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Redirigir a Stripe Checkout
        window.location.href = data.url;
      } else {
        alert('Error al procesar el pago: ' + data.message);
      }
    } catch (error) {
      console.error('Error al iniciar pago:', error);
      alert('Error al procesar el pago');
    } finally {
      setProcesandoPago(null);
    }
  };

  // 🆕 FUNCIÓN PARA BADGE DE ESTADO DE PAGO
  const getEstadoPagoBadge = (estadoPago) => {
    const estados = {
      'pendiente': { color: 'bg-red-100 text-red-800', texto: 'Pago Pendiente', icon: '💳' },
      'pagado': { color: 'bg-green-100 text-green-800', texto: 'Pagado', icon: '✅' },
      'cancelado': { color: 'bg-gray-100 text-gray-800', texto: 'Cancelado', icon: '❌' }
    };
    return estados[estadoPago] || estados['pendiente'];
  };

  const handleCancelarCita = async (citaId) => {
    if (!confirm('¿Estás seguro de cancelar esta cita?')) return;
    
    try {
      const token = localStorage.getItem('clientToken');
      
      const response = await fetch(`http://localhost:5000/api/citas/${citaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: 'Cancelada' })
      });
      
      if (response.ok) {
        cargarCitas();
        alert('Cita cancelada exitosamente');
      } else {
        alert('Error al cancelar la cita');
      }
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      alert('Error al cancelar la cita');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientData');
    router.push('/portal-cliente/login');
  };

  const citasFiltradas = citas.filter(cita => {
    if (filtro === 'todas') return true;
    return cita.estado.toLowerCase() === filtro.toLowerCase();
  });

  const getEstadoColor = (estado) => {
    const colores = {
      'Pendiente': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Confirmada': 'bg-green-100 text-green-700 border-green-200',
      'Completada': 'bg-blue-100 text-blue-700 border-blue-200',
      'Cancelada': 'bg-red-100 text-red-700 border-red-200'
    };
    return colores[estado] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const contarPorEstado = (estado) => {
    if (estado === 'todas') return citas.length;
    return citas.filter(c => c.estado.toLowerCase() === estado.toLowerCase()).length;
  };

  if (loading || !cliente) {
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
                  className="text-blue-600 border-b-2 border-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Mis Citas
                </button>
                <button onClick={() => router.push('/portal-cliente/mis-facturas')}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                Ver Mis Facturas
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
                <p className="text-sm font-medium text-gray-900">{cliente.nombre} {cliente.apellido}</p>
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Citas</h1>
            <p className="text-gray-600 mt-1">Historial completo de tus citas veterinarias</p>
          </div>
          <button
            onClick={() => router.push('/portal-cliente/agendar-cita')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Nueva Cita</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFiltro('todas')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtro === 'todas'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas ({contarPorEstado('todas')})
            </button>
            <button
              onClick={() => setFiltro('pendiente')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtro === 'pendiente'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendientes ({contarPorEstado('pendiente')})
            </button>
            <button
              onClick={() => setFiltro('confirmada')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtro === 'confirmada'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Confirmadas ({contarPorEstado('confirmada')})
            </button>
            <button
              onClick={() => setFiltro('completada')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtro === 'completada'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completadas ({contarPorEstado('completada')})
            </button>
            <button
              onClick={() => setFiltro('cancelada')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtro === 'cancelada'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Canceladas ({contarPorEstado('cancelada')})
            </button>
          </div>
        </div>

        {/* Lista de Citas */}
        {citasFiltradas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filtro === 'todas' ? 'No tienes citas registradas' : `No tienes citas ${filtro}s`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filtro === 'todas' 
                ? 'Agenda tu primera cita para comenzar' 
                : 'Cambia el filtro para ver otras citas'}
            </p>
            {filtro === 'todas' && (
              <button
                onClick={() => router.push('/portal-cliente/agendar-cita')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Agendar Primera Cita
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {citasFiltradas.map((cita) => {
              const estadoPago = getEstadoPagoBadge(cita.estado_pago); // 👈 NUEVO
              
              return (
                <div key={cita.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Info Principal */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getEstadoColor(cita.estado)}`}>
                          {cita.estado}
                        </span>
                        {/* 👇 NUEVO BADGE DE PAGO */}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estadoPago.color}`}>
                          {estadoPago.icon} {estadoPago.texto}
                        </span>
                        <span className="text-sm text-gray-500">
                          #{cita.id}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 mb-1">
                            {cita.mascota?.nombre || 'Mascota no especificada'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Servicio:</span> {cita.servicio?.nombre || 'No especificado'}
                          </p>
                          {cita.motivo_consulta && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Motivo:</span> {cita.motivo_consulta}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <div className="flex items-center text-gray-700 mb-2">
                            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm">
                              {new Date(cita.fecha_cita).toLocaleDateString('es-CL', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-700 mb-2">
                            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm">{cita.hora_cita}</span>
                          </div>
                          {cita.veterinario && (
                            <div className="flex items-center text-gray-700">
                              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="text-sm">
                                Dr. {cita.veterinario.nombre} {cita.veterinario.apellido}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {cita.observaciones && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-700">
                            <span className="font-semibold">Observaciones:</span> {cita.observaciones}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Precio y Acciones */}
                    <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Precio</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ${Number(cita.precio_servicio).toLocaleString('es-CL')}
                        </p>
                      </div>
                      
                      {/* 👇 BOTÓN DE PAGAR */}
                      {cita.estado_pago === 'pendiente' && cita.estado !== 'Cancelada' && (
                        <button
                          onClick={() => handlePagar(cita.id)}
                          disabled={procesandoPago === cita.id}
                          className="w-full lg:w-auto bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {procesandoPago === cita.id ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              Procesando...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                              Pagar Ahora
                            </>
                          )}
                        </button>
                      )}
                      
                      {(cita.estado === 'Pendiente' || cita.estado === 'Confirmada') && cita.estado_pago === 'pendiente' && (
                        <button
                          onClick={() => handleCancelarCita(cita.id)}
                          className="w-full lg:w-auto px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors text-sm"
                        >
                          Cancelar Cita
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}