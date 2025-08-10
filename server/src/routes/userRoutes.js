const express = require('express');
const router = express.Router();

// Rutas placeholder para usuarios
router.get('/', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Endpoint de usuarios en desarrollo'
  });
});

module.exports = router;
