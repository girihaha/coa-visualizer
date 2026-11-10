import { createClient } from '@supabase/supabase-js';

const DEVICE_KEY = 'coa-lab-device-id';

function deviceId(): string {
  const existing = localStorage.getItem(DEVICE_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(DEVICE_KEY, id);
  return id;
}

export const DEVICE_ID = deviceId();

export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
  global: { headers: { 'x-device-id': DEVICE_ID } },
  auth: { persistSession: false },
});
