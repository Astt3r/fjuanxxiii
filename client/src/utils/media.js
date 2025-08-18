// Utilidades para normalizar URLs de medios (imágenes) que vienen del backend
// Si el backend entrega rutas relativas (/uploads/...), construimos la URL absoluta usando REACT_APP_API_URL

const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
let apiOrigin = apiBase;
try {
  const u = new URL(apiBase);
  // Si termina en /api eliminar ese sufijo para apuntar al host base de archivos
  apiOrigin = u.origin + (u.pathname.replace(/\/api\/?$/, '') || '');
} catch(_) {
  apiOrigin = 'http://localhost:5003';
}

export function buildMediaUrl(src) {
  if (!src) return src;
  if (/^https?:\/\//i.test(src)) return src; // ya absoluta
  if (src.startsWith('/')) return apiOrigin + src; // ruta absoluta relativa
  return apiOrigin + '/' + src.replace(/^\.\//,'');
}

// Reescribe HTML de contenido reemplazando src="/uploads/..." o src='/uploads/...'
export function rewriteContentMedia(html) {
  if (!html) return html;
  return html.replace(/(<img[^>]+src=["'])(\/uploads\/[^"'>]+)(["'])/gi, (m, p1, p2, p3) => {
    return p1 + buildMediaUrl(p2) + p3;
  });
}

export function normalizeImagenesArray(imagenes = []) {
  return imagenes.map(img => ({ ...img, url: buildMediaUrl(img.url) }));
}

export function ensureFeaturedUrl(noticia) {
  if (!noticia) return noticia;
  return { ...noticia, imagen_url: buildMediaUrl(noticia.imagen_url) };
}

export const mediaUtils = { buildMediaUrl, rewriteContentMedia, normalizeImagenesArray, ensureFeaturedUrl };
