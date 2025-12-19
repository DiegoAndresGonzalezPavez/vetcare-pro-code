'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '../../components/Footer';  


export default function DashboardClientePage() {
  const router = useRouter();
  const [cliente, setCliente] = useState(null);
  const [mascotas, setMascotas] = useState([]);
  const [citasPendientes, setCitasPendientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verificarAuth();
    cargarDatos();
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

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem('clientToken');
      const clientData = JSON.parse(localStorage.getItem('clientData'));
      
      if (!clientData?.id) return;

      // Cargar mascotas del cliente
      const mascotasRes = await fetch(`http://localhost:5000/api/mascotas/cliente/${clientData.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const mascotasData = await mascotasRes.json();
      setMascotas(mascotasData.data || []);

      // Cargar citas pendientes del cliente
      const citasRes = await fetch(`http://localhost:5000/api/citas/cliente/${clientData.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const citasData = await citasRes.json();
      
      const pendientes = citasData.data?.filter(cita => 
        cita.estado === 'Pendiente' || cita.estado === 'Confirmada'
      ) || [];
      
      setCitasPendientes(pendientes);
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientData');
    router.push('/portal-cliente/login');
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
                  className="text-blue-600 border-b-2 border-blue-600 px-3 py-2 text-sm font-medium"
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
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            ¡Hola, {cliente.nombre}! 👋
          </h1>
          <p className="text-blue-100">
            Bienvenido a tu portal de gestión de citas veterinarias
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mis Mascotas</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{mascotas.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Citas Pendientes</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{citasPendientes.length}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Historial</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">Ver</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Agendar Cita */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reservar Cita</h2>
            <p className="text-gray-600 mb-6">
              Agenda una cita para tu mascota de forma rápida y sencilla
            </p>
            <button
              onClick={() => router.push('/portal-cliente/agendar-cita')}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Agendar Nueva Cita</span>
            </button>
          </div>

          {/* Mis Mascotas */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Mis Mascotas</h2>
            {mascotas.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500 mb-4">Aún no has registrado mascotas</p>
                <button
                  onClick={() => router.push('/portal-cliente/mis-mascotas')}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Registrar Mascota
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {mascotas.slice(0, 3).map((mascota) => (
                  <div key={mascota.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold">{mascota.nombre[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{mascota.nombre}</p>
                        <p className="text-sm text-gray-500">{mascota.especie} • {mascota.raza}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => router.push('/portal-cliente/mis-mascotas')}
                  className="w-full text-blue-600 font-medium py-2 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Ver todas mis mascotas
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Próximas Citas */}
        {citasPendientes.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Próximas Citas</h2>
            <div className="space-y-4">
              {citasPendientes.map((cita) => (
                <div key={cita.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          cita.estado === 'Confirmada' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {cita.estado}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-900">{cita.mascota?.nombre || 'Mascota'}</p>
                      {/* ✅ CORREGIDO: Acceder al nombre del servicio */}
                      <p className="text-sm text-gray-600">{cita.servicio?.nombre || cita.servicio}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        📅 {new Date(cita.fecha_cita).toLocaleDateString('es-CL')} - {cita.hora_cita}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">${cita.precio_servicio?.toLocaleString('es-CL')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer /> 
    </div>
  );
}