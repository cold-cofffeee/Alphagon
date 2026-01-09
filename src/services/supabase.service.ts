// ============================================
// SUPABASE CLIENT SERVICE
// Handles all database operations
// ============================================

import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { config } from '../config';
import {
  UserProfile,
  Project,
  AIGeneration,
  ErrorLog,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '../types';

class SupabaseService {
  private client: SupabaseClient;
  private serviceClient: SupabaseClient;

  constructor() {
    // Client with anon key (for client-side operations)
    this.client = createClient(
      config.supabase.url,
      config.supabase.anonKey
    );

    // Client with service role key (for admin operations)
    this.serviceClient = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey
    );
  }

  // ============================================
  // AUTHENTICATION
  // ============================================

  async signUp(email: string, password: string, fullName?: string) {
    // Use service role client to bypass email confirmation
    const { data, error } = await this.serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName || '',
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error('User creation failed');
    
    // Create user profile immediately
    await this.createUserProfile({
      id: data.user.id,
      email: data.user.email!,
      full_name: fullName || '',
    });
    
    // Sign in the user immediately to get session
    const { data: sessionData, error: signInError } = await this.client.auth.signInWithPassword({
      email,
      password,
    });
    
    if (signInError) throw signInError;
    
    return sessionData;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }

  async getUser(token: string): Promise<User | null> {
    const { data: { user }, error } = await this.client.auth.getUser(token);
    if (error) throw error;
    return user;
  }

  // ============================================
  // USER PROFILES
  // ============================================

  async createUserProfile(profile: { id: string; email: string; full_name?: string }): Promise<UserProfile | null> {
    const { data, error } = await this.serviceClient
      .from('user_profiles')
      .insert({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name || null,
      })
      .select()
      .single();

    if (error) {
      // Ignore if profile already exists
      if (error.code === '23505') return null;
      throw error;
    }
    return data;
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.client
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile> {
    const { data, error } = await this.client
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ============================================
  // PROJECTS
  // ============================================

  async createProject(
    userId: string,
    projectData: CreateProjectRequest
  ): Promise<Project> {
    const { data, error } = await this.client
      .from('projects')
      .insert({
        user_id: userId,
        ...projectData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getProject(projectId: string, userId: string): Promise<Project | null> {
    const { data, error } = await this.client
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  async getUserProjects(
    userId: string,
    status: 'active' | 'archived' | 'deleted' = 'active'
  ): Promise<Project[]> {
    const { data, error } = await this.client
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .eq('status', status)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateProject(
    projectId: string,
    userId: string,
    updates: UpdateProjectRequest
  ): Promise<Project> {
    const { data, error } = await this.client
      .from('projects')
      .update({
        ...updates,
        last_accessed_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteProject(projectId: string, userId: string): Promise<void> {
    const { error } = await this.client
      .from('projects')
      .update({ status: 'deleted' })
      .eq('id', projectId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  // ============================================
  // AI GENERATIONS (with caching)
  // ============================================

  async checkGenerationCache(inputHash: string, toolName: string): Promise<AIGeneration | null> {
    const { data, error } = await this.client
      .from('ai_generations')
      .select('*')
      .eq('input_hash', inputHash)
      .eq('tool_name', toolName)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Cache check error:', error);
      return null;
    }
    return data;
  }

  async saveGeneration(generationData: Partial<AIGeneration>): Promise<AIGeneration> {
    const { data, error } = await this.client
      .from('ai_generations')
      .insert(generationData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getProjectGenerations(
    projectId: string,
    userId: string
  ): Promise<AIGeneration[]> {
    const { data, error } = await this.client
      .from('ai_generations')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async rateGeneration(
    generationId: string,
    userId: string,
    rating: number,
    feedback?: string
  ): Promise<void> {
    const { error } = await this.client
      .from('ai_generations')
      .update({
        user_rating: rating,
        user_feedback: feedback,
      })
      .eq('id', generationId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  // ============================================
  // ERROR LOGGING
  // ============================================

  async logError(errorData: Partial<ErrorLog>): Promise<void> {
    try {
      await this.serviceClient
        .from('error_logs')
        .insert(errorData);
    } catch (error) {
      console.error('Failed to log error to database:', error);
    }
  }

  // ============================================
  // USAGE STATS
  // ============================================

  async getUserStats(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await this.client
      .from('usage_stats')
      .select('*')
      .eq('user_id', userId)
      .gte('stat_date', startDate.toISOString().split('T')[0])
      .order('stat_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // ============================================
  // DASHBOARD STATS
  // ============================================

  async getDashboardStats(userId: string) {
    const { data, error } = await this.client
      .from('user_dashboard_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Dashboard stats error:', error);
      // Return default stats if view doesn't exist yet
      return {
        total_projects: 0,
        total_generations: 0,
        active_projects: 0,
        total_tokens_used: 0,
        this_month_generations: 0,
      };
    }
    return data;
  }
}

export const supabaseService = new SupabaseService();
