'use client';

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '../types/supabase-types';

/**
 * Cliente Supabase para uso em componentes do cliente
 * Utilizado em client components, event handlers, e hooks
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Instância singleton do cliente Supabase para o navegador
// Use apenas quando precisar de uma instância reutilizável
let browserSupabase: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseBrowser() {
  if (!browserSupabase) {
    browserSupabase = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          name: 'sb-auth',
          lifetime: 60 * 60 * 24 * 7, // 7 days
          domain: process.env.NEXT_PUBLIC_DOMAIN,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        },
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    );
  }
  return browserSupabase;
} 