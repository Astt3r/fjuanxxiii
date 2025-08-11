import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  CheckIcon,
  XMarkIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const EditarEvento = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

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
    color: '#3B82F6',
    notas: '',
    tags: [],
    configuracion: {
      enviarNotificaciones: true,
      permitirComentarios: false,
      mostrarEnCalendario: true,
      recordatorioEmail: false
    }
  });

  // Cargar datos del evento
  const loadEvento = async () => {
    try {
      setLoadingData(true);
      const response = await fetch(`http://localhost:5002/api/events/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const evento = await response.json();
        
        // Mapear los datos de la API al formato del formulario
        setFormData({
          titulo: evento.titulo || '',
          descripcion: evento.descripcion || '',
          fechaInicio: evento.fecha_evento ? new Date(evento.fecha_evento).toISOString().split('T')[0] : '',
          horaInicio: evento.hora_inicio || '',
          fechaFin: evento.fecha_fin ? new Date(evento.fecha_fin).toISOString().split('T')[0] : '',
          horaFin: evento.hora_fin || '',
          ubicacion: evento.ubicacion || '',
          direccion: evento.direccion || '',
          capacidadMaxima: evento.capacidad_maxima || '',
          tipoEvento: evento.tipo || 'evento',
          categoria: evento.categoria || 'general',
          estado: evento.estado || 'activo',
          esPublico: evento.es_publico !== undefined ? Boolean(evento.es_publico) : true,
          requiereInscripcion: evento.requiere_inscripcion !== undefined ? Boolean(evento.requiere_inscripcion) : false,
          costo: evento.costo || 0,
          contactoResponsable: evento.contacto_responsable || '',
          telefonoContacto: evento.telefono_contacto || '',
          emailContacto: evento.email_contacto || '',
          imagenDestacada: evento.imagen_destacada || '',
          color: evento.color || '#3B82F6',
          notas: evento.notas || '',
          tags: evento.tags ? (typeof evento.tags === 'string' ? evento.tags.split(',') : evento.tags) : [],
          configuracion: {
            enviarNotificaciones: true,
            permitirComentarios: false,
            mostrarEnCalendario: true,
            recordatorioEmail: false
          }
        });
      } else {
        throw new Error('No se pudo cargar el evento');
      }
    } catch (error) {
      console.error('Error al cargar el evento:', error);
      toast.error('Error al cargar el evento');
      navigate('/dashboard/contenido');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadEvento();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const tiposEvento = [
    { value: 'reunion', label: 'Reunión', color: '#3B82F6' },
    { value: 'celebracion', label: 'Celebración', color: '#10B981' },
    { value: 'evento', label: 'Evento General', color: '#F59E0B' },
    { value: 'academico', label: 'Académico', color: '#EF4444' },
    { value: 'deportivo', label: 'Deportivo', color: '#8B5CF6' },
    { value: 'cultural', label: 'Cultural', color: '#F97316' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      toast.error('El título es obligatorio');
      return;
    }

    if (!formData.fechaInicio) {
      toast.error('La fecha de inicio es obligatoria');
      return;
    }

    try {
      setLoading(true);
      
      const dataToSend = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        fecha_evento: formData.fechaInicio + 'T' + (formData.horaInicio || '00:00'),
        hora_inicio: formData.horaInicio,
        fecha_fin: formData.fechaFin ? formData.fechaFin + 'T' + (formData.horaFin || '23:59') : null,
        hora_fin: formData.horaFin,
        ubicacion: formData.ubicacion,
        direccion: formData.direccion,
        capacidad_maxima: formData.capacidadMaxima ? parseInt(formData.capacidadMaxima) : null,
        tipo: formData.tipoEvento,
        categoria: formData.categoria,
        estado: formData.estado,
        es_publico: formData.esPublico,
        requiere_inscripcion: formData.requiereInscripcion,
        costo: parseFloat(formData.costo) || 0,
        contacto_responsable: formData.contactoResponsable,
        telefono_contacto: formData.telefonoContacto,
        email_contacto: formData.emailContacto,
        imagen_destacada: formData.imagenDestacada,
        color: formData.color,
        notas: formData.notas,
        tags: Array.isArray(formData.tags) ? formData.tags.join(',') : formData.tags
      };

      const response = await fetch(`http://localhost:5002/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        toast.success('Evento actualizado correctamente');
        navigate('/dashboard/contenido');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el evento');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al actualizar el evento');
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
          <p className="mt-4 text-gray-600">Cargando evento...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Editar Evento</h1>
                <p className="text-gray-600">Modifica la información del evento</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
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
                    Actualizar Evento
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
                      Título del evento *
                    </label>
                    <input
                      type="text"
                      value={formData.titulo}
                      onChange={(e) => handleInputChange('titulo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Ingresa el título del evento"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => handleInputChange('descripcion', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Describe el evento"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de inicio *
                      </label>
                      <input
                        type="date"
                        value={formData.fechaInicio}
                        onChange={(e) => handleInputChange('fechaInicio', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hora de inicio
                      </label>
                      <input
                        type="time"
                        value={formData.horaInicio}
                        onChange={(e) => handleInputChange('horaInicio', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de fin
                      </label>
                      <input
                        type="date"
                        value={formData.fechaFin}
                        onChange={(e) => handleInputChange('fechaFin', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hora de fin
                      </label>
                      <input
                        type="time"
                        value={formData.horaFin}
                        onChange={(e) => handleInputChange('horaFin', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ubicación
                      </label>
                      <input
                        type="text"
                        value={formData.ubicacion}
                        onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Lugar del evento"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacidad máxima
                      </label>
                      <input
                        type="number"
                        value={formData.capacidadMaxima}
                        onChange={(e) => handleInputChange('capacidadMaxima', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Número de personas"
                        min="1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna lateral */}
            <div className="space-y-6">
              {/* Estado y configuración */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de evento
                    </label>
                    <select
                      value={formData.tipoEvento}
                      onChange={(e) => {
                        handleInputChange('tipoEvento', e.target.value);
                        const tipoSeleccionado = tiposEvento.find(t => t.value === e.target.value);
                        if (tipoSeleccionado) {
                          handleInputChange('color', tipoSeleccionado.color);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      {tiposEvento.map(tipo => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <select
                      value={formData.estado}
                      onChange={(e) => handleInputChange('estado', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="activo">Activo</option>
                      <option value="cancelado">Cancelado</option>
                      <option value="pospuesto">Pospuesto</option>
                      <option value="finalizado">Finalizado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color del evento
                    </label>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="esPublico"
                        checked={formData.esPublico}
                        onChange={(e) => handleInputChange('esPublico', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="esPublico" className="ml-2 block text-sm text-gray-700">
                        Evento público
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="requiereInscripcion"
                        checked={formData.requiereInscripcion}
                        onChange={(e) => handleInputChange('requiereInscripcion', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="requiereInscripcion" className="ml-2 block text-sm text-gray-700">
                        Requiere inscripción
                      </label>
                    </div>
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

export default EditarEvento;
