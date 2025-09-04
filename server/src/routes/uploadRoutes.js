const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { uploadImage, verifyMagicNumber } = require('../config/multer');
const { authenticateToken } = require('../middleware/auth');

// Asegurar que la carpeta de uploads existe
const uploadsDir = path.join(__dirname, '../../uploads/noticias/imagenes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Ruta para subir imágenes de noticias
router.post('/image', authenticateToken, (req,res)=>{
  uploadImage.single('image')(req,res,async (err)=>{
    if(err){
      if(err.code==='LIMIT_FILE_SIZE') return res.status(400).json({ success:false, message:'Imagen excede tamaño máximo'});
      return res.status(400).json({ success:false, message: err.message });
    }
    if(!req.file) return res.status(400).json({ success:false, message:'No se ha subido ningún archivo' });
    // Verificación opcional de firma mágica
    try {
      if(process.env.VALIDATE_IMAGE_SIGNATURE === 'true'){
        const ok = await verifyMagicNumber(req.file.path);
        if(!ok){
          // eliminar archivo sospechoso
          try { fs.unlinkSync(req.file.path); } catch { /* ignore */ }
          return res.status(400).json({ success:false, message:'Imagen inválida o tipo no permitido' });
        }
      }
      const imageUrl = `/uploads/noticias/imagenes/${req.file.filename}`;
      return res.json({
        success:true,
        message:'Imagen subida exitosamente',
        data:{
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          url: imageUrl
        }
      });
    } catch(e){
      console.error('Error validando firma de imagen', e);
      return res.status(500).json({ success:false, message:'Error al procesar imagen' });
    }
  });
});

// Ruta para eliminar imagen
router.delete('/image/:filename', authenticateToken, (req, res) => {
  try {
    const { filename } = req.params;
    const imagePath = path.join(__dirname, '../../uploads/noticias/imagenes', filename);
    
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      res.json({
        success: true,
        message: 'Imagen eliminada exitosamente'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// Ruta para listar imágenes
router.get('/images', authenticateToken, (req, res) => {
  try {
    const imagesDir = path.join(__dirname, '../../uploads/noticias/imagenes');
    
    if (!fs.existsSync(imagesDir)) {
      return res.json({
        success: true,
        data: []
      });
    }

    const files = fs.readdirSync(imagesDir);
    const images = files
      .filter(file => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file))
      .map(file => {
        const stats = fs.statSync(path.join(imagesDir, file));
        return {
          filename: file,
          url: `/uploads/noticias/imagenes/${file}`,
          size: stats.size,
          uploadDate: stats.birthtime
        };
      })
      .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    res.json({
      success: true,
      data: images
    });

  } catch (error) {
    console.error('Error al listar imágenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = router;
