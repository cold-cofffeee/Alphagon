// ============================================
// AUTHENTICATION MIDDLEWARE
// Validates JWT tokens from Supabase
// ============================================

import { Request, Response, NextFunction } from 'express';
import { supabaseService } from '../services/supabase.service';
import { extractToken } from '../utils/helpers';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
      };
    }
  }
}

/**
 * Middleware to authenticate requests using Supabase JWT
 */
export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided',
      });
    }

    // Verify token with Supabase
    const user = await supabaseService.getUser(token);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error: any) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
  }
}

/**
 * Optional authentication - doesn't fail if no token
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = extractToken(req.headers.authorization);

    if (token) {
      const user = await supabaseService.getUser(token);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
        };
      }
    }
  } catch (error) {
    // Silently fail - this is optional auth
    console.error('Optional auth error:', error);
  }

  next();
}
