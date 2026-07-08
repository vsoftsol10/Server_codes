// src/routes/labourRoutes.js
import express from 'express';
import multer from 'multer';
import { 
  getAllLabourers,
  getLabourerById,
  createLabourer,
  uploadLabourList,
  updateLabourer,
  deleteLabourer,
  addPayment,
  getLabourerPayments,
  deletePayment,
  getLabourersByProject,
  getLabourStatistics
} from '../controllers/labourController.js';
import { authenticateToken } from '../middlewares/authMiddlewares.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const extension = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
    if (['.csv', '.xlsx'].includes(extension)) return cb(null, true);
    return cb(new Error('Only CSV and Excel files are allowed'));
  }
});

// Apply authentication to all routes
router.use(authenticateToken);

// ========== LABOUR CRUD OPERATIONS (No WebSocket) ==========
router.get('/', getAllLabourers);
router.get('/statistics', getLabourStatistics);
router.get('/:id', getLabourerById);

// Create labourer (no immediate spending impact)
router.post('/', createLabourer);
router.post('/upload', upload.single('file'), uploadLabourList);

// Update labourer details (no immediate spending impact)
router.put('/:id', updateLabourer);

// Delete labourer (no immediate spending impact)
router.delete('/:id', deleteLabourer);

// ========== PAYMENT OPERATIONS (WITH WEBSOCKET) ==========

// 💰 ADD PAYMENT - Triggers spending update
router.post(
  '/:id/payments',
  addPayment
);

// Get payments (read-only, no WebSocket needed)
router.get('/:id/payments', getLabourerPayments);

// 💰 DELETE PAYMENT - Triggers spending update
router.delete(
  '/:labourId/payments/:paymentId',
  deletePayment
);

// ========== PROJECT-SPECIFIC OPERATIONS ==========
router.get('/project/:projectId', getLabourersByProject);

export default router;
