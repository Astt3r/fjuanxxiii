const express = require('express');
const router = express.Router();

// Rutas placeholder para uploads
router.post('/image', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Endpoint de upload de imágenes en desarrollo'
  });
});

module.exports = router;
