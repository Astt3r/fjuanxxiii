const db = require('./src/config/database');

async function checkUsers() {
  try {
    const [users] = await db.execute('SELECT id, nombre, email, rol FROM usuarios LIMIT 5');
    console.log('👥 Usuarios en BD:', users.length);
    users.forEach(u => console.log(`- ${u.nombre} (${u.email}) - ${u.rol}`));
    
    // También verificar si hay un admin por defecto
    const [admin] = await db.execute('SELECT * FROM usuarios WHERE rol = "admin" LIMIT 1');
    if (admin.length === 0) {
      console.log('⚠️  No hay usuarios admin. Creando usuario admin por defecto...');
  const { genSalt, hash } = require('./src/utils/password');
  const salt = await genSalt(10);
  const hashedPassword = await hash('admin123', salt);
      
      await db.execute(`
        INSERT INTO usuarios (nombre, email, password, rol, estado) 
        VALUES (?, ?, ?, ?, ?)
      `, ['Admin', 'admin@fjuanxxiii.cl', hashedPassword, 'admin', 'activo']);
      
      console.log('✅ Usuario admin creado:');
      console.log('   Email: admin@fjuanxxiii.cl');
      console.log('   Password: admin123');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkUsers();
