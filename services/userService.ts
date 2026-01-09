import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export const userService = {
  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .is('deleted_at', null)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data;
  },

  /**
   * Get all users (admin only)
   */
  async getAllUsers(filters?: {
    role?: string;
    isBanned?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<User[]> {
    let query = supabase
      .from('users')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (filters?.role) {
      query = query.eq('role', filters.role);
    }

    if (filters?.isBanned !== undefined) {
      query = query.eq('is_banned', filters.isBanned);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Update user profile
   */
  async updateUser(userId: string, updates: UserUpdate): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .update(updates as any)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }

    return data;
  },

  /**
   * Ban/unban user (admin only)
   */
  async toggleBan(userId: string, isBanned: boolean, reason?: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({
        is_banned: isBanned,
        ban_reason: reason || null,
      } as any)
      .eq('id', userId);

    if (error) {
      console.error('Error toggling ban:', error);
      return false;
    }

    return true;
  },

  /**
   * Update user role (admin only)
   */
  async updateRole(userId: string, role: Database['public']['Enums']['user_role']): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({ role } as any)
      .eq('id', userId);

    if (error) {
      console.error('Error updating role:', error);
      return false;
    }

    return true;
  },

  /**
   * Get user credits
   */
  async getCredits(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching credits:', error);
      return 0;
    }

    return data?.credits || 0;
  },

  /**
   * Soft delete user
   */
  async deleteUser(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({ deleted_at: new Date().toISOString() } as any)
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }

    return true;
  },

  /**
   * Search users
   */
  async searchUsers(query: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
      .is('deleted_at', null)
      .limit(20);

    if (error) {
      console.error('Error searching users:', error);
      return [];
    }

    return data || [];
  },
};
