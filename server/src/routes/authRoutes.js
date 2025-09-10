const express = require('express');
const { genSalt, hash, compare } = require('../utils/password');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../config/database');
const R = require('../utils/response');
const { registerGuard } = require('../middleware/registerGuard');
// Hardening login
const loginOriginEnforcer = require('../middleware/loginOriginEnforcer');
const { isBlocked, registerFail, registerSuccess, blockResponse } = require('../security/loginAttempts');
const { isBlockedEmail, registerFailEmail, registerSuccessEmail } = require('../security/emailHashRateLimit');
const { verifyCaptcha } = require('../security/captcha');

// JWT secret validado en el arranque
const JWT_SECRET = process.env.JWT_SECRET;

// Validador reutilizable
const passwordPolicy = (value) => {
  if(!value || value.length < 10) throw new Error('Password inválido');
  if(!/[0-9]/.test(value) || !/[A-Za-z]/.test(value)) throw new Error('Password inválido');
  return true;
};

// Ruta de login endurecida (middleware opcional por env)
router.post('/login', [
  loginOriginEnforcer,
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return R.fail(res, 'Credenciales inválidas', 401);
    const { email, password } = req.body;

    // Bloqueo por IP + combinado + email hash
    if (isBlocked(req.ip, email) || isBlockedEmail(email)) return blockResponse(res);

    // Verificación CAPTCHA (opcional por env y sólo tras ciertos fallos si se quiere evolucionar)
    if(process.env.CAPTCHA_ENABLE === 'true'){
      // Modo adaptativo futuro: exigir tras X fallos IP/email; por ahora siempre si está activado
      const fieldName = process.env.CAPTCHA_FIELD || 'captchaToken';
      const token = req.body[fieldName];
      const result = await verifyCaptcha(token);
      if(!result.ok){
        // NO decir que es captcha para evitar enumeración
        registerFail(req.ip, email); registerFailEmail(email);
        return R.fail(res,'Credenciales inválidas',401);
      }
    }

    const users = await db.query('SELECT id, nombre, email, password, rol, estado FROM usuarios WHERE email = ? AND estado = "activo"', [email]);
  if (!users.length) { registerFail(req.ip, email); registerFailEmail(email); return R.fail(res, 'Credenciales inválidas', 401); }

    const user = users[0];
  const valid = await compare(password, user.password);
  if (!valid) { registerFail(req.ip, email); registerFailEmail(email); return R.fail(res, 'Credenciales inválidas', 401); }

    // Éxito → limpiar contadores
  registerSuccess(req.ip, email); registerSuccessEmail(email);

    const token = jwt.sign({ id: user.id, email: user.email, rol: user.rol }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '24h' });
    await db.query('UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?', [user.id]);
    R.ok(res, { token, user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } });
  } catch (_error) {
    console.error('Error en login');
    // No registramos fail en error interno para no penalizar a usuario legítimo
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
  } catch (_error) {
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

  } catch (_error) {
    console.error('Error obteniendo usuario');
  R.fail(res, 'Error interno del servidor', 500);
  }
});

// Ruta de logout (opcional - solo limpia el token del lado del cliente)
router.post('/logout', (req, res) => R.ok(res, { logout: true }));

// Exportar también el middleware para usar en otras rutas
router.verifyToken = verifyToken;

module.exports = router;

// Registro deshabilitado: devolver 404 salvo que REGISTER_OPEN==='true' y DISABLE_REGISTER!=='true'
if(process.env.DISABLE_REGISTER === 'true' || process.env.REGISTER_OPEN !== 'true'){
  router.post('/register', (_req,res)=> res.status(404).json({ message:'Not found' }));
} else {
  router.post('/register', registerGuard, [
    body('nombre').optional().trim().isLength({ min: 2 }).escape(),
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('password').custom(passwordPolicy),
  // invitationCode eliminado (tabla invitations removida)
  ], async (req,res) => {
    try {
      const errors = validationResult(req);
      if(!errors.isEmpty()) return R.fail(res,'Datos inválidos',400,{ errors: errors.array().map(e=>({ field:e.path, msg:e.msg })) });
  const { nombre, email, password } = req.body; // invitationCode eliminado
      const existing = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
      if(existing.length) return R.fail(res,'Credenciales inválidas',409);
      let role = 'admin';
  // Si REGISTER_OPEN != 'true' simplemente bloqueamos (sin invitations)
  if(process.env.REGISTER_OPEN !== 'true') return R.fail(res,'Registro deshabilitado',403);
  const saltRounds = Math.max(parseInt(process.env.BCRYPT_COST||'12',10),12);
  const salt = await genSalt(saltRounds);
  const hashed = await hash(password, salt);
  await db.query('INSERT INTO usuarios (nombre, email, password, rol, estado) VALUES (?,?,?,? ,"activo")', [nombre||email.split('@')[0], email, hashed, role]);
      R.created(res,{ registered:true });
    } catch(_e){
      if(_e.code==='ER_DUP_ENTRY') return R.fail(res,'Credenciales inválidas',409);
      console.error('Error en registro');
      R.fail(res,'Error interno del servidor',500);
    }
  });
}
