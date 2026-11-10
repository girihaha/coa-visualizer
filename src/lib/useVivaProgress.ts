import { useCallback, useEffect, useState } from 'react';
import { DEVICE_ID, supabase } from '@/lib/supabase';

export type CardStatus = 'known' | 'review';
type SyncState = 'loading' | 'ready' | 'error';

const LOCAL_KEY = 'coa-lab-viva-progress';

function getLocalProgress(): Record<string, CardStatus> {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalProgress(progress: Record<string, CardStatus>) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(progress));
  } catch {
    // ignore
  }
}

export function useVivaProgress() {
  const [progress, setProgress] = useState<Record<string, CardStatus>>(getLocalProgress);
  const [sync, setSync] = useState<SyncState>('ready');

  useEffect(() => {
    let cancelled = false;
    if (!supabase) {
      setSync('ready');
      return;
    }

    (async () => {
      try {
        const { data, error } = await supabase.from('viva_progress').select('card_id, status');
        if (cancelled) return;
        if (error || !Array.isArray(data)) {
          // If remote fails, fallback gracefully to localStorage
          setSync('ready');
          return;
        }
        const next: Record<string, CardStatus> = { ...getLocalProgress() };
        for (const row of data) {
          if (typeof row.card_id === 'string' && (row.status === 'known' || row.status === 'review')) {
            next[row.card_id] = row.status;
          }
        }
        setProgress(next);
        saveLocalProgress(next);
        setSync('ready');
      } catch {
        if (!cancelled) setSync('ready');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const mark = useCallback(async (cardId: string, status: CardStatus) => {
    setProgress((p) => {
      const next = { ...p, [cardId]: status };
      saveLocalProgress(next);
      return next;
    });

    if (supabase) {
      try {
        await supabase
          .from('viva_progress')
          .upsert(
            { device_id: DEVICE_ID, card_id: cardId, status, updated_at: new Date().toISOString() },
            { onConflict: 'device_id,card_id' },
          );
      } catch {
        // remote sync error shouldn't disrupt user
      }
    }
  }, []);

  const reset = useCallback(async () => {
    saveLocalProgress({});
    setProgress({});
    if (supabase) {
      try {
        await supabase.from('viva_progress').delete().eq('device_id', DEVICE_ID);
      } catch {
        // ignore
      }
    }
  }, []);

  return { progress, sync, mark, reset };
}
