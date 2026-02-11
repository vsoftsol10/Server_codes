import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Get all engineers in the same company
export const getEmployees = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    console.log('==================');
    console.log('Logged in user:', req.user);
    console.log('Looking for companyId:', companyId);
    console.log('==================');

    const employees = await prisma.engineer.findMany({
      where: {
        companyId
      },
      select: {
        id: true,
        name: true,
        empId: true,
        phone: true,
        alternatePhone: true,
        companyId: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log('Found engineers:', employees.length);
    console.log('Engineers data:', employees);

    res.json({
      count: employees.length,
      employees
    });

  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch employees',
      details: error.message 
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const users = await prisma.user.findMany({
      where: {
        companyId
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      count: users.length,
      users
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      details: error.message 
    });
  }
};

// ✅ NEW: Get user profile by ID
// ✅ FIXED: Get user profile by ID
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('🔍 Getting profile for userId:', userId);
    console.log('🔍 Request user:', req.user);

    if (req.user.userId !== userId && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to view this profile'
      });
    }

    // First, let's try without selecting logo
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        city: true,
        address: true,
        role: true,
        package: true,
        customMembers: true,
        companyId: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true
            // Temporarily removed logo
          }
        }
      }
    });

    console.log('✅ User found:', user);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Now let's fetch company separately with logo
    if (user.companyId) {
      const company = await prisma.company.findUnique({
        where: { id: user.companyId }
      });
      
      console.log('✅ Company found:', company);
      
      // Merge company data
      user.company = {
        id: company.id,
        name: company.name,
        logo: company.logo
      };
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('❌ Get user profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile',
      details: error.message
    });
  }
};

// ✅ FIXED: Update user profile
// ✅ FIXED: Update user profile
// ✅ FIXED: Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phoneNumber, city, address, companyName } = req.body;

    if (req.user.userId !== userId && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to update this profile'
      });
    }

    // Validate required fields
    if (!name || !email || !phoneNumber || !city || !address) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Validate phone number
    if (!/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        error: 'Phone number must be 10 digits'
      });
    }

    // Check email uniqueness
    if (email !== req.user.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: userId }
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email is already in use'
        });
      }
    }

    // ✅ FIX: Handle company name update properly
    let updateData = {
      name,
      email,
      phoneNumber,
      city,
      address,
      updatedAt: new Date()
    };

    // ✅ Get current user to find their company
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true }
    });

    // ✅ If companyName is provided and user has a company, UPDATE the existing company
    if (companyName && currentUser.companyId) {
      await prisma.company.update({
        where: { id: currentUser.companyId },
        data: { 
          name: companyName,
          updatedAt: new Date()
        }
      });
    } 
    // ✅ If companyName is provided but user has NO company, create one
    else if (companyName && !currentUser.companyId) {
      const newCompany = await prisma.company.create({
        data: { name: companyName }
      });
      updateData.companyId = newCompany.id;
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        city: true,
        address: true,
        role: true,
        package: true,
        customMembers: true,
        company: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user profile',
      details: error.message
    });
  }
};

// ✅ FIXED: Change user password
export const changeUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    // ✅ FIX: Use req.user.userId instead of req.user.id
    if (req.user.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to change this password'
      });
    }

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password',
      details: error.message
    });
  }
};
// ✅ NEW: Upload company logo (Admin only)
export const uploadCompanyLogo = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is admin
    if (req.user.userId !== userId || req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can upload company logo'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true }
    });

    if (!user || !user.companyId) {
      return res.status(404).json({
        success: false,
        error: 'User or company not found'
      });
    }

    // Update company logo
    const logoUrl = `/uploads/logos/${req.file.filename}`;
    
    const updatedCompany = await prisma.company.update({
      where: { id: user.companyId },
      data: {
        logo: logoUrl,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Company logo uploaded successfully',
      logoUrl: logoUrl
    });

  } catch (error) {
    console.error('Upload company logo error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload company logo',
      details: error.message
    });
  }
};