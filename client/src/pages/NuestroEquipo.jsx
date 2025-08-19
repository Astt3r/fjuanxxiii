import React from 'react';
import { motion } from 'framer-motion';
import { 
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

// Importar imágenes (Webpack/Vite las procesará). Ajustar nombres si cambian.
import IMG_Raul from '../assets/funcionarios/RAUL-HUGO-GALDAMES-CARRASCO-x-150x150.jpg';
import IMG_Patricia from '../assets/funcionarios/PATRICIA-CARMEN-CARES-DIAZ-x-150x150.jpg';
import IMG_Vicente from '../assets/funcionarios/VICENTE-RICARDO-GONZALEZ-MONTOYA-x-150x150.jpg';

const NuestroEquipo = () => {
  // Solo los tres responsables actuales de la Oficina Central
  const equipoCentral = [
    {
      id: 1,
      nombre: 'Raúl Galdames Carrasco',
      cargo: 'Director Ejecutivo',
      area: 'Oficina Central',
      descripcion: 'Responsable de la dirección ejecutiva y la gestión global de la Fundación.',
      image: IMG_Raul,
      alt: 'Fotografía de Raúl Hugo Galdames Carrasco'
    },
    {
      id: 2,
      nombre: 'Patricia Cares Díaz',
      cargo: 'Jefa de Administración Educacional',
      area: 'Oficina Central',
      descripcion: 'Apoyo administrativo y coordinación de procesos internos.',
      image: IMG_Patricia,
      alt: 'Fotografía de Patricia Carmen Cares Díaz'
    },
    {
      id: 3,
      nombre: 'Vicente González Montoya',
      cargo: 'Jefe de Administración y Finanzas',
      area: 'Oficina Central',
      descripcion: 'Apoyo en gestión y coordinación institucional.',
      image: IMG_Vicente,
      alt: 'Fotografía de Vicente Ricardo González Montoya'
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

      {/* Equipo Oficina Central (solo 3 responsables) */}
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
              Oficina <span className="text-secondary-600">Central</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Responsables actuales de la gestión institucional de la Fundación Juan XXIII.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {equipoCentral.map((miembro, index) => (
              <motion.div
                key={miembro.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden">
                  {/* Imagen */}
                  <div className="relative h-64 flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
                    <img
                      src={miembro.image}
                      alt={miembro.alt}
                      className="w-40 h-40 rounded-full object-cover shadow-lg border-4 border-white"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-primary-800 mb-2">{miembro.nombre}</h3>
                    <p className="text-secondary-600 font-semibold mb-1">{miembro.cargo}</p>
                    <p className="text-gray-500 text-sm mb-4">{miembro.area}</p>
                    <p className="text-gray-700 leading-relaxed mb-6">{miembro.descripcion}</p>
                    {/* Datos de contacto ocultos temporalmente */}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Se removieron secciones adicionales temporalmente */}

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
