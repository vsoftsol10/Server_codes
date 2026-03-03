// src/routes/engineerRoute.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middlewares/authMiddlewares.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/engineers';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'engineer-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
    }
  }
});

// ============================================
// ENGINEER LOGIN ENDPOINT
// ============================================
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('🔐 Engineer login attempt:', { username });

    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Username and password are required' 
      });
    }

    const engineer = await prisma.engineer.findFirst({
      where: { username },
      include: {
        company: {
          select: { id: true, name: true }
        }
      }
    });

    if (!engineer) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid username or password' 
      });
    }

    if (!engineer.password) {
      return res.status(401).json({ 
        success: false,
        error: 'No credentials set for this engineer. Please contact your administrator.' 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, engineer.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid username or password' 
      });
    }

    // ✅ FIX: JWT payload now includes all fields that backend controllers expect.
    //
    // WHY THIS MATTERS FOR NOTIFICATIONS:
    //   - Notification.engineerId is an Int (Engineer.id)
    //   - notificationController reads: req.user?.engineerId || req.user?.id || req.user?.userId
    //   - materialRequestController reads: req.user?.engineerId || req.user?.id || req.user?.userId
    //   - Both resolve to engineer.id (Int) correctly via req.user.id OR req.user.engineerId
    //
    // WHY role: 'SITE_ENGINEER' (uppercase):
    //   - notificationController uses isEngineer() which checks .toUpperCase()
    //   - So 'Site_Engineer' would also work now, but UPPERCASE is the standard
    //   - getMyRequests, my-projects etc. check: req.user.type !== 'engineer' || role !== 'Site_Engineer'
    //   - type: 'engineer' handles those checks — role casing doesn't matter for them
    const token = jwt.sign(
      { 
        id: engineer.id,           // ✅ Engineer.id (Int) — used by notification & request controllers
        engineerId: engineer.id,   // ✅ Explicit alias — belt-and-suspenders for all controllers
        userId: engineer.id,       // ✅ Alias — some controllers fall back to req.user.userId
        username: engineer.username,
        name: engineer.name,
        companyId: engineer.companyId,
        role: 'SITE_ENGINEER',     // ✅ UPPERCASE — matches isEngineer() check in notificationController
        type: 'engineer'           // ✅ Kept — used by my-projects and my-profile guards
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log('✅ Token generated for engineer:', engineer.name);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      engineer: {
        id: engineer.id,
        name: engineer.name,
        username: engineer.username,
        empId: engineer.empId,
        phone: engineer.phone,
        designation: engineer.designation || null, 
        profileImage: engineer.profileImage,
        companyId: engineer.companyId,
        companyName: engineer.company.name
      }
    });

  } catch (error) {
    console.error('❌ Engineer login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Login failed. Please try again.' 
    });
  }
});

router.get('/my-projects', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Fetching projects for engineer:', req.user);

    if (req.user.type !== 'engineer' && req.user.role !== 'SITE_ENGINEER') {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied. This endpoint is for engineers only.' 
      });
    }

    const engineerId = req.user.id;
    const companyId = req.user.companyId;

    let projects = [];
    
    try {
      projects = await prisma.project.findMany({
        where: {
          companyId: companyId,
          engineers: {
            some: { id: engineerId }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error1) {
      try {
        projects = await prisma.project.findMany({
          where: {
            companyId: companyId,
            OR: [
              { engineerId: engineerId },
              { assignedEngineerId: engineerId },
              { assignedToId: engineerId }
            ]
          },
          orderBy: { createdAt: 'desc' }
        });
      } catch (error2) {
        const engineerWithProjects = await prisma.engineer.findUnique({
          where: { id: engineerId },
          include: {
            projects: {
              where: { companyId: companyId },
              orderBy: { createdAt: 'desc' }
            }
          }
        });
        
        if (engineerWithProjects) {
          projects = engineerWithProjects.projects || [];
        }
      }
    }

    res.json({ 
      success: true,
      projects,
      count: projects.length,
      message: `Found ${projects.length} assigned projects`
    });

  } catch (error) {
    console.error('❌ Error fetching engineer projects:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch assigned projects',
      details: error.message 
    });
  }
});

// Get engineer's own profile
router.get('/my-profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'engineer' && req.user.role !== 'SITE_ENGINEER') {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied. This endpoint is for engineers only.' 
      });
    }

    const engineer = await prisma.engineer.findUnique({
      where: { id: req.user.id },
      select: {
  id: true, name: true, empId: true, phone: true,
  alternatePhone: true, designation: true, address: true,  // <-- add designation
  profileImage: true, username: true, createdAt: true,
  company: { select: { id: true, name: true } }
}
    });

    if (!engineer) {
      return res.status(404).json({ 
        success: false,
        error: 'Engineer profile not found' 
      });
    }

    res.json({ success: true, engineer });

  } catch (error) {
    console.error('Error fetching engineer profile:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch profile' 
    });
  }
});

