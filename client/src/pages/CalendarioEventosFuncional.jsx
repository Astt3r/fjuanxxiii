import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  FunnelIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { API_CONFIG } from '../config/api';
import toast from 'react-hot-toast';

const CalendarioEventos = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const { user } = useAuth();

  // Tipos de eventos según requerimientos
  const tiposEventos = {
    reunion: { 
      nombre: 'Reunión', 
      color: 'bg-blue-500', 
      colorBorder: 'border-blue-300',
      colorText: 'text-blue-700',
      colorBg: 'bg-blue-50'
    },
    celebracion: { 
      nombre: 'Celebración', 
      color: 'bg-purple-500',
      colorBorder: 'border-purple-300',
      colorText: 'text-purple-700',
      colorBg: 'bg-purple-50'
    },
    evento: { 
      nombre: 'Evento', 
      color: 'bg-orange-500',
      colorBorder: 'border-orange-300',
      colorText: 'text-orange-700',
      colorBg: 'bg-orange-50'
    },
    academico: { 
      nombre: 'Académico', 
      color: 'bg-green-500',
      colorBorder: 'border-green-300',
      colorText: 'text-green-700',
      colorBg: 'bg-green-50'
    }
  };

  // Cargar eventos desde la API
  const cargarEventos = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_CONFIG.getEventsURL());
      if (response.ok) {
        const eventosData = await response.json();
        
        // Transformar los eventos para el formato del calendario
        const eventosFormateados = eventosData.map(evento => ({
          id: evento.id,
          title: evento.titulo,
          date: evento.fecha_evento.split('T')[0], // Formato YYYY-MM-DD
          time: evento.hora_inicio ? evento.hora_inicio.substring(0, 5) : '00:00', // Formato HH:MM
          endTime: evento.hora_fin ? evento.hora_fin.substring(0, 5) : null,
          location: evento.ubicacion || 'Sin ubicación',
          description: evento.descripcion || 'Sin descripción',
          type: evento.tipo || 'evento',
          color: evento.color || '#F59E0B',
          estado: evento.estado
        }));
        
        setEvents(eventosFormateados);
      } else {
        toast.error('Error al cargar eventos');
      }
    } catch (error) {
      console.error('Error cargando eventos:', error);
      toast.error('Error de conexión al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar eventos al montar el componente
  useEffect(() => {
    cargarEventos();
  }, []);

  // Filtrar eventos por tipo
  const eventosFiltrados = filtroTipo === 'todos' 
    ? events 
    : events.filter(evento => evento.type === filtroTipo);

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Días del mes anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({ date: date, isCurrentMonth: true });
    }
    
    // Días del próximo mes para completar la grilla
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return eventosFiltrados.filter(event => event.date === dateString);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getEventTypeColor = (type) => {
    return tiposEventos[type]?.color || 'bg-gray-500';
  };

  const getEventTypeInfo = (type) => {
    return tiposEventos[type] || {
      nombre: 'Otro',
      color: 'bg-gray-500',
      colorBorder: 'border-gray-300',
      colorText: 'text-gray-700',
      colorBg: 'bg-gray-50'
    };
  };

  const days = getDaysInMonth(currentDate);
  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 to-secondary-900/90" />
        
        <div className="relative container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Calendario de <span className="text-secondary-300">Eventos</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 font-light leading-relaxed">
              Mantente informado sobre todas las actividades de nuestra comunidad educativa
            </p>
          </motion.div>
        </div>
      </section>

      {/* Calendario Principal */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {/* Filtros y controles */}
          <div className="mb-8 max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <h3 className="text-xl font-bold text-primary-800 flex items-center">
                  <FunnelIcon className="h-5 w-5 mr-2" />
                  Filtrar Eventos
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFiltroTipo('todos')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      filtroTipo === 'todos' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Todos
                  </button>
                  {Object.entries(tiposEventos).map(([tipo, info]) => (
                    <button
                      key={tipo}
                      onClick={() => setFiltroTipo(tipo)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                        filtroTipo === tipo 
                          ? `${info.color} text-white` 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${filtroTipo === tipo ? 'bg-white' : info.color}`} />
                      {info.nombre}
                    </button>
                  ))}
                </div>
                {user && (user.rol === 'admin' || user.rol === 'propietario') && (
                  <button
                    onClick={() => window.location.href = '/dashboard/crear-evento'}
                    className="flex items-center gap-2 bg-secondary-600 text-white px-4 py-2 rounded-full hover:bg-secondary-700 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Crear Evento
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Calendario */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
              >
                {/* Header del Calendario */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={previousMonth}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      <ChevronLeftIcon className="h-6 w-6 text-white" />
                    </button>
                    
                    <h2 className="text-2xl font-bold text-white">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    
                    <button
                      onClick={nextMonth}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      <ChevronRightIcon className="h-6 w-6 text-white" />
                    </button>
                  </div>
                </div>

                {/* Días de la semana */}
                <div className="grid grid-cols-7 border-b border-gray-200">
                  {dayNames.map((day) => (
                    <div key={day} className="p-3 text-center font-semibold text-gray-600 bg-gray-50">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Grilla del calendario */}
                <div className="grid grid-cols-7">
                  {loading ? (
                    // Indicador de carga
                    <div className="col-span-7 flex items-center justify-center py-20">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Cargando eventos...</p>
                      </div>
                    </div>
                  ) : (
                    days.map((day, index) => {
                      const dayEvents = getEventsForDate(day.date);
                      const isSelected = selectedDate.toDateString() === day.date.toDateString();
                      const isToday = new Date().toDateString() === day.date.toDateString();
                      
                      return (
                        <div
                          key={index}
                          onClick={() => setSelectedDate(day.date)}
                          className={`
                            min-h-24 p-2 border border-gray-100 cursor-pointer transition-colors relative
                            ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'hover:bg-primary-50'}
                            ${isSelected ? 'bg-primary-100 border-primary-300' : ''}
                            ${isToday ? 'bg-secondary-50 border-secondary-300' : ''}
                          `}
                        >
                          <div className={`
                            text-sm font-medium mb-1
                            ${isToday ? 'text-secondary-700' : ''}
                            ${isSelected ? 'text-primary-700' : ''}
                          `}>
                            {day.date.getDate()}
                          </div>
                          
                          {/* Indicadores de eventos */}
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map((event) => (
                              <div
                                key={event.id}
                                className={`
                                  text-xs px-2 py-1 rounded text-white truncate
                                  ${getEventTypeColor(event.type)}
                                `}
                                title={`${event.title} - ${event.time}`}
                              >
                                {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{dayEvents.length - 2} más
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </div>

            {/* Panel de Eventos */}
            <div className="space-y-6">
              {/* Eventos del día seleccionado */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6"
              >
                <h3 className="text-2xl font-bold text-primary-800 mb-4 flex items-center">
                  <CalendarIcon className="h-6 w-6 mr-2" />
                  {selectedDate.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>

                {selectedDateEvents.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDateEvents.map((event) => {
                      const tipoInfo = getEventTypeInfo(event.type);
                      return (
                        <div
                          key={event.id}
                          className={`border rounded-xl p-4 hover:shadow-md transition-shadow ${tipoInfo.colorBorder} ${tipoInfo.colorBg}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className={`font-semibold ${tipoInfo.colorText}`}>{event.title}</h4>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded-full text-white ${tipoInfo.color}`}>
                                {tipoInfo.nombre}
                              </span>
                              <div className={`w-3 h-3 rounded-full ${tipoInfo.color}`} />
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <ClockIcon className="h-4 w-4 mr-2" />
                              {event.time}
                              {event.endTime && ` - ${event.endTime}`}
                            </div>
                            <div className="flex items-center">
                              <MapPinIcon className="h-4 w-4 mr-2" />
                              {event.location}
                            </div>
                            {event.estado && (
                              <div className="flex items-center">
                                <TagIcon className="h-4 w-4 mr-2" />
                                <span className={`px-2 py-1 rounded text-xs ${
                                  event.estado === 'activo' ? 'bg-green-100 text-green-800' :
                                  event.estado === 'cancelado' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {event.estado.charAt(0).toUpperCase() + event.estado.slice(1)}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-700 mt-3">{event.description}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No hay eventos programados para este día.
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Leyenda de tipos de eventos */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6"
              >
                <h3 className="text-xl font-bold text-primary-800 mb-4">Tipos de Eventos</h3>
                <div className="space-y-3">
                  {Object.entries(tiposEventos).map(([tipo, info]) => (
                    <div key={tipo} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 ${info.color} rounded-full mr-3`} />
                        <span className="text-gray-700 font-medium">{info.nombre}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {eventosFiltrados.filter(e => e.type === tipo).length} eventos
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Próximos Eventos */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-primary-800 mb-4">
              Próximos <span className="text-secondary-600">Eventos</span>
            </h2>
            <p className="text-xl text-gray-600">
              Los eventos más importantes que se aproximan en nuestra comunidad
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {eventosFiltrados
              .filter(event => new Date(event.date) >= new Date())
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .slice(0, 6)
              .map((event, index) => {
                const tipoInfo = getEventTypeInfo(event.type);
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 overflow-hidden"
                  >
                    <div className={`h-2 ${tipoInfo.color}`} />
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full text-white ${tipoInfo.color}`}>
                          {tipoInfo.nombre}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {new Date(event.date).toLocaleDateString('es-ES')}
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-2" />
                          {event.time}
                          {event.endTime && ` - ${event.endTime}`}
                        </div>
                        <div className="flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-2" />
                          {event.location}
                        </div>
                      </div>
                      
                      <p className="text-gray-700 text-sm">{event.description}</p>
                    </div>
                  </motion.div>
                );
              })}
          </div>

          {eventosFiltrados.length === 0 && !loading && (
            <div className="text-center py-12">
              <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay eventos disponibles</h3>
              <p className="text-gray-500">
                {filtroTipo === 'todos' 
                  ? 'No se encontraron eventos en el sistema.' 
                  : `No hay eventos del tipo "${tiposEventos[filtroTipo]?.nombre}".`
                }
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CalendarioEventos;
