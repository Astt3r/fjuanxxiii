import React, { useState } from 'react';
import { motion } from 'framer-motion';

const equipo = [
  // Coordinación
  {
    nombre: 'Padre Iván García Campos',
    cargo: 'Coordinador de Pastoral',
    detalle: 'Fundación Juan XXIII',
  },
  // San Gabriel Arcángel
  {
    nombre: 'Karen Sanhueza Sanhueza',
    cargo: 'Encargada de Pastoral',
    detalle: 'Pre Básica y Primer Ciclo Básico — Colegio San Gabriel Arcángel',
  },
  {
    nombre: 'Rodrigo Saavedra Díaz',
    cargo: 'Encargado de Pastoral',
    detalle: 'Colegio San Gabriel Arcángel',
  },
  // San Rafael Arcángel
  {
    nombre: 'Ernesto Guzmán Muñoz',
    cargo: 'Encargado de Pastoral',
    detalle: 'Colegio San Rafael Arcángel',
  },
  {
    nombre: 'Carla Amaro Amaro',
    cargo: 'Encargada de Pastoral',
    detalle: 'Colegio San Rafael Arcángel',
  },
  // Padre Alberto Hurtado
  {
    nombre: 'Verónica Montecinos Villena',
    cargo: 'Encargada de Pastoral',
    detalle: 'Colegio Padre Alberto Hurtado',
  },
  // Juan Pablo II
  {
    nombre: 'Elba Melo Pinilla',
    cargo: 'Encargada de Pastoral',
    detalle: 'Colegio Juan Pablo II',
  },
  // Beato Damián de Molokai
  {
    nombre: 'Nancy Jara Seguel',
    cargo: 'Encargada de Pastoral',
    detalle: 'Colegio Beato Damián de Molokai',
  },
  // San Diego de Alcalá
  {
    nombre: 'Maritza Baeza Godoy',
    cargo: 'Encargada de Pastoral',
    detalle: 'Colegio San Diego de Alcalá',
  },
  // San Jorge de Laja
  {
    nombre: 'Jonatan Díaz Díaz',
    cargo: 'Encargado de Pastoral',
    detalle: 'Colegio San Jorge de Laja',
  },
];

function Card({ persona }) {
  const [open, setOpen] = useState(false);
  // avatar con iniciales (evita imágenes rotas)
  const iniciales = persona.nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0].toUpperCase())
    .join('');

  return (
    <div className="bg-[#f3dfc7] border border-[#d9c3a6] rounded-xl p-5 flex flex-col h-full">
      {/* “foto” simple con iniciales */}
      <div className="w-28 h-28 rounded-md bg-[#c3a97f] text-white grid place-items-center text-2xl font-semibold mx-auto mb-4">
        {iniciales}
      </div>

      <h3 className="text-center text-2xl font-extrabold leading-tight mb-1">
        {persona.nombre}
      </h3>

      <p className="text-center text-sm text-gray-700 uppercase tracking-wide">
        {persona.cargo}
      </p>
      {persona.detalle && (
        <p className="text-center text-sm text-gray-700 mt-1 leading-snug">
          {persona.detalle}
        </p>
      )}

      <button
        onClick={() => setOpen(v => !v)}
        className="mt-4 mx-auto text-[#0b5bd3] font-semibold hover:underline"
      >
        Ver+
      </button>

      {open && (
        <div className="mt-3 text-sm text-gray-800 bg-[#ead3b4] border border-[#d9c3a6] rounded-lg p-3">
          {/* si más adelante tienes biografías o enlaces, van acá */}
          Información adicional próximamente.
        </div>
      )}
    </div>
  );
}

const Pastoral = () => {
  return (
    <div className="min-h-screen bg-white pt-6">
      <div className="container-custom pb-10">
        {/* grilla principal del contenido interno */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {equipo.map((p, idx) => (
            <Card key={idx} persona={p} />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Pastoral;