// ============================================
// ADMIN ROUTES (Protected)
// ============================================

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        city: true,
        address: true,
        package: true,
        customMembers: true,
        role: true,
        companyId: true,
        company: { select: { name: true } }
      }
    });

    if (!user) {
      return res.status(404).json({ success: true, error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user data' });
  }
});

// Get all engineers for the authenticated user's company
router.get('/', authenticateToken, async (req, res) => {
  try {
    const engineers = await prisma.engineer.findMany({
      where: { companyId: req.user.companyId },
      orderBy: { createdAt: 'desc' },
      select: {
  id: true, name: true, empId: true, phone: true,
  alternatePhone: true, designation: true, address: true,  // <-- add designation
  profileImage: true, username: true, plainPassword: true,
  createdAt: true, updatedAt: true,
  _count: { select: { projects: true } }
}
    });

    res.json({ success: true, engineers });
  } catch (error) {
    console.error('Error fetching engineers:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch engineers' });
  }
});

// Get single engineer by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const engineer = await prisma.engineer.findFirst({
      where: {
        id: parseInt(id),
        companyId: req.user.companyId
      },
      select: {
          id: true, name: true, empId: true, phone: true,
  alternatePhone: true, designation: true, address: true,  // <-- add designation
  profileImage: true, username: true, plainPassword: true,
  createdAt: true, updatedAt: true,
        projects: {
          select: {
            id: true,
            name: true,
            projectId: true,
            status: true
          }
        }
      }
    });

    if (!engineer) {
      return res.status(404).json({ success: false, error: 'Engineer not found' });
    }

    res.json({ success: true, engineer });
  } catch (error) {
    console.error('Error fetching engineer:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch engineer' });
  }
});

// Create new engineer
router.post('/', authenticateToken, upload.single('profileImage'), async (req, res) => {
  try {
const { name, phone, alternatePhone, empId, address, username, password, designation } = req.body;
    const missingFields = [];
    if (!name?.trim()) missingFields.push('name');
    if (!phone?.trim()) missingFields.push('phone');
    if (!empId?.trim()) missingFields.push('empId');
    if (!address?.trim()) missingFields.push('address');
    if (!username?.trim()) missingFields.push('username');
    if (!password) missingFields.push('password');

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields
      });
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, error: 'Phone number must be 10 digits' });
    }

    if (alternatePhone && !phoneRegex.test(alternatePhone)) {
      return res.status(400).json({ success: false, error: 'Alternate phone number must be 10 digits' });
    }

    const existingEngineer = await prisma.engineer.findFirst({
      where: { empId, companyId: req.user.companyId }
    });

    if (existingEngineer) {
      return res.status(400).json({ success: false, error: 'Employee ID already exists' });
    }

    if (username) {
      if (username.length < 4) {
        return res.status(400).json({ success: false, error: 'Username must be at least 4 characters' });
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({ success: false, error: 'Username can only contain letters, numbers, and underscores' });
      }

      const existingUsername = await prisma.engineer.findFirst({
        where: { username }
      });
      if (existingUsername) {
return res.status(400).json({ success: false, error: 'Username already taken. Please choose a different username.' });      }

      if (password.length < 6) {
        return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
      }
    }

    const admin = await prisma.user.findUnique({
  where: { id: req.user.userId },
  select: { companyId: true, package: true, customMembers: true }
});

console.log('Admin package debug:', { userId: req.user.userId, package: admin?.package, customMembers: admin?.customMembers });

if (!admin) {
  return res.status(400).json({ success: false, error: 'Admin account not found.' });
}

