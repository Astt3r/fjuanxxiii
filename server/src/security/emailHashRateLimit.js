// Rate limiting adicional por hash de email (en memoria) para el endpoint de login.
// Activación: EMAIL_HASH_LIMIT_ENABLE=true
// ENV:
//  EMAIL_HASH_LIMIT_MAX=10           (intentos fallidos por ventana por email hash)
//  EMAIL_HASH_LIMIT_WINDOW_MS=900000 (ventana en ms)
//  EMAIL_HASH_LIMIT_BLOCK_MS=900000  (tiempo de bloqueo tras exceder)
// Nota: Usa un hash SHA-256 simple para no almacenar el email plano en memoria.

const crypto = require('crypto');

const windowMs = parseInt(process.env.EMAIL_HASH_LIMIT_WINDOW_MS || '900000',10);
const maxFails = parseInt(process.env.EMAIL_HASH_LIMIT_MAX || '10',10);
const blockMs = parseInt(process.env.EMAIL_HASH_LIMIT_BLOCK_MS || '900000',10);

const store = new Map(); // hash -> { fails, windowExp, blockExp }

function hashEmail(email=''){
  return crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');
}

function isBlockedEmail(email){
  if(process.env.EMAIL_HASH_LIMIT_ENABLE !== 'true') return false;
  const key = hashEmail(email);
  const rec = store.get(key);
  if(!rec) return false;
  const now = Date.now();
  if(rec.blockExp && rec.blockExp > now) return true;
  if(rec.windowExp <= now){ store.delete(key); return false; }
  return false;
}

function registerFailEmail(email){
  if(process.env.EMAIL_HASH_LIMIT_ENABLE !== 'true') return;
  const key = hashEmail(email);
  const now = Date.now();
  let rec = store.get(key);
  if(!rec){
    rec = { fails:1, windowExp: now + windowMs, blockExp: 0 };
    store.set(key, rec);
    return;
  }
  if(rec.windowExp <= now){
    rec.fails = 1; rec.windowExp = now + windowMs; rec.blockExp = 0; return;
  }
  rec.fails += 1;
  if(rec.fails >= maxFails){
    rec.blockExp = now + blockMs;
  }
}

function registerSuccessEmail(email){
  if(process.env.EMAIL_HASH_LIMIT_ENABLE !== 'true') return;
  const key = hashEmail(email);
  // En éxito limpiamos completamente para ese email
  store.delete(key);
}

module.exports = { isBlockedEmail, registerFailEmail, registerSuccessEmail };
