import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserCircleIcon,
  UsersIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/solid';

const GRADIENT = 'from-indigo-600 to-blue-600';

const equipo = [
  { nombre: 'Padre Iván García Campos', cargo: 'Coordinador de Pastoral', detalle: 'Fundación Juan XXIII' },
  { nombre: 'Karen Sanhueza Sanhueza', cargo: 'Encargada de Pastoral', detalle: 'Prebásica y 1er Ciclo — CS Gabriel Arcángel' },
  { nombre: 'Rodrigo Saavedra Díaz', cargo: 'Encargado de Pastoral', detalle: 'Colegio San Gabriel Arcángel' },
  { nombre: 'Ernesto Guzmán Muñoz', cargo: 'Encargado de Pastoral', detalle: 'Colegio San Rafael Arcángel' },
  { nombre: 'Carla Amaro Amaro', cargo: 'Encargada de Pastoral', detalle: 'Colegio San Rafael Arcángel' },
  { nombre: 'Verónica Montecinos Villena', cargo: 'Encargada de Pastoral', detalle: 'Colegio Padre Alberto Hurtado' },
  { nombre: 'Elba Melo Pinilla', cargo: 'Encargada de Pastoral', detalle: 'Colegio Juan Pablo II' },
  { nombre: 'Nancy Jara Seguel', cargo: 'Encargada de Pastoral', detalle: 'Colegio Beato Damián de Molokai' },
  { nombre: 'Maritza Baeza Godoy', cargo: 'Encargada de Pastoral', detalle: 'Colegio San Diego de Alcalá' },
  { nombre: 'Jonatan Díaz Díaz', cargo: 'Encargado de Pastoral', detalle: 'Colegio San Jorge de Laja' },
];

// Tarjetería del equipo
function PersonaCard({ p, destacado = false }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-6 h-full flex flex-col
      ${destacado ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-gray-200'}`}>
      <div className="mx-auto mb-4">
        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${GRADIENT} grid place-items-center shadow-inner`}>
          <UserCircleIcon className="w-20 h-20 text-white/95" aria-hidden="true" />
        </div>
      </div>
      <h3 className="text-center text-lg font-semibold text-gray-900">{p.nombre}</h3>
      <p className="text-center text-sm font-medium mt-1 bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md inline-block mx-auto">
        {p.cargo}
      </p>
      {p.detalle && <p className="text-center text-sm text-gray-500 mt-1">{p.detalle}</p>}

      {open && (
        <div className="mt-4 text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
          Información adicional próximamente.
        </div>
      )}

      <button
        onClick={() => setOpen(v => !v)}
        className="mt-4 self-center text-sm font-medium text-indigo-600 hover:text-indigo-700 focus:outline-none inline-flex items-center gap-1"
      >
        {open ? 'Ocultar' : 'Ver más'} <ArrowRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function Pastoral() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* HERO */}
      <section className={`relative overflow-hidden`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENT}`} />
        {/* Patrón suave */}
        <svg className="absolute opacity-20 -top-10 -right-10 w-[42rem] h-[42rem]" viewBox="0 0 600 600" aria-hidden="true">
          <defs>
            <radialGradient id="g1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="300" cy="300" r="300" fill="url(#g1)" />
        </svg>

        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center text-white"
            >

              <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                Área Pastoral
              </h1>

            </motion.div>
          </div>
        </div>
      </section>

      

      {/* EQUIPO */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Equipo de Pastoral</h2>
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
            <UsersIcon className="w-4 h-4" /> {equipo.length} integrantes
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {equipo.map((p, i) => (
            <PersonaCard key={p.nombre} p={p} destacado={i === 0} />
          ))}
        </motion.div>
      </section>

      
    </div>
  );
}
