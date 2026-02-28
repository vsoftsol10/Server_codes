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
      package: userPackage,
      customMembers
    } = req.body;
    
    console.log('📝 Create user attempt:', { email, companyName, role, package: userPackage });
    
    if (!name || !email || !password || !companyName || !phoneNumber || !city || !address || !userPackage) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        error: "All fields are required: name, email, password, company name, phone number, city, address, and package"
      });
    }

    const validPackages = ['Basic', 'Premium', 'Advanced'];
    if (!validPackages.includes(userPackage)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid package. Must be Basic, Premium, or Advanced'
      });
    }

    if (userPackage === 'Advanced') {
      if (!customMembers || customMembers < 1) {
        return res.status(400).json({
          success: false,
          error: 'Advanced package requires a valid number of site engineers (minimum 1)'
        });
      }
    }

    if (phoneNumber.length !== 10) {
      return res.status(400).json({
        success: false,
        error: 'Phone number must be exactly 10 digits'
      });
    }
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }
    
    if (role && !['Admin', 'Site_Engineer'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role. Must be Admin or Site_Engineer' });
    }
    
    let company = await prisma.company.findFirst({ where: { name: companyName } });
    if (!company) {
      company = await prisma.company.create({ data: { name: companyName } });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phoneNumber,
        city,
        address,
        package: userPackage,
        customMembers: userPackage === 'Advanced' ? parseInt(customMembers) : null,
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
        package: true,
        customMembers: true,
        role: true,
        isActive: true,
        companyId: true,
        company: { select: { name: true } }
      }
    });
    
    const token = jwt.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId
    }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ success: true, message: 'User created successfully', token, user });
    
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
        phoneNumber: true,
        city: true,
        address: true,
        package: true,
        customMembers: true,
        role: true,
        isActive: true,
        companyId: true,
        company: { select: { name: true } },
        createdAt: true
      }
    });

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.get('/users/:userId/export', downloadUserData);

// Get companies list
router.get('/companies', async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    });
    res.status(200).json({ success: true, companies });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// UPDATE USER ROUTE
router.put('/update-user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    let { 
      name, email, phoneNumber, city, address, role,
      companyName, package: userPackage, customMembers, password
    } = req.body;

    if (!name || !email || !phoneNumber || !city || !address || !role || !companyName || !userPackage) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    const validPackages = ['Basic', 'Premium', 'Advanced'];
    if (!validPackages.includes(userPackage)) {
      return res.status(400).json({ success: false, error: 'Invalid package. Must be Basic, Premium, or Advanced' });
    }

    if (userPackage === 'Advanced' && (!customMembers || customMembers < 1)) {
      return res.status(400).json({ success: false, error: 'Advanced package requires a valid number of site engineers (minimum 1)' });
    }

    if (phoneNumber.length !== 10) {
      return res.status(400).json({ success: false, error: 'Phone number must be exactly 10 digits' });
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) {
        return res.status(400).json({ success: false, error: 'Email already in use by another user' });
      }
    }

    let company = await prisma.company.findFirst({ where: { name: companyName } });
    if (!company) {
      company = await prisma.company.create({ data: { name: companyName } });
    }

    const updateData = {
      name, email, phoneNumber, city, address, role,
      package: userPackage,
      customMembers: userPackage === 'Advanced' ? parseInt(customMembers) : null,
      companyId: company.id
    };

    if (password && password.trim() !== '') {
      if (password.length < 6) {
        return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
      }
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true, name: true, email: true, phoneNumber: true,
        city: true, address: true, package: true, customMembers: true,
        role: true, isActive: true, companyId: true,
        company: { select: { name: true } }
      }
    });

    res.status(200).json({ success: true, message: 'User updated successfully', user: updatedUser });

  } catch (error) {
    console.error('❌ Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// TOGGLE ACTIVE ROUTE
router.put('/toggle-active/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    console.log(`🔄 Toggle active for user ${id}: ${isActive}`);

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'isActive must be a boolean value'
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, name: true, email: true, isActive: true }
    });

    console.log(`✅ User ${updatedUser.email} is now ${isActive ? 'active' : 'inactive'}`);

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ Toggle active error:', error);
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

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await prisma.user.delete({ where: { id } });

    console.log('✅ User deleted successfully:', existingUser.email);
    res.status(200).json({ success: true, message: 'User deleted successfully' });

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