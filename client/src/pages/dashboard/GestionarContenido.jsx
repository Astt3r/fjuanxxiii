import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useContentStats } from '../../hooks/useContentStats';
import API_CONFIG from '../../config/api';
import toast from 'react-hot-toast';

import {
  PlusIcon,
  DocumentTextIcon,
  CalendarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
  NewspaperIcon,
  ClockIcon,
  MapPinIcon,
  Bars3Icon,
  FunnelIcon, 
  XMarkIcon

  
} from '@heroicons/react/24/outline';

// Componente de paginación local (ventana de 5 páginas)
const Pagination = ({ page, pageCount, onChange }) => {
  const go = (p) => {
    const np = Math.min(Math.max(1, p), pageCount);
    if (np !== page) onChange(np);
  };

  const windowSize = 5;
  const start = Math.max(1, page - Math.floor(windowSize / 2));
  const end = Math.min(pageCount, start + windowSize - 1);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-t border-gray-200 text-sm">
      <div className="text-gray-500">Página {page} de {pageCount}</div>
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={() => go(page - 1)}
          className="px-3 py-1.5 text-sm rounded border hover:bg-gray-50 disabled:opacity-50"
          disabled={page === 1}
        >
          Anterior
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => go(p)}
            className={`px-3 py-1.5 text-sm rounded border hover:bg-gray-50 ${p === page ? 'bg-primary-600 text-white border-primary-600' : ''}`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => go(page + 1)}
          className="px-3 py-1.5 text-sm rounded border hover:bg-gray-50 disabled:opacity-50"
          disabled={page === pageCount}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

// // Datos de ejemplo para eventos (hasta que esté lista la API)
// const eventosEjemplo = [
//   {
//     id: 1,
//     titulo: 'Reunión de Apoderados 4° Básico',
//     descripcion: 'Reunión informativa sobre el proceso académico del segundo semestre',
//     fechaInicio: '2025-08-15',
//     horaInicio: '19:00',
//     ubicacion: 'Aula Magna',
//     tipoEvento: 'reunion',
//     categoria: 'padres',
//     estado: 'activo',
//     color: '#F59E0B'
//   },
//   {
//     id: 2,
//     titulo: 'Campeonato Interescolar de Fútbol',
//     descripcion: 'Torneo deportivo entre los colegios de la fundación',
//     fechaInicio: '2025-08-20',
//     horaInicio: '09:00',
//     ubicacion: 'Cancha Principal',
//     tipoEvento: 'deportivo',
//     categoria: 'deportes',
//     estado: 'activo',
//     color: '#10B981'
//   },
//   {
//     id: 3,
//     titulo: 'Misa de Inicio de Año Escolar',
//     descripcion: 'Celebración religiosa para bendecir el nuevo año académico',
//     fechaInicio: '2025-08-25',
//     horaInicio: '10:00',
//     ubicacion: 'Capilla del Colegio',
//     tipoEvento: 'religioso',
//     categoria: 'pastoral',
//     estado: 'activo',
//     color: '#DC2626'
//   }
// ];

