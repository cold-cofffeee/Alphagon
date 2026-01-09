export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'user' | 'support' | 'admin' | 'super_admin';
export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type TransactionType = 'purchase' | 'usage' | 'refund' | 'bonus' | 'adjustment';
export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'generation' | 'credit_transaction' | 'ban' | 'unban' | 'role_change';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          full_name: string | null;
          avatar_url: string | null;
          credits: number;
          total_generations: number;
          is_banned: boolean;
          ban_reason: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
          last_login_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          role?: UserRole;
          full_name?: string | null;
          avatar_url?: string | null;
          credits?: number;
          total_generations?: number;
          is_banned?: boolean;
          ban_reason?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
          last_login_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          role?: UserRole;
          full_name?: string | null;
          avatar_url?: string | null;
          credits?: number;
          total_generations?: number;
          is_banned?: boolean;
          ban_reason?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
          last_login_at?: string | null;
          deleted_at?: string | null;
        };
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          ip_address: string | null;
          user_agent: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          ip_address?: string | null;
          user_agent?: string | null;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          expires_at?: string;
          created_at?: string;
        };
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: TransactionType;
          description: string | null;
          reference_id: string | null;
          admin_id: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          type: TransactionType;
          description?: string | null;
          reference_id?: string | null;
          admin_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          type?: TransactionType;
          description?: string | null;
          reference_id?: string | null;
          admin_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      plans: {
        Row: {
          id: string;
          name: string;
          credits: number;
          price: number;
          currency: string;
          stripe_price_id: string | null;
          is_active: boolean;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          credits: number;
          price: number;
          currency?: string;
          stripe_price_id?: string | null;
          is_active?: boolean;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          credits?: number;
          price?: number;
          currency?: string;
          stripe_price_id?: string | null;
          is_active?: boolean;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      generations: {
        Row: {
          id: string;
          user_id: string;
          prompt: string;
          model: string;
          status: GenerationStatus;
          result: Json | null;
          error_message: string | null;
          credits_used: number;
          processing_time_ms: number | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          prompt: string;
          model: string;
          status?: GenerationStatus;
          result?: Json | null;
          error_message?: string | null;
          credits_used?: number;
          processing_time_ms?: number | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          prompt?: string;
          model?: string;
          status?: GenerationStatus;
          result?: Json | null;
          error_message?: string | null;
          credits_used?: number;
          processing_time_ms?: number | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      vault_versions: {
        Row: {
          id: string;
          generation_id: string;
          user_id: string;
          version_number: number;
          content: Json;
          changes_description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          generation_id: string;
          user_id: string;
          version_number: number;
          content: Json;
          changes_description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          generation_id?: string;
          user_id?: string;
          version_number?: number;
          content?: Json;
          changes_description?: string | null;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          admin_id: string | null;
          action: AuditAction;
          entity_type: string;
          entity_id: string | null;
          before_state: Json | null;
          after_state: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          admin_id?: string | null;
          action: AuditAction;
          entity_type: string;
          entity_id?: string | null;
          before_state?: Json | null;
          after_state?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          admin_id?: string | null;
          action?: AuditAction;
          entity_type?: string;
          entity_id?: string | null;
          before_state?: Json | null;
          after_state?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      ai_usage: {
        Row: {
          id: string;
          user_id: string;
          model: string;
          prompt_tokens: number;
          completion_tokens: number;
          total_tokens: number;
          cost: number;
          generation_id: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          model: string;
          prompt_tokens: number;
          completion_tokens: number;
          total_tokens: number;
          cost: number;
          generation_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          model?: string;
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
          cost?: number;
          generation_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      risk_flags: {
        Row: {
          id: string;
          user_id: string;
          flag_type: string;
          severity: string;
          description: string;
          is_resolved: boolean;
          resolved_by: string | null;
          resolved_at: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          flag_type: string;
          severity: string;
          description: string;
          is_resolved?: boolean;
          resolved_by?: string | null;
          resolved_at?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          flag_type?: string;
          severity?: string;
          description?: string;
          is_resolved?: boolean;
          resolved_by?: string | null;
          resolved_at?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      feature_flags: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          is_enabled: boolean;
          rollout_percentage: number;
          target_users: string[] | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          is_enabled?: boolean;
          rollout_percentage?: number;
          target_users?: string[] | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          is_enabled?: boolean;
          rollout_percentage?: number;
          target_users?: string[] | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      add_credits: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_type: TransactionType;
          p_description?: string;
          p_admin_id?: string;
        };
        Returns: string;
      };
      deduct_credits: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_description?: string;
          p_generation_id?: string;
        };
        Returns: string;
      };
      create_audit_log: {
        Args: {
          p_user_id?: string;
          p_admin_id?: string;
          p_action: AuditAction;
          p_entity_type: string;
          p_entity_id?: string;
          p_before_state?: Json;
          p_after_state?: Json;
          p_metadata?: Json;
        };
        Returns: string;
      };
    };
    Enums: {
      user_role: UserRole;
      generation_status: GenerationStatus;
      transaction_type: TransactionType;
      audit_action: AuditAction;
    };
  };
}
