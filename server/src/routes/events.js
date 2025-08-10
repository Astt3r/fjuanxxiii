const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Obtener todos los eventos
router.get('/', async (req, res) => {
  try {
    const [events] = await db.execute(`
      SELECT 
        id,
        titulo,
        descripcion,
        fecha_evento,
        hora_inicio,
        hora_fin,
        ubicacion,
        color,
        tipo,
        estado,
        creado_por,
        created_at
      FROM eventos 
      WHERE estado = 'activo' 
      ORDER BY fecha_evento ASC
    `);
    
    res.json(events);
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener eventos por mes
router.get('/month/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    
    const [events] = await db.execute(`
      SELECT 
        id,
        titulo,
        descripcion,
        fecha_evento,
        hora_inicio,
        hora_fin,
        ubicacion,
        color,
        tipo,
        estado,
        creado_por,
        created_at
      FROM eventos 
      WHERE YEAR(fecha_evento) = ? AND MONTH(fecha_evento) = ? AND estado = 'activo'
      ORDER BY fecha_evento ASC, hora_inicio ASC
    `, [year, month]);
    
    res.json(events);
  } catch (error) {
    console.error('Error al obtener eventos del mes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nuevo evento
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      titulo, 
      descripcion, 
      fecha_evento, 
      hora_inicio, 
      hora_fin, 
      ubicacion, 
      color, 
      tipo 
    } = req.body;
    
    const [result] = await db.execute(`
      INSERT INTO eventos (
        titulo, 
        descripcion, 
        fecha_evento, 
        hora_inicio, 
        hora_fin, 
        ubicacion, 
        color, 
        tipo, 
        creado_por
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [titulo, descripcion, fecha_evento, hora_inicio, hora_fin, ubicacion, color, tipo, req.user.id]);
    
    res.status(201).json({
      success: true,
      message: 'Evento creado exitosamente',
      eventoId: result.insertId
    });
  } catch (error) {
    console.error('Error al crear evento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar evento
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      titulo, 
      descripcion, 
      fecha_evento, 
      hora_inicio, 
      hora_fin, 
      ubicacion, 
      color, 
      tipo,
      estado 
    } = req.body;
    
    const [result] = await db.execute(`
      UPDATE eventos SET 
        titulo = ?, 
        descripcion = ?, 
        fecha_evento = ?, 
        hora_inicio = ?, 
        hora_fin = ?, 
        ubicacion = ?, 
        color = ?, 
        tipo = ?,
        estado = ?
      WHERE id = ?
    `, [titulo, descripcion, fecha_evento, hora_inicio, hora_fin, ubicacion, color, tipo, estado, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    
    res.json({
      success: true,
      message: 'Evento actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar evento
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.execute(`
      DELETE FROM eventos WHERE id = ?
    `, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    
    res.json({
      success: true,
      message: 'Evento eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener evento por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [events] = await db.execute(`
      SELECT 
        e.*,
        u.nombre as creado_por_nombre
      FROM eventos e
      LEFT JOIN usuarios u ON e.creado_por = u.id
      WHERE e.id = ? AND e.estado = 'activo'
    `, [id]);
    
    if (events.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    
    res.json(events[0]);
  } catch (error) {
    console.error('Error al obtener evento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
