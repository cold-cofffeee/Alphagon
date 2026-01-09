// ============================================
// AI GENERATION ROUTES
// /api/generate/*
// ============================================

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { supabaseService } from '../services/supabase.service';
import { geminiService } from '../services/gemini.service';
import { authenticateUser } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { generateInputHash } from '../utils/helpers';
import { ToolName, TOOLS } from '../types';

const router = Router();

// Configure multer for file uploads (memory storage for immediate processing)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 * 1024, // 10GB limit
  },
});

// All routes require authentication
router.use(authenticateUser);

/**
 * POST /api/generate/content
 * Generate AI content for a tool
 */
router.post('/content', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const {
    projectId,
    toolName,
    emotion,
    tone,
    language,
    targetRegion,
    creatorNotes,
  } = req.body;

  // Validation
  if (!projectId || !toolName) {
    return res.status(400).json({
      success: false,
      error: 'projectId and toolName are required',
    });
  }

  // Validate tool name
  if (!TOOLS.find(t => t.name === toolName)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid tool name',
    });
  }

  // Get project (includes transcription)
  const project = await supabaseService.getProject(projectId, userId);
  if (!project) {
    return res.status(404).json({
      success: false,
      error: 'Project not found',
    });
  }

  if (!project.transcription) {
    return res.status(400).json({
      success: false,
      error: 'Project must have a transcription before generating content',
    });
  }

  // Use project settings or provided overrides
  const settings = {
    emotion: emotion || project.emotion || 'emotional',
    tone: tone || project.tone || 'casual',
    language: language || project.language || 'english',
    targetRegion: targetRegion || project.target_region || 'global',
    creatorNotes: creatorNotes || project.creator_notes || '',
  };

  // Create AI context
  const context = {
    transcription: project.transcription,
    ...settings,
    toolName: toolName as ToolName,
  };

  // Generate input hash for caching
  const inputHash = generateInputHash(context);

  // Check cache first
  const cached = await supabaseService.checkGenerationCache(inputHash, toolName);

  let generationData;
  let wasCached = false;

  if (cached) {
    // Return cached result
    wasCached = true;
    generationData = cached;
  } else {
    // Generate new content with Gemini
    const startTime = Date.now();
    const result = await geminiService.generateContent(context);
    const generationTime = Date.now() - startTime;

    // Get tool label
    const tool = TOOLS.find(t => t.name === toolName);

    // Save to database
    generationData = await supabaseService.saveGeneration({
      user_id: userId,
      project_id: projectId,
      tool_name: toolName,
      tool_label: tool?.label || toolName,
      input_hash: inputHash,
      emotion: settings.emotion,
      tone: settings.tone,
      language: settings.language,
      target_region: settings.targetRegion,
      creator_notes: settings.creatorNotes,
      generated_content: result.content,
      model_used: result.modelUsed,
      input_tokens: result.tokensUsed.input,
      output_tokens: result.tokensUsed.output,
      total_tokens: result.tokensUsed.total,
      generation_time_ms: generationTime,
      was_cached: false,
    });
  }

  res.json({
    success: true,
    data: {
      id: generationData.id,
      content: generationData.generated_content,
      wasCached,
      tokensUsed: generationData.total_tokens || 0,
      generationTime: generationData.generation_time_ms || 0,
    },
  });
}));

/**
 * POST /api/generate/transcribe
 * Transcribe audio/video file using Gemini
 */
router.post('/transcribe', upload.single('file'), asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const file = req.file;

  // Validation
  if (!file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded',
    });
  }

  // Validate file type
  const allowedMimeTypes = [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
    'audio/mpeg',
    'audio/wav',
    'audio/mp4',
    'audio/x-m4a',
    'audio/webm',
    'audio/ogg',
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid file type. Please upload an audio or video file.',
    });
  }

  try {
    // Convert buffer to base64 for Gemini API
    const base64Data = file.buffer.toString('base64');

    // Determine mime type for Gemini
    let geminiMimeType = file.mimetype;
    
    // Transcribe using Gemini
    const transcription = await geminiService.transcribeMedia(base64Data, geminiMimeType);

    // Create a project for this file
    const project = await supabaseService.createProject(userId, {
      title: file.originalname || 'Untitled Project',
      originalFilename: file.originalname,
      fileType: file.mimetype.startsWith('video/') ? 'video' : 'audio',
      fileSize: file.size,
      transcription,
      transcriptionLanguage: 'english', // Can be detected if needed
    });

    res.json({
      success: true,
      data: {
        transcription,
        language: 'english',
        projectId: project.id,
      },
      message: 'File transcribed successfully',
    });
  } catch (error: any) {
    console.error('Transcription error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to transcribe file',
    });
  }
}));

/**
 * POST /api/generate/:id/rate
 * Rate a generation
 */
router.post('/:id/rate', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const generationId = req.params.id;
  const { rating, feedback } = req.body;

  // Validation
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      error: 'Rating must be between 1 and 5',
    });
  }

  await supabaseService.rateGeneration(generationId, userId, rating, feedback);

  res.json({
    success: true,
    message: 'Rating submitted successfully',
  });
}));

export default router;
