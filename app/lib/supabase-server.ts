import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '../types/supabase-types';

/**
 * Função para criar um cliente Supabase para componentes do lado do servidor
 * Deve ser chamada dentro de Server Components ou Route Handlers
 */
export const createServerSupabaseClient = () => 
  createServerComponentClient<Database>({ cookies });

/**
 * Função para criar um cliente Supabase para Route Handlers
 * Deve ser usada em arquivos route.ts no App Router
 */
export const createRouteHandlerSupabaseClient = () => 
  createServerComponentClient<Database>({ cookies });

/**
 * Função auxiliar para obter a sessão do usuário atual no servidor
 */
export async function getServerSession() {
  const supabase = createServerSupabaseClient();
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Erro ao obter sessão:', error);
    return null;
  }
} 