// ===============================================================
// RUTAS DE NOTICIAS (reconstruido limpio)
// ===============================================================
const express = require('express');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { uploadImage } = require('../config/multer');
const sanitizeHtml = require('sanitize-html');
const { pool } = require('../config/database');
const R = require('../utils/response');

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------
function extractContentImageUrls(html = '') {
  if(!html) return [];
  const set = new Set();
  // <img>
  const tagRe = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi; let m;
  while((m = tagRe.exec(html)) !== null){
    let src = m[1];
    if(!src) continue;
    try { if(/^https?:\/\//i.test(src)){ const u=new URL(src); src=u.pathname+(u.search||''); } } catch(_){ }
    if(src.includes('/uploads/noticias/imagenes/')) set.add(src.split('?')[0]);
  }
  // Markdown ![]()
  const mdRe = /!\[[^\]]*\]\(([^)]+)\)/g;
  while((m = mdRe.exec(html)) !== null){
    let src = m[1].split(' ')[0].replace(/["')]/g,'')
    try { if(/^https?:\/\//i.test(src)){ const u=new URL(src); src=u.pathname; } } catch(_){ }
    if(src.includes('/uploads/noticias/imagenes/')) set.add(src.split('?')[0]);
  }
  return Array.from(set);
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

function buildSlug(raw){
  return (raw||'')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'')
    .replace(/--+/g,'-');
}

async function ensureUniqueSlug(initial){
  let slug = buildSlug(initial);
  if(!slug) slug = 'noticia';
  const existing = await db.query('SELECT slug FROM noticias WHERE slug = ? OR slug LIKE ?',[slug, slug+'-%']);
  if(!existing.length) return slug;
  const base = slug;
  let max = 0;
  for(const row of existing){
    const m = row.slug.match(new RegExp('^'+base.replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&')+'-(\\d+)$'));
    if(m){ const n = parseInt(m[1]); if(n>max) max = n; }
    if(row.slug === base && max < 1) max = 1;
  }
  return base+'-'+(max+1);
}

// ---------------------------------------------------------------
// Rutas públicas
// ---------------------------------------------------------------
router.get('/', async (req,res)=>{
  try {
    const { categoria, destacada, limite=10, pagina=1 } = req.query;
    let sql = `SELECT ${BASE_FIELDS}, u.nombre as autor FROM noticias n LEFT JOIN usuarios u ON n.autor_id=u.id WHERE n.estado='publicado'`;
    const params = [];
    if(categoria){ sql+=' AND n.categoria=?'; params.push(categoria); }
    if(destacada){ sql+=' AND n.destacado=?'; params.push(destacada==='true'); }
    sql+=' ORDER BY n.fecha_publicacion DESC';
    if(limite){ const l = parseInt(limite); const p=parseInt(pagina); sql+=' LIMIT ? OFFSET ?'; params.push(l,(p-1)*l); }
    const rows = await db.query(sql, params);
    R.ok(res, rows);
  } catch(e){ console.error(e); R.fail(res,'Error al obtener noticias',500,{error:e.message}); }
});

router.get('/public/:id', async (req,res)=>{
  try {
    const { id }=req.params;
    const rows=await db.query(`SELECT ${BASE_FIELDS}, u.nombre as autor FROM noticias n LEFT JOIN usuarios u ON n.autor_id=u.id WHERE n.id=? AND n.estado='publicado'`,[id]);
    if(!rows.length) return R.fail(res,'Noticia no encontrada',404);
    const imagenes=await db.query('SELECT id, filename, url, orden FROM noticias_imagenes WHERE noticia_id=? ORDER BY orden, id',[id]);
    R.ok(res,{...rows[0], imagenes});
  } catch(e){ console.error(e); R.fail(res,'Error al obtener noticia',500,{error:e.message}); }
});

router.get('/slug/:slug', async (req,res)=>{
  try {
    const { slug }=req.params;
    const rows=await db.query(`SELECT ${BASE_FIELDS}, u.nombre as autor FROM noticias n LEFT JOIN usuarios u ON n.autor_id=u.id WHERE n.slug=? AND n.estado='publicado'`,[slug]);
    if(!rows.length) return R.fail(res,'Noticia no encontrada',404);
    const imagenes=await db.query('SELECT id, filename, url, orden FROM noticias_imagenes WHERE noticia_id=? ORDER BY orden, id',[rows[0].id]);
    R.ok(res,{...rows[0], imagenes});
  } catch(e){ console.error(e); R.fail(res,'Error al obtener noticia',500,{error:e.message}); }
});

router.get('/categories', async (_req,res)=>{
  try {
    const cats=await db.query('SELECT DISTINCT categoria FROM noticias WHERE categoria IS NOT NULL AND categoria<>"" ORDER BY categoria');
    R.ok(res, cats.map(c=>c.categoria));
  } catch(e){ R.fail(res,'Error al obtener categorías',500,{error:e.message}); }
});

// detalle autenticado (permite ver borradores si autor o rol)
router.get('/detalle/:id', authenticateToken, async (req,res)=>{
  try {
    const { id }=req.params;
    const rows=await db.query(`SELECT ${BASE_FIELDS}, u.nombre as autor FROM noticias n LEFT JOIN usuarios u ON n.autor_id=u.id WHERE n.id=?`,[id]);
    if(!rows.length) return R.fail(res,'Noticia no encontrada',404);
    const n = rows[0];
    // Si no está publicada, validar permisos (autor o roles privilegiados)
    if(n.estado!=='publicado' && !['admin','propietario'].includes(req.user.rol) && n.autor_id!==req.user.id){
      return R.fail(res,'Sin permisos para ver esta noticia',403);
    }
    const imagenes=await db.query('SELECT id, filename, url, orden FROM noticias_imagenes WHERE noticia_id=? ORDER BY orden, id',[id]);
    R.ok(res,{...n, imagenes});
  } catch(e){ console.error(e); R.fail(res,'Error al obtener noticia',500,{error:e.message}); }
});

// ---------------------------------------------------------------
// Noticias destacadas (debe ir antes de '/:id' para no colisionar)
// ---------------------------------------------------------------
router.get('/featured', async (_req,res)=>{
  try {
    const rows = await db.query(`SELECT ${BASE_FIELDS}, u.nombre as autor FROM noticias n LEFT JOIN usuarios u ON n.autor_id=u.id WHERE n.estado='publicado' AND n.destacado=1 ORDER BY n.fecha_publicacion DESC`);
    R.ok(res, rows);
  } catch(e){ console.error(e); R.fail(res,'Error al obtener noticias destacadas',500,{error:e.message}); }
});

router.get('/:id', async (req,res)=>{
  try {
    const { id }=req.params;
    const rows=await db.query(`SELECT ${BASE_FIELDS}, u.nombre as autor FROM noticias n LEFT JOIN usuarios u ON n.autor_id=u.id WHERE n.id=? AND n.estado='publicado'`,[id]);
    if(!rows.length) return R.fail(res,'Noticia no encontrada',404);
    const imagenes=await db.query('SELECT id, filename, url, orden FROM noticias_imagenes WHERE noticia_id=? ORDER BY orden, id',[id]);
    R.ok(res,{...rows[0], imagenes});
  } catch(e){ console.error(e); R.fail(res,'Error al obtener noticia',500,{error:e.message}); }
});

// ---------------------------------------------------------------
// CRUD protegido
// ---------------------------------------------------------------
router.post('/', authenticateToken, async (req,res)=>{
  const connection = await pool.getConnection();
  try {
    let { titulo, slug, resumen, contenido, categoria, estado, destacado, autor_id, fecha_publicacion, imagen_url } = req.body;
    if(!titulo || !contenido) { connection.release(); return R.fail(res,'Título y contenido son obligatorios',400); }
    if(!['admin','propietario'].includes(req.user.rol)) { connection.release(); return R.fail(res,'No tienes permisos para crear noticias',403); }
    if(!slug) slug = buildSlug(titulo);
    slug = await ensureUniqueSlug(slug);
    // Sanitizar contenido
    const clean = sanitizeHtml(contenido, {
      allowedTags: ['p','h1','h2','h3','h4','h5','h6','strong','em','ul','ol','li','a','img','figure','figcaption','blockquote','code','pre','br','span'],
      allowedAttributes: {
        a: ['href','title','target','rel'],
        img: ['src','alt','width','height']
      },
      allowedSchemes: ['http','https','mailto'],
      transformTags: {
        a: (tag, attribs) => {
          if(attribs.href && !/^https?:\/\//i.test(attribs.href) && !/^mailto:/i.test(attribs.href)) delete attribs.href;
          attribs.rel = 'nofollow noopener noreferrer';
          return { tagName: 'a', attribs };
        },
        img: (tag, attribs) => {
          if(!attribs.src || !(attribs.src.startsWith('/uploads/noticias/imagenes/') || /^https:\/\//i.test(attribs.src))){ return { tagName: 'span', attribs: {} }; }
          return { tagName: 'img', attribs };
        }
      }
    });
    await connection.beginTransaction();
    let r;
    try {
      [r] = await connection.execute('INSERT INTO noticias (titulo, slug, resumen, contenido, imagen, categoria, estado, destacado, autor_id, fecha_publicacion) VALUES (?,?,?,?,?,?,?,?,?,?)',[
        titulo, slug, resumen||null, clean, imagen_url||null, categoria||null, estado||'borrador', destacado||false, autor_id||req.user.id, fecha_publicacion||null
      ]);
    } catch(dbErr){
      if(dbErr.code==='ER_DUP_ENTRY'){
        slug = await ensureUniqueSlug(slug);
        [r] = await connection.execute('INSERT INTO noticias (titulo, slug, resumen, contenido, imagen, categoria, estado, destacado, autor_id, fecha_publicacion) VALUES (?,?,?,?,?,?,?,?,?,?)',[
          titulo, slug, resumen||null, clean, imagen_url||null, categoria||null, estado||'borrador', destacado||false, autor_id||req.user.id, fecha_publicacion||null
        ]);
      } else throw dbErr;
    }
    const id = r.insertId;
    const urls = extractContentImageUrls(clean);
    let primera=null; let ordenBase = 0;
    if(urls.length){
      const [rowMax] = await connection.execute('SELECT IFNULL(MAX(orden),0) AS m FROM noticias_imagenes WHERE noticia_id=? FOR UPDATE',[id]);
      ordenBase = rowMax[0].m;
    }
    for(const [idx,url] of urls.entries()){
      if(!primera) primera=url;
      const filename = path.basename(url);
      try {
        await connection.execute('INSERT IGNORE INTO noticias_imagenes (noticia_id, filename, original_name, url, tamano, tipo_mime, orden) VALUES (?,?,?,?,NULL,NULL,?)',[id, filename, filename, url, ordenBase+idx+1]);
      } catch(_){ }
    }
    if(!imagen_url && primera) await connection.execute('UPDATE noticias SET imagen=? WHERE id=? AND imagen IS NULL',[primera,id]);
    await connection.commit();
    const imagenes = urls.length ? await db.query('SELECT id, filename, url, orden FROM noticias_imagenes WHERE noticia_id=? ORDER BY orden, id',[id]) : [];
    connection.release();
    R.created(res,{ id, titulo, slug, estado: estado||'borrador', imagen_url: imagen_url||primera||null, imagenes, original_slug: req.body.slug });
  } catch(e){ try { await connection.rollback(); } catch(_){} connection.release(); console.error(e); R.fail(res,'Error al crear la noticia',500,{error:e.message}); }
});

router.put('/:id', authenticateToken, async (req,res)=>{
  const connection = await pool.getConnection();
  try {
    const { id }=req.params;
    const { titulo, slug, resumen, contenido, categoria, estado, destacado, fecha_publicacion, imagen_url } = req.body;
    if(!titulo || !contenido){ connection.release(); return R.fail(res,'Título y contenido obligatorios',400); }
    const ex = await db.query('SELECT autor_id FROM noticias WHERE id=?',[id]);
    if(!ex.length){ connection.release(); return R.fail(res,'Noticia no encontrada',404); }
    if(!['admin','propietario'].includes(req.user.rol) && ex[0].autor_id!==req.user.id){ connection.release(); return R.fail(res,'Sin permisos',403); }
    const clean = sanitizeHtml(contenido, {
      allowedTags: ['p','h1','h2','h3','h4','h5','h6','strong','em','ul','ol','li','a','img','figure','figcaption','blockquote','code','pre','br','span'],
      allowedAttributes: { a:['href','title','target','rel'], img:['src','alt','width','height'] },
      allowedSchemes: ['http','https','mailto'],
      transformTags: {
        a: (tag, attribs)=>{ if(attribs.href && !/^https?:\/\//i.test(attribs.href) && !/^mailto:/i.test(attribs.href)) delete attribs.href; attribs.rel='nofollow noopener noreferrer'; return { tagName:'a', attribs }; },
        img:(tag, attribs)=>{ if(!attribs.src || !(attribs.src.startsWith('/uploads/noticias/imagenes/') || /^https:\/\//i.test(attribs.src))) return { tagName:'span', attribs:{} }; return { tagName:'img', attribs }; }
      }
    });
    await connection.beginTransaction();
    await connection.execute('UPDATE noticias SET titulo=?, slug=?, resumen=?, contenido=?, categoria=?, estado=?, destacado=?, fecha_publicacion=?, imagen=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',[
      titulo, slug, resumen||null, clean, categoria||null, estado||'borrador', destacado||false, fecha_publicacion||null, imagen_url||null, id
    ]);
    const urls = extractContentImageUrls(clean);
    if(urls.length){
      const [rowMax] = await connection.execute('SELECT IFNULL(MAX(orden),0) AS m FROM noticias_imagenes WHERE noticia_id=? FOR UPDATE',[id]);
      const base = rowMax[0].m;
      let primera=null;
      for(const [idx,url] of urls.entries()){
        if(!primera) primera=url;
        const filename=path.basename(url);
        try { await connection.execute('INSERT IGNORE INTO noticias_imagenes (noticia_id, filename, original_name, url, tamano, tipo_mime, orden) VALUES (?,?,?,?,NULL,NULL,?)',[id, filename, filename, url, base+idx+1]); } catch(_){ }
      }
      if(!imagen_url && primera) await connection.execute('UPDATE noticias SET imagen=? WHERE id=? AND imagen IS NULL',[primera,id]);
    }
    await connection.commit();
    connection.release();
    const imagenes = await db.query('SELECT id, filename, url, orden FROM noticias_imagenes WHERE noticia_id=? ORDER BY orden, id',[id]);
    R.ok(res,{ updated:true, imagenes });
  } catch(e){ try { await connection.rollback(); } catch(_){} connection.release(); console.error(e); R.fail(res,'Error al actualizar',500,{error:e.message}); }
});

router.delete('/:id', authenticateToken, async (req,res)=>{
  try {
    const { id }=req.params;
    const ex = await db.query('SELECT autor_id FROM noticias WHERE id=?',[id]);
    if(!ex.length) return R.fail(res,'Noticia no encontrada',404);
    if(!['admin','propietario'].includes(req.user.rol) && ex[0].autor_id!==req.user.id) return R.fail(res,'Sin permisos',403);
    await db.query('DELETE FROM noticias WHERE id=?',[id]);
    await db.query('DELETE FROM noticias_imagenes WHERE noticia_id=?',[id]);
    R.ok(res,{ deleted:true });
  } catch(e){ console.error(e); R.fail(res,'Error al eliminar',500,{error:e.message}); }
});

// ---------------------------------------------------------------
// Imágenes
// ---------------------------------------------------------------
router.get('/:id/imagenes', async (req,res)=>{
  try {
    const { id }=req.params;
    const imagenes=await db.query('SELECT id, filename, url, orden FROM noticias_imagenes WHERE noticia_id=? ORDER BY orden, id',[id]);
    R.ok(res, imagenes);
  } catch(e){ console.error(e); R.fail(res,'Error al obtener imágenes',500,{error:e.message}); }
});

// Subida de imágenes (galería / destacada / embebidas unificadas)
router.post('/:id/imagenes', authenticateToken, (req,res,next)=>{
  uploadImage.array('imagenes',12)(req,res,(err)=>{
    if(err){
      if(err.message?.includes('Formato inválido')) return R.fail(res, err.message,400);
      if(err.code==='LIMIT_FILE_SIZE') return R.fail(res,'Una de las imágenes excede 5MB',400);
      return R.fail(res,'Error al procesar imágenes',400,{ error: err.message });
    }
    next();
  });
}, async (req,res)=>{
  const connection = await pool.getConnection();
  try {
    const { id }=req.params;
    const ex = await db.query('SELECT autor_id, imagen FROM noticias WHERE id=?',[id]);
    if(!ex.length){ connection.release(); return R.fail(res,'Noticia no encontrada',404); }
    if(!['admin','propietario'].includes(req.user.rol) && ex[0].autor_id!==req.user.id){ connection.release(); return R.fail(res,'Sin permisos para subir imágenes',403); }
    const files = req.files || [];
    if(!files.length){ connection.release(); return R.fail(res,'No se enviaron imágenes',400); }
  if(files.length>9){ connection.release(); return R.fail(res,'Máximo 9 imágenes por lote',400); }

    // Límite acumulado (máximo 12 totales)
    const actuales = await db.query('SELECT COUNT(*) AS c FROM noticias_imagenes WHERE noticia_id=?',[id]);
    const totalPost = actuales[0].c + files.length;
    if(totalPost>9){
      for(const f of files){ try { fs.unlinkSync(path.join(__dirname,'../../uploads/noticias/imagenes',f.filename)); } catch(_){} }
      connection.release();
      return R.fail(res,`Se excede el máximo de 9 imágenes (actuales: ${actuales[0].c}, nuevas: ${files.length})`,400);
    }

    // Validar dimensiones mínimas (configurables vía env MIN_IMAGE_WIDTH / MIN_IMAGE_HEIGHT)
  const MIN_W=parseInt(process.env.MIN_IMAGE_WIDTH||'400',10);
  const MIN_H=parseInt(process.env.MIN_IMAGE_HEIGHT||'300',10);
  const skipDim = process.env.VALIDATE_IMAGE_DIMENSIONS==='false';
  const autoResize = process.env.AUTO_RESIZE_SMALL_IMAGES==='true';
  const resizedFiles = [];
    for(const f of files){
      if(skipDim) break; // Validación deshabilitada
      try {
        let meta = await sharp(f.path).metadata();
        if((meta.width||0) < MIN_W || (meta.height||0) < MIN_H){
          if(autoResize){
            // Redimensionar manteniendo aspecto, rellenar si necesario (cover)
            const buf = await sharp(f.path).resize(MIN_W, MIN_H, { fit: 'cover' }).toBuffer();
            fs.writeFileSync(f.path, buf);
            meta = await sharp(f.path).metadata();
            resizedFiles.push({ file: f.originalname, width: meta.width, height: meta.height });
          } else {
            for(const fx of files){ try { fs.unlinkSync(path.join(__dirname,'../../uploads/noticias/imagenes',fx.filename)); } catch(_){} }
            connection.release();
            return R.fail(res,`La imagen ${f.originalname} no cumple dimensiones mínimas ${MIN_W}x${MIN_H}px`,400);
          }
        }
      } catch(err){
        for(const fx of files){ try { fs.unlinkSync(path.join(__dirname,'../../uploads/noticias/imagenes',fx.filename)); } catch(_){} }
        connection.release();
        return R.fail(res,`Error leyendo la imagen ${f.originalname}`,400,{error: err.message, file: f.originalname});
      }
    }
    await connection.beginTransaction();
    const [rowMax] = await connection.execute('SELECT IFNULL(MAX(orden),0) AS m FROM noticias_imagenes WHERE noticia_id=? FOR UPDATE',[id]);
    const base = rowMax[0].m;
    const inserted=[]; let primeraNueva=null;
    for(const [idx,file] of files.entries()){
      const url = `/uploads/noticias/imagenes/${file.filename}`;
      const orden = base + idx + 1;
      if(idx===0) primeraNueva=url;
      const [r] = await connection.execute('INSERT INTO noticias_imagenes (noticia_id, filename, original_name, url, tamano, tipo_mime, orden) VALUES (?,?,?,?,?,?,?)',[
        id, file.filename, file.originalname, url, file.size, file.mimetype, orden
      ]);
      inserted.push({ id: r.insertId, filename: file.filename, url, orden });
    }
    if(!ex[0].imagen && primeraNueva) await connection.execute('UPDATE noticias SET imagen=? WHERE id=?',[primeraNueva,id]);
    await connection.commit();
    connection.release();
    const imagenes = await db.query('SELECT id, filename, url, orden FROM noticias_imagenes WHERE noticia_id=? ORDER BY orden, id',[id]);
  R.created(res,{ uploaded: inserted.length, imagenes, resized: resizedFiles });
  } catch(e){
    try { await connection.rollback(); } catch(_){}
    connection.release();
    console.error('❌ Error al subir imágenes:', e);
    const detail = e && (e.sqlMessage || e.message || '');
    const msg = 'Error al subir imágenes' + (detail ? ': '+detail : '');
    R.fail(res,msg,500,{ error: detail });
  }
});

router.delete('/:id/imagenes/:imgId', authenticateToken, async (req,res)=>{
  try {
    const { id, imgId }=req.params;
    const ex=await db.query('SELECT autor_id, imagen FROM noticias WHERE id=?',[id]);
    if(!ex.length) return R.fail(res,'Noticia no encontrada',404);
    if(!['admin','propietario'].includes(req.user.rol) && ex[0].autor_id!==req.user.id) return R.fail(res,'Sin permisos',403);
    const row=await db.query('SELECT filename, url FROM noticias_imagenes WHERE id=? AND noticia_id=?',[imgId,id]);
    if(!row.length) return R.fail(res,'Imagen no encontrada',404);
    await db.query('DELETE FROM noticias_imagenes WHERE id=?',[imgId]);
    fs.unlink(path.join(__dirname,'../../uploads/noticias/imagenes',row[0].filename),()=>{});
    // Si la imagen borrada era la destacada, elegir la siguiente por orden
    if(ex[0].imagen === row[0].url){
      const siguiente = await db.query('SELECT url FROM noticias_imagenes WHERE noticia_id=? ORDER BY orden, id LIMIT 1',[id]);
      await db.query('UPDATE noticias SET imagen=? WHERE id=?',[siguiente.length? siguiente[0].url : null, id]);
      return R.ok(res,{ deleted:true, nueva_destacada: siguiente.length? siguiente[0].url : null });
    }
    R.ok(res,{ deleted:true });
  } catch(e){ console.error(e); R.fail(res,'Error al eliminar imagen',500,{error:e.message}); }
});

router.put('/:id/imagenes/orden', authenticateToken, async (req,res)=>{
  try {
    const { id }=req.params;
    const { orden = [] } = req.body;
    const ex=await db.query('SELECT autor_id FROM noticias WHERE id=?',[id]);
    if(!ex.length) return R.fail(res,'Noticia no encontrada',404);
    if(!['admin','propietario'].includes(req.user.rol) && ex[0].autor_id!==req.user.id) return R.fail(res,'Sin permisos',403);
    if(!Array.isArray(orden)) return R.fail(res,'Formato de orden inválido',400);
    for(const item of orden){
      await db.query('UPDATE noticias_imagenes SET orden=? WHERE id=? AND noticia_id=?',[item.orden,item.id,id]);
    }
    const imagenes=await db.query('SELECT id, filename, url, orden FROM noticias_imagenes WHERE noticia_id=? ORDER BY orden, id',[id]);
    R.ok(res, imagenes);
  } catch(e){ console.error(e); R.fail(res,'Error al reordenar imágenes',500,{error:e.message}); }
});

router.put('/:id/imagen-destacada/:imgId', authenticateToken, async (req,res)=>{
  try {
    const { id, imgId }=req.params;
    const ex=await db.query('SELECT autor_id FROM noticias WHERE id=?',[id]);
    if(!ex.length) return R.fail(res,'Noticia no encontrada',404);
    if(!['admin','propietario'].includes(req.user.rol) && ex[0].autor_id!==req.user.id) return R.fail(res,'Sin permisos',403);
    const row=await db.query('SELECT url FROM noticias_imagenes WHERE id=? AND noticia_id=?',[imgId,id]);
    if(!row.length) return R.fail(res,'Imagen no encontrada',404);
    await db.query('UPDATE noticias SET imagen=? WHERE id=?',[row[0].url,id]);
    R.ok(res,{ updated:true, imagen_url: row[0].url });
  } catch(e){ console.error(e); R.fail(res,'Error al asignar imagen destacada',500,{error:e.message}); }
});

router.get('/:id/imagenes-sync-preview', authenticateToken, async (req,res)=>{
  try {
    const { id }=req.params;
    const row=await db.query('SELECT contenido FROM noticias WHERE id=?',[id]);
    if(!row.length) return R.fail(res,'Noticia no encontrada',404);
    R.ok(res,{ extraidas: extractContentImageUrls(row[0].contenido) });
  } catch(e){ R.fail(res,'Error preview',500,{error:e.message}); }
});

router.post('/:id/sincronizar-imagenes', authenticateToken, async (req,res)=>{
  try {
    const { id }=req.params;
    const row=await db.query('SELECT contenido FROM noticias WHERE id=?',[id]);
    if(!row.length) return R.fail(res,'Noticia no encontrada',404);
    const urls = extractContentImageUrls(row[0].contenido||'');
    let nuevas = 0;
    for(const url of urls){
      const filename = path.basename(url);
      try {
        const r = await db.query('INSERT IGNORE INTO noticias_imagenes (noticia_id, filename, original_name, url, tamano, tipo_mime, orden) VALUES (?,?,?,?,NULL,NULL,(SELECT IFNULL(MAX(orden),0)+1 FROM noticias_imagenes WHERE noticia_id=?))',[id, filename, filename, url, id]);
        if(r.affectedRows) nuevas++;
      } catch(_){ }
    }
    await db.query('UPDATE noticias n SET imagen=(SELECT url FROM noticias_imagenes ni WHERE ni.noticia_id=n.id ORDER BY ni.orden, ni.id LIMIT 1) WHERE n.id=? AND n.imagen IS NULL',[id]);
    const imagenes=await db.query('SELECT id, filename, url, orden FROM noticias_imagenes WHERE noticia_id=? ORDER BY orden, id',[id]);
    R.ok(res,{ total_detectadas: urls.length, nuevas, imagenes });
  } catch(e){ console.error(e); R.fail(res,'Error al sincronizar imágenes',500,{error:e.message}); }
});

// ---------------------------------------------------------------
// Export
// ---------------------------------------------------------------
module.exports = router;
