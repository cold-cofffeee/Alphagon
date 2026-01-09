import { useState } from 'react';
import { enhancedGeminiService } from '../services/enhancedGeminiService';
import { useAuth } from '../contexts/AuthContext';

interface GenerateOptions {
  prompt: string;
  model?: string;
  creditsRequired?: number;
}

export const useGeneration = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (options: GenerateOptions) => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await enhancedGeminiService.generateWithTracking({
        userId: user.id,
        ...options,
      });

      if (!result.success) {
        setError(result.error || 'Generation failed');
        return null;
      }

      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const retry = async (generationId: string) => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await enhancedGeminiService.retryGeneration(
        generationId,
        user.id
      );

      if (!result.success) {
        setError(result.error || 'Retry failed');
        return null;
      }

      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generate,
    retry,
    loading,
    error,
  };
};
