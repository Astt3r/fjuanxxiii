import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  CalendarIcon, 
  ArrowLeftIcon,
  TagIcon,
  ClockIcon,
  UserIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import API_CONFIG from '../config/api';
import { buildMediaUrl, rewriteContentMedia, normalizeImagenesArray } from '../utils/media';

const NoticiaDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarNoticia();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const cargarNoticia = async () => {
    try {
      setLoading(true);
      setError(null);

      // Intentar primero por slug
      let resp = await fetch(`${API_CONFIG.baseURL}/noticias/slug/${id}`);
      if (!resp.ok) {
        // Intentar como id publicada
        resp = await fetch(`${API_CONFIG.baseURL}/noticias/${id}`);
      }
      if (!resp.ok) {
        // Intentar ruta pública por id explícita
        resp = await fetch(`${API_CONFIG.baseURL}/noticias/public/${id}`);
      }

      if (resp.ok) {
        const result = await resp.json();
        let data = result.data || result;
        // Normalizar URLs de imágenes (featured y array)
        data = {
          ...data,
          imagen_url: buildMediaUrl(data.imagen_url),
          imagenes: Array.isArray(data.imagenes) ? normalizeImagenesArray(data.imagenes) : data.imagenes,
          contenido: rewriteContentMedia(data.contenido)
        };
        setNoticia(data);
      } else {
        throw new Error('No se pudo cargar la noticia');
      }
    } catch (e) {
      console.error('Error al cargar noticia:', e);
      setError('No se pudo cargar la noticia');
      toast.error('Error al cargar la noticia');
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    
    try {
      const fechaObj = new Date(fecha);
      if (isNaN(fechaObj.getTime())) {
        return 'Fecha no válida';
      }
      
      return fechaObj.toLocaleDateString('es-CL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha no disponible';
    }
  };

  const calcularTiempoLectura = (contenido) => {
    if (!contenido) return 0;
    const palabras = contenido.replace(/<[^>]*>/g, '').split(' ').length;
    const minutos = Math.ceil(palabras / 200);
    return minutos;
  };

  const compartir = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: noticia.titulo,
          text: noticia.resumen || noticia.titulo,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error al compartir:', error);
      }
    } else {
      // Fallback para navegadores que no soportan Web Share API
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Enlace copiado al portapapeles');
      } catch (error) {
        toast.error('No se pudo copiar el enlace');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="h-64 bg-gray-200"></div>
              <div className="p-8 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !noticia) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Noticia no encontrada'}
            </h1>
            <p className="text-gray-600 mb-6">
              La noticia que buscas no existe o ha sido eliminada.
            </p>
            <button
              onClick={() => navigate('/noticias')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Ver todas las noticias
            </button>
          </motion.div>
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
            {/* Imagen destacada */}
            {/* Imagen principal (si hay varias, tomar la primera) */}
    { (noticia.imagen_url || (Array.isArray(noticia.imagenes) && noticia.imagenes[0])) && (
              <div className="h-64 md:h-96 overflow-hidden bg-gray-100">
                <img 
      src={noticia.imagen_url || noticia.imagenes[0].url} 
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
                
                <button
                  onClick={compartir}
                  className="flex items-center text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <ShareIcon className="h-4 w-4 mr-1" />
                  Compartir
                </button>
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

              {/* Galería secundaria si hay más de una imagen */}
              {Array.isArray(noticia.imagenes) && noticia.imagenes.length > 1 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {noticia.imagenes.slice(1).map(img => (
                    <div key={img.id} className="relative group rounded-lg overflow-hidden border">
                      <img src={img.url} alt={noticia.titulo} className="w-full h-32 object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  ))}
                </div>
              )}

              {/* Contenido */}
              {noticia.contenido && (
                <div
                  className="prose prose-lg max-w-none text-gray-700 leading-relaxed prose-headings:text-gray-900 prose-a:text-blue-600 prose-strong:text-gray-900"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(noticia.contenido || '') }}
                />
              )}

              {/* Si no hay contenido pero hay resumen, mostrar el resumen */}
              {!noticia.contenido && noticia.resumen && (
                <div className="text-gray-700 leading-relaxed space-y-4">
                  <p className="text-lg">{noticia.resumen}</p>
                </div>
              )}

              {/* Mensaje si no hay contenido */}
              {!noticia.contenido && !noticia.resumen && (
                <div className="text-gray-500 italic">
                  <p>Esta noticia no tiene contenido disponible.</p>
                </div>
              )}

              {/* Tags si existen */}
              {noticia.tags && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {(typeof noticia.tags === 'string' ? noticia.tags.split(',') : noticia.tags).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Badge destacada */}
              {noticia.destacada && (
                <div className="mt-8 inline-flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  ✨ Noticia destacada
                </div>
              )}

              {/* Estado de la noticia para admins */}
              {noticia.estado && (
                <div className="mt-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    noticia.estado === 'publicado' ? 'bg-green-100 text-green-800' :
                    noticia.estado === 'borrador' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {noticia.estado.charAt(0).toUpperCase() + noticia.estado.slice(1)}
                  </span>
                </div>
              )}
            </div>
          </motion.article>

          {/* Navegación al final */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-8 text-center"
          >
            <Link 
              to="/noticias"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Ver más noticias
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default NoticiaDetalle;
