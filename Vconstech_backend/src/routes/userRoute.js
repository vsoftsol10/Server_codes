import express from 'express';
import { 
  getEmployees, 
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  uploadCompanyLogo
} from '../controllers/userController.js';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddlewares.js';
import { uploadLogo } from '../config/multerConfig.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Profile routes
router.get('/profile/:userId', getUserProfile);
router.put('/profile/:userId', updateUserProfile);
router.put('/change-password/:userId', changeUserPassword);

// Logo upload route (Admin only)
router.post('/upload-logo/:userId', uploadLogo.single('logo'), uploadCompanyLogo);

// Employee routes
router.get('/employees', getEmployees);

// User routes (Admin only)
router.get('/', authorizeRole('Admin'), getAllUsers);

export default router;