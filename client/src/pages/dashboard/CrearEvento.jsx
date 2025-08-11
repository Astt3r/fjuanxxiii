import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  TagIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

const CrearEvento = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fechaInicio: '',
    horaInicio: '',
    fechaFin: '',
    horaFin: '',
    ubicacion: '',
    direccion: '',
    capacidadMaxima: '',
    tipoEvento: 'evento',
    categoria: 'general',
    estado: 'activo',
    esPublico: true,
    requiereInscripcion: false,
    costo: 0,
    contactoResponsable: '',
    telefonoContacto: '',
    emailContacto: '',
    imagenDestacada: '',
    color: '#3B82F6', // Color por defecto azul
    notas: '',
    tags: [],
    configuracion: {
      enviarNotificaciones: true,
      permitirComentarios: false,
      mostrarAsistentes: true,
      recordatorioEmail: true,
      recordatorioDias: 1
    }
  });

  const tiposEvento = [
    { value: 'reunion', label: 'Reunión', color: '#3B82F6' },
    { value: 'celebracion', label: 'Celebración', color: '#8B5CF6' },
    { value: 'evento', label: 'Evento', color: '#F59E0B' },
    { value: 'academico', label: 'Académico', color: '#10B981' }
  ];

  const categorias = [
    { value: 'general', label: 'General' },
    { value: 'academico', label: 'Académico' },
    { value: 'pastoral', label: 'Pastoral' },
    { value: 'deportes', label: 'Deportes' },
    { value: 'cultura', label: 'Cultura' },
    { value: 'padres', label: 'Padres y Apoderados' },
    { value: 'profesores', label: 'Profesores' },
    { value: 'estudiantes', label: 'Estudiantes' }
  ];

  // Cargar evento si es edición
  useEffect(() => {
    if (id) {
      setIsEditing(true);
      loadEvento();
    }
  }, [id]);

  const loadEvento = async () => {
    try {
      setLoading(true);
      // Aquí iría la llamada a la API para cargar el evento
      // const response = await eventosApi.getEvento(id);
      // setFormData(response.data);
    } catch (error) {
      toast.error('Error al cargar el evento');
    } finally {
      setLoading(false);
    }
  };

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

  const handleTipoEventoChange = (tipo) => {
    const tipoSeleccionado = tiposEvento.find(t => t.value === tipo);
    setFormData(prev => ({
      ...prev,
      tipoEvento: tipo,
      color: tipoSeleccionado?.color || '#3B82F6'
    }));
  };

  const generateEventSlug = (titulo) => {
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

  const validateForm = () => {
    if (!formData.titulo.trim()) {
      toast.error('El título es obligatorio');
      return false;
    }
    if (!formData.fechaInicio) {
      toast.error('La fecha de inicio es obligatoria');
      return false;
    }
    if (!formData.horaInicio) {
      toast.error('La hora de inicio es obligatoria');
      return false;
    }
    if (formData.fechaFin && formData.fechaFin < formData.fechaInicio) {
      toast.error('La fecha de fin no puede ser anterior a la fecha de inicio');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const eventoData = {
        ...formData,
        slug: generateEventSlug(formData.titulo),
        fechaCreacion: isEditing ? formData.fechaCreacion : new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
        creadoPor: user.id,
        // Combinar fecha y hora para FullCalendar
        start: `${formData.fechaInicio}T${formData.horaInicio}`,
        end: formData.fechaFin && formData.horaFin 
          ? `${formData.fechaFin}T${formData.horaFin}` 
          : `${formData.fechaInicio}T${formData.horaInicio}`,
        title: formData.titulo,
        backgroundColor: formData.color,
        borderColor: formData.color
      };

      if (isEditing) {
        // await eventosApi.updateEvento(id, eventoData);
        toast.success('Evento actualizado exitosamente');
      } else {
        // await eventosApi.createEvento(eventoData);
        toast.success('Evento creado exitosamente');
      }

      navigate('/dashboard/eventos');
    } catch (error) {
      toast.error('Error al guardar el evento');
    } finally {
      setLoading(false);
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
              onClick={() => navigate('/dashboard/eventos')}
              className="text-primary-600 hover:text-primary-800 mb-4 flex items-center"
            >
              ← Volver al calendario
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'}
            </h1>
            <p className="text-gray-600">
              Agrega eventos al calendario de la fundación
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información básica */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-primary-600" />
                Información Básica
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título del evento *
                  </label>
                  <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ej: Reunión de Apoderados 4° Básico"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Describe el evento, objetivos, agenda, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de evento *
                  </label>
                  <select
                    name="tipoEvento"
                    value={formData.tipoEvento}
                    onChange={(e) => handleTipoEventoChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {tiposEvento.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
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
                    {categorias.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color del evento
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">{formData.color}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fecha y hora */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-primary-600" />
                Fecha y Hora
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de inicio *
                  </label>
                  <input
                    type="date"
                    name="fechaInicio"
                    value={formData.fechaInicio}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora de inicio *
                  </label>
                  <input
                    type="time"
                    name="horaInicio"
                    value={formData.horaInicio}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de fin
                  </label>
                  <input
                    type="date"
                    name="fechaFin"
                    value={formData.fechaFin}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora de fin
                  </label>
                  <input
                    type="time"
                    name="horaFin"
                    value={formData.horaFin}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2 text-primary-600" />
                Ubicación
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lugar
                  </label>
                  <input
                    type="text"
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ej: Aula Magna, Gimnasio, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Dirección completa del evento"
                  />
                </div>
              </div>
            </div>

            {/* Configuración adicional */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserGroupIcon className="h-5 w-5 mr-2 text-primary-600" />
                Configuración
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacidad máxima
                  </label>
                  <input
                    type="number"
                    name="capacidadMaxima"
                    value={formData.capacidadMaxima}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Número de asistentes"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Costo (CLP)
                  </label>
                  <input
                    type="number"
                    name="costo"
                    value={formData.costo}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0 para eventos gratuitos"
                    min="0"
                  />
                </div>

                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="esPublico"
                      checked={formData.esPublico}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Evento público (visible para todos)
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="requiereInscripcion"
                      checked={formData.requiereInscripcion}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Requiere inscripción previa
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Información de Contacto
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsable
                  </label>
                  <input
                    type="text"
                    name="contactoResponsable"
                    value={formData.contactoResponsable}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Nombre del responsable"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefonoContacto"
                    value={formData.telefonoContacto}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+56 9 XXXX XXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="emailContacto"
                    value={formData.emailContacto}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="contacto@ejemplo.com"
                  />
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard/eventos')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4 mr-2" />
                    {isEditing ? 'Actualizar Evento' : 'Crear Evento'}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CrearEvento;
