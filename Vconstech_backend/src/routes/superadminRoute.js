import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Create User Route
router.post('/create-user', async (req, res) => {
  try {
    let { name, email, password, role, companyName } = req.body;
    
    console.log('📝 Create user attempt:', { email, companyName, role });
    
    // Validation
    if (!name || !email || !password || !companyName) {
      return res.status(400).json({
        success: false,
        error: "Name, email, password, and company name are required"
      });
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered' 
      });
    }
    
    // Validate role
    if (role && !['Admin', 'Site_Engineer'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be Admin or Site_Engineer'
      });
    }
    
    // Find or create company
    let company = await prisma.company.findFirst({
      where: { name: companyName }
    });
    
    if (!company) {
      console.log('🏢 Creating new company:', companyName);
      company = await prisma.company.create({
        data: { name: companyName }
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'Site_Engineer',
        companyId: company.id
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
        company: { select: { name: true } }
      }
    });
    
    // Generate JWT token
    const token = jwt.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId
    }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    console.log('✅ User created successfully:', user.email);
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user
    });
    
  } catch (error) {
    console.error('❌ Create user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
        company: { select: { name: true } },
        createdAt: true
      }
    });

    res.status(200).json({ 
      success: true,
      users 
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get companies list
router.get('/companies', async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.status(200).json({
      success: true,
      companies
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

export default router;