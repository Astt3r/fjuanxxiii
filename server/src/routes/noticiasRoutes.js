const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Obtener todas las noticias
router.get('/', async (req, res) => {
  try {
    const { categoria, destacada, limite = 10, pagina = 1 } = req.query;
    
    let query = `
      SELECT n.*, u.nombre as autor
      FROM noticias n
      LEFT JOIN usuarios u ON n.autor_id = u.id
      WHERE n.estado = 'publicado'
    `;
    
    const params = [];
    
    if (categoria) {
      query += ' AND n.categoria = ?';
      params.push(categoria);
    }
    
    if (destacada) {
      query += ' AND n.destacado = ?';
      params.push(destacada === 'true');
    }
    
    query += ' ORDER BY n.fecha_publicacion DESC';
    
    if (limite) {
      const offset = (parseInt(pagina) - 1) * parseInt(limite);
      query += ' LIMIT ? OFFSET ?';
      params.push(parseInt(limite), offset);
    }
    
    const noticias = await db.query(query, params);
    
    res.json({
      success: true,
      data: noticias
    });
  } catch (error) {
    console.error('Error al obtener noticias:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las noticias',
      error: error.message
    });
  }
});

// Obtener noticias destacadas
router.get('/featured', async (req, res) => {
  try {
    const query = `
      SELECT n.*, u.nombre as autor
      FROM noticias n
      LEFT JOIN usuarios u ON n.autor_id = u.id
      WHERE n.publicada = true AND n.destacada = true
      ORDER BY n.fecha_publicacion DESC
      LIMIT 6
    `;
    
    const noticias = await db.query(query);
    
    res.json({
      success: true,
      data: noticias
    });
  } catch (error) {
    console.error('Error al obtener noticias destacadas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las noticias destacadas',
      error: error.message
    });
  }
});

// Obtener categorías de noticias
router.get('/categories', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT categoria
      FROM noticias
      WHERE categoria IS NOT NULL AND categoria != ''
      ORDER BY categoria
    `;
    
    const categorias = await db.query(query);
    
    res.json({
      success: true,
      data: categorias.map(row => row.categoria)
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las categorías',
      error: error.message
    });
  }
});

// Obtener noticia por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT n.*, u.nombre as autor
      FROM noticias n
      LEFT JOIN usuarios u ON n.autor_id = u.id
      WHERE n.id = ? AND n.estado = 'publicado'
    `;
    
    const noticias = await db.query(query, [id]);
    
    if (noticias.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Noticia no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: noticias[0]
    });
  } catch (error) {
    console.error('Error al obtener noticia:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la noticia',
      error: error.message
    });
  }
});

// ============== ENDPOINTS CRUD (Requieren autenticación) ==============

// Crear nueva noticia
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { titulo, slug, resumen, contenido, categoria, estado, destacado, autor_id, fecha_publicacion } = req.body;
    
    // Validaciones básicas
    if (!titulo || !contenido) {
      return res.status(400).json({
        success: false,
        message: 'Título y contenido son obligatorios'
      });
    }

    // Verificar que el usuario puede crear noticias (admin o propietario)
    if (req.user.rol !== 'admin' && req.user.rol !== 'propietario') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para crear noticias'
      });
    }

    const query = `
      INSERT INTO noticias (titulo, slug, resumen, contenido, categoria, estado, destacado, autor_id, fecha_publicacion)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await db.query(query, [
      titulo,
      slug,
      resumen || null,
      contenido,
      categoria || null,
      estado || 'borrador',
      destacado || false,
      autor_id || req.user.id,
      fecha_publicacion || null
    ]);

    res.status(201).json({
      success: true,
      message: 'Noticia creada exitosamente',
      data: {
        id: result.insertId,
        titulo,
        slug,
        estado: estado || 'borrador'
      }
    });
  } catch (error) {
    console.error('Error al crear noticia:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la noticia',
      error: error.message
    });
  }
});

// Actualizar noticia
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, slug, resumen, contenido, categoria, estado, destacado, fecha_publicacion } = req.body;

    // Verificar que la noticia existe y pertenece al usuario (o es admin)
    const checkQuery = `SELECT autor_id FROM noticias WHERE id = ?`;
    const existingNews = await db.query(checkQuery, [id]);

    if (existingNews.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Noticia no encontrada'
      });
    }

    // Verificar permisos
    if (req.user.rol !== 'admin' && req.user.rol !== 'propietario' && existingNews[0].autor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para editar esta noticia'
      });
    }

    const query = `
      UPDATE noticias 
      SET titulo = ?, slug = ?, resumen = ?, contenido = ?, categoria = ?, 
          estado = ?, destacado = ?, fecha_publicacion = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await db.query(query, [
      titulo,
      slug,
      resumen,
      contenido,
      categoria,
      estado,
      destacado || false,
      fecha_publicacion,
      id
    ]);

    res.json({
      success: true,
      message: 'Noticia actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar noticia:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la noticia',
      error: error.message
    });
  }
});

// Eliminar noticia
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la noticia existe y pertenece al usuario (o es admin)
    const checkQuery = `SELECT autor_id FROM noticias WHERE id = ?`;
    const existingNews = await db.query(checkQuery, [id]);

    if (existingNews.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Noticia no encontrada'
      });
    }

    // Verificar permisos
    if (req.user.rol !== 'admin' && req.user.rol !== 'propietario' && existingNews[0].autor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar esta noticia'
      });
    }

    const query = `DELETE FROM noticias WHERE id = ?`;
    await db.query(query, [id]);

    res.json({
      success: true,
      message: 'Noticia eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar noticia:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la noticia',
      error: error.message
    });
  }
});

// Obtener noticias del usuario autenticado (incluye borradores)
router.get('/mis-noticias/todas', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT n.*, u.nombre as autor
      FROM noticias n
      LEFT JOIN usuarios u ON n.autor_id = u.id
      WHERE n.autor_id = ? OR ? = 'admin' OR ? = 'propietario'
      ORDER BY n.updated_at DESC
    `;

    const noticias = await db.query(query, [req.user.id, req.user.rol, req.user.rol]);

    res.json({
      success: true,
      data: noticias
    });
  } catch (error) {
    console.error('Error al obtener noticias del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las noticias',
      error: error.message
    });
  }
});

// Obtener noticia por ID (incluye borradores para el autor/admin)
router.get('/detalle/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT n.*, u.nombre as autor
      FROM noticias n
      LEFT JOIN usuarios u ON n.autor_id = u.id
      WHERE n.id = ? AND (n.autor_id = ? OR ? = 'admin' OR ? = 'propietario')
    `;
    
    const noticias = await db.query(query, [id, req.user.id, req.user.rol, req.user.rol]);
    
    if (noticias.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Noticia no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: noticias[0]
    });
  } catch (error) {
    console.error('Error al obtener noticia:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la noticia',
      error: error.message
    });
  }
});

module.exports = router;
