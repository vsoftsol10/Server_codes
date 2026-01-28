// auth.routes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/signup', async (req, res) => {
  try {
    let { name, email, password, role, companyName } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "All fields are required"
      });
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Email already registered' 
      });
    }
    
    // Validate role
    if (!!role && !['Site_Engineer'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid role. Must be Admin or Site_Engineer'
      });
    }
    
    // Find or create company
    let company = await prisma.company.findFirst({
      where: { name: companyName }
    });
    
    if (!company) {
      company = await prisma.company.create({
        data: { companyName }
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSaltSync();
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
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
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// Login endpoint
// Login endpoint
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }
    
    // Match company separately (if multiple)
    let company = null;
    if (user.companyId) {
      company = await prisma.company.findUnique({
        where: { id: user.companyId }
      });
    }
    
    // Generate JWT token
    const token = jwt.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId
    }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        company: company ? { name: company.name } : null
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// Get companies list (for signup dropdown if needed)
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

    res.status(200).json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

export default router;