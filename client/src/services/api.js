import axios from 'axios';
import { buildMediaUrl } from '../utils/media';

// Configuración base de axios
// Fallback coherente con puerto por defecto del servidor (5003) si no se define REACT_APP_API_URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';

// Crear instancia de axios (no fijamos Content-Type por defecto para permitir FormData dinámico)
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {},
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const errorMessage = error.response?.data?.message || error.message || 'Error de conexión';
    
    // Si el token ha expirado o es inválido, limpiar localStorage
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Opcional: redirigir al login si no estamos ya ahí
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Crear un objeto de error consistente
    const customError = new Error(errorMessage);
    customError.status = error.response?.status;
    customError.response = error.response;
    
    return Promise.reject(customError);
  }
);

// Función para crear instancia de axios con FormData
export const createFormDataApi = () => {
  const formDataApi = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // Mayor timeout para subida de archivos
    headers: {}, // dejar que el navegador establezca boundary
  });

  // Agregar token de autenticación
  formDataApi.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor para respuestas
  formDataApi.interceptors.response.use(
    (response) => response.data,
    (error) => {
      const errorMessage = error.response?.data?.message || error.message || 'Error de conexión';
      const customError = new Error(errorMessage);
      customError.status = error.response?.status;
      customError.response = error.response;
      return Promise.reject(customError);
    }
  );

  return formDataApi;
};

// Funciones de utilidad para APIs
export const apiUtils = {
  // Función para construir query params
  buildQueryParams: (params) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        if (Array.isArray(params[key])) {
          params[key].forEach(value => searchParams.append(key, value));
        } else {
          searchParams.append(key, params[key]);
        }
      }
    });
    return searchParams.toString();
  },

  // Función para manejar errores de forma consistente
  handleApiError: (error) => {
    console.error('API Error:', error);
    
    if (error.status === 401) {
      return 'No tienes autorización para realizar esta acción';
    } else if (error.status === 403) {
      return 'No tienes permisos para acceder a este recurso';
    } else if (error.status === 404) {
      return 'El recurso solicitado no fue encontrado';
    } else if (error.status === 429) {
      return error.response?.data?.error || 'Demasiadas solicitudes. Espera un momento antes de reintentar';
    } else if (error.status === 422) {
      return error.response?.data?.errors ? 
        Object.values(error.response.data.errors).flat().join(', ') :
        'Los datos enviados no son válidos';
    } else if (error.status >= 500) {
      return 'Error interno del servidor. Por favor, intenta más tarde';
    } else if (error.message === 'Network Error') {
      return 'Error de conexión. Verifica tu conexión a internet';
    }
    
    return error.message || 'Ha ocurrido un error inesperado';
  },

  // Función para validar respuesta exitosa
  isSuccessResponse: (response) => {
    return response && response.success !== false;
  },

  // Función para extraer datos de respuesta
  extractData: (response) => {
    // Si la respuesta tiene una estructura success/data
    if (response?.data?.success && response?.data?.data) {
      return response.data.data;
    }
    
    // Si la respuesta solo tiene data
    if (response?.data) {
      return response.data;
    }
    
    // Si no hay estructura específica, devolver la respuesta tal como está
    return response;
  },

  // Función para crear headers con token
  getAuthHeaders: () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};

// Configuración de endpoints
export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  users: {
    list: '/users',
    profile: '/users/profile',
    update: '/users/profile',
    changePassword: '/users/change-password',
    avatar: '/users/avatar',
  },
  noticias: {
    list: '/noticias',
    create: '/noticias',
    detail: (id) => `/noticias/${id}`,
  detailBySlug: (slug) => `/noticias/slug/${slug}`,
  public: (id) => `/noticias/public/${id}`,
    detailAuth: (id) => `/noticias/detalle/${id}`,
    update: (id) => `/noticias/${id}`,
    delete: (id) => `/noticias/${id}`,
    userNoticias: '/noticias/mis-noticias/todas',
    publish: (id) => `/noticias/${id}/publish`,
    featured: '/noticias/featured',
    categories: '/noticias/categories',
  },
  colegios: {
    list: '/schools',
    create: '/schools',
    detail: (id) => `/schools/${id}`,
    update: (id) => `/schools/${id}`,
    delete: (id) => `/schools/${id}`,
    featured: '/schools/featured',
  },
  content: {
    carousel: '/content/carousel',
    protocols: '/content/protocols',
    testimonials: '/content/testimonials',
    events: '/content/events',
  },
  uploads: {
    image: '/uploads/image',
    document: '/uploads/document',
    avatar: '/uploads/avatar',
  },
  dashboard: {
    stats: '/dashboard/stats',
    recentActivity: '/dashboard/recent-activity',
  },
};

