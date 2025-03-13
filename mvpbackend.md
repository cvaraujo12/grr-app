
## Etapa 1: Configuração do Projeto Supabase

### 1.1 Criar uma conta e um projeto

1. Acesse [https://supabase.com/](https://supabase.com/) e clique em "Sign In"
2. Crie uma nova conta ou faça login com GitHub, Google, etc.
3. No dashboard, clique em "New Project"
4. Selecione uma organização (ou crie uma nova)
5. Dê um nome ao projeto (ex: "painel-neurodivergentes")
6. Defina uma senha forte para o banco de dados
7. Escolha a região mais próxima de seus usuários alvo
8. Clique em "Create New Project"

**Propósito:** Esta etapa cria um ambiente de hospedagem para o banco de dados PostgreSQL e serviços complementares do Supabase.

**⏱️ Tempo estimado:** A criação do projeto leva aproximadamente 2 minutos.

### 1.2 Salvar as credenciais do projeto

Após a criação do projeto, acesse:

1. Project Settings > API
2. Anote as seguintes informações:
    - URL do projeto - https://tsezkzlejtyebxeuzbld.supabase.co
    - Chave anônima (`anon` public key) - eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZXpremxlanR5ZWJ4ZXV6YmxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4MzgyOTAsImV4cCI6MjA1NzQxNDI5MH0.36aGAUbFd4le6N_zipJKFnezK5s9VA1k0qptItbgtew
    - Chave de serviço (`service_role` key) - use apenas para tarefas administrativas! - eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZXpremxlanR5ZWJ4ZXV6YmxkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTgzODI5MCwiZXhwIjoyMDU3NDE0MjkwfQ.sVfeceZ_eCxxyBMB24lkU_4deGtpwNSkuYWYy7C_eqE

**Propósito:** Estas credenciais serão usadas para configurar o cliente Supabase em seu aplicativo Next.js.

## Etapa 2: Instalação e Configuração

### 2.1 Instalar as dependências do Supabase

No terminal, na pasta raiz do seu projeto Next.js:

```bash
npm install @supabase/supabase-js
```

**Propósito:** Instala o cliente JavaScript oficial do Supabase que permite interagir com os serviços do Supabase.

### 2.2 Configurar as variáveis de ambiente

1. Crie um arquivo `.env.local` na raiz do projeto (se ainda não existir)
2. Adicione as seguintes variáveis:
```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
```

**Propósito:** Armazena as credenciais do Supabase de forma segura e acessível ao aplicativo Next.js.

### 2.3 Criar um cliente Supabase

Crie um novo arquivo em `app/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltam variáveis de ambiente Supabase. Por favor, verifique o .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Propósito:** Cria uma instância do cliente Supabase que será reutilizada em toda a aplicação.

**Documentação relevante:** [https://supabase.com/docs/reference/javascript/initializing](https://supabase.com/docs/reference/javascript/initializing)

## Etapa 3: Autenticação de Usuários

### 3.1 Configurar autenticação no Supabase

1. No dashboard do Supabase, vá para Authentication > Providers
2. Habilite o provedor "Email" para autenticação baseada em senha
3. Opcionalmente, você pode habilitar provedores OAuth (Google, GitHub) para login social

**Propósito:** Configura os métodos de autenticação que os usuários poderão usar para acessar o aplicativo.

### 3.2 Criar componentes de autenticação

Crie um arquivo `app/components/auth/AuthForm.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'

export function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    
    try {
      if (isSignUp) {
        // Registrar um novo usuário
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        
        if (error) throw error
        setMessage('Verifique seu email para o link de confirmação!')
      } else {
        // Fazer login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) throw error
      }
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">
        {isSignUp ? 'Criar uma nova conta' : 'Entrar na sua conta'}
      </h2>
      
      {message && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-blue-800 dark:text-blue-300 mb-4">
          {message}
        </div>
      )}
      
      <form onSubmit={handleAuth} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? 'Processando...' : isSignUp ? 'Criar conta' : 'Entrar'}
        </button>
      </form>
      
      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className="w-full text-center mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
      >
        {isSignUp ? 'Já tem uma conta? Entrar' : 'Não tem uma conta? Criar'}
      </button>
    </div>
  )
}
```

**Propósito:** Cria um formulário reutilizável para cadastro e login de usuários.

### 3.3 Criar um componente de contexto de autenticação

Crie um arquivo `app/context/AuthContext.tsx`:

```tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { Session, User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Configurar o listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    )

    // Verificar a sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    session,
    isLoading,
    signOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
