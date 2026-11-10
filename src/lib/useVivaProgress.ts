import { useCallback, useEffect, useState } from 'react';
import { DEVICE_ID, supabase } from '@/lib/supabase';

export type CardStatus = 'known' | 'review';
type SyncState = 'loading' | 'ready' | 'error';

export function useVivaProgress() {
  const [progress, setProgress] = useState<Record<string, CardStatus>>({});
  const [sync, setSync] = useState<SyncState>('loading');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.from('viva_progress').select('card_id, status');
      if (cancelled) return;
      if (error || !Array.isArray(data)) {
        setSync('error');
        return;
      }
      const next: Record<string, CardStatus> = {};
      for (const row of data) {
        if (typeof row.card_id === 'string' && (row.status === 'known' || row.status === 'review')) next[row.card_id] = row.status;
      }
      setProgress(next);
      setSync('ready');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const mark = useCallback(async (cardId: string, status: CardStatus) => {
    setProgress((p) => ({ ...p, [cardId]: status }));
    const { error } = await supabase
      .from('viva_progress')
      .upsert({ device_id: DEVICE_ID, card_id: cardId, status, updated_at: new Date().toISOString() }, { onConflict: 'device_id,card_id' });
    setSync(error ? 'error' : 'ready');
  }, []);

  const reset = useCallback(async () => {
    const { error } = await supabase.from('viva_progress').delete().eq('device_id', DEVICE_ID);
    if (error) {
      setSync('error');
      return;
    }
    setProgress({});
    setSync('ready');
  }, []);

  return { progress, sync, mark, reset };
}
