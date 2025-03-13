-- Primeiro, vamos verificar se a função existe e depois modificá-la
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
  
  -- Comentando a chamada à função que causa o erro
  -- Esse código será substituído pela criação direta na tabela configuracoes_usuario
  -- PERFORM criar_configuracao_padrao(new.id);
  
  -- Inserção direta ao invés de chamar a função
  -- Verifica se a tabela existe antes de tentar inserir
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'configuracoes_usuario'
  ) THEN
    INSERT INTO public.configuracoes_usuario (user_id)
    VALUES (new.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover a função problemática se ela existir
DROP FUNCTION IF EXISTS public.criar_configuracao_padrao();

-- Opcional: Recriar a função corrigida (se você quiser mantê-la)
CREATE OR REPLACE FUNCTION public.criar_configuracao_padrao(user_id_param UUID) 
RETURNS VOID AS $$
BEGIN
  -- Verifica se a tabela existe antes de tentar inserir
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'configuracoes_usuario'
  ) THEN
    INSERT INTO public.configuracoes_usuario (user_id)
    VALUES (user_id_param)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 