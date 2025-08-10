const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento para protocolos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/protocols/'); // Directorio donde se guardarán los archivos
  },
  filename: function (req, file, cb) {
    // Crear nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
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

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  },
  fileFilter: fileFilter
});

module.exports = upload;
