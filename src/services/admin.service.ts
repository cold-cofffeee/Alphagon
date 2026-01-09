// ============================================
// ADMIN SERVICE
// Admin panel operations and controls
// ============================================

import { supabaseService } from './supabase.service';

class AdminService {
  // ============================================
  // ADMIN ROLES & PERMISSIONS
  // ============================================

  async isAdmin(userId: string): Promise<boolean> {
    try {
      const { data } = await supabaseService['serviceClient']
        .from('admin_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      return !!data;
    } catch {
      return false;
    }
  }

  async getAdminRole(userId: string) {
    const { data, error } = await supabaseService['serviceClient']
      .from('admin_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
  }

  async getAllAdmins() {
    const { data, error } = await supabaseService['serviceClient']
      .from('admin_roles')
      .select(`
        *,
        user_profiles (
          email,
          full_name,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createAdmin(userId: string, role: string, createdBy: string) {
    const { data, error } = await supabaseService['serviceClient']
      .from('admin_roles')
      .insert({
        user_id: userId,
        role,
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) throw error;

    await this.logAdminAction(createdBy, 'admin_created', 'admin', userId, { role });

    return data;
  }

  async updateAdminRole(userId: string, updates: any, updatedBy: string) {
    const { data, error } = await supabaseService['serviceClient']
      .from('admin_roles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    await this.logAdminAction(updatedBy, 'admin_updated', 'admin', userId, updates);

    return data;
  }

  // ============================================
  // USER MANAGEMENT
  // ============================================

  async getAllUsers(filters: any = {}) {
    let query = supabaseService['serviceClient']
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.search) {
      query = query.or(`email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getUserDetails(userId: string) {
    const { data, error } = await supabaseService['serviceClient']
      .from('user_profiles')
      .select(`
        *,
        projects (count),
        ai_generations (count)
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async restrictUser(userId: string, restriction: any, adminId: string) {
    const { data, error } = await supabaseService['serviceClient']
      .from('user_restrictions')
      .insert({
        user_id: userId,
        ...restriction,
        applied_by: adminId,
      })
      .select()
      .single();

    if (error) throw error;

    await this.logAdminAction(adminId, 'user_restricted', 'user', userId, restriction);

    return data;
  }

  async removeUserRestriction(restrictionId: string, adminId: string) {
    const { error } = await supabaseService['serviceClient']
      .from('user_restrictions')
      .update({ is_active: false })
      .eq('id', restrictionId);

    if (error) throw error;

    await this.logAdminAction(adminId, 'restriction_removed', 'restriction', restrictionId);
  }

  // ============================================
  // TOOL MANAGEMENT
  // ============================================

  async getAllTools() {
    const { data, error } = await supabaseService['serviceClient']
      .from('tool_config')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data;
  }

  async getToolConfig(toolName: string) {
    const { data, error } = await supabaseService['serviceClient']
      .from('tool_config')
      .select('*')
      .eq('tool_name', toolName)
      .single();

    if (error) throw error;
    return data;
  }

  async updateToolConfig(toolName: string, updates: any, adminId: string) {
    const { data, error } = await supabaseService['serviceClient']
      .from('tool_config')
      .update({
        ...updates,
        updated_by: adminId,
        updated_at: new Date().toISOString(),
      })
      .eq('tool_name', toolName)
      .select()
      .single();

    if (error) throw error;

    await this.logAdminAction(adminId, 'tool_updated', 'tool', toolName, updates);

    return data;
  }

  // ============================================
  // PROMPT MANAGEMENT
  // ============================================

  async getAllPrompts(toolName?: string) {
    let query = supabaseService['serviceClient']
      .from('prompt_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (toolName) {
      query = query.eq('tool_name', toolName);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getActivePrompt(toolName: string, context?: any) {
    const { data, error } = await supabaseService['serviceClient']
      .rpc('get_active_prompt', {
        p_tool_name: toolName,
        p_region: context?.region,
        p_language: context?.language,
        p_tone: context?.tone,
      });

    if (error) throw error;
    return data;
  }

  async createPrompt(promptData: any, adminId: string) {
    const { data, error } = await supabaseService['serviceClient']
      .from('prompt_templates')
      .insert({
        ...promptData,
        created_by: adminId,
      })
      .select()
      .single();

    if (error) throw error;

    await this.logAdminAction(adminId, 'prompt_created', 'prompt', data.id, promptData);

    return data;
  }

  async updatePrompt(promptId: string, updates: any, adminId: string) {
    const { data, error } = await supabaseService['serviceClient']
      .from('prompt_templates')
      .update(updates)
      .eq('id', promptId)
      .select()
      .single();

    if (error) throw error;

    await this.logAdminAction(adminId, 'prompt_updated', 'prompt', promptId, updates);

    return data;
  }

  async activatePrompt(promptId: string, adminId: string) {
    // First, get the prompt to deactivate others with same tool
    const { data: prompt } = await supabaseService['serviceClient']
      .from('prompt_templates')
      .select('tool_name')
      .eq('id', promptId)
      .single();

    if (!prompt) throw new Error('Prompt not found');

    // Deactivate all other prompts for this tool
    await supabaseService['serviceClient']
      .from('prompt_templates')
      .update({ is_active: false })
      .eq('tool_name', prompt.tool_name);

    // Activate this prompt
    const { data, error } = await supabaseService['serviceClient']
      .from('prompt_templates')
      .update({
        is_active: true,
        activated_at: new Date().toISOString(),
      })
      .eq('id', promptId)
      .select()
      .single();

    if (error) throw error;

    await this.logAdminAction(adminId, 'prompt_activated', 'prompt', promptId);

    return data;
  }

  // ============================================
  // SYSTEM SETTINGS
  // ============================================

  async getAllSettings() {
    const { data, error } = await supabaseService['serviceClient']
      .from('system_settings')
      .select('*')
      .order('setting_key', { ascending: true });

    if (error) throw error;
    return data;
  }

  async getSetting(key: string) {
    const { data, error } = await supabaseService['serviceClient']
      .from('system_settings')
      .select('*')
      .eq('setting_key', key)
      .single();

    if (error) throw error;
    return data;
  }

  async updateSetting(key: string, value: any, adminId: string) {
    const { data, error } = await supabaseService['serviceClient']
      .from('system_settings')
      .update({
        setting_value: value,
        updated_by: adminId,
        updated_at: new Date().toISOString(),
      })
      .eq('setting_key', key)
      .select()
      .single();

    if (error) throw error;

    await this.logAdminAction(adminId, 'setting_updated', 'setting', key, { value });

    return data;
  }

  // ============================================
  // WEBSITE CONTENT
  // ============================================

  async getWebsiteContent(page?: string) {
    let query = supabaseService['serviceClient']
      .from('website_content')
      .select('*')
      .eq('is_active', true);

    if (page) {
      query = query.eq('page', page);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async updateWebsiteContent(contentId: string, updates: any, adminId: string) {
    const { data, error } = await supabaseService['serviceClient']
      .from('website_content')
      .update({
        ...updates,
        updated_by: adminId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contentId)
      .select()
      .single();

    if (error) throw error;

    await this.logAdminAction(adminId, 'content_updated', 'content', contentId, updates);

    return data;
  }

  // ============================================
  // CONTENT MODERATION
  // ============================================

  async getAllFlags(status?: string) {
    let query = supabaseService['serviceClient']
      .from('content_flags')
      .select(`
        *,
        ai_generations (
          generated_content,
          tool_name,
          user_id
        )
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async resolveFlag(flagId: string, resolution: any, adminId: string) {
    const { data, error } = await supabaseService['serviceClient']
      .from('content_flags')
      .update({
        status: 'resolved',
        resolution_notes: resolution.notes,
        resolved_by: adminId,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', flagId)
      .select()
      .single();

    if (error) throw error;

    await this.logAdminAction(adminId, 'flag_resolved', 'flag', flagId, resolution);

    return data;
  }

  // ============================================
  // ANALYTICS & DASHBOARD
  // ============================================

  async getDashboardOverview() {
    const { data, error } = await supabaseService['serviceClient']
      .from('admin_dashboard_overview')
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async getToolUsageStats() {
    const { data, error } = await supabaseService['serviceClient']
      .from('admin_tool_usage_stats')
      .select('*');

    if (error) throw error;
    return data;
  }

  async getAdminLogs(filters: any = {}) {
    let query = supabaseService['serviceClient']
      .from('admin_activity_logs')
      .select(`
        *,
        user_profiles (
          email,
          full_name
        )
      `)
      .order('created_at', { ascending: false });

    if (filters.adminId) {
      query = query.eq('admin_id', filters.adminId);
    }

    if (filters.actionType) {
      query = query.eq('action_type', filters.actionType);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // ============================================
  // ADMIN LOGGING
  // ============================================

  async logAdminAction(
    adminId: string,
    actionType: string,
    targetType?: string,
    targetId?: string,
    details?: any
  ) {
    try {
      await supabaseService['serviceClient']
        .from('admin_activity_logs')
        .insert({
          admin_id: adminId,
          action_type: actionType,
          target_type: targetType,
          target_id: targetId,
          details,
        });
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  }
}

export const adminService = new AdminService();
