import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { noticiasApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
  PhotoIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  LinkIcon,
  EyeIcon,
  CalendarIcon,
  TagIcon,
  BookmarkIcon,
  StarIcon,
  PlusIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListBulletIcon,
  NumberedListIcon,
  CodeBracketIcon,
  ChatBubbleLeftIcon,
  H1Icon,
  H2Icon,
  H3Icon,
  TableCellsIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const EditarNoticia = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [categorias, setCategorias] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState('contenido');
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [galleryLayout, setGalleryLayout] = useState('grid-2');
  const contentRef = useRef(null);
  const fileInputRef = useRef(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    titulo: '',
    slug: '',
    resumen: '',
    contenido: '',
    categoria: 'general',
    estado: 'borrador',
    destacado: false,
    imagenDestacada: '',
    fechaPublicacion: '',
    metaDescripcion: '',
    metaKeywords: '',
    tags: [],
    configuracion: {
      permitirComentarios: true,
      mostrarAutor: true,
      indexarBuscadores: true,
      enviarNotificaciones: false
    }
  });

  // Cargar datos de la noticia
  useEffect(() => {
    if (id) {
      loadNoticia();
    }
  }, [id]);

  const loadNoticia = async () => {
    try {
      setLoadingData(true);
      // Intentar primero endpoint autenticado; si falla por 404 usar público
      let noticia = null;
      try {
        noticia = await noticiasApi.getByIdAuth(id);
      } catch (errAuth) {
        if (errAuth.status === 404) {
          try {
            noticia = await noticiasApi.getById(id);
          } catch (errPublic) {
            throw errPublic;
          }
        } else {
          throw errAuth;
        }
      }

      if (!noticia) throw new Error('No se pudo obtener la noticia');

      setFormData({
        titulo: noticia.titulo || '',
        slug: noticia.slug || '',
        resumen: noticia.resumen || '',
        contenido: noticia.contenido || '',
        categoria: noticia.categoria || 'general',
        estado: noticia.estado || 'borrador',
        destacado: Boolean(noticia.destacado),
        imagenDestacada: noticia.imagen_url || '',
        fechaPublicacion: noticia.fecha_publicacion ? new Date(noticia.fecha_publicacion).toISOString().split('T')[0] : '',
        metaDescripcion: noticia.meta_descripcion || '',
        metaKeywords: noticia.meta_keywords || '',
        tags: noticia.tags ? (typeof noticia.tags === 'string' ? noticia.tags.split(',') : noticia.tags) : [],
        configuracion: {
          permitirComentarios: true,
          mostrarAutor: true,
          indexarBuscadores: true,
          enviarNotificaciones: false
        }
      });
    } catch (error) {
      console.error('Error al cargar la noticia:', error);
      toast.error(error.message || 'Error al cargar la noticia');
      navigate('/dashboard/contenido');
    } finally {
      setLoadingData(false);
    }
  };

  // Cargar categorías disponibles
  useEffect(() => {
    const categoriasDisponibles = [
      'educacion',
      'pastoral',
      'deporte',
      'cultura',
      'tecnologia',
      'comunidad',
      'noticias',
      'eventos',
      'general'
    ];
    setCategorias(categoriasDisponibles);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // (configuracion avanzada removida; si se requiere reactivar, restaurar handleConfiguracionChange)

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      toast.error('El título es obligatorio');
      return;
    }

    try {
      setLoading(true);
      
      const dataToSend = {
        titulo: formData.titulo,
        slug: formData.slug || formData.titulo.toLowerCase().replace(/\s+/g, '-'),
        resumen: formData.resumen,
        contenido: formData.contenido,
        categoria: formData.categoria,
        estado: formData.estado,
        destacado: formData.destacado,
        imagen_url: formData.imagenDestacada,
        fecha_publicacion: formData.fechaPublicacion || new Date().toISOString(),
        meta_descripcion: formData.metaDescripcion,
        meta_keywords: formData.metaKeywords,
        tags: Array.isArray(formData.tags) ? formData.tags.join(',') : formData.tags
      };

  await noticiasApi.update(id, dataToSend);
  toast.success('Noticia actualizada correctamente');
  navigate('/dashboard/contenido');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al actualizar la noticia');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando noticia...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/contenido')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Editar Noticia</h1>
                <p className="text-gray-600">Modifica la información de la noticia</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                {previewMode ? 'Editar' : 'Vista previa'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Actualizando...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Actualizar Noticia
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Información básica */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Información básica</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título *
                    </label>
                    <input
                      type="text"
                      value={formData.titulo}
                      onChange={(e) => handleInputChange('titulo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Ingresa el título de la noticia"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resumen
                    </label>
                    <textarea
                      value={formData.resumen}
                      onChange={(e) => handleInputChange('resumen', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Breve resumen de la noticia"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contenido
                    </label>
                    <textarea
                      value={formData.contenido}
                      onChange={(e) => handleInputChange('contenido', e.target.value)}
                      rows={10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Contenido completo de la noticia"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Columna lateral */}
            <div className="space-y-6">
              {/* Estado y configuración */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Publicación</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <select
                      value={formData.estado}
                      onChange={(e) => handleInputChange('estado', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="borrador">Borrador</option>
                      <option value="publicado">Publicado</option>
                      <option value="archivado">Archivado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría
                    </label>
                    <select
                      value={formData.categoria}
                      onChange={(e) => handleInputChange('categoria', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      {categorias.map(categoria => (
                        <option key={categoria} value={categoria}>
                          {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de publicación
                    </label>
                    <input
                      type="date"
                      value={formData.fechaPublicacion}
                      onChange={(e) => handleInputChange('fechaPublicacion', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="destacado"
                      checked={formData.destacado}
                      onChange={(e) => handleInputChange('destacado', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="destacado" className="ml-2 block text-sm text-gray-700">
                      Noticia destacada
                    </label>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tags</h3>
                
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 text-indigo-600 hover:text-indigo-800"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Agregar tag..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(e.target.value.trim());
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarNoticia;
