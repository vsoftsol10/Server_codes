import { prisma } from '../config/database.js';

// ✅ Helper: normalize role checks (handles 'Admin', 'ADMIN', 'Site_Engineer', 'SITE_ENGINEER', 'ENGINEER')
// Engineer JWT payload: { id: engineer.id (Int), role: 'Site_Engineer', type: 'engineer', companyId }
// Admin JWT payload:    { userId: user.id (UUID), role: 'Admin', companyId }
// So for engineers: req.user.id is the Engineer.id Int we need for Notification.engineerId
const isAdmin = (role) => ['ADMIN', 'SUPERVISOR'].includes(role?.toUpperCase()?.trim());
const isEngineer = (role) => ['ENGINEER', 'SITE_ENGINEER'].includes(role?.toUpperCase()?.trim());

export const getNotifications = async (req, res) => {
  try {
    // ✅ FIX: engineerId (Int) takes priority for engineers; userId is fallback
    const userId = req.user?.engineerId || req.user?.id || req.user?.userId;
    const userRole = req.user?.role;
    
    console.log('🔔 getNotifications called');
    console.log('   Raw user from token:', req.user);
    console.log('   Resolved userId:', userId);
    console.log('   Role:', userRole);

    if (!userId) {
      return res.status(400).json({ 
        success: false,
        error: 'User ID not found in request' 
      });
    }

    const { unreadOnly } = req.query;

    // ✅ FIX: Case-insensitive role check
    let where = {};
    
    if (isAdmin(userRole)) {
      where.recipientRole = 'ADMIN';
    } else if (isEngineer(userRole)) {
      where.engineerId = parseInt(userId);
      where.recipientRole = 'ENGINEER';
    } else {
      // Unknown role — return empty to avoid leaking data
      console.warn('⚠️ Unknown role in getNotifications:', userRole);
      return res.json({ 
        success: true,
        count: 0,
        unreadCount: 0,
        notifications: []
      });
    }

    if (unreadOnly === 'true') {
      where.read = false;
    }

    console.log('   Prisma where clause:', where);

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 50,
      include: {
        engineer: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    }).catch(err => {
      console.error('Prisma notification query error:', err);
      return [];
    });

    // ✅ FIX: Unread count uses same normalized role check
    let unreadWhere = { read: false };
    if (isAdmin(userRole)) {
      unreadWhere.recipientRole = 'ADMIN';
    } else {
      unreadWhere.engineerId = parseInt(userId);
      unreadWhere.recipientRole = 'ENGINEER';
    }

    const unreadCount = await prisma.notification.count({
      where: unreadWhere
    }).catch(err => {
      console.error('Prisma notification count error:', err);
      return 0;
    });

    console.log(`   Found ${notifications.length} notifications, ${unreadCount} unread`);

    res.json({ 
      success: true,
      count: notifications.length,
      unreadCount,
      notifications 
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch notifications',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.engineerId || req.user?.id || req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(400).json({ 
        success: false,
        error: 'User ID not found' 
      });
    }

    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) }
    });

    if (!notification) {
      return res.status(404).json({ 
        success: false,
        error: 'Notification not found' 
      });
    }

    // ✅ FIX: Case-insensitive permission check
    const hasPermission = 
      (isAdmin(userRole) && notification.recipientRole === 'ADMIN') ||
      (isEngineer(userRole) && notification.engineerId === parseInt(userId) && notification.recipientRole === 'ENGINEER');

    if (!hasPermission) {
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized' 
      });
    }

    const updated = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { read: true }
    });

    res.json({ 
      success: true,
      message: 'Notification marked as read',
      notification: updated 
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to mark notification as read',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?.engineerId || req.user?.id || req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(400).json({ 
        success: false,
        error: 'User ID not found' 
      });
    }

    // ✅ FIX: Case-insensitive role check
    let where = { read: false };
    
    if (isAdmin(userRole)) {
      where.recipientRole = 'ADMIN';
    } else if (isEngineer(userRole)) {
      where.engineerId = parseInt(userId);
      where.recipientRole = 'ENGINEER';
    }

    const result = await prisma.notification.updateMany({
      where,
      data: { read: true }
    });

    res.json({ 
      success: true,
      message: 'All notifications marked as read',
      count: result.count 
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to mark all notifications as read',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.engineerId || req.user?.id || req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(400).json({ 
        success: false,
        error: 'User ID not found' 
      });
    }

    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) }
    });

    if (!notification) {
      return res.status(404).json({ 
        success: false,
        error: 'Notification not found' 
      });
    }

    // ✅ FIX: Case-insensitive permission check
    const hasPermission = 
      (isAdmin(userRole) && notification.recipientRole === 'ADMIN') ||
      (isEngineer(userRole) && notification.engineerId === parseInt(userId) && notification.recipientRole === 'ENGINEER');

    if (!hasPermission) {
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized' 
      });
    }

    await prisma.notification.delete({
      where: { id: parseInt(id) }
    });

    res.json({ 
      success: true,
      message: 'Notification deleted successfully' 
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete notification',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const clearReadNotifications = async (req, res) => {
  try {
    const userId = req.user?.engineerId || req.user?.id || req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(400).json({ 
        success: false,
        error: 'User ID not found' 
      });
    }

    // ✅ FIX: Case-insensitive role check
    let where = { read: true };
    
    if (isAdmin(userRole)) {
      where.recipientRole = 'ADMIN';
    } else if (isEngineer(userRole)) {
      where.engineerId = parseInt(userId);
      where.recipientRole = 'ENGINEER';
    }

    const result = await prisma.notification.deleteMany({
      where
    });

    res.json({ 
      success: true,
      message: 'Read notifications cleared',
      count: result.count 
    });
  } catch (error) {
    console.error('Clear read notifications error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to clear notifications',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
