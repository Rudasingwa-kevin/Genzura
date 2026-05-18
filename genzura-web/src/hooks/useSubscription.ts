import { useState, useEffect } from 'react';
import { subscriptionService, SubscriptionLimits } from '../api/services/subscription.service';
import { useAuth } from '../contexts/AuthContext';

export function useSubscription() {
  const { user } = useAuth();
  const [limits, setLimits] = useState<SubscriptionLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLimits = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await subscriptionService.getLimits();
      setLimits(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching subscription limits:', err);
      setError(err.response?.data?.error || 'Failed to fetch subscription limits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLimits();
  }, [user]);

  const checkCaseLimit = async () => {
    try {
      return await subscriptionService.checkCaseLimit();
    } catch (err: any) {
      console.error('Error checking case limit:', err);
      return {
        allowed: false,
        reason: err.response?.data?.error || 'Failed to check case limit'
      };
    }
  };

  const checkDocumentLimit = async () => {
    try {
      return await subscriptionService.checkDocumentLimit();
    } catch (err: any) {
      console.error('Error checking document limit:', err);
      return {
        allowed: false,
        reason: err.response?.data?.error || 'Failed to check document limit'
      };
    }
  };

  const checkDownloadPermission = async () => {
    try {
      return await subscriptionService.checkDownloadPermission();
    } catch (err: any) {
      console.error('Error checking download permission:', err);
      return {
        allowed: false,
        reason: err.response?.data?.error || 'Failed to check download permission'
      };
    }
  };

  const upgrade = async (plan: 'Intango' | 'Inkingi') => {
    try {
      const result = await subscriptionService.upgrade(plan);
      // Refresh limits after upgrade
      await fetchLimits();
      return result;
    } catch (err: any) {
      console.error('Error upgrading subscription:', err);
      throw new Error(err.response?.data?.error || 'Failed to upgrade subscription');
    }
  };

  return {
    limits,
    loading,
    error,
    checkCaseLimit,
    checkDocumentLimit,
    checkDownloadPermission,
    upgrade,
    refresh: fetchLimits
  };
}
