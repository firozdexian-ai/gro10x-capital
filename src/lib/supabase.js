import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase env variables are missing. Please check .env.local');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

/**
 * Service Role Supabase client for secure backend API routes.
 * Bypasses RLS for administrative tasks like creating auth users, assigning roles, and clearing escrow.
 */
export function getServiceSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is not set. Falling back to public anonymous client.');
    return supabase;
  }
  return createClient(supabaseUrl || '', serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export const supabaseAdmin = typeof window === 'undefined' ? getServiceSupabase() : supabase;
