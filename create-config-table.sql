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
COMMENT ON COLUMN public.configuracoes_usuario.tema IS 'Preferência de tema (claro, escuro, sistema)';
COMMENT ON COLUMN public.configuracoes_usuario.notificacoes_ativas IS 'Se as notificações estão ativas para o usuário';
COMMENT ON COLUMN public.configuracoes_usuario.tamanho_fonte IS 'Preferência de tamanho da fonte (pequeno, medio, grande)';
COMMENT ON COLUMN public.configuracoes_usuario.alto_contraste IS 'Se o modo de alto contraste está ativado';

-- Criar políticas RLS para a tabela
ALTER TABLE public.configuracoes_usuario ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura apenas do próprio usuário
CREATE POLICY "Usuários podem ver apenas suas próprias configurações" 
    ON public.configuracoes_usuario FOR SELECT 
    USING (auth.uid() = user_id);

-- Política para permitir inserção apenas pelo próprio usuário
CREATE POLICY "Usuários podem inserir apenas suas próprias configurações" 
    ON public.configuracoes_usuario FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Política para permitir atualização apenas pelo próprio usuário
CREATE POLICY "Usuários podem atualizar apenas suas próprias configurações" 
    ON public.configuracoes_usuario FOR UPDATE 
    USING (auth.uid() = user_id);

-- Política para permitir exclusão apenas pelo próprio usuário
CREATE POLICY "Usuários podem excluir apenas suas próprias configurações" 
    ON public.configuracoes_usuario FOR DELETE 
    USING (auth.uid() = user_id);

-- Conceder permissões para roles específicas
GRANT ALL ON public.configuracoes_usuario TO postgres, service_role;
GRANT SELECT, UPDATE ON public.configuracoes_usuario TO authenticated;
GRANT USAGE ON SEQUENCE public.configuracoes_usuario_id_seq TO authenticated;
