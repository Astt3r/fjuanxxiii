import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { noticiasApi } from '../../services/api';
import toast from 'react-hot-toast';
import RichTextEditor from '../../components/common/RichTextEditor';
import {
  PhotoIcon,
  EyeIcon,
  PlusIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';

const CrearNoticiaAvanzada = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  // const { user } = useAuth(); // user reservado para futura metadata
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  // Eliminado activeTab no usado
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const contentRef = useRef(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    titulo: '',
    subtitulo: '',
    resumen: '',
    contenido: '',
    categoria: '',
    tags: [],
    destacado: false,
    estado: 'borrador',
    fechaPublicacion: new Date().toISOString().split('T')[0],
    imagenPrincipal: '',
  galeria: [], // [{ tempId, file, previewUrl, serverUrl? }]
    metaDescripcion: '',
    metaKeywords: '',
    autorPersonalizado: '',
    configuracionVisual: {
      tema: 'default',
      tipografia: 'Inter',
      espaciado: 'normal',
      anchuraContenido: 'normal'
    },
    seo: {
      slug: '',
      metaTitulo: '',
      metaDescripcion: '',
      imagenSocial: ''
    },
    planificacion: {
      fechaPublicacion: '',
      audiencia: 'publico',
      notificaciones: true
    },
    multimedia: {
      videos: [],
      audios: [],
      documentos: []
    }
  });

  // Bloques de contenido disponibles
  /* const contentBlocks = [
    { type: 'paragraph', icon: DocumentDuplicateIcon, label: 'Párrafo' },
    { type: 'heading', icon: 'H1', label: 'Título' },
    { type: 'image', icon: PhotoIcon, label: 'Imagen' },
    { type: 'gallery', icon: PhotoIcon, label: 'Galería' },
    { type: 'video', icon: VideoCameraIcon, label: 'Video' },
    { type: 'quote', icon: 'Q', label: 'Cita' },
    { type: 'list', icon: 'UL', label: 'Lista' },
    { type: 'separator', icon: '—', label: 'Separador' }
  ]; */

  // Layouts de galería
  /* const galleryLayouts = [
    { id: 'grid-2', name: 'Dos columnas', cols: 2 },
    { id: 'grid-3', name: 'Tres columnas', cols: 3 },
    { id: 'masonry', name: 'Mosaico', cols: 'masonry' },
    { id: 'carousel', name: 'Carrusel', cols: 'carousel' }
  ]; */

  // Temas visuales
  /* const temas = [
    { id: 'default', name: 'Por defecto', color: '#1e40af' },
    { id: 'clean', name: 'Limpio', color: '#6b7280' },
    { id: 'modern', name: 'Moderno', color: '#059669' },
    { id: 'elegant', name: 'Elegante', color: '#7c3aed' },
    { id: 'catholic', name: 'Católico', color: '#dc2626' }
  ]; */

  // Cargar datos iniciales
  useEffect(() => {
    if (id) {
      setIsEditing(true);
      loadNoticia();
    }
    loadCategorias();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadCategorias = async () => {
    try {
      const response = await noticiasApi.getCategorias();
      setCategorias(response.data || []);
    } catch (error) {
      setCategorias([
        { id: 1, nombre: 'Noticias Generales' },
        { id: 2, nombre: 'Eventos' },
        { id: 3, nombre: 'Educación' },
        { id: 4, nombre: 'Pastoral' }
      ]);
    }
  };

  const loadNoticia = async () => {
    try {
      setLoading(true);
      const response = await noticiasApi.getNoticia(id);
      if (response.data) {
        setFormData(prev => ({
          ...prev,
          ...response.data,
          fechaPublicacion: response.data.fechaPublicacion?.split('T')[0] || new Date().toISOString().split('T')[0]
        }));
      }
    } catch (error) {
      toast.error('Error al cargar la noticia');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNestedChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  // Generar slug automático
  const generateSlug = (titulo) => {
    return titulo
      .toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Auto-generar slug
  useEffect(() => {
    if (formData.titulo && !isEditing) {
      const slug = generateSlug(formData.titulo);
      setFormData(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          slug: slug
        }
      }));
    }
  }, [formData.titulo, isEditing]);

  // Manejar tags
  const addTag = (e) => {
    e.preventDefault();
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Manejar upload de imágenes
  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
  const newItems = files.map(f => ({ tempId: Date.now()+Math.random(), file: f, previewUrl: URL.createObjectURL(f), url: '' }));
    setFormData(prev => ({ ...prev, galeria: [...prev.galeria, ...newItems] }));
  };

  // Manejar imagen principal
  const handleImagenPrincipal = async (event) => {
    const file = event.target.files?.[0];
    if(!file) return;
    setFormData(prev => ({ ...prev, imagenPrincipal: URL.createObjectURL(file), imagenPrincipalFile: file }));
  };

  // Guardar noticia
  const handleSubmit = async (estado = 'borrador') => {
    if (!formData.titulo.trim() || !formData.contenido.trim()) {
      toast.error('El título y contenido son obligatorios');
      return;
    }

    setLoading(true);
    try {
      // Preparar datos solo con los campos que la API espera
      const dataToSend = {
        titulo: formData.titulo.trim(),
        slug: formData.seo?.slug || formData.titulo.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-'),
        resumen: formData.resumen?.trim() || null,
        contenido: formData.contenido.trim(),
        categoria: formData.categoria || null,
        estado,
        destacado: formData.destacado || false,
        fecha_publicacion: estado === 'publicado' ? new Date().toISOString() : null
      };

      let noticiaId = id;
      if (isEditing) {
        await noticiasApi.update(id, dataToSend);
      } else {
        const created = await noticiasApi.create(dataToSend);
        noticiaId = created.id;
      }

      // Subir imágenes de galería si existen archivos locales
      const galleryFiles = formData.galeria.filter(g => g.file).map(g => g.file);
      if (galleryFiles.length) {
        try {
          await noticiasApi.uploadImages(noticiaId, galleryFiles);
        } catch (e) {
          toast.error('Error subiendo imágenes de galería: ' + e.message);
        }
      }

      // Imagen principal: subir y marcar como destacada usando el id de la imagen devuelta
      if (formData.imagenPrincipalFile && !isEditing) {
        try {
          const up = await noticiasApi.uploadImages(noticiaId, [formData.imagenPrincipalFile]);
          const subida = up?.imagenes?.slice(-1)[0];
          if (subida?.id) {
            await noticiasApi.setFeatured(noticiaId, subida.id);
          } else if (subida?.url) {
            // Fallback temporal si backend aún acepta url (deprecar pronto)
            await noticiasApi.setFeatured(noticiaId, subida.url);
          }
        } catch(e){ toast.error('Error subiendo imagen principal: '+e.message); }
      }

      // Sincronizar imágenes embebidas en el HTML
      try { await noticiasApi.syncImages(noticiaId); } catch(_){}

      toast.success(isEditing ? 'Noticia actualizada' : 'Noticia creada');
      navigate('/dashboard/contenido');
    } catch (error) {
      console.error('Error detallado:', error);
      toast.error('Error al guardar la noticia: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del editor */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/contenido')}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Volver
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Editar Noticia' : 'Editor de Noticias Avanzado'}
              </h1>
              <div className="text-sm text-gray-500">
                Estado: {formData.estado === 'publicado' ? 'Publicado' : 'Borrador'}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Vista previa */}
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm border rounded-md transition-colors ${
                  previewMode 
                    ? 'bg-primary-50 border-primary-300 text-primary-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <EyeIcon className="h-4 w-4" />
                <span>Vista previa</span>
              </button>
              
              {/* Responsive preview */}
              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <button className="p-2 hover:bg-gray-50">
                  <ComputerDesktopIcon className="h-4 w-4" />
                </button>
                <button className="p-2 hover:bg-gray-50 border-l border-gray-300">
                  <DevicePhoneMobileIcon className="h-4 w-4" />
                </button>
              </div>
              
              {/* Guardar borrador */}
              <button
                onClick={() => handleSubmit('borrador')}
                disabled={loading}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Guardar borrador
              </button>
              
              {/* Publicar */}
              <button
                onClick={() => handleSubmit('publicado')}
                disabled={loading}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Publicar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel principal de edición */}
          <div className="lg:col-span-3 space-y-6">
            {/* Título y subtítulo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="space-y-4">
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  placeholder="Escribe el título aquí..."
                  className="w-full text-3xl font-bold border-none outline-none placeholder-gray-400 resize-none"
                  style={{ minHeight: '3rem' }}
                />
                <input
                  type="text"
                  name="subtitulo"
                  value={formData.subtitulo}
                  onChange={handleInputChange}
                  placeholder="Subtítulo (opcional)"
                  className="w-full text-xl text-gray-600 border-none outline-none placeholder-gray-400"
                />
                <hr className="border-gray-200" />
                <textarea
                  name="resumen"
                  value={formData.resumen}
                  onChange={handleInputChange}
                  placeholder="Escribe un resumen breve de la noticia..."
                  className="w-full text-gray-700 border-none outline-none placeholder-gray-400 resize-none"
                  rows="3"
                />
              </div>
            </motion.div>

            {/* Editor de contenido avanzado */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contenido</h3>
                <RichTextEditor
                  value={formData.contenido}
                  onChange={(content) => setFormData(prev => ({ ...prev, contenido: content }))}
                  onImageUpload={async (file) => {
                    // Asegurar noticia (borrador) existe antes de subir
                    try {
                      let noticiaId = id;
                      if(!noticiaId){
                        if(!formData.titulo.trim()) throw new Error('Define un título antes de subir imágenes');
                        const draft = await noticiasApi.create({ titulo: formData.titulo, slug: formData.titulo.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-'), contenido: formData.contenido || '<p></p>', estado: 'borrador' });
                        noticiaId = draft.id;
                        // Guardar id & slug real (por si se auto-ajustó) en el estado para siguientes operaciones
                        setFormData(prev => ({
                          ...prev,
                          seo: { ...prev.seo, slug: draft.slug || prev.seo.slug },
                          noticiaIdDraft: noticiaId
                        }));
                      }
                      const up = await noticiasApi.uploadImages(noticiaId, [file]);
                      const img = up?.imagenes?.slice(-1)[0];
                      if(!img?.url) throw new Error('Subida sin URL');
                      return { url: img.url };
                    } catch(e){ toast.error(e.message || 'Error subiendo imagen'); throw e; }
                  }}
                  placeholder="Comienza a escribir el contenido de tu noticia..."
                  minHeight="500px"
                />
              </div>
            </motion.div>

            {/* Galería de imágenes */}
            {formData.galeria.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">Galería de imágenes</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.galeria.map((image, index) => (
                    <div key={image.tempId || image.id || image.filename || index} className="relative group">
                      <img
                        src={image.previewUrl || image.url}
                        alt={image.alt || image.name || 'imagen'}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            galeria: prev.galeria.filter((_, i) => i !== index)
                          }));
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Configuración de publicación */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">Publicación</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="borrador">Borrador</option>
                    <option value="revision">En revisión</option>
                    <option value="publicado">Publicado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de publicación
                  </label>
                  <input
                    type="date"
                    name="fechaPublicacion"
                    value={formData.fechaPublicacion}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="destacado"
                    checked={formData.destacado}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Artículo destacado
                  </label>
                </div>
              </div>
            </motion.div>

            {/* Tags */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tags</h3>
              
              <form onSubmit={addTag} className="mb-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    placeholder="Agregar tag..."
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              </form>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 text-sm bg-primary-100 text-primary-800 rounded-md"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-primary-600"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Imagen destacada */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">Imagen destacada</h3>
              
              {/* Input para imagen principal */}
              <input
                type="file"
                accept="image/*"
                onChange={handleImagenPrincipal}
                className="hidden"
                id="imagen-principal"
              />
              
              <button
                onClick={() => document.getElementById('imagen-principal')?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-400 transition-colors text-center mb-4"
              >
                <PhotoIcon className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Seleccionar imagen principal
                </p>
              </button>

              {formData.imagenPrincipal && (
                <div className="mb-4">
                  <img
                    src={formData.imagenPrincipal}
                    alt="Imagen principal"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, imagenPrincipal: '' }))}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Eliminar imagen principal
                  </button>
                </div>
              )}

              {/* Galería de imágenes */}
              <h4 className="text-md font-medium text-gray-800 mb-3">Galería de imágenes</h4>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary-400 transition-colors text-center"
              >
                <ArrowUpTrayIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Haz clic para subir imágenes adicionales
                </p>
              </button>

              {/* Galería preview */}
              {formData.galeria.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.galeria.map((imagen, idx) => (
                    <div key={imagen.tempId || imagen.id || imagen.filename || `g-${idx}`} className="relative">
                      <img
                        src={imagen.previewUrl || imagen.url}
                        alt={imagen.alt || imagen.original_name || 'imagen'}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          galeria: prev.galeria.filter((_, i) => i !== idx)
                        }))}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* SEO */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">SEO</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug URL
                  </label>
                  <input
                    type="text"
                    value={formData.seo.slug}
                    onChange={(e) => handleNestedChange('seo', 'slug', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta descripción
                  </label>
                  <textarea
                    value={formData.seo.metaDescripcion}
                    onChange={(e) => handleNestedChange('seo', 'metaDescripcion', e.target.value)}
                    rows="3"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Barra de botones de acción fija */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {isEditing ? 'Editando noticia' : 'Crear nueva noticia'}
              </span>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Estado:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  formData.estado === 'publicado' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {formData.estado === 'publicado' ? 'Publicado' : 'Borrador'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Vista previa */}
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`flex items-center space-x-2 px-4 py-2 text-sm border rounded-md transition-colors ${
                  previewMode 
                    ? 'bg-primary-50 border-primary-300 text-primary-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <EyeIcon className="h-4 w-4" />
                <span>Vista previa</span>
              </button>

              {/* Guardar borrador */}
              <button
                onClick={() => handleSubmit('borrador')}
                disabled={loading}
                className="px-6 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && formData.estado === 'borrador' ? 'Guardando...' : 'Guardar borrador'}
              </button>
              
              {/* Publicar */}
              <button
                onClick={() => handleSubmit('publicado')}
                disabled={loading}
                className="px-6 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading && formData.estado === 'publicado' ? 'Publicando...' : 'Publicar'}
              </button>

              {/* Cancelar */}
              <button
                onClick={() => navigate('/dashboard/contenido')}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal de biblioteca de medios */}
      {showMediaLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-96 overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Biblioteca de medios</h3>
              <button
                onClick={() => setShowMediaLibrary(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {formData.galeria.map((image) => (
                <div
                  key={image.id}
                  className="cursor-pointer hover:opacity-75 transition-opacity"
                  onClick={() => {
                    // Insertar imagen en el contenido
                    if (contentRef.current) {
                      const imgHTML = `<img src="${image.url}" alt="${image.alt}" class="w-full h-auto my-4 rounded-lg" />`;
                      const selection = window.getSelection();
                      if (selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        range.deleteContents();
                        const div = document.createElement('div');
                        div.innerHTML = imgHTML;
                        range.insertNode(div.firstChild);
                      }
                      setFormData(prev => ({
                        ...prev,
                        contenido: contentRef.current.innerHTML
                      }));
                    }
                    setShowMediaLibrary(false);
                  }}
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrearNoticiaAvanzada;
