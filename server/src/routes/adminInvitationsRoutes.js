const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/authz');
const { createInvitation, listInvitations } = require('../services/invitationsService');

// Crear invitación (solo admin)
router.post('/', authenticateToken, requireRole('admin'), async (req,res) => {
  try {
    const { email=null, role='admin', expiresAt=null } = req.body || {};
    const inv = await createInvitation({ email, role, expiresAt, createdBy: req.user.id });
    res.status(201).json({ success: true, data: inv }); // incluye code en claro SOLO aquí
  } catch(e){
    console.error('Error creando invitación', e);
    res.status(500).json({ success:false, message:'Error interno' });
  }
});

// Listar invitaciones
router.get('/', authenticateToken, requireRole('admin'), async (req,res)=>{
  try {
    const page = parseInt(req.query.page||'1',10);
    const limit = Math.min(parseInt(req.query.limit||'20',10),100);
    const rows = await listInvitations({ page, limit });
    res.json({ success:true, data: rows, meta:{ page, limit } });
  } catch(e){
    console.error('Error listando invitaciones', e);
    res.status(500).json({ success:false, message:'Error interno' });
  }
});

module.exports = router;
