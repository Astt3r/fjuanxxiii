// ===============================================================
// RUTAS DE NOTICIAS - Implementación limpia
// ===============================================================
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');
const { uploadImage } = require('../config/multer');
const R = require('../utils/response');

function extractContentImageUrls(html = '') {
  if (!html) return [];
  const imgs = new Set();
  // IMG tags
  const tagRe = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = tagRe.exec(html)) !== null) {
    let src = m[1];
    if (!src) continue;
    try { // normalizar absolutas
      if (/^https?:\/\//i.test(src)) {
        const u = new URL(src);
        src = u.pathname + (u.search || '');
      }
    } catch(_) {}
    if (src.includes('/uploads/noticias/imagenes/')) imgs.add(src.split('?')[0]);
  }
  // Markdown imágenes ![alt](url)
  const mdRe = /!\[[^\]]*\]\(([^)]+)\)/g;
  while ((m = mdRe.exec(html)) !== null) {
    let src = m[1].split(' ')[0].replace(/["')]/g,'');
    if (/^https?:\/\//i.test(src)) {
      try { const u = new URL(src); src = u.pathname; } catch(_) {}
    }
    if (src.includes('/uploads/noticias/imagenes/')) imgs.add(src.split('?')[0]);
  }
  return Array.from(imgs);
}

const BASE_FIELDS = `
  n.id, n.titulo, n.slug, n.resumen, n.contenido,
  COALESCE(
    n.imagen,
    (SELECT url FROM noticias_imagenes ni WHERE ni.noticia_id = n.id ORDER BY ni.orden, ni.id LIMIT 1)
  ) AS imagen_url,
  n.categoria, n.estado, n.destacado, n.autor_id,
  n.fecha_publicacion, n.created_at, n.updated_at
`;

// ------------------- Públicas -------------------
router.get('/', async (req, res) => {
  try {
    const { categoria, destacada, limite = 10, pagina = 1 } = req.query;
    let sql = `SELECT ${BASE_FIELDS}, u.nombre as autor FROM noticias n LEFT JOIN usuarios u ON n.autor_id=u.id WHERE n.estado='publicado'`;
    const params = [];
    if (categoria) { sql += ' AND n.categoria=?'; params.push(categoria); }
    if (destacada) { sql += ' AND n.destacado=?'; params.push(destacada === 'true'); }
    sql += ' ORDER BY n.fecha_publicacion DESC';
    if (limite) { const l = parseInt(limite); const p = parseInt(pagina); const off = (p-1)*l; sql += ' LIMIT ? OFFSET ?'; params.push(l, off); }
    const rows = await db.query(sql, params); R.ok(res, rows);
  } catch(e){ console.error(e); R.fail(res,'Error al obtener noticias',500,{error:e.message}); }
});

router.get('/public/:id', async (req,res)=>{ try { const { id } = req.params; const rows = await db.query(`SELECT ${BASE_FIELDS}, u.nombre as autor FROM noticias n LEFT JOIN usuarios u ON n.autor_id=u.id WHERE n.id=? AND n.estado='publicado'`,[id]); if(!rows.length) return R.fail(res,'Noticia no encontrada',404); const imagenes = await db.query('SELECT id, filename, url, orden FROM noticias_imagenes WHERE noticia_id=? ORDER BY orden, id',[id]); R.ok(res,{...rows[0], imagenes}); } catch(e){ console.error(e); R.fail(res,'Error al obtener noticia',500,{error:e.message}); }});
router.get('/slug/:slug', async (req,res)=>{ try { const { slug } = req.params; const rows = await db.query(`SELECT ${BASE_FIELDS}, u.nombre as autor FROM noticias n LEFT JOIN usuarios u ON n.autor_id=u.id WHERE n.slug=? AND n.estado='publicado'`,[slug]); if(!rows.length) return R.fail(res,'Noticia no encontrada',404); const imagenes = await db.query('SELECT id, filename, url, orden FROM noticias_imagenes WHERE noticia_id=? ORDER BY orden, id',[rows[0].id]); R.ok(res,{...rows[0], imagenes}); } catch(e){ console.error(e); R.fail(res,'Error al obtener noticia',500,{error:e.message}); }});
router.get('/categories', async (_req,res)=>{ try { const cats = await db.query('SELECT DISTINCT categoria FROM noticias WHERE categoria IS NOT NULL AND categoria<>"" ORDER BY categoria'); R.ok(res,cats.map(c=>c.categoria)); } catch(e){ R.fail(res,'Error al obtener categorías',500,{error:e.message}); }});
// Detalle autenticado (incluye borradores) - debe ir antes de '/:id'
router.get('/detalle/:id', authenticateToken, async (req,res)=>{
  try {
    const { id } = req.params;
    const rows = await db.query(`SELECT ${BASE_FIELDS}, u.nombre as autor FROM noticias n LEFT JOIN usuarios u ON n.autor_id=u.id WHERE n.id=?`,[id]);
    if(!rows.length) return R.fail(res,'Noticia no encontrada',404);
    const noticia = rows[0];
    // Si no está publicada, validar permisos (autor o roles privilegiados)
    if(noticia.estado !== 'publicado' && !['admin','propietario'].includes(req.user.rol) && noticia.autor_id !== req.user.id){
      return R.fail(res,'Sin permisos para ver esta noticia',403);
    }
    const imagenes = await db.query('SELECT id, filename, url, orden FROM noticias_imagenes WHERE noticia_id=? ORDER BY orden, id',[id]);
    R.ok(res,{...noticia, imagenes});
  } catch(e){ console.error(e); R.fail(res,'Error al obtener noticia',500,{error:e.message}); }
});

router.get('/:id', async (req,res)=>{ try { const { id } = req.params; const rows = await db.query(`SELECT ${BASE_FIELDS}, u.nombre as autor FROM noticias n LEFT JOIN usuarios u ON n.autor_id=u.id WHERE n.id=? AND n.estado='publicado'`,[id]); if(!rows.length) return R.fail(res,'Noticia no encontrada',404); const imagenes = await db.query('SELECT id, filename, url, orden FROM noticias_imagenes WHERE noticia_id=? ORDER BY orden, id',[id]); R.ok(res,{...rows[0], imagenes}); } catch(e){ console.error(e); R.fail(res,'Error al obtener noticia',500,{error:e.message}); }});

// ------------------- CRUD Protegido -------------------
router.post('/', authenticateToken, async (req,res)=>{
  try {
    const { titulo, slug, resumen, contenido, categoria, estado, destacado, autor_id, fecha_publicacion, imagen_url } = req.body;
    if(!titulo||!contenido) return R.fail(res,'Título y contenido son obligatorios',400);
    if(!['admin','propietario'].includes(req.user.rol)) return R.fail(res,'No tienes permisos para crear noticias',403);
    const r = await db.query('INSERT INTO noticias (titulo, slug, resumen, contenido, imagen, categoria, estado, destacado, autor_id, fecha_publicacion) VALUES (?,?,?,?,?,?,?,?,?,?)',[titulo, slug, resumen||null, contenido, imagen_url||null, categoria||null, estado||'borrador', destacado||false, autor_id||req.user.id, fecha_publicacion||null]);
    const id = r.insertId;
    if (process.env.NODE_ENV !== 'production') {
      console.log('[noticias][create] id=%s slug=%s contenidoLen=%d', id, slug, (contenido||'').length);
    }
    const imgs = extractContentImageUrls(contenido||'');
    if (process.env.NODE_ENV !== 'production') console.log('[noticias][create] imágenes extraídas:', imgs);
    let primera=null;
    for(const url of imgs){
      if(!primera) primera=url;
      const filename=path.basename(url);
      try {
        const ins = await db.query('INSERT IGNORE INTO noticias_imagenes (noticia_id, filename, original_name, url, tamaño, tipo_mime, orden) VALUES (?,?,?,?,NULL,NULL,(SELECT IFNULL(MAX(orden),0)+1 FROM noticias_imagenes WHERE noticia_id=?))',[id, filename, filename, url, id]);
        if (process.env.NODE_ENV !== 'production') console.log('[noticias][create] guardada imagen %s (affected=%s)', filename, ins.affectedRows ?? ins.insertId ?? '0');
      } catch(e){ if(process.env.NODE_ENV!=='production') console.warn('[noticias][create] fallo insert imagen', e.message); }
    }
    if(!imagen_url && primera) await db.query('UPDATE noticias SET imagen=? WHERE id=? AND imagen IS NULL',[primera,id]);
    const imagenes = imgs.length? await db.query('SELECT id, filename, url, orden FROM noticias_imagenes WHERE noticia_id=? ORDER BY orden, id',[id]) : [];
    R.created(res,{ id, titulo, slug, estado: estado||'borrador', imagen_url: imagen_url||primera||null, imagenes, debug: process.env.NODE_ENV!=='production'? { extraidas: imgs } : undefined });
  } catch(e){ console.error(e); R.fail(res,'Error al crear la noticia',500,{error:e.message}); }
});
router.put('/:id', authenticateToken, async (req,res)=>{ try { const { id } = req.params; const { titulo, slug, resumen, contenido, categoria, estado, destacado, fecha_publicacion, imagen_url } = req.body; if(!titulo||!contenido) return R.fail(res,'Título y contenido obligatorios',400); const ex = await db.query('SELECT autor_id FROM noticias WHERE id=?',[id]); if(!ex.length) return R.fail(res,'Noticia no encontrada',404); if(!['admin','propietario'].includes(req.user.rol) && ex[0].autor_id !== req.user.id) return R.fail(res,'Sin permisos',403); await db.query('UPDATE noticias SET titulo=?, slug=?, resumen=?, contenido=?, categoria=?, estado=?, destacado=?, fecha_publicacion=?, imagen=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',[titulo, slug, resumen||null, contenido, categoria||null, estado||'borrador', destacado||false, fecha_publicacion||null, imagen_url||null, id]); const imgs = extractContentImageUrls(contenido); let primera=null; for(const url of imgs){ if(!primera) primera=url; const filename=path.basename(url); try { await db.query('INSERT IGNORE INTO noticias_imagenes (noticia_id, filename, original_name, url, tamaño, tipo_mime, orden) VALUES (?,?,?,?,NULL,NULL,(SELECT IFNULL(MAX(orden),0)+1 FROM noticias_imagenes WHERE noticia_id=?))',[id, filename, filename, url, id]); } catch(e){} } if(!imagen_url && primera) await db.query('UPDATE noticias SET imagen=? WHERE id=? AND imagen IS NULL',[primera,id]); const imagenes = await db.query('SELECT id, filename, url, orden FROM noticias_imagenes WHERE noticia_id=? ORDER BY orden, id',[id]); R.ok(res,{ updated:true, imagenes }); } catch(e){ console.error(e); R.fail(res,'Error al actualizar',500,{error:e.message}); }});
router.delete('/:id', authenticateToken, async (req,res)=>{ try { const { id } = req.params; const ex = await db.query('SELECT autor_id FROM noticias WHERE id=?',[id]); if(!ex.length) return R.fail(res,'Noticia no encontrada',404); if(!['admin','propietario'].includes(req.user.rol) && ex[0].autor_id !== req.user.id) return R.fail(res,'Sin permisos',403); await db.query('DELETE FROM noticias WHERE id=?',[id]); await db.query('DELETE FROM noticias_imagenes WHERE noticia_id=?',[id]); R.ok(res,{ deleted:true }); } catch(e){ console.error(e); R.fail(res,'Error al eliminar',500,{error:e.message}); }});

// ------------------- Imágenes -------------------
router.get('/:id/imagenes', async (req,res)=>{ try { const { id } = req.params; const imagenes = await db.query('SELECT id, filename, url, orden FROM noticias_imagenes WHERE noticia_id=? ORDER BY orden, id',[id]); R.ok(res, imagenes); } catch(e){ console.error(e); R.fail(res,'Error al obtener imágenes',500,{error:e.message}); }});
router.post('/:id/imagenes', authenticateToken, uploadImage.array('imagenes',10), async (req,res)=>{ try { const { id } = req.params; const ex = await db.query('SELECT autor_id, imagen FROM noticias WHERE id=?',[id]); if(!ex.length) return R.fail(res,'Noticia no encontrada',404); if(!['admin','propietario'].includes(req.user.rol) && ex[0].autor_id !== req.user.id) return R.fail(res,'Sin permisos para subir imágenes',403); const files = req.files||[]; if(!files.length) return R.fail(res,'No se enviaron imágenes',400); let primeraNueva=null; const inserted=[]; for(const [idx,file] of files.entries()){ const url = `/uploads/noticias/imagenes/${file.filename}`; if(idx===0) primeraNueva=url; const r = await db.query('INSERT INTO noticias_imagenes (noticia_id, filename, original_name, url, tamaño, tipo_mime, orden) VALUES (?,?,?,?,?,?,(SELECT IFNULL(MAX(orden),0)+1 FROM noticias_imagenes WHERE noticia_id=?))',[id,file.filename,file.originalname,url,file.size,file.mimetype,id]); inserted.push({ id: r.insertId, filename:file.filename, url }); } if(!ex[0].imagen && primeraNueva) await db.query('UPDATE noticias SET imagen=? WHERE id=?',[primeraNueva,id]); const imagenes = await db.query('SELECT id, filename, url, orden FROM noticias_imagenes WHERE noticia_id=? ORDER BY orden, id',[id]); R.created(res,{ uploaded: inserted.length, imagenes }); } catch(e){ console.error(e); R.fail(res,'Error al subir imágenes',500,{error:e.message}); }});
router.delete('/:id/imagenes/:imgId', authenticateToken, async (req,res)=>{ try { const { id, imgId } = req.params; const ex = await db.query('SELECT autor_id FROM noticias WHERE id=?',[id]); if(!ex.length) return R.fail(res,'Noticia no encontrada',404); if(!['admin','propietario'].includes(req.user.rol) && ex[0].autor_id !== req.user.id) return R.fail(res,'Sin permisos',403); const row = await db.query('SELECT filename FROM noticias_imagenes WHERE id=? AND noticia_id=?',[imgId,id]); if(!row.length) return R.fail(res,'Imagen no encontrada',404); await db.query('DELETE FROM noticias_imagenes WHERE id=?',[imgId]); const filePath = path.join(__dirname,'../../uploads/noticias/imagenes', row[0].filename); fs.unlink(filePath,()=>{}); R.ok(res,{ deleted:true }); } catch(e){ console.error(e); R.fail(res,'Error al eliminar imagen',500,{error:e.message}); }});
router.put('/:id/imagenes/orden', authenticateToken, async (req,res)=>{ try { const { id } = req.params; const { orden=[] } = req.body; const ex = await db.query('SELECT autor_id FROM noticias WHERE id=?',[id]); if(!ex.length) return R.fail(res,'Noticia no encontrada',404); if(!['admin','propietario'].includes(req.user.rol) && ex[0].autor_id !== req.user.id) return R.fail(res,'Sin permisos',403); if(!Array.isArray(orden)) return R.fail(res,'Formato de orden inválido',400); for(const item of orden){ await db.query('UPDATE noticias_imagenes SET orden=? WHERE id=? AND noticia_id=?',[item.orden, item.id, id]); } const imagenes = await db.query('SELECT id, filename, url, orden FROM noticias_imagenes WHERE noticia_id=? ORDER BY orden, id',[id]); R.ok(res, imagenes); } catch(e){ console.error(e); R.fail(res,'Error al reordenar imágenes',500,{error:e.message}); }});
router.put('/:id/imagen-destacada/:imgId', authenticateToken, async (req,res)=>{ try { const { id, imgId } = req.params; const ex = await db.query('SELECT autor_id FROM noticias WHERE id=?',[id]); if(!ex.length) return R.fail(res,'Noticia no encontrada',404); if(!['admin','propietario'].includes(req.user.rol) && ex[0].autor_id !== req.user.id) return R.fail(res,'Sin permisos',403); const row = await db.query('SELECT url FROM noticias_imagenes WHERE id=? AND noticia_id=?',[imgId,id]); if(!row.length) return R.fail(res,'Imagen no encontrada',404); await db.query('UPDATE noticias SET imagen=? WHERE id=?',[row[0].url,id]); R.ok(res,{ updated:true, imagen_url: row[0].url }); } catch(e){ console.error(e); R.fail(res,'Error al asignar imagen destacada',500,{error:e.message}); }});
router.get('/:id/imagenes-sync-preview', authenticateToken, async (req,res)=>{ try { const { id } = req.params; const row = await db.query('SELECT contenido FROM noticias WHERE id=?',[id]); if(!row.length) return R.fail(res,'Noticia no encontrada',404); R.ok(res,{ extraidas: extractContentImageUrls(row[0].contenido) }); } catch(e){ R.fail(res,'Error preview',500,{error:e.message}); }});
router.post('/:id/sincronizar-imagenes', authenticateToken, async (req,res)=>{ try { const { id } = req.params; const row = await db.query('SELECT contenido FROM noticias WHERE id=?',[id]); if(!row.length) return R.fail(res,'Noticia no encontrada',404); const urls = extractContentImageUrls(row[0].contenido); let nuevas=0; for(const url of urls){ const filename = path.basename(url); try { const r = await db.query('INSERT IGNORE INTO noticias_imagenes (noticia_id, filename, original_name, url, tamaño, tipo_mime, orden) VALUES (?,?,?,?,NULL,NULL,(SELECT IFNULL(MAX(orden),0)+1 FROM noticias_imagenes WHERE noticia_id=?))',[id, filename, filename, url, id]); if(r.affectedRows) nuevas++; } catch(e){} } await db.query('UPDATE noticias n SET imagen=(SELECT url FROM noticias_imagenes ni WHERE ni.noticia_id=n.id ORDER BY ni.orden, ni.id LIMIT 1) WHERE n.id=? AND n.imagen IS NULL',[id]); const imagenes = await db.query('SELECT id, filename, url, orden FROM noticias_imagenes WHERE noticia_id=? ORDER BY orden, id',[id]); R.ok(res,{ total_detectadas: urls.length, nuevas, imagenes }); } catch(e){ console.error(e); R.fail(res,'Error al sincronizar imágenes',500,{error:e.message}); }});

// Export
module.exports = router;
