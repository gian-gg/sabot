import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function useTransactionDeletionListener(transactionId: string | null) {
  useEffect(() => {
    if (!transactionId) return;

    const supabase = createClient();
    const channel = supabase.channel(`transaction:${transactionId}`);

    channel
      .on('broadcast', { event: 'transaction_deleted' }, () => {
        toast.warning('This transaction has been deleted by the creator', {
          duration: 5000,
        });
        setTimeout(() => {
          window.location.href = '/user';
        }, 2000);
      })
      .on('broadcast', { event: 'transaction_cancelled' }, () => {
        toast.warning('This transaction has been cancelled by the creator', {
          duration: 5000,
        });
        setTimeout(() => {
          window.location.href = '/user';
        }, 2000);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [transactionId]);
}
