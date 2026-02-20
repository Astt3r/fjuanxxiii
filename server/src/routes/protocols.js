const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../config/database');

// 📌 helpers
const UPLOADS_ROOT = path.join(__dirname, '..', '..', 'uploads'); // ajusta si tu estructura cambia

function normalizePublicUrl(row) {
  // si ya es absoluta (http/https), úsala tal cual
  if (/^https?:\/\//i.test(row.archivo_url)) return row.archivo_url;

  // si viene como '/uploads/protocols/2025/08/file.pdf' la dejamos colgando de /uploads
  const rel = String(row.archivo_url || '').replace(/^\/+/, ''); // quita leading slash
  return `/${rel.startsWith('uploads/') ? rel : `uploads/${rel}`}`;
}

function localAbsolutePath(row) {
  // admite rutas tipo:
  // - 'uploads/protocols/2025/08/file.pdf'
  // - '/uploads/protocols/file.pdf'
  // - 'protocols/file.pdf' (legacy)  -> se cuelga bajo uploads/
  let rel = String(row.archivo_url || '').replace(/^\/+/, '');
  if (!rel) return null;
  if (!rel.startsWith('uploads/')) rel = `uploads/${rel}`;
  return path.join(UPLOADS_ROOT, rel.replace(/^uploads[\\/]/, '')); // recorta el prefijo duplicado al unir
}

// 👉 RUTA ESPECÍFICA PRIMERO (evita conflicto con /:id)
router.get('/categorias/list', async (req, res) => {
  try {
    const categorias = await db.query(`
      SELECT DISTINCT categoria 
      FROM protocolos 
      WHERE categoria IS NOT NULL AND categoria != '' AND estado = 'activo'
      ORDER BY categoria
    `);
    res.json({ success: true, data: categorias.map(c => c.categoria) });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// GET /api/protocols?categoria=&search=&page=1&limit=12
router.get('/', async (req, res) => {
  try {
    const { categoria, estado = 'activo' } = req.query;
    const search = (req.query.search || '').trim();
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '12', 10), 1), 50);
    const offset = (page - 1) * limit;

    const where = ['p.estado = ?'];
    const params = [estado];
    if (categoria) { where.push('p.categoria = ?'); params.push(categoria); }
    if (search) {
      where.push('(p.titulo LIKE ? OR p.descripcion LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const sql = `
      SELECT p.*, u.nombre AS subido_por_nombre
      FROM protocolos p
      LEFT JOIN usuarios u ON p.subido_por = u.id
      ${whereSql}
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}`;
    const data = await db.query(sql, params);

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM protocolos p ${whereSql}`,
      params
    );

    const result = data.map(r => ({
      ...r,
      archivo_public_url: normalizePublicUrl(r),
    }));

    res.json({ success: true, page, limit, total, data: result });
  } catch (error) {
    console.error('Error al obtener protocolos:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// GET /api/protocols/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [protocolo] = await db.query(
      `SELECT p.*, u.nombre AS subido_por_nombre
       FROM protocolos p
       LEFT JOIN usuarios u ON p.subido_por = u.id
       WHERE p.id = ? AND p.estado = 'activo'
       LIMIT 1`,
      [id]
    );

    if (!protocolo) {
      return res.status(404).json({ success: false, message: 'Protocolo no encontrado' });
    }

    res.json({
      success: true,
      data: { ...protocolo, archivo_public_url: normalizePublicUrl(protocolo) }
    });
  } catch (error) {
    console.error('Error al obtener protocolo:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// GET /api/protocols/:id/download  (cuenta y sirve)
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const [protocolo] = await db.query(
      'SELECT * FROM protocolos WHERE id = ? AND estado = "activo" LIMIT 1',
      [id]
    );

    if (!protocolo) {
      return res.status(404).json({ success: false, message: 'Protocolo no encontrado' });
    }

    // Si la URL es externa, redirige y listo (contando descarga)
    if (/^https?:\/\//i.test(protocolo.archivo_url)) {
      await db.query(
        'UPDATE protocolos SET descargas = COALESCE(descargas,0) + 1 WHERE id = ?',
        [id]
      );
      return res.redirect(protocolo.archivo_url);
    }

    const abs = localAbsolutePath(protocolo);
    if (!abs || !fs.existsSync(abs)) {
      return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
    }

    // contador (a prueba de NULL)
    await db.query(
      'UPDATE protocolos SET descargas = COALESCE(descargas,0) + 1 WHERE id = ?',
      [id]
    );

    // sirve inline para ver en navegador; usa 'attachment' si quieres forzar descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(protocolo.archivo_nombre || 'protocolo.pdf')}"`
    );
    fs.createReadStream(abs).pipe(res);
  } catch (error) {
    console.error('Error al descargar protocolo:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

module.exports = router;
