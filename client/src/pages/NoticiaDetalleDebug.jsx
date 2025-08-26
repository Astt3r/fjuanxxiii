import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CalendarIcon,
  ArrowLeftIcon,
  TagIcon,
  ClockIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const NoticiaDetalleDebug = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('🎯 NoticiaDetalleDebug montado - ID desde useParams:', id);

  const cargarNoticia = useCallback(async () => {
    try {
      console.log('🚀 Iniciando cargarNoticia para ID:', id);
      setLoading(true);
      setError(null);

  const url = `${process.env.REACT_APP_API_URL || 'http://localhost:5003/api'}/noticias/${id}`;
      console.log('📡 Haciendo fetch a:', url);

      const response = await fetch(url);
      console.log('📥 Response recibida:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ JSON parseado:', result);

        // La API devuelve {success: true, data: {...}}
        const noticiaData = result.data || result;
        console.log('📰 Datos de noticia extraídos:', noticiaData);

        if (noticiaData && noticiaData.id) {
          setNoticia(noticiaData);
          console.log('✅ Estado actualizado con noticia:', noticiaData);
        } else {
          throw new Error('Datos de noticia inválidos');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Error HTTP:', response.status, errorText);
        throw new Error(`Error HTTP ${response.status}: ${errorText}`);
      }
    } catch (err) {
      console.error('❌ Error en cargarNoticia:', err);
      setError(`Error al cargar la noticia: ${err.message}`);
      toast.error('Error al cargar la noticia');
    } finally {
      setLoading(false);
      console.log('🏁 cargarNoticia finalizado');
    }
  }, [id]);

  useEffect(() => {
    console.log('🔄 useEffect ejecutado - ID:', id);
    if (id) {
      cargarNoticia();
    } else {
      console.error('❌ No hay ID en useParams');
      setError('ID de noticia no válido');
      setLoading(false);
    }
  }, [id, cargarNoticia]);

  const formatearFecha = (fecha) => {
    console.log('📅 Formateando fecha:', fecha);
    if (!fecha) return 'Fecha no disponible';

    try {
      const fechaObj = new Date(fecha);
      if (isNaN(fechaObj.getTime())) {
        return 'Fecha no válida';
      }

      const fechaFormateada = fechaObj.toLocaleDateString('es-CL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      console.log('✅ Fecha formateada:', fechaFormateada);
      return fechaFormateada;
    } catch (err) {
      console.error('Error al formatear fecha:', err);
      return 'Fecha no disponible';
    }
  };

  const calcularTiempoLectura = (contenido) => {
    console.log(
      '⏱️ Calculando tiempo de lectura para contenido:',
      contenido ? 'presente' : 'ausente'
    );
    if (!contenido) return 0;
    const palabras = contenido.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
    const minutos = Math.ceil(palabras / 200);
    console.log('✅ Tiempo calculado:', minutos, 'minutos');
    return minutos;
  };

  console.log('🎨 Renderizando - loading:', loading, 'error:', error, 'noticia:', !!noticia);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando noticia...</p>
            <p className="text-sm text-gray-400">ID: {id}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !noticia) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Noticia no encontrada'}
            </h1>
            <p className="text-gray-600 mb-6">ID solicitado: {id}</p>
            <button
              onClick={() => navigate('/noticias')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Ver todas las noticias
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navegación */}
      <div className="bg-white border-b pt-20">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/noticias"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver a noticias
          </Link>
        </div>
      </div>

      {/* Contenido */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            {/* Debug info */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-6">
              <h4 className="text-sm font-medium text-yellow-800">Debug Info:</h4>
              <p className="text-xs text-yellow-700">ID: {noticia.id}</p>
              <p className="text-xs text-yellow-700">Título presente: {!!noticia.titulo}</p>
              <p className="text-xs text-yellow-700">Contenido presente: {!!noticia.contenido}</p>
              <p className="text-xs text-yellow-700">Fecha publicación: {noticia.fecha_publicacion}</p>
            </div>

            {/* Imagen destacada */}
            {noticia.imagen_url && (
              <div className="h-64 md:h-96 overflow-hidden bg-gray-100">
                <img
                  src={noticia.imagen_url}
                  alt={noticia.titulo}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Contenido del artículo */}
            <div className="p-6 md:p-8">
              {/* Meta información */}
              <div className="flex flex-wrap items-center justify-between text-sm text-gray-500 mb-6">
                <div className="flex items-center space-x-4 flex-wrap">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {formatearFecha(noticia.fecha_publicacion || noticia.created_at)}
                  </div>
                  {noticia.categoria && (
                    <div className="flex items-center">
                      <TagIcon className="h-4 w-4 mr-1" />
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {noticia.categoria}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {calcularTiempoLectura(noticia.contenido)} min de lectura
                  </div>
                </div>
              </div>

              {/* Título */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {noticia.titulo}
              </h1>

              {/* Resumen */}
              {noticia.resumen && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
                  <p className="text-lg text-gray-700 leading-relaxed font-medium">
                    {noticia.resumen}
                  </p>
                </div>
              )}

              {/* Autor */}
              {noticia.autor && (
                <div className="flex items-center mb-6 text-gray-600">
                  <UserIcon className="h-5 w-5 mr-2" />
                  <span>Por {noticia.autor}</span>
                </div>
              )}

              {/* Contenido */}
              {noticia.contenido && (
                <div
                  className="prose prose-lg max-w-none text-gray-700 leading-relaxed prose-headings:text-gray-900 prose-a:text-blue-600 prose-strong:text-gray-900"
                  dangerouslySetInnerHTML={{ __html: noticia.contenido }}
                />
              )}

              {/* Si no hay contenido */}
              {!noticia.contenido && (
                <div className="text-gray-500 italic">
                  <p>Esta noticia no tiene contenido disponible.</p>
                </div>
              )}
            </div>
          </motion.article>
        </div>
      </div>
    </div>
  );
};

export default NoticiaDetalleDebug;
