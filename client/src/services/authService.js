import api, { endpoints, apiUtils } from './api';

export const authService = {
  // Iniciar sesión
  login: async (credentials) => {
    try {
      console.log('authService: Enviando login con:', credentials);
      const response = await api.post(endpoints.auth.login, credentials);
      console.log('authService: Respuesta cruda del servidor:', response);
      
      const data = apiUtils.extractData(response);
      console.log('authService: Datos extraídos:', data);
      
      return data;
    } catch (error) {
      console.error('authService: Error en login:', error);
      console.error('authService: Error response:', error.response);
      throw new Error(apiUtils.handleApiError(error));
    }
  },

  // Registrar usuario
  register: async (userData) => {
    try {
      const response = await api.post(endpoints.auth.register, userData);
      return apiUtils.extractData(response);
    } catch (error) {
      throw new Error(apiUtils.handleApiError(error));
    }
  },

  // Cerrar sesión
  logout: async () => {
    try {
      await api.post(endpoints.auth.logout);
      localStorage.removeItem('token');
    } catch (error) {
      // Incluso si falla la petición, limpiamos el token local
      localStorage.removeItem('token');
      console.error('Error al cerrar sesión:', error);
    }
  },

  // Obtener datos del usuario actual
  getCurrentUser: async () => {
    try {
      const response = await api.get(endpoints.auth.me);
      return apiUtils.extractData(response);
    } catch (error) {
      throw new Error(apiUtils.handleApiError(error));
    }
  },

  // Renovar token
  refreshToken: async () => {
    try {
      const response = await api.post(endpoints.auth.refresh);
      const data = apiUtils.extractData(response);
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      return data;
    } catch (error) {
      localStorage.removeItem('token');
      throw new Error(apiUtils.handleApiError(error));
    }
  },

  // Solicitar recuperación de contraseña
  forgotPassword: async (email) => {
    try {
      const response = await api.post(endpoints.auth.forgotPassword, { email });
      return apiUtils.extractData(response);
    } catch (error) {
      throw new Error(apiUtils.handleApiError(error));
    }
  },

  // Restablecer contraseña
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post(endpoints.auth.resetPassword, {
        token,
        password: newPassword,
      });
      return apiUtils.extractData(response);
    } catch (error) {
      throw new Error(apiUtils.handleApiError(error));
    }
  },

  // Verificar si el token es válido
  isTokenValid: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      // Decodificar el token JWT para verificar la expiración
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  },

  // Obtener información del token
  getTokenInfo: () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        userId: payload.sub || payload.id,
        email: payload.email,
        role: payload.role,
        exp: payload.exp,
        iat: payload.iat,
      };
    } catch (error) {
      return null;
    }
  },
};
