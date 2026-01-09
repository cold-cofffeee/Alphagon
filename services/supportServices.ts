import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type VaultVersion = Database['public']['Tables']['vault_versions']['Row'];
type FeatureFlag = Database['public']['Tables']['feature_flags']['Row'];
type RiskFlag = Database['public']['Tables']['risk_flags']['Row'];
type AIUsage = Database['public']['Tables']['ai_usage']['Row'];

export const vaultService = {
  /**
   * Create new vault version
   */
  async createVersion(
    generationId: string,
    userId: string,
    content: any,
    changesDescription?: string
  ): Promise<VaultVersion | null> {
    // Get current version number
    const { data: versions } = await supabase
      .from('vault_versions')
      .select('version_number')
      .eq('generation_id', generationId)
      .order('version_number', { ascending: false })
      .limit(1);

    const nextVersion = (versions as any)?.[0]?.version_number
      ? (versions as any)[0].version_number + 1
      : 1;

    const { data, error } = await supabase
      .from('vault_versions')
      .insert({
        generation_id: generationId,
        user_id: userId,
        version_number: nextVersion,
        content,
        changes_description: changesDescription || null,
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating vault version:', error);
      return null;
    }

    return data;
  },

  /**
   * Get all versions for a generation
   */
  async getVersions(generationId: string): Promise<VaultVersion[]> {
    const { data, error } = await supabase
      .from('vault_versions')
      .select('*')
      .eq('generation_id', generationId)
      .order('version_number', { ascending: false });

    if (error) {
      console.error('Error fetching versions:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get specific version
   */
  async getVersion(
    generationId: string,
    versionNumber: number
  ): Promise<VaultVersion | null> {
    const { data, error } = await supabase
      .from('vault_versions')
      .select('*')
      .eq('generation_id', generationId)
      .eq('version_number', versionNumber)
      .single();

    if (error) {
      console.error('Error fetching version:', error);
      return null;
    }

    return data;
  },
};

export const featureFlagService = {
  /**
   * Check if feature is enabled for user
   */
  async isFeatureEnabled(
    featureName: string,
    userId?: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('name', featureName)
      .single();

    const dataAny = data as any;
    if (!dataAny) return false;
    if (!dataAny.is_enabled) return false;

    // Check if user is in target list
    if (userId && dataAny.target_users?.includes(userId)) return true;

    // Check rollout percentage
    if (dataAny.rollout_percentage === 100) return true;
    if (dataAny.rollout_percentage === 0) return false;

    // Use deterministic hash for consistent rollout
    if (userId) {
      const hash = userId
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return (hash % 100) < dataAny.rollout_percentage;
    }

    return false;
  },

  /**
   * Get all feature flags (admin only)
   */
  async getAllFlags(): Promise<FeatureFlag[]> {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching feature flags:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Update feature flag (admin only)
   */
  async updateFlag(
    flagId: string,
    updates: Partial<Omit<FeatureFlag, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<boolean> {
    const { error } = await supabase
      .from('feature_flags')
      .update(updates as any)
      .eq('id', flagId);

    if (error) {
      console.error('Error updating feature flag:', error);
      return false;
    }

    return true;
  },
};

export const riskService = {
  /**
   * Create risk flag
   */
  async createRiskFlag(
    userId: string,
    flagType: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    description: string,
    metadata?: any
  ): Promise<RiskFlag | null> {
    const { data, error } = await supabase
      .from('risk_flags')
      .insert({
        user_id: userId,
        flag_type: flagType,
        severity,
        description,
        metadata: metadata || {},
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating risk flag:', error);
      return null;
    }

    return data;
  },

  /**
   * Get user risk flags
   */
  async getUserRiskFlags(userId: string): Promise<RiskFlag[]> {
    const { data, error } = await supabase
      .from('risk_flags')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching risk flags:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Resolve risk flag
   */
  async resolveRiskFlag(
    flagId: string,
    resolvedBy: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('risk_flags')
      .update({
        is_resolved: true,
        resolved_by: resolvedBy,
        resolved_at: new Date().toISOString(),
      } as any)
      .eq('id', flagId);

    if (error) {
      console.error('Error resolving risk flag:', error);
      return false;
    }

    return true;
  },

  /**
   * Get all unresolved risk flags (admin only)
   */
  async getUnresolvedFlags(): Promise<RiskFlag[]> {
    const { data, error } = await supabase
      .from('risk_flags')
      .select('*, users!risk_flags_user_id_fkey(email, full_name)')
      .eq('is_resolved', false)
      .order('severity')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching unresolved flags:', error);
      return [];
    }

    return data || [];
  },
};

export const aiUsageService = {
  /**
   * Track AI usage
   */
  async trackUsage(
    userId: string,
    model: string,
    promptTokens: number,
    completionTokens: number,
    cost: number,
    generationId?: string,
    metadata?: any
  ): Promise<AIUsage | null> {
    const { data, error } = await supabase
      .from('ai_usage')
      .insert({
        user_id: userId,
        model,
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: promptTokens + completionTokens,
        cost,
        generation_id: generationId || null,
        metadata: metadata || {},
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Error tracking AI usage:', error);
      return null;
    }

    return data;
  },

  /**
   * Get AI usage statistics (admin only)
   */
  async getUsageStats(filters?: {
    userId?: string;
    model?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalTokens: number;
    totalCost: number;
    totalRequests: number;
    byModel: Record<string, { tokens: number; cost: number; requests: number }>;
  }> {
    let query = supabase.from('ai_usage').select('*');

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters?.model) {
      query = query.eq('model', filters.model);
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching usage stats:', error);
      return {
        totalTokens: 0,
        totalCost: 0,
        totalRequests: 0,
        byModel: {},
      };
    }

    const stats = (data as any[]).reduce(
      (acc: any, usage: any) => {
        acc.totalTokens += usage.total_tokens;
        acc.totalCost += parseFloat(usage.cost.toString());
        acc.totalRequests++;

        if (!acc.byModel[usage.model]) {
          acc.byModel[usage.model] = { tokens: 0, cost: 0, requests: 0 };
        }
        acc.byModel[usage.model].tokens += usage.total_tokens;
        acc.byModel[usage.model].cost += parseFloat(usage.cost.toString());
        acc.byModel[usage.model].requests++;

        return acc;
      },
      { totalTokens: 0, totalCost: 0, totalRequests: 0, byModel: {} }
    );

    return stats;
  },
};
