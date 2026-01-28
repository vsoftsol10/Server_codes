// src/routes/labourRoutes.js
import express from 'express';
import { 
  getAllLabourers,
  getLabourerById,
  createLabourer,
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

// Apply authentication to all routes
router.use(authenticateToken);

// ========== LABOUR CRUD OPERATIONS (No WebSocket) ==========
router.get('/', getAllLabourers);
router.get('/statistics', getLabourStatistics);
router.get('/:id', getLabourerById);

// Create labourer (no immediate spending impact)
router.post('/', createLabourer);

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