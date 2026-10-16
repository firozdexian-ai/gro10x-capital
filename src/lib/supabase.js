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

/**
 * Executes a PostgreSQL RPC function safely.
 * Returns { data, error, isRpcAvailable }.
 * If the function does not exist in the database yet (PGRST202), isRpcAvailable is false.
 */
export async function safeRpc(functionName, params = {}, client = supabase) {
  try {
    const { data, error } = await client.rpc(functionName, params);
    if (error) {
      const isMissing = error.code === 'PGRST202' || error.message?.includes('function') || error.code === '42883';
      return { data: null, error, isRpcAvailable: !isMissing };
    }
    return { data, error: null, isRpcAvailable: true };
  } catch (err) {
    return { data: null, error: err, isRpcAvailable: false };
  }
}
