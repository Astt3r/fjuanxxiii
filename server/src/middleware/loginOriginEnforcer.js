// Middleware para reforzar el endpoint de login mediante validación de origen / referer
// Activación controlada por env vars para NO romper flujos locales / tests.
//
// ENV:
//  LOGIN_REQUIRE_ORIGIN=true        -> Activa la verificación de origen
//  LOGIN_ORIGINS=https://app.dominio.cl,https://www.dominio.cl (lista separada por comas)
//  LOGIN_CLIENT_KEY=valor_secreto   -> Si se define, exige header 'x-client-key'
//  LOGIN_ORIGIN_ALLOW_NOHEADER=true -> Permite ausencia de Origin/Referer (por defecto se exige uno)

const parseOrigins = () => (process.env.LOGIN_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

module.exports = function loginOriginEnforcer(req, res, next) {
  // Sólo aplicar en POST /login dentro de /api/auth
  if (req.method !== 'POST') return next();
  if (process.env.LOGIN_REQUIRE_ORIGIN !== 'true') return next();

  const allowed = parseOrigins();
  if (!allowed.length) {
    // Si se activa la verificación pero no se configuraron orígenes, por seguridad negamos.
    return res.status(403).json({ message: 'Configuración de orígenes no establecida' });
  }

  const origin = req.headers.origin || '';
  const referer = req.headers.referer || '';

  if (!origin && !referer && process.env.LOGIN_ORIGIN_ALLOW_NOHEADER !== 'true') {
    return res.status(403).json({ message: 'Origen requerido' });
  }

  const headerKey = process.env.LOGIN_CLIENT_KEY;
  if (headerKey) {
    const provided = req.headers['x-client-key'];
    if (provided !== headerKey) {
      return res.status(403).json({ message: 'Acceso no autorizado' });
    }
  }

  if (origin || referer) {
    const value = origin || referer; // preferimos origin
    const ok = allowed.some(a => value.startsWith(a));
    if (!ok) return res.status(403).json({ message: 'Origen no autorizado' });
  }

  return next();
};
