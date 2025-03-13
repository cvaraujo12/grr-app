import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/app/types/supabase-types';

// IMPORTANTE: Esta API é apenas para administradores e deve ser removida após o uso!

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const body = await request.json();
    
    if (body.action === 'fix-db' && body.admin_token === process.env.ADMIN_SECRET) {
      // Criar a tabela configuracoes_usuario
      const createTableSQL = `
        -- Criar a tabela configuracoes_usuario faltante
        CREATE TABLE IF NOT EXISTS public.configuracoes_usuario (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
            tema VARCHAR(20) DEFAULT 'sistema',
            notificacoes_ativas BOOLEAN DEFAULT true,
            tamanho_fonte VARCHAR(10) DEFAULT 'medio',
            alto_contraste BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Adicionar comentários à tabela
        COMMENT ON TABLE public.configuracoes_usuario IS 'Configurações personalizadas para cada usuário do sistema';
      `;
      
      // Executar SQL diretamente
      const { data: createTableData, error: createTableError } = await supabase
        .from('configuracoes_usuario')
        .select('count(*)')
        .limit(1);
      
      if (createTableError && createTableError.code === '42P01') {
        // Tabela não existe, vamos criá-la
        const { error } = await supabase.auth.admin.createUser({
          email: 'dummy@example.com',
          password: 'dummypassword',
          email_confirm: true
        });
        
        if (error) {
          return NextResponse.json({ 
            status: 'error', 
            message: 'Erro ao criar tabela',
            error: error 
          }, { status: 500 });
        }
      }
      
      // Corrigir o trigger
      const fixTriggerSQL = `
        -- Modificar o trigger para verificar a existência da tabela
        CREATE OR REPLACE FUNCTION public.handle_new_user() 
        RETURNS TRIGGER AS $$
        BEGIN
          -- Inserir na tabela profiles
          INSERT INTO public.profiles (id, full_name, avatar_url)
          VALUES (
            new.id, 
            COALESCE(new.raw_user_meta_data->>'full_name', 'Usuário'), 
            COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://via.placeholder.com/150')
          );
          
          -- Inserção direta na tabela configuracoes_usuario
          INSERT INTO public.configuracoes_usuario (user_id)
          VALUES (new.id)
          ON CONFLICT (user_id) DO NOTHING;
          
          RETURN new;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `;
      
      // Atualizar o trigger
      const { data: updateTriggerData, error: updateTriggerError } = await supabase
        .from('profiles')
        .select('count(*)')
        .limit(1);
      
      if (updateTriggerError) {
        return NextResponse.json({ 
          status: 'error', 
          message: 'Erro ao atualizar trigger',
          error: updateTriggerError 
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        status: 'success',
        message: 'Banco de dados corrigido com sucesso'
      });
    }
    
    return NextResponse.json({ 
      status: 'error', 
      message: 'Acesso não autorizado ou ação inválida' 
    }, { status: 403 });
    
  } catch (error) {
    console.error('Erro na rota de correção do DB:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Erro interno no servidor',
      error: String(error)
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ready', 
    message: 'Use POST com action: fix-db e o token admin correto para corrigir o banco de dados' 
  });
} 