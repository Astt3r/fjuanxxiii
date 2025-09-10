require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/database');

// Conectar a la base de datos
connectDB();

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
  console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Cliente: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
});

// Configurar timeout del servidor
server.timeout = 30000;