```

**Propósito:** Cria um contexto que gerencia o estado de autenticação e o disponibiliza para toda a aplicação.

### 3.4 Atualizar o arquivo de providers

Atualize o arquivo `app/providers.tsx` para incluir o AuthProvider:

```tsx
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'
import { AuthProvider } from './context/AuthContext'

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem {...props}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </NextThemesProvider>
  )
}
```

**Propósito:** Integra o provedor de autenticação na árvore de componentes para disponibilizar as informações de autenticação em toda a aplicação.

### 3.5 Criar uma página de login

Crie um arquivo `app/login/page.tsx`:

```tsx
import { AuthForm } from '@/app/components/auth/AuthForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-900">
      <AuthForm />
    </div>
  )
}
```

**Propósito:** Cria uma página dedicada para autenticação do usuário.

### 3.6 Adicionar proteção de rotas

Crie um componente `app/components/auth/ProtectedRoute.tsx`:

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { useEffect } from 'react'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
```

**Propósito:** Cria um componente que protege rotas, redirecionando para a página de login caso o usuário não esteja autenticado.

Atualize o arquivo `app/layout.tsx` para implementar proteção de rotas:

```tsx
import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/app/components/layout/Sidebar'
import { Header } from '@/app/components/layout/Header'
import { Providers } from '@/app/providers'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

export const metadata: Metadata = {
  title: 'Painel de Produtividade para Neurodivergentes',
  description: 'Aplicativo para ajudar pessoas neurodivergentes com organização e produtividade',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-900">
        <Providers>
          <ProtectedRoute>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <div className="flex flex-col flex-1 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                  {children}
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Providers>
      </body>
    </html>
  )
}
```

**Propósito:** Aplica proteção de autenticação a todas as rotas, exceto a de login.

