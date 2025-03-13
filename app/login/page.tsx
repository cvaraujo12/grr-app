import { AuthForm } from '@/app/components/auth/AuthForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Painel de Produtividade para Neurodivergentes',
  description: 'Entre na sua conta para acessar o Painel de Produtividade para Neurodivergentes'
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
          Painel de Produtividade
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Ferramentas de organização adaptadas para neurodivergentes
        </p>
      </div>
      
      <AuthForm />
      
      <p className="mt-8 text-sm text-gray-500 dark:text-gray-400 max-w-md text-center">
        Organize seu dia, monitore suas atividades e acompanhe seu progresso com ferramentas
        adaptadas para o seu modo único de pensar.
      </p>
    </div>
  );
} 