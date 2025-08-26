// server/src/server.js
require('dotenv').config();
const path = require('path');
const http = require('http');
const app = require('./app');
const { validateEnv } = require('./config/validateEnv');

validateEnv();

const env = process.env.NODE_ENV || 'development';
const isTest = env === 'test';
const isProd = env === 'production';
const PORT = Number(process.env.PORT) || 5003;

// 🔐 Trust proxy NUNCA como true global; en prod usa 'loopback', en test/desa false
app.set('trust proxy', isProd ? 'loopback' : false);

// 🔹 Middlewares/estáticos SIEMPRE antes de listen
app.use(
  '/uploads',
  require('express').static(path.join(__dirname, '..', 'uploads'), {
    dotfiles: 'ignore',
    index: false,
    etag: true,
    maxAge: '1h',
    setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
  }),
);

// 🔹 Crea el server explícitamente (evita doble listen)
const server = http.createServer(app);

if (!isTest) {
  console.log('🔄 Iniciando servidor...');
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor ejecutándose en 0.0.0.0:${PORT}`);
    console.log(`📊 Modo: ${env}`);
    console.log(`🌐 Cliente permitido: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  });

  server.on('error', (err) => {
    console.error('❌ Error del servidor:', err);
    if (err.code === 'EADDRINUSE') console.error(`❌ Puerto ${PORT} ya está en uso`);
  });

  server.headersTimeout = 65000;
  server.keepAliveTimeout = 60000;
  server.requestTimeout = 0;

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

// Exporta el app (supertest lo usa directo); en prod igual funciona lo anterior
module.exports = app;