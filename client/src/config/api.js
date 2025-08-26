// Configuración centralizada de URLs de API
const API_CONFIG = {
  baseURL: (process.env.REACT_APP_API_URL || (typeof window !== 'undefined' ? `${window.location.origin.replace(/\/$/, '')}/api` : 'http://localhost:5002/api')),
  uploadURL: (process.env.REACT_APP_UPLOAD_URL || (typeof window !== 'undefined' ? `${window.location.origin.replace(/\/$/, '')}/uploads` : 'http://localhost:5002/uploads')),
  
  // Endpoints específicos
  endpoints: {
    auth: '/auth',
    noticias: '/noticias', 
    events: '/events',
    colegios: '/colegios',
    uploads: '/uploads',
    users: '/users'
  },
  
  // Función helper para construir URLs completas
  getEndpoint: (endpoint) => {
    return `${API_CONFIG.baseURL}${API_CONFIG.endpoints[endpoint] || endpoint}`;
  },
  
  // URL completa para eventos
  getEventsURL: () => {
    return `${API_CONFIG.baseURL}/events`;
  },
  
  // URL completa para noticias
  getNoticiasURL: () => {
    return `${API_CONFIG.baseURL}/noticias`;
  }
};

// Exportación por defecto y nombrada para compatibilidad
export default API_CONFIG;
export { API_CONFIG };
