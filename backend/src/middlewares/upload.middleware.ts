import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from '../errors';

const uploadDir = path.join(__dirname, '..', '..', '..', 'uploads');

// Asegurar que el directorio exista
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Clasificar por tipo si es necesario
    const route = req.originalUrl;
    let folder = 'general';
    if (route.includes('/acuse')) folder = 'acuses';
    if (route.includes('/anexos')) folder = 'anexos';

    const finalPath = path.join(uploadDir, folder);
    if (!fs.existsSync(finalPath)) {
      fs.mkdirSync(finalPath, { recursive: true });
    }
    
    cb(null, finalPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(400, 'Tipo de archivo no permitido. Solo se permiten PDF, JPG, PNG y WEBP.'));
  }
};

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max
  },
  fileFilter
});
