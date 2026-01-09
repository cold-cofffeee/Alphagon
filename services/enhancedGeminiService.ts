import { supabase } from '../lib/supabase';
import { generationService } from './generationService';
import { creditService } from './creditService';
import { aiUsageService } from './supportServices';

/**
 * Enhanced Gemini Service with Supabase Integration
 * 
 * This service wraps the AI generation process with:
 * - Credit management
 * - Database persistence
 * - Usage tracking
 * - Audit logging
 */

interface GenerationOptions {
  userId: string;
  prompt: string;
  model?: string;
  creditsRequired?: number;
  metadata?: any;
}

interface GenerationResult {
  success: boolean;
  generationId?: string;
  content?: any;
  error?: string;
  creditsUsed?: number;
}

export const enhancedGeminiService = {
  /**
   * Generate content with full database integration
   */
  async generateWithTracking(
    options: GenerationOptions
  ): Promise<GenerationResult> {
    const {
      userId,
      prompt,
      model = 'gemini-pro',
      creditsRequired = 10,
      metadata = {},
    } = options;

    const startTime = Date.now();

    try {
      // 1. Check if user has enough credits
      const hasCredits = await creditService.hasEnoughCredits(
        userId,
        creditsRequired
      );

      if (!hasCredits) {
        return {
          success: false,
          error: 'Insufficient credits',
        };
      }

      // 2. Check if user is banned
      const { data: user } = await supabase
        .from('users')
        .select('is_banned, ban_reason')
        .eq('id', userId)
        .single();

      if (user && (user as any).is_banned) {
        return {
          success: false,
          error: `Account banned: ${(user as any).ban_reason || 'No reason provided'}`,
        };
      }

      // 3. Create generation record
      const generation = await generationService.createGeneration(
        userId,
        prompt,
        model,
        metadata
      );

      if (!generation) {
        return {
          success: false,
          error: 'Failed to create generation record',
        };
      }

      // 4. Update status to processing
      await generationService.updateGeneration(generation.id, {
        status: 'processing',
      });

      // 5. Deduct credits
      const transactionId = await creditService.deductCredits(
        userId,
        creditsRequired,
        `AI Generation: ${model}`,
        generation.id
      );

      if (!transactionId) {
        await generationService.updateGeneration(generation.id, {
          status: 'failed',
          error_message: 'Failed to deduct credits',
        });
        return {
          success: false,
          error: 'Failed to process credit transaction',
        };
      }

      // 6. Call the actual AI service (your existing Gemini logic)
      // Replace this with your actual Gemini API call
      const aiResult = await this.callGeminiAPI(prompt, model);

      const processingTime = Date.now() - startTime;

      // 7. Update generation with success
      await generationService.updateGeneration(generation.id, {
        status: 'completed',
        result: aiResult,
        credits_used: creditsRequired,
        processing_time_ms: processingTime,
      });

      // 8. Track AI usage for analytics
      await aiUsageService.trackUsage(
        userId,
        model,
        aiResult.promptTokens || 0,
        aiResult.completionTokens || 0,
        aiResult.cost || 0,
        generation.id,
        { processingTime }
      );

      return {
        success: true,
        generationId: generation.id,
        content: aiResult.content,
        creditsUsed: creditsRequired,
      };
    } catch (error: any) {
      console.error('Generation error:', error);

      // Update generation with error if we have the ID
      if (error.generationId) {
        await generationService.updateGeneration(error.generationId, {
          status: 'failed',
          error_message: error.message,
        });
      }

      return {
        success: false,
        error: error.message || 'Unknown error occurred',
      };
    }
  },

  /**
   * Call Gemini API (integrated with existing geminiService)
   */
  async callGeminiAPI(prompt: string, model: string): Promise<any> {
    // Import the existing Gemini service dynamically to avoid circular deps
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Use the appropriate model based on request
    const geminiModel = model.includes('flash') ? 'gemini-3-flash-preview' : 'gemini-3-pro-preview';
    
    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: prompt,
    });
    
    const text = response.text?.trim() || '';
    
    // Estimate tokens (rough approximation: 1 token ≈ 4 characters)
    const promptTokens = Math.ceil(prompt.length / 4);
    const completionTokens = Math.ceil(text.length / 4);
    const totalTokens = promptTokens + completionTokens;
    
    // Calculate cost (Gemini pricing: ~$0.001 per 1K tokens for pro, $0.0005 for flash)
    const costPer1kTokens = model.includes('flash') ? 0.0005 : 0.001;
    const cost = (totalTokens / 1000) * costPer1kTokens;
    
    return {
      content: text,
      promptTokens,
      completionTokens,
      totalTokens,
      cost,
    };
  },

  /**
   * Retry failed generation
   */
  async retryGeneration(generationId: string, userId: string): Promise<GenerationResult> {
    const generation = await generationService.getGeneration(generationId);

    if (!generation) {
      return {
        success: false,
        error: 'Generation not found',
      };
    }

    if (generation.user_id !== userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    return this.generateWithTracking({
      userId,
      prompt: generation.prompt,
      model: generation.model,
      metadata: generation.metadata ? { ...(generation.metadata as any), retryOf: generationId } : { retryOf: generationId },
    });
  },
};
