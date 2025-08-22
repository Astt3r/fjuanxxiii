import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';
import { toast } from 'react-hot-toast';

// Estado inicial
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      };

    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Context
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Cargar usuario al inicializar la aplicación
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          dispatch({ type: AUTH_ACTIONS.LOAD_USER_START });
          const userData = await authService.getCurrentUser();
          dispatch({ 
            type: AUTH_ACTIONS.LOAD_USER_SUCCESS, 
            payload: userData 
          });
        } catch (error) {
          console.error('Error cargando usuario:', error);
          dispatch({ 
            type: AUTH_ACTIONS.LOAD_USER_FAILURE, 
            payload: error.message 
          });
        }
      } else {
        dispatch({ 
          type: AUTH_ACTIONS.LOAD_USER_FAILURE, 
          payload: 'No hay token' 
        });
      }
    };

    loadUser();
    // Heartbeat para mantener la sesión (cada 4 minutos) si el token sigue vigente
    const interval = setInterval(async () => {
      const token = localStorage.getItem('token');
      if(!token) return;
      try {
        await authService.getCurrentUser(); // refresca último acceso server-side (si backend se ajusta en futuro)
      } catch(_){ /* silencioso */ }
    }, 240000); // 4 min
    return () => clearInterval(interval);
  }, []);

  // Función de login
  const login = async (credentials) => {
    try {
      console.log('AuthContext: Iniciando login con:', credentials);
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      
      const response = await authService.login(credentials);
      console.log('AuthContext: Respuesta del login:', response);
      
      dispatch({ 
        type: AUTH_ACTIONS.LOGIN_SUCCESS, 
        payload: response 
      });
      
      console.log('AuthContext: Login exitoso, usuario:', response.user);
      toast.success(`¡Bienvenido, ${response.user.nombre}!`);
      return response;
    } catch (error) {
      console.error('AuthContext: Error en login:', error);
      dispatch({ 
        type: AUTH_ACTIONS.LOGIN_FAILURE, 
        payload: error.message 
      });
      toast.error(error.message || 'Error al iniciar sesión');
      throw error;
    }
  };

  // Función de registro
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.REGISTER_START });
      const response = await authService.register(userData);
      
      dispatch({ 
        type: AUTH_ACTIONS.REGISTER_SUCCESS, 
        payload: response 
      });
      
      toast.success('¡Registro exitoso! Bienvenido a la Fundación Juan XXIII');
      return response;
    } catch (error) {
      dispatch({ 
        type: AUTH_ACTIONS.REGISTER_FAILURE, 
        payload: error.message 
      });
      toast.error(error.message || 'Error al registrarse');
      throw error;
    }
  };

  // Función de logout
  const logout = () => {
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    toast.success('Sesión cerrada correctamente');
  };

  // Función para actualizar datos del usuario
  const updateUser = (userData) => {
    dispatch({ 
      type: AUTH_ACTIONS.UPDATE_USER, 
      payload: userData 
    });
  };

  // Función para limpiar errores
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Función para verificar roles
  const hasRole = (role) => {
    return state.user?.rol === role;
  };

  // Función para verificar permisos
  const hasPermission = (permission) => {
    if (!state.user) return false;
    
    // Los administradores tienen todos los permisos
    if (state.user.rol === 'admin') return true;
    
    // Los editores pueden crear y editar contenido
    if (state.user.rol === 'editor' && 
        ['create_content', 'edit_content'].includes(permission)) {
      return true;
    }
    
    // Los usuarios pueden ver contenido
    if (permission === 'view_content') return true;
    
    return false;
  };

  const value = {
    // Estado
    user: state.user,
    token: state.token,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    error: state.error,
    
    // Acciones
    login,
    register,
    logout,
    updateUser,
    clearError,
    hasRole,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
