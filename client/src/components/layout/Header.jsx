import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { fundacionImages } from '../../assets';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Detectar scroll para cambiar apariencia del header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menús al cambiar de ruta
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location]);

  // Enlaces de navegación
  const navLinks = [
    { to: '/', label: 'Inicio' },
    { 
      label: 'Nosotros',
      hasDropdown: true,
      dropdownItems: [
        { to: '/nuestra-historia', label: 'Nuestra Historia' },
        { to: '/calendario-eventos', label: 'Calendario de Eventos' },
        { to: '/valores-institucionales', label: 'Valores Institucionales' },
        { to: '/nuestro-equipo', label: 'Nuestro Equipo' }
      ]
    },
    { to: '/pastoral', label: 'Pastoral' },
    { to: '/noticias', label: 'Noticias' },
    { to: '/colegios', label: 'Colegios' },
    { to: '/protocolos', label: 'Protocolos' },
    { to: '/contacto', label: 'Contacto' },
  ];

  // Verificar si un enlace está activo
  const isActiveLink = (path, dropdownItems = null) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    if (dropdownItems) {
      return dropdownItems.some(item => location.pathname === item.to);
    }
    return location.pathname.startsWith(path);
  };

  // Manejar logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Obtener iniciales del usuario
  const getUserInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-100'
          : 'bg-gradient-to-r from-primary-700 to-primary-600'
      }`}
    >
      <div className="container-custom">
        <nav className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-3 group"
          >
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:scale-105">
              <img 
                src={fundacionImages.logo} 
                alt="Logo Fundación Juan XXIII"
                className="w-8 h-8 lg:w-10 lg:h-10 object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className={`text-lg lg:text-xl font-bold transition-colors duration-200 ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}>
                Fundación Juan XXIII
              </h1>
              <p className={`text-xs lg:text-sm transition-colors duration-200 ${
                isScrolled ? 'text-gray-600' : 'text-gray-200'
              }`}>
                Educación con valores
              </p>
            </div>
          </Link>

          {/* Navegación desktop */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link, index) => (
              <div key={link.to || index} className="relative">
                {link.hasDropdown ? (
                  <div 
                    className="relative"
                    onMouseEnter={() => setDropdownOpen(index)}
                    onMouseLeave={() => setDropdownOpen(null)}
                  >
                    <button
                      className={`relative py-2 px-1 text-sm font-medium transition-colors duration-200 flex items-center ${
                        isActiveLink(link.to, link.dropdownItems)
                          ? 'text-primary-600'
                          : isScrolled
                          ? 'text-gray-700 hover:text-primary-600'
                          : 'text-white hover:text-primary-200'
                      }`}
                    >
                      {link.label}
                      <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      {isActiveLink(link.to, link.dropdownItems) && (
                        <motion.div
                          layoutId="activeLink"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                          initial={false}
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {dropdownOpen === index && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                        >
                          {link.dropdownItems.map((item) => (
                            <Link
                              key={item.to}
                              to={item.to}
                              className={`block px-4 py-3 text-sm transition-colors hover:bg-primary-50 hover:text-primary-600 first:rounded-t-lg last:rounded-b-lg ${
                                location.pathname === item.to ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700'
                              }`}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    to={link.to}
                    className={`relative py-2 px-1 text-sm font-medium transition-colors duration-200 ${
                      isActiveLink(link.to)
                        ? 'text-primary-600'
                        : isScrolled
                        ? 'text-gray-700 hover:text-primary-600'
                        : 'text-white hover:text-primary-200'
                    }`}
                  >
                    {link.label}
                    {isActiveLink(link.to) && (
                      <motion.div
                        layoutId="activeLink"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                        initial={false}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Acciones del usuario */}
          <div className="flex items-center space-x-4">
            {/* Toggle tema */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isScrolled
                  ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  : 'text-white hover:text-primary-200 hover:bg-white/10'
              }`}
              aria-label="Cambiar tema"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            {/* Usuario autenticado */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg transition-colors hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {getUserInitials(user?.nombre || 'Usuario')}
                    </span>
                  </div>
                  <span className={`hidden sm:block text-sm font-medium ${
                    isScrolled ? 'text-gray-700' : 'text-white'
                  }`}>
                    {user?.nombre}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    } ${isScrolled ? 'text-gray-600' : 'text-white'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Menú de usuario */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
                    >
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Panel de Administración
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Cerrar sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // Usuario no autenticado
              <div className="hidden sm:flex items-center space-x-3">
                <Link
                  to="/login"
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isScrolled
                      ? 'text-gray-700 hover:text-primary-600'
                      : 'text-white hover:text-primary-200'
                  }`}
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}

            {/* Botón menú móvil */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                isScrolled
                  ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  : 'text-white hover:text-primary-200 hover:bg-white/10'
              }`}
              aria-label="Abrir menú"
            >
              <svg
                className={`w-6 h-6 transition-transform ${
                  isMenuOpen ? 'rotate-90' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </nav>

        {/* Menú móvil */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-gray-200 mobile-menu"
            >
              <div className="py-4 space-y-2">
                {navLinks.map((link, index) => (
                  <div key={link.to || index}>
                    {link.hasDropdown ? (
                      <div>
                        <button
                          onClick={() => setDropdownOpen(dropdownOpen === index ? null : index)}
                          className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                            isActiveLink(link.to, link.dropdownItems)
                              ? 'text-primary-600 bg-primary-50'
                              : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                          }`}
                        >
                          {link.label}
                          <svg 
                            className={`h-4 w-4 transform transition-transform ${dropdownOpen === index ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <AnimatePresence>
                          {dropdownOpen === index && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="ml-4 mt-2 space-y-1"
                            >
                              {link.dropdownItems.map((item) => (
                                <Link
                                  key={item.to}
                                  to={item.to}
                                  className={`block px-4 py-2 text-sm rounded-lg transition-colors ${
                                    location.pathname === item.to
                                      ? 'text-primary-600 bg-primary-50 font-medium'
                                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                                  }`}
                                >
                                  {item.label}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        to={link.to}
                        className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                          isActiveLink(link.to)
                            ? 'text-primary-600 bg-primary-50'
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        }`}
                      >
                        {link.label}
                      </Link>
                    )}
                  </div>
                ))}
                
                {!isAuthenticated && (
                  <>
                    <hr className="my-2" />
                    <Link
                      to="/login"
                      className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-3 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Registrarse
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;