const pkg = admin.package?.toLowerCase();
let memberLimit;
if (pkg === 'basic') memberLimit = 5;
else if (pkg === 'premium') memberLimit = 10;
else if (pkg === 'advanced') memberLimit = admin.customMembers || 999;
else memberLimit = 5; // fallback

    const existingEngineersCount = await prisma.engineer.count({
      where: { companyId: req.user.companyId }
    });

    if (existingEngineersCount >= memberLimit) {
      return res.status(400).json({
        success: false,
        error: `Cannot add more engineers. Your ${admin.package} package allows maximum ${memberLimit} site engineers. You currently have ${existingEngineersCount} engineers. Please upgrade your package to add more.`
      });
    }

    let hashedPassword = null;
    if (password && username) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const profileImagePath = req.file ? `/uploads/engineers/${req.file.filename}` : null;

    const engineer = await prisma.engineer.create({
      data: {
        name, empId, phone,
        alternatePhone: alternatePhone || null,
        designation: designation || null,
        address,
        profileImage: profileImagePath,
        username,
        password: hashedPassword,
        plainPassword: password,
        companyId: req.user.companyId
      },
      select: {
  id: true, name: true, empId: true, phone: true,
  alternatePhone: true, designation: true, address: true,  // <-- add designation
  profileImage: true, username: true, createdAt: true, updatedAt: true
}
    });

    res.status(201).json({ success: true, message: 'Engineer added successfully', engineer });
  } catch (error) {
    console.error('Error creating engineer:', error);
    if (req.file) {
      fs.unlink(req.file.path, (err) => { if (err) console.error('Error deleting file:', err); });
    }
    res.status(500).json({ success: false, error: 'Failed to create engineer' });
  }
});

// Update engineer
router.put('/:id', authenticateToken, upload.single('profileImage'), async (req, res) => {
  try {
    const { id } = req.params;
const { name, phone, alternatePhone, empId, address, username, password, designation } = req.body;
    const existingEngineer = await prisma.engineer.findFirst({
      where: { id: parseInt(id), companyId: req.user.companyId }
    });

    if (!existingEngineer) {
      return res.status(404).json({ success: false, error: 'Engineer not found' });
    }

    if (!name || !phone || !empId || !address) {
      return res.status(400).json({ success: false, error: 'Name, phone, employee ID, and address are required' });
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, error: 'Phone number must be 10 digits' });
    }

    if (alternatePhone && !phoneRegex.test(alternatePhone)) {
      return res.status(400).json({ success: false, error: 'Alternate phone number must be 10 digits' });
    }

    const duplicateEngineer = await prisma.engineer.findFirst({
      where: { empId, companyId: req.user.companyId, NOT: { id: parseInt(id) } }
    });

    if (duplicateEngineer) {
      return res.status(400).json({ success: false, error: 'Employee ID already exists' });
    }

    if (username) {
      if (username.length < 4) {
        return res.status(400).json({ success: false, error: 'Username must be at least 4 characters' });
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({ success: false, error: 'Username can only contain letters, numbers, and underscores' });
      }

      const duplicateUsername = await prisma.engineer.findFirst({
  where: { username, NOT: { id: parseInt(id) } }
});
      if (duplicateUsername) {
       return res.status(400).json({ success: false, error: 'Username already taken. Please choose a different username.' });
      }
    }

    let hashedPassword = existingEngineer.password;
    let plainPasswordToStore = existingEngineer.plainPassword;
    
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
      }
      hashedPassword = await bcrypt.hash(password, 10);
      plainPasswordToStore = password;
    }

    let profileImagePath = existingEngineer.profileImage;
    if (req.file) {
      if (existingEngineer.profileImage) {
        const oldImagePath = path.join(process.cwd(), existingEngineer.profileImage);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      profileImagePath = `/uploads/engineers/${req.file.filename}`;
    }

    const engineer = await prisma.engineer.update({
      where: { id: parseInt(id) },
      data: {
        name, empId, phone,
        alternatePhone: alternatePhone || null,
        designation: designation || null,
        address,
        profileImage: profileImagePath,
        username: username || null,
        password: hashedPassword,
        plainPassword: plainPasswordToStore
      },
      select: {
  id: true, name: true, empId: true, phone: true,
  alternatePhone: true, designation: true, address: true,  // <-- add designation
  profileImage: true, username: true, plainPassword: true, createdAt: true, updatedAt: true
}
    });

    res.json({ success: true, message: 'Engineer updated successfully', engineer });
  } catch (error) {
    console.error('Error updating engineer:', error);
    if (req.file) {
      fs.unlink(req.file.path, (err) => { if (err) console.error('Error deleting file:', err); });
    }
    res.status(500).json({ success: false, error: 'Failed to update engineer' });
  }
});

// Delete engineer
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const engineer = await prisma.engineer.findFirst({
      where: { id: parseInt(id), companyId: req.user.companyId }
    });

    if (!engineer) {
      return res.status(404).json({ success: false, error: 'Engineer not found' });
    }

    if (engineer.profileImage) {
      const imagePath = path.join(process.cwd(), engineer.profileImage);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await prisma.engineer.delete({ where: { id: parseInt(id) } });

    res.json({ success: true, message: 'Engineer deleted successfully' });
  } catch (error) {
    console.error('Error deleting engineer:', error);
    res.status(500).json({ success: false, error: 'Failed to delete engineer' });
  }
});

export default router;