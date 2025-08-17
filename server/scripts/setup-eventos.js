const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fjuan_xxiii'
};

async function setupEventosTable() {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ Conexión establecida');
    
    // Leer y ejecutar el script SQL
    const sqlFile = path.join(__dirname, 'create-eventos-table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Dividir las consultas por punto y coma
    const queries = sql.split(';').filter(query => query.trim());
    
    console.log('🔄 Ejecutando script de creación de tabla eventos...');
    
    for (const query of queries) {
      if (query.trim()) {
        await connection.execute(query);
      }
    }
    
    console.log('✅ Tabla de eventos configurada correctamente');
    
    // Verificar que la tabla se creó correctamente
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM eventos');
    console.log(`📊 Total de eventos en la tabla: ${rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error al configurar la tabla de eventos:', error.message);
    
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('💡 La tabla eventos no existe. Creando...');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 No se pudo conectar a la base de datos. Asegúrate de que MySQL esté ejecutándose.');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupEventosTable();
}

module.exports = { setupEventosTable };
