// middleware/authMiddlewares.js
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Engineers are stored in a separate table — skip user isActive check
    if (decoded.type === 'engineer') {
      req.user = decoded;
      return next();
    }

    // Admin/user — re-check isActive on every request
    const user = await prisma.user.findUnique({
      where: { id: String(decoded.userId) },
      select: { isActive: true }
    });

    if (!user || !user.isActive) {
      console.log('❌ Deactivated user attempted access:', decoded.email);
      return res.status(403).json({
        error: 'Your account has been deactivated. Please contact your administrator.'
      });
    }

    req.user = decoded;
    next();
  });
};

export const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.error('❌ No user found in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!req.user.role) {
      console.error('❌ No role found in token:', req.user);
      return res.status(403).json({ 
        error: 'No role found in token',
        tokenData: req.user 
      });
    }

    const userRole = req.user.role.toUpperCase().trim();
    const allowedRoles = roles.map(role => role.toUpperCase().trim());

    console.log('🔒 Authorization Check:');
    console.log('   Endpoint requires:', allowedRoles);
    console.log('   User has role:', userRole);
    console.log('   Is authorized?', allowedRoles.includes(userRole));

    if (!allowedRoles.includes(userRole)) {
      console.error('❌ Authorization failed');
      return res.status(403).json({
        error: 'You do not have permission to perform this action',
        requiredRole: roles,
        yourRole: req.user.role,
        debugInfo: {
          userRoleUppercase: userRole,
          allowedRolesUppercase: allowedRoles
        }
      });
    }

    console.log('✅ Authorization successful');
    next();
  };
};