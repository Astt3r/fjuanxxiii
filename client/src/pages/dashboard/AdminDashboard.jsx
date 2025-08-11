import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { noticiasApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  DocumentTextIcon,
  CalendarIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    noticias: 0,
    eventos: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const response = await noticiasApi.getAll();
      setStats({
        noticias: response.noticias?.length || 0,
        eventos: 0 // Se actualizará cuando esté la API de eventos
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

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

          {/* Resumen rápido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <DocumentTextIcon className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : stats.noticias}
                  </p>
                  <p className="text-gray-600">Noticias Publicadas</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <CalendarIcon className="h-8 w-8 text-indigo-500" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : stats.eventos}
                  </p>
                  <p className="text-gray-600">Eventos Activos</p>
                </div>
              </div>
            </div>
          </div>

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

          {/* Acceso rápido al sistema de contenido */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">
                  ¡Sistema de Contenido Unificado!
                </h3>
                <p className="text-blue-100 mb-4">
                  Gestiona noticias y eventos desde un solo lugar. El nuevo sistema unifica 
                  la administración de todo el contenido de la fundación.
                </p>
                <div className="flex space-x-3">
                  <Link
                    to="/dashboard/contenido"
                    className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-md font-medium hover:bg-gray-50 transition-colors"
                  >
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    Ver Contenido
                  </Link>
                  <Link
                    to="/dashboard/contenido/crear"
                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-400 transition-colors"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Crear Noticia
                  </Link>
                </div>
              </div>
              <div className="hidden md:block">
                <DocumentTextIcon className="h-16 w-16 text-blue-200" />
              </div>
            </div>
          </motion.div>

          {/* Actividad reciente */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Actividad Reciente
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Juan Pérez</span> publicó una nueva noticia
                </p>
                <span className="text-xs text-gray-400">Hace 2 horas</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">María González</span> actualizó un evento
                </p>
                <span className="text-xs text-gray-400">Hace 4 horas</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full"></div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Sistema</span> creó copia de seguridad
                </p>
                <span className="text-xs text-gray-400">Hace 6 horas</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
