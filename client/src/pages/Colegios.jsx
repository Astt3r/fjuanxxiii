import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { colegiosApi } from '../services/api';
import { getColegioLogo, getColegioColor } from '../assets';
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  CalendarIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const Colegios = () => {
  const [colegios, setColegios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const data = await colegiosApi.getAll();
        setColegios(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        setError(err?.message || 'Error desconocido');
        setColegios([]);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const colegiosFiltrados = useMemo(() => {
    if (!query.trim()) return colegios;
    const q = query.trim().toLowerCase();
    return colegios.filter(c =>
      [c.nombre, c.direccion, c.email, c.telefono]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(q))
    );
  }, [colegios, query]);

    const ColegioCard = ({ colegio, index }) => {
  const [fit, setFit] = useState(''); // 'wide' | 'tall' | ''
  const logo = getColegioLogo(colegio.slug);
  const colorGradient = getColegioColor(colegio.slug); // ej: "from-blue-600 to-indigo-600"
  const mapsHref = colegio.direccion
    ? `https://www.google.com/maps?q=${encodeURIComponent(colegio.direccion)}`
    : null;

  const initials = (colegio.nombre || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('');

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.03 }}
      className="group relative rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-shadow"
    >
      {/* Fondo brand sutil */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorGradient} opacity-10`} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent" />

      {/* Marca de agua (muy suave) */}
      {logo && (
        <img
          src={logo}
          alt=""
          aria-hidden
          className="absolute -right-4 -bottom-4 w-28 md:w-36 opacity-10 select-none pointer-events-none object-contain"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      )}

      {/* Header con logo protagonista y medallón no-blanco */}
      <div className="px-6 pt-8">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="relative shrink-0">
            {/* Glow suave detrás del medallón */}
            <div className={`absolute -inset-2 -z-10 rounded-3xl opacity-20 blur-2xl bg-gradient-to-br ${colorGradient}`} />
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gray-50 ring-1 ring-gray-300 grid place-items-center overflow-hidden shadow-sm">
              {logo ? (
                <img
                  src={logo}
                  alt={`Logo ${colegio.nombre}`}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    setFit(img.naturalWidth >= img.naturalHeight ? 'wide' : 'tall');
                  }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  className={
                    // Nota: object-contain para no recortar; escalamos un poquito según proporción
                    `object-contain transition-transform duration-300
                     max-w-[85%] max-h-[85%]
                     ${fit === 'wide' ? 'scale-95' : fit === 'tall' ? 'scale-100' : ''}
                     [filter:drop-shadow(0_0_0.75px_rgba(0,0,0,0.35))]`
                  }
                />
              ) : (
                <span className="text-2xl md:text-3xl font-bold text-gray-400">
                  {initials || <AcademicCapIcon className="h-8 w-8" />}
                </span>
              )}
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {colegio.nombre}
            </h3>
            {colegio.año_fundacion && (
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                <CalendarIcon className="h-4 w-4" />
                <span>Fundado en {colegio.año_fundacion}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Descripción */}
      {colegio.descripcion && (
        <p className="px-6 mt-4 text-gray-700 leading-relaxed line-clamp-3">
          {colegio.descripcion}
        </p>
      )}

      {/* Info y acciones */}
      <div className="px-6 mt-5 space-y-3">
        {colegio.direccion && (
          <div className="flex items-start gap-3 text-sm text-gray-700">
            <MapPinIcon className="h-5 w-5 text-gray-500 mt-0.5 shrink-0" />
            <span className="leading-snug">{colegio.direccion}</span>
          </div>
        )}
        {colegio.telefono && (
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <PhoneIcon className="h-5 w-5 text-gray-500 shrink-0" />
            <a href={`tel:${colegio.telefono}`} className="hover:text-gray-900">
              {colegio.telefono}
            </a>
          </div>
        )}
        {colegio.email && (
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <EnvelopeIcon className="h-5 w-5 text-gray-500 shrink-0" />
            <a href={`mailto:${colegio.email}`} className="text-primary-600 hover:text-primary-700">
              {colegio.email}
            </a>
          </div>
        )}
      </div>

      {/* Footer de acciones */}
      <div className="px-6 py-5 mt-2 flex flex-wrap items-center gap-2 border-t border-gray-100 bg-white/60 backdrop-blur">
        {colegio.website && (
          <a
            href={colegio.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition"
          >
            <GlobeAltIcon className="h-4 w-4" />
            Sitio web
          </a>
        )}
        {colegio.telefono && (
          <a
            href={`tel:${colegio.telefono}`}
            className="inline-flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition"
          >
            <PhoneIcon className="h-4 w-4" />
            Llamar
          </a>
        )}
        {mapsHref && (
          <a
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition"
          >
            <MapPinIcon className="h-4 w-4" />
            Cómo llegar
          </a>
        )}
      </div>
    </motion.article>
  );
};


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container-custom py-10">
          {/* Skeleton Header */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="h-8 w-64 mx-auto mb-3 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-96 mx-auto rounded bg-gray-200 animate-pulse" />
          </div>
          {/* Skeleton grid */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="h-10 w-10 rounded-xl bg-gray-200 animate-pulse" />
                <div className="mt-4 h-4 w-3/5 bg-gray-200 rounded animate-pulse" />
                <div className="mt-2 h-4 w-4/5 bg-gray-200 rounded animate-pulse" />
                <div className="mt-6 h-20 w-full bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container-custom py-10">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-800">Error al cargar los colegios: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
      <div className="container-custom py-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Nuestros Colegios
          </h1>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Red de establecimientos educacionales comprometidos con una educación integral y de calidad.
          </p>
        </motion.div>

        {/* Barra de búsqueda (sin “destacados”) */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca por nombre, dirección, email o teléfono…"
              className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Grid de colegios */}
        {colegiosFiltrados.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {colegiosFiltrados.map((colegio, idx) => (
              <ColegioCard key={colegio.id || colegio.slug || idx} colegio={colegio} index={idx} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              No encontramos colegios con “{query}”.
            </p>
          </div>
        )}

        {/* Franja informativa suave (sin métricas de destacados) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-8 text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Educación Católica de Calidad
          </h2>
          <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
            En la Región del Biobío, nuestra red de colegios ofrece formación académica y valórica desde
            educación parvularia hasta enseñanza media.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Colegios;
