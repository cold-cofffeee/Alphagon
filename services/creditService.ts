import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type CreditTransaction = Database['public']['Tables']['credit_transactions']['Row'];
type TransactionType = Database['public']['Enums']['transaction_type'];

export const creditService = {
  /**
   * Add credits to user account
   */
  async addCredits(
    userId: string,
    amount: number,
    type: TransactionType,
    description?: string,
    adminId?: string
  ): Promise<string | null> {
    const { data, error } = await supabase.rpc('add_credits', {
      p_user_id: userId,
      p_amount: amount,
      p_type: type,
      p_description: description || null,
      p_admin_id: adminId || null,
    } as any);

    if (error) {
      console.error('Error adding credits:', error);
      return null;
    }

    return data;
  },

  /**
   * Deduct credits from user account
   */
  async deductCredits(
    userId: string,
    amount: number,
    description?: string,
    generationId?: string
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('deduct_credits', {
        p_user_id: userId,
        p_amount: amount,
        p_description: description || null,
        p_generation_id: generationId || null,
      } as any);

      if (error) {
        console.error('Error deducting credits:', error);
        return null;
      }

      return data;
    } catch (err: any) {
      if (err.message?.includes('Insufficient credits')) {
        throw new Error('Insufficient credits');
      }
      throw err;
    }
  },

  /**
   * Get user's credit transactions
   */
  async getTransactions(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<CreditTransaction[]> {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get all credit transactions (admin only)
   */
  async getAllTransactions(filters?: {
    type?: TransactionType;
    userId?: string;
    limit?: number;
    offset?: number;
  }): Promise<CreditTransaction[]> {
    let query = supabase
      .from('credit_transactions')
      .select('*, users!credit_transactions_user_id_fkey(email, full_name)')
      .order('created_at', { ascending: false });

    if (filters?.type) {
      query = query.eq('type', filters.type);
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
        filters.offset + (filters.limit || 50) - 1
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching all transactions:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Process refund
   */
  async refundCredits(
    userId: string,
    amount: number,
    reason: string,
    adminId: string
  ): Promise<boolean> {
    const transactionId = await this.addCredits(
      userId,
      amount,
      'refund',
      `Refund: ${reason}`,
      adminId
    );

    return !!transactionId;
  },

  /**
   * Check if user has enough credits
   */
  async hasEnoughCredits(userId: string, amount: number): Promise<boolean> {
    const { data, error } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking credits:', error);
      return false;
    }

    return (data?.credits || 0) >= amount;
  },

  /**
   * Get credit statistics (admin only)
   */
  async getCreditStats(): Promise<{
    totalCreditsIssued: number;
    totalCreditsUsed: number;
    totalRevenue: number;
  }> {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('amount, type');

    if (error) {
      console.error('Error fetching credit stats:', error);
      return { totalCreditsIssued: 0, totalCreditsUsed: 0, totalRevenue: 0 };
    }

    const stats = (data as any[]).reduce(
      (acc: any, tx: any) => {
        if (tx.type === 'purchase' || tx.type === 'bonus') {
          acc.totalCreditsIssued += tx.amount;
        } else if (tx.type === 'usage') {
          acc.totalCreditsUsed += Math.abs(tx.amount);
        }
        return acc;
      },
      { totalCreditsIssued: 0, totalCreditsUsed: 0, totalRevenue: 0 }
    );

    return stats;
  },
};
