// ============================================
// ADMIN MIDDLEWARE
// Authorization for admin panel access
// ============================================

import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // User ID should be set by auth middleware
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
      });
    }

    // Check if user is admin
    const isAdmin = await adminService.isAdmin(userId);

    if (!isAdmin) {
      return res.status(403).json({
        error: 'Admin access required',
      });
    }

    // Get admin role details
    const adminRole = await adminService.getAdminRole(userId);
    (req as any).adminRole = adminRole;

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({
      error: 'Failed to verify admin access',
    });
  }
};

export const requirePermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminRole = (req as any).adminRole;

      if (!adminRole) {
        return res.status(403).json({
          error: 'Admin role not found',
        });
      }

      // Super admins have all permissions
      if (adminRole.role === 'super_admin') {
        return next();
      }

      // Check if admin has required permission
      const permissions = adminRole.permissions || {};
      if (!permissions[permission]) {
        return res.status(403).json({
          error: `Permission required: ${permission}`,
        });
      }

      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      res.status(500).json({
        error: 'Failed to verify permission',
      });
    }
  };
};
