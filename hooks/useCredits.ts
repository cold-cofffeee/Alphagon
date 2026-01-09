import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { creditService } from '../services';

export const useCredits = () => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const userCredits = await creditService.hasEnoughCredits(user.id, 0);
      // Get actual credit count
      const balance = await creditService.getTransactions(user.id, 1);
      setCredits(balance[0]?.amount || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, [user]);

  return {
    credits,
    loading,
    error,
    refetch: fetchCredits,
  };
};
