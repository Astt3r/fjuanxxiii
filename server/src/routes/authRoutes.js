const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const router = express.Router();

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fjuan_xxiii',
  port: process.env.DB_PORT || 3306
};

// JWT Secret (en producción esto debe estar en variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'fjuanxxiii_secret_key_2024';

// Ruta de login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Conectar a la base de datos
    const connection = await mysql.createConnection(dbConfig);

    // Buscar usuario por email
    const [users] = await connection.execute(
      'SELECT id, nombre, email, password, rol, estado FROM usuarios WHERE email = ? AND estado = "activo"',
      [email]
    );

    await connection.end();

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const user = users[0];

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        rol: user.rol 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Actualizar último acceso
    const connectionUpdate = await mysql.createConnection(dbConfig);
    await connectionUpdate.execute(
      'UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?',
      [user.id]
    );
    await connectionUpdate.end();

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol
        }
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Middleware para verificar token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token no proporcionado'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Ruta para obtener información del usuario actual
router.get('/me', verifyToken, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const [users] = await connection.execute(
      'SELECT id, nombre, email, rol, estado, ultimo_acceso FROM usuarios WHERE id = ? AND estado = "activo"',
      [req.user.id]
    );

    await connection.end();

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });

  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Ruta de logout (opcional - solo limpia el token del lado del cliente)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout exitoso'
  });
});

// Exportar también el middleware para usar en otras rutas
router.verifyToken = verifyToken;

module.exports = router;
