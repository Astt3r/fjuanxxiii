const cors = require('cors');

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const WILDCARD_PATTERNS = ALLOWED_ORIGINS
  .filter(o => o.startsWith('*.'))
  .map(o => o.slice(1)); // convierte "*.netlify.app" → ".netlify.app"

const EXACT_ORIGINS = ALLOWED_ORIGINS.filter(o => !o.startsWith('*.'));

function isOriginAllowed(origin) {
  if (EXACT_ORIGINS.includes(origin)) return true;
  return WILDCARD_PATTERNS.some(suffix => origin.endsWith(suffix));
}

//si no hay ORIGIN o ALLOWED_ORIGINS vacío => permitir (útil para Postman/local)
const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (!ALLOWED_ORIGINS.length || isOriginAllowed(origin)) {
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