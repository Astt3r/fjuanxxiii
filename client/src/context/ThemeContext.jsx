import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Estado inicial
const initialState = {
  theme: 'light', // 'light' | 'dark'
  primaryColor: 'blue', // Para futuras personalizaciones
  fontSize: 'medium', // 'small' | 'medium' | 'large'
  animations: true, // Para usuarios que prefieran menos animaciones
  highContrast: false, // Para accesibilidad
};

// Action types
const THEME_ACTIONS = {
  SET_THEME: 'SET_THEME',
  SET_PRIMARY_COLOR: 'SET_PRIMARY_COLOR',
  SET_FONT_SIZE: 'SET_FONT_SIZE',
  TOGGLE_ANIMATIONS: 'TOGGLE_ANIMATIONS',
  TOGGLE_HIGH_CONTRAST: 'TOGGLE_HIGH_CONTRAST',
  RESET_THEME: 'RESET_THEME',
};

// Reducer
const themeReducer = (state, action) => {
  switch (action.type) {
    case THEME_ACTIONS.SET_THEME:
      return {
        ...state,
        theme: action.payload,
      };

    case THEME_ACTIONS.SET_PRIMARY_COLOR:
      return {
        ...state,
        primaryColor: action.payload,
      };

    case THEME_ACTIONS.SET_FONT_SIZE:
      return {
        ...state,
        fontSize: action.payload,
      };

    case THEME_ACTIONS.TOGGLE_ANIMATIONS:
      return {
        ...state,
        animations: !state.animations,
      };

    case THEME_ACTIONS.TOGGLE_HIGH_CONTRAST:
      return {
        ...state,
        highContrast: !state.highContrast,
      };

    case THEME_ACTIONS.RESET_THEME:
      return initialState;

    default:
      return state;
  }
};

// Context
const ThemeContext = createContext();

// Hook personalizado para usar el contexto
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};

// Provider
export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Cargar configuración del tema desde localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('fjuan-theme-config');
    if (savedTheme) {
      try {
        const themeConfig = JSON.parse(savedTheme);
        Object.keys(themeConfig).forEach(key => {
          if (key === 'theme') {
            dispatch({ type: THEME_ACTIONS.SET_THEME, payload: themeConfig[key] });
          } else if (key === 'primaryColor') {
            dispatch({ type: THEME_ACTIONS.SET_PRIMARY_COLOR, payload: themeConfig[key] });
          } else if (key === 'fontSize') {
            dispatch({ type: THEME_ACTIONS.SET_FONT_SIZE, payload: themeConfig[key] });
          } else if (key === 'animations') {
            if (themeConfig[key] !== state.animations) {
              dispatch({ type: THEME_ACTIONS.TOGGLE_ANIMATIONS });
            }
          } else if (key === 'highContrast') {
            if (themeConfig[key] !== state.highContrast) {
              dispatch({ type: THEME_ACTIONS.TOGGLE_HIGH_CONTRAST });
            }
          }
        });
      } catch (error) {
        console.error('Error cargando configuración del tema:', error);
      }
    } else {
      // Detectar preferencia del sistema para tema oscuro
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        dispatch({ type: THEME_ACTIONS.SET_THEME, payload: 'dark' });
      }
    }
  }, []);

  // Guardar configuración en localStorage cuando cambie el estado
  useEffect(() => {
    localStorage.setItem('fjuan-theme-config', JSON.stringify(state));
  }, [state]);

  // Aplicar clases CSS al documento
  useEffect(() => {
    const root = document.documentElement;
    
    // Aplicar tema
    if (state.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Aplicar tamaño de fuente
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    switch (state.fontSize) {
      case 'small':
        root.classList.add('text-sm');
        break;
      case 'large':
        root.classList.add('text-lg');
        break;
      default:
        root.classList.add('text-base');
    }
    
    // Aplicar alto contraste
    if (state.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Aplicar configuración de animaciones
    if (!state.animations) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [state]);

  // Funciones de acción
  const setTheme = (theme) => {
    dispatch({ type: THEME_ACTIONS.SET_THEME, payload: theme });
  };

  const toggleTheme = () => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    dispatch({ type: THEME_ACTIONS.SET_THEME, payload: newTheme });
  };

  const setPrimaryColor = (color) => {
    dispatch({ type: THEME_ACTIONS.SET_PRIMARY_COLOR, payload: color });
  };

  const setFontSize = (size) => {
    dispatch({ type: THEME_ACTIONS.SET_FONT_SIZE, payload: size });
  };

  const toggleAnimations = () => {
    dispatch({ type: THEME_ACTIONS.TOGGLE_ANIMATIONS });
  };

  const toggleHighContrast = () => {
    dispatch({ type: THEME_ACTIONS.TOGGLE_HIGH_CONTRAST });
  };

  const resetTheme = () => {
    dispatch({ type: THEME_ACTIONS.RESET_THEME });
  };

  // Función para obtener clases CSS dinámicas
  const getThemeClasses = () => {
    const classes = [];
    
    if (state.theme === 'dark') {
      classes.push('dark');
    }
    
    if (state.highContrast) {
      classes.push('high-contrast');
    }
    
    if (!state.animations) {
      classes.push('reduce-motion');
    }
    
    return classes.join(' ');
  };

  // Función para verificar si el usuario prefiere modo oscuro
  const prefersDarkMode = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  // Función para verificar si el usuario prefiere movimiento reducido
  const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  const value = {
    // Estado
    theme: state.theme,
    primaryColor: state.primaryColor,
    fontSize: state.fontSize,
    animations: state.animations,
    highContrast: state.highContrast,
    
    // Acciones
    setTheme,
    toggleTheme,
    setPrimaryColor,
    setFontSize,
    toggleAnimations,
    toggleHighContrast,
    resetTheme,
    
    // Utilidades
    getThemeClasses,
    prefersDarkMode,
    prefersReducedMotion,
    isDark: state.theme === 'dark',
    isLight: state.theme === 'light',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
