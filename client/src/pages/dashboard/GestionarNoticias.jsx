import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
// import { useAuth } from '../../context/AuthContext';
import { noticiasApi } from '../../services/api';
import toast from 'react-hot-toast';

const GestionarNoticias = () => {
  const navigate = useNavigate();
  // const { user } = useAuth(); // Comentado hasta que se use
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas');

  const cargarNoticias = useCallback(async () => {
    try {
      setLoading(true);
      const response = await noticiasApi.getUserNoticias();
      setNoticias(response || []);
    } catch (error) {
      console.error('Error cargando noticias:', error);
      toast.error('Error al cargar las noticias');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarNoticias();
  }, [cargarNoticias]);

  const eliminarNoticia = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta noticia?')) {
      return;
    }

    try {
      await noticiasApi.delete(id);
      toast.success('Noticia eliminada exitosamente');
      cargarNoticias(); // Recargar la lista
    } catch (error) {
      console.error('Error eliminando noticia:', error);
      toast.error('Error al eliminar la noticia');
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await noticiasApi.update(id, { estado: nuevoEstado });
      toast.success(`Noticia ${nuevoEstado === 'publicado' ? 'publicada' : 'despublicada'} exitosamente`);
      cargarNoticias(); // Recargar la lista
    } catch (error) {
      console.error('Error cambiando estado:', error);
      toast.error('Error al cambiar el estado');
    }
  };

  const noticiasFiltradas = noticias.filter(noticia => {
    if (filtro === 'todas') return true;
    return noticia.estado === filtro;
  });

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getEstadoBadge = (estado) => {
    const estilos = {
      'publicado': 'bg-green-100 text-green-800',
      'borrador': 'bg-yellow-100 text-yellow-800',
      'archivado': 'bg-gray-100 text-gray-800'
    };
    
    return `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${estilos[estado] || 'bg-gray-100 text-gray-800'}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container-custom py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando noticias...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver al Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Mis Publicaciones</h1>
              <p className="text-gray-600 mt-2">Gestiona tus noticias y artículos</p>
            </div>
            <Link
              to="/dashboard/contenido/crear"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Noticia
            </Link>
          </div>

          {/* Filtros */}
          <div className="mb-6">
            <div className="flex space-x-4">
              {['todas', 'publicado', 'borrador', 'archivado'].map((estado) => (
                <button
                  key={estado}
                  onClick={() => setFiltro(estado)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    filtro === estado
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {estado.charAt(0).toUpperCase() + estado.slice(1)}
                  <span className="ml-2 text-sm">
                    ({estado === 'todas' ? noticias.length : noticias.filter(n => n.estado === estado).length})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Lista de noticias */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {noticiasFiltradas.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay noticias</h3>
                <p className="text-gray-600 mb-4">
                  {filtro === 'todas' ? 'No has creado ninguna noticia aún' : `No hay noticias en estado "${filtro}"`}
                </p>
                <Link
                  to="/dashboard/contenido/crear"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Crear primera noticia
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {noticiasFiltradas.map((noticia, index) => (
                  <motion.div
                    key={noticia.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 mr-3">
                            {noticia.titulo}
                          </h3>
                          <span className={getEstadoBadge(noticia.estado)}>
                            {noticia.estado}
                          </span>
                          {noticia.destacado && (
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              Destacado
                            </span>
                          )}
                        </div>
                        
                        {noticia.resumen && (
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {noticia.resumen}
                          </p>
                        )}
                        
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <span>📅 {formatearFecha(noticia.fecha_publicacion || noticia.created_at)}</span>
                          {noticia.categoria && (
                            <span>🏷️ {noticia.categoria}</span>
                          )}
                          <span>✏️ Actualizado {formatearFecha(noticia.updated_at)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {/* Botón Ver */}
                        <Link
                          to={`/dashboard/contenido/${noticia.id}`}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50 transition-colors"
                          title="Ver detalles"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>

                        {/* Botón Editar */}
                        <Link
                          to={`/dashboard/contenido/editar/${noticia.id}`}
                          className="text-gray-600 hover:text-gray-800 p-2 rounded-md hover:bg-gray-50 transition-colors"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>

                        {/* Botón Estado */}
                        {noticia.estado === 'borrador' ? (
                          <button
                            onClick={() => cambiarEstado(noticia.id, 'publicado')}
                            className="text-green-600 hover:text-green-800 p-2 rounded-md hover:bg-green-50 transition-colors"
                            title="Publicar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                            </svg>
                          </button>
                        ) : (
                          <button
                            onClick={() => cambiarEstado(noticia.id, 'borrador')}
                            className="text-yellow-600 hover:text-yellow-800 p-2 rounded-md hover:bg-yellow-50 transition-colors"
                            title="Despublicar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}

                        {/* Botón Eliminar */}
                        <button
                          onClick={() => eliminarNoticia(noticia.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors"
                          title="Eliminar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GestionarNoticias;
