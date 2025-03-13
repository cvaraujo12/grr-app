// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Database } from '@/app/types/supabase-types'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Criar cliente do Supabase para middleware
  const supabase = createMiddlewareClient<Database>({ req, res })
  
  // Atualizar a sessão se existir um token de atualização
  await supabase.auth.getSession()
  
  return res
}

// Definir quais caminhos este middleware deve ser executado
export const config = {
  matcher: [
    // Requer autenticação para todas as rotas exceto as públicas
    '/',
    '/((?!login|cadastro|api|_next/static|_next/image|favicon.ico|auth/callback).*)',
  ],
}