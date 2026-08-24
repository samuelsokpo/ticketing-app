import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

// Guard: only create a real client if valid credentials exist
const isConfigured = supabaseUrl.startsWith('http') && supabaseAnonKey.length > 0;

export const supabase: SupabaseClient = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (new Proxy({} as SupabaseClient, {
      get(_, prop) {
        if (prop === 'auth') {
          return {
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            signInWithOAuth: () => Promise.resolve({ error: { message: 'Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local' } }),
            signInWithPassword: () => Promise.resolve({ error: { message: 'Supabase not configured.' } }),
            signUp: () => Promise.resolve({ error: { message: 'Supabase not configured.' } }),
            signOut: () => Promise.resolve({ error: null }),
          };
        }
        return () => {};
      },
    }));

export { isConfigured as isSupabaseConfigured };
