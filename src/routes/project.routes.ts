// ============================================
// PROJECT ROUTES
// /api/projects/*
// ============================================

import { Router, Request, Response } from 'express';
import { supabaseService } from '../services/supabase.service';
import { authenticateUser } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { sanitizeInput } from '../utils/helpers';

const router = Router();

// All routes require authentication
router.use(authenticateUser);

/**
 * POST /api/projects
 * Create new project
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const projectData = req.body;

  // Sanitize inputs
  if (projectData.title) {
    projectData.title = sanitizeInput(projectData.title);
  }
  if (projectData.description) {
    projectData.description = sanitizeInput(projectData.description);
  }

  const project = await supabaseService.createProject(userId, projectData);

  res.status(201).json({
    success: true,
    data: project,
    message: 'Project created successfully',
  });
}));

/**
 * GET /api/projects
 * Get all user projects
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const status = (req.query.status as any) || 'active';

  const projects = await supabaseService.getUserProjects(userId, status);

  res.json({
    success: true,
    data: projects,
  });
}));

/**
 * GET /api/projects/:id
 * Get specific project
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const projectId = req.params.id;

  const project = await supabaseService.getProject(projectId, userId);

  if (!project) {
    return res.status(404).json({
      success: false,
      error: 'Project not found',
    });
  }

  res.json({
    success: true,
    data: project,
  });
}));

/**
 * PATCH /api/projects/:id
 * Update project
 */
router.patch('/:id', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const projectId = req.params.id;
  const updates = req.body;

  // Sanitize text inputs
  if (updates.title) {
    updates.title = sanitizeInput(updates.title);
  }
  if (updates.description) {
    updates.description = sanitizeInput(updates.description);
  }
  if (updates.transcription) {
    updates.transcription = sanitizeInput(updates.transcription);
  }
  if (updates.creator_notes) {
    updates.creator_notes = sanitizeInput(updates.creator_notes);
  }

  const updatedProject = await supabaseService.updateProject(
    projectId,
    userId,
    updates
  );

  res.json({
    success: true,
    data: updatedProject,
    message: 'Project updated successfully',
  });
}));

/**
 * DELETE /api/projects/:id
 * Delete (soft) project
 */
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const projectId = req.params.id;

  await supabaseService.deleteProject(projectId, userId);

  res.json({
    success: true,
    message: 'Project deleted successfully',
  });
}));

/**
 * GET /api/projects/:id/generations
 * Get all generations for a project
 */
router.get('/:id/generations', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const projectId = req.params.id;

  // Verify project ownership
  const project = await supabaseService.getProject(projectId, userId);
  if (!project) {
    return res.status(404).json({
      success: false,
      error: 'Project not found',
    });
  }

  const generations = await supabaseService.getProjectGenerations(projectId, userId);

  res.json({
    success: true,
    data: generations,
  });
}));

export default router;
