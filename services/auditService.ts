import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
type AuditAction = Database['public']['Enums']['audit_action'];

export const auditService = {
  /**
   * Create audit log entry
   */
  async createAuditLog(params: {
    userId?: string;
    adminId?: string;
    action: AuditAction;
    entityType: string;
    entityId?: string;
    beforeState?: any;
    afterState?: any;
    metadata?: any;
  }): Promise<string | null> {
    const { data, error } = await supabase.rpc('create_audit_log', {
      p_user_id: params.userId || null,
      p_admin_id: params.adminId || null,
      p_action: params.action,
      p_entity_type: params.entityType,
      p_entity_id: params.entityId || null,
      p_before_state: params.beforeState || null,
      p_after_state: params.afterState || null,
      p_metadata: params.metadata || {},
    } as any);

    if (error) {
      console.error('Error creating audit log:', error);
      return null;
    }

    return data;
  },

  /**
   * Get audit logs with filters
   */
  async getAuditLogs(filters?: {
    userId?: string;
    adminId?: string;
    action?: AuditAction;
    entityType?: string;
    limit?: number;
    offset?: number;
  }): Promise<AuditLog[]> {
    let query = supabase
      .from('audit_logs')
      .select('*, users!audit_logs_user_id_fkey(email, full_name)')
      .order('created_at', { ascending: false });

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters?.adminId) {
      query = query.eq('admin_id', filters.adminId);
    }

    if (filters?.action) {
      query = query.eq('action', filters.action);
    }

    if (filters?.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 50) - 1
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get audit trail for specific entity
   */
  async getEntityAuditTrail(
    entityType: string,
    entityId: string
  ): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching entity audit trail:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get user activity summary
   */
  async getUserActivitySummary(
    userId: string,
    days: number = 30
  ): Promise<{ action: string; count: number }[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('audit_logs')
      .select('action')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString());

    if (error) {
      console.error('Error fetching user activity:', error);
      return [];
    }

    const summary = (data as any[]).reduce((acc: any, log: any) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(summary).map(([action, count]) => ({
      action,
      count: count as number,
    }));
  },
};
