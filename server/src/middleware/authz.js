/**
 * Authorization helpers based on roles embedded in JWT (and ideally persisted in DB).
 * Usage:
 *   const { authenticateToken } = require('./auth');
 *   const { requireRole } = require('./authz');
 *   router.post('/admin', authenticateToken, requireRole('admin'), handler);
 */
function requireRole(...roles) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'No autenticado' });
      }
      const role = req.user.role || req.user.rol; // tolerate both keys
      if (!role || !roles.includes(role)) {
        return res.status(403).json({ message: 'No autorizado' });
      }
      return next();
  } catch (_err) {
      return res.status(500).json({ message: 'Error en autorización' });
    }
  };
}

module.exports = { requireRole };
