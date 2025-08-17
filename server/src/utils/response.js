// Unified response helpers
// Usage: const R = require('../utils/response');

const build = (success, payload) => ({ success, ...payload });

exports.ok = (res, data, meta) => res.json(build(true, { data, ...(meta ? { meta } : {}) }));
exports.created = (res, data) => res.status(201).json(build(true, { data }));
exports.fail = (res, message, status = 400, extra) => res.status(status).json(build(false, { message, ...(extra || {}) }));

// For manual composition (non-Express contexts)
exports.format = {
  ok: (data, meta) => build(true, { data, ...(meta ? { meta } : {}) }),
  fail: (message, extra) => build(false, { message, ...(extra || {}) })
};
