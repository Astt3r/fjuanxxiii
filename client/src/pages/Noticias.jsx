import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  CalendarIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  ChevronRightIcon,
  BookOpenIcon,
  TagIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { noticiasApi } from '../services/api';

const Noticias = () => {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    categoria: '',
    fechaDesde: '',
    fechaHasta: '',
    busqueda: ''
  });
  const [categorias, setCategorias] = useState([]);
  const [noticiasFiltradas, setNoticiasFiltradas] = useState([]);
  // Paginación local
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 9; // 3 columnas * 3 filas

  useEffect(() => {
    cargarNoticias();
    cargarCategorias();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  setPage(1); // reset al cambiar filtros
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noticias, filtros]);

  const cargarNoticias = async () => {
    try {
      setLoading(true);
      const response = await noticiasApi.getAll();
      //console.log('Response noticias:', response); // Debug
      // Extraer datos si vienen en formato {success: true, data: [...]}
      const noticiasData = response?.data || response || [];
      // Filtrar solo publicadas (normalizando posibles variantes "publicado/publicada")
      const normalizarEstado = (e) => (e || '').toString().toLowerCase();
      const soloPublicadas = Array.isArray(noticiasData)
        ? noticiasData.filter(n => {
            const est = normalizarEstado(n?.estado);
            return est === 'publicado' || est === 'publicada';
          })
        : [];
      setNoticias(soloPublicadas);
    } catch (error) {
      console.error('Error al cargar noticias:', error);
      setNoticias([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      const response = await noticiasApi.getCategories();
      //console.log('Response categorías:', response); // Debug
      setCategorias(response || []);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const aplicarFiltros = () => {
    let noticiasFilt = [...noticias];

    // Filtro por categoría
    if (filtros.categoria) {
      noticiasFilt = noticiasFilt.filter(noticia => 
        noticia.categoria?.toLowerCase() === filtros.categoria.toLowerCase()
      );
    }

    // Filtro por fecha desde
    if (filtros.fechaDesde) {
      const fechaDesde = new Date(filtros.fechaDesde);
      noticiasFilt = noticiasFilt.filter(noticia => 
        new Date(noticia.fecha_publicacion) >= fechaDesde
      );
    }

    // Filtro por fecha hasta
    if (filtros.fechaHasta) {
      const fechaHasta = new Date(filtros.fechaHasta);
      fechaHasta.setHours(23, 59, 59, 999); // Incluir todo el día
      noticiasFilt = noticiasFilt.filter(noticia => 
        new Date(noticia.fecha_publicacion) <= fechaHasta
      );
    }

    // Filtro por búsqueda
    if (filtros.busqueda) {
      const termino = filtros.busqueda.toLowerCase();
      noticiasFilt = noticiasFilt.filter(noticia => 
        noticia.titulo?.toLowerCase().includes(termino) ||
        noticia.resumen?.toLowerCase().includes(termino) ||
        noticia.contenido?.toLowerCase().includes(termino)
      );
    }

    setNoticiasFiltradas(noticiasFilt);
  };

  // Derivar paginación
  const total = noticiasFiltradas.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageNoticias = noticiasFiltradas.slice(start, start + PAGE_SIZE);

  useEffect(() => {
    // Si por filtros se reduce el total y la página actual queda fuera, reajustar
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const Pagination = ({ page, pageCount, onChange }) => {
    if (pageCount <= 1) return null;
    const go = (p) => {
      const np = Math.min(Math.max(1, p), pageCount);
      if (np !== page) onChange(np);
    };
    const windowSize = 5;
    const startWin = Math.max(1, page - Math.floor(windowSize / 2));
    const endWin = Math.min(pageCount, startWin + windowSize - 1);
    const pages = Array.from({ length: endWin - startWin + 1 }, (_, i) => startWin + i);
    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-10">
        <p className="text-sm text-gray-500">
          Mostrando {total === 0 ? 0 : start + 1}-{Math.min(start + PAGE_SIZE, total)} de {total} noticias
        </p>
        <div className="flex items-center gap-1">
          <button onClick={() => go(page - 1)} disabled={page === 1} className="px-3 py-1.5 text-sm rounded border hover:bg-gray-50 disabled:opacity-50">Anterior</button>
          {pages.map(p => (
            <button key={p} onClick={() => go(p)} className={`px-3 py-1.5 text-sm rounded border hover:bg-gray-50 ${p === page ? 'bg-blue-600 text-white border-blue-600' : ''}`}>{p}</button>
          ))}
          <button onClick={() => go(page + 1)} disabled={page === pageCount} className="px-3 py-1.5 text-sm rounded border hover:bg-gray-50 disabled:opacity-50">Siguiente</button>
        </div>
      </div>
    );
  };

  const manejarCambioFiltro = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      categoria: '',
      fechaDesde: '',
      fechaHasta: '',
      busqueda: ''
    });
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calcularTiempoLectura = (contenido) => {
    const palabras = contenido?.split(' ').length || 0;
    const minutos = Math.ceil(palabras / 200); // ~200 palabras por minuto
    return minutos;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white pt-20">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Noticias y Comunicados
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Mantente al día con las últimas novedades, eventos y logros de nuestra comunidad educativa
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filtros */}
      <section className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
          >
            {/* Búsqueda */}
            <div className="lg:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar noticias..."
                  value={filtros.busqueda}
                  onChange={(e) => manejarCambioFiltro('busqueda', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Categoría */}
            <div>
              <select
                value={filtros.categoria}
                onChange={(e) => manejarCambioFiltro('categoria', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas las categorías</option>
                {categorias.map(categoria => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
            </div>

            {/* Fecha desde */}
            <div>
              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => manejarCambioFiltro('fechaDesde', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Desde"
              />
            </div>

            {/* Fecha hasta */}
            <div>
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => manejarCambioFiltro('fechaHasta', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Hasta"
              />
            </div>
          </motion.div>

          {/* Botón limpiar filtros */}
          {(filtros.categoria || filtros.fechaDesde || filtros.fechaHasta || filtros.busqueda) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex justify-center"
            >
              <button
                onClick={limpiarFiltros}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Limpiar filtros ({noticiasFiltradas.length} resultados)
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Contenido */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="bg-white rounded-2xl shadow-sm h-96 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-2xl"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : noticiasFiltradas.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron noticias
              </h3>
              <p className="text-gray-600 mb-6">
                Intenta ajustar los filtros o buscar otros términos
              </p>
              <button
                onClick={limpiarFiltros}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Ver todas las noticias
              </button>
            </motion.div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                  {pageNoticias.map((noticia, index) => (
                    <motion.article
                      key={noticia.id || noticia.slug || `news-${noticia._id || noticia.uid || index}`}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -30 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
                    >
                    {/* Imagen o placeholder */}
                    <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 relative overflow-hidden">
                      {noticia.imagen_url ? (
                        <img 
                          src={noticia.imagen_url} 
                          alt={noticia.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <BookOpenIcon className="h-16 w-16 text-white opacity-50" />
                        </div>
                      )}
                      {noticia.destacada && (
                        <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium">
                          Destacada
                        </div>
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="p-6">
                      {/* Meta información */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {formatearFecha(noticia.fecha_publicacion)}
                        </div>
                        <div className="flex items-center space-x-3">
                          {noticia.categoria && (
                            <div className="flex items-center">
                              <TagIcon className="h-4 w-4 mr-1" />
                              {noticia.categoria}
                            </div>
                          )}
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {calcularTiempoLectura(noticia.contenido)} min
                          </div>
                        </div>
                      </div>

                      {/* Título */}
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {noticia.titulo}
                      </h3>

                      {/* Resumen */}
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {noticia.resumen || noticia.contenido?.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
                      </p>

                      {/* Autor */}
                      {noticia.autor && (
                        <p className="text-sm text-gray-500 mb-4">
                          Por {noticia.autor}
                        </p>
                      )}

                      {/* Link */}
                      <Link 
                        to={`/noticias/${noticia.slug || noticia.id}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors group-hover:translate-x-1 transform duration-200"
                      >
                        Leer más 
                        <ChevronRightIcon className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </motion.article>
                ))}
                </AnimatePresence>
              </div>
              <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Noticias;