**Documentação relevante:** [https://supabase.com/docs/guides/auth](https://supabase.com/docs/guides/auth)

## Etapa 4: Modelagem do Banco de Dados

### 4.1 Definir tabelas baseadas nas estruturas de dados existentes

Baseado no arquivo `app/store/index.ts`, precisamos criar tabelas para:

- Tarefas (tarefas)
- Blocos de Tempo (blocos_tempo)
- Refeições (refeicoes)
- Medicações (medicacoes)
- Configurações do Usuário (configuracoes_usuario)

Acesse o SQL Editor no dashboard do Supabase e execute os seguintes comandos:

```sql
-- Criar extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários (criada automaticamente pelo Supabase Auth)
-- profiles é uma tabela para armazenar informações adicionais dos usuários
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT
);

-- Trigger para criar um perfil quando um novo usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Tabela de tarefas
CREATE TABLE tarefas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  texto TEXT NOT NULL,
  concluida BOOLEAN DEFAULT FALSE,
  categoria TEXT NOT NULL,
  data DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de blocos de tempo
CREATE TABLE blocos_tempo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  hora TEXT NOT NULL,
  atividade TEXT NOT NULL,
  categoria TEXT NOT NULL,
  data DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de refeições
CREATE TABLE refeicoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  hora TEXT NOT NULL,
  descricao TEXT NOT NULL,
  foto TEXT,
  data DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de medicações
CREATE TABLE medicacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  nome TEXT NOT NULL,
  dosagem TEXT,
  frequencia TEXT NOT NULL,
  observacoes TEXT,
  data_inicio DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de horários de medicações
CREATE TABLE medicacoes_horarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medicacao_id UUID REFERENCES medicacoes(id) ON DELETE CASCADE,
  horario TEXT NOT NULL
);

-- Tabela de registro de tomadas de medicação
CREATE TABLE medicacoes_tomadas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medicacao_id UUID REFERENCES medicacoes(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  horario TEXT NOT NULL,
  tomada BOOLEAN DEFAULT FALSE,
  tomada_em TIMESTAMP WITH TIME ZONE
);

-- Tabela de humor
CREATE TABLE registros_humor (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  data DATE NOT NULL,
  nivel INTEGER NOT NULL CHECK (nivel BETWEEN 1 AND 5),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de fatores de humor
CREATE TABLE fatores_humor (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registro_id UUID REFERENCES registros_humor(id) ON DELETE CASCADE,
  fator TEXT NOT NULL
);

-- Tabela de sessões de estudo
CREATE TABLE sessoes_estudo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  duracao INTEGER NOT NULL,
  data DATE NOT NULL,
  completo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de configurações do usuário
CREATE TABLE configuracoes_usuario (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  tempo_foco INTEGER DEFAULT 25,
  tempo_pausa INTEGER DEFAULT 5,
  tema_escuro BOOLEAN DEFAULT FALSE,
  reducao_estimulos BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de registros de hidratação
CREATE TABLE registros_hidratacao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  data DATE NOT NULL,
  hora TEXT NOT NULL,
  quantidade INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Configure RLS (Row Level Security) para proteção de dados por usuário
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocos_tempo ENABLE ROW LEVEL SECURITY;
ALTER TABLE refeicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicacoes_horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicacoes_tomadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_humor ENABLE ROW LEVEL SECURITY;
ALTER TABLE fatores_humor ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes_estudo ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_hidratacao ENABLE ROW LEVEL SECURITY;

-- Criar políticas para acesso aos dados
-- Exemplo para tarefas: usuários só podem ver e modificar suas próprias tarefas
CREATE POLICY "Usuários podem visualizar suas próprias tarefas" 
  ON tarefas FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias tarefas" 
  ON tarefas FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias tarefas" 
  ON tarefas FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias tarefas" 
  ON tarefas FOR DELETE 
  USING (auth.uid() = user_id);

-- Repita políticas semelhantes para as outras tabelas
```

**Propósito:** Cria a estrutura do banco de dados baseada nos modelos existentes no aplicativo, com segurança por usuário implementada.

**⚠️ Nota importante:** Este é um esquema inicial que pode precisar de ajustes conforme a aplicação evolui. Sempre faça um backup antes de executar modificações no esquema de produção.

### 4.2 Criar tipos TypeScript correspondentes

Crie um arquivo `app/types/supabase.ts`:

```typescript
export type Profile = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  updated_at: string
}

export type Tarefa = {
  id: string
  user_id: string
  texto: string
  concluida: boolean
  categoria: 'inicio' | 'alimentacao' | 'estudos' | 'saude' | 'lazer'
  data: string
  created_at: string
  updated_at: string
}

export type BlocoTempo = {
  id: string
  user_id: string
  hora: string
  atividade: string
  categoria: 'inicio' | 'alimentacao' | 'estudos' | 'saude' | 'lazer' | 'nenhuma'
  data: string
  created_at: string
  updated_at: string
}

export type Refeicao = {
  id: string
  user_id: string
  hora: string
  descricao: string
  foto: string | null
  data: string
  created_at: string
  updated_at: string
}

export type Medicacao = {
  id: string
  user_id: string
  nome: string
  dosagem: string | null
  frequencia: string
  observacoes: string | null
  data_inicio: string
  horarios: string[]
  tomadas: Record<string, boolean>
  created_at: string
  updated_at: string
}

export type RegistroHumor = {
  id: string
  user_id: string
  data: string
  nivel: 1 | 2 | 3 | 4 | 5
  notas: string | null
  fatores: string[]
  created_at: string
}

export type SessaoEstudo = {
  id: string
  user_id: string
  titulo: string
  descricao: string | null
  duracao: number
  data: string
  completo: boolean
  created_at: string
  updated_at: string
}

export type ConfiguracaoUsuario = {
  user_id: string
  tempo_foco: number
  tempo_pausa: number
  tema_escuro: boolean
  reducao_estimulos: boolean
  created_at: string
  updated_at: string
}

export type RegistroHidratacao = {
  id: string
  user_id: string
  data: string
  hora: string
  quantidade: number
  created_at: string
}
```

**Propósito:** Define os tipos TypeScript que correspondem às tabelas do banco de dados para garantir segurança de tipos ao interagir com o Supabase.

## Etapa 5: Migração do Estado Local para o Supabase

### 5.1 Criar hooks de dados para substituir o Zustand

Crie um arquivo `app/hooks/useSupabaseStore.ts`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useAuth } from '@/app/context/AuthContext'
import { Tarefa, BlocoTempo, Refeicao, Medicacao, ConfiguracaoUsuario } from '@/app/types/supabase'

