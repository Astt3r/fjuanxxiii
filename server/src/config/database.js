require('dotenv').config();
console.log('[DB] host:', process.env.DB_HOST);
const mysql = require('mysql2/promise');

// Configuración de la base de datos
const pool = mysql.createPool({
  host: process.env.DB_HOST, 
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = { pool };
// Función para conectar a la base de datos
const connectDB = async () => {
  try {
    // Probar la conexión
    const connection = await pool.getConnection();
  console.log('Conectado a MySQL');
    connection.release();
    
    // Crear las tablas si no existen
    await createTables();
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
   // En tests JAMÁS hacemos exit; y en dev puedes optar por modo degradado
   if (
     process.env.NODE_ENV === 'test' ||
     process.env.ALLOW_START_WITHOUT_DB === 'true'
   ) {
     console.warn('⚠️  DB no disponible (test o ALLOW_START_WITHOUT_DB=true): el servidor continúa en modo degradado.');
     return; // no process.exit
   }
   process.exit(1);
  }
};

// Función para crear las tablas
const createTables = async () => {
  try {
    // Tabla de usuarios (solo admin y propietario)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol ENUM('admin', 'propietario','contenido') DEFAULT 'admin',
        institucion VARCHAR(255),
        avatar VARCHAR(255),
        estado ENUM('activo', 'inactivo', 'pendiente') DEFAULT 'activo',
        ultimo_acceso TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    // Intentar ampliar enum legacy (si faltaba 'contenido')
    try {
      const [cols] = await pool.query("SHOW COLUMNS FROM usuarios LIKE 'rol'");
      if (cols.length) {
        const type = cols[0].Type || '';
        if (!/contenido/.test(type)) {
          try {
            await pool.execute("ALTER TABLE usuarios MODIFY rol ENUM('admin','propietario','contenido') DEFAULT 'admin'");
            console.log('Actualizado ENUM usuarios.rol para incluir valor contenido');
          } catch(alterErr){
            console.warn('⚠️  No se pudo actualizar ENUM usuarios.rol:', alterErr.message);
          }
        }
      }
    } catch(enumErr){ console.warn('⚠️  No se pudo verificar ENUM usuarios.rol:', enumErr.message); }

    // Tabla de noticias
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS noticias (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        resumen TEXT,
        contenido LONGTEXT NOT NULL,
        imagen VARCHAR(255),
        categoria VARCHAR(100),
  estado ENUM('borrador', 'publicado', 'archivado', 'eliminado') DEFAULT 'borrador',
        destacado BOOLEAN DEFAULT FALSE,
        autor_id INT NOT NULL,
        fecha_publicacion TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (autor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        INDEX idx_estado (estado),
        INDEX idx_categoria (categoria),
        INDEX idx_fecha_publicacion (fecha_publicacion)
      )
    `);
    // Asegurar enum noticias.estado incluye 'eliminado'
    try {
      const [colNot] = await pool.query("SHOW COLUMNS FROM noticias LIKE 'estado'");
      if(colNot.length){
        const type = colNot[0].Type||'';
        if(!/eliminado/.test(type)){
          try { await pool.execute("ALTER TABLE noticias MODIFY estado ENUM('borrador','publicado','archivado','eliminado') DEFAULT 'borrador'"); }
          catch(alterErr){ console.warn('⚠️  No se pudo actualizar ENUM noticias.estado:', alterErr.message); }
        }
      }
    } catch(enumErr){ console.warn('⚠️  No se pudo verificar ENUM noticias.estado:', enumErr.message); }

    // Tabla de eventos del calendario
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS eventos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        fecha_evento DATE NOT NULL,
        hora_inicio TIME,
        hora_fin TIME,
        ubicacion VARCHAR(255),
        color VARCHAR(7) DEFAULT '#3B82F6',
        tipo ENUM('evento', 'reunion', 'celebracion', 'academico') DEFAULT 'evento',
  estado ENUM('activo', 'cancelado', 'pospuesto', 'eliminado') DEFAULT 'activo',
        creado_por INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
        INDEX idx_fecha_evento (fecha_evento),
        INDEX idx_estado (estado)
      )
    `);
    // Asegurar enum eventos.estado incluye 'eliminado'
    try {
      const [colEvt] = await pool.query("SHOW COLUMNS FROM eventos LIKE 'estado'");
      if(colEvt.length){
        const type = colEvt[0].Type||'';
        if(!/eliminado/.test(type)){
          try { await pool.execute("ALTER TABLE eventos MODIFY estado ENUM('activo','cancelado','pospuesto','eliminado') DEFAULT 'activo'"); }
          catch(alterErr){ console.warn('⚠️  No se pudo actualizar ENUM eventos.estado:', alterErr.message); }
        }
      }
    } catch(enumErr){ console.warn('⚠️  No se pudo verificar ENUM eventos.estado:', enumErr.message); }

    // Tabla de colegios
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS colegios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        descripcion TEXT,
        direccion VARCHAR(255),
        telefono VARCHAR(50),
        email VARCHAR(255),
        website VARCHAR(255),
        logo VARCHAR(255),
        imagen_principal VARCHAR(255),
        año_fundacion INT,
        estado ENUM('activo', 'inactivo') DEFAULT 'activo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_estado (estado)
      )
    `);

    // Migración puntual: eliminar columna legacy 'destacado' de colegios si aún existe
    try {
      const [colDest] = await pool.query("SHOW COLUMNS FROM colegios LIKE 'destacado'");
      if (colDest.length) {
        try {
          await pool.execute('ALTER TABLE colegios DROP COLUMN destacado');
          console.log('Eliminada columna obsoleta colegios.destacado');
        } catch(dropErr){
          console.warn('⚠️  No se pudo eliminar columna colegios.destacado (ignorado):', dropErr.message);
        }
      }
    } catch(colErr){ console.warn('⚠️  No se pudo verificar columna colegios.destacado:', colErr.message); }

    // Tabla de personal/funcionarios
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS personal (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        cargo VARCHAR(255) NOT NULL,
        departamento VARCHAR(255),
        biografia TEXT,
        foto VARCHAR(255),
        email VARCHAR(255),
        telefono VARCHAR(50),
        orden_prioridad INT DEFAULT 0,
        estado ENUM('activo', 'inactivo') DEFAULT 'activo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_orden_prioridad (orden_prioridad),
        INDEX idx_estado (estado)
      )
    `);

    // Tabla de contactos
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS contactos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        telefono VARCHAR(50),
        asunto VARCHAR(255) NOT NULL,
        mensaje TEXT NOT NULL,
        estado ENUM('nuevo', 'leido', 'respondido') DEFAULT 'nuevo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_estado (estado)
      )
    `);

    // Tabla de configuraciones
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS configuraciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        clave VARCHAR(255) UNIQUE NOT NULL,
        valor TEXT,
        descripcion TEXT,
        tipo ENUM('texto', 'numero', 'booleano', 'json') DEFAULT 'texto',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Tabla de archivos/uploads
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS archivos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre_original VARCHAR(255) NOT NULL,
        nombre_archivo VARCHAR(255) NOT NULL,
        ruta VARCHAR(500) NOT NULL,
        tipo_mime VARCHAR(100),
  tamano INT,
        usuario_id INT,
        tipo_contenido VARCHAR(50),
        contenido_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
        INDEX idx_tipo_contenido (tipo_contenido, contenido_id)
      )
    `);

    // Tabla intermedia para múltiples imágenes por noticia
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS noticias_imagenes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        noticia_id INT NOT NULL,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255),
        url VARCHAR(500) NOT NULL,
  tamano INT,
        tipo_mime VARCHAR(100),
        orden INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (noticia_id) REFERENCES noticias(id) ON DELETE CASCADE,
        INDEX idx_noticia (noticia_id)
      )
    `);
    // Índice compuesto para ordenar consultas de galería (ignorar error si ya existe)
    try {
      await pool.execute('ALTER TABLE noticias_imagenes ADD INDEX idx_noticia_orden (noticia_id, orden)');
    } catch(_e){ /* ya existe */ }

    // --- Migraciones de compatibilidad para columnas acentuadas heredadas ---
    try {
      const [colImg] = await pool.query("SHOW COLUMNS FROM noticias_imagenes LIKE 'tamaño'");
      if (colImg.length) {
  console.log('Migrando columna noticias_imagenes.tamaño -> tamano');
        await pool.execute('ALTER TABLE noticias_imagenes CHANGE COLUMN `tamaño` `tamano` INT');
      }
  } catch(_migErr){ console.warn('⚠️  No se pudo verificar/migrar columna tamaño en noticias_imagenes:'); }
    try {
      const [colArc] = await pool.query("SHOW COLUMNS FROM archivos LIKE 'tamaño_archivo'");
      if (colArc.length) {
        // No renombramos aquí porque la tabla archivos usa tamaño_archivo; solo mantener consistencia futura.
      }
      const [colArcLegacy] = await pool.query("SHOW COLUMNS FROM archivos LIKE 'tamaño'");
      if (colArcLegacy.length) {
  console.log('Migrando columna archivos.tamaño -> tamano');
        await pool.execute('ALTER TABLE archivos CHANGE COLUMN `tamaño` `tamano` INT');
      }
  } catch(_mig2){ console.warn('⚠️  Migración columnas archivos omitida:'); }

    // Backfill: asignar imagen destacada a noticias que aún no tienen (primera imagen por orden)
    try {
      const [result] = await pool.execute(`
        UPDATE noticias n
        SET imagen = (
          SELECT url FROM noticias_imagenes ni
          WHERE ni.noticia_id = n.id
          ORDER BY ni.orden, ni.id
          LIMIT 1
        )
        WHERE n.imagen IS NULL AND EXISTS (
          SELECT 1 FROM noticias_imagenes ni2 WHERE ni2.noticia_id = n.id
        )
      `);
      if (result && result.affectedRows) {
        console.log(`🔄 Backfill imágenes noticias: ${result.affectedRows} filas actualizadas`);
      }
    } catch (_e2) {
      console.warn('⚠️  Error en backfill de imágenes (no crítico)');
    }

  console.log('Tablas de base de datos verificadas/creadas');
  } catch (error) {
    console.error('❌ Error creando tablas:', error.message);
    throw error;
  }
};

// Función para ejecutar queries
const query = async (sql, params = []) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Error en query:', error.message);
    throw error;
  }
};

// Función para transacciones
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const result = await callback(connection);
    
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  pool,
  connectDB,
  query,
  transaction,
  execute: (sql, params = []) => pool.execute(sql, params)
};
