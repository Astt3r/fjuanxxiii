// Footer.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue } from 'framer-motion';



const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    institucional: [{ label: 'Nosotros', to: '/nuestra-historia' }],
    servicios: [
      { label: 'Pastoral Educativa', to: '/pastoral' },
      { label: 'Noticias', to: '/noticias' },
      { label: 'Colegios', to: '/colegios' },
      { label: 'Protocolos', to: '/pastoral#protocolos' },
    ],
    contacto: [
      { label: 'Contacto', to: '/contacto' },
      { label: 'Ubicación', to: '/contacto#ubicacion' },
      { label: 'Horarios', to: '/contacto#horarios' },
    ],
  };

  const socialLinks = [
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/FundacionJuanXXIII/',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/fundacionjuanxxiiila/',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.39-3.26-1.03-.812-.64-1.218-1.542-1.218-2.706 0-1.164.406-2.066 1.218-2.706.812-.64 1.963-1.03 3.26-1.03 1.297 0 2.448.39 3.26 1.03.812.64 1.218 1.542 1.218 2.706 0 1.164-.406 2.066-1.218 2.706-.812.64-1.963 1.03-3.26 1.03zm7.718-9.674h-1.297v-1.297h1.297v1.297zm-3.917 2.45c-.918 0-1.663.745-1.663 1.663s.745 1.663 1.663 1.663 1.663-.745 1.663-1.663-.745-1.663-1.663-1.663z"/>
        </svg>
      ),
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/channel/UC8UBYBwR1NFtAk2S3QZPXIQ',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
    },
  ];

  const contactInfo = {
    address: 'Valdivia 300, 4to piso, Oficina 401, Los Ángeles',
    phone: '43-2314006',
    email: 'secretaria@fundacionjuanxxiii.cl',
    website: 'www.fjuanxxiii.cl',
  };

  return (
    <footer className="bg-primary-900 text-white">
      {/* Sección principal del footer */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Información de la fundación */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <Link to="/" className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">FJ</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Fundación Juan XXIII</h3>
                <p className="text-gray-400 text-sm">Educación con valores</p>
              </div>
            </Link>

            <p className="text-gray-300 mb-6 leading-relaxed">
              Comprometidos con la educación integral y la formación en valores
              cristianos, acompañamos a las comunidades educativas en su misión
              de formar personas íntegras y solidarias.
            </p>

            {/* Información de contacto */}
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{contactInfo.address}</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href={`tel:${contactInfo.phone}`} className="hover:text-primary-400 transition-colors">
                  {contactInfo.phone}
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${contactInfo.email}`} className="hover:text-primary-400 transition-colors">
                  {contactInfo.email}
                </a>
              </div>
            </div>
          </motion.div>

          {/* Enlaces institucionales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold mb-4">Institucional</h4>
            <ul className="space-y-2">
              {footerLinks.institucional.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Enlaces de servicios */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold mb-4">Servicios</h4>
            <ul className="space-y-2">
              {footerLinks.servicios.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Redes sociales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-8 pt-8 border-t border-gray-800"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0">
              <h4 className="text-lg font-semibold mb-2">Síguenos</h4>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-primary-800 rounded-lg flex items-center justify-center text-gray-300 hover:text-white hover:bg-secondary-600 transition-all duration-200"
                    aria-label={`Seguir en ${social.name}`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Copyright + trigger secreto */}
      <div className="bg-primary-800 py-4">
        <div className="container-custom">
          <div
            className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-400 select-none"
            title="©"
          >
            <p>
              © {currentYear} Fundación Juan XXIII. Todos los derechos reservados.
            </p>
            <div className="flex space-x-4 mt-2 sm:mt-0">
              <Link to="/privacidad" className="hover:text-primary-400 transition-colors">
                Política de Privacidad
              </Link>
              <Link to="/terminos" className="hover:text-primary-400 transition-colors">
                Términos de Uso
              </Link>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
