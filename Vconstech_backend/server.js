// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';


import authRoutes from './src/routes/authRoute.js';
import projectRoutes from './src/routes/projectRoute.js';
import engineerRoutes from './src/routes/engineerRoute.js';
import userRoute from './src/routes/userRoute.js';

//SuperAdmin Routes
import superAdminRoutes from './src/routes/superadminRoute.js';

// ✅ Material Management Routes
import materialRoutes from './src/routes/materialRoutes.js';
import projectMaterialRoutes from './src/routes/projectMaterialRoutes.js';
import materialRequestRoutes from './src/routes/materialRequestRoutes.js';
import usageLogRoutes from './src/routes/usageLogRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import testRoutes from './src/routes/test.js';

// ✅ Financial Management Routes
import financialRoutes from './src/routes/financialRoutes.js';

// ✅ Contract Management Routes
import contractRoutes from './src/routes/contractRoutes.js';

// ✅ Labour Management Routes
import labourRoutes from './src/routes/labourRoutes.js';

import { authenticateToken, authorizeRole } from './src/middlewares/authMiddlewares.js';
import { PrismaClient } from '@prisma/client';

// ES module dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// ========== MIDDLEWARE ==========
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Serve static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/projects',projectRoutes);

// ========== EXISTING ROUTES ==========
app.use('/api/auth', authRoutes);
// app.use('/api/projects', projectRoutes);
app.use('/api/engineers', engineerRoutes);
app.use('/api/users', userRoute);

// ========== SUPER ADMIN ROUTES ==========
app.use('/api/superadmin', superAdminRoutes);

// ========== MATERIAL MANAGEMENT ROUTES ==========
app.use('/api/materials', materialRoutes);
app.use('/api/project-materials', projectMaterialRoutes);
app.use('/api/material-requests', materialRequestRoutes);
app.use('/api/usage-logs', usageLogRoutes);
app.use('/api/notifications', notificationRoutes);

// ========== FINANCIAL MANAGEMENT ROUTES ==========
app.use('/api/financial', financialRoutes);

// ========== CONTRACT MANAGEMENT ROUTES ==========
app.use('/api/contracts', contractRoutes);

// ========== LABOUR MANAGEMENT ROUTES ==========
app.use('/api/labours', labourRoutes);

//===========Test API=================
app.use('/api/test', testRoutes);

// ========== EXISTING ENDPOINTS ==========
app.get('/api/employees', 
  authenticateToken, 
  async (req, res) => {
    try {
      const companyId = req.user.companyId;
      const employees = await prisma.engineer.findMany({
        where: { companyId },
        select: {
          id: true,
          name: true,
          empId: true,
          phone: true,
          alternatePhone: true
        },
        orderBy: { name: 'asc' }
      });
      res.json({ count: employees.length, employees });
    } catch (error) {
      console.error('Get employees error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch employees',
        details: error.message 
      });
    }
  }
);

app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

app.get('/api/admin/users', 
  authenticateToken, 
  authorizeRole('Admin'), 
  async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        where: { companyId: req.user.companyId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      });
      res.json({ users });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
);
// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running'
  });
});



// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false,
        error: 'File size too large. Maximum size is 5MB' 
      });
    }
    return res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
  
  res.status(500).json({ 
    error: 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  
  // Close WebSocket connections
  
  
  // Close database connection
  await prisma.$disconnect();
  console.log('✅ Database disconnected');
  
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

// ========== START SERVER ==========
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  🚀 Server is running on port ${PORT}                         ║
║  📊 API available at http://localhost:${PORT}/api            ║
║  💰 Financial API: http://localhost:${PORT}/api/financial    ║
║  👷 Labour API: http://localhost:${PORT}/api/labours         ║
║  🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}                    ║
╚════════════════════════════════════════════════════════════╝
  `);
});

export default app;
