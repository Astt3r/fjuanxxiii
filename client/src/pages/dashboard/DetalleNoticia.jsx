import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { noticiasApi } from '../../services/api';
import toast from 'react-hot-toast';

const DetalleNoticia = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargarNoticia = useCallback(async () => {
    try {
      setLoading(true);
      const response = await noticiasApi.getByIdAuth(id);
      setNoticia(response);
    } catch (error) {
      console.error('Error cargando noticia:', error);
      toast.error('Error al cargar la noticia');
      navigate('/dashboard/contenido');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    cargarNoticia();
  }, [cargarNoticia]);

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (estado) => {
    const estilos = {
      'publicado': 'bg-green-100 text-green-800',
      'borrador': 'bg-yellow-100 text-yellow-800',
      'archivado': 'bg-gray-100 text-gray-800'
    };
    
    return `px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${estilos[estado] || 'bg-gray-100 text-gray-800'}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container-custom py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando noticia...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!noticia) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container-custom py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Noticia no encontrada</h1>
            <Link
              to="/dashboard/contenido"
              className="text-blue-600 hover:text-blue-800"
            >
              Volver a mis publicaciones
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header con navegación */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigate('/dashboard/contenido')}
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver a mis publicaciones
              </button>
              
              <div className="flex items-center space-x-3">
                <Link
                  to={`/dashboard/contenido/editar/${noticia.id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </Link>
                
                {noticia.estado === 'publicado' && (
                  <Link
                    to={`/noticias/${noticia.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-1M10 6V4a2 2 0 112 0v2M10 6h4m4 0v10a2 2 0 01-2 2H6" />
                    </svg>
                    Ver publicado
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header del artículo */}
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className={getEstadoBadge(noticia.estado)}>
                    {noticia.estado}
                  </span>
                  {noticia.destacado && (
                    <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      Destacado
                    </span>
                  )}
                  {noticia.categoria && (
                    <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {noticia.categoria}
                    </span>
                  )}
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {noticia.titulo}
              </h1>
              
              {noticia.resumen && (
                <p className="text-xl text-gray-600 mb-4 leading-relaxed">
                  {noticia.resumen}
                </p>
              )}
              
              <div className="flex items-center text-sm text-gray-500 space-x-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    {noticia.fecha_publicacion ? 
                      `Publicado el ${formatearFecha(noticia.fecha_publicacion)}` : 
                      `Creado el ${formatearFecha(noticia.created_at)}`
                    }
                  </span>
                </div>
                
                {noticia.updated_at !== noticia.created_at && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Actualizado el {formatearFecha(noticia.updated_at)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contenido del artículo */}
            <div className="px-8 py-8">
              <div className="prose prose-lg max-w-none">
                <div 
                  className="text-gray-800 leading-relaxed whitespace-pre-wrap"
                  style={{ 
                    lineHeight: '1.7',
                    fontSize: '1.1rem'
                  }}
                >
                  {noticia.contenido}
                </div>
              </div>
            </div>

            {/* Footer con información adicional */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>
                  <strong>ID:</strong> {noticia.id} | <strong>Slug:</strong> {noticia.slug}
                </div>
                
                <div className="flex items-center space-x-4">
                  {noticia.estado === 'publicado' && (
                    <Link
                      to={`/noticias/${noticia.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-1M10 6V4a2 2 0 112 0v2M10 6h4m4 0v10a2 2 0 01-2 2H6" />
                      </svg>
                      Ver en sitio público
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="mt-8 flex justify-center space-x-4">
            <Link
              to={`/dashboard/contenido/editar/${noticia.id}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar Noticia
            </Link>
            
            <button
              onClick={() => navigate('/dashboard/contenido')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Volver a mis publicaciones
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DetalleNoticia;
