const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Obtener todo el personal
router.get('/', async (req, res) => {
  try {
    const [staff] = await db.execute(`
      SELECT 
        id,
        nombre,
        apellido,
        cargo,
        departamento,
        email,
        telefono,
        biografia,
        foto_url,
        activo,
        created_at
      FROM personal 
      WHERE activo = true 
      ORDER BY nombre ASC
    `);
    
    res.json(staff);
  } catch (error) {
    console.error('Error al obtener personal:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