// Hook para tarefas
export function useTarefas() {
  const { user } = useAuth()
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar tarefas
  const loadTarefas = async () => {
    try {
      setLoading(true)
      
      if (!user) return
      
      const { data, error } = await supabase
        .from('tarefas')
        .select('*')
        .eq('user_id', user.id)
        .order('data', { ascending: false })
      
      if (error) throw error
      
      setTarefas(data || [])
    } catch (error: any) {
      setError(error.message)
      console.error('Erro ao carregar tarefas:', error)
    } finally {
      setLoading(false)
    }
  }

  // Adicionar tarefa
  const adicionarTarefa = async (novaTarefa: Omit<Tarefa, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!user) return null
      
      const { data, error } = await supabase
        .from('tarefas')
        .insert([{ ...novaTarefa, user_id: user.id }])
        .select()
      
      if (error) throw error
      
      setTarefas(prev => [...prev, data[^0]])
      return data[^0]
    } catch (error: any) {
      setError(error.message)
      console.error('Erro ao adicionar tarefa:', error)
      return null
    }
  }

  // Atualizar tarefa
  const atualizarTarefa = async (id: string, updates: Partial<Tarefa>) => {
    try {
      if (!user) return false
      
      const { error } = await supabase
        .from('tarefas')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
      
      if (error) throw error
      
      setTarefas(prev => 
        prev.map(tarefa => 
          tarefa.id === id ? { ...tarefa, ...updates } : tarefa
        )
      )
      
      return true
    } catch (error: any) {
      setError(error.message)
      console.error('Erro ao atualizar tarefa:', error)
      return false
    }
  }

  // Remover tarefa
  const removerTarefa = async (id: string) => {
    try {
      if (!user) return false
      
      const { error } = await supabase
        .from('tarefas')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
      
      if (error) throw error
      
      setTarefas(prev => prev.filter(tarefa => tarefa.id !== id))
      return true
    } catch (error: any) {
      setError(error.message)
      console.error('Erro ao remover tarefa:', error)
      return false
    }
  }

  // Alternar status de conclusão
  const toggleTarefaConcluida = async (id: string) => {
    const tarefa = tarefas.find(t => t.id === id)
    
    if (!tarefa) return false
    
    return atualizarTarefa(id, { concluida: !tarefa.concluida })
  }

  // Carregar tarefas quando o usuário mudar
  useEffect(() => {
    if (user) {
      loadTarefas()
    } else {
      setTarefas([])
    }
  }, [user])

  return {
    tarefas,
    loading,
    error,
    adicionarTarefa,
    atualizarTarefa,
    removerTarefa,
    toggleTarefaConcluida,
    recarregarTarefas: loadTarefas
  }
}

// Hooks similares para outros tipos de dados podem ser implementados seguindo o mesmo padrão
```

**Propósito:** Cria hooks personalizados que interagem com o Supabase para cada tipo de dado, substituindo o gerenciamento de estado local do Zustand.

**Nota:** Este exemplo mostra apenas o hook para tarefas. Você precisará implementar hooks similares para outros tipos de dados (blocos de tempo, refeições, medicações, etc.).

### 5.2 Atualizar o componente ListaPrioridades com o novo hook

Atualize o arquivo `app/components/inicio/ListaPrioridades.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, PlusCircle } from 'lucide-react'
import { useTarefas } from '@/app/hooks/useSupabaseStore'

