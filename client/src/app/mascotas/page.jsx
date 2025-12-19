'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mascotasAPI, clientesAPI } from '../../services/api';
import ImageUploader from '../components/ImageUploader'; 
import Footer from '../components/Footer';     

export default function MascotasPage() {
  const router = useRouter();
  const [mascotas, setMascotas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMascota, setEditingMascota] = useState(null);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    id_cliente: '',
    nombre: '',
    especie: '',
    raza: '',
    fecha_nacimiento: '',
    sexo: '',
    color: '',
    peso_kg: '',
    microchip: '',
    foto_url: '', // ✅ AGREGAR
    observaciones: ''
  });

  useEffect(() => {
    verificarAuth();
    cargarMascotas();
    cargarClientes();
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

  const cargarMascotas = async () => {
    try {
      const response = await mascotasAPI.getAll();
      setMascotas(response.data);
    } catch (error) {
      console.error('Error al cargar mascotas:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarClientes = async () => {
    try {
      const response = await clientesAPI.getAll();
      setClientes(response.data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMascota) {
        await mascotasAPI.update(editingMascota.id, formData);
        alert('Mascota actualizada exitosamente');
      } else {
        await mascotasAPI.create(formData);
        alert('Mascota creada exitosamente');
      }
      setShowModal(false);
      resetForm();
      cargarMascotas();
    } catch (error) {
      alert(error.message || 'Error al guardar la mascota');
    }
  };

  const handleEdit = (mascota) => {
    setEditingMascota(mascota);
    setFormData({
      id_cliente: mascota.id_cliente,
      nombre: mascota.nombre,
      especie: mascota.especie,
      raza: mascota.raza,
      fecha_nacimiento: mascota.fecha_nacimiento.split('T')[0],
      sexo: mascota.sexo,
      color: mascota.color,
      peso_kg: mascota.peso_kg,
      microchip: mascota.microchip || '',
      foto_url: mascota.foto_url || '', // ✅ CARGAR FOTO
      observaciones: mascota.observaciones || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      id_cliente: '',
      nombre: '',
      especie: '',
      raza: '',
      fecha_nacimiento: '',
      sexo: '',
      color: '',
      peso_kg: '',
      microchip: '',
      foto_url: '', // ✅ RESETEAR FOTO
      observaciones: ''
    });
    setEditingMascota(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const filteredMascotas = mascotas.filter(mascota =>
    mascota.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mascota.especie.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mascota.raza.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Mascotas</h1>
          <p className="text-gray-600 mt-1">Administra las mascotas de los clientes</p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="w-full sm:w-96">
              <input
                type="text"
                placeholder="Buscar por nombre, especie o raza..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="w-full sm:w-auto px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Mascota
            </button>
          </div>
        </div>

        {/* Mascotas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMascotas.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-500">No se encontraron mascotas</p>
            </div>
          ) : (
            filteredMascotas.map((mascota) => (
              <div key={mascota.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* ✅ IMAGEN DE LA MASCOTA */}
                <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 relative overflow-hidden">
                  {mascota.foto_url ? (
                    <img
                      src={mascota.foto_url}
                      alt={mascota.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-6xl">
                        {mascota.especie.toLowerCase() === 'perro' ? '🐕' : 
                         mascota.especie.toLowerCase() === 'gato' ? '🐈' : '🐾'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{mascota.nombre}</h3>
                    <p className="text-sm text-gray-500">{mascota.especie} - {mascota.raza}</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 w-20">Dueño:</span>
                      <span className="text-gray-900 font-medium">
                        {mascota.cliente.nombre} {mascota.cliente.apellido}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 w-20">Sexo:</span>
                      <span className="text-gray-900">{mascota.sexo}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 w-20">Color:</span>
                      <span className="text-gray-900">{mascota.color}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 w-20">Peso:</span>
                      <span className="text-gray-900">{Number(mascota.peso_kg)} kg</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleEdit(mascota)}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      className="flex-1 px-3 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg text-sm font-medium transition-colors"
                    >
                      Historial
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 text-sm text-gray-600">
          Total: {filteredMascotas.length} mascota{filteredMascotas.length !== 1 ? 's' : ''}
        </div>
      </main>
          <Footer /> 
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingMascota ? 'Editar Mascota' : 'Nueva Mascota'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ✅ COMPONENTE DE IMAGEN */}
              <ImageUploader
                currentImage={formData.foto_url}
                onImageUploaded={(url) => setFormData({...formData, foto_url: url})}
                type="mascota"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente (Dueño) *</label>
                {editingMascota ? (
                  <input
                    type="text"
                    disabled
                    value={`${clientes.find(c => c.id === formData.id_cliente)?.nombre || ''} ${clientes.find(c => c.id === formData.id_cliente)?.apellido || ''}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                ) : (
                  <select
                    required
                    value={formData.id_cliente}
                    onChange={(e) => setFormData({...formData, id_cliente: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre} {cliente.apellido} - {cliente.rut}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Max, Luna, Milo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Especie *</label>
                  <select
                    required
                    value={formData.especie}
                    onChange={(e) => setFormData({...formData, especie: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                    <option value="Ave">Ave</option>
                    <option value="Conejo">Conejo</option>
                    <option value="Hamster">Hamster</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Raza *</label>
                  <input
                    type="text"
                    required
                    value={formData.raza}
                    onChange={(e) => setFormData({...formData, raza: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Labrador, Persa, Mestizo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento *</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_nacimiento}
                    onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sexo *</label>
                  <select
                    required
                    value={formData.sexo}
                    onChange={(e) => setFormData({...formData, sexo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color *</label>
                  <input
                    type="text"
                    required
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Negro, Blanco, Café"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.peso_kg}
                    onChange={(e) => setFormData({...formData, peso_kg: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 12.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Microchip (opcional)</label>
                <input
                  type="text"
                  value={formData.microchip}
                  onChange={(e) => setFormData({...formData, microchip: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Número de microchip"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                <textarea
                  rows="3"
                  value={formData.observaciones}
                  onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Alergias, condiciones especiales, etc."
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  {editingMascota ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}