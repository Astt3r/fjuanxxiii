import React from 'react';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  AcademicCapIcon, 
  UsersIcon, 
  StarIcon,
  BookOpenIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { fundacionImages } from '../assets';

const Nosotros = () => {
  const valores = [
    {
      icon: HeartIcon,
      titulo: "Amor y Respeto",
      descripcion: "Promovemos un ambiente de amor, respeto mutuo y comprensión entre toda la comunidad educativa."
    },
    {
      icon: AcademicCapIcon,
      titulo: "Excelencia Académica",
      descripcion: "Buscamos la excelencia en todos los aspectos educativos, formando estudiantes competentes y críticos."
    },
    {
      icon: UsersIcon,
      titulo: "Formación Integral",
      descripcion: "Desarrollamos todas las dimensiones de la persona: intelectual, espiritual, social y física."
    },
    {
      icon: StarIcon,
      titulo: "Valores Cristianos",
      descripcion: "Inspirados en la doctrina cristiana, formamos personas con sólidos principios morales y éticos."
    }
  ];

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
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Imagen */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img 
                  src={fundacionImages.exterior} 
                  alt="Fundación Juan XXIII"
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-4">
                    <img 
                      src={fundacionImages.logo} 
                      alt="Logo Fundación Juan XXIII"
                      className="h-16 w-16 object-contain mx-auto"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contenido */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Nuestra Historia
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  La Fundación Juan XXIII nace del sueño de ofrecer educación de calidad 
                  basada en valores cristianos. Inspirados en la figura del Papa Juan XXIII, 
                  conocido por su bondad y apertura al diálogo, hemos construido una red 
                  educativa que abarca todo el territorio nacional.
                </p>
                <p>
                  Desde nuestros inicios, hemos mantenido un compromiso inquebrantable con 
                  la formación integral de nuestros estudiantes, combinando excelencia 
                  académica con sólida formación en valores.
                </p>
                <p>
                  Cada colegio de nuestra red mantiene la identidad común de la fundación, 
                  adaptándose a las necesidades específicas de su comunidad local.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Misión */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 rounded-full p-3 mr-4">
                  <BookOpenIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Misión</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Formar personas íntegras que contribuyan al desarrollo de una sociedad 
                más justa y solidaria, a través de una educación de calidad basada en 
                valores cristianos, la excelencia académica y el compromiso con la comunidad.
              </p>
            </motion.div>

            {/* Visión */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <div className="flex items-center mb-6">
                <div className="bg-yellow-100 rounded-full p-3 mr-4">
                  <TrophyIcon className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Visión</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Ser reconocidos como la red educativa líder en formación integral, 
                innovación pedagógica y valores cristianos, siendo referente nacional 
                en educación de calidad y desarrollo comunitario.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Nuestros Valores
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Los principios que guían nuestra labor educativa y forman el carácter de nuestros estudiantes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {valores.map((valor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="bg-blue-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <valor.icon className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {valor.titulo}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {valor.descripcion}
                </p>
              </motion.div>
            ))}
          </div>
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
