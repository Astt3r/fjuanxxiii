import { useState, useEffect } from 'react';
import API_CONFIG from '../config/api';

// Hook personalizado para obtener estadísticas de contenido
export const useContentStats = () => {
  const [stats, setStats] = useState({
    noticias: {
      total: 0,
      activas: 0,
      borradores: 0,
      loading: true
    },
    eventos: {
      total: 0,
      activos: 0,
      proximos: 0,
      loading: true
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para cargar estadísticas de noticias
  const loadNoticiasStats = async () => {
    try {
      const response = await fetch(API_CONFIG.getNoticiasURL());
      if (response.ok) {
        const noticiasData = await response.json();
        // La API devuelve { success: true, data: [...] }
        const noticias = noticiasData.data || noticiasData.noticias || noticiasData || [];
        
        const noticiasStats = {
          total: noticias.length,
          activas: noticias.filter(n => n.estado === 'publicado').length,
          borradores: noticias.filter(n => n.estado === 'borrador').length,
          loading: false
        };

        setStats(prev => ({
          ...prev,
          noticias: noticiasStats
        }));
      } else {
        throw new Error('Error al cargar noticias');
      }
    } catch (error) {
      console.error('Error cargando estadísticas de noticias:', error);
      setError(error.message);
      setStats(prev => ({
        ...prev,
        noticias: { ...prev.noticias, loading: false }
      }));
    }
  };

  // Función para cargar estadísticas de eventos
  const loadEventosStats = async () => {
    try {
      const response = await fetch(API_CONFIG.getEventsURL());
      if (response.ok) {
        const data = await response.json();
        
        // Asegurar que siempre trabajamos con un array
        const eventos = Array.isArray(data) ? data : [];
        
        const ahora = new Date();
        const proximos = eventos.filter(evento => {
          const fechaEvento = new Date(evento.fecha_evento);
          return fechaEvento >= ahora;
        });

        const eventosStats = {
          total: eventos.length,
          activos: eventos.filter(e => e.estado === 'activo').length,
          proximos: proximos.length,
          loading: false
        };

        setStats(prev => ({
          ...prev,
          eventos: eventosStats
        }));
      } else {
        throw new Error('Error al cargar eventos');
      }
    } catch (error) {
      console.error('Error cargando estadísticas de eventos:', error);
      setError(error.message);
      setStats(prev => ({
        ...prev,
        eventos: { ...prev.eventos, loading: false }
      }));
    }
  };

  // Función para recargar todas las estadísticas
  const refreshStats = async () => {
    setLoading(true);
    setError(null);
    
    await Promise.all([
      loadNoticiasStats(),
      loadEventosStats()
    ]);
    
    setLoading(false);
  };

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    const loadInitialStats = async () => {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        loadNoticiasStats(),
        loadEventosStats()
      ]);
      
      setLoading(false);
    };

    loadInitialStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refreshStats
  };
};
