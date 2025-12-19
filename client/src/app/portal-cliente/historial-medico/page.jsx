'use client';
import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Footer from '../../components/Footer';

function HistorialMedicoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mascotaId = searchParams.get('mascota');
  
  const [cliente, setCliente] = useState(null);
  const [mascotas, setMascotas] = useState([]);
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState(null);
  const [historiales, setHistoriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historialDetalle, setHistorialDetalle] = useState(null);

  useEffect(() => {
    verificarAuth();
    cargarMascotas();
  }, []);

  useEffect(() => {
    if (mascotaId && mascotas.length > 0) {
      const mascota = mascotas.find(m => m.id === parseInt(mascotaId));
      if (mascota) {
        handleSeleccionarMascota(mascota);
      }
    }
  }, [mascotaId, mascotas]);

  const verificarAuth = () => {
    const token = localStorage.getItem('clientToken');
    const clientData = localStorage.getItem('clientData');
    
    if (!token || !clientData) {
      router.push('/portal-cliente/login');
      return;
    }
    
    setCliente(JSON.parse(clientData));
  };

  const cargarMascotas = async () => {
    try {
      const token = localStorage.getItem('clientToken');
      const clientData = JSON.parse(localStorage.getItem('clientData'));
      
      const response = await fetch(`http://localhost:5000/api/mascotas/cliente/${clientData.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      setMascotas(data.data || []);
    } catch (error) {
      console.error('Error al cargar mascotas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarMascota = async (mascota) => {
    setMascotaSeleccionada(mascota);
    setLoading(true);
    
    try {
      const token = localStorage.getItem('clientToken');
      
      const response = await fetch(`http://localhost:5000/api/historiales/mascota/${mascota.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      setHistoriales(data.data || []);
    } catch (error) {
      console.error('Error al cargar historiales:', error);
      setHistoriales([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientData');
    router.push('/portal-cliente/login');
  };

  if (loading && !mascotaSeleccionada) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
                  Historial Médico
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{cliente?.nombre} {cliente?.apellido}</p>
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
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <h1 className="text-3xl font-bold mb-2">📋 Historial Médico</h1>
          <p className="text-purple-100">Consulta el historial de salud de tus mascotas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Lista de Mascotas */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Selecciona una mascota</h2>
              
              {mascotas.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No tienes mascotas registradas</p>
              ) : (
                <div className="space-y-3">
                  {mascotas.map((mascota) => (
                    <div
                      key={mascota.id}
                      onClick={() => handleSeleccionarMascota(mascota)}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        mascotaSeleccionada?.id === mascota.id
                          ? 'bg-purple-50 border-2 border-purple-600'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-bold">{mascota.nombre[0]}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{mascota.nombre}</h3>
                          <p className="text-sm text-gray-600">{mascota.especie}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contenido Principal - Historiales */}
          <div className="lg:col-span-2">
            {!mascotaSeleccionada ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Selecciona una mascota</h3>
                <p className="text-gray-600">Elige una mascota para ver su historial médico</p>
              </div>
            ) : loading ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando historial...</p>
              </div>
            ) : historiales.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Sin historial médico</h3>
                <p className="text-gray-600">{mascotaSeleccionada.nombre} aún no tiene registros médicos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {historiales.map((historial) => (
                  <div key={historial.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Consulta del {new Date(historial.fecha_atencion).toLocaleDateString('es-CL')}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Dr. {historial.veterinario.nombre} {historial.veterinario.apellido}
                          </p>
                        </div>
                        <button
                          onClick={() => setHistorialDetalle(historialDetalle?.id === historial.id ? null : historial)}
                          className="text-purple-600 hover:text-purple-700 font-medium"
                        >
                          {historialDetalle?.id === historial.id ? 'Ocultar' : 'Ver detalles'}
                        </button>
                      </div>

                      {/* Resumen */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {historial.peso_actual && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600">Peso</p>
                            <p className="text-lg font-semibold text-gray-900">{historial.peso_actual} kg</p>
                          </div>
                        )}
                        {historial.temperatura && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600">Temperatura</p>
                            <p className="text-lg font-semibold text-gray-900">{historial.temperatura}°C</p>
                          </div>
                        )}
                      </div>

                      {/* Detalles expandibles */}
                      {historialDetalle?.id === historial.id && (
                        <div className="border-t pt-4 space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Síntomas</h4>
                            <p className="text-gray-700">{historial.sintomas}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Diagnóstico</h4>
                            <p className="text-gray-700">{historial.diagnostico}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Tratamiento</h4>
                            <p className="text-gray-700">{historial.tratamiento}</p>
                          </div>
                          {historial.medicamentos && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Medicamentos</h4>
                              <p className="text-gray-700">{historial.medicamentos}</p>
                            </div>
                          )}
                          {historial.recomendaciones && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Recomendaciones</h4>
                              <p className="text-gray-700">{historial.recomendaciones}</p>
                            </div>
                          )}
                          {historial.observaciones && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Observaciones</h4>
                              <p className="text-gray-700">{historial.observaciones}</p>
                            </div>
                          )}
                          {historial.proxima_cita && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <p className="text-sm font-semibold text-blue-900">Próxima cita sugerida:</p>
                              <p className="text-blue-700">{new Date(historial.proxima_cita).toLocaleDateString('es-CL')}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <br />
      <br />
      <br />
      <br />
      <br />
      <Footer />
    </div>
  );
}

export default function HistorialMedicoPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p>Cargando...</p></div>}>
      <HistorialMedicoContent />
    </Suspense>
  );
}