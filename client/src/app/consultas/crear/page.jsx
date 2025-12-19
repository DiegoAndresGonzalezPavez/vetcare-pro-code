'use client';
import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Footer from '../../components/Footer';

function CrearHistorialContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const citaId = searchParams.get('cita_id');
  
  const [usuario, setUsuario] = useState(null);
  const [cita, setCita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    sintomas: '',
    diagnostico: '',
    tratamiento: '',
    medicamentos: '',
    peso_actual: '',
    temperatura: '',
    observaciones: '',
    recomendaciones: '',
    proxima_cita: ''
  });

  useEffect(() => {
    verificarAuth();
  }, []);

  useEffect(() => {
    if (citaId && usuario) {
      cargarCita();
    }
  }, [citaId, usuario]);

  const verificarAuth = () => {
    let token = localStorage.getItem('token');
    let userData = localStorage.getItem('usuario');

    if (!token) token = localStorage.getItem('authToken');
    if (!userData) userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    
    try {
      const user = JSON.parse(userData);
      setUsuario(user);
    } catch (error) {
      console.error('Error al parsear usuario:', error);
      router.push('/login');
    }
  };

  const cargarCita = async () => {
    try {
      let token = localStorage.getItem('token');
      if (!token) token = localStorage.getItem('authToken');
      
      const response = await fetch(`http://localhost:5000/api/citas/${citaId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCita(data.data);
        if (data.data.motivo_consulta) {
          setFormData(prev => ({
            ...prev,
            sintomas: data.data.motivo_consulta
          }));
        }
      } else {
        alert('Error al cargar la cita');
        router.push('/consultas');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.sintomas || !formData.diagnostico || !formData.tratamiento) {
      alert('Por favor completa los campos obligatorios: síntomas, diagnóstico y tratamiento');
      return;
    }

    setSubmitting(true);
    
    try {
      let token = localStorage.getItem('token');
      if (!token) token = localStorage.getItem('authToken');
      
      const dataToSend = {
        id_mascota: cita.id_mascota,
        id_cita: cita.id,
        id_veterinario: usuario.id,
        sintomas: formData.sintomas,
        diagnostico: formData.diagnostico,
        tratamiento: formData.tratamiento,
        medicamentos: formData.medicamentos || null,
        peso_actual: formData.peso_actual ? parseFloat(formData.peso_actual) : null,
        temperatura: formData.temperatura ? parseFloat(formData.temperatura) : null,
        observaciones: formData.observaciones || null,
        recomendaciones: formData.recomendaciones || null,
        proxima_cita: formData.proxima_cita || null
      };

      const response = await fetch('http://localhost:5000/api/historiales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Historial médico creado exitosamente');
        router.push('/consultas');
      } else {
        alert('Error: ' + (data.message || 'No se pudo crear el historial'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear el historial médico');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!cita) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-900 font-semibold">Cita no encontrada</p>
          <button
            onClick={() => router.push('/consultas')}
            className="mt-4 text-purple-600 hover:underline font-medium"
          >
            Volver a Consultas
          </button>
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
            <div className="flex items-center">
              <div 
                className="flex-shrink-0 flex items-center cursor-pointer"
                onClick={() => router.push('/dashboard')}
              >
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">VetCare Pro</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {usuario?.nombre} {usuario?.apellido}
                </p>
                <p className="text-xs text-gray-500">{usuario?.rol}</p>
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

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">📝 Crear Historial Médico</h1>
              <p className="text-purple-100 mt-1">Registra los detalles de la consulta</p>
            </div>
            <button
              onClick={() => router.push('/consultas')}
              className="px-6 py-3 bg-white text-purple-700 font-semibold rounded-lg hover:bg-purple-50 transition-colors shadow-md"
            >
              ← Cancelar
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info de la cita */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-bold text-blue-900 mb-4">📋 Información de la Cita</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Mascota</p>
              <p className="font-bold text-blue-900 text-lg">
                {cita.mascota?.nombre}
              </p>
              <p className="text-sm text-blue-700">
                {cita.mascota?.especie} - {cita.mascota?.raza}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Cliente</p>
              <p className="font-bold text-blue-900 text-lg">
                {cita.cliente?.nombre} {cita.cliente?.apellido}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Fecha y Hora</p>
              <p className="font-bold text-blue-900">
                {new Date(cita.fecha_cita).toLocaleDateString('es-CL')} - {cita.hora_cita}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Servicio</p>
              <p className="font-bold text-blue-900">{cita.servicio?.nombre}</p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6 border border-gray-200">
          {/* Mediciones */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-purple-200">
              📏 Mediciones
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Peso Actual (kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.peso_actual}
                  onChange={(e) => setFormData({...formData, peso_actual: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500 transition-all"
                  placeholder="Ej: 12.5"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Temperatura (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperatura}
                  onChange={(e) => setFormData({...formData, temperatura: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500 transition-all"
                  placeholder="Ej: 38.5"
                />
              </div>
            </div>
          </div>

          {/* Síntomas */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              🩺 Síntomas * <span className="text-red-600">(Obligatorio)</span>
            </label>
            <textarea
              rows="4"
              value={formData.sintomas}
              onChange={(e) => setFormData({...formData, sintomas: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500 transition-all"
              placeholder="Describe los síntomas que presenta la mascota..."
            />
          </div>

          {/* Diagnóstico */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              🔬 Diagnóstico * <span className="text-red-600">(Obligatorio)</span>
            </label>
            <textarea
              rows="4"
              value={formData.diagnostico}
              onChange={(e) => setFormData({...formData, diagnostico: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500 transition-all"
              placeholder="Diagnóstico médico de la condición..."
            />
          </div>

          {/* Tratamiento */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              💊 Tratamiento * <span className="text-red-600">(Obligatorio)</span>
            </label>
            <textarea
              rows="4"
              value={formData.tratamiento}
              onChange={(e) => setFormData({...formData, tratamiento: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500 transition-all"
              placeholder="Tratamiento prescrito y procedimientos realizados..."
            />
          </div>

          {/* Medicamentos */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              💉 Medicamentos
            </label>
            <textarea
              rows="3"
              value={formData.medicamentos}
              onChange={(e) => setFormData({...formData, medicamentos: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500 transition-all"
              placeholder="Medicamentos recetados (nombre, dosis, frecuencia)..."
            />
          </div>

          {/* Recomendaciones */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              💡 Recomendaciones
            </label>
            <textarea
              rows="3"
              value={formData.recomendaciones}
              onChange={(e) => setFormData({...formData, recomendaciones: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500 transition-all"
              placeholder="Recomendaciones para el cuidado en casa..."
            />
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              📝 Observaciones Adicionales
            </label>
            <textarea
              rows="3"
              value={formData.observaciones}
              onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500 transition-all"
              placeholder="Cualquier observación adicional relevante..."
            />
          </div>

          {/* Próxima cita */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              📅 Próxima Cita Sugerida
            </label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={formData.proxima_cita}
              onChange={(e) => setFormData({...formData, proxima_cita: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 transition-all"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-6 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/consultas')}
              className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-900 rounded-lg font-bold hover:bg-gray-50 transition-all shadow-sm"
            >
              ❌ Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 px-6 py-4 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-all shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? '⏳ Guardando...' : '✅ Guardar Historial Médico'}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CrearHistorialPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p>Cargando...</p></div>}>
      <CrearHistorialContent />
    </Suspense>
  );
}