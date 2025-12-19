const API_URL = 'http://localhost:5000/api';

// Obtener el token del localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Configuración de headers con token
const getHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Manejo de respuestas
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    if (response.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(data.message || 'Error en la petición');
  }
  
  return data;
};

// AUTH
export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(response);
  },
  
  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/registrar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },
  
  getProfile: async () => {
    const response = await fetch(`${API_URL}/auth/perfil`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

// CLIENTES
export const clientesAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/clientes`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },
  
  getById: async (id) => {
    const response = await fetch(`${API_URL}/clientes/${id}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },
  
  create: async (clienteData) => {
    const response = await fetch(`${API_URL}/clientes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(clienteData)
    });
    return handleResponse(response);
  },
  
  update: async (id, clienteData) => {
    const response = await fetch(`${API_URL}/clientes/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(clienteData)
    });
    return handleResponse(response);
  },
  
  delete: async (id) => {
    const response = await fetch(`${API_URL}/clientes/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  },
  
  search: async (termino) => {
    const response = await fetch(`${API_URL}/clientes/buscar?termino=${termino}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

// MASCOTAS
export const mascotasAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/mascotas`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },
  
  getByCliente: async (clienteId) => {
    const response = await fetch(`${API_URL}/mascotas/cliente/${clienteId}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },
  
  create: async (mascotaData) => {
    const response = await fetch(`${API_URL}/mascotas`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(mascotaData)
    });
    return handleResponse(response);
  },
  
  update: async (id, mascotaData) => {
    const response = await fetch(`${API_URL}/mascotas/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(mascotaData)
    });
    return handleResponse(response);
  }
};

// CITAS
export const citasAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/citas`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },
  
  getByFecha: async (fecha) => {
    const response = await fetch(`${API_URL}/citas/fecha/${fecha}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },
  
  create: async (citaData) => {
    const response = await fetch(`${API_URL}/citas`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(citaData)
    });
    return handleResponse(response);
  },
  
  update: async (id, citaData) => {
    const response = await fetch(`${API_URL}/citas/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(citaData)
    });
    return handleResponse(response);
  },
  
  cancelar: async (id) => {
    const response = await fetch(`${API_URL}/citas/${id}/cancelar`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

// SERVICIOS
export const serviciosAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/servicios`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

export default {
  auth: authAPI,
  clientes: clientesAPI,
  mascotas: mascotasAPI,
  citas: citasAPI,
  servicios: serviciosAPI
};