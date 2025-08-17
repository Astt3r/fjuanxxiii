const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { upload } = require('../config/multer');

// Obtener todos los protocolos
router.get('/', async (req, res) => {
  try {
    const { categoria, estado = 'activo' } = req.query;
    
    let query = `
      SELECT p.*, u.nombre as subido_por_nombre
      FROM protocolos p
      LEFT JOIN usuarios u ON p.subido_por = u.id
      WHERE p.estado = ?
    `;
    
    const params = [estado];
    
    if (categoria) {
      query += ' AND p.categoria = ?';
      params.push(categoria);
    }
    
    query += ' ORDER BY p.created_at DESC';
    
    const protocolos = await db.query(query, params);
    
    res.json({
      success: true,
      data: protocolos
    });
  } catch (error) {
    console.error('Error al obtener protocolos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Obtener protocolo por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [protocolo] = await db.query(`
      SELECT p.*, u.nombre as subido_por_nombre
      FROM protocolos p
      LEFT JOIN usuarios u ON p.subido_por = u.id
      WHERE p.id = ? AND p.estado = 'activo'
    `, [id]);
    
    if (!protocolo) {
      return res.status(404).json({
        success: false,
        message: 'Protocolo no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: protocolo
    });
  } catch (error) {
    console.error('Error al obtener protocolo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Crear nuevo protocolo
router.post('/', authenticateToken, requireAdmin, upload.single('archivo'), async (req, res) => {
  try {
    const { titulo, descripcion, categoria } = req.body;
    const archivo = req.file;
    
    if (!archivo) {
      return res.status(400).json({
        success: false,
        message: 'Archivo es requerido'
      });
    }
    
    const archivoUrl = `/uploads/protocols/${archivo.filename}`;
    
    const result = await db.query(`
      INSERT INTO protocolos (
        titulo, descripcion, archivo_url, archivo_nombre, 
        tamaño_archivo, tipo_archivo, categoria, subido_por
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      titulo,
      descripcion,
      archivoUrl,
      archivo.originalname,
      archivo.size,
      path.extname(archivo.originalname).substring(1),
      categoria,
      req.user.id
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Protocolo creado exitosamente',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error al crear protocolo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Actualizar protocolo
router.put('/:id', authenticateToken, requireAdmin, upload.single('archivo'), async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, categoria } = req.body;
    const archivo = req.file;
    
    // Verificar que el protocolo existe
    const [protocoloExistente] = await db.query('SELECT * FROM protocolos WHERE id = ?', [id]);
    
    if (!protocoloExistente) {
      return res.status(404).json({
        success: false,
        message: 'Protocolo no encontrado'
      });
    }
    
    let updateQuery = `
      UPDATE protocolos 
      SET titulo = ?, descripcion = ?, categoria = ?
    `;
    let params = [titulo, descripcion, categoria];
    
    // Si se subió un nuevo archivo
    if (archivo) {
      const archivoUrl = `/uploads/protocols/${archivo.filename}`;
      updateQuery += `, archivo_url = ?, archivo_nombre = ?, tamaño_archivo = ?, tipo_archivo = ?`;
      params.push(archivoUrl, archivo.originalname, archivo.size, path.extname(archivo.originalname).substring(1));
      
      // Eliminar archivo anterior si existe
      if (protocoloExistente.archivo_url) {
        const archivoAnterior = path.join(__dirname, '../../uploads/protocols', path.basename(protocoloExistente.archivo_url));
        if (fs.existsSync(archivoAnterior)) {
          fs.unlinkSync(archivoAnterior);
        }
      }
    }
    
    updateQuery += ' WHERE id = ?';
    params.push(id);
    
    await db.query(updateQuery, params);
    
    res.json({
      success: true,
      message: 'Protocolo actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar protocolo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Eliminar protocolo
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener información del protocolo para eliminar el archivo
    const [protocolo] = await db.query('SELECT * FROM protocolos WHERE id = ?', [id]);
    
    if (!protocolo) {
      return res.status(404).json({
        success: false,
        message: 'Protocolo no encontrado'
      });
    }
    
    // Eliminar archivo del servidor
    if (protocolo.archivo_url) {
      const archivoPath = path.join(__dirname, '../../uploads/protocols', path.basename(protocolo.archivo_url));
      if (fs.existsSync(archivoPath)) {
        fs.unlinkSync(archivoPath);
      }
    }
    
    // Eliminar de la base de datos
    await db.query('DELETE FROM protocolos WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Protocolo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar protocolo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Descargar protocolo
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener información del protocolo
    const [protocolo] = await db.query('SELECT * FROM protocolos WHERE id = ? AND estado = "activo"', [id]);
    
    if (!protocolo) {
      return res.status(404).json({
        success: false,
        message: 'Protocolo no encontrado'
      });
    }
    
    const archivoPath = path.join(__dirname, '../../uploads/protocols', path.basename(protocolo.archivo_url));
    
    if (!fs.existsSync(archivoPath)) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }
    
    // Incrementar contador de descargas
    await db.query('UPDATE protocolos SET descargas = descargas + 1 WHERE id = ?', [id]);
    
    // Descargar archivo
    res.download(archivoPath, protocolo.archivo_nombre);
  } catch (error) {
    console.error('Error al descargar protocolo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Obtener categorías de protocolos
router.get('/categorias/list', async (req, res) => {
  try {
    const categorias = await db.query(`
      SELECT DISTINCT categoria 
      FROM protocolos 
      WHERE categoria IS NOT NULL AND categoria != '' AND estado = 'activo'
      ORDER BY categoria
    `);
    
    res.json({
      success: true,
      data: categorias.map(c => c.categoria)
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;