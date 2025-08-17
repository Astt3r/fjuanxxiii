import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { API_CONFIG } from '../../config/api';

const CrearEvento = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_evento: '',
    hora_inicio: '',
    hora_fin: '',
    ubicacion: '',
    tipo: 'evento',
    color: '#3B82F6'
  });

  const tiposEvento = [
    { value: 'evento', label: 'Evento General', color: '#3B82F6' },
    { value: 'reunion', label: 'Reunión', color: '#F59E0B' },
    { value: 'celebracion', label: 'Celebración', color: '#10B981' },
    { value: 'academico', label: 'Académico', color: '#EF4444' }
  ];

  // Cargar evento si es edición
  useEffect(() => {
    const loadEvento = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_CONFIG.getEndpoint('events')}/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const evento = await response.json();
          setFormData({
            titulo: evento.titulo || '',
            descripcion: evento.descripcion || '',
            fecha_evento: evento.fecha_evento ? new Date(evento.fecha_evento).toISOString().split('T')[0] : '',
            hora_inicio: evento.hora_inicio || '',
            hora_fin: evento.hora_fin || '',
            ubicacion: evento.ubicacion || '',
            tipo: evento.tipo || 'evento',
            color: evento.color || '#3B82F6'
          });
        } else {
          toast.error('Error al cargar el evento');
          navigate('/dashboard/contenido');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar el evento');
        navigate('/dashboard/contenido');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      setIsEditing(true);
      loadEvento();
    }
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTipoChange = (tipo) => {
    const tipoSeleccionado = tiposEvento.find(t => t.value === tipo);
    setFormData(prev => ({
      ...prev,
      tipo: tipo,
      color: tipoSeleccionado?.color || '#3B82F6'
    }));
  };

  const validateForm = () => {
    if (!formData.titulo.trim()) {
      toast.error('El título es requerido');
      return false;
    }
    
    if (!formData.fecha_evento) {
      toast.error('La fecha del evento es requerida');
      return false;
    }

    // Validar que la fecha no sea en el pasado (solo para eventos nuevos)
    if (!isEditing) {
      const fechaEvento = new Date(formData.fecha_evento);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fechaEvento < hoy) {
        toast.error('La fecha del evento no puede ser en el pasado');
        return false;
      }
    }

    // Validar horarios si ambos están presentes
    if (formData.hora_inicio && formData.hora_fin) {
      if (formData.hora_fin <= formData.hora_inicio) {
        toast.error('La hora de fin debe ser posterior a la hora de inicio');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const url = isEditing 
        ? `${API_CONFIG.getEndpoint('events')}/${id}`
        : API_CONFIG.getEndpoint('events');
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(isEditing ? 'Evento actualizado exitosamente' : 'Evento creado exitosamente');
        navigate('/dashboard/contenido');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al guardar el evento');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión al guardar el evento');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando evento...</p>
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
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <button
                onClick={() => navigate('/dashboard/contenido')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Volver al Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'}
              </h1>
              <p className="text-gray-600">
                {isEditing ? 'Modifica la información del evento' : 'Agrega un nuevo evento al calendario'}
              </p>
            </div>
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
                    name="tipo"
                    value={formData.tipo}
                    onChange={(e) => handleTipoChange(e.target.value)}
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
                    Color
                  </label>
                  <div className="flex items-center space-x-2">
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

            {/* Fecha y horario */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-primary-600" />
                Fecha y Horario
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    name="fecha_evento"
                    value={formData.fecha_evento}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora de inicio
                  </label>
                  <input
                    type="time"
                    name="hora_inicio"
                    value={formData.hora_inicio}
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
                    name="hora_fin"
                    value={formData.hora_fin}
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lugar del evento
                </label>
                <input
                  type="text"
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ej: Aula Magna, Sala de Profesores, etc."
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard/contenido')}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading ? 'Guardando...' : (isEditing ? 'Actualizar Evento' : 'Crear Evento')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CrearEvento;
