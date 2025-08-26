require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mysql = require('mysql2/promise');

(async  function main() {
  const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) {
    console.error('❌ Faltan variables en .env:', missing.join(', '));
    process.exit(1);
  }

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'fjuanxxusuarillo',
    database: process.env.DB_NAME || 'fjuan_xxiii',
    multipleStatements: true,
    charset: 'utf8mb4_general_ci'
  });

  await conn.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      checksum CHAR(64) NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const dir = __dirname;
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.sql'))
    // fuerza convención YYYYMMDD_HHMM_nombre.sql
    .sort((a, b) => a.localeCompare(b));

  if (files.length === 0) {
    console.log('ℹ️ No hay archivos .sql para aplicar.');
    await conn.end();
    return;
  }

  const [appliedRows] = await conn.query('SELECT filename, checksum FROM _migrations');
  const applied = new Map(appliedRows.map(r => [r.filename, r.checksum]));

  for (const f of files) {
    const filePath = path.join(dir, f);
    const sql = fs.readFileSync(filePath, 'utf8').trim();
    if (!sql) continue;

    const hash = sha256(sql);
    const prev = applied.get(f);

    if (prev && prev === hash) {
      console.log(`✓ ${f} (ya aplicada)`);
      continue;
    }
    if (prev && prev !== hash) {
      console.error(`❌ Hash cambiado para ${f}. No se aplica para evitar drift.
- Guardado: ${prev}
- Actual:   ${hash}
Sug.: crear una NUEVA migración en lugar de editar la existente.`);
      await conn.end();
      process.exit(1);
    }

    console.log(`> aplicando ${f} ...`);
    try {
      await conn.query('START TRANSACTION');
      // ⚠️ Esto NO soporta DELIMITER para triggers/routines.
      // Solo DDL/DML simple separado por ';'
      await conn.query(sql);
      await conn.query('INSERT INTO _migrations (filename, checksum) VALUES (?, ?)', [f, hash]);
      await conn.query('COMMIT');
      console.log(`✅ ${f}`);
    } catch (err) {
      await conn.query('ROLLBACK');
      console.error(`💥 Error en ${f}:`, err.message);
      await conn.end();
      process.exit(1);
    }
  }

  await conn.end();
  console.log('🎉 Migraciones aplicadas sin errores.');
})();

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}


main().catch(err => {
  console.error('💥 Error fatal:', err);
  process.exit(1);
});