import React from 'react';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  AcademicCapIcon, 
  UsersIcon, 
  BookOpenIcon,
  TrophyIcon,
  HandRaisedIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

const ValoresInstitucionales = () => {
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
              Valores <span className="text-secondary-300">Institucionales</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 font-light leading-relaxed">
              Los pilares fundamentales que guían nuestra misión educativa católica
            </p>
          </motion.div>
        </div>
      </section>

      {/* Valores Principales */}
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
              Nuestros <span className="text-secondary-600">Valores</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Principios que definen nuestra identidad y orientan cada decisión en nuestra comunidad educativa
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {/* Fe y Espiritualidad */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-gradient-to-br from-white to-primary-25 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-primary-100 relative overflow-hidden h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-4 mb-6 w-16 h-16 flex items-center justify-center mx-auto shadow-lg">
                    <HeartIcon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-800 mb-4 text-center">Fe y Espiritualidad</h3>
                  <p className="text-gray-700 leading-relaxed text-center">
                    Vivencia profunda de la fe católica como fundamento de la formación integral, 
                    promoviendo el encuentro personal con Cristo y el desarrollo de la dimensión espiritual.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Excelencia Educativa */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-gradient-to-br from-white to-secondary-25 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-secondary-100 relative overflow-hidden h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl p-4 mb-6 w-16 h-16 flex items-center justify-center mx-auto shadow-lg">
                    <TrophyIcon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-800 mb-4 text-center">Excelencia Educativa</h3>
                  <p className="text-gray-700 leading-relaxed text-center">
                    Búsqueda constante de la calidad académica y pedagógica, implementando metodologías 
                    innovadoras que potencien al máximo las capacidades de cada estudiante.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Solidaridad y Servicio */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-gradient-to-br from-white to-catholic-light rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-catholic-200 relative overflow-hidden h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-catholic-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-catholic-600 to-catholic-700 rounded-2xl p-4 mb-6 w-16 h-16 flex items-center justify-center mx-auto shadow-lg">
                    <HandRaisedIcon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-800 mb-4 text-center">Solidaridad y Servicio</h3>
                  <p className="text-gray-700 leading-relaxed text-center">
                    Compromiso con los más necesitados y vulnerables, formando agentes de transformación 
                    social comprometidos con la justicia y el bien común.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Formación Integral */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-gradient-to-br from-white to-primary-25 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-primary-100 relative overflow-hidden h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-4 mb-6 w-16 h-16 flex items-center justify-center mx-auto shadow-lg">
                    <UsersIcon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-800 mb-4 text-center">Formación Integral</h3>
                  <p className="text-gray-700 leading-relaxed text-center">
                    Desarrollo armónico de todas las dimensiones de la persona: intelectual, espiritual, 
                    física, emocional y social, preparando líderes para el futuro.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Comunidad y Familia */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-gradient-to-br from-white to-accent-light rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-accent-200 relative overflow-hidden h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-accent-600 to-accent-700 rounded-2xl p-4 mb-6 w-16 h-16 flex items-center justify-center mx-auto shadow-lg">
                    <HomeIcon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-800 mb-4 text-center">Comunidad y Familia</h3>
                  <p className="text-gray-700 leading-relaxed text-center">
                    Construcción de una comunidad educativa unida donde las familias son protagonistas 
                    del proceso formativo y donde se viven relaciones fraternas y auténticas.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Tradición e Innovación */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-gradient-to-br from-white to-secondary-25 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-secondary-100 relative overflow-hidden h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl p-4 mb-6 w-16 h-16 flex items-center justify-center mx-auto shadow-lg">
                    <AcademicCapIcon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-800 mb-4 text-center">Tradición e Innovación</h3>
                  <p className="text-gray-700 leading-relaxed text-center">
                    Equilibrio entre la riqueza de la tradición católica y la apertura a la innovación 
                    educativa, adaptándose a los desafíos del mundo contemporáneo.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Llamada a la acción de valores */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="bg-gradient-to-r from-secondary-100 to-primary-100 rounded-3xl p-10 max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold text-primary-800 mb-6">
                Valores que <span className="text-secondary-600">Transforman</span>
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                Estos valores no son solo principios teóricos, sino que se viven diariamente en cada aula, 
                en cada interacción y en cada decisión que tomamos como comunidad educativa católica. 
                Son el fundamento sobre el cual construimos el futuro de nuestros estudiantes y de la sociedad.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Inspiración en San Juan XXIII */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl max-w-5xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative z-10">
                <div className="bg-white/20 rounded-full p-4 w-20 h-20 mx-auto mb-8 flex items-center justify-center">
                  <BookOpenIcon className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-4xl font-bold mb-8 text-secondary-300">
                  Inspirados en San Juan XXIII
                </h3>
                <blockquote className="text-2xl md:text-3xl font-light italic leading-relaxed mb-8">
                  "Procuramos encarnar los valores de sencillez, autenticidad y alegría del Papa Bueno, 
                  quien abrió las puertas de la Iglesia al mundo con amor y sabiduría pastoral."
                </blockquote>
                <cite className="text-secondary-300 font-semibold text-lg">
                  — Fundación Juan XXIII
                </cite>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Compromiso con la Educación */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-primary-800 mb-6">
                Nuestro <span className="text-secondary-600">Compromiso</span>
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Como institución educativa católica, nos comprometemos a formar personas íntegras 
                que contribuyan al desarrollo de una sociedad más justa, solidaria y esperanzadora.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                Nuestros valores guían cada decisión, cada programa educativo y cada interacción 
                dentro de nuestra comunidad, asegurando que nuestros estudiantes no solo reciban 
                una educación de excelencia, sino que también se conviertan en ciudadanos 
                comprometidos con el bien común.
              </p>
              
              <div className="bg-primary-50 rounded-xl p-6 border border-primary-100">
                <h4 className="font-semibold text-primary-800 mb-3">Nuestra Meta:</h4>
                <p className="text-primary-700 leading-relaxed">
                  Formar líderes cristianos capaces de transformar el mundo con sabiduría, 
                  compasión y un profundo sentido de la justicia social.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-primary-50 to-white rounded-2xl p-6 border border-primary-100">
                <h4 className="text-xl font-bold text-primary-800 mb-3">Formación Académica</h4>
                <p className="text-gray-700">
                  Excelencia educativa que prepara a nuestros estudiantes para los desafíos 
                  del siglo XXI con sólidas bases académicas.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-secondary-50 to-white rounded-2xl p-6 border border-secondary-100">
                <h4 className="text-xl font-bold text-primary-800 mb-3">Formación Espiritual</h4>
                <p className="text-gray-700">
                  Desarrollo de la dimensión trascendente mediante la vivencia de la fe 
                  católica y los valores evangélicos.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-catholic-50 to-white rounded-2xl p-6 border border-catholic-100">
                <h4 className="text-xl font-bold text-primary-800 mb-3">Formación Social</h4>
                <p className="text-gray-700">
                  Compromiso con la justicia social y la construcción de una sociedad 
                  más solidaria e inclusiva.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ValoresInstitucionales;
