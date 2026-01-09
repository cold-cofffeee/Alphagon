// ============================================
// ERROR HANDLER MIDDLEWARE
// Centralized error handling
// ============================================

import { Request, Response, NextFunction } from 'express';
import { supabaseService } from '../services/supabase.service';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error to database
  supabaseService.logError({
    user_id: req.user?.id || null,
    error_type: err.name || 'ServerError',
    error_message: message,
    error_stack: err.stack || null,
    endpoint: req.originalUrl,
    request_data: {
      method: req.method,
      body: req.body,
      query: req.query,
      params: req.params,
    },
  }).catch(logErr => console.error('Failed to log error:', logErr));

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      statusCode,
      message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
    });
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * 404 handler
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
  });
}

/**
 * Async route wrapper to catch errors
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
