import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserGroupIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

const NuestroEquipo = () => {
  // Datos de ejemplo - estos serán reemplazados con la información real
  const equipoDirectivo = [
    {
      id: 1,
      nombre: "Pbro. Ramón Alberto Henríquez Ulloa",
      cargo: "Administrador General",
      area: "Dirección Ejecutiva",
      descripcion: "Administrador de la Fundación desde 1993, lidera la misión evangelizadora y educativa.",
      email: "administrador@fjuanxxiii.cl",
      telefono: "+56 41 234 5678",
      image: "/api/placeholder/300/300"
    },
    {
      id: 2,
      nombre: "Raúl Hugo Galdames Carrasco",
      cargo: "Director Ejecutivo",
      area: "Dirección Ejecutiva",
      descripcion: "Actual Director Ejecutivo, responsable de la gestión operacional de la red de colegios.",
      email: "director@fjuanxxiii.cl",
      telefono: "+56 41 234 5679",
      image: "/api/placeholder/300/300"
    },
    {
      id: 3,
      nombre: "Secretario General",
      cargo: "Secretario General",
      area: "Administración",
      descripcion: "Responsable de la coordinación administrativa y secretarial de la Fundación.",
      email: "secretaria@fjuanxxiii.cl",
      telefono: "+56 41 234 5680",
      image: "/api/placeholder/300/300"
    }
  ];

  const equipoOperativo = [
    {
      id: 4,
      nombre: "Coordinador Pedagógico",
      cargo: "Coordinador Pedagógico",
      area: "Educación",
      descripcion: "Supervisión y coordinación de los procesos educativos en todos los establecimientos.",
      email: "pedagogico@fjuanxxiii.cl",
      telefono: "+56 41 234 5681",
      image: "/api/placeholder/300/300"
    },
    {
      id: 5,
      nombre: "Coordinador Pastoral",
      cargo: "Coordinador de Pastoral",
      area: "Pastoral",
      descripcion: "Responsable de la formación espiritual y actividades pastorales de la red.",
      email: "pastoral@fjuanxxiii.cl",
      telefono: "+56 41 234 5682",
      image: "/api/placeholder/300/300"
    },
    {
      id: 6,
      nombre: "Jefe de Finanzas",
      cargo: "Jefe de Finanzas",
      area: "Finanzas",
      descripcion: "Gestión financiera y administrativa de todos los establecimientos de la red.",
      email: "finanzas@fjuanxxiii.cl",
      telefono: "+56 41 234 5683",
      image: "/api/placeholder/300/300"
    }
  ];

  const areas = [
    {
      icon: AcademicCapIcon,
      titulo: "Área Pedagógica",
      descripcion: "Coordinación y supervisión de los procesos educativos, curriculares y de calidad académica.",
      color: "primary"
    },
    {
      icon: UserGroupIcon,
      titulo: "Área Pastoral",
      descripcion: "Formación espiritual, actividades litúrgicas y desarrollo de la identidad católica.",
      color: "secondary"
    },
    {
      icon: BriefcaseIcon,
      titulo: "Área Administrativa",
      descripcion: "Gestión operativa, recursos humanos y servicios de apoyo a la gestión educativa.",
      color: "catholic"
    },
    {
      icon: BuildingOfficeIcon,
      titulo: "Área Financiera",
      descripcion: "Administración de recursos, presupuestos y sustentabilidad económica de la red.",
      color: "accent"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 to-secondary-900/90" />
        
        <div className="relative container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Nuestro <span className="text-secondary-300">Equipo</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 font-light leading-relaxed">
              Las personas que trabajan día a día para hacer realidad nuestra misión educativa
            </p>
          </motion.div>
        </div>
      </section>

      {/* Equipo Directivo */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-primary-800 mb-6">
              Equipo <span className="text-secondary-600">Directivo</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Los líderes que guían nuestra institución hacia el cumplimiento de nuestra misión educativa católica
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {equipoDirectivo.map((miembro, index) => (
              <motion.div
                key={miembro.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden">
                  {/* Imagen de perfil */}
                  <div className="relative bg-gradient-to-br from-primary-100 to-secondary-100 h-64 flex items-center justify-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center shadow-lg">
                      <UserGroupIcon className="h-16 w-16 text-white" />
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-primary-800 mb-2">{miembro.nombre}</h3>
                    <p className="text-secondary-600 font-semibold mb-1">{miembro.cargo}</p>
                    <p className="text-gray-500 text-sm mb-4">{miembro.area}</p>
                    
                    <p className="text-gray-700 leading-relaxed mb-6">{miembro.descripcion}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <EnvelopeIcon className="h-4 w-4 mr-3 text-primary-600" />
                        <a href={`mailto:${miembro.email}`} className="hover:text-primary-600 transition-colors">
                          {miembro.email}
                        </a>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <PhoneIcon className="h-4 w-4 mr-3 text-primary-600" />
                        <a href={`tel:${miembro.telefono}`} className="hover:text-primary-600 transition-colors">
                          {miembro.telefono}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipo Operativo */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-primary-800 mb-6">
              Equipo <span className="text-secondary-600">Operativo</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Los profesionales que coordinan las diferentes áreas para asegurar el funcionamiento óptimo de nuestra red educativa
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {equipoOperativo.map((miembro, index) => (
              <motion.div
                key={miembro.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden">
                  {/* Imagen de perfil */}
                  <div className="relative bg-gradient-to-br from-secondary-100 to-catholic-100 h-64 flex items-center justify-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-secondary-600 to-catholic-600 rounded-full flex items-center justify-center shadow-lg">
                      <BriefcaseIcon className="h-16 w-16 text-white" />
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-primary-800 mb-2">{miembro.nombre}</h3>
                    <p className="text-secondary-600 font-semibold mb-1">{miembro.cargo}</p>
                    <p className="text-gray-500 text-sm mb-4">{miembro.area}</p>
                    
                    <p className="text-gray-700 leading-relaxed mb-6">{miembro.descripcion}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <EnvelopeIcon className="h-4 w-4 mr-3 text-primary-600" />
                        <a href={`mailto:${miembro.email}`} className="hover:text-primary-600 transition-colors">
                          {miembro.email}
                        </a>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <PhoneIcon className="h-4 w-4 mr-3 text-primary-600" />
                        <a href={`tel:${miembro.telefono}`} className="hover:text-primary-600 transition-colors">
                          {miembro.telefono}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Áreas de Trabajo */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-primary-800 mb-6">
              Áreas de <span className="text-secondary-600">Trabajo</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              La organización funcional que permite coordinar eficientemente todos los aspectos de nuestra misión educativa
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {areas.map((area, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className={`
                  bg-gradient-to-br from-white to-${area.color}-25 rounded-3xl p-8 shadow-xl 
                  hover:shadow-2xl transition-all duration-500 border border-${area.color}-100 
                  relative overflow-hidden h-full
                `}>
                  <div className={`
                    absolute inset-0 bg-gradient-to-br from-${area.color}-50/30 to-transparent 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-500
                  `}></div>
                  
                  <div className="relative z-10">
                    <div className={`
                      bg-gradient-to-br from-${area.color}-600 to-${area.color}-700 rounded-2xl 
                      p-4 mb-6 w-16 h-16 flex items-center justify-center shadow-lg
                    `}>
                      <area.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-primary-800 mb-4">{area.titulo}</h3>
                    <p className="text-gray-700 leading-relaxed">{area.descripcion}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto General */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-6">
              ¿Necesitas <span className="text-secondary-300">Contactarnos?</span>
            </h2>
            <p className="text-xl text-primary-100 leading-relaxed mb-8">
              Nuestro equipo está siempre disponible para atender tus consultas y 
              brindarte la información que necesitas sobre nuestra institución.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="bg-white/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <PhoneIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Teléfono</h3>
                <p className="text-primary-100">+56 41 234 5678</p>
              </div>
              
              <div className="text-center">
                <div className="bg-white/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <EnvelopeIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Email</h3>
                <p className="text-primary-100">contacto@fjuanxxiii.cl</p>
              </div>
              
              <div className="text-center">
                <div className="bg-white/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <BuildingOfficeIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Oficina Central</h3>
                <p className="text-primary-100">Concepción, Región del Biobío</p>
              </div>
            </div>
            
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <p className="text-primary-100 leading-relaxed">
                <strong>Horarios de Atención:</strong> Lunes a Viernes de 8:30 a 17:30 hrs. | 
                Para emergencias fuera del horario laboral, contactar al administrador.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default NuestroEquipo;
