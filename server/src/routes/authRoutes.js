const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../config/database');
const R = require('../utils/response');

// JWT secret validado en el arranque
const JWT_SECRET = process.env.JWT_SECRET;

// Ruta de login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return R.fail(res, 'Email y contraseña son requeridos', 400);

    const users = await db.query('SELECT id, nombre, email, password, rol, estado FROM usuarios WHERE email = ? AND estado = "activo"', [email]);
    if (!users.length) return R.fail(res, 'Credenciales inválidas', 401);

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return R.fail(res, 'Credenciales inválidas', 401);

    const token = jwt.sign({ id: user.id, email: user.email, rol: user.rol }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '24h' });
    await db.query('UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?', [user.id]);
    R.ok(res, { token, user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } });
  } catch (error) {
    console.error('Error en login:', error);
    R.fail(res, 'Error interno del servidor', 500);
  }
});

// Middleware para verificar token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token no proporcionado'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Ruta para obtener información del usuario actual
router.get('/me', verifyToken, async (req, res) => {
  try {
  const users = await db.query('SELECT id, nombre, email, rol, estado, ultimo_acceso FROM usuarios WHERE id = ? AND estado = "activo"', [req.user.id]);
  if (!users.length) return R.fail(res, 'Usuario no encontrado', 404);
  R.ok(res, users[0]);

  } catch (error) {
    console.error('Error obteniendo usuario:', error);
  R.fail(res, 'Error interno del servidor', 500);
  }
});

// Ruta de logout (opcional - solo limpia el token del lado del cliente)
router.post('/logout', (req, res) => R.ok(res, { logout: true }));

// Exportar también el middleware para usar en otras rutas
router.verifyToken = verifyToken;

module.exports = router;
