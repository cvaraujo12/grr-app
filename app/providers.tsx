'use client'

import { ThemeProvider } from 'next-themes'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <ProtectedRoute>
          {children}
        </ProtectedRoute>
      </AuthProvider>
    </ThemeProvider>
  )
}
