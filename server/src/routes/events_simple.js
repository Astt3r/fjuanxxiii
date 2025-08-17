const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// Obtener todos los eventos (público)
router.get('/', async (req, res) => {
  try {
    console.log('🔍 GET /api/events - Consultando eventos en la base de datos...');
    
    // Obtener eventos de la base de datos
    let eventos = [];
    try {
      eventos = await query('SELECT * FROM eventos WHERE estado = ? ORDER BY fecha_evento DESC, hora_inicio ASC', ['activo']);
      console.log(`📊 Eventos encontrados en BD: ${eventos.length}`);
    } catch (dbError) {
      console.error('❌ Error de base de datos:', dbError.message);
      eventos = [];
    }
    
    // Asegurar que siempre enviamos un array válido
    const eventosArray = Array.isArray(eventos) ? eventos : [];
    console.log(`✅ Enviando ${eventosArray.length} eventos al cliente`);
    
    res.status(200).json(eventosArray);
  } catch (error) {
    console.error('❌ Error obteniendo eventos:', error);
    res.status(200).json([]);
  }
});

module.exports = router;
