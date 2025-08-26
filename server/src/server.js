// server/src/server.js
require('dotenv').config();
const path = require('path');
const http = require('http');
const app = require('./app');
const { validateEnv } = require('./config/validateEnv');

validateEnv();

const PORT = Number(process.env.PORT) || 5003;

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

// 💬 Logs compactos y consistentes
console.log('🔄 Iniciando servidor...');
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor ejecutándose en 0.0.0.0:${PORT}`);
  console.log(`📊 Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Cliente permitido: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
});

server.on('error', (err) => {
  console.error('❌ Error del servidor:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Puerto ${PORT} ya está en uso`);
  }
});

// ⏱ Ajustes de timeouts recomendados en Node moderno
server.headersTimeout = 65000;   // tiempo para cabeceras
server.keepAliveTimeout = 60000; // conexiones keep-alive
server.requestTimeout = 0;       // deshabilita timeout por request (manejas tú)

// 🧹 Shutdown limpio
function shutdown(code = 0) {
  console.log('🛑 Apagando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
    process.exit(code);
  });
  // fuerza salida si cuelga
  setTimeout(() => process.exit(code), 5000).unref();
}

process.on('unhandledRejection', (err) => {
  console.error('💥 UnhandledRejection:', err?.stack || err);
  shutdown(1);
});

process.on('uncaughtException', (err) => {
  console.error('💥 UncaughtException:', err?.stack || err);
  shutdown(1);
});

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

module.exports = server;
