const { query } = require('../config/database');
const { genSalt, hash } = require('../utils/password');

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seeder de la base de datos...');

    // 1. Crear usuarios administradores
  const salt = await genSalt(10);
  const hashedPassword = await hash('admin123', salt);
    
    await query(`
      INSERT IGNORE INTO usuarios (nombre, email, password, rol, estado) VALUES 
      ('Administrador Fundación', 'admin@fundacionjuanxxiii.cl', ?, 'propietario', 'activo'),
      ('Raúl Galdames Carrasco', 'rgaldames@fundacionjuanxxiii.cl', ?, 'admin', 'activo')
    `, [hashedPassword, hashedPassword]);

    // 2. Insertar personal/funcionarios
    await query(`
      INSERT IGNORE INTO personal (nombre, cargo, departamento, biografia, foto, email, orden_prioridad, estado) VALUES 
      (
        'Raúl Galdames Carrasco', 
        'DIRECTOR EJECUTIVO', 
        'Dirección Ejecutiva',
        'Director Ejecutivo de la Fundación Juan XXIII con amplia experiencia en gestión educacional y administración de establecimientos católicos.',
        '/images/staff/raul-galdames.jpg',
        'rgaldames@fundacionjuanxxiii.cl',
        1,
        'activo'
      ),
      (
        'Patricia Cares Díaz', 
        'JEFA DE ADMINISTRACIÓN EDUCACIONAL', 
        'Administración Educacional',
        'Jefa de Administración Educacional, encargada de supervisar y coordinar los procesos educativos de todos los establecimientos de la Fundación.',
        '/images/staff/patricia-cares.jpg',
        'pcares@fundacionjuanxxiii.cl',
        2,
        'activo'
      ),
      (
        'Vicente González Montoya', 
        'JEFE DE ADMINISTRACIÓN Y FINANZAS', 
        'Administración y Finanzas',
        'Jefe de Administración y Finanzas, responsable de la gestión financiera y administrativa de la Fundación Juan XXIII.',
        '/images/staff/vicente-gonzalez.jpg',
        'vgonzalez@fundacionjuanxxiii.cl',
        3,
        'activo'
      )
    `);

    // 3. Insertar colegios
    await query(`
      INSERT IGNORE INTO colegios (nombre, slug, descripcion, direccion, telefono, email, website, anio_fundacion, estado) VALUES 
      (
        'Colegio San Rafael Arcángel',
        'san-rafael-arcangel',
        'Primer colegio de la Fundación Juan XXIII, dedicado a la enseñanza media con sede en calle Almagro.',
        'Almagro 237, esquina calle Caupolicán, Los Ángeles',
        '43-2314006',
        'contacto@colegiosanrafael.cl',
        'https://www.colegiosanrafael.cl/',
        1975,
        'activo'
      ),
      (
        'Colegio San Gabriel Arcángel',
        'san-gabriel-arcangel',
        'Colegio de enseñanza básica, anexo al Colegio San Rafael Arcángel, posteriormente constituido como colegio independiente.',
        'Calle Marconi, Población Pedro Lagos, Los Ángeles',
        '43-2314006',
        'contacto@sgabriel.cl',
        'https://sgabriel.cl/csga/',
        1986,
        'activo'
      ),
      (
        'Colegio Juan Pablo II',
        'juan-pablo-ii',
        'Colegio fundado en 1987 como parte de la expansión educativa de la Fundación Juan XXIII.',
        'Los Ángeles',
        '43-2314006',
        'contacto@colegiojuanpablo.cl',
        'https://colegiojuanpablo.cl/',
        1987,
        'activo'
      ),
      (
        'Colegio Padre Alberto Hurtado',
        'padre-alberto-hurtado',
        'Colegio ubicado en el kilómetro 1.4 del Camino a Antuco, construido originalmente como Pre-seminario "Buen Pastor".',
        'Kilómetro 1.4 Camino a Antuco, Los Ángeles',
        '43-2314006',
        'contacto@colegioalbertohurtado.cl',
        'https://colegioalbertohurtado.cl/',
        1995,
        'activo'
      ),
      (
        'Colegio Beato Damián de Molokai',
        'beato-damian-molokai',
        'Colegio fundado por iniciativa del párroco del Buen Pastor, Pbro. Alberto Berden.',
        'Los Ángeles',
        '43-2314006',
        'contacto@cdmolokai.cl',
        'http://www.cdmolokai.cl/web/',
        1996,
        'activo'
      ),
      (
        'Colegio San Diego de Alcalá',
        'san-diego-alcala',
        'Colegio fundado en Huépil por iniciativa del Párroco de San Diego de Alcalá, Pbro. José Bogliolo Ruyu.',
        'Huépil',
        '43-2314006',
        'contacto@csandiego.cl',
        'http://csandiego.cl/2020/',
        1990,
        'activo'
      ),
      (
        'Colegio San Jorge',
        'san-jorge',
        'Último colegio incorporado a la Fundación Juan XXIII en 2021, ubicado en la comuna de Laja.',
        'Laja',
        '43-2314006',
        'contacto@colegiosanjorgelaja.cl',
        'https://www.colegiosanjorgelaja.cl/',
        2021,
        'activo'
      ),
      (
        'Escuela Particular Cauñicú',
        'escuela-cauñicu',
        'Escuela en el Alto Bio-Bio, parte de la misión evangelizadora en comunidades mapuche.',
        'Cauñicú, Alto Bio-Bio',
        '43-2314006',
        'contacto@caunicu.cl',
        'https://www.facebook.com/caunicu',
        1987,
        'activo'
      ),
      (
        'Escuela Butalelbúm',
        'escuela-butalelbum',
        'Escuela en el Alto Bio-Bio, continuando la labor evangelizadora iniciada por las Hermanas del Niño Jesús.',
        'Butalelbún, Alto Bio-Bio',
        '43-2314006',
        'contacto@butalelbum.cl',
        'https://www.facebook.com/butalelbum',
        1986,
        'activo'
      )
    `);

    // 4. Insertar configuraciones del sitio
    await query(`
      INSERT IGNORE INTO configuraciones (clave, valor, descripcion, tipo) VALUES 
      ('sitio_nombre', 'Fundación Juan XXIII', 'Nombre oficial del sitio web', 'texto'),
      ('sitio_descripcion', 'Institución educacional católica dedicada a la evangelización y educación de la juventud en la provincia del Biobío', 'Descripción del sitio web', 'texto'),
      ('contacto_direccion', 'Valdivia 300, 4to piso, Oficina 401, Los Ángeles', 'Dirección física de la fundación', 'texto'),
      ('contacto_telefono', '43-2314006', 'Teléfono principal de contacto', 'texto'),
      ('contacto_email', 'secretaria@fundacionjuanxxiii.cl', 'Email principal de contacto', 'texto'),
      ('historia_texto', 'Constituida en Los Ángeles el 14 de abril de 1975, la Fundación Juan XXIII nació bajo la luz de la espiritualidad de Juan XXIII, conocido como el «Papa Bueno», procurando encarnar los valores de sencillez, autenticidad y alegría.', 'Texto de historia de la fundación', 'texto'),
      ('mision_texto', 'La Fundación Juan XXIII existe para gestionar con excelencia establecimientos educacionales católicos en la provincia de Biobío, los que destacan por su calidad educativa, sello valórico-social e integración con instituciones claves del entorno, lo que permite formar hombres y mujeres comprometidos/as con su fe, que personalizan su experiencia con Jesús, con espíritu crítico, creador y con libertad responsable, para ser agentes de evangelización preparados para la acción y mejora de la calidad de vida de sus familias y sociedad en general.', 'Misión institucional', 'texto'),
      ('vision_texto', 'La Fundación Juan XXIII aspira a ser una institución altamente reconocida en la provincia de Biobío, por su destacada gestión de establecimientos educacionales, con excelencia académica. Teniendo como fundamento la educación católica, con el sello de la espiritualidad de San Juan XXIII, a fin de formar personas capaces de integrar saberes y de proclamar con audacia y osadía su convicción cristiana, que se conviertan en agentes de comunión de una sociedad que fomente la paz y la unidad; siendo solidario con los pobres y necesitados con amor y conocimiento de su cultura.', 'Visión institucional', 'texto'),
      ('valores_texto', 'Siendo nuestro modelo de virtud la persona de Jesús, los valores que queremos desarrollar y formar en nuestros estudiantes son: Solidaridad, Responsabilidad, Verdad, Respeto, Fortaleza', 'Valores institucionales', 'texto'),
      ('redes_facebook', 'https://www.facebook.com/FundacionJuanXXIII/', 'URL de Facebook', 'texto'),
      ('redes_instagram', 'https://www.instagram.com/fundacionjuanxxiiila/', 'URL de Instagram', 'texto'),
      ('redes_youtube', 'https://www.youtube.com/channel/UC8UBYBwR1NFtAk2S3QZPXIQ', 'URL de YouTube', 'texto')
    `);

  console.log('Seeder completado exitosamente');
    console.log('📝 Datos iniciales cargados:');
    console.log('   - 2 usuarios administradores');
    console.log('   - 3 funcionarios principales');
  console.log('   - 9 colegios (sin atributo destacado)');
  console.log('   - Configuraciones del sitio');
  console.log('   - 3 noticias destacadas (solo para noticias)');
    console.log('   - 5 protocolos base');
    console.log('');
    console.log('🔑 Credenciales de acceso:');
    console.log('   Email: admin@fundacionjuanxxiii.cl');
    console.log('   Contraseña: admin123');

  } catch (error) {
    console.error('❌ Error en el seeder:', error);
  }
};

module.exports = seedDatabase;
