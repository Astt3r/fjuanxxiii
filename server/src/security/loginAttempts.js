// Control ligero de intentos fallidos de login en memoria.
// Activación: LOGIN_PROTECT=true
// Config:
//  LOGIN_FAIL_WINDOW_MS=900000          (ventana en ms)
//  LOGIN_MAX_FAILS=5                    (fallos por combinación IP+email)
//  LOGIN_MAX_FAILS_IP=20                (fallos totales IP)
//  LOGIN_BLOCK_STATUS=401|429           (código respuesta al bloquear; por defecto 401 genérico)
//  LOGIN_BLOCK_MESSAGE=Credenciales inválidas  (mensaje homogéneo para no filtrar estado)

const WINDOW = parseInt(process.env.LOGIN_FAIL_WINDOW_MS || '900000', 10); // 15m
const MAX_COMBO = parseInt(process.env.LOGIN_MAX_FAILS || '5', 10);
const MAX_IP = parseInt(process.env.LOGIN_MAX_FAILS_IP || '20', 10);
const BLOCK_STATUS = parseInt(process.env.LOGIN_BLOCK_STATUS || '401', 10);
const BLOCK_MESSAGE = process.env.LOGIN_BLOCK_MESSAGE || 'Credenciales inválidas';

// Map structures: key -> { count, exp }
const comboMap = new Map(); // ip|email
const ipMap = new Map(); // ip only

function now() { return Date.now(); }

function cleanup(map) {
  const t = now();
  for (const [k, v] of map.entries()) {
    if (v.exp <= t) map.delete(k);
  }
}

function touch(map, key) {
  const t = now();
  const rec = map.get(key);
  if (!rec) {
    map.set(key, { count: 1, exp: t + WINDOW });
  } else {
    rec.count += 1;
    // Mantener misma exp; no sliding window para simplificar.
  }
}

function isBlocked(ip, email) {
  if (process.env.LOGIN_PROTECT !== 'true') return false;
  cleanup(comboMap); cleanup(ipMap);
  const comboKey = `${ip}|${(email || '').toLowerCase()}`;
  const combo = comboMap.get(comboKey);
  const ipRec = ipMap.get(ip);
  if (combo && combo.count >= MAX_COMBO) return true;
  if (ipRec && ipRec.count >= MAX_IP) return true;
  return false;
}

function registerFail(ip, email) {
  if (process.env.LOGIN_PROTECT !== 'true') return;
  const comboKey = `${ip}|${(email || '').toLowerCase()}`;
  touch(comboMap, comboKey);
  touch(ipMap, ip);
}

function registerSuccess(ip, email) {
  if (process.env.LOGIN_PROTECT !== 'true') return;
  const comboKey = `${ip}|${(email || '').toLowerCase()}`;
  comboMap.delete(comboKey);
  // No borramos IP para que patrones distribuidos sigan contándose.
}

function blockResponse(res) {
  return res.status(BLOCK_STATUS).json({ message: BLOCK_MESSAGE });
}

module.exports = {
  isBlocked,
  registerFail,
  registerSuccess,
  blockResponse
};
