import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { noticiasApi } from '../../services/api';
import toast from 'react-hot-toast';
import SimpleTextEditor from '../../components/common/SimpleTextEditor';
const CrearNoticia = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

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
    galeria: [],
    metaDescripcion: '',
    metaKeywords: '',
    autorPersonalizado: '',
    configuracionVisual: {
      tema: 'default',
      tipografia: 'Inter',
      espaciado: 'normal',
      anchuraContenido: 'normal'
    },
    multimedia: {
      videos: [],
      audios: [],
      documentos: []
    },
    seo: {
      slug: '',
      metaTitulo: '',
      metaDescripcion: '',
      imagenSocial: '',
      estructuraDatos: true
    },
    planificacion: {
      fechaPublicacion: '',
      fechaExpiracion: '',
      audiencia: 'publico',
      notificaciones: true
    }
  });

  const cargarCategorias = async () => {
    try {
      const response = await noticiasApi.getCategories();
      setCategorias(response || []);
    } catch (error) {
      console.error('Error cargando categorías:', error);
      toast.error('Error al cargar las categorías');
    }
  };

  const cargarNoticia = useCallback(async () => {
    try {
      setLoading(true);
      const response = await noticiasApi.getByIdAuth(id);
      if (response) {
        setFormData({
          titulo: response.titulo || '',
          resumen: response.resumen || '',
          contenido: response.contenido || '',
          categoria: response.categoria || '',
          destacado: response.destacado || false,
          estado: response.estado || 'borrador'
        });
      }
    } catch (error) {
      console.error('Error cargando noticia:', error);
      toast.error('Error al cargar la noticia');
      navigate('/dashboard/contenido');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    cargarCategorias();
    
    // Si hay ID, cargar la noticia para edición
    if (id) {
      setIsEditing(true);
      cargarNoticia();
    }
  }, [id, cargarNoticia]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validaciones básicas
      if (!formData.titulo.trim()) {
        toast.error('El título es obligatorio');
        return;
      }
      if (!formData.contenido.trim()) {
        toast.error('El contenido es obligatorio');
        return;
      }

      if (isEditing) {
        // Actualizar noticia existente
        const noticiaData = {
          ...formData,
          fecha_publicacion: formData.estado === 'publicado' ? new Date().toISOString() : null
        };
        await noticiasApi.update(id, noticiaData);
        // Sincronizar imágenes embebidas tras actualización
        try { await noticiasApi.syncImages(id); } catch(_){}
        toast.success('Noticia actualizada exitosamente');
        navigate('/dashboard/contenido');
      } else {
        // Crear nueva noticia
        const slug = formData.titulo
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remover acentos
          .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
          .replace(/\s+/g, '-') // Reemplazar espacios con guiones
          .replace(/-+/g, '-') // Remover guiones múltiples
          .trim('-');

        const noticiaData = {
          ...formData,
          slug,
          autor_id: user.id,
          fecha_publicacion: formData.estado === 'publicado' ? new Date().toISOString() : null
        };

  const response = await noticiasApi.create(noticiaData);
  if (!response || !response.id) throw new Error('Respuesta sin ID');
  try { await noticiasApi.syncImages(response.id); } catch(_){}
  toast.success('Noticia creada exitosamente');
  navigate('/dashboard/contenido');
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'actualizando' : 'creando'} noticia:`, error);
      toast.error(`Error al ${isEditing ? 'actualizar' : 'crear'} la noticia`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (file) => {
    try {
      let currentId = id;
      if (!currentId) {
        if (!formData.titulo.trim()) throw new Error('Define un título antes de subir imágenes');
        const draft = await noticiasApi.create({
          titulo: formData.titulo,
          slug: formData.titulo.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-'),
          contenido: formData.contenido || '<p></p>',
          estado: 'borrador'
        });
        currentId = draft.id;
      }
      const up = await noticiasApi.uploadImages(currentId, [file]);
      const img = up?.imagenes?.slice(-1)[0];
      if (!img?.url) throw new Error('Respuesta sin imagen subida');
      return img.url; // editor necesita URL para insertar
    } catch (error) {
      toast.error(error.message || 'Error al subir imagen');
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver al Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{isEditing ? 'Editar Noticia' : 'Crear Nueva Noticia'}</h1>
            <p className="text-gray-600 mt-2">
              {isEditing ? 'Modifica la información de la noticia' : 'Completa la información para publicar una nueva noticia'}
            </p>
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Título */}
              <div>
                <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ingresa el título de la noticia"
                />
              </div>

              {/* Resumen */}
              <div>
                <label htmlFor="resumen" className="block text-sm font-medium text-gray-700 mb-2">
                  Resumen
                </label>
                <textarea
                  id="resumen"
                  name="resumen"
                  value={formData.resumen}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Breve resumen de la noticia (opcional)"
                  dir="ltr"
                  style={{ direction: 'ltr', textAlign: 'left' }}
                />
              </div>

              {/* Contenido */}
              <div>
                <label htmlFor="contenido" className="block text-sm font-medium text-gray-700 mb-2">
                  Contenido *
                </label>
                <SimpleTextEditor
                  value={formData.contenido}
                  onChange={(value) => setFormData(prev => ({ ...prev, contenido: value }))}
                  onImageUpload={handleImageUpload}
                  placeholder="Escribe el contenido completo de la noticia..."
                  minHeight="300px"
                />
              </div>

              {/* Categoría y opciones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Categoría */}
                <div>
                  <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    id="categoria"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Estado */}
                <div>
                  <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="borrador">Borrador</option>
                    <option value="publicado">Publicar</option>
                  </select>
                </div>
              </div>

              {/* Destacado */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="destacado"
                  name="destacado"
                  checked={formData.destacado}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="destacado" className="ml-2 block text-sm text-gray-700">
                  Marcar como noticia destacada
                </label>
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 
                    (isEditing ? 'Actualizando...' : 'Creando...') : 
                    (isEditing ? 'Actualizar Noticia' : 'Crear Noticia')
                  }
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CrearNoticia;