// Funciones específicas para colegios
export const colegiosApi = {
  // Obtener todos los colegios
  getAll: async (params = {}) => {
    try {
      const queryString = apiUtils.buildQueryParams(params);
      const url = queryString ? `${endpoints.colegios.list}?${queryString}` : endpoints.colegios.list;
      const response = await api.get(url);
      return apiUtils.extractData(response);
    } catch (error) {
      throw new Error(apiUtils.handleApiError(error));
    }
  },

  // Obtener colegio por ID
  getById: async (id) => {
    try {
      const response = await api.get(endpoints.colegios.detail(id));
      return apiUtils.extractData(response);
    } catch (error) {
      throw new Error(apiUtils.handleApiError(error));
    }
  },

  // Obtener colegios destacados
  getFeatured: async () => {
    try {
      const response = await api.get(endpoints.colegios.featured);
      return apiUtils.extractData(response);
    } catch (error) {
      throw new Error(apiUtils.handleApiError(error));
    }
  },

  // Crear nuevo colegio (admin)
  create: async (data) => {
    try {
      const response = await api.post(endpoints.colegios.create, data);
      return apiUtils.extractData(response);
    } catch (error) {
      throw new Error(apiUtils.handleApiError(error));
    }
  },

  // Actualizar colegio (admin)
  update: async (id, data) => {
    try {
      const response = await api.put(endpoints.colegios.update(id), data);
      return apiUtils.extractData(response);
    } catch (error) {
      throw new Error(apiUtils.handleApiError(error));
    }
  },

  // Eliminar colegio (admin)
  delete: async (id) => {
    try {
      const response = await api.delete(endpoints.colegios.delete(id));
      return apiUtils.extractData(response);
    } catch (error) {
      throw new Error(apiUtils.handleApiError(error));
    }
  }
};

