import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Plan = Database['public']['Tables']['plans']['Row'];

export const planService = {
  /**
   * Get all active plans
   */
  async getActivePlans(): Promise<Plan[]> {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) {
      console.error('Error fetching plans:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get all plans (admin only)
   */
  async getAllPlans(): Promise<Plan[]> {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('price', { ascending: true });

    if (error) {
      console.error('Error fetching all plans:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get plan by ID
   */
  async getPlan(planId: string): Promise<Plan | null> {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (error) {
      console.error('Error fetching plan:', error);
      return null;
    }

    return data;
  },

  /**
   * Create new plan (admin only)
   */
  async createPlan(plan: {
    name: string;
    credits: number;
    price: number;
    currency?: string;
    stripePriceId?: string;
    metadata?: any;
  }): Promise<Plan | null> {
    const { data, error } = await supabase
      .from('plans')
      .insert({
        name: plan.name,
        credits: plan.credits,
        price: plan.price,
        currency: plan.currency || 'USD',
        stripe_price_id: plan.stripePriceId || null,
        metadata: plan.metadata || {},
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating plan:', error);
      return null;
    }

    return data;
  },

  /**
   * Update plan (admin only)
   */
  async updatePlan(
    planId: string,
    updates: Partial<Omit<Plan, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Plan | null> {
    const { data, error } = await supabase
      .from('plans')
      .update(updates as any)
      .eq('id', planId)
      .select()
      .single();

    if (error) {
      console.error('Error updating plan:', error);
      return null;
    }

    return data;
  },

  /**
   * Toggle plan active status (admin only)
   */
  async togglePlanStatus(planId: string, isActive: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('plans')
      .update({ is_active: isActive } as any)
      .eq('id', planId);

    if (error) {
      console.error('Error toggling plan status:', error);
      return false;
    }

    return true;
  },

  /**
   * Delete plan (admin only)
   */
  async deletePlan(planId: string): Promise<boolean> {
    const { error } = await supabase
      .from('plans')
      .delete()
      .eq('id', planId);

    if (error) {
      console.error('Error deleting plan:', error);
      return false;
    }

    return true;
  },
};
