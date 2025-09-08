import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,   // Contenido
  UserGroupIcon,      // Usuarios
  LockClosedIcon
} from '@heroicons/react/24/outline';

const Card = ({ to, icon: Icon, title, description, gradient, disabled, note }) => {
  const Wrapper = disabled ? 'div' : Link;
  return (
    <Wrapper
      to={disabled ? undefined : to}
      aria-disabled={disabled}
      className={[
        'group relative block rounded-2xl border border-gray-200 bg-white/90 shadow-sm p-6',
        'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300',
        disabled ? 'pointer-events-none opacity-60 grayscale' : ''
      ].join(' ')}
      title={disabled ? 'Requiere rol administrador' : undefined}
    >
      {/* halo de color */}
      <div className={`absolute -right-8 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${gradient} opacity-10`} />
      <div className="flex items-start justify-between">
        <div className={`inline-flex items-center justify-center rounded-xl p-3 text-white bg-gradient-to-br ${gradient}`}>
          <Icon className="h-6 w-6" />
        </div>
        {disabled ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 text-gray-700 px-2.5 py-1 text-xs font-medium">
            <LockClosedIcon className="h-3.5 w-3.5" /> Bloqueado
          </span>
        ) : (
          <span className="opacity-0 group-hover:opacity-100 text-primary-700 text-sm font-medium transition">Ir →</span>
        )}
      </div>

      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-600">{description}</p>

      {note && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gray-50 px-2.5 py-1.5 text-[11px] text-gray-600">
          {note}
        </div>
      )}
    </Wrapper>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const isAdmin = !!user && (user.rol === 'admin' || user.rol === 'propietario');

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom max-w-5xl py-8">
        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Panel de creación
          </h1>
          <p className="mt-1 text-gray-600">
            Accesos directos para gestionar contenido y usuarios.
          </p>
        </motion.div>

        {/* Solo dos tarjetas */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <Card
            to="/dashboard/contenido"
            icon={DocumentTextIcon}
            title="Gestionar Contenido"
            description="Para Noticias y Eventos."
            gradient="from-blue-600 to-indigo-600"
          />

          <Card
            to="/dashboard/usuarios"
            icon={UserGroupIcon}
            title="Gestionar Usuarios"
            description="Dar acceso y permisos."
            gradient="from-emerald-500 to-teal-600"
            disabled={!isAdmin}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
