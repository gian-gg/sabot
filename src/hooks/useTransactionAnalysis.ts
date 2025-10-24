'use client';

import { useEffect, useState } from 'react';
import type { AnalysisData } from '@/types/analysis';

interface UseTransactionAnalysisReturn {
  buyerAnalysis: AnalysisData | null;
  sellerAnalysis: AnalysisData | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch analysis data for both buyer and seller
 * In production, this would query from the database
 */
export function useTransactionAnalysis(
  transactionId: string
): UseTransactionAnalysisReturn {
  const [buyerAnalysis, setBuyerAnalysis] = useState<AnalysisData | null>(null);
  const [sellerAnalysis, setSellerAnalysis] = useState<AnalysisData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!transactionId) {
      setLoading(false);
      return;
    }

    const fetchAnalyses = async () => {
      try {
        setLoading(true);

        // In production, this would be a real API call
        // For now, use mock data that matches the component's expectations
        const response = await fetch(
          `/api/transaction/${transactionId}/analyses`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch analyses');
        }

        const data = await response.json();
        setBuyerAnalysis(data.buyerAnalysis || null);
        setSellerAnalysis(data.sellerAnalysis || null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Error fetching transaction analyses:', error);

        // Use default mock data on error
        setBuyerAnalysis(getDefaultBuyerAnalysis());
        setSellerAnalysis(getDefaultSellerAnalysis());
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, [transactionId]);

  return {
    buyerAnalysis,
    sellerAnalysis,
    loading,
    error,
  };
}

/**
 * Default mock analysis data for buyer
 */
function getDefaultBuyerAnalysis(): AnalysisData {
  return {
    user_id: 'buyer-user-id',
    platform: 'whatsapp',
    transactionType: 'meetup',
    productType: 'iPhone 15',
    productModel: 'Pro Max',
    productCondition: 'Like New',
    proposedPrice: 450,
    currency: 'USD',
    quantity: 1,
    meetingLocation: 'Downtown Coffee Shop',
    meetingSchedule: new Date(Date.now() + 86400000)
      .toISOString()
      .split('.')[0],
    riskFlags: [],
    confidence: 0.95,
    screenshot_url: 'https://via.placeholder.com/400x300?text=Buyer+Screenshot',
  };
}

/**
 * Default mock analysis data for seller
 */
function getDefaultSellerAnalysis(): AnalysisData {
  return {
    user_id: 'seller-user-id',
    platform: 'whatsapp',
    transactionType: 'meetup',
    productType: 'iPhone 15',
    productModel: 'Pro Max',
    productCondition: 'Good',
    proposedPrice: 450,
    currency: 'USD',
    quantity: 1,
    meetingLocation: 'Downtown Coffee Shop',
    meetingSchedule: new Date(Date.now() + 86400000)
      .toISOString()
      .split('.')[0],
    riskFlags: [],
    confidence: 0.92,
    screenshot_url:
      'https://via.placeholder.com/400x300?text=Seller+Screenshot',
  };
}
