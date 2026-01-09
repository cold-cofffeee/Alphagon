import { supabase } from '../lib/supabase';
import { creditService } from './creditService';
import { generationService } from './generationService';
import { auditService } from './auditService';

export const authService = {
  /**
   * Sign up new user
   */
  async signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || null,
        },
      },
    });

    if (error) {
      console.error('Error signing up:', error);
      throw error;
    }

    // Give new user welcome credits
    if (data.user) {
      await creditService.addCredits(
        data.user.id,
        50,
        'bonus',
        'Welcome bonus'
      );

      await auditService.createAuditLog({
        userId: data.user.id,
        action: 'create',
        entityType: 'user',
        entityId: data.user.id,
        afterState: { email, full_name: fullName },
        metadata: { source: 'signup' },
      });
    }

    return data;
  },

  /**
   * Sign in user
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error signing in:', error);
      throw error;
    }

    // Update last login
    if (data.user) {
      await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() } as any)
        .eq('id', data.user.id);

      await auditService.createAuditLog({
        userId: data.user.id,
        action: 'login',
        entityType: 'session',
        metadata: { method: 'password' },
      });
    }

    return data;
  },

  /**
   * Sign out user
   */
  async signOut() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await auditService.createAuditLog({
        userId: user.id,
        action: 'logout',
        entityType: 'session',
      });
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },

  /**
   * Update password
   */
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('Error updating password:', error);
      throw error;
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await auditService.createAuditLog({
        userId: user.id,
        action: 'update',
        entityType: 'user',
        entityId: user.id,
        metadata: { field: 'password' },
      });
    }
  },

  /**
   * Get current session
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session:', error);
      return null;
    }

    return data.session;
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Error getting user:', error);
      return null;
    }

    return user;
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return !!session;
  },

  /**
   * Check if user has admin role
   */
  async isAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user) return false;

    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    return data?.role === 'admin' || data?.role === 'super_admin';
  },

  /**
   * Check if user is banned
   */
  async isBanned(): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user) return false;

    const { data } = await supabase
      .from('users')
      .select('is_banned')
      .eq('id', user.id)
      .single();

    return data?.is_banned || false;
  },
};
