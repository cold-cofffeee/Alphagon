// ============================================
// AUTHENTICATION ROUTES
// /api/auth/*
// ============================================

import { Router, Request, Response } from 'express';
import { supabaseService } from '../services/supabase.service';
import { asyncHandler } from '../middleware/error.middleware';
import { isValidEmail, isValidPassword, sanitizeInput } from '../utils/helpers';

const router = Router();

/**
 * POST /api/auth/signup
 * Create new user account
 */
router.post('/signup', asyncHandler(async (req: Request, res: Response) => {
  const { email, password, fullName } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required',
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format',
    });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 8 characters',
    });
  }

  // Signup
  const data = await supabaseService.signUp(
    email.toLowerCase().trim(),
    password,
    fullName ? sanitizeInput(fullName) : undefined
  );

  res.status(201).json({
    success: true,
    data: {
      user: data.user,
      session: data.session,
    },
    message: 'Account created successfully',
  });
}));

/**
 * POST /api/auth/login
 * Sign in existing user
 */
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required',
    });
  }

  // Sign in
  const data = await supabaseService.signIn(
    email.toLowerCase().trim(),
    password
  );

  res.json({
    success: true,
    data: {
      user: data.user,
      session: data.session,
    },
    message: 'Logged in successfully',
  });
}));

/**
 * POST /api/auth/logout
 * Sign out user
 */
router.post('/logout', asyncHandler(async (req: Request, res: Response) => {
  await supabaseService.signOut();

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
}));

export default router;
