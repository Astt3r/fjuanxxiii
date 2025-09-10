const express = require('express');
const router = express.Router();

// Endpoint usuarios aún no implementado: responde 501 hasta definir especificación
router.get('/', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Endpoint de usuarios en desarrollo'
  });
});

module.exports = router;
