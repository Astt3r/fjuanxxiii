import React, { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { noticiasApi } from '../../services/api';
import { rewriteContentMedia, normalizeImagenesArray, buildMediaUrl } from '../../utils/media';
import { isoWithOffsetHours, dateInputValueOffset } from '../../utils/time';
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
  // previewMode deprecado, ahora usamos previewOpen modal
  const [previewOpen, setPreviewOpen] = useState(false);
  // Eliminado activeTab no usado
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
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
  fechaPublicacion: dateInputValueOffset(-4),
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
      // Intentar autenticado (incluye borrador), fallback a público
      let noticia = null;
      try { noticia = await noticiasApi.getByIdAuth(id); } catch(e){ if(e.status!==403) noticia=null; }
      if(!noticia){ try { noticia = await noticiasApi.getById(id); } catch(_){}}
      if(noticia){
        const normalizedImgs = Array.isArray(noticia.imagenes) ? normalizeImagenesArray(noticia.imagenes) : [];
        setFormData(prev => ({
          ...prev,
          titulo: noticia.titulo || '',
          subtitulo: noticia.subtitulo || '',
          resumen: noticia.resumen || '',
          contenido: rewriteContentMedia(noticia.contenido || ''),
          categoria: noticia.categoria || '',
          destacado: !!noticia.destacado,
          estado: noticia.estado || 'borrador',
          imagenPrincipal: buildMediaUrl(noticia.imagen_url),
          galeria: normalizedImgs.map(img => ({ id: img.id, url: img.url, orden: img.orden })),
          fechaPublicacion: (noticia.fecha_publicacion || '').split('T')[0] || dateInputValueOffset(-4)
        }));
      } else {
        toast.error('No se pudo cargar la noticia');
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
    const remainingSlots = 9 - formData.galeria.length;
    const slice = files.slice(0, remainingSlots);
    const newItems = slice.map(f => ({ tempId: Date.now()+Math.random(), file: f, previewUrl: URL.createObjectURL(f), url: '' }));
    setFormData(prev => ({ ...prev, galeria: [...prev.galeria, ...newItems] }));
    event.target.value=''; // permite re-seleccionar mismas imágenes
  };

  // Manejar imagen principal
  const handleImagenPrincipal = async (event) => {
    const file = event.target.files?.[0];
    if(!file) return;
    setFormData(prev => ({ ...prev, imagenPrincipal: URL.createObjectURL(file), imagenPrincipalFile: file }));
    // Reset input para permitir re-seleccionar misma imagen si se elimina
    event.target.value='';
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
  // Aseguramos publicación en UTC-04:00
  fecha_publicacion: estado === 'publicado' ? isoWithOffsetHours(-4) : null
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
                onClick={() => setPreviewOpen(true)}
                className="flex items-center space-x-2 px-3 py-2 text-sm border rounded-md transition-colors border-gray-300 hover:bg-gray-50"
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

            {/* Galería de imágenes grande (principal en editor) */}
            {formData.galeria.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center justify-between">
                  Galería de imágenes
                  <span className="text-xs text-gray-500 font-normal">Haz clic en una imagen para ampliar. Usa 'Destacar' para imagen principal.</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formData.galeria.map((image, index) => (
                    <div key={image.tempId || image.id || image.filename || index} className="relative group">
                      <img
                        onClick={() => { setLightboxIndex(index); setLightboxOpen(true); }}
                        src={image.previewUrl || image.url}
                        alt={image.alt || image.name || 'imagen'}
                        className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-lg transition-colors flex flex-col justify-between p-2">
                        <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData(prev => ({
                                ...prev,
                                galeria: prev.galeria.filter((_, i) => i !== index)
                              }));
                            }}
                            className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            title="Eliminar"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if(image.id){
                                try { await noticiasApi.setFeatured(id || formData.noticiaIdDraft, image.id); toast.success('Imagen destacada actualizada'); setFormData(prev=>({...prev, imagenPrincipal: image.url })); } catch(err){ toast.error('Error al destacar'); }
                              } else {
                                toast('Sube primero la imagen (guardar/publicar)');
                              }
                            }}
                            className="px-2 py-1 bg-primary-600 hover:bg-primary-700 text-white text-xs rounded shadow"
                          >Destacar</button>
                        </div>
                      </div>
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
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center justify-between">Imagen destacada <span className="text-xs text-gray-500 font-normal">(máx 9 imágenes en galería)</span></h3>
              
              {/* Input para imagen principal */}
              <input
                type="file"
                accept="image/*"
                onChange={handleImagenPrincipal}
                className="hidden"
                id="imagen-principal"
              />
              
              <button
                type="button"
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
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, imagenPrincipal: '', imagenPrincipalFile: undefined }))}
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
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary-400 transition-colors text-center"
                disabled={formData.galeria.length >= 9}
              >
                <ArrowUpTrayIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {formData.galeria.length >= 9 ? 'Límite de 9 imágenes alcanzado' : 'Haz clic para subir imágenes adicionales'}
                </p>
              </button>

              {/* Galería preview */}
              {formData.galeria.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.galeria.map((imagen, idx) => (
                    <div key={imagen.tempId || imagen.id || imagen.filename || `g-${idx}`} className="relative group">
                      <img
                        onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}
                        src={imagen.previewUrl || imagen.url}
                        alt={imagen.alt || imagen.original_name || 'imagen'}
                        className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-90"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          galeria: prev.galeria.filter((_, i) => i !== idx)
                        }))}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100"
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
                onClick={() => setPreviewOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 text-sm border rounded-md transition-colors border-gray-300 hover:bg-gray-50"
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
      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-5xl w-full rounded-lg shadow-xl relative">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Vista previa</h2>
              <button onClick={()=>setPreviewOpen(false)} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{formData.titulo || 'Sin título'}</h1>
                {formData.resumen && <p className="text-gray-600 mb-4">{formData.resumen}</p>}
              </div>
              {formData.imagenPrincipal && (
                <div className="rounded-lg overflow-hidden border">
                  <img src={formData.imagenPrincipal} alt="principal" className="w-full max-h-96 object-cover" />
                </div>
              )}
              {formData.galeria.length>0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.galeria.map((g,i)=>(
                    <img key={g.id||g.tempId||i} src={g.previewUrl||g.url} alt="galería" className="w-full h-32 object-cover rounded" />
                  ))}
                </div>
              )}
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formData.contenido || '<p>(Sin contenido)</p>') }} />
            </div>
            <div className="px-6 py-4 border-t flex justify-end space-x-3 bg-gray-50 rounded-b-lg">
              <button onClick={()=>setPreviewOpen(false)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100">Cerrar</button>
              <button onClick={()=>{ setPreviewOpen(false); handleSubmit('borrador'); }} className="px-4 py-2 text-sm border rounded-md bg-white hover:bg-gray-100">Guardar borrador</button>
              <button onClick={()=>{ setPreviewOpen(false); handleSubmit('publicado'); }} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700">Publicar</button>
            </div>
          </div>
        </div>
      )}
      {lightboxOpen && formData.galeria[lightboxIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative max-w-5xl w-full px-6">
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 text-white bg-black/40 hover:bg-black/60 rounded-full p-2"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <img
              src={formData.galeria[lightboxIndex].previewUrl || formData.galeria[lightboxIndex].url}
              alt="imagen ampliada"
              className="max-h-[80vh] mx-auto rounded shadow-lg"
            />
            <div className="flex justify-between mt-4 text-white text-sm">
              <button
                type="button"
                disabled={lightboxIndex===0}
                onClick={() => setLightboxIndex(i => Math.max(0, i-1))}
                className="px-3 py-2 bg-black/40 rounded disabled:opacity-30"
              >Anterior</button>
              <span>{lightboxIndex+1} / {formData.galeria.length}</span>
              <button
                type="button"
                disabled={lightboxIndex===formData.galeria.length-1}
                onClick={() => setLightboxIndex(i => Math.min(formData.galeria.length-1, i+1))}
                className="px-3 py-2 bg-black/40 rounded disabled:opacity-30"
              >Siguiente</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrearNoticiaAvanzada;
