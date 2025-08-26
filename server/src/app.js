const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Importar configuración de base de datos
const { connectDB } = require('./config/database');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const noticiasRoutes = require('./routes/noticiasRoutes');
const colegiosRoutes = require('./routes/colegiosRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const contactRoutes = require('./routes/contactRoutes');
const eventsRoutes = require('./routes/events');
const protocolsRoutes = require('./routes/protocols');
// const staffRoutes = require('./routes/staff'); // (unused) desactivado hasta que se requiera
const adminInvitationsRoutes = require('./routes/adminInvitationsRoutes');
const { pool } = require('./config/database');
const corsMw = require('./security/cors');

// Importar middleware
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

const app = express();

// Conectar a la base de datos
connectDB();

// Configuración de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // más permisivo en desarrollo
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// trust proxy para detectar HTTPS detrás de reverse proxy
app.enable('trust proxy');

// Middleware de seguridad (helmet + HSTS)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", 'data:', 'https:', 'http:'],
      scriptSrc: ["'self'"],
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
}));
if(process.env.ENFORCE_HTTPS === 'true'){
  app.use((req,res,next)=>{
    if(req.secure) return next();
    return res.redirect(301, 'https://' + req.headers.host + req.originalUrl);
  });
  // HSTS (solo si estamos forzando https)
  app.use(helmet.hsts({ maxAge: 15552000 })); // 180 días
}

// Middleware general
app.use(compression());
app.use(limiter);
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:3000'
];
app.use(cors({
  origin: function(origin, cb){
    if(!origin) return cb(null, true); // permitir no-CORS (curl, server-side)
    if(allowedOrigins.includes(origin)) return cb(null,true);
    return cb(new Error('CORS bloqueado'), false);
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  optionsSuccessStatus: 200
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger
app.use(logger);

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Rutas principales
// Rate limit específico para auth (más estricto)
// Ajustado: solo cuenta intentos fallidos (status >= 400) para no penalizar logins válidos o /me
// Si se excede, devolvemos mensaje claro. Se puede ajustar LIMIT_AUTH en .env.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: parseInt(process.env.AUTH_RATE_LIMIT || '10', 10),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // no contar respuestas < 400
  message: {
    error: 'Demasiados intentos fallidos de autenticación. Intenta de nuevo en unos minutos.'
  },
  // keyGenerator: (req, res) => req.ip // mantener por IP (no por email para evitar enumeración)
});
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/noticias', noticiasRoutes);
app.use('/api/colegios', colegiosRoutes);
app.use('/api/schools', colegiosRoutes); // Alias para compatibilidad
app.use('/api/uploads', uploadRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/admin/invitations', adminInvitationsRoutes);
// Reactivamos endpoints de protocolos (archivos ahora viven en /uploads/protocolos)
app.use('/api/protocols', protocolsRoutes);
// app.use('/api/staff', staffRoutes); // mantener desactivado hasta que se requiera

// Ruta de salud con comprobación de DB
app.get('/api/health', async (req, res) => {
  let dbStatus = 'down';
  try {
    await pool.query('SELECT 1');
    dbStatus = 'up';
  } catch(_err){ // _err reservado para posible logging futuro
    dbStatus = 'error';
  }
  res.json({ ok:true, db: dbStatus, ts: Date.now() });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'API de Fundación Juan XXIII',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);
app.use(corsMw);
module.exports = app;
