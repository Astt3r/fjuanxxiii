// server/src/server.js
require('dotenv').config();
const path = require('path');
const http = require('http');
const cors = require('cors');

const app = require('./app');
const { validateEnv } = require('./config/validateEnv');

validateEnv();

const env   = process.env.NODE_ENV || 'development';
const isTest = env === 'test';
const isProd = env === 'production';
// Puerto (en producción esperamos que Passenger lo inyecte)
// Se reubica más abajo junto al bloque de arranque para validar correctamente.

// 1) proxy
app.set('trust proxy', 1);

// 2) Enforce HTTPS (opcional vía env)
if (String(process.env.ENFORCE_HTTPS).toLowerCase() === 'true') {
  app.use((req, res, next) => {
    if (req.secure) return next();
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
  });
}

// 3) CORS
const allowed = (process.env.CORS_ORIGINS
  || process.env.CLIENT_URL
  || process.env.FRONTEND_URL
  || ''
).split(',')
 .map(s => s.trim())
 .filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);        // curl/health
    if (allowed.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS bloqueado: ${origin}`));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// 4) estáticos
app.use('/uploads', require('express').static(
  path.join(__dirname, '..', 'uploads'),
  {
    dotfiles: 'ignore',
    index: false,
    etag: true,
    maxAge: '1h',
    setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
  }
));

// 5) server
const server = http.createServer(app);

// listen mínimo y seguro para Passenger
const PORT = process.env.PORT || (!isProd ? 5003 : undefined); // en prod debe venir de Passenger

if (!isTest) {
  if (isProd && !process.env.PORT) {
    console.error('❌ En producción falta PORT (Passenger). Revisa la app en cPanel.');
    process.exit(1);
  }

  server.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
  });

  server.on('error', (err) => {
    console.error('❌ Error del servidor:', err);
  });

  // timeouts recomendados
  server.headersTimeout = 65000;
  server.keepAliveTimeout = 60000;
  server.requestTimeout = 0;

  // apagado ordenado
  function shutdown(code = 0) {
    console.log('🛑 Apagando servidor...');
    server.close(() => {
      console.log('✅ Servidor cerrado');
      process.exit(code);
    });
    setTimeout(() => process.exit(code), 5000).unref();
  }
  process.on('unhandledRejection', (err) => { console.error('💥 UnhandledRejection:', err?.stack || err); shutdown(1); });
  process.on('uncaughtException',  (err) => { console.error('💥 UncaughtException:',  err?.stack || err); shutdown(1); });
  process.on('SIGINT', () => shutdown(0));
  process.on('SIGTERM', () => shutdown(0));
}

module.exports = app;
