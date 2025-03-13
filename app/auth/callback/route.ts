import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Database } from '@/app/types/supabase-types';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    // Criar o cliente do Supabase usando a API oficial do Next.js
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Troca o código de autorização por uma sessão
    await supabase.auth.exchangeCodeForSession(code);
  }
  
  // URL para redirecionar após o login
  return NextResponse.redirect(requestUrl.origin);
} 