import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '../types/supabase-types';

/**
 * Cliente Supabase para componentes do lado do cliente
 * Esta versão usa as helpers oficiais do Next.js que lidam melhor
 * com autenticação e sessões no App Router
 */
export const supabase = createClientComponentClient<Database>({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
}); 