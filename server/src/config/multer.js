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

// Filtro de archivos para solo permitir imágenes
const imageFilter = (req, file, cb) => {
  const allowedImageTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ];
  
  if (allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP, SVG)'), false);
  }
};

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
  uploadImage 
};
