const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const R = require('../utils/response');

// VALIDACIONES BÁSICAS
const validateEventPayload = (body, isUpdate = false) => {
  const errors = [];
  if (!isUpdate) {
    if (!body.titulo || !body.titulo.trim()) errors.push('El título es obligatorio');
    if (!body.fecha_evento) errors.push('La fecha del evento es obligatoria');
  }
  if (body.hora_inicio && body.hora_fin && body.hora_fin <= body.hora_inicio) {
    errors.push('La hora de fin debe ser posterior a la de inicio');
  }
  return errors;
};

// LISTAR EVENTOS (con filtros opcionales)
router.get('/', async (req, res) => {
  try {
    const { from, to, tipo, estado, limit = 100, offset = 0 } = req.query;

    let query = `SELECT id, titulo, descripcion, fecha_evento, hora_inicio, hora_fin, ubicacion, color, tipo, estado, creado_por, created_at, updated_at FROM eventos WHERE 1=1`;
    const params = [];

    if (from) { query += ' AND fecha_evento >= ?'; params.push(from); }
    if (to) { query += ' AND fecha_evento <= ?'; params.push(to); }
    if (tipo) { query += ' AND tipo = ?'; params.push(tipo); }
    if (estado) { query += ' AND estado = ?'; params.push(estado); }

    query += ' ORDER BY fecha_evento ASC, hora_inicio ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const eventos = await db.query(query, params);

    // Responder con un array plano (compatibilidad con frontend/tests existentes)
    return res.json(Array.isArray(eventos) ? eventos : []);
  } catch (error) {
    console.error('Error listando eventos:', error);
    // Mantener consistencia: en error devolver objeto estándar
    return R.fail(res, 'Error al obtener eventos', 500, { error: error.message });
  }
});

// OBTENER EVENTO POR ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
  const rows = await db.query(`SELECT * FROM eventos WHERE id = ?`, [id]);
  if (rows.length === 0) return R.fail(res, 'Evento no encontrado', 404);
  R.ok(res, rows[0]);
  } catch (error) {
    console.error('Error obteniendo evento:', error);
  R.fail(res, 'Error al obtener el evento', 500, { error: error.message });
  }
});

// CREAR EVENTO
router.post('/', authenticateToken, async (req, res) => {
  try {
  const errors = validateEventPayload(req.body);
  if (errors.length) return R.fail(res, 'Datos inválidos', 422, { errors });

    const { titulo, descripcion, fecha_evento, hora_inicio, hora_fin, ubicacion, color = '#3B82F6', tipo = 'evento', estado = 'activo' } = req.body;

    const result = await db.query(`
      INSERT INTO eventos (titulo, descripcion, fecha_evento, hora_inicio, hora_fin, ubicacion, color, tipo, estado, creado_por)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      titulo.trim(),
      descripcion || null,
      fecha_evento,
      hora_inicio || null,
      hora_fin || null,
      ubicacion || null,
      color,
      tipo,
      estado,
      req.user?.id || null
    ]);

  const created = await db.query(`SELECT * FROM eventos WHERE id = ?`, [result.insertId]);
  R.created(res, created[0]);
  } catch (error) {
    console.error('Error creando evento:', error);
  R.fail(res, 'Error al crear el evento', 500, { error: error.message });
  }
});

// ACTUALIZAR EVENTO
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
  const existing = await db.query(`SELECT * FROM eventos WHERE id = ?`, [id]);
  if (existing.length === 0) return R.fail(res, 'Evento no encontrado', 404);

  const errors = validateEventPayload(req.body, true);
  if (errors.length) return R.fail(res, 'Datos inválidos', 422, { errors });

    const fields = ['titulo','descripcion','fecha_evento','hora_inicio','hora_fin','ubicacion','color','tipo','estado'];
    const sets = [];
    const params = [];
    fields.forEach(f => {
      if (req.body[f] !== undefined) { sets.push(`${f} = ?`); params.push(req.body[f] || null); }
    });

  if (!sets.length) return R.fail(res, 'No hay cambios para aplicar', 400);

    params.push(id);
    await db.query(`UPDATE eventos SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, params);
  const updated = await db.query(`SELECT * FROM eventos WHERE id = ?`, [id]);
  R.ok(res, updated[0]);
  } catch (error) {
    console.error('Error actualizando evento:', error);
  R.fail(res, 'Error al actualizar el evento', 500, { error: error.message });
  }
});

// ELIMINAR EVENTO
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
  const existing = await db.query(`SELECT id FROM eventos WHERE id = ?`, [id]);
  if (existing.length === 0) return R.fail(res, 'Evento no encontrado', 404);
    await db.query(`DELETE FROM eventos WHERE id = ?`, [id]);
  R.ok(res, { id, deleted: true });
  } catch (error) {
    console.error('Error eliminando evento:', error);
  R.fail(res, 'Error al eliminar el evento', 500, { error: error.message });
  }
});

module.exports = router;
