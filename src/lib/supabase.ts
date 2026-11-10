import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const DEVICE_KEY = 'coa-lab-device-id';

function deviceId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_KEY);
    if (existing) return existing;
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `dev-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(DEVICE_KEY, id);
    return id;
  } catch {
    return 'fallback-device-id';
  }
}

export const DEVICE_ID = deviceId();

const url = import.meta.env.VITE_SUPABASE_URL || 'https://uloqbbvalwelbchwrquo.supabase.co';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsb3FiYnZhbHdlbGJjaHdycXVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4MTk4NDQsImV4cCI6MjEwOTM5NTg0NH0.-k0KKrMzIWu1eMNpGa1QJhODQDntUcVsoGDYMotDgA8';

let client: SupabaseClient | null = null;
try {
  if (url && anonKey) {
    client = createClient(url, anonKey, {
      global: { headers: { 'x-device-id': DEVICE_ID } },
      auth: { persistSession: false },
    });
  }
} catch {
  client = null;
}

export const supabase = client;
