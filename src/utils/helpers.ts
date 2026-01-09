// ============================================
// UTILITY FUNCTIONS
// ============================================

import crypto from 'crypto';
import { AIPromptContext } from '../types';

/**
 * Generate a hash for caching AI generations
 * Hash includes transcription + settings + tool
 */
export function generateInputHash(context: AIPromptContext): string {
  const input = JSON.stringify({
    transcription: context.transcription,
    emotion: context.emotion,
    tone: context.tone,
    language: context.language,
    targetRegion: context.targetRegion,
    creatorNotes: context.creatorNotes || '',
    toolName: context.toolName,
  });

  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
  // At least 8 characters
  return password.length >= 8;
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format duration in seconds to readable format
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Extract JWT token from Authorization header
 */
export function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }
  return null;
}

/**
 * Sleep utility for rate limiting
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
