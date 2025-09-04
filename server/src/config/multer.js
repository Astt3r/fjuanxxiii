const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Helper to ensure directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Base uploads directory (server/uploads)
const UPLOADS_BASE = path.join(__dirname, '../../uploads');

// Configuración de almacenamiento para protocolos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(UPLOADS_BASE, 'protocols');
    ensureDir(dest);
    cb(null, dest); // Directorio donde se guardarán los archivos
  },
  filename: function (req, file, cb) {
    // Crear nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configuración de almacenamiento para imágenes de noticias
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(UPLOADS_BASE, 'noticias/imagenes');
    ensureDir(dest);
    cb(null, dest); // Directorio específico para imágenes de noticias
  },
  filename: function (req, file, cb) {
    // Crear nombre único para la imagen
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `noticia-${uniqueSuffix}-${sanitizedName}`);
  }
});

// Filtro de archivos para solo permitir documentos
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF, DOC y DOCX'), false);
  }
};

// Filtro de archivos para solo permitir imágenes (según especificación: jpeg, png, webp)
const imageFilter = (req, file, cb) => {
  const allowSvg = process.env.ALLOW_SVG_IMAGES === 'true';
  const allowedImageTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    ...(allowSvg ? ['image/svg+xml'] : [])
  ];
  if (!allowedImageTypes.includes(file.mimetype)) {
    return cb(new Error('Formato inválido. Solo se permiten imágenes JPEG, PNG, WebP'+(allowSvg?', SVG':'') ), false);
  }
  cb(null, true);
};

// Verificación de firma mágica básica (post guardado se revalida en ruta si se activa)
async function verifyMagicNumber(filePath) {
  // Leemos primeros bytes
  const fd = require('fs').openSync(filePath,'r');
  const buffer = Buffer.alloc(12);
  try { require('fs').readSync(fd, buffer, 0, 12, 0); } finally { require('fs').closeSync(fd); }
  // Firmas simples
  const hex = buffer.toString('hex');
  // JPEG starts with ffd8ff
  if(hex.startsWith('ffd8ff')) return true;
  // PNG starts with 89504e470d0a1a0a
  if(hex.startsWith('89504e470d0a1a0a')) return true;
  // WEBP: RIFF....WEBP (RIFF + 4 bytes + 57454250)
  if(buffer.slice(0,4).toString() === 'RIFF' && buffer.slice(8,12).toString() === 'WEBP') return true;
  // SVG (texto) no tiene firma binaria -> solo si allowSvg
  return false;
}

module.exports.verifyMagicNumber = verifyMagicNumber;

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  },
  fileFilter: fileFilter
});

// Configuración específica para imágenes de noticias
const uploadImage = multer({
  storage: imageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo para imágenes
  },
  fileFilter: imageFilter
});

module.exports = { 
  upload, 
  uploadImage,
  verifyMagicNumber
};
