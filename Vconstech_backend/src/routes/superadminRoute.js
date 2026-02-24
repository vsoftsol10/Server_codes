import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { downloadUserData } from '../controllers/Userexportcontroller.js';

const router = express.Router();
const prisma = new PrismaClient();

// Create User Route
router.post('/create-user', async (req, res) => {
  try {
    console.log('📦 Full request body:', req.body);
    
    let { 
      name, 
      email, 
      password, 
      role, 
      companyName, 
      phoneNumber, 
      city, 
      address,
      package: userPackage,      // ✅ ADD THIS
      customMembers              // ✅ ADD THIS
    } = req.body;
    
    console.log('📝 Create user attempt:', { email, companyName, role, package: userPackage });
    
    // Validation
    console.log('🔍 Checking required fields...');
    if (!name || !email || !password || !companyName || !phoneNumber || !city || !address || !userPackage) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        error: "All fields are required: name, email, password, company name, phone number, city, address, and package"
      });
    }
    console.log('✅ All required fields present');

    // ✅ ADD PACKAGE VALIDATION
    console.log('🔍 Validating package...');
    const validPackages = ['Classic', 'Pro', 'Premium'];
    if (!validPackages.includes(userPackage)) {
      console.log('❌ Invalid package');
      return res.status(400).json({
        success: false,
        error: 'Invalid package. Must be Classic, Pro, or Premium'
      });
    }

    // ✅ ADD CUSTOM MEMBERS VALIDATION FOR PREMIUM
    if (userPackage === 'Premium') {
      if (!customMembers || customMembers < 1) {
        console.log('❌ Invalid custom members for Premium package');
        return res.status(400).json({
          success: false,
          error: 'Premium package requires a valid number of site engineers (minimum 1)'
        });
      }
    }
    console.log('✅ Package valid');

    // Phone validation
    console.log('🔍 Validating phone number...');
    if (phoneNumber.length !== 10) {
      console.log('❌ Phone number invalid:', phoneNumber.length);
      return res.status(400).json({
        success: false,
        error: 'Phone number must be exactly 10 digits'
      });
    }
    console.log('✅ Phone number valid');
    
    // Check if user already exists
    console.log('🔍 Checking if user exists...');
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(400).json({
        success: false,
        error: 'Email already registered' 
      });
    }
    console.log('✅ User does not exist');
    
    // Validate role
    console.log('🔍 Validating role...');
    if (role && !['Admin', 'Site_Engineer'].includes(role)) {
      console.log('❌ Invalid role');
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be Admin or Site_Engineer'
      });
    }
    console.log('✅ Role valid');
    
    // Find or create company
    console.log('🔍 Finding/creating company...');
    let company = await prisma.company.findFirst({
      where: { name: companyName }
    });
    
    if (!company) {
      console.log('🏢 Creating new company:', companyName);
      company = await prisma.company.create({
        data: { name: companyName }
      });
    }
    console.log('✅ Company ready:', company.id);
    
    // Hash password
    console.log('🔍 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('✅ Password hashed');
    
    // Create user
    console.log('🔍 Creating user in database...');
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phoneNumber,
        city,
        address,
        package: userPackage,                                    // ✅ ADD THIS
        customMembers: userPackage === 'Premium' ? parseInt(customMembers) : null,  // ✅ ADD THIS
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
        package: true,           // ✅ ADD THIS
        customMembers: true,     // ✅ ADD THIS
        role: true,
        companyId: true,
        company: { select: { name: true } }
      }
    });
    console.log('✅ User created in database');
    
    // Generate JWT token
    console.log('🔍 Generating JWT...');
    const token = jwt.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId
    }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('✅ JWT generated');
    
    console.log('✅ User created successfully:', user.email);
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user
    });
    
  } catch (error) {
    console.error('❌ Create user error:', error);
    console.error('❌ Error stack:', error.stack);
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
    console.log('📊 Fetching all users...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        city: true,
        address: true,
        package: true,           // ✅ ADD THIS
        customMembers: true,     // ✅ ADD THIS
        role: true,
        companyId: true,
        company: { select: { name: true } },
        createdAt: true
      }
    });

    console.log('✅ Users fetched successfully:', users.length);

    res.status(200).json({ 
      success: true,
      users 
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error message:', error.message);
    
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});


router.get('/users/:userId/export', downloadUserData);

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

// ... existing imports ...

// UPDATE USER ROUTE
router.put('/update-user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📝 Update user attempt for ID:', id);
    
    let { 
      name, 
      email, 
      phoneNumber, 
      city, 
      address,
      role,
      companyName,
      package: userPackage,
      customMembers,
      password // Optional - only if changing password
    } = req.body;

    // Validation
    if (!name || !email || !phoneNumber || !city || !address || !role || !companyName || !userPackage) {
      return res.status(400).json({
        success: false,
        error: "All fields are required"
      });
    }

    // Validate package
    const validPackages = ['Classic', 'Pro', 'Premium'];
    if (!validPackages.includes(userPackage)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid package. Must be Classic, Pro, or Premium'
      });
    }

    // Validate custom members for Premium
    if (userPackage === 'Premium' && (!customMembers || customMembers < 1)) {
      return res.status(400).json({
        success: false,
        error: 'Premium package requires a valid number of site engineers (minimum 1)'
      });
    }

    // Phone validation
    if (phoneNumber.length !== 10) {
      return res.status(400).json({
        success: false,
        error: 'Phone number must be exactly 10 digits'
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if email is being changed and if it's already taken
    if (email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email }
      });
      
      if (emailTaken) {
        return res.status(400).json({
          success: false,
          error: 'Email already in use by another user'
        });
      }
    }

    // Find or create company
    let company = await prisma.company.findFirst({
      where: { name: companyName }
    });
    
    if (!company) {
      company = await prisma.company.create({
        data: { name: companyName }
      });
    }

    // Prepare update data
    const updateData = {
      name,
      email,
      phoneNumber,
      city,
      address,
      role,
      package: userPackage,
      customMembers: userPackage === 'Premium' ? parseInt(customMembers) : null,
      companyId: company.id
    };

    // If password is provided, hash and include it
    if (password && password.trim() !== '') {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long'
        });
      }
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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

    console.log('✅ User updated successfully:', updatedUser.email);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE USER ROUTE
router.delete('/delete-user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Delete user attempt for ID:', id);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Delete user
    await prisma.user.delete({
      where: { id }
    });

    console.log('✅ User deleted successfully:', existingUser.email);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});



export default router;