import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CreditResponse {
  credit: number;
}

export const useCredits = () => {
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInsufficientCredits, setHasInsufficientCredits] = useState(false);
  const { toast } = useToast();

  const fetchCredits = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://my-fastapi-service-608954479960.us-central1.run.app/find_credit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch credits');
      }

      const data: CreditResponse = await response.json();
      setCredits(data.credit);
      setHasInsufficientCredits(data.credit <= 0);
      
      if (data.credit <= 0) {
        toast({
          title: "No Credits Available",
          description: "Please recharge to continue using the service",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
      toast({
        title: "Error",
        description: "Failed to fetch credit information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  const checkCreditsBeforeAction = async (action: () => void | Promise<void>) => {
    if (hasInsufficientCredits) {
      toast({
        title: "No Credits Available",
        description: "Please recharge to continue using the service",
        variant: "destructive",
      });
      return;
    }

    // Refresh credits before action
    await fetchCredits();
    
    if (hasInsufficientCredits) {
      return;
    }

    await action();
  };

  return {
    credits,
    isLoading,
    hasInsufficientCredits,
    fetchCredits,
    checkCreditsBeforeAction
  };
};