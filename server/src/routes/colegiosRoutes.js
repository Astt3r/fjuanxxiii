const express = require('express');
const router = express.Router();
const db = require('../config/database');
// TODO: proteger operaciones de mutación con authenticateToken/requireAdmin cuando se implementen endpoints de escritura

// Obtener todos los colegios
router.get('/', async (req, res) => {
  try {
    const [schools] = await db.execute(`
      SELECT 
        id,
        nombre,
        slug,
        descripcion,
        direccion,
        telefono,
        email,
        website,
        logo,
        imagen_principal,
        año_fundacion,
        estado,
        created_at
      FROM colegios 
      WHERE estado = 'activo' 
      ORDER BY año_fundacion ASC
    `);
    
    res.json(schools);
  } catch (error) {
    console.error('Error al obtener colegios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener colegio por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [schools] = await db.execute(`
      SELECT 
        id,
        nombre,
        slug,
        descripcion,
        direccion,
        telefono,
        email,
        website,
        logo,
        imagen_principal,
        año_fundacion,
        estado,
        created_at
      FROM colegios 
      WHERE id = ? AND estado = 'activo'
    `, [id]);
    
    if (schools.length === 0) {
      return res.status(404).json({ error: 'Colegio no encontrado' });
    }
    
    res.json(schools[0]);
  } catch (error) {
    console.error('Error al obtener colegio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// (Endpoint /featured eliminado: atributo 'destacado' ya no existe)

module.exports = router;
