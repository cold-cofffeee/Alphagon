// ============================================
// USER ROUTES
// /api/user/*
// ============================================

import { Router, Request, Response } from 'express';
import { supabaseService } from '../services/supabase.service';
import { authenticateUser } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateUser);

/**
 * GET /api/user/profile
 * Get current user profile
 */
router.get('/profile', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const profile = await supabaseService.getUserProfile(userId);

  if (!profile) {
    return res.status(404).json({
      success: false,
      error: 'Profile not found',
    });
  }

  res.json({
    success: true,
    data: profile,
  });
}));

/**
 * PATCH /api/user/profile
 * Update user profile/settings
 */
router.patch('/profile', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const updates = req.body;

  // Allowed fields to update
  const allowedFields = [
    'full_name',
    'default_emotion',
    'default_tone',
    'default_language',
    'default_region',
    'ui_density',
  ];

  // Filter updates to only allowed fields
  const filteredUpdates: any = {};
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      filteredUpdates[field] = updates[field];
    }
  }

  if (Object.keys(filteredUpdates).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No valid fields to update',
    });
  }

  const updatedProfile = await supabaseService.updateUserProfile(
    userId,
    filteredUpdates
  );

  res.json({
    success: true,
    data: updatedProfile,
    message: 'Profile updated successfully',
  });
}));

/**
 * GET /api/user/stats
 * Get user dashboard statistics
 */
router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const stats = await supabaseService.getDashboardStats(userId);

  res.json({
    success: true,
    data: stats,
  });
}));

/**
 * GET /api/user/usage
 * Get usage statistics
 */
router.get('/usage', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const days = parseInt(req.query.days as string) || 30;

  const usage = await supabaseService.getUserStats(userId, days);

  res.json({
    success: true,
    data: usage,
  });
}));

export default router;
