'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/app/lib/supabase-browser';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { EyeIcon, EyeOffIcon, UserPlus, LogIn } from 'lucide-react';

export function AuthForm() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const supabase = getSupabaseBrowser();
      
      if (!supabase) {
        throw new Error('Erro ao inicializar o cliente Supabase');
      }

      if (isSignUp) {
        // Cadastro
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        });

        if (error) throw error;

        if (data?.user?.identities?.length === 0) {
          throw new Error('Este email já está cadastrado. Faça login.');
        }

        setMessage('Verifique seu email para confirmar o cadastro!');
      } else {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message === 'Invalid login credentials') {
            throw new Error('Email ou senha incorretos');
          }
          throw error;
        }

        if (data?.session) {
          // Redirecionar para a página inicial
          router.push('/');
          router.refresh();
        }
      }
    } catch (error: any) {
      setError(error.message || 'Ocorreu um erro ao processar sua solicitação.');
    } finally {
      setLoading(false);
    }
  };

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

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-red-800 dark:text-red-300 mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="seu@email.com"
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Senha
          </label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Sua senha"
              className="w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
            >
              {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          </div>
        </div>
        
        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            'Processando...'
          ) : isSignUp ? (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Criar conta
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4 mr-2" />
              Entrar
            </>
          )}
        </Button>
      </form>
      
      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className="w-full text-center mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
      >
        {isSignUp ? 'Já tem uma conta? Entrar' : 'Não tem uma conta? Criar'}
      </button>
    </div>
  );
} 