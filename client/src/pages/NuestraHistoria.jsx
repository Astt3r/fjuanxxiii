import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpenIcon, 
  TrophyIcon, 
  UsersIcon
} from '@heroicons/react/24/outline';
import { fundacionImages } from '../assets';

const NuestraHistoria = () => {
  const estadisticas = [
    { numero: "9", label: "Colegios", descripcion: "A lo largo del país" },
    { numero: "50+", label: "Años", descripcion: "De experiencia educativa" },
    { numero: "10,000+", label: "Estudiantes", descripcion: "Formados con excelencia" },
    { numero: "500+", label: "Docentes", descripcion: "Comprometidos con la educación" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 text-white">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: `url(${fundacionImages.exterior})`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 to-secondary-900/90" />
        
        <div className="relative container mx-auto px-4 py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
              Nuestra <span className="text-secondary-300">Historia</span>
            </h1>
            <p className="text-2xl md:text-3xl text-primary-100 font-light leading-relaxed">
              Más de 50 años construyendo futuro a través de la educación católica de excelencia
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeline de Historia */}
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
              Nuestra <span className="text-secondary-600">Trayectoria</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Un recorrido por los momentos más importantes de nuestra historia institucional
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto space-y-16">
            {/* Orígenes 1973 */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <div className="bg-gradient-to-r from-primary-50 to-white rounded-3xl p-10 shadow-lg border border-primary-100">
                <div className="flex items-center mb-6">
                  <div className="bg-primary-600 text-white rounded-full p-3 mr-4">
                    <BookOpenIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-primary-800">Los Orígenes (1973)</h3>
                    <p className="text-primary-600 font-medium">El nacimiento de una visión</p>
                  </div>
                </div>
                <div className="text-gray-700 leading-relaxed space-y-4">
                  <p>
                    Todo comenzó cuando el <strong>Obispo de Concepción, Manuel Sánchez Beguiristáin</strong>, junto con 
                    destacados profesionales y dirigentes católicos de la zona, concibieron la idea de crear una 
                    institución dedicada a la educación católica de excelencia.
                  </p>
                  <p>
                    La iniciativa surgió de la necesidad de ofrecer una alternativa educativa que combinara la 
                    formación académica de calidad con los valores cristianos, en respuesta a los desafíos 
                    educativos de la época.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Fundación 1975 */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <div className="bg-gradient-to-l from-secondary-50 to-white rounded-3xl p-10 shadow-lg border border-secondary-100">
                <div className="flex items-center mb-6">
                  <div className="bg-secondary-600 text-white rounded-full p-3 mr-4">
                    <TrophyIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-primary-800">Fundación Oficial (1975)</h3>
                    <p className="text-secondary-600 font-medium">Nace la Fundación Juan XXIII</p>
                  </div>
                </div>
                <div className="text-gray-700 leading-relaxed space-y-4">
                  <p>
                    El <strong>2 de octubre de 1975</strong>, mediante Decreto N° 623 del Ministerio de Justicia, 
                    se constituyó oficialmente la <strong>"Fundación Juan XXIII"</strong> como persona jurídica 
                    de derecho privado sin fines de lucro.
                  </p>
                  <p>
                    El nombre elegido honra la memoria del <strong>Papa Juan XXIII</strong>, conocido como "el Papa Bueno", 
                    quien representaba los valores de sencillez, apertura y renovación que la fundación quería encarnar.
                  </p>
                  <div className="bg-primary-50 rounded-xl p-6 border border-primary-100">
                    <h4 className="font-semibold text-primary-800 mb-2">Objetivo fundacional:</h4>
                    <p className="text-primary-700 text-sm">
                      "Evangelizar y participar en el proceso educativo de la juventud, contribuyendo 
                      al desarrollo cultural de acuerdo a las modalidades, principios y disposiciones 
                      de la Iglesia Católica."
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Primeros Colegios */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <div className="bg-gradient-to-r from-catholic-50 to-white rounded-3xl p-10 shadow-lg border border-catholic-100">
                <div className="flex items-center mb-6">
                  <div className="bg-catholic-600 text-white rounded-full p-3 mr-4">
                    <BookOpenIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-primary-800">Primeros Establecimientos</h3>
                    <p className="text-catholic-600 font-medium">Los cimientos de la red educativa</p>
                  </div>
                </div>
                <div className="text-gray-700 leading-relaxed space-y-4">
                  <p>
                    En sus primeros años, la Fundación se hizo cargo de establecimientos educacionales 
                    que requerían una administración comprometida con la educación católica de calidad.
                  </p>
                  <p>
                    Cada nuevo colegio incorporado a la red representaba no solo un crecimiento institucional, 
                    sino también la expansión de la misión evangelizadora y educativa en diferentes comunidades.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Administración */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <div className="bg-gradient-to-l from-secondary-50 to-white rounded-3xl p-10 shadow-lg border border-secondary-100">
                <div className="flex items-center mb-6">
                  <div className="bg-secondary-600 text-white rounded-full p-3 mr-4">
                    <UsersIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-primary-800">Liderazgo y Administración</h3>
                    <p className="text-secondary-600 font-medium">Dirigentes comprometidos con la misión</p>
                  </div>
                </div>
                <div className="text-gray-700 leading-relaxed space-y-4">
                  <p>
                    La Fundación es dirigida por un <strong>Consejo de Administración</strong>, presidido por el Ordinario Eclesiástico de la Diócesis. A lo largo de su historia, ha contado con administradores y directores ejecutivos destacados:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Juan Umarán Dávila:</strong> Primer administrador (18 años de servicio)</li>
                    <li><strong>Pbro. Ramón Alberto Henríquez Ulloa:</strong> Administrador desde 1993</li>
                    <li><strong>Miguel Guillermo Collins Dupouy:</strong> Primer Director Ejecutivo</li>
                    <li><strong>Raúl Hugo Galdames Carrasco:</strong> Actual Director Ejecutivo</li>
                  </ul>
                  <p>
                    En 1997, mediante Decreto N° 11/97, se reformaron los Estatutos estableciendo la figura del Director Ejecutivo y las facultades del Consejo de Administración.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Presente */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-3xl p-10 shadow-2xl">
                <div className="text-center">
                  <div className="bg-white/20 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <TrophyIcon className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">Fundación Juan XXIII Hoy</h3>
                  <p className="text-xl text-primary-100 leading-relaxed max-w-4xl mx-auto">
                    Hoy la Fundación Juan XXIII administra <strong>nueve colegios</strong> en la provincia del Biobío, 
                    manteniendo su compromiso original de entregar enseñanza cristiana de calidad y contribuir 
                    al desarrollo cultural de acuerdo a los principios de la Iglesia Católica.
                  </p>
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-secondary-300 mb-2">50+</div>
                      <div className="text-primary-100">Años de Historia</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-secondary-300 mb-2">9</div>
                      <div className="text-primary-100">Colegios</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-secondary-300 mb-2">10K+</div>
                      <div className="text-primary-100">Estudiantes Formados</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="py-16 bg-primary-900 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">
              Nuestro Impacto
            </h2>
            <p className="text-xl text-primary-100">
              Cifras que reflejan nuestro compromiso con la educación de calidad
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {estadisticas.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-5xl font-bold text-secondary-400 mb-2">
                  {stat.numero}
                </div>
                <div className="text-xl font-semibold mb-1">
                  {stat.label}
                </div>
                <div className="text-primary-200">
                  {stat.descripcion}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default NuestraHistoria;
