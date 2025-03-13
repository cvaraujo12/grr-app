'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { getSupabaseBrowser } from '@/app/lib/supabase-browser';
import { useRouter } from 'next/navigation';

// Definição dos tipos
type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

// Criação do contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provedor de autenticação
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Verificar estado inicial da autenticação
  const refreshSession = async () => {
    try {
      setIsLoading(true);
      const supabase = getSupabaseBrowser();
      
      // Obter a sessão atual
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      setSession(data?.session);
      setUser(data?.session?.user || null);
    } catch (erro) {
      console.error('Erro ao obter sessão:', erro);
      setSession(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para realizar logout
  const signOut = async () => {
    try {
      setIsLoading(true);
      const supabase = getSupabaseBrowser();
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setSession(null);
      setUser(null);
      
      // Redirecionar para a página de login após o logout
      router.push('/login');
    } catch (erro) {
      console.error('Erro ao fazer logout:', erro);
    } finally {
      setIsLoading(false);
    }
  };

  // Configurar monitoramento de mudanças na autenticação
  useEffect(() => {
    const supabase = getSupabaseBrowser();
    
    // Verificar sessão inicial
    refreshSession();
    
    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setIsLoading(false);
      }
    );
    
    // Limpar subscrição quando o componente for desmontado
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Propriedades e métodos disponibilizados pelo contexto
  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!session,
    signOut,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
} 