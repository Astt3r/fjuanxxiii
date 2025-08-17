// Importar logos de colegios
import beatoDamianLogo from './logos/beato damian.png';
import caunicuLogo from './logos/cauñicú.png';
import diegoAlcalaLogo from './logos/diego de alcala.png';
import juanPabloLogo from './logos/juan pablo.png';
import padreHurtadoLogo from './logos/p hurtado.jpg';
import sanJorgeLogo from './logos/san jorge.png';
import sanRafaelLogo from './logos/san rafael.png';
import sanGabrielLogo from './logos/san-gabriel.png';
import trapaTrapaLogo from './logos/trapa trapa butalbelbun.png';

// Importar imágenes de la fundación
import fundacionExteriorImg from './images/fundacion-exterior.png';
import logoFundacion from './images/logo.png';

// Mapeo de logos por slug de colegio
export const colegiosLogos = {
  'beato-damian-molokai': beatoDamianLogo,
  'caunicu': caunicuLogo,
  'san-diego-alcala': diegoAlcalaLogo,
  'juan-pablo-ii': juanPabloLogo,
  'padre-alberto-hurtado': padreHurtadoLogo,
  'san-jorge': sanJorgeLogo,
  'san-rafael-arcangel': sanRafaelLogo,
  'san-gabriel-arcangel': sanGabrielLogo,
  'trapa-trapa-butalelbum': trapaTrapaLogo,
};

// Imágenes de la fundación
export const fundacionImages = {
  exterior: fundacionExteriorImg,
  logo: logoFundacion,
};

// Función para obtener logo por slug
export const getColegioLogo = (slug) => {
  return colegiosLogos[slug] || null;
};

// Colores por tema de colegio (para fondos cuando no hay logo)
export const colegiosColores = {
  'beato-damian-molokai': 'from-green-400 to-green-600',
  'caunicu': 'from-orange-400 to-orange-600',
  'san-diego-alcala': 'from-blue-400 to-blue-600',
  'juan-pablo-ii': 'from-purple-400 to-purple-600',
  'padre-alberto-hurtado': 'from-red-400 to-red-600',
  'san-jorge': 'from-indigo-400 to-indigo-600',
  'san-rafael-arcangel': 'from-cyan-400 to-cyan-600',
  'san-gabriel-arcangel': 'from-teal-400 to-teal-600',
  'trapa-trapa-butalelbum': 'from-yellow-400 to-yellow-600',
};

export const getColegioColor = (slug) => {
  return colegiosColores[slug] || 'from-gray-400 to-gray-600';
};
