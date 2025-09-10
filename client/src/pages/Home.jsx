import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  HeartIcon, 
  AcademicCapIcon, 
  ChevronRightIcon,
  CalendarIcon,
  BookOpenIcon,
  HandRaisedIcon
} from '@heroicons/react/24/outline';
import { fundacionImages } from '../assets';
import { noticiasApi } from '../services/api';
//import de imagenes
import sanGabriel from '../assets/logos/san-gabriel.png';
import sanRafael from '../assets/logos/san rafael.png';
import pHurtado from '../assets/logos/p hurtado.jpg';
import juanPablo from '../assets/logos/juan pablo.png';
import beatoDamian from '../assets/logos/beato damian.png';
import diegoDeAlcala from '../assets/logos/diego de alcala.png';
import sanJorge from '../assets/logos/san jorge.png';
import caunicú from '../assets/logos/cauñicú.png';
import trapaTrapa from '../assets/logos/trapa trapa butalbelbun.png';
//

const Home = () => {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  let alive = true;

  (async () => {
    try {
      setLoading(true);

      let items = [];
      if (typeof noticiasApi?.getLatest === 'function') {
        items = await noticiasApi.getLatest({ limit: 3, publicada: true });
      } else if (typeof noticiasApi?.list === 'function') {
        items = await noticiasApi.list(); 
      } else if (typeof noticiasApi?.getAll === 'function') {
        items = await noticiasApi.getAll();
      } else {
        
        const base = process.env.REACT_APP_API_URL || 'http://localhost:5003';
        const res = await fetch(`${base}/api/noticias?publicada=1`);
        const json = await res.json();
        items = json?.data ?? json ?? [];
      }

      
      const sortedTop3 = (items || [])
        .slice()
        .sort((a, b) => {
          const da = new Date(a.fecha_publicacion || a.created_at || 0);
          const db = new Date(b.fecha_publicacion || b.created_at || 0);
          return db - da;
        })
        .slice(0, 3);

      if (alive) setNoticias(sortedTop3);
    } catch (err) {
      console.error('Error al cargar noticias:', err);
      if (alive) setNoticias([]);
    } finally {
      if (alive) setLoading(false);
    }
  })();

  return () => { alive = false; };
}, []);


  const valores = [
    {
      icon: HeartIcon,
      titulo: "Amor y Respeto",
      descripcion: "Promovemos un ambiente de amor y respeto mutuo en toda nuestra comunidad educativa, inspirados en el mensaje de San Juan XXIII."
    },
    {
      icon: AcademicCapIcon,
      titulo: "Excelencia Académica",
      descripcion: "Buscamos la excelencia en todos los aspectos educativos, formando estudiantes competentes e integrales."
    },
    {
      icon: HandRaisedIcon,
      titulo: "Compromiso Social",
      descripcion: "Formamos agentes de cambio comprometidos con la justicia social y la solidaridad cristiana."
    }
  ];
  const ESCUDOS = [
    { src: sanGabriel, alt: 'Colegio San Gabriel Arcángel', href: 'https://sgabriel.cl/csga/' },
    { src: sanRafael,  alt: 'Colegio San Rafael Arcángel',  href: 'https://www.colegiosanrafael.cl/' },
    { src: pHurtado,   alt: 'Colegio Padre Alberto Hurtado', href: 'https://colegioalbertohurtado.cl/' },
    { src: juanPablo,  alt: 'Colegio Juan Pablo II',         href: 'https://colegiojuanpablo.cl/' },
    { src: beatoDamian,alt: 'Colegio Beato Damián',          href: 'http://www.cdmolokai.cl/web/' },
    { src: diegoDeAlcala, alt: 'Colegio San Diego de Alcalá', href: 'http://csandiego.cl/2020/' },
    { src: sanJorge,   alt: 'Colegio San Jorge',             href: 'https://www.colegiosanjorgelaja.cl/' },
    { src: caunicú,    alt: 'Escuela Particular Cauñicú',    href: 'https://www.facebook.com/caunicu/' },
    { src: trapaTrapa, alt: 'Escuela Trapa Trapa Butalelbún',href: 'https://www.facebook.com/escuelapart.trapatrapabuta/' },
  ];
  


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Fondo inicial con color */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 1, duration: 1.5 }}
        ></motion.div>
        
        {/* Imagen de fondo que aparece después */}
        <motion.div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${fundacionImages.exterior})`,
            backgroundPosition: 'center center'
          }}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 1.5 }}
        ></motion.div>
        
        {/* Overlay para legibilidad */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-primary-900/80 via-primary-800/70 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        ></motion.div>
        
        {/* Elementos decorativos animados */}
        <motion.div 
          className="absolute top-20 right-20 w-32 h-32 border border-secondary-400/20 rounded-full"
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ delay: 2.5, duration: 2, repeat: Infinity, repeatDelay: 3 }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-32 left-16 w-24 h-24 border border-secondary-400/15 rounded-full"
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: -360 }}
          transition={{ delay: 3, duration: 2, repeat: Infinity, repeatDelay: 3 }}
        ></motion.div>
        
        <div className="relative container mx-auto px-4 py-24">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Contenido Principal */}
            <div className="lg:col-span-7 text-white">
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="max-w-4xl"
              >
                {/* Subtítulo elegante */}
                <motion.div 
                  className="flex items-center mb-6"
                  initial={{ width: 0 }}
                  animate={{ width: "auto" }}
                  transition={{ delay: 2, duration: 1 }}
                >
                  <motion.div 
                    className="h-0.5 bg-secondary-400 mr-4"
                    initial={{ width: 0 }}
                    animate={{ width: 48 }}
                    transition={{ delay: 2, duration: 1 }}
                  ></motion.div>
                  <motion.span 
                    className="text-secondary-300 font-medium tracking-wider uppercase text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5, duration: 0.5 }}
                  >
                    Educación Católica de Excelencia
                  </motion.span>
                </motion.div>
                
                <motion.h1 
                  className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 2, duration: 1 }}
                >
                  <motion.span 
                    className="block text-white"
                    initial={{ x: -50 }}
                    animate={{ x: 0 }}
                    transition={{ delay: 2.2, duration: 0.8 }}
                  >
                    Fundación
                  </motion.span>
                  <motion.span 
                    className="block bg-gradient-to-r from-secondary-400 via-secondary-300 to-secondary-400 bg-clip-text text-transparent"
                    initial={{ x: 50 }}
                    animate={{ x: 0 }}
                    transition={{ delay: 2.4, duration: 0.8 }}
                  >
                    Juan XXIII
                  </motion.span>
                </motion.h1>
                
                <motion.p 
                  className="text-xl md:text-2xl mb-10 leading-relaxed text-gray-100 max-w-3xl"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 2.8, duration: 0.8 }}
                >
                  Formando líderes cristianos con excelencia académica, valores sólidos y 
                  compromiso social, bajo la inspiración de San Juan XXIII.
                </motion.p>
                
                <motion.div 
                  className="flex flex-col sm:flex-row gap-6"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 3.2, duration: 0.8 }}
                >
                  <Link 
                    to="/colegios"
                    className="group bg-secondary-500 hover:bg-secondary-600 text-white font-bold py-5 px-10 rounded-full transition-all duration-300 transform hover:scale-105 text-center shadow-2xl hover:shadow-secondary-500/25 relative overflow-hidden"
                  >
                    <span className="relative z-10">Conoce Nuestros Colegios</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-secondary-400 to-secondary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                  <Link 
                    to="/nuestra-historia"
                    className="group border-2 border-white hover:bg-white hover:text-primary-800 font-bold py-5 px-10 rounded-full transition-all duration-300 text-center backdrop-blur-sm"
                  >
                    <span className="group-hover:text-primary-800">Nuestra Historia</span>
                  </Link>
                </motion.div>
              </motion.div>
            </div>

            {/* Logo grande en la derecha */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <motion.div
                initial={{ scale: 0, opacity: 0, rotate: -180 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ delay: 2.5, duration: 1.5, type: "spring", stiffness: 100 }}
                className="relative"
              >
                <motion.div
                  className="relative"
                  animate={{ 
                    y: [0, -10, 0],
                    rotateY: [0, 5, 0, -5, 0]
                  }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity, 
                    ease: "easeInOut"
                  }}
                >
                  <img 
                    src={fundacionImages.logo} 
                    alt="Logo Fundación Juan XXIII"
                    className="h-96 w-96 object-contain drop-shadow-2xl filter brightness-110 contrast-110"
                  />
                  {/* Efecto de resplandor */}
                  <motion.div
                    className="absolute inset-0 bg-secondary-400/20 rounded-full blur-3xl"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      ease: "easeInOut"
                    }}
                  ></motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      {/* Franja de escudos */}
      <section className="bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-6 sm:gap-8 md:gap-11 py-6 md:py-8 overflow-x-auto">
            {ESCUDOS.map(({ src, alt, href }, i) => {
              const external = href.startsWith('http');
              const props = external
                ? { href, target: '_blank', rel: 'noopener noreferrer' }
                : { href }; // si usas <Link>, cambia <a> por <Link to={href}>
              return (
                <a key={i} {...props} className="shrink-0 group" aria-label={alt} title={alt}>
                  <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    className="h-16 md:h-20 w-auto object-contain select-none transition-all duration-300 hover:scale-[1.50]"
                  />
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-600 via-secondary-500 to-primary-600"></div>
        
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-0.5 bg-secondary-500 mr-4"></div>
              <span className="text-secondary-600 font-semibold tracking-wider uppercase text-sm">
                Nuestra Identidad
              </span>
              <div className="w-16 h-0.5 bg-secondary-500 ml-4"></div>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-primary-800 mb-8">
              Esencia <span className="text-secondary-600">Católica</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Fundamentados en la educación católica y el legado espiritual de San Juan XXIII, 
              el Papa que renovó la Iglesia con amor y sabiduría pastoral.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            {/* Misión */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 relative overflow-hidden">
                {/* Gradiente de fondo sutil */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center mb-8">
                    <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-4 mr-6 shadow-lg">
                      <BookOpenIcon className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-primary-800 mb-2">Misión</h3>
                      <div className="w-20 h-1 bg-gradient-to-r from-secondary-500 to-secondary-400 rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    Gestionar con excelencia establecimientos educacionales católicos en la provincia de Biobío, 
                    que destacan por su <strong className="text-primary-700">calidad educativa</strong>, 
                    <strong className="text-secondary-600"> sello valórico-social</strong> e integración con instituciones 
                    claves del entorno, formando hombres y mujeres comprometidos con su fe, con espíritu crítico, 
                    creador y libertad responsable.
                  </p>
                  
                  {/* Elementos decorativos católicos */}
                  <div className="mt-8 flex items-center justify-center space-x-3">
                    <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-secondary-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Visión */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 relative overflow-hidden">
                {/* Gradiente de fondo sutil */}
                <div className="absolute inset-0 bg-gradient-to-br from-secondary-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center mb-8">
                    <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl p-4 mr-6 shadow-lg">
                      <AcademicCapIcon className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-primary-800 mb-2">Visión</h3>
                      <div className="w-20 h-1 bg-gradient-to-r from-primary-600 to-primary-500 rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    Ser una institución altamente reconocida en la provincia de Biobío por su destacada 
                    gestión de establecimientos educacionales con <strong className="text-primary-700">excelencia académica</strong>, 
                    formando personas capaces de integrar saberes y proclamar con audacia su 
                    <strong className="text-secondary-600"> convicción cristiana</strong>, siendo 
                    agentes de comunión y solidarios con los pobres y necesitados.
                  </p>
                  
                  {/* Elementos decorativos católicos */}
                  <div className="mt-8 flex items-center justify-center space-x-3">
                    <div className="w-2 h-2 bg-secondary-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-primary-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-secondary-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Cita inspiradora */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative z-10">
                <svg className="h-12 w-12 text-secondary-400 mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.5 10c-.223 0-.437.034-.65.065.069-.232.14-.468.254-.68.114-.308.292-.575.469-.844.148-.291.409-.488.601-.737.201-.242.475-.403.692-.604.213-.21.492-.315.714-.463.232-.133.434-.28.65-.35l.539-.222.474-.197-.485-1.938-.597.144c-.191.048-.424.104-.689.171-.271.05-.56.187-.882.312-.318.142-.686.238-1.028.466-.344.218-.741.4-1.091.692-.339.301-.748.562-1.05.945-.33.358-.656.734-.909 1.162-.293.408-.492.856-.702 1.299-.19.443-.343.896-.468 1.336-.237.882-.343 1.72-.384 2.437-.034.718-.014 1.315.028 1.747.015.204.043.402.063.539l.025.168.026-.006A4.5 4.5 0 1 0 6.5 10zm11 0c-.223 0-.437.034-.65.065.069-.232.14-.468.254-.68.114-.308.292-.575.469-.844.148-.291.409-.488.601-.737.201-.242.475-.403.692-.604.213-.21.492-.315.714-.463.232-.133.434-.28.65-.35l.539-.222.474-.197-.485-1.938-.597.144c-.191.048-.424.104-.689.171-.271.05-.56.187-.882.312-.318.142-.686.238-1.028.466-.344.218-.741.4-1.091.692-.339.301-.748.562-1.05.945-.33.358-.656.734-.909 1.162-.293.408-.492.856-.702 1.299-.19.443-.343.896-.468 1.336-.237.882-.343 1.72-.384 2.437-.034.718-.014 1.315.028 1.747.015.204.043.402.063.539l.025.168.026-.006A4.5 4.5 0 1 0 17.5 10z"/>
                </svg>
                <blockquote className="text-2xl md:text-3xl font-light italic leading-relaxed mb-6">
                  "Queremos ser una escuela de amor humano que prepare para aquel Amor perfecto que es Dios"
                </blockquote>
                <cite className="text-secondary-300 font-semibold">
                  — Inspirados en San Juan XXIII
                </cite>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-50 relative">
        {/* Patrón decorativo sutil */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-20 h-20 border border-primary-300 rounded-full"></div>
          <div className="absolute top-40 right-20 w-16 h-16 border border-secondary-300 rounded-full"></div>
          <div className="absolute bottom-32 left-1/4 w-12 h-12 border border-primary-300 rounded-full"></div>
        </div>
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-0.5 bg-secondary-500 mr-4"></div>
              <span className="text-secondary-600 font-semibold tracking-wider uppercase text-sm">
                Principios Cristianos
              </span>
              <div className="w-16 h-0.5 bg-secondary-500 ml-4"></div>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-primary-800 mb-8">
              Nuestros <span className="text-secondary-600">Valores</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Los principios cristianos que iluminan nuestra labor educativa y forman el carácter 
              de nuestros estudiantes bajo la inspiración de San Juan XXIII
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {valores.map((valor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 relative overflow-hidden h-full">
                  {/* Gradiente de hover elegante */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-transparent to-secondary-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10 text-center h-full flex flex-col">
                    {/* Icono con diseño católico elegante */}
                    <div className="relative mb-8 mx-auto">
                      <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 w-20 h-20 mx-auto flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <valor.icon className="h-10 w-10 text-white" />
                      </div>
                      {/* Halo decorativo */}
                      <div className="absolute -inset-2 rounded-3xl border-2 border-primary-200/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="text-2xl font-bold text-primary-800 mb-4">
                        {valor.titulo}
                      </h3>
                      <div className="w-16 h-1 bg-gradient-to-r from-secondary-500 to-secondary-400 rounded-full mx-auto mb-6"></div>
                      <p className="text-gray-600 leading-relaxed text-lg">
                        {valor.descripcion}
                      </p>
                    </div>
                    
                    {/* Elementos decorativos católicos */}
                    <div className="mt-8 flex items-center justify-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-secondary-400 rounded-full"></div>
                      <div className="w-1.5 h-1.5 bg-primary-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Mensaje inspirador adicional */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg max-w-4xl mx-auto">
              <p className="text-lg text-gray-700 italic leading-relaxed">
                "Como educadores católicos, trabajamos para que cada estudiante descubra y desarrolle 
                los dones que Dios le ha concedido, formándose como persona íntegra al servicio de la sociedad."
              </p>
              <div className="mt-4 w-12 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Noticias */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary-100/30 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary-100/30 to-transparent rounded-full translate-y-24 -translate-x-24"></div>
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-0.5 bg-secondary-500 mr-4"></div>
              <span className="text-secondary-600 font-semibold tracking-wider uppercase text-sm">
                Actualidad Educativa
              </span>
              <div className="w-16 h-0.5 bg-secondary-500 ml-4"></div>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-primary-800 mb-8">
              Últimas <span className="text-secondary-600">Noticias</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Mantente al día con las novedades, logros y eventos especiales de nuestra comunidad educativa católica
            </p>
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-gray-100 rounded-3xl h-96 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {noticias.map((noticia, index) => (
                <motion.div
                  key={noticia.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <article className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full">
                    {/* Contenedor imagen destacada */}
                    <div className="relative overflow-hidden">
                      {noticia.imagen_url ? (
                        <div className="h-56 bg-gradient-to-br from-primary-400 to-primary-600 overflow-hidden">
                          <img 
                            src={noticia.imagen_url} 
                            alt={noticia.titulo}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 to-transparent"></div>
                        </div>
                      ) : (
                        <div className="h-56 bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 flex items-center justify-center relative overflow-hidden">
                          <BookOpenIcon className="h-20 w-20 text-white/80" />
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                        </div>
                      )}
                      
                      {/* Overlay*/}
                      <div className="absolute top-4 right-4">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                          <CalendarIcon className="h-4 w-4 text-primary-600" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-8">
                      {/* Fecha */}
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <time className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full font-medium">
                          {new Date(noticia.fecha_publicacion).toLocaleDateString('es-CL', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </time>
                      </div>
                      
                      {/* Título */}
                      <h3 className="text-xl font-bold text-primary-800 mb-4 line-clamp-2 group-hover:text-primary-600 transition-colors duration-300">
                        {noticia.titulo}
                      </h3>
                      
                      {/* Resumen */}
                      <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                        {noticia.resumen || noticia.contenido?.substring(0, 150) + '...'}
                      </p>
                      
                      {/* Enlace */}
                      <Link 
                        to={`/noticias/${noticia.slug || noticia.id}`}
                        className="inline-flex items-center text-primary-600 hover:text-primary-800 font-semibold transition-colors group-hover:translate-x-1 transition-transform duration-300"
                      >
                        Leer artículo completo 
                        <ChevronRightIcon className="h-4 w-4 ml-2" />
                      </Link>
                    </div>
                  </article>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Link 
              to="/noticias"
              className="inline-flex items-center bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-primary-500/25"
            >
              <span>Ver Todas las Noticias</span>
              <ChevronRightIcon className="h-5 w-5 ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section*/}
      <section className="py-24 bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 text-white relative overflow-hidden">
        {/* Patrón decorativo de fondo */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-40 h-40 border border-white/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 right-32 w-32 h-32 border border-secondary-400/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 border border-white/5 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* Overlay elegante */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/20 via-transparent to-primary-800/20"></div>
        
        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Subtitle elegante */}
            <div className="flex items-center justify-center mb-8">
              <div className="w-16 h-0.5 bg-secondary-400 mr-4"></div>
              <span className="text-secondary-300 font-semibold tracking-wider uppercase text-sm">
                Únete a Nuestra Familia
              </span>
              <div className="w-16 h-0.5 bg-secondary-400 ml-4"></div>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
              ¿Listo para <span className="text-secondary-300">formar parte</span><br />
              de nuestra <span className="text-secondary-300">familia católica</span>?
            </h2>
            
            <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto text-gray-100 leading-relaxed">
              Descubre cómo podemos acompañar el crecimiento integral de tu hijo con 
              <strong className="text-secondary-300"> valores cristianos</strong> y 
              <strong className="text-secondary-300"> excelencia académica</strong> bajo la inspiración de San Juan XXIII
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                to="/contacto"
                className="group bg-secondary-500 hover:bg-secondary-600 text-primary-900 font-bold py-5 px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-secondary-500/25 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center">
                  Contáctanos Hoy
                  <HandRaisedIcon className="h-5 w-5 ml-2" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-secondary-400 to-secondary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link 
                to="/colegios"
                className="group border-2 border-white hover:bg-white hover:text-primary-800 font-bold py-5 px-10 rounded-full transition-all duration-300 backdrop-blur-sm"
              >
                <span className="flex items-center justify-center">
                  Conoce Nuestros Colegios
                  <AcademicCapIcon className="h-5 w-5 ml-2" />
                </span>
              </Link>
            </div>
            
            {/* Estadísticas inspiradoras */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary-300 mb-2">9</div>
                <div className="text-gray-200">Colegios Católicos</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary-300 mb-2">50+</div>
                <div className="text-gray-200">Años de Experiencia</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary-300 mb-2">1000+</div>
                <div className="text-gray-200">Familias Confiando</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;
