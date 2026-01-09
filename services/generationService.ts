import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Generation = Database['public']['Tables']['generations']['Row'];
type GenerationInsert = Database['public']['Tables']['generations']['Insert'];
type GenerationStatus = Database['public']['Enums']['generation_status'];

export const generationService = {
  /**
   * Create a new generation
   */
  async createGeneration(
    userId: string,
    prompt: string,
    model: string,
    metadata?: any
  ): Promise<Generation | null> {
    const { data, error } = await supabase
      .from('generations')
      .insert({
        user_id: userId,
        prompt,
        model,
        status: 'pending',
        metadata: metadata || {},
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating generation:', error);
      return null;
    }

    return data;
  },

  /**
   * Update generation status and result
   */
  async updateGeneration(
    generationId: string,
    updates: {
      status?: GenerationStatus;
      result?: any;
      error_message?: string;
      credits_used?: number;
      processing_time_ms?: number;
    }
  ): Promise<Generation | null> {
    const { data, error } = await supabase
      .from('generations')
      .update(updates as any)
      .eq('id', generationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating generation:', error);
      return null;
    }

    return data;
  },

  /**
   * Get generation by ID
   */
  async getGeneration(generationId: string): Promise<Generation | null> {
    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .eq('id', generationId)
      .single();

    if (error) {
      console.error('Error fetching generation:', error);
      return null;
    }

    return data;
  },

  /**
   * Get user's generations
   */
  async getUserGenerations(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Generation[]> {
    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching user generations:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get all generations (admin only)
   */
  async getAllGenerations(filters?: {
    status?: GenerationStatus;
    model?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Generation[]> {
    let query = supabase
      .from('generations')
      .select('*, users!generations_user_id_fkey(email, full_name)')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.model) {
      query = query.eq('model', filters.model);
    }

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 20) - 1
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching all generations:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Delete generation
   */
  async deleteGeneration(generationId: string): Promise<boolean> {
    const { error } = await supabase
      .from('generations')
      .delete()
      .eq('id', generationId);

    if (error) {
      console.error('Error deleting generation:', error);
      return false;
    }

    return true;
  },

  /**
   * Get generation statistics
   */
  async getGenerationStats(userId?: string): Promise<{
    total: number;
    completed: number;
    failed: number;
    pending: number;
    totalCreditsUsed: number;
  }> {
    let query = supabase.from('generations').select('status, credits_used');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching generation stats:', error);
      return {
        total: 0,
        completed: 0,
        failed: 0,
        pending: 0,
        totalCreditsUsed: 0,
      };
    }

    const stats = (data as any[]).reduce(
      (acc: any, gen: any) => {
        acc.total++;
        if (gen.status === 'completed') acc.completed++;
        if (gen.status === 'failed') acc.failed++;
        if (gen.status === 'pending' || gen.status === 'processing')
          acc.pending++;
        acc.totalCreditsUsed += gen.credits_used || 0;
        return acc;
      },
      {
        total: 0,
        completed: 0,
        failed: 0,
        pending: 0,
        totalCreditsUsed: 0,
      }
    );

    return stats;
  },
};
