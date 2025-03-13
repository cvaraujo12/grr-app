'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { LogOut, ChevronDown, Settings, User } from 'lucide-react';

export function UserProfile() {
  const { user, signOut } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);
  
  // Identificar o primeiro nome do usuário ou usar o email
  const obterNomeUsuario = () => {
    if (!user) return null;
    
    // Se tiver nome completo, usar primeiro nome
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    
    // Caso contrário, usar parte do email antes do @
    return user.email?.split('@')[0] || 'Usuário';
  };
  
  const toggleMenu = () => setMenuAberto(!menuAberto);
  const fecharMenu = () => setMenuAberto(false);
  
  // Se não tiver usuário, não renderiza
  if (!user) return null;
  
  return (
    <div className="relative">
      {/* Botão do perfil */}
      <button
        onClick={toggleMenu}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-expanded={menuAberto}
        aria-haspopup="true"
        aria-label="Menu do usuário"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
          {user.user_metadata?.avatar_url ? (
            <img 
              src={user.user_metadata.avatar_url} 
              alt="Avatar" 
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <User className="w-5 h-5" />
          )}
        </div>
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {obterNomeUsuario()}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>
      
      {/* Menu dropdown */}
      {menuAberto && (
        <>
          {/* Overlay invisível para fechar menu ao clicar fora */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={fecharMenu}
            aria-hidden="true"
          />
          
          {/* Menu de opções */}
          <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-20 border border-gray-200 dark:border-gray-700">
            {/* Informações do usuário */}
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.email}
              </p>
            </div>
            
            {/* Opções do menu */}
            <a 
              href="/perfil"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={fecharMenu}
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </a>
            
            <button
              onClick={() => {
                fecharMenu();
                signOut();
              }}
              className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </button>
          </div>
        </>
      )}
    </div>
  );
} 