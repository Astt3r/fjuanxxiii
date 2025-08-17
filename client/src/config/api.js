// Configuración centralizada de URLs de API
const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5003/api',
  uploadURL: process.env.REACT_APP_UPLOAD_URL || 'http://localhost:5003/uploads',
  
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
