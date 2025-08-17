import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
// Eliminados imports de APIs y toast al simplificar el dashboard
import {
  DocumentTextIcon,
  CalendarIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  // Estadísticas y actividad eliminadas según requerimiento.

  const dashboardCards = [
    {
      title: 'Crear Noticia',
      description: 'Crear y publicar nuevas noticias',
      icon: StarIcon,
      href: '/dashboard/contenido/crear',
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      featured: true
    },
    {
      title: 'Crear Evento',
      description: 'Agregar eventos al calendario',
      icon: CalendarIcon,
      href: '/dashboard/eventos/crear',
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      featured: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard - Panel de Administración
            </h1>
            <p className="text-gray-600">
              Centro de control para gestionar el contenido y configuración del sitio web de la Fundación Juan XXIII
            </p>
          </div>

          {/* Sistema de contenido (movido arriba) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">
                  Sistema de Contenido Unificado
                </h3>
                <p className="text-blue-100 mb-4">
                  Gestiona noticias y eventos desde un solo lugar.
                </p>
                <div className="flex space-x-3">
                  <Link
                    to="/dashboard/contenido"
                    className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-md font-medium hover:bg-gray-50 transition-colors"
                  >
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    Ver Contenido
                  </Link>
                </div>
              </div>
              <div className="hidden md:block">
                <DocumentTextIcon className="h-16 w-16 text-blue-200" />
              </div>
            </div>
          </motion.div>

          {/* Acciones principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dashboardCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link
                  to={card.href}
                  className={`block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 ${
                    card.featured ? 'ring-2 ring-purple-500 ring-opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${card.color} bg-opacity-10`}>
                      <card.icon className={`h-6 w-6 ${card.textColor}`} />
                    </div>
                    {card.featured && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Nuevo
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {card.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Se eliminaron estadísticas y actividad reciente; cuadro azul ya movido arriba */}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
