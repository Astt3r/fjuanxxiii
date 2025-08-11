import React from 'react';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  AcademicCapIcon, 
  UsersIcon, 
  StarIcon,
  BookOpenIcon,
  TrophyIcon,
  HandRaisedIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { fundacionImages } from '../assets';

const Nosotros = () => {
  const estadisticas = [
    { numero: "9", label: "Colegios", descripcion: "A lo largo del país" },
    { numero: "50+", label: "Años", descripcion: "De experiencia educativa" },
    { numero: "10,000+", label: "Estudiantes", descripcion: "Formados con excelencia" },
    { numero: "500+", label: "Docentes", descripcion: "Comprometidos con la educación" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ 
            backgroundImage: `url(${fundacionImages.exterior})`,
            backgroundPosition: 'center center'
          }}
        ></div>
        <div className="absolute inset-0 bg-blue-900 bg-opacity-70"></div>
        
        <div className="relative container mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Sobre Nosotros
            </h1>
            <p className="text-xl md:text-2xl leading-relaxed">
              Más de cinco décadas dedicadas a la educación de calidad, formando líderes con valores cristianos para construir un mundo mejor.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Historia y Misión */}
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
              Nuestra <span className="text-secondary-600">Historia</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Una historia de fe, compromiso y dedicación a la educación católica en la provincia del Biobío
            </p>
          </motion.div>

          {/* Imagen principal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative mb-16"
          >
            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              <img 
                src={fundacionImages.exterior} 
                alt="Fundación Juan XXIII - Edificio histórico"
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/70 via-primary-800/30 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <img 
                    src={fundacionImages.logo} 
                    alt="Logo Fundación Juan XXIII"
                    className="h-16 w-16 object-contain mx-auto mb-3"
                  />
                  <p className="text-primary-800 font-bold text-lg">Fundada el 14 de abril de 1975</p>
                  <p className="text-gray-600">Los Ángeles, Región del Biobío</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Timeline de la Historia */}
          <div className="max-w-6xl mx-auto">
            {/* Orígenes */}
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
                    <h3 className="text-3xl font-bold text-primary-800">Los Orígenes (1973-1975)</h3>
                    <p className="text-secondary-600 font-medium">El nacimiento de una misión</p>
                  </div>
                </div>
                <div className="text-gray-700 leading-relaxed space-y-4">
                  <p>
                    En 1973 funcionaba en Los Ángeles el <strong>Colegio del Niño Jesús</strong>, único colegio particular pagado para niñas en la ciudad, dirigido por la Congregación Religiosa de las Hermanas del Niño Jesús de Aurillac. Debido al conflicto socio-político que afectó la situación económica del país, las Hermanas decidieron abandonar la misión educacional para dedicarse a la evangelización de los más pobres en el Alto Biobío.
                  </p>
                  <p>
                    Los padres y apoderados del Colegio, liderados por <strong>don Juan Umarán Dávila</strong> y <strong>don Ignacio Zubeldia</strong>, decidieron impedir que el Colegio fuera entregado a alguna institución incompatible con su visión cristiana. Recurrieron ante el recordado Obispo <strong>Monseñor Orozimbo del Carmen Fuenzalida y Fuenzalida</strong>, quien se empeñó en salvar el Colegio para la Educación Cristiana Católica.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Fundación */}
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
                    <StarIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-primary-800">La Fundación (1975)</h3>
                    <p className="text-secondary-600 font-medium">Bajo la luz de San Juan XXIII</p>
                  </div>
                </div>
                <div className="text-gray-700 leading-relaxed space-y-4">
                  <p>
                    Mediante <strong>decreto episcopal del 14 de abril de 1975</strong>, el Obispo don Orozimbo Fuenzalida y Fuenzalida erigió la <strong>FUNDACIÓN JUAN XXIII</strong> como Persona Jurídica Pública de Derecho Canónico, distinta pero dependiente del Obispado de Santa María de los Ángeles.
                  </p>
                  <p>
                    La Fundación nació bajo la luz de la espiritualidad de <strong>Juan XXIII</strong>, conocido como el «Papa Bueno», procurando encarnar los valores de <em>sencillez, autenticidad y alegría</em>. Su propósito es evangelizar y participar en el proceso educativo de la juventud de la provincia del Biobío.
                  </p>
                  <p>
                    Se inició con la donación de la Congregación de las Hermanas del Niño Jesús de Aurillac, según consta en escritura pública fechada el 16 de marzo de 1974.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Desarrollo */}
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
                    <AcademicCapIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-primary-800">Crecimiento y Expansión</h3>
                    <p className="text-secondary-600 font-medium">Construyendo una red educativa</p>
                  </div>
                </div>
                <div className="text-gray-700 leading-relaxed space-y-4">
                  <p>
                    La Fundación comenzó con el <strong>Colegio Teresiano</strong> (posteriormente <strong>Colegio San Rafael Arcángel</strong>), ubicado en calle Almagro 237. Posteriormente se construyó un colegio de enseñanza básica en calle Marconi, que más tarde se constituyó como el <strong>Colegio San Gabriel Arcángel</strong>.
                  </p>
                  <p>
                    <strong>Cronología de fundación de colegios:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>1975:</strong> Colegio San Rafael Arcángel</li>
                    <li><strong>1986:</strong> Colegio San Gabriel Arcángel y Escuela Butalelbúm</li>
                    <li><strong>1987:</strong> Colegio Juan Pablo II y Escuela KauñiKú</li>
                    <li><strong>1990:</strong> Colegio San Diego de Alcalá (Huépil)</li>
                    <li><strong>1995:</strong> Colegio Padre Alberto Hurtado</li>
                    <li><strong>1996:</strong> Colegio Beato Damián de Molokai</li>
                    <li><strong>2021:</strong> Colegio San Jorge (Laja)</li>
                  </ul>
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
                      <div className="text-primary-100">Colegios Católicos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-secondary-300 mb-2">1000+</div>
                      <div className="text-primary-100">Familias Atendidas</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-primary-800 mb-6">
              Misión y <span className="text-secondary-600">Visión</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Nuestro propósito fundamental y la meta hacia la que dirigimos nuestros esfuerzos educativos
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Misión */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 relative overflow-hidden h-full">
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
                  
                  <div className="mt-8 bg-primary-50 rounded-xl p-6 border border-primary-100">
                    <h4 className="font-semibold text-primary-800 mb-3">Nuestro Propósito:</h4>
                    <p className="text-primary-700 text-sm leading-relaxed">
                      Como entidad sin fines de lucro, evangelizamos y participamos en el proceso educativo 
                      de la juventud, contribuyendo al desarrollo cultural de acuerdo a las modalidades, 
                      principios y disposiciones de la Iglesia Católica.
                    </p>
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
              <div className="bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 relative overflow-hidden h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center mb-8">
                    <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl p-4 mr-6 shadow-lg">
                      <TrophyIcon className="h-10 w-10 text-white" />
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
                  
                  <div className="mt-8 bg-secondary-50 rounded-xl p-6 border border-secondary-100">
                    <h4 className="font-semibold text-primary-800 mb-3">Nuestro Compromiso:</h4>
                    <p className="text-secondary-700 text-sm leading-relaxed">
                      Aspiramos a ser referente en educación católica integral, formando líderes 
                      cristianos comprometidos con la transformación social y el bien común.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Inspiración de San Juan XXIII */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative z-10">
                <img 
                  src={fundacionImages.logo} 
                  alt="Logo Fundación Juan XXIII"
                  className="h-16 w-16 object-contain mx-auto mb-6 bg-white rounded-full p-2"
                />
                <h3 className="text-3xl font-bold mb-6 text-secondary-300">
                  Inspirados en San Juan XXIII
                </h3>
                <blockquote className="text-xl md:text-2xl font-light italic leading-relaxed mb-6">
                  "Procuramos encarnar los valores de sencillez, autenticidad y alegría del Papa Bueno, 
                  quien abrió las puertas de la Iglesia al mundo con amor y sabiduría pastoral."
                </blockquote>
                <cite className="text-secondary-300 font-semibold">
                  — Fundación Juan XXIII
                </cite>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Valores */}
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
              Los pilares fundamentales que guían nuestra misión educativa católica
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

      {/* Estadísticas */}
      <section className="py-16 bg-blue-900 text-white">
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
            <p className="text-xl text-blue-100">
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
                <div className="text-5xl font-bold text-yellow-400 mb-2">
                  {stat.numero}
                </div>
                <div className="text-xl font-semibold mb-1">
                  {stat.label}
                </div>
                <div className="text-blue-200">
                  {stat.descripcion}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Compromiso */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Nuestro Compromiso
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Continuamos trabajando día a día para ofrecer una educación transformadora, 
              que no solo prepare académicamente a nuestros estudiantes, sino que también 
              los forme como ciudadanos comprometidos con la construcción de un mundo más justo y fraterno.
            </p>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-center mb-4">
                <img 
                  src={fundacionImages.logo} 
                  alt="Logo Fundación Juan XXIII"
                  className="h-16 w-16 object-contain"
                />
              </div>
              <p className="text-lg font-medium text-gray-900">
                "Educando con amor y excelencia para formar líderes del futuro"
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Nosotros;