// Funciones específicas para noticias
export const noticiasApi = {
  // Obtener todas las noticias (públicas)
  getAll: async (params = {}) => {
    try {
      const queryString = apiUtils.buildQueryParams(params);
      const url = queryString ? `${endpoints.noticias.list}?${queryString}` : endpoints.noticias.list;
      const response = await api.get(url);
      const data = apiUtils.extractData(response);
      if(Array.isArray(data)) return data.map(n => ({
        ...n,
        imagen_url: buildMediaUrl(n.imagen_url),
        imagenes: Array.isArray(n.imagenes) ? n.imagenes.map(img => ({...img, url: buildMediaUrl(img.url)})) : n.imagenes
      }));
      return data;
    } catch (error) {
      throw new Error(apiUtils.handleApiError(error));
    }
  },

  // Obtener todas las noticias del usuario (incluye borradores)
  getUserNoticias: async () => {
    try {
      const response = await api.get(endpoints.noticias.userNoticias);
  const data = apiUtils.extractData(response);
  if(Array.isArray(data)) return data.map(n => ({ ...n, imagen_url: buildMediaUrl(n.imagen_url) }));
  return data;
    } catch (error) {
      throw new Error(apiUtils.handleApiError(error));
    }
  },

  // Obtener noticia por ID (pública)
  getById: async (id) => {
    try {
      const response = await api.get(endpoints.noticias.detail(id));
  const n = apiUtils.extractData(response);
  if(!n) return n;
  return { ...n, imagen_url: buildMediaUrl(n.imagen_url), imagenes: Array.isArray(n.imagenes) ? n.imagenes.map(img => ({...img, url: buildMediaUrl(img.url)})) : n.imagenes };
    } catch (error) {
      throw new Error(apiUtils.handleApiError(error));
    }
  },

  // Obtener noticia por ID con autenticación (incluye borradores)
  getByIdAuth: async (id) => {
    try {
      const response = await api.get(endpoints.noticias.detailAuth(id));
  const n = apiUtils.extractData(response);
  if(!n) return n;
  return { ...n, imagen_url: buildMediaUrl(n.imagen_url), imagenes: Array.isArray(n.imagenes) ? n.imagenes.map(img => ({...img, url: buildMediaUrl(img.url)})) : n.imagenes };
    } catch (error) {
      throw new Error(apiUtils.handleApiError(error));
    }
  },

  // Obtener noticias destacadas
  getFeatured: async () => {
    try {
      const response = await api.get(endpoints.noticias.featured);
  const data = apiUtils.extractData(response);
  if(Array.isArray(data)) return data.map(n => ({ ...n, imagen_url: buildMediaUrl(n.imagen_url) }));
  return data;
    } catch (error) {
      throw new Error(apiUtils.handleApiError(error));
    }
  },

  // Crear nueva noticia
  create: async (data) => {
    try {
      const response = await api.post(endpoints.noticias.create, data);
      return apiUtils.extractData(response);
    } catch (error) {
      throw new Error(apiUtils.handleApiError(error));
    }
  },

  // Actualizar noticia
  update: async (id, data) => {
    try {
      const response = await api.put(endpoints.noticias.update(id), data);
      return apiUtils.extractData(response);
    } catch (error) {
      throw new Error(apiUtils.handleApiError(error));
    }
  },

  // Eliminar noticia
  delete: async (id) => {
    try {
      const response = await api.delete(endpoints.noticias.delete(id));
      return apiUtils.extractData(response);
    } catch (error) {
      throw new Error(apiUtils.handleApiError(error));
    }
  },

  // Publicar/despublicar noticia
  togglePublish: async (id) => {
    try {
      const response = await api.put(endpoints.noticias.publish(id));
      return apiUtils.extractData(response);
    } catch (error) {
      throw new Error(apiUtils.handleApiError(error));
    }
  },

  // Obtener categorías de noticias
  getCategories: async () => {
    try {
      const response = await api.get(endpoints.noticias.categories);
      return apiUtils.extractData(response);
    } catch (error) {
      throw new Error(apiUtils.handleApiError(error));
    }
  },

  // Subir múltiples imágenes a una noticia existente
  uploadImages: async (id, files) => {
    try {
      const fd = new FormData();
  files.forEach(f => fd.append('imagenes', f));
  // Log removido
  const response = await api.post(`/noticias/${id}/imagenes`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      return apiUtils.extractData(response);
    } catch (error) {
      throw new Error(apiUtils.handleApiError(error));
    }
  },

  // Obtener listado de imágenes de una noticia
  getImages: async (id) => {
    try {
      const response = await api.get(`/noticias/${id}/imagenes`);
      return apiUtils.extractData(response);
    } catch (error) {
      throw new Error(apiUtils.handleApiError(error));
    }
  },

  // Sincronizar imágenes embebidas en el contenido
  syncImages: async (id) => {
    try {
      const response = await api.post(`/noticias/${id}/sincronizar-imagenes`);
      return apiUtils.extractData(response);
    } catch (error) {
      throw new Error(apiUtils.handleApiError(error));
    }
  },

  // Establecer imagen destacada (imgId debe ser el id numérico de la fila en noticias_imagenes)
  setFeatured: async (id, imgId) => {
    try {
      const response = await api.put(`/noticias/${id}/imagen-destacada/${imgId}`);
      return apiUtils.extractData(response);
    } catch (error) {
      throw new Error(apiUtils.handleApiError(error));
    }
  },

  // Reordenar imágenes
  reorderImages: async (id, orden) => {
    try {
      const response = await api.put(`/noticias/${id}/imagenes/orden`, { orden });
      return apiUtils.extractData(response);
    } catch (error) {
      throw new Error(apiUtils.handleApiError(error));
    }
  }
};

export default api;
