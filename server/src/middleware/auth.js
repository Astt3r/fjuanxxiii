const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acceso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Autenticación requerida' });
  }

  // Solo permitir acceso a admin@fundacionjuanxxiii.cl y rgaldames@fundacionjuanxxiii.cl
  const allowedEmails = [
    'admin@fundacionjuanxxiii.cl',
    'rgaldames@fundacionjuanxxiii.cl'
  ];

  if (!allowedEmails.includes(req.user.email)) {
    return res.status(403).json({ 
      message: 'Acceso restringido. Solo administradores autorizados.' 
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  requireAdmin
};
