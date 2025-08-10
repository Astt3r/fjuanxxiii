import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { colegiosApi } from '../services/api';
import { getColegioLogo, getColegioColor } from '../assets';
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  GlobeAltIcon,
  CalendarIcon,
  StarIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const Colegios = () => {
  const [colegios, setColegios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('todos'); // todos, destacados

  useEffect(() => {
    cargarColegios();
  }, []);

  const cargarColegios = async () => {
    try {
      setLoading(true);
      const data = await colegiosApi.getAll();
      console.log('Response colegios:', data); // Debug
      // Los colegios vienen como array directo
      setColegios(data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error cargando colegios:', err);
      setColegios([]);
    } finally {
      setLoading(false);
    }
  };

  const colegiosFiltrados = colegios.filter(colegio => {
    if (filtro === 'destacados') {
      return colegio.destacado;
    }
    return true;
  });

  const ColegioCard = ({ colegio }) => {
    const logo = getColegioLogo(colegio.slug);
    const colorGradient = getColegioColor(colegio.slug);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
      >
        {/* Header con logo y destacado */}
        <div className={`relative h-48 bg-gradient-to-br ${logo ? 'from-white to-gray-50' : colorGradient}`}>
          {colegio.destacado && (
            <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium flex items-center">
              <StarIcon className="h-4 w-4 mr-1" />
              Destacado
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center p-6">
            {logo ? (
              <div className="text-center">
                <img 
                  src={logo} 
                  alt={`Logo ${colegio.nombre}`}
                  className="h-24 w-auto mx-auto mb-2 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="hidden">
                  <AcademicCapIcon className="h-16 w-16 text-blue-600 mx-auto mb-2" />
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  Fundado en {colegio.año_fundacion}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <AcademicCapIcon className="h-16 w-16 text-white mx-auto mb-2" />
                <p className="text-sm text-white font-medium">
                  Fundado en {colegio.año_fundacion}
                </p>
              </div>
            )}
          </div>
        </div>

      {/* Contenido */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          {colegio.nombre}
        </h3>
        
        {colegio.descripcion && (
          <p className="text-gray-600 mb-4 leading-relaxed">
            {colegio.descripcion}
          </p>
        )}

        {/* Información de contacto */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <MapPinIcon className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-700">
              {colegio.direccion}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <PhoneIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">
              {colegio.telefono}
            </span>
          </div>
          
          {colegio.email && (
            <div className="flex items-center space-x-3">
              <EnvelopeIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <a 
                href={`mailto:${colegio.email}`}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {colegio.email}
              </a>
            </div>
          )}
          
          {colegio.website && (
            <div className="flex items-center space-x-3">
              <GlobeAltIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <a 
                href={colegio.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Sitio web
              </a>
            </div>
          )}
        </div>

        {/* Año de fundación */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CalendarIcon className="h-4 w-4" />
            <span>Fundado en {colegio.año_fundacion}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container-custom py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando colegios...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container-custom py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">Error al cargar los colegios: {error}</p>
            <button 
              onClick={cargarColegios}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Nuestros Colegios
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Red de establecimientos educacionales de la Fundación Juan XXIII, 
              comprometidos con una educación integral y de calidad.
            </p>
          </div>

          {/* Filtros */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex">
              <button
                onClick={() => setFiltro('todos')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  filtro === 'todos'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Todos los colegios ({colegios.length})
              </button>
              <button
                onClick={() => setFiltro('destacados')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  filtro === 'destacados'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Destacados ({colegios.filter(c => c.destacado).length})
              </button>
            </div>
          </div>

          {/* Grid de colegios */}
          {colegiosFiltrados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {colegiosFiltrados.map((colegio) => (
                <ColegioCard key={colegio.id} colegio={colegio} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                No se encontraron colegios para mostrar.
              </p>
            </div>
          )}

          {/* Información adicional */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 bg-blue-50 rounded-xl p-8"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Educación Católica de Calidad
              </h2>
              <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
                La Fundación Juan XXIII administra una red de establecimientos educacionales 
                en la Región del Biobío, ofreciendo educación católica integral desde educación 
                parvularia hasta enseñanza media, con un enfoque especial en la formación valórica 
                y el desarrollo académico de nuestros estudiantes.
              </p>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {colegios.length}
                  </div>
                  <div className="text-gray-600">Establecimientos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {colegios.filter(c => c.destacado).length}
                  </div>
                  <div className="text-gray-600">Destacados</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {new Date().getFullYear() - Math.min(...colegios.map(c => c.año_fundacion))}
                  </div>
                  <div className="text-gray-600">Años de trayectoria</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Colegios;
