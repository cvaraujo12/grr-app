// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Database } from '@/app/types/supabase-types'

export async function middleware(req: NextRequest) {
  try {
    // Criar resposta inicial
    const res = NextResponse.next()
    
    // Criar cliente do Supabase para middleware
    const supabase = createMiddlewareClient<Database>({ req, res })
    
    // Atualizar a sessão se existir um token de atualização
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Erro ao obter sessão:', error)
      return res
    }

    // Se não houver sessão e a rota não for pública, redirecionar para o login
    const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                      req.nextUrl.pathname.startsWith('/auth') ||
                      req.nextUrl.pathname.startsWith('/api')

    if (!session && !isAuthPage) {
      const redirectUrl = new URL('/login', req.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Se houver sessão e estiver na página de login, redirecionar para home
    if (session && isAuthPage) {
      const redirectUrl = new URL('/', req.url)
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (e) {
    console.error('Erro no middleware:', e)
    return NextResponse.next()
  }
}

// Configurar quais rotas o middleware deve processar
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}