const { query } = require('./server/src/config/database');

async function checkEventosTable() {
  try {
    // Verificar si la tabla eventos existe
    const tablesResult = await query("SHOW TABLES LIKE 'eventos'");
    console.log('Resultado de SHOW TABLES:', tablesResult);
    
    if (tablesResult.length > 0) {
      console.log('✓ La tabla eventos existe');
      
      // Obtener estructura de la tabla
      const structure = await query('DESCRIBE eventos');
      console.log('\nEstructura de la tabla eventos:');
      console.table(structure);
      
      // Obtener algunos registros de ejemplo
      const eventos = await query('SELECT * FROM eventos LIMIT 3');
      console.log('\nPrimeros 3 eventos:');
      console.log(eventos);
      
    } else {
      console.log('✗ La tabla eventos NO existe');
      
      // Mostrar todas las tablas disponibles
      const allTables = await query('SHOW TABLES');
      console.log('\nTablas disponibles:');
      console.log(allTables);
    }
    
  } catch (error) {
    console.error('Error verificando tabla eventos:', error);
  }
  
  process.exit(0);
}

checkEventosTable();
