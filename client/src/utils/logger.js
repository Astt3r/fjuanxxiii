// client/src/utils/logger.js
const order = { silent:0, error:1, warn:2, info:3, debug:4, trace:5 };
let level = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';

// Permite forzar nivel en el navegador: localStorage.LOG_LEVEL = 'debug'
try {
  const forced = typeof localStorage !== 'undefined' && localStorage.getItem('LOG_LEVEL');
  if (forced && order[forced] != null) level = forced;
} catch {}

const redact = (v) => {
  try {
    return JSON.parse(JSON.stringify(v, (_, val) => {
      if (typeof val === 'string') {
        if (/\bBearer\s+[A-Za-z0-9-_.]+/.test(val)) return '***TOKEN***';
        if (/^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(val)) return '***@***';
        if (val.length > 256) return val.slice(0,256) + '…';
      }
      if (val && typeof val === 'object' && ('password' in val || 'token' in val)) {
        const copy = { ...val };
        if (copy.password) copy.password = '***';
        if (copy.token) copy.token = '***';
        return copy;
      }
      return val;
    }));
  } catch { return v }
};

const ok = (lvl) => order[level] >= order[lvl];

const log = {
  debug: (...a) => ok('debug') && console.debug('[debug]', ...a.map(redact)),
  info:  (...a) => ok('info')  && console.info('[info]',  ...a.map(redact)),
  warn:  (...a) => ok('warn')  && console.warn('[warn]',  ...a.map(redact)),
  error: (...a) => ok('error') && console.error('[error]', ...a), // no redacciones agresivas en errores
  setLevel: (lvl) => { if (order[lvl] != null) { level = lvl; try { localStorage.setItem('LOG_LEVEL', lvl) } catch {} } }
};

export default log;
