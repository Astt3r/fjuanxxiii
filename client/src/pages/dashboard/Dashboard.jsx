import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useContentStats } from '../../hooks/useContentStats';

const Dashboard = () => {
  const { user } = useAuth();
  const { stats, loading: statsLoading } = useContentStats();
  const navigate = useNavigate();

  // Atajos de teclado: N (nueva noticia), E (nuevo evento)
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) return;
      const k = e.key?.toLowerCase();
      if (k === 'n') navigate('/dashboard/noticias/crear');
      if (k === 'e') navigate('/dashboard/eventos/crear');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  // === Tarjetas principales (las mismas rutas que ya usabas) ===
  const dashboardCards = [
    {
      title: 'Mi Perfil',
      description: 'Actualiza tu información personal y preferencias',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      link: '/dashboard/usuario',
      color: 'bg-primary-500',
    },
    {
      title: 'Crear Contenido',
      description: 'Publica noticias, eventos y recursos educativos',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      link: '/dashboard/contenido/crear',
      color: 'bg-secondary-500',
    },
    {
      title: 'Mis Publicaciones',
      description: 'Revisa y edita tus contenidos publicados',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      link: '/dashboard/contenido',
      color: 'bg-accent-600',
    },
    {
      title: 'Estadísticas',
      description: 'Ve el rendimiento de tus publicaciones',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      link: '/dashboard/estadisticas',
      color: 'bg-orange-500',
    },
  ];

  const adminCards = [
    {
      title: 'Administración',
      description: 'Panel de administración completo',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      link: '/dashboard/admin',
      color: 'bg-red-500',
    },
  ];

  // === Quick stats (mismos datos; mejor presentación) ===
  const quickStats = [
    {
      label: 'Noticias',
      value: statsLoading ? '…' : (stats?.noticias?.total ?? 0).toString(),
      change: statsLoading ? 'Cargando…' : `${stats?.noticias?.activas ?? 0} publicadas`,
      theme: 'from-blue-500 to-indigo-500',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4zM4 10h10v2H4zM4 14h16v2H4z"/></svg>
      )
    },
    {
      label: 'Eventos',
      value: statsLoading ? '…' : (stats?.eventos?.total ?? 0).toString(),
      change: statsLoading ? 'Cargando…' : `${stats?.eventos?.proximos ?? 0} próximos`,
      theme: 'from-orange-500 to-amber-500',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2v2H5a2 2 0 00-2 2v2h18V6a2 2 0 00-2-2h-2V2h-2v2H9V2H7zm14 8H3v10a2 2 0 002 2h14a2 2 0 002-2V10z"/></svg>
      )
    },
    {
      label: 'Contenido Activo',
      value: statsLoading ? '…' : ((stats?.noticias?.activas ?? 0) + (stats?.eventos?.activos ?? 0)).toString(),
      change: statsLoading ? 'Cargando…' : 'Total publicado',
      theme: 'from-emerald-500 to-teal-500',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l4 8H8l4-8zm0 20l-4-8h8l-4 8z"/></svg>
      )
    },
    {
      label: 'Borradores',
      value: statsLoading ? '…' : (stats?.noticias?.borradores ?? 0).toString(),
      change: statsLoading ? 'Cargando…' : 'Pendientes de publicar',
      theme: 'from-slate-400 to-gray-500',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16v16H4zM7 7h10v2H7zM7 11h10v2H7z"/></svg>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido, {user?.nombre}!
          </h1>
          <p className="text-gray-600">
            Gestiona tu contenido y participa en la comunidad educativa
          </p>
        </motion.div>

        {/* CTA de creación rápida */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mb-8 rounded-2xl bg-gradient-to-r from-primary-600 to-secondary-500 text-white p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm"
        >
          <div>
            <div className="text-sm uppercase tracking-wide text-white/80">Crea algo nuevo</div>
            <div className="text-xl font-semibold">¿Noticia o evento?</div>
            <div className="text-white/80 text-xs mt-1">Atajos: N (Noticia) • E (Evento)</div>
          </div>
          <div className="flex gap-3">
            <Link
              to="/dashboard/noticias/crear"
              className="inline-flex items-center gap-2 bg-white text-primary-700 hover:bg-gray-100 font-medium px-4 py-2 rounded-lg transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16v4H4zM4 10h10v10H4zM16 10h4v10h-4z"/></svg>
              Nueva noticia
            </Link>
            <Link
              to="/dashboard/eventos/crear"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-lg transition border border-white/20"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2v2H5a2 2 0 00-2 2v2h18V6a2 2 0 00-2-2h-2V2h-2v2H9V2H7zm14 8H3v10a2 2 0 002 2h14a2 2 0 002-2V10z"/></svg>
              Nuevo evento
            </Link>
          </div>
        </motion.div>

        {/* Quick Stats más visuales */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {quickStats.map((stat, i) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-200 p-5 relative overflow-hidden"
            >
              <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${stat.theme} opacity-10`} />
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">{stat.label}</h3>
                <div className={`w-8 h-8 rounded-md text-white flex items-center justify-center bg-gradient-to-br ${stat.theme}`}>
                  {stat.icon}
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-900 tracking-tight">
                {stat.value}
              </div>
              <div className="text-sm mt-1 text-gray-600">
                {stat.change}
              </div>
              {statsLoading && (
                <div className="mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
                </div>
              )}
            </div>
          ))}
        </motion.div>

        {/* Tarjetas principales (tus mismas rutas) */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {dashboardCards.map((card, index) => (
            <Link key={card.title} to={card.link} className="group block">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative">
                <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {card.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {card.description}
                </p>
                <div className="mt-4 flex items-center text-primary-600 text-sm font-medium">
                  Acceder
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </motion.div>

        {/* Admin */}
        {user?.rol === 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Panel de Administración</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminCards.map((card) => (
                <Link key={card.title} to={card.link} className="group block">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {card.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {card.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{card.description}</p>
                    <div className="mt-4 flex items-center text-primary-600 text-sm font-medium">
                      Acceder
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Actividad Reciente (placeholder) */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Actividad Reciente</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { action: 'Publicaste una nueva noticia', title: '"Inicio del año escolar 2024"', time: 'Hace 2 horas', type: 'publish' },
                { action: 'Editaste el artículo', title: '"Protocolo de convivencia"', time: 'Hace 1 día', type: 'edit' },
                { action: 'Recibiste 5 nuevos comentarios', title: 'en "Valores franciscanos"', time: 'Hace 2 días', type: 'comment' },
              ].map((activity) => (
                <div key={activity.title + activity.time} className="flex items-start space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'publish'
                        ? 'bg-green-100 text-green-600'
                        : activity.type === 'edit'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-orange-100 text-orange-600'
                    }`}
                  >
                    {activity.type === 'publish' && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {activity.type === 'edit' && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    )}
                    {activity.type === 'comment' && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.action}</span>{' '}
                      <span className="text-primary-600">{activity.title}</span>
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link to="/dashboard/actividad" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Ver toda la actividad →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
