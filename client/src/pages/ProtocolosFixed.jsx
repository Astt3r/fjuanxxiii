import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DocumentArrowDownIcon, FolderIcon, EyeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// Datos de protocolos fuera del componente para evitar re-renders
const PROTOCOLOS_DATA = [
  {
    id: 1,
    titulo: "Protocolo de Retención de Estudiantes Embarazadas, Madres y Padres Adolescentes",
    descripcion: "Procedimientos para garantizar la continuidad educativa de estudiantes embarazadas y padres/madres adolescentes.",
    categoria: "Bienestar Estudiantil",
    archivo: "protocolo-retencion-embarazadas.pdf",
    fechaActualizacion: "2025-08-01",
    url: "/protocolos/protocolo-retencion-embarazadas.pdf"
  },
  {
    id: 2,
    titulo: "Protocolo de Accidentes Escolares",
    descripcion: "Procedimientos de actuación ante accidentes que ocurran en el establecimiento educacional.",
    categoria: "Seguridad",
    archivo: "protocolo-accidentes-escolares.pdf",
    fechaActualizacion: "2025-04-09",
    url: "/protocolos/protocolo-accidentes-escolares.pdf"
  },
  {
    id: 3,
    titulo: "Protocolo de Acción frente a Conducta Suicida y Suicidio",
    descripcion: "Guía de actuación para prevenir y abordar situaciones de riesgo suicida en estudiantes.",
    categoria: "Salud Mental",
    archivo: "protocolo-conducta-suicida.pdf",
    fechaActualizacion: "2025-08-01",
    url: "/protocolos/protocolo-conducta-suicida.pdf"
  },
  {
    id: 4,
    titulo: "Protocolo de Actuación frente a Maltrato, Acoso Escolar o Violencia",
    descripcion: "Procedimientos para abordar situaciones de maltrato, acoso escolar o violencia entre miembros de la comunidad educativa.",
    categoria: "Convivencia Escolar",
    archivo: "protocolo-maltrato-acoso.pdf",
    fechaActualizacion: "2025-08-01",
    url: "/protocolos/protocolo-maltrato-acoso.pdf"
  },
  {
    id: 5,
    titulo: "Protocolo de Acompañamiento a Niños, Niñas y Estudiantes Trans",
    descripcion: "Guía para el acompañamiento y apoyo a estudiantes trans en el ambiente educativo.",
    categoria: "Inclusión",
    archivo: "protocolo-estudiantes-trans.pdf",
    fechaActualizacion: "2025-08-01",
    url: "/protocolos/protocolo-estudiantes-trans.pdf"
  },
  {
    id: 6,
    titulo: "Protocolo de Actuación ante Casos de Ciberbullying o Ciberacoso",
    descripcion: "Procedimientos para prevenir y abordar situaciones de acoso a través de medios digitales.",
    categoria: "Convivencia Escolar",
    archivo: "protocolo-ciberbullying.pdf",
    fechaActualizacion: "2025-04-09",
    url: "/protocolos/protocolo-ciberbullying.pdf"
  },
  {
    id: 7,
    titulo: "Protocolo frente a Agresiones Sexuales y Hechos de Connotación Sexual",
    descripcion: "Procedimientos de actuación ante agresiones sexuales y hechos que atenten contra la integridad de los estudiantes.",
    categoria: "Protección",
    archivo: "protocolo-agresiones-sexuales.pdf",
    fechaActualizacion: "2025-08-01",
    url: "/protocolos/protocolo-agresiones-sexuales.pdf"
  },
  {
    id: 8,
    titulo: "Protocolo para Abordar Situaciones de Alcohol y Drogas",
    descripcion: "Guía de actuación ante situaciones relacionadas con el consumo de alcohol y drogas en el establecimiento.",
    categoria: "Prevención",
    archivo: "protocolo-alcohol-drogas.pdf",
    fechaActualizacion: "2025-08-01",
    url: "/protocolos/protocolo-alcohol-drogas.pdf"
  },
  {
    id: 9,
    titulo: "Protocolo TEA 2025",
    descripcion: "Protocolo de atención y apoyo para estudiantes con Trastorno del Espectro Autista.",
    categoria: "Necesidades Educativas Especiales",
    archivo: "protocolo-tea.pdf",
    fechaActualizacion: "2025-08-01",
    url: "/protocolos/protocolo-tea.pdf"
  },
  {
    id: 10,
    titulo: "Protocolo de Actuación frente a Vulneración de Derechos",
    descripcion: "Procedimientos para detectar y abordar situaciones de vulneración de derechos de niños, niñas y adolescentes.",
    categoria: "Protección",
    archivo: "protocolo-vulneracion-derechos.pdf",
    fechaActualizacion: "2025-04-09",
    url: "/protocolos/protocolo-vulneracion-derechos.pdf"
  },
  {
    id: 11,
    titulo: "Protocolos sobre Salidas Pedagógicas y Giras de Estudio",
    descripcion: "Normas y procedimientos para la organización y realización de salidas pedagógicas y giras de estudio.",
    categoria: "Actividades Pedagógicas",
    archivo: "protocolo-salidas-pedagogicas.pdf",
    fechaActualizacion: "2025-08-01",
    url: "/protocolos/protocolo-salidas-pedagogicas.pdf"
  }
];