const GestionarContenido = () => {
  const { stats, refreshStats } = useContentStats();
  const [activeTab, setActiveTab] = useState('noticias');
  const [noticias, setNoticias] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [monthFilter, setMonthFilter] = useState('todos'); // '1'..'12' o 'todos'
  const [yearFilter, setYearFilter] = useState('todos');   // '2024'.. o 'todos'
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const toYear = (d) => {
    const dt = new Date(d);
    return isNaN(dt) ? null : dt.getFullYear();
  };
  const yearsNoticias = Array.from(new Set(
    (noticias || []).map(n => toYear(n.fecha_publicacion || n.created_at)).filter(Boolean)
  )).sort((a,b) => b - a);
  const yearsEventos = Array.from(new Set(
    (eventos || []).map(e => toYear(e.fechaInicio)).filter(Boolean)
  )).sort((a,b) => b - a);

  // Paginación local
  const [pageNews, setPageNews] = useState(1);
  const [pageEvents, setPageEvents] = useState(1);
  const PAGE_SIZE_NEWS = 10; // filas por página (tabla noticias)
  const PAGE_SIZE_EVENTS = 9; // cards por página (3x3 eventos)
  // Totales globales (servidor o fallback local)
  const [totalNewsAll, setTotalNewsAll] = useState(null);
  const [totalEventsAll, setTotalEventsAll] = useState(null);
  
  // Equivalencias de estados para manejar posibles variaciones desde backend
  const estadoEquivalencias = {
    publicado: ['publicado', 'publicada'],
    borrador: ['borrador', 'draft', 'pendiente'],
    activo: ['activo', 'activa'],
    programado: ['programado', 'scheduled'],
    cancelado: ['cancelado', 'cancelada'],
    pospuesto: ['pospuesto', 'aplazado'],
    realizado: ['realizado', 'hecho']
  };
  
  // Opciones de estado según pestaña activa
  const statusOptionsNoticias = [
    { value: 'todos', label: 'Todos' },
    { value: 'publicado', label: 'Publicado' },
    { value: 'borrador', label: 'Borrador' }
  ];
  const statusOptionsEventos = [
    { value: 'todos', label: 'Todos' },
    { value: 'activo', label: 'Activo' },
    { value: 'programado', label: 'Programado' },
    { value: 'pospuesto', label: 'Pospuesto' },
    { value: 'cancelado', label: 'Cancelado' },
    { value: 'realizado', label: 'Realizado' }
  ];

  // Helper para normalizar el estado de una noticia (maneja distintas formas del backend)
  const getEstadoNoticia = (n) => {
    if (!n) return 'borrador';
    const raw = (
      n.estado ||
      n.status ||
      n.estado_publicacion ||
      (n.publicado === true ? 'publicado' : undefined) ||
      (n.borrador === true ? 'borrador' : undefined) ||
      ''
    ).toString().toLowerCase();
    if (estadoEquivalencias.publicado.includes(raw)) return 'publicado';
    if (estadoEquivalencias.borrador.includes(raw)) return 'borrador';
    return raw || 'borrador';
  };
  
  // Estados para modales
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemType, setItemType] = useState(''); // 'noticia' o 'evento'

  // (Tabs se redefinen más abajo una vez calculados badges dinámicos)

  const loadNoticias = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      let urlBase = API_CONFIG.getNoticiasURL();
      let useAdmin = false;
      if(token){
        // Intentar endpoint admin que incluye borradores
        urlBase = `${API_CONFIG.baseURL}/noticias/admin/list`;
        useAdmin = true;
      }
      const response = await fetch(`${urlBase}?limite=500&pagina=1`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const result = await response.json();
        const noticiasData = result.data || result; // admin devuelve array simple
        setNoticias(Array.isArray(noticiasData) ? noticiasData : []);
        // total desde API si viene en meta/total/count; si no, largo del array (fallback)
        const serverTotalNews = result?.meta?.total ?? result?.total ?? result?.count;
        setTotalNewsAll(
          typeof serverTotalNews === 'number'
            ? serverTotalNews
            : (Array.isArray(noticiasData) ? noticiasData.length : 0)
        );
      } else {
        if(useAdmin && response.status === 401){
          // Reintentar público
          const pub = await fetch(`${API_CONFIG.getNoticiasURL()}?limite=500&pagina=1`);
          if(pub.ok){
            const r=await pub.json();
            const noticiasData = r.data || [];
            setNoticias(Array.isArray(noticiasData) ? noticiasData : []);
            const serverTotalNews = r?.meta?.total ?? r?.total ?? r?.count;
            setTotalNewsAll(
              typeof serverTotalNews === 'number'
                ? serverTotalNews
                : (Array.isArray(noticiasData) ? noticiasData.length : 0)
            );
          } else {
            throw new Error('Error al cargar noticias públicas');
          }
        } else {
          console.error('Error al cargar noticias:', response.statusText);
          throw new Error('Error en la respuesta del servidor');
        }
      }
      refreshStats(); // Actualizar estadísticas
    } catch (error) {
      console.error('Error al cargar noticias:', error);
      toast.error('Error al cargar noticias. Mostrando datos de ejemplo.');
      // Datos de ejemplo si no hay API o hay error
      setNoticias([
        {
          id: 1,
          titulo: 'Inicio del Año Escolar 2025',
          autor: 'Dirección Académica',
          fecha_publicacion: '2025-08-01',
          estado: 'publicado',
          categoria: 'Educación',
          destacado: true,
          resumen: 'Información importante sobre el inicio del nuevo año escolar'
        },
        {
          id: 2,
          titulo: 'Nuevos Protocolos de Seguridad',
          autor: 'Coordinación',
          fecha_publicacion: '2025-08-05',
          estado: 'publicado',
          categoria: 'General',
          destacado: false,
          resumen: 'Actualización de protocolos de seguridad para el año 2025'
        }
      ]);
  setTotalNewsAll(2);
    } finally {
      setLoading(false);
    }
  };

  const loadEventos = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_CONFIG.getEventsURL());
      if (response.ok) {
        const data = await response.json();
        
        // Asegurar que siempre trabajamos con un array
        const eventosData = Array.isArray(data) ? data : [];
        
        // Transformar los eventos para el formato esperado por el componente
        const eventosFormateados = eventosData.map(evento => ({
          id: evento.id,
            titulo: evento.titulo,
            descripcion: evento.descripcion,
            fechaInicio: evento.fecha_evento ? evento.fecha_evento.split('T')[0] : new Date().toISOString().split('T')[0],
            horaInicio: evento.hora_inicio ? evento.hora_inicio.substring(0, 5) : '00:00',
            ubicacion: evento.ubicacion || 'Sin ubicación',
            tipoEvento: evento.tipo,
            categoria: evento.tipo,
            estado: evento.estado,
            color: evento.color
        }));
        setEventos(eventosFormateados);
        const serverTotalEvents = data?.meta?.total ?? data?.total ?? data?.count;
        setTotalEventsAll(
          typeof serverTotalEvents === 'number'
            ? serverTotalEvents
            : (Array.isArray(eventosData) ? eventosData.length : 0)
        );
        refreshStats(); // Actualizar estadísticas
      } else {
        throw new Error('Error al cargar eventos desde la API');
      }
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      // Fallback a datos de ejemplo
      // setEventos(eventosEjemplo);
      // setTotalEventsAll(eventosEjemplo.length);
      toast.error('Error al cargar eventos. Mostrando datos de ejemplo.');
    } finally {
      setLoading(false);
    }
  };

  // Funciones CRUD
  const handleView = (item, type) => {
    setSelectedItem(item);
    setItemType(type);
    setShowViewModal(true);
  };

  const handleEdit = (item, type) => {
    // Redirigir a las páginas de edición correspondientes
    if (type === 'noticia') {
      window.location.href = `/dashboard/contenido/editar/${item.id}`;
    } else {
      window.location.href = `/dashboard/eventos/editar/${item.id}`;
    }
  };

  const handleDelete = (item, type) => {
    setSelectedItem(item);
    setItemType(type);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem || !itemType) return;

    try {
      const endpoint = itemType === 'noticia' 
        ? `${API_CONFIG.baseURL}/noticias/${selectedItem.id}`
        : `${API_CONFIG.baseURL}/events/${selectedItem.id}`;

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success(`${itemType === 'noticia' ? 'Noticia' : 'Evento'} eliminado correctamente`);
        
        // Actualizar la lista correspondiente
        if (itemType === 'noticia') {
          setNoticias(prev => prev.filter(n => n.id !== selectedItem.id));
        } else {
          setEventos(prev => prev.filter(e => e.id !== selectedItem.id));
        }
        
        // Actualizar estadísticas
        refreshStats();
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error(`Error al eliminar ${itemType === 'noticia' ? 'la noticia' : 'el evento'}`);
    } finally {
      setShowDeleteModal(false);
      setSelectedItem(null);
      setItemType('');
    }
  };

  const closeModals = () => {
    setShowViewModal(false);
    setShowDeleteModal(false);
    setSelectedItem(null);
    setItemType('');
  };

  useEffect(() => {
    if (activeTab === 'noticias') {
      loadNoticias();
    } else if (activeTab === 'eventos') {
      loadEventos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Resetear página cuando cambian filtros o búsqueda
  useEffect(() => {
    setPageNews(1);
    setPageEvents(1);
  }, [searchTerm, filterStatus, monthFilter, yearFilter]);

  // Al cambiar de pestaña, reiniciar filtros de estado y búsqueda
  useEffect(() => {
    setFilterStatus('todos');
    setSearchTerm('');
  }, [activeTab]);

  // Sincronizar totales globales con stats del hook si están disponibles
  useEffect(() => {
    if (stats?.totalNoticias != null) setTotalNewsAll(stats.totalNoticias);
    if (stats?.totalEvents != null) setTotalEventsAll(stats.totalEvents);
  }, [stats]);
  useEffect(() => {
    refreshStats();
  }, []);


  const getStatusBadge = (estado) => {
    const statusConfig = {
      publicado: { bg: 'bg-green-100', text: 'text-green-800', label: 'Publicado' },
      borrador: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Borrador' },
      activo: { bg: 'bg-green-100', text: 'text-green-800', label: 'Activo' },
      programado: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Programado' },
      pospuesto: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Pospuesto' },
      cancelado: { bg: 'bg-red-100',   text: 'text-red-800',   label: 'Cancelado' },
      realizado: { bg: 'bg-gray-100',  text: 'text-gray-800',  label: 'Realizado' }
    };

    const config = statusConfig[estado] || statusConfig.borrador;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getTipoEventoBadge = (tipo) => {
    const tiposConfig = {
      educativo: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Educativo' },
      deportivo: { bg: 'bg-green-100', text: 'text-green-800', label: 'Deportivo' },
      cultural: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Cultural' },
      religioso: { bg: 'bg-red-100', text: 'text-red-800', label: 'Religioso' },
      reunion: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Reunión' },
      taller: { bg: 'bg-cyan-100', text: 'text-cyan-800', label: 'Taller' },
      ceremonia: { bg: 'bg-pink-100', text: 'text-pink-800', label: 'Ceremonia' },
      conferencia: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Conferencia' }
    };

    const config = tiposConfig[tipo] || { bg: 'bg-gray-100', text: 'text-gray-800', label: tipo };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '00:00';
    
    // Si ya está en formato HH:MM, devolverlo tal como está
    if (timeString.includes(':') && timeString.length <= 5) {
      return timeString;
    }
    
    // Si viene con segundos (HH:MM:SS), quitar los segundos
    if (timeString.includes(':') && timeString.length > 5) {
      return timeString.substring(0, 5);
    }
    
    return timeString;
  };

  const normalizarEstado = (valor) => (valor || '').toLowerCase();

  const estadoCoincide = (filtro, estadoItem) => {
    if (filtro === 'todos') return true;
    const estadoNorm = normalizarEstado(estadoItem);
    const equivalencias = estadoEquivalencias[filtro];
    if (equivalencias) return equivalencias.includes(estadoNorm);
    return filtro === estadoNorm; // fallback
  };

  // === Derivar estado local coherente con tu SQL ===
 const parseEventDateTime = (e) => {
   const f  = e.fechaInicio;
   const hi = e.horaInicio || '00:00';
   const hf = e.horaFin || null;
   const start = f ? new Date(`${f}T${hi}`) : null;
   const end   = (f && hf) ? new Date(`${f}T${hf}`) : null;
   return { start, end };
};
  const estadoEventoLocal = (e) => {
    const base = (e.estado || '').toLowerCase();
    if (['cancelado', 'pospuesto', 'realizado'].includes(base)) return base;
    const { start, end } = parseEventDateTime(e);
    const now = new Date();
    if (!start) return base || 'activo';
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const today    = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (startDay < today) return 'realizado';
    if (end && startDay.getTime() === today.getTime() && end < now) return 'realizado';
    if (!end && startDay.getTime() === today.getTime()) {
      const sixHoursAgo = new Date(now.getTime() - 6*60*60*1000);
      
      if (start < sixHoursAgo) return 'realizado';
    }
    return (start > now) ? 'programado' : (base || 'activo');
  };

  const isLockedEvent = (e) => estadoEventoLocal(e) === 'realizado';

  const filteredNoticias = noticias.filter(noticia => {
    if (!noticia || !noticia.titulo) return false;
    const estadoNorm = getEstadoNoticia(noticia);
    const matchesSearch = noticia.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = estadoCoincide(filterStatus, estadoNorm);
    const baseDate = noticia.fecha_publicacion || noticia.created_at; // se usa también al renderizar
    const dt = baseDate ? new Date(baseDate) : null;                  // :contentReference[oaicite:2]{index=2}
    const yearOk  = yearFilter === 'todos'  || (dt && dt.getFullYear() === Number(yearFilter));
    const monthOk = monthFilter === 'todos' || (dt && (dt.getMonth() + 1) === Number(monthFilter));
    return matchesSearch && matchesFilter && yearOk && monthOk;
   });

  const filteredEventos = eventos.filter(evento => {
    if (!evento || !evento.titulo) return false;
    const matchesSearch = evento.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const estadoLocal = estadoEventoLocal(evento);
    const matchesFilter = estadoCoincide(filterStatus, estadoLocal);
    const dt = new Date(`${evento.fechaInicio}T${evento.horaInicio || '00:00'}`); // :contentReference[oaicite:3]{index=3}
    const valid = !isNaN(dt);
    const yearOk  = yearFilter === 'todos'  || (valid && dt.getFullYear() === Number(yearFilter));
    const monthOk = monthFilter === 'todos' || (valid && (dt.getMonth() + 1) === Number(monthFilter));
    return matchesSearch && matchesFilter && yearOk && monthOk;
  });
  const toDateTime = (e) => new Date(`${e.fechaInicio}T${(e.horaInicio || '00:00')}`);

  const sortEventosByProximity = (a, b) => {
    const now = new Date();
    const da = toDateTime(a), db = toDateTime(b);
    const aDone = estadoEventoLocal(a) === 'realizado';
    const bDone = estadoEventoLocal(b) === 'realizado';
    if (aDone !== bDone) return aDone ? 1 : -1;
    const aFuture = da >= now, bFuture = db >= now;
    if (aFuture !== bFuture) return aFuture ? -1 : 1; // futuros primero
    return da - db; // más próximos antes
  };


  // Badges dinámicos (filtrados/total)
  const badgeNews =
    searchTerm || filterStatus !== 'todos'
      ? `${filteredNoticias.length}${(totalNewsAll != null && totalNewsAll !== filteredNoticias.length) ? `/${totalNewsAll}` : ''}`
      : (totalNewsAll ?? filteredNoticias.length);

  const badgeEvents =
    (searchTerm || filterStatus !== 'todos')
      ? `${filteredEventos.length}${(totalEventsAll != null && totalEventsAll !== filteredEventos.length) ? `/${totalEventsAll}` : ''}`
      : (totalEventsAll ?? (stats?.totalEvents ?? '…'));

  const tabs = [
    { id: 'noticias', name: 'Noticias', icon: NewspaperIcon, count: badgeNews },
    { id: 'eventos', name: 'Eventos', icon: CalendarIcon, count: badgeEvents }
  ];
    const handleDuplicate = (evento) => {
    if (!evento?.id) return;
    // Redirige al crear con el id a duplicar
    window.location.href = `/dashboard/eventos/crear?duplicateId=${evento.id}`;
  };

  // Noticias paginadas (local)
 const sortedNoticias = [...filteredNoticias].sort((a, b) =>
   new Date(b.fecha_publicacion || b.created_at) - new Date(a.fecha_publicacion || a.created_at)
 );
 const totalNews = sortedNoticias.length;
 const pageCountNews = Math.max(1, Math.ceil(totalNews / PAGE_SIZE_NEWS));
 const startNews = (pageNews - 1) * PAGE_SIZE_NEWS;
 const pageNoticias = sortedNoticias.slice(startNews, startNews + PAGE_SIZE_NEWS);

  // Eventos paginados
  const sortedEventos = [...filteredEventos].sort(sortEventosByProximity);
  const totalEvents = sortedEventos.length;
  const pageCountEvents = Math.max(1, Math.ceil(totalEvents / PAGE_SIZE_EVENTS));
  const startEvents = (pageEvents - 1) * PAGE_SIZE_EVENTS;
  const pageEventos = sortedEventos.slice(startEvents, startEvents + PAGE_SIZE_EVENTS);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestión de Contenido
            </h1>
            <p className="text-gray-600">
              Administra noticias y eventos de la fundación
            </p>
          </div>
          {/* Topbar móvil */}
           <div className="md:hidden sticky top-16 z-30 bg-white/90 backdrop-blur border-b">
             <div className="px-4 py-3 flex items-center justify-between">
               <button
                 onClick={() => setMobileActionsOpen(true)}
                 className="p-2 rounded-lg border border-gray-200 text-gray-700"
                 aria-label="Abrir menú"
               >
                 <Bars3Icon className="h-5 w-5" />
               </button>
               <div className="text-sm font-medium text-gray-900">
                {activeTab === 'noticias' ? 'Noticias' : 'Eventos'}
               </div>
               <button
                 onClick={() => setMobileFiltersOpen(true)}
                 className="p-2 rounded-lg border border-gray-200 text-gray-700"
                 aria-label="Abrir filtros"
               >
                 <FunnelIcon className="h-5 w-5" />
               </button>
             </div>
           </div>

          {/* Actions Bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Create Buttons */}
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/dashboard/contenido/crear"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Nueva Noticia
                </Link>
                <Link
                  to="/dashboard/eventos/crear"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Nuevo Evento
                </Link>
              </div>

              {/* Search and Filter (desktop) */}
              <div className="hidden md:flex flex-1 max-w-5xl gap-3">
                <div className="relative flex-1 min-w-0">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar contenido..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-[160px]"
                >
                  {(activeTab === 'noticias' ? statusOptionsNoticias : statusOptionsEventos).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {/* Mes */}
                <select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-[140px]"
                >
                  <option value="todos">Mes (todos)</option>
                  {[
                    [1,'Enero'],[2,'Febrero'],[3,'Marzo'],[4,'Abril'],[5,'Mayo'],[6,'Junio'],
                    [7,'Julio'],[8,'Agosto'],[9,'Septiembre'],[10,'Octubre'],[11,'Noviembre'],[12,'Diciembre']
                  ].map(([v,label]) => <option key={v} value={v}>{label}</option>)}
                </select>

                {/* Año (dinámico por pestaña) */}
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-[120px]"
                >
                  <option value="todos">Año (todos)</option>
                  {(activeTab === 'noticias' ? yearsNoticias : yearsEventos).map(y =>
                    <option key={y} value={y}>{y}</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                    <span className="bg-gray-100 text-gray-600 ml-2 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'noticias' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Noticias</h2>
              </div>
              
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Cargando noticias...</p>
                </div>
              ) : filteredNoticias.length === 0 ? (
                <div className="p-8 text-center">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay noticias</h3>
                  <p className="text-gray-600 mb-4">Comienza creando tu primera noticia</p>
                  <Link
                    to="/dashboard/contenido/crear"
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Nueva Noticia
                  </Link>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 table-fixed">
                      <thead className="bg-gray-50">
                        <tr>
                          {/* Ajustes de ancho: título puede envolver y autor más compacto */}
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">
                            Título
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                            Autor
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                            Fecha
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                            Estado
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {/* Paginación aplicada: usar pageNoticias */}
                        {pageNoticias.map((noticia) => {
                          const estadoNorm = getEstadoNoticia(noticia);
                          return (
                          <tr key={noticia.id} className="hover:bg-gray-50 align-top">
                            <td className="px-4 py-4 whitespace-normal break-words">
                              <div className="flex items-start">
                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-gray-900 line-clamp-2 break-words">
                                    {String(noticia.titulo).replace(/\s*\(\d+\)\s*$/, '')}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {noticia.categoria}
                                  </div>
                                </div>
                                {!!noticia.destacado && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 shrink-0">
                                    Destacado
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className="block truncate max-w-[7rem]" title={noticia.autor}>{noticia.autor}</span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(noticia.fecha_publicacion || noticia.created_at)}
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              {getStatusBadge(estadoNorm)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => handleView(noticia, 'noticia')}
                                  className="text-gray-400 hover:text-gray-600"
                                  title="Ver"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleEdit(noticia, 'noticia')}
                                  className="text-indigo-600 hover:text-indigo-900"
                                  title="Editar"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(noticia, 'noticia')}
                                  className="text-red-600 hover:text-red-900"
                                  title="Eliminar"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );})}
                      </tbody>
                    </table>
                  </div>
                  <Pagination page={pageNews} pageCount={pageCountNews} onChange={setPageNews} />
                </>
              )}
            </div>
          )}

          {activeTab === 'eventos' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Eventos</h2>
              </div>
              
              {filteredEventos.length === 0 ? (
                <div className="p-8 text-center">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay eventos</h3>
                  <p className="text-gray-600 mb-4">Comienza creando tu primer evento</p>
                  <Link
                    to="/dashboard/eventos/crear"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Nuevo Evento
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
                    {/* Paginación aplicada: usar pageEventos */}
                    {pageEventos.map((evento) => (
                      <motion.div
                        key={evento.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        style={{ borderLeftColor: evento.color, borderLeftWidth: '4px' }}
                      >
                        <div className="flex items-start justify-between mb-3 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 line-clamp-2 break-words">
                            {evento.titulo}
                          </h3>
                          {getStatusBadge(estadoEventoLocal(evento))}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {evento.descripcion}
                        </p>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="h-4 w-4 mr-2" />
                            {formatDate(evento.fechaInicio)} a las {formatTime(evento.horaInicio)}
                          </div>
                          {evento.ubicacion && (
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPinIcon className="h-4 w-4 mr-2" />
                              {evento.ubicacion}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          {getTipoEventoBadge(evento.tipoEvento)}
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleView(evento, 'evento')}
                              className="text-gray-400 hover:text-gray-600"
                              title="Ver evento"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>

                            {/* ÚNICO botón Editar: se deshabilita si está realizado */}
                            <button
                              onClick={() => !isLockedEvent(evento) && handleEdit(evento, 'evento')}
                              disabled={isLockedEvent(evento)}
                              title={
                                isLockedEvent(evento)
                                  ? 'Evento realizado: bloqueado. Usa “Duplicar” para reprogramar'
                                  : 'Editar evento'
                              }
                              className={
                                isLockedEvent(evento)
                                  ? 'opacity-40 cursor-not-allowed'
                                  : 'text-indigo-600 hover:text-indigo-900'
                              }
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>

                            {/* Mostrar Duplicar solo si está bloqueado (realizado) */}
                            {isLockedEvent(evento) && (
                              <button
                                onClick={() => handleDuplicate(evento)}
                                className="text-gray-400 hover:text-gray-600"
                                title="Duplicar evento"
                              >
                                <DocumentDuplicateIcon className="h-4 w-4" />
                              </button>
                            )}

                            <button
                              onClick={() => handleDelete(evento, 'evento')}
                              className="text-red-600 hover:text-red-900"
                              title="Eliminar evento"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>

                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <Pagination page={pageEvents} pageCount={pageCountEvents} onChange={setPageEvents} />
                </>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal Ver Detalles */}
      {showViewModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {itemType === 'noticia' ? 'Detalles de la Noticia' : 'Detalles del Evento'}
                </h3>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{selectedItem.titulo}</h4>
                  {selectedItem.resumen && (
                    <p className="text-gray-600 mt-2">{selectedItem.resumen}</p>
                  )}
                  {selectedItem.descripcion && (
                    <p className="text-gray-600 mt-2">{selectedItem.descripcion}</p>
                  )}
                </div>
                
                {itemType === 'noticia' ? (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Autor:</span>
                      <p className="text-gray-600">{selectedItem.autor}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Fecha de publicación:</span>
                      <p className="text-gray-600">{formatDate(selectedItem.fecha_publicacion || selectedItem.created_at)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Categoría:</span>
                      <p className="text-gray-600">{selectedItem.categoria}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Estado:</span>
                      <p className="text-gray-600">{selectedItem.estado}</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Fecha:</span>
                      <p className="text-gray-600">{formatDate(selectedItem.fechaInicio)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Hora:</span>
                      <p className="text-gray-600">{formatTime(selectedItem.horaInicio)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Ubicación:</span>
                      <p className="text-gray-600">{selectedItem.ubicacion}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Tipo:</span>
                      <p className="text-gray-600">{selectedItem.tipoEvento}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
              <div className="flex items-center gap-2">
                <a
                  href={itemType === 'noticia'
                    ? `/noticias/${selectedItem.slug || selectedItem.id}`
                    : `/eventos/${selectedItem.slug || selectedItem.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  Ver en sitio
                </a>
                {itemType === 'evento' ? (
                  <button
                    onClick={() => !isLockedEvent(selectedItem) && handleEdit(selectedItem, itemType)}
                    disabled={isLockedEvent(selectedItem)}
                    className={
                      'px-4 py-2 rounded-md transition-colors ' +
                      (isLockedEvent(selectedItem)
                        ? 'bg-indigo-300 text-white cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700')
                    }
                    title={isLockedEvent(selectedItem)
                      ? 'Evento realizado: bloqueado. Usa “Duplicar”.'
                      : 'Editar'}
                  >
                    Editar
                  </button>
                ) : (
                  <button
                    onClick={() => handleEdit(selectedItem, itemType)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Editar
                  </button>
                )}
              </div>
              <button
                onClick={closeModals}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminación */}
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Confirmar Eliminación
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-600">
                ¿Estás seguro de que deseas eliminar {itemType === 'noticia' ? 'la noticia' : 'el evento'}{' '}
                "<strong>{selectedItem.titulo}</strong>"?
              </p>
              <p className="text-sm text-red-600 mt-2">
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={closeModals}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Panel de Acciones (móvil) */}
      {mobileActionsOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileActionsOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-80 max-w-[85%] bg-white shadow-xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold">Acciones</h3>
              <button
                onClick={() => setMobileActionsOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
                aria-label="Cerrar"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-2 space-y-2">
              <Link
                to="/dashboard/contenido/crear"
                className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50"
                onClick={() => setMobileActionsOpen(false)}
              >
                <PlusIcon className="h-4 w-4" />
                Nueva noticia
              </Link>
              <Link
                to="/dashboard/eventos/crear"
                className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50"
                onClick={() => setMobileActionsOpen(false)}
              >
                <PlusIcon className="h-4 w-4" />
                Nuevo evento
              </Link>
              <Link
                to="/calendario-eventos"
                className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50"
                onClick={() => setMobileActionsOpen(false)}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2v2H5a2 2 0 00-2 2v2h18V6a2 2 0 00-2-2h-2V2h-2v2H9V2H7zm14 8H3v10a2 2 0 002 2h14a2 2 0 002-2V10z"/></svg>
                Ver calendario
              </Link>
            </div>
          </div>
        </div>
      )}
      {/* Panel de Filtros (móvil) */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-96 max-w-[90%] bg-white shadow-xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold">Filtros</h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
                aria-label="Cerrar"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-3">
              {/* Búsqueda */}
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Buscar ${activeTab === 'noticias' ? 'noticia' : 'evento'}…`}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">⌘K</span>
              </div>
              {/* Estado */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {(activeTab === 'noticias' ? statusOptionsNoticias : statusOptionsEventos).map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {/* Mes */}
              {typeof monthFilter !== 'undefined' && (
                <select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="todos">Mes (todos)</option>
                  {[[1,'Enero'],[2,'Febrero'],[3,'Marzo'],[4,'Abril'],[5,'Mayo'],[6,'Junio'],[7,'Julio'],[8,'Agosto'],[9,'Septiembre'],[10,'Octubre'],[11,'Noviembre'],[12,'Diciembre']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              )}
              {/* Año */}
              {typeof yearFilter !== 'undefined' && (
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="todos">Año (todos)</option>
                  {(activeTab === 'noticias' ? yearsNoticias : yearsEventos).map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('todos');
                    if (typeof monthFilter !== 'undefined') setMonthFilter('todos');
                    if (typeof yearFilter !== 'undefined') setYearFilter('todos');
                  }}
                  className="flex-1 px-3 py-2 bg-gray-100 rounded-md text-gray-700"
                >
                  Limpiar
                </button>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex-1 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionarContenido;
