import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/app/types/supabase-types';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const body = await request.json();
    
    if (body.action === 'check') {
      // Verificar conexão com o Supabase
      const { data: authSettings, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        return NextResponse.json({ 
          status: 'error', 
          message: 'Erro ao conectar com o Supabase Auth',
          error: authError 
        }, { status: 500 });
      }
      
      // Verificar URL e chave
      return NextResponse.json({ 
        status: 'success',
        message: 'Conexão com Supabase Auth OK',
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        keyExists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        session: authSettings
      });
    }
    
    if (body.action === 'test-signup') {
      const { email, password } = body;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_URL || 'https://stayv2.vercel.app'}/auth/callback`,
        }
      });
      
      if (error) {
        return NextResponse.json({ 
          status: 'error', 
          message: 'Erro ao testar cadastro',
          error 
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        status: 'success',
        message: 'Teste de cadastro realizado com sucesso',
        data
      });
    }
    
    return NextResponse.json({ 
      status: 'error', 
      message: 'Ação não reconhecida' 
    }, { status: 400 });
    
  } catch (error) {
    console.error('Erro na rota de debug:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Erro interno no servidor',
      error: String(error)
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ready', message: 'Debug API está pronta' });
} 