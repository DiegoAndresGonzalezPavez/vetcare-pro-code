'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from '../../components/ImageUploader';
import Footer from '../../components/Footer';    

export default function MisMascotasPage() {
  const router = useRouter();
  const [cliente, setCliente] = useState(null);
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMascota, setEditingMascota] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    especie: '',
    raza: '',
    fecha_nacimiento: '',
    sexo: '',
    color: '',
    peso_kg: '',
    microchip: '',
    foto_url: '', 
    observaciones: ''
  });

  useEffect(() => {
    const initPage = async () => {
      const isAuth = verificarAuth();
      if (isAuth) {
        await cargarMascotas();
      }
    };
    initPage();
  }, []);

  const verificarAuth = () => {
    const token = localStorage.getItem('clientToken');
    const clientDataStr = localStorage.getItem('clientData');
    
    if (!token || !clientDataStr) {
      router.push('/portal-cliente/login');
      return false;
    }
    
    try {
      const clientData = JSON.parse(clientDataStr);
      setCliente(clientData);
      return true;
    } catch (error) {
      console.error('Error al parsear clientData:', error);
      router.push('/portal-cliente/login');
      return false;
    }
  };

  const cargarMascotas = async () => {
    try {
      const token = localStorage.getItem('clientToken');
      const clientDataStr = localStorage.getItem('clientData');
      
      if (!clientDataStr) {
        console.error('No hay datos de cliente');
        setLoading(false);
        return;
      }

      const clientData = JSON.parse(clientDataStr);
      
      if (!clientData.id) {
        console.error('Cliente sin ID');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/mascotas/cliente/${clientData.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar mascotas');
      }

      const data = await response.json();
      setMascotas(data.data || []);
    } catch (error) {
      console.error('Error al cargar mascotas:', error);
      setMascotas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('clientToken');
      const clientDataStr = localStorage.getItem('clientData');
      
      if (!clientDataStr) {
        alert('Error: No se encontraron datos del cliente');
        return;
      }

      const clientData = JSON.parse(clientDataStr);
      
      const dataToSend = {
        ...formData,
        id_cliente: clientData.id,
        peso_kg: parseFloat(formData.peso_kg)
      };

      const url = editingMascota 
        ? `http://localhost:5000/api/mascotas/${editingMascota.id}`
        : 'http://localhost:5000/api/mascotas';
      
      const method = editingMascota ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        alert(editingMascota ? 'Mascota actualizada exitosamente' : 'Mascota registrada exitosamente');
        setShowModal(false);
        resetForm();
        cargarMascotas();
      } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.message || 'No se pudo guardar la mascota'));
      }
    } catch (error) {
      console.error('Error al guardar mascota:', error);
      alert('Error al guardar la mascota');
    }
  };

  const handleEdit = (mascota) => {
    setEditingMascota(mascota);
    setFormData({
      nombre: mascota.nombre,
      especie: mascota.especie,
      raza: mascota.raza,
      fecha_nacimiento: mascota.fecha_nacimiento.split('T')[0],
      sexo: mascota.sexo,
      color: mascota.color,
      peso_kg: mascota.peso_kg,
      microchip: mascota.microchip || '',
      foto_url: mascota.foto_url || '',
      observaciones: mascota.observaciones || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      especie: '',
      raza: '',
      fecha_nacimiento: '',
      sexo: '',
      color: '',
      peso_kg: '',
      microchip: '',
      foto_url: '',
      observaciones: ''
    });
    setEditingMascota(null);
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

  if (!cliente) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
                <button className="text-blue-600 border-b-2 border-blue-600 px-3 py-2 text-sm font-medium">
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
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Mascotas</h1>
            <p className="text-gray-600 mt-1">Administra la información de tus compañeros</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Registrar Mascota</span>
          </button>
        </div>

        {mascotas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aún no has registrado mascotas</h3>
            <p className="text-gray-600 mb-6">Comienza registrando a tu primera mascota</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Registrar Primera Mascota
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mascotas.map((mascota) => (
              <div key={mascota.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 relative overflow-hidden">
                  {mascota.foto_url ? (
                    <img src={mascota.foto_url} alt={mascota.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <svg className="w-24 h-24 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{mascota.nombre}</h3>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p><span className="font-medium">Especie:</span> {mascota.especie}</p>
                    <p><span className="font-medium">Raza:</span> {mascota.raza}</p>
                    <p><span className="font-medium">Peso:</span> {Number(mascota.peso_kg)} kg</p>
                    <p><span className="font-medium">Sexo:</span> {mascota.sexo}</p>
                  </div>
                  <button
                    onClick={() => handleEdit(mascota)}
                    className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                  >
                    Ver Detalles / Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingMascota ? 'Editar Mascota' : 'Registrar Nueva Mascota'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <ImageUploader
                currentImage={formData.foto_url}
                onImageUploaded={(url) => setFormData({...formData, foto_url: url})}
                type="mascota"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Microchip</label>
                  <input
                    type="text"
                    value={formData.microchip}
                    onChange={(e) => setFormData({...formData, microchip: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Número de microchip"
                  />
                </div>
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
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingMascota ? 'Actualizar' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}