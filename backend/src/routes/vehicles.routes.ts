import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} from '../controllers/vehicles.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'image') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos de imagen'));
      }
    } else if (file.fieldname === 'pdf') {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos PDF'));
      }
    } else {
      cb(null, false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const uploadMiddleware = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'pdf', maxCount: 1 },
]);

const router = Router();

router.use(authenticate);

router.get('/', getAllVehicles);
router.get('/:id', getVehicleById);
router.post('/', requireAdmin, uploadMiddleware, createVehicle);
router.put('/:id', requireAdmin, uploadMiddleware, updateVehicle);
router.delete('/:id', requireAdmin, deleteVehicle);

router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El archivo excede el tamaño máximo de 10MB' });
    }
    return res.status(400).json({ error: `Error de carga: ${err.message}` });
  }
  if (err.message) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

export default router;
