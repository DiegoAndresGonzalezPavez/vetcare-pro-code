'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { citasAPI, clientesAPI, mascotasAPI } from '../../services/api';
import Footer from '../components/Footer';

export default function CitasPage() {
  const router = useRouter();
  const [citas, setCitas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [mascotasCliente, setMascotasCliente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCita, setEditingCita] = useState(null);
  const [user, setUser] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [formData, setFormData] = useState({
    id_cliente: '',
    id_mascota: '',
    id_servicio: '',
    fecha_cita: '',
    hora_cita: '',
    estado: 'Pendiente',
    motivo_consulta: '',
    precio_servicio: '',
    observaciones: ''
  });

  // Servicios hardcodeados (mismos que en el portal del cliente)
const servicios = [
  { id: 1, nombre: 'Consulta General', precio: 25000 },
  { id: 2, nombre: 'Vacunación', precio: 15000 },
  { id: 3, nombre: 'Desparasitación', precio: 12000 },
  { id: 4, nombre: 'Control de Salud', precio: 20000 },
  { id: 5, nombre: 'Limpieza Dental', precio: 45000 },
  { id: 6, nombre: 'Cirugía Menor', precio: 80000 },
  { id: 7, nombre: 'Esterilización', precio: 70000 },
  { id: 8, nombre: 'Corte de Uñas', precio: 8000 }
];

  useEffect(() => {
    verificarAuth();
    cargarDatos();
  }, []);

  const verificarAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) {
      router.push('/login');
    } else if (userData) {
      setUser(JSON.parse(userData));
    }
  };

  const cargarDatos = async () => {
    try {
      const [citasRes, clientesRes, mascotasRes] = await Promise.all([
        citasAPI.getAll(),
        clientesAPI.getAll(),
        mascotasAPI.getAll()
      ]);
      setCitas(citasRes.data);
      setClientes(clientesRes.data);
      setMascotas(mascotasRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClienteChange = (clienteId) => {
    setFormData({...formData, id_cliente: clienteId, id_mascota: ''});
    const mascotasDelCliente = mascotas.filter(m => m.id_cliente === parseInt(clienteId));
    setMascotasCliente(mascotasDelCliente);
  };

  const handleServicioChange = (servicioId) => {
    const servicio = servicios.find(s => s.id === parseInt(servicioId));
    setFormData({
      ...formData,
      id_servicio: servicioId,
      precio_servicio: servicio ? servicio.precio : ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        fecha_cita: formData.fecha_cita,
        hora_cita: formData.hora_cita,
        estado: formData.estado,
        id_servicio: parseInt(formData.id_servicio),
        motivo_consulta: formData.motivo_consulta,
        precio_servicio: parseFloat(formData.precio_servicio),
        observaciones: formData.observaciones
      };

      if (editingCita) {
        // Al editar, solo enviamos los campos que se pueden actualizar
        await citasAPI.update(editingCita.id, dataToSend);
        alert('Cita actualizada exitosamente');
      } else {
        // Al crear, incluimos cliente, mascota y veterinario
        dataToSend.id_cliente = parseInt(formData.id_cliente);
        dataToSend.id_mascota = parseInt(formData.id_mascota);
        dataToSend.id_veterinario = user?.id || null;
        
        await citasAPI.create(dataToSend);
        alert('Cita creada exitosamente');
      }
      
      setShowModal(false);
      resetForm();
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar cita:', error);
      alert('Error: ' + (error.message || 'No se pudo guardar la cita'));
    }
  };

  const handleEdit = (cita) => {
    setEditingCita(cita);
    const mascotasDelCliente = mascotas.filter(m => m.id_cliente === cita.id_cliente);
    setMascotasCliente(mascotasDelCliente);
    
    setFormData({
      id_cliente: cita.id_cliente,
      id_mascota: cita.id_mascota,
      id_servicio: cita.servicio?.id || cita.id_servicio,
      fecha_cita: cita.fecha_cita.split('T')[0],
      hora_cita: cita.hora_cita.split('T')[1].substring(0, 5),
      estado: cita.estado,
      motivo_consulta: cita.motivo_consulta || '',
      precio_servicio: cita.precio_servicio,
      observaciones: cita.observaciones || ''
    });
    setShowModal(true);
  };

  const handleCancelar = async (id) => {
    if (confirm('¿Estás seguro de cancelar esta cita?')) {
      try {
        await citasAPI.update(id, { estado: 'Cancelada' });
        alert('Cita cancelada exitosamente');
        cargarDatos();
      } catch (error) {
        console.error('Error al cancelar:', error);
        alert('Error al cancelar la cita');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      id_cliente: '',
      id_mascota: '',
      id_servicio: '',
      fecha_cita: '',
      hora_cita: '',
      estado: 'Pendiente',
      motivo_consulta: '',
      precio_servicio: '',
      observaciones: ''
    });
    setMascotasCliente([]);
    setEditingCita(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'Pendiente': 'bg-yellow-100 text-yellow-800',
      'Confirmada': 'bg-blue-100 text-blue-800',
      'Completada': 'bg-green-100 text-green-800',
      'Cancelada': 'bg-red-100 text-red-800'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800';
  };

  const citasFiltradas = citas.filter(cita => {
    if (filtroEstado === 'todas') return true;
    return cita.estado.toLowerCase() === filtroEstado.toLowerCase();
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
            <div className="flex items-center cursor-pointer" onClick={() => router.push('/dashboard')}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">VetCare Pro</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.nombre} {user.apellido}</p>
                  <p className="text-xs text-gray-500">{user.rol}</p>
                </div>
              )}
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Citas</h1>
          <p className="text-gray-600 mt-1">Administra las citas de la clínica veterinaria</p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFiltroEstado('todas')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtroEstado === 'todas' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFiltroEstado('pendiente')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtroEstado === 'pendiente' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pendientes
              </button>
              <button
                onClick={() => setFiltroEstado('confirmada')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtroEstado === 'confirmada' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Confirmadas
              </button>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="w-full sm:w-auto px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Cita
            </button>
          </div>
        </div>

        {/* Citas List */}
        <div className="space-y-4">
          {citasFiltradas.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-500">No se encontraron citas</p>
            </div>
          ) : (
            citasFiltradas.map((cita) => (
              <div key={cita.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(cita.estado)}`}>
                        {cita.estado}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(cita.fecha_cita).toLocaleDateString('es-CL')} - {cita.hora_cita.substring(0, 5)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Cliente</p>
                        <p className="text-sm font-medium text-gray-900">
                          {cita.cliente?.nombre} {cita.cliente?.apellido}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Mascota</p>
                        <p className="text-sm font-medium text-gray-900">{cita.mascota?.nombre}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Servicio</p>
                        {/*Acceder al nombre del servicio */}
                        <p className="text-sm text-gray-600">{cita.servicio?.nombre || 'Sin servicio'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Precio</p>
                        <p className="text-sm font-medium text-gray-900">${Number(cita.precio_servicio).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {cita.motivo_consulta && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-500">Motivo</p>
                        <p className="text-sm text-gray-700">{cita.motivo_consulta}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex lg:flex-col gap-2">
                    <button
                      onClick={() => handleEdit(cita)}
                      className="flex-1 lg:flex-none px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                    >
                      Editar
                    </button>
                    {cita.estado !== 'Cancelada' && cita.estado !== 'Completada' && (
                      <button
                        onClick={() => handleCancelar(cita.id)}
                        className="flex-1 lg:flex-none px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 text-sm text-gray-600">
          Total: {citasFiltradas.length} cita{citasFiltradas.length !== 1 ? 's' : ''}
        </div>
      </main>
        <Footer /> 
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingCita ? 'Editar Cita' : 'Nueva Cita'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                  <select
                    required
                    value={formData.id_cliente}
                    onChange={(e) => handleClienteChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={editingCita}
                  >
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre} {cliente.apellido}
                      </option>
                    ))}
                  </select>
                  {editingCita && (
                    <p className="text-xs text-gray-500 mt-1">No se puede cambiar el cliente al editar</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mascota *</label>
                  <select
                    required
                    value={formData.id_mascota}
                    onChange={(e) => setFormData({...formData, id_mascota: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={!formData.id_cliente || editingCita}
                  >
                    <option value="">Seleccionar mascota...</option>
                    {mascotasCliente.map(mascota => (
                      <option key={mascota.id} value={mascota.id}>
                        {mascota.nombre} ({mascota.especie})
                      </option>
                    ))}
                  </select>
                  {editingCita && (
                    <p className="text-xs text-gray-500 mt-1">No se puede cambiar la mascota al editar</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Servicio *</label>
                  <select
                    required
                    value={formData.id_servicio}
                    onChange={(e) => handleServicioChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar servicio...</option>
                    {servicios.map((servicio) => (
                      <option key={servicio.id} value={servicio.id}>
                        {servicio.nombre} - ${servicio.precio.toLocaleString()}
                      </option>
                    ))}
                  </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_cita}
                    onChange={(e) => setFormData({...formData, fecha_cita: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora *</label>
                  <input
                    type="time"
                    required
                    value={formData.hora_cita}
                    onChange={(e) => setFormData({...formData, hora_cita: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                  <select
                    required
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Confirmada">Confirmada</option>
                    <option value="Completada">Completada</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio del Servicio *</label>
                <input
                  type="number"
                  required
                  value={formData.precio_servicio}
                  onChange={(e) => setFormData({...formData, precio_servicio: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de Consulta</label>
                <textarea
                  rows="2"
                  value={formData.motivo_consulta}
                  onChange={(e) => setFormData({...formData, motivo_consulta: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe el motivo de la consulta..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                <textarea
                  rows="2"
                  value={formData.observaciones}
                  onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Observaciones adicionales..."
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
                >
                  {editingCita ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}