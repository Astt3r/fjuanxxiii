const express = require('express');
const router = express.Router();

// Rutas placeholder para contacto
router.post('/send', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Endpoint de contacto en desarrollo'
  });
});

module.exports = router;
