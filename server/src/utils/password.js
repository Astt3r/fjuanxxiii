// src/utils/password.js
let lib;
try { lib = require('bcrypt'); }
catch { lib = require('bcryptjs'); }

const hash = (pwd, rounds=12) =>
  lib.hash ? lib.hash(pwd, rounds) : Promise.resolve(lib.hashSync(pwd, rounds));

const compare = (pwd, hashed) =>
  lib.compare ? lib.compare(pwd, hashed) : Promise.resolve(lib.compareSync(pwd, hashed));

module.exports = { hash, compare };
