require('dotenv').config();

console.log('🔄 Iniciando servidor...');

const app = require('./app');

console.log('✅ App cargada correctamente');

const PORT = process.env.PORT || 5001;

console.log(`🔍 Intentando escuchar en puerto ${PORT}...`);

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📊 Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Cliente: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  console.log(`🎯 Servidor listening en 0.0.0.0:${PORT}`);
});

server.on('error', (err) => {
  console.error('❌ Error del servidor:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Puerto ${PORT} ya está en uso`);
  }
});

// Configurar timeout del servidor
server.timeout = 30000; // 30 segundos

// Manejo de errores no capturados
process.on('unhandledRejection', (err, promise) => {
  console.log('❌ Error no manejado:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.log('❌ Excepción no capturada:', err.message);
  process.exit(1);
});

module.exports = server;