export function ListaPrioridades() {
  const { tarefas, loading, adicionarTarefa, toggleTarefaConcluida, removerTarefa } = useTarefas()
  const [novoTexto, setNovoTexto] = useState('')
  
  // Filtramos apenas as tarefas da categoria 'inicio'
  const prioridades = tarefas.filter(tarefa => tarefa.categoria === 'inicio')

  const handleToggle = (id: string) => {
    toggleTarefaConcluida(id)
  }

  const handleAdicionar = async () => {
    if (!novoTexto.trim() || prioridades.length >= 3) return
    
    const hoje = new Date().toISOString().split('T')[^0]
    
    await adicionarTarefa({
      texto: novoTexto,
      concluida: false,
      categoria: 'inicio',
      data: hoje
    })
    
    setNovoTexto('')
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-2">
          {prioridades.map((prioridade) => (
            <div
              key={prioridade.id}
              className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                prioridade.concluida
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-white dark:bg-gray-800'
              }`}
            >
              <button
                onClick={() => handleToggle(prioridade.id)}
                className="mr-3 text-green-600 dark:text-green-400 focus:outline-none"
                aria-label={prioridade.concluida ? 'Marcar como não concluída' : 'Marcar como concluída'}
              >
                {prioridade.concluida ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <Circle className="h-6 w-6" />
                )}
              </button>
              <span
                className={`flex-1 ${
                  prioridade.concluida
                    ? 'text-gray-500 dark:text-gray-400 line-through'
                    : 'text-gray-900 dark:text-white'
                }`}
              >
                {prioridade.texto}
              </span>
            </div>
          ))}
        </div>
      )}

      {prioridades.length < 3 && (
        <div className="flex items-center mt-4">
          <input
            type="text"
            value={novoTexto}
            onChange={(e) => setNovoTexto(e.target.value)}
            placeholder="Nova prioridade..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            maxLength={50}
          />
          <button
            onClick={handleAdicionar}
            className="bg-blue-600 text-white px-3 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Adicionar prioridade"
          >
            <PlusCircle className="h-5 w-5" />
          </button>
        </div>
      )}

      {prioridades.length >= 3 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          Máximo de 3 prioridades para manter o foco.
        </p>
      )}
    </div>
  )
}
```

**Propósito:** Atualiza um componente existente para utilizar o novo hook do Supabase em vez do estado local com Zustand.

**Nota:** Você precisará atualizar todos os componentes que usam o estado do Zustand para usar os novos hooks do Supabase.

## Etapa 6: Implementação de Operações CRUD

### 6.1 Exemplo: Implementação completa de CRUD para Monitoramento de Humor

Vamos atualizar o componente MonitoramentoHumor para usar o Supabase:

Primeiro, crie o hook específico em `app/hooks/useHumor.ts`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useAuth } from '@/app/context/AuthContext'
import { RegistroHumor } from '@/app/types/supabase'

export function useHumor() {
  const { user } = useAuth()
  const [registros, setRegistros] = useState<RegistroHumor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadRegistros = async (mes?: string) => {
    try {
      setLoading(true)
      
      if (!user) return
      
      let query = supabase
        .from('registros_humor')
        .select(`
          *,
          fatores_humor(fator)
        `)
        .eq('user_id', user.id)
        .order('data', { ascending: false })
      
      // Filtrar por mês se especificado
      if (mes) {
        const inicio = `${mes}-01`
        const [ano, mesNum] = mes.split('-').map(Number)
        const fim = new Date(ano, mesNum, 0).toISOString().split('T')[^0] // Último dia do mês
        
        query = query.gte('data', inicio).lte('data', fim)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      // Processar os dados para o formato esperado pelo componente
      const processedData = data?.map(item => ({
        ...item,
        fatores: item.fatores_humor?.map((f: any) => f.fator) || []
      })) || []
      
      setRegistros(processedData)
    } catch (error: any) {
      setError(error.message)
      console.error('Erro ao carregar registros de humor:', error)
    } finally {
      setLoading(false)
    }
  }

  const adicionarRegistro = async (
    novoRegistro: Pick<RegistroHumor, 'data' | 'nivel' | 'notas' | 'fatores'>
  ) => {
    try {
      if (!user) return null
      
      // 1. Inserir o registro principal
      const { data: registroData, error: registroError } = await supabase
        .from('registros_humor')
        .insert([{
          user_id: user.id,
          data: novoRegistro.data,
          nivel: novoRegistro.nivel,
          notas: novoRegistro.notas
        }])
        .select()
      
      if (registroError) throw registroError
      
      const registroId = registroData[^0].id
      
      // 2. Inserir os fatores
      if (novoRegistro.fatores.length > 0) {
        const fatoresObjects = novoRegistro.fatores.map(fator => ({
          registro_id: registroId,
          fator
        }))
        
        const { error: fatoresError } = await supabase
          .from('fatores_humor')
          .insert(fatoresObjects)
        
        if (fatoresError) throw fatoresError
      }
      
      // 3. Recarregar os dados para atualizar a UI
      await loadRegistros()
      
      return registroId
    } catch (error: any) {
      setError(error.message)
      console.error('Erro ao adicionar registro de humor:', error)
      return null
    }
  }

  useEffect(() => {
    if (user) {
      loadRegistros()
    } else {
      setRegistros([])
    }
  }, [user])

  return {
    registros,
    loading,
    error,
    adicionarRegistro,
    loadRegistrosMes: loadRegistros
  }
}
```

Agora, atualize o componente `app/components/saude/MonitoramentoHumor.tsx` para usar o hook:

```tsx
'use client'

import { useState } from 'react'
import { Plus, X, Calendar, BarChart, ChevronLeft, ChevronRight } from 'lucide-react'
import { useHumor } from '@/app/hooks/useHumor'

type NivelHumor = 1 | 2 | 3 | 4 | 5

const EMOJIS: Record<NivelHumor, string> = {
  1: '😞',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄',
}

const FATORES_COMUNS = [
  'Sono adequado',
  'Boa alimentação',
  'Exercício físico',
  'Socialização',
  'Medicação em dia',
  'Estresse',
  'Ansiedade',
  'Cansaço',
  'Sobrecarga sensorial',
]

export function MonitoramentoHumor() {
  const { registros, loading, adicionarRegistro, loadRegistrosMes } = useHumor()
  
  const [mostrarForm, setMostrarForm] = useState(false)
  const [novoRegistro, setNovoRegistro] = useState<{
    nivel: NivelHumor
    notas: string
    fatores: string[]
  }>({
    nivel: 3,
    notas: '',
    fatores: [],
  })
  
  const [novoFator, setNovoFator] = useState('')
  const [mesAtual, setMesAtual] = useState(() => {
    const hoje = new Date()
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`
  })

  const adicionarNovoRegistro = async () => {
    const hoje = new Date().toISOString().split('T')[^0]
    
    await adicionarRegistro({
      data: hoje,
      nivel: novoRegistro.nivel,
      notas: novoRegistro.notas,
      fatores: [...novoRegistro.fatores],
    })
    
    resetForm()
  }

  const toggleFator = (fator: string) => {
    if (novoRegistro.fatores.includes(fator)) {
      setNovoRegistro({
        ...novoRegistro,
        fatores: novoRegistro.fatores.filter((f) => f !== fator),
      })
    } else {
      setNovoRegistro({
        ...novoRegistro,
        fatores: [...novoRegistro.fatores, fator],
      })
    }
  }

  const adicionarNovoFator = () => {
    if (!novoFator || novoRegistro.fatores.includes(novoFator)) return
    
    setNovoRegistro({
      ...novoRegistro,
      fatores: [...novoRegistro.fatores, novoFator],
    })
    
    setNovoFator('')
  }

  const resetForm = () => {
    setNovoRegistro({
      nivel: 3,
      notas: '',
      fatores: [],
    })
    setNovoFator('')
    setMostrarForm(false)
  }

  const mesAnterior = () => {
    const [ano, mes] = mesAtual.split('-').map(Number)
    const novaData = new Date(ano, mes - 2, 1)
    const novoMes = `${novaData.getFullYear()}-${String(novaData.getMonth() + 1).padStart(2, '0')}`
    setMesAtual(novoMes)
    loadRegistrosMes(novoMes)
  }

  const proximoMes = () => {
    const [ano, mes] = mesAtual.split('-').map(Number)
    const novaData = new Date(ano, mes, 1)
    const novoMes = `${novaData.getFullYear()}-${String(novaData.getMonth() + 1).padStart(2, '0')}`
    setMesAtual(novoMes)
    loadRegistrosMes(novoMes)
  }

  // Filtrar registros do mês atual
  const registrosMes = registros.filter((reg) => reg.data.startsWith(mesAtual))
  
  // Calcular média do mês
  const mediaHumor = registrosMes.length
    ? Math.round((registrosMes.reduce((sum, reg) => sum + reg.nivel, 0) / registrosMes.length) * 10) / 10
    : 0
  
  // Encontrar fatores mais comuns
  const contarFatores = () => {
    const contagem: Record<string, number> = {}
    registrosMes.forEach((reg) => {
      reg.fatores.forEach((fator) => {
        contagem[fator] = (contagem[fator] || 0) + 1
      })
    })
    
    return Object.entries(contagem)
      .sort((a, b) => b[^1] - a[^1])
      .slice(0, 3)
      .map(([fator, _]) => fator)
  }
  
  const fatoresComuns = contarFatores()
  
  // Formatar nome do mês
  const formatarMes = () => {
    const [ano, mes] = mesAtual.split('-')
    return new Date(Number(ano), Number(mes) - 1, 1).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    })
  }

  // Renderização conforme implementação anterior, mas agora usando dados do Supabase
  // ...
  
  return (
    <div className="space-y-4">
      {/* Resto da implementação do componente permanece similar ao original, 
          apenas usando os novos hooks e funções para manipular os dados */}
    </div>
  )
}
```

**Propósito:** Demonstra como implementar operações CRUD completas com o Supabase, incluindo relacionamentos entre tabelas.

**Documentação relevante:** [https://supabase.com/docs/reference/javascript/select](https://supabase.com/docs/reference/javascript/select)

## Etapa 7: Configuração de Subscrições em Tempo Real

### 7.1 Habilitar a funcionalidade realtime no Supabase

1. No dashboard do Supabase, vá para Database > Replication
2. Na tabela de publicação, habilite as tabelas que deseja sincronizar em tempo real
3. Ative a coluna "Realtime" para cada tabela

### 7.2 Implementar subscrições em tempo real

Atualize o hook `useTarefas` para incluir subscrições em tempo real:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useAuth } from '@/app/context/AuthContext'
import { Tarefa } from '@/app/types/supabase'

export function useTarefas() {
  const { user } = useAuth()
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar tarefas
  const loadTarefas = async () => {
    try {
      setLoading(true)
      
      if (!user) return
      
      const { data, error } = await supabase
        .from('tarefas')
        .select('*')
        .eq('user_id', user.id)
        .order('data', { ascending: false })
      
      if (error) throw error
      
      setTarefas(data || [])
    } catch (error: any) {
      setError(error.message)
      console.error('Erro ao carregar tarefas:', error)
    } finally {
      setLoading(false)
    }
  }

  // ... outras funções do hook

  // Configurar subscrição em tempo real
  useEffect(() => {
    if (!user) return
    
    // Carregar dados iniciais
    loadTarefas()
    
    // Configurar canal de realtime
    const channel = supabase
      .channel('tarefas-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tarefas',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const novaTarefa = payload.new as Tarefa
          setTarefas(prev => [...prev, novaTarefa])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tarefas',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const tarefaAtualizada = payload.new as Tarefa
          setTarefas(prev => 
            prev.map(tarefa => 
              tarefa.id === tarefaAtualizada.id ? tarefaAtualizada : tarefa
            )
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'tarefas',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const tarefaId = payload.old.id
          setTarefas(prev => prev.filter(tarefa => tarefa.id !== tarefaId))
        }
      )
      .subscribe()

    // Limpar subscrição ao desmontar
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return {
    tarefas,
    loading,
    error,
    adicionarTarefa,
    atualizarTarefa,
    removerTarefa,
    toggleTarefaConcluida,
    recarregarTarefas: loadTarefas
  }
}
```

**Propósito:** Implementa subscrições em tempo real para manter a interface sincronizada automaticamente quando dados mudam no backend, por exemplo, quando o usuário acessa o aplicativo em múltiplos dispositivos.

**Documentação relevante:** [https://supabase.com/docs/guides/realtime](https://supabase.com/docs/guides/realtime)

## Etapa 8: Otimização e Caching

### 8.1 Implementar cache local com SWR ou React Query

Instale o SWR:

```bash
npm install swr
```

Crie uma versão otimizada do hook de tarefas com SWR em `app/hooks/useTarefasSWR.ts`:

```typescript
'use client'

import useSWR, { mutate } from 'swr'
import { supabase } from '@/app/lib/supabase'
import { useAuth } from '@/app/context/AuthContext'
import { Tarefa } from '@/app/types/supabase'

const fetcher = async (key: string, userId: string) => {
  const { data, error } = await supabase
    .from('tarefas')
    .select('*')
    .eq('user_id', userId)
    .order('data', { ascending: false })
  
  if (error) throw error
  return data || []
}

export function useTarefasSWR() {
  const { user } = useAuth()
  const userId = user?.id

  // Chave de cache que inclui o ID do usuário
  const cacheKey = userId ? `tarefas-${userId}` : null
  
  const { data: tarefas, error, isLoading, isValidating, mutate: refreshTarefas } = useSWR(
    cacheKey ? [cacheKey, userId] : null,
    ([_, id]) => fetcher(cacheKey!, id),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  )

  // Adicionar tarefa com atualização otimista
  const adicionarTarefa = async (novaTarefa: Omit<Tarefa, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!userId) return null
    
    // Clone atual dos dados
    const tarefasAtuais = tarefas || []
    
    // ID temporário para otimismo na UI
    const tempId = `temp-${Date.now()}`
    
    // Cria objeto temporário para atualização otimista
    const tarefaTemp: Tarefa = {
      id: tempId,
      user_id: userId,
      ...novaTarefa,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    try {
      // Atualização otimista da UI
      mutate(
        [cacheKey!, userId],
        [...tarefasAtuais, tarefaTemp],
        false
      )
      
      // Realiza a operação real
      const { data, error } = await supabase
        .from('tarefas')
        .insert([{ ...novaTarefa, user_id: userId }])
        .select()
      
      if (error) throw error
      
      // Atualiza o cache com os dados reais
      refreshTarefas()
      
      return data[^0]
    } catch (error) {
      // Reverte a atualização otimista em caso de erro
      refreshTarefas()
      console.error('Erro ao adicionar tarefa:', error)
      return null
    }
  }

  // Implementação similar para as outras operações CRUD...

  return {
    tarefas: tarefas || [],
    isLoading,
    isValidating,
    error,
    adicionarTarefa,
    // outras funções...
  }
}
```

**Propósito:** Implementa caching e invalidação inteligente de cache para melhorar a performance e a experiência do usuário.

**Documentação relevante:** [https://swr.vercel.app/docs/getting-started](https://swr.vercel.app/docs/getting-started)

### 8.2 Implementar carregamento offline

Adicione um serviço worker para habilitar funcionalidades offline:

1. Crie um arquivo `public/sw.js` para o service worker:
```javascript
const CACHE_NAME = 'painel-neurodivergentes-v1';
const urlsToCache = [
  '/',
  '/offline',
  '/favicon.ico',
  // Adicione outros assets estáticos importantes
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - retorna a resposta
        if (response) {
          return response;
        }
        
        // Clone da requisição
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(
          (response) => {
            // Verifica se recebemos uma resposta válida
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone da resposta
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          }
        ).catch(() => {
          // Se falhar (offline), retornar página offline
          if (event.request.mode === 'navigate') {
            return caches.match('/offline');
          }
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

2. Crie uma página offline em `app/offline/page.tsx`:
```tsx
export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Você está offline
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          O aplicativo Painel Neurodivergentes precisa de uma conexão à internet para funcionar corretamente.
          Verifique sua conexão e tente novamente.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
```

3. Registre o service worker no layout principal (`app/layout.tsx`):
```tsx
import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/app/components/layout/Sidebar'
import { Header } from '@/app/components/layout/Header'
import { Providers } from '@/app/providers'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Painel de Produtividade para Neurodivergentes',
  description: 'Aplicativo para ajudar pessoas neurodivergentes com organização e produtividade',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-900">
        <Providers>
          <ProtectedRoute>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <div className="flex flex-col flex-1 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                  {children}
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Providers>
        
        {/* Service Worker Registration */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) {
                    console.log('ServiceWorker registration successful');
                  },
                  function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  }
                );
              });
            }
          `}
        </Script>
      </body>
    </html>
  )
}
```

**Propósito:** Implementa suporte básico para funcionalidade offline, melhorando a experiência do usuário em condições de conectividade instável.

## Etapa 9: Ambiente de Produção e Implantação

### 9.1 Configurar variáveis de ambiente para produção

1. Configure as variáveis de ambiente no serviço de hospedagem que você escolher (Vercel, Netlify, etc.)
2. Se estiver usando Vercel, configure-as no dashboard do projeto:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 9.2 Considerações de segurança

1. Certifique-se de que as políticas RLS (Row Level Security) estão configuradas corretamente para todas as tabelas
2. Nunca exponha a chave `service_role` no código do cliente
3. Use chaves de ambiente separadas para desenvolvimento e produção

### 9.3 Monitoramento e Analytics

1. Configure o Analytics do Supabase para monitorar o uso do banco de dados
2. Considere usar o Sentry ou outro serviço para monitoramento de erros no frontend:
```bash
npm install @sentry/nextjs
```


### 9.4 Estratégias de implantação

1. Use a integração direta entre Vercel e Supabase para implantações contínuas
2. Configure hooks de pré-build para sincronizar tipos entre o Supabase e o TypeScript usando `supabase gen types typescript`

**Propósito:** Garante que a aplicação esteja pronta para produção com configurações apropriadas de segurança e monitoramento.

