// Simple environment validation. Expand with a schema library if needed.
const REQUIRED_VARS = [
  'JWT_SECRET',
  'DB_HOST', 'DB_USER', 'DB_NAME'
];

function validateEnv() {
  const missing = REQUIRED_VARS.filter(v => !process.env[v] || process.env[v].trim() === '');
  if (missing.length) {
    console.error('❌ Faltan variables de entorno obligatorias:', missing.join(', '));
    console.error('Use el archivo .env.example como referencia.');
    process.exit(1);
  }
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 16) {
    console.warn('⚠️ JWT_SECRET es muy corto; considere usar al menos 32 caracteres.');
  }
}

module.exports = { validateEnv };
