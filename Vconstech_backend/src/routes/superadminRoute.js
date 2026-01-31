import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Create User Route
router.post('/create-user', async (req, res) => {
  try {
    console.log('📦 Full request body:', req.body);
    
    let { name, email, password, role, companyName, phoneNumber, city, address } = req.body;
    console.log('📝 Create user attempt:', { email, companyName, role });
    
    // Validation
    console.log('🔍 Checking required fields...'); // ← ADD THIS
    if (!name || !email || !password || !companyName || !phoneNumber || !city || !address) {
      console.log('❌ Missing required fields'); // ← ADD THIS
      return res.status(400).json({
        success: false,
        error: "All fields are required: name, email, password, company name, phone number, city, and address"
      });
    }
    console.log('✅ All required fields present'); // ← ADD THIS

    // Phone validation
    console.log('🔍 Validating phone number...'); // ← ADD THIS
    if (phoneNumber.length !== 10) {
      console.log('❌ Phone number invalid:', phoneNumber.length); // ← ADD THIS
      return res.status(400).json({
        success: false,
        error: 'Phone number must be exactly 10 digits'
      });
    }
    console.log('✅ Phone number valid'); // ← ADD THIS
    
    // Check if user already exists
    console.log('🔍 Checking if user exists...'); // ← ADD THIS
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log('❌ User already exists'); // ← ADD THIS
      return res.status(400).json({
        success: false,
        error: 'Email already registered' 
      });
    }
    console.log('✅ User does not exist'); // ← ADD THIS
    
    // Validate role
    console.log('🔍 Validating role...'); // ← ADD THIS
    if (role && !['Admin', 'Site_Engineer'].includes(role)) {
      console.log('❌ Invalid role'); // ← ADD THIS
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be Admin or Site_Engineer'
      });
    }
    console.log('✅ Role valid'); // ← ADD THIS
    
    // Find or create company
    console.log('🔍 Finding/creating company...'); // ← ADD THIS
    let company = await prisma.company.findFirst({
      where: { name: companyName }
    });
    
    if (!company) {
      console.log('🏢 Creating new company:', companyName);
      company = await prisma.company.create({
        data: { name: companyName }
      });
    }
    console.log('✅ Company ready:', company.id); // ← ADD THIS
    
    // Hash password
    console.log('🔍 Hashing password...'); // ← ADD THIS
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('✅ Password hashed'); // ← ADD THIS
    
    // Create user
    console.log('🔍 Creating user in database...'); // ← ADD THIS
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phoneNumber,
        city,
        address,
        role: role || 'Site_Engineer',
        companyId: company.id
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        city: true,
        address: true,
        role: true,
        companyId: true,
        company: { select: { name: true } }
      }
    });
    console.log('✅ User created in database'); // ← ADD THIS
    
    // Generate JWT token
    console.log('🔍 Generating JWT...'); // ← ADD THIS
    const token = jwt.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId
    }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('✅ JWT generated'); // ← ADD THIS
    
    console.log('✅ User created successfully:', user.email);
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user
    });
    
  } catch (error) {
    console.error('❌ Create user error:', error);
    console.error('❌ Error stack:', error.stack); // ← ADD THIS
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all users
// Get all users
router.get('/users', async (req, res) => {
  try {
    console.log('📊 Fetching all users...'); // ADD THIS
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        city: true,
        address: true,
        role: true,
        companyId: true,
        company: { select: { name: true } },
        createdAt: true
      }
    });

    console.log('✅ Users fetched successfully:', users.length); // ADD THIS

    res.status(200).json({ 
      success: true,
      users 
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    console.error('❌ Error stack:', error.stack); // ADD THIS
    console.error('❌ Error message:', error.message); // ADD THIS
    
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined // ADD THIS
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