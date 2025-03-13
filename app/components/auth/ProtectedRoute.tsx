'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Loader2 } from 'lucide-react';

type ProtectedRouteProps = {
  children: React.ReactNode;
  // Caminhos que NÃO requerem autenticação
  publicPaths?: string[];
};

export function ProtectedRoute({ 
  children, 
  publicPaths = ['/login', '/registro', '/auth/callback'] 
}: ProtectedRouteProps) {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // Verificar se o caminho atual é público
  const isPublicPath = publicPaths.includes(pathname);

  useEffect(() => {
    // Se ainda estiver carregando, não faz nada
    if (isLoading) return;
    
    // Se o usuário não está autenticado e o caminho não é público, redireciona para login
    if (!isAuthenticated && !isPublicPath) {
      router.push('/login');
    }
    
    // Se o usuário está autenticado e está tentando acessar um caminho público (como login),
    // redireciona para a página inicial
    if (isAuthenticated && isPublicPath && pathname !== '/auth/callback') {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, isPublicPath, pathname, router]);

  // Mostra o indicador de carregamento enquanto verifica a autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 mx-auto text-blue-500 animate-spin" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se é um caminho público ou usuário autenticado, renderiza o conteúdo
  if (isPublicPath || isAuthenticated) {
    return <>{children}</>;
  }
  
  // Fallback - não deveria chegar aqui por causa do redirecionamento
  return null;
} 