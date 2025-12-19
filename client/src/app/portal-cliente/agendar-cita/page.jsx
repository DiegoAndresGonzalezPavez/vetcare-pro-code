'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '../../components/Footer';  

export default function AgendarCitaPage() {
  const router = useRouter();
  const [cliente, setCliente] = useState(null);
  const [step, setStep] = useState(1);
  const [mascotas, setMascotas] = useState([]);
  const [servicios, setServicios] = useState([]); // 👈 AHORA ES STATE
  const [veterinarios, setVeterinarios] = useState([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    mascota_id: '',
    servicio_id: '', // 👈 CAMBIO: servicio_id en lugar de servicio
    veterinario_id: '',
    fecha: '',
    hora: '',
    motivo: ''
  });

  useEffect(() => {
    verificarAuth();
    cargarDatos();
  }, []);

  useEffect(() => {
    if (formData.fecha && formData.veterinario_id && formData.servicio_id) {
      cargarHorariosDisponibles();
    }
  }, [formData.fecha, formData.veterinario_id, formData.servicio_id]);

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
      
      // 🆕 Cargar servicios desde el backend
      const serviciosRes = await fetch('http://localhost:5000/api/servicios', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const serviciosData = await serviciosRes.json();
      console.log('Servicios cargados:', serviciosData); // Para debug
      setServicios(serviciosData.data || serviciosData || []);
      
      // Cargar mascotas
      const mascotasRes = await fetch(`http://localhost:5000/api/mascotas/cliente/${clientData.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const mascotasData = await mascotasRes.json();
      setMascotas(mascotasData.data || []);

      // Cargar veterinarios
      try {
        const veterinariosRes = await fetch('http://localhost:5000/api/usuarios/veterinarios', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (veterinariosRes.ok) {
          const veterinariosData = await veterinariosRes.json();
          setVeterinarios(veterinariosData.data || []);
        } else {
          const usuariosRes = await fetch('http://localhost:5000/api/usuarios', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const usuariosData = await usuariosRes.json();
          const vets = (usuariosData.data || []).filter(u => u.rol === 'Veterinario');
          setVeterinarios(vets);
        }
      } catch (vetError) {
        console.error('Error al cargar veterinarios:', vetError);
        setVeterinarios([]);
      }
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const cargarHorariosDisponibles = async () => {
    try {
      const token = localStorage.getItem('clientToken');
      
      const response = await fetch(
        `http://localhost:5000/api/citas/horarios-disponibles?fecha=${formData.fecha}&veterinario_id=${formData.veterinario_id}&id_servicio=${formData.servicio_id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setHorariosDisponibles(data.horarios_disponibles || generarHorariosDefault());
      } else {
        setHorariosDisponibles(generarHorariosDefault());
      }
    } catch (error) {
      console.error('Error al cargar horarios:', error);
      setHorariosDisponibles(generarHorariosDefault());
    }
  };

  const generarHorariosDefault = () => {
    const horarios = [];
    for (let hour = 9; hour <= 18; hour++) {
      horarios.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 18) {
        horarios.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return horarios;
  };

  const handleNext = () => {
    if (step === 1 && !formData.mascota_id) {
      alert('Por favor selecciona una mascota');
      return;
    }
    if (step === 2 && !formData.servicio_id) {
      alert('Por favor selecciona un servicio');
      return;
    }
    if (step === 3 && (!formData.veterinario_id || !formData.fecha || !formData.hora)) {
      alert('Por favor completa todos los campos de fecha y hora');
      return;
    }
    
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleConfirmar = async () => {
    if (!formData.motivo.trim()) {
      alert('Por favor ingresa el motivo de la consulta');
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('clientToken');
      const clientData = JSON.parse(localStorage.getItem('clientData'));
      
      const servicioSeleccionado = servicios.find(s => s.id === parseInt(formData.servicio_id));
      
      console.log('Datos a enviar:', {
        id_cliente: clientData.id,
        id_mascota: parseInt(formData.mascota_id),
        id_veterinario: parseInt(formData.veterinario_id),
        id_servicio: parseInt(formData.servicio_id),
        fecha_cita: formData.fecha,
        hora_cita: formData.hora,
        precio_servicio: servicioSeleccionado?.precio_base || 0,
        motivo_consulta: formData.motivo,
        estado: 'Pendiente'
      });
      
      const response = await fetch('http://localhost:5000/api/citas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_cliente: clientData.id,
          id_mascota: parseInt(formData.mascota_id),
          id_veterinario: parseInt(formData.veterinario_id),
          id_servicio: parseInt(formData.servicio_id), // 👈 AHORA ES ID
          fecha_cita: formData.fecha,
          hora_cita: formData.hora,
          precio_servicio: servicioSeleccionado?.precio_base || 0,
          motivo_consulta: formData.motivo,
          estado: 'Pendiente'
        })
      });
      
      const data = await response.json();
      console.log('Respuesta del servidor:', data);
      
      if (response.ok) {
        alert('¡Cita agendada exitosamente! Te enviaremos una confirmación por email.');
        router.push('/portal-cliente/mis-citas');
      } else {
        alert('Error al agendar la cita: ' + (data.message || data.error || 'Error desconocido'));
        console.error('Error detallado:', data);
      }
    } catch (error) {
      console.error('Error al confirmar cita:', error);
      alert('Error al procesar la reserva: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientData');
    router.push('/portal-cliente/login');
  };

  const getMascotaSeleccionada = () => mascotas.find(m => m.id === parseInt(formData.mascota_id));
  const getServicioSeleccionado = () => servicios.find(s => s.id === parseInt(formData.servicio_id));
  const getVeterinarioSeleccionado = () => veterinarios.find(v => v.id === parseInt(formData.veterinario_id));

  if (!cliente) {
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agendar Nueva Cita</h1>
          <p className="text-gray-600 mt-1">Reserva una cita para tu mascota en 4 simples pasos</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                  step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {s}
                </div>
                {s < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-600">Mascota</span>
            <span className="text-xs text-gray-600">Servicio</span>
            <span className="text-xs text-gray-600">Fecha/Hora</span>
            <span className="text-xs text-gray-600">Confirmar</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          {/* PASO 1: Seleccionar Mascota */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Selecciona tu mascota</h2>
              
              {mascotas.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes mascotas registradas</h3>
                  <p className="text-gray-600 mb-6">Primero debes registrar una mascota para poder agendar citas</p>
                  <button
                    onClick={() => router.push('/portal-cliente/mis-mascotas')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Registrar Mascota
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mascotas.map((mascota) => (
                    <div
                      key={mascota.id}
                      onClick={() => setFormData({ ...formData, mascota_id: mascota.id })}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.mascota_id === mascota.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">{mascota.nombre[0]}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{mascota.nombre}</h3>
                          <p className="text-sm text-gray-600">{mascota.especie} • {mascota.raza}</p>
                        </div>
                        {formData.mascota_id === mascota.id && (
                          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PASO 2: Seleccionar Servicio */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Selecciona el servicio</h2>
              
              {servicios.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Cargando servicios...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {servicios.map((servicio) => (
                    <div
                      key={servicio.id}
                      onClick={() => setFormData({ ...formData, servicio_id: servicio.id })}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.servicio_id === servicio.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900">{servicio.nombre}</h3>
                        {formData.servicio_id === servicio.id && (
                          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{servicio.descripcion}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-bold text-blue-600">${servicio.precio_base.toLocaleString('es-CL')}</p>
                        <p className="text-xs text-gray-500">{servicio.duracion_minutos} min</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PASO 3: Fecha, Hora y Veterinario */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Selecciona fecha, hora y veterinario</h2>
              
              <div className="space-y-6">
                {/* Veterinario */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Veterinario *
                  </label>
                  {veterinarios.length === 0 ? (
                    <p className="text-gray-600">No hay veterinarios disponibles</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {veterinarios.map((vet) => (
                        <div
                          key={vet.id}
                          onClick={() => setFormData({ ...formData, veterinario_id: vet.id })}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            formData.veterinario_id === vet.id
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">Dr. {vet.nombre} {vet.apellido}</h4>
                              <p className="text-sm text-gray-600">{vet.especialidad || 'Veterinario General'}</p>
                            </div>
                            {formData.veterinario_id === vet.id && (
                              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Fecha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de la cita *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value, hora: '' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Horarios */}
                {formData.fecha && formData.veterinario_id && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora disponible *
                    </label>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {horariosDisponibles.map((hora) => (
                        <button
                          key={hora}
                          type="button"
                          onClick={() => setFormData({ ...formData, hora })}
                          className={`py-2 px-3 rounded-lg font-medium transition-all ${
                            formData.hora === hora
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {hora}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PASO 4: Confirmación */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirma tu cita</h2>
              
              {/* Resumen */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Resumen de la cita</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mascota:</span>
                    <span className="font-medium text-gray-900">{getMascotaSeleccionada()?.nombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Servicio:</span>
                    <span className="font-medium text-gray-900">{getServicioSeleccionado()?.nombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Veterinario:</span>
                    <span className="font-medium text-gray-900">
                      Dr. {getVeterinarioSeleccionado()?.nombre} {getVeterinarioSeleccionado()?.apellido}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(formData.fecha + 'T00:00:00').toLocaleDateString('es-CL', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hora:</span>
                    <span className="font-medium text-gray-900">{formData.hora}</span>
                  </div>
                  <div className="border-t pt-3 mt-3 flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${getServicioSeleccionado()?.precio_base.toLocaleString('es-CL')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Motivo */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo de la consulta *
                </label>
                <textarea
                  required
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe brevemente el motivo de la consulta o los síntomas que presenta tu mascota..."
                />
              </div>

              {/* Nota informativa */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      <strong>Importante:</strong> Te enviaremos un email de confirmación con todos los detalles de tu cita. 
                      Por favor, llega 10 minutos antes de tu hora agendada.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={step === 1 ? () => router.push('/portal-cliente/dashboard-cliente') : handleBack}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            {step === 1 ? 'Cancelar' : 'Atrás'}
          </button>
          
          {step < 4 ? (
            <button
              onClick={handleNext}
              disabled={mascotas.length === 0 && step === 1}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={handleConfirmar}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Procesando...' : 'Confirmar Cita'}
            </button>
          )}
        </div>
      </main>
      <br />
      <br />
      <br />
      <Footer /> 
    </div>
  );
}