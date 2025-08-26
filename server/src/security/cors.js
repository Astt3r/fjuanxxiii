const cors = require('cors');

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// política: si no hay ORIGIN o ALLOWED_ORIGINS vacío => permitir (útil para Postman)
const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (!ALLOWED_ORIGINS.length || ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE'],
  allowedHeaders: ['Content-Type','Authorization'],
};

module.exports = cors(corsOptions);
module.exports.corsOptions = corsOptions; // por si lo necesitas en tests