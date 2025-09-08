const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../config/database');
const authRoutes = require('./authRoutes'); // para verifyToken
const { requireRole } = require('../middleware/authz');

// Límite diario configurable
const DAILY_LIMIT = parseInt(process.env.USER_DAILY_LIMIT || '5', 10);

// Helper: contar usuarios creados hoy (excluye propietarios si se quiere)
async function countCreatedToday() {
  const rows = await db.query('SELECT COUNT(*) as c FROM usuarios WHERE DATE(created_at)=CURDATE()');
  return rows[0]?.c || 0;
}

// GET lista usuarios
router.get('/', authRoutes.verifyToken, requireRole('admin','propietario'), async (req,res) => {
  try {
    const users = await db.query('SELECT id, nombre, email, rol, estado, ultimo_acceso, created_at FROM usuarios ORDER BY id ASC');
    const createdToday = await countCreatedToday();
    res.json({ ok:true, usuarios: users, createdToday, dailyLimit: DAILY_LIMIT });
  } catch(err){
    console.error('adminUsers GET error', err.message);
    res.status(500).json({ ok:false, error:'Error interno' });
  }
});

// Utilidad para derivar email único desde nombre
async function generarEmailDesdeNombre(nombre) {
  const DOMAIN = process.env.MAIL_DOMAIN || 'fundacionjuanxxiii.cl';
  let base = (nombre||'').toString().trim().toLowerCase();
  if(!base) base = 'usuario';
  // Normalizar (quitar acentos) y permitir sólo a-z0-9.
  base = base.normalize('NFD').replace(/\p{Diacritic}/gu,'');
  // Reemplazar separadores por punto
  base = base.replace(/[^a-z0-9]+/g,'.');
  base = base.replace(/^\.|\.$/g,'');
  if(!base) base = 'usuario';
  let email = `${base}@${DOMAIN}`;
  // Verificar colisiones
  let counter = 1;
  while(true){
    const exists = await db.query('SELECT id FROM usuarios WHERE email=? LIMIT 1',[email]);
    if(!exists.length) break;
    email = `${base}${++counter}@${DOMAIN}`;
  }
  return email;
}

// POST crear usuario nuevo (rol siempre 'contenido' y email autogenerado)
router.post('/', authRoutes.verifyToken, requireRole('admin','propietario'), async (req,res) => {
  try {
    const { nombre, password } = req.body;
    if(!nombre || !password) return res.status(400).json({ ok:false, error:'Datos incompletos' });

    // Límite diario
    const createdToday = await countCreatedToday();
    if(createdToday >= DAILY_LIMIT) return res.status(429).json({ ok:false, error:'Límite diario alcanzado' });

    const email = await generarEmailDesdeNombre(nombre);
    const finalRol = 'contenido';
    const cost = Math.max(parseInt(process.env.BCRYPT_COST||'12',10),12);
    const hash = await bcrypt.hash(password, cost);
    await db.query('INSERT INTO usuarios (nombre,email,password,rol,estado,institucion) VALUES (?,?,?,?,"activo",?)',[nombre, email, hash, finalRol, 'Fundación Juan XXIII']);
    const inserted = await db.query('SELECT id, nombre, email, rol, estado, ultimo_acceso, created_at FROM usuarios WHERE email=?',[email]);
    res.status(201).json({ ok:true, created:true, usuario: inserted[0] });
  } catch(err){
    console.error('adminUsers POST error', err.message);
    res.status(500).json({ ok:false, error:'Error interno' });
  }
});

module.exports = router;