const Protocolos = () => {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Usar useMemo para evitar recalcular en cada render
  const categorias = useMemo(() => {
    return [...new Set(PROTOCOLOS_DATA.map(p => p.categoria))];
  }, []);

  const protocolosFiltrados = useMemo(() => {
    let filtrados = PROTOCOLOS_DATA;

    // Filtrar por categoría
    if (categoriaSeleccionada !== 'todas') {
      filtrados = filtrados.filter(p => p.categoria === categoriaSeleccionada);
    }

    // Filtrar por búsqueda
    if (busqueda) {
      filtrados = filtrados.filter(p => 
        p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    return filtrados;
  }, [categoriaSeleccionada, busqueda]);

  const descargarProtocolo = (protocolo) => {
    window.open(protocolo.url, '_blank');
  };

  const verProtocolo = (protocolo) => {
    window.open(protocolo.url, '_blank');
  };

  const getCategoriaColor = (categoria) => {
    const colores = {
      'Bienestar Estudiantil': 'bg-blue-100 text-blue-800',
      'Seguridad': 'bg-red-100 text-red-800',
      'Salud Mental': 'bg-purple-100 text-purple-800',
      'Convivencia Escolar': 'bg-green-100 text-green-800',
      'Inclusión': 'bg-yellow-100 text-yellow-800',
      'Protección': 'bg-red-100 text-red-800',
      'Prevención': 'bg-orange-100 text-orange-800',
      'Necesidades Educativas Especiales': 'bg-indigo-100 text-indigo-800',
      'Actividades Pedagógicas': 'bg-teal-100 text-teal-800'
    };
    return colores[categoria] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando protocolos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Protocolos Institucionales
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Accede a todos los protocolos y procedimientos oficiales de la Fundación Juan XXIII. 
            Documentos actualizados que guían nuestras prácticas educativas y de convivencia.
          </p>
        </motion.div>

        {/* Filtros y búsqueda */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Búsqueda */}
              <div>
                <label htmlFor="busqueda" className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar protocolos
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="busqueda"
                    placeholder="Buscar por título o descripción..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filtro por categoría */}
              <div>
                <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por categoría
                </label>
                <select
                  id="categoria"
                  value={categoriaSeleccionada}
                  onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="todas">Todas las categorías</option>
                  {categorias.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Información de resultados */}
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>
                Mostrando {protocolosFiltrados.length} de {PROTOCOLOS_DATA.length} protocolos
              </span>
              {(categoriaSeleccionada !== 'todas' || busqueda) && (
                <button
                  onClick={() => {
                    setCategoriaSeleccionada('todas');
                    setBusqueda('');
                  }}
                  className="text-primary-600 hover:text-primary-800 font-medium"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Lista de protocolos */}
        {protocolosFiltrados.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FolderIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron protocolos
            </h3>
            <p className="text-gray-600">
              {busqueda || categoriaSeleccionada !== 'todas' 
                ? 'Intenta con otros términos de búsqueda o cambia los filtros.'
                : 'No hay protocolos disponibles en este momento.'
              }
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {protocolosFiltrados.map((protocolo, index) => (
              <motion.div
                key={protocolo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoriaColor(protocolo.categoria)}`}>
                          {protocolo.categoria}
                        </span>
                        <span className="ml-3 text-sm text-gray-500">
                          Actualizado: {new Date(protocolo.fechaActualizacion).toLocaleDateString('es-CL')}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {protocolo.titulo}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {protocolo.descripcion}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-500">
                      <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                      <span>Archivo PDF</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => verProtocolo(protocolo)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                      >
                        <EyeIcon className="h-4 w-4 mr-2" />
                        Ver
                      </button>
                      
                      <button
                        onClick={() => descargarProtocolo(protocolo)}
                        className="inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700 transition-colors duration-200"
                      >
                        <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                        Descargar
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Información adicional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 bg-primary-50 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-primary-900 mb-3">
            Información Importante
          </h3>
          <div className="text-primary-800 space-y-2">
            <p>• Todos los protocolos están actualizados según la normativa vigente del Ministerio de Educación.</p>
            <p>• Estos documentos son de uso interno y están dirigidos a la comunidad educativa de la Fundación Juan XXIII.</p>
            <p>• Para consultas específicas sobre la aplicación de estos protocolos, contacte a la dirección del establecimiento.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Protocolos;
