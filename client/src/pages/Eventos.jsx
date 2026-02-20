import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';

const Eventos = () => {
  const [eventos, setEventos] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const cargarEventos = useCallback(async () => {
    try {
      setLoading(true); // muestra skeleton al cambiar de mes
      const mes = fechaSeleccionada.getMonth() + 1;
      const año = fechaSeleccionada.getFullYear();

      const url = `${process.env.REACT_APP_API_URL}/api/events?mes=${mes}&año=${año}`;
      const response = await fetch(url);
      const data = await response.json();

      setEventos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando eventos:', error);
      setEventos([]);
    } finally {
      setLoading(false);
    }
  }, [fechaSeleccionada]);

  useEffect(() => {
    cargarEventos();
  }, [cargarEventos]);

  const obtenerDiasDelMes = () => {
    const año = fechaSeleccionada.getFullYear();
    const mes = fechaSeleccionada.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const primerDiaSemana = primerDia.getDay();

    const dias = [];

    // Días del mes anterior para completar la primera semana
    for (let i = primerDiaSemana; i > 0; i--) {
      const dia = new Date(año, mes, -i + 1);
      dias.push({ fecha: dia, esDelMes: false });
    }

    // Días del mes actual
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fecha = new Date(año, mes, dia);
      dias.push({ fecha, esDelMes: true });
    }

    return dias;
  };

  const obtenerEventosDelDia = (fecha) => {
    const eventosArray = Array.isArray(eventos) ? eventos : [];
    return eventosArray.filter((evento) => {
      const fechaEvento = new Date(evento.fecha_evento);
      return fechaEvento.toDateString() === fecha.toDateString();
    });
  };

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const cambiarMes = (direccion) => {
    const nuevaFecha = new Date(fechaSeleccionada);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + direccion);
    setFechaSeleccionada(nuevaFecha);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Calendario de Eventos
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Mantente informado sobre todas las actividades, celebraciones y eventos 
            importantes de la Fundación Juan XXIII
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendario */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              {/* Controles del calendario */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => cambiarMes(-1)}
                  className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  ←
                </button>
                <h2 className="text-2xl font-bold text-gray-900">
                  {meses[fechaSeleccionada.getMonth()]} {fechaSeleccionada.getFullYear()}
                </h2>
                <button
                  onClick={() => cambiarMes(1)}
                  className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  →
                </button>
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dia => (
                  <div key={dia} className="p-2 text-center text-sm font-medium text-gray-500">
                    {dia}
                  </div>
                ))}
              </div>

              {/* Días del mes */}
              <div className="grid grid-cols-7 gap-1">
                {obtenerDiasDelMes().map((dia, index) => {
                  const eventosDelDia = obtenerEventosDelDia(dia.fecha);
                  const esHoy = dia.fecha.toDateString() === new Date().toDateString();
                  
                  return (
                    <div
                      key={index}
                      className={`p-2 min-h-[80px] border rounded-lg ${
                        dia.esDelMes 
                          ? esHoy 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                          : 'bg-gray-50 border-gray-100 text-gray-400'
                      } transition-colors cursor-pointer`}
                    >
                      <div className={`text-sm ${esHoy ? 'font-bold text-blue-600' : ''}`}>
                        {dia.fecha.getDate()}
                      </div>
                      {eventosDelDia.map((evento, eventIndex) => (
                        <div
                          key={eventIndex}
                          className="text-xs bg-blue-100 text-blue-800 rounded px-1 py-0.5 mt-1 truncate"
                          title={evento.titulo}
                        >
                          {evento.titulo}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Lista de eventos del mes */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Eventos de {meses[fechaSeleccionada.getMonth()]}
              </h3>
              
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : eventos.length > 0 ? (
                <div className="space-y-4">
                  {eventos.map((evento) => (
                    <motion.div
                      key={evento.id}
                      whileHover={{ scale: 1.02 }}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {evento.titulo}
                      </h4>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {new Date(evento.fecha_evento).toLocaleDateString()}
                        </div>
                        
                        {evento.hora_inicio && (
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-2" />
                            {evento.hora_inicio}
                            {evento.hora_fin && ` - ${evento.hora_fin}`}
                          </div>
                        )}
                        
                        {evento.ubicacion && (
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-2" />
                            {evento.ubicacion}
                          </div>
                        )}
                      </div>
                      
                      {evento.descripcion && (
                        <p className="text-sm text-gray-600 mt-2">
                          {evento.descripcion}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No hay eventos programados para este mes
                </p>
              )}
            </motion.div>
          </div>
        </div>

        {/* Próximos eventos destacados */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Próximos Eventos Destacados
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventos.slice(0, 3).map((evento) => (
              <motion.div
                key={evento.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  <CalendarIcon className="h-16 w-16 text-white" />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {evento.titulo}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {new Date(evento.fecha_evento).toLocaleDateString()}
                    </div>
                    
                    {evento.hora_inicio && (
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        {evento.hora_inicio}
                      </div>
                    )}
                    
                    {evento.ubicacion && (
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        {evento.ubicacion}
                      </div>
                    )}
                  </div>
                  
                  {evento.descripcion && (
                    <p className="text-gray-600 line-clamp-3">
                      {evento.descripcion}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Eventos;
