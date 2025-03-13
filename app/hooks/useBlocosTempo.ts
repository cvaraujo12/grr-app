'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { BlocoTempo } from '@/app/types/supabase-types';

/**
 * Hook para gerenciamento de blocos de tempo usando Supabase
 */
export function useBlocosTempo() {
  const [blocosTempo, setBlocosTempo] = useState<BlocoTempo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar blocos de tempo
  const carregarBlocosTempo = async (data?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Obter ID do usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      let query = supabase
        .from('blocos_tempo')
        .select('*')
        .eq('user_id', user.id)
        .order('hora', { ascending: true });
      
      // Se uma data específica for fornecida, filtrar por ela
      if (data) {
        query = query.eq('data', data);
      }
      
      const { data: blocos, error } = await query;
      
      if (error) throw error;
      
      setBlocosTempo(blocos || []);
    } catch (error: any) {
      setError(error.message);
      console.error('Erro ao carregar blocos de tempo:', error);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar bloco de tempo
  const adicionarBlocoTempo = async (novoBloco: Omit<BlocoTempo, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      
      // Obter ID do usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data, error } = await supabase
        .from('blocos_tempo')
        .insert([{ ...novoBloco, user_id: user.id }])
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setBlocosTempo(prev => [...prev, data[0]]);
        return data[0];
      }
      
      return null;
    } catch (error: any) {
      setError(error.message);
      console.error('Erro ao adicionar bloco de tempo:', error);
      return null;
    }
  };

  // Atualizar bloco de tempo
  const atualizarBlocoTempo = async (id: string, updates: Partial<BlocoTempo>) => {
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('blocos_tempo')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setBlocosTempo(prev => 
          prev.map(bloco => 
            bloco.id === id ? { ...bloco, ...data[0] } : bloco
          )
        );
        return true;
      }
      
      return false;
    } catch (error: any) {
      setError(error.message);
      console.error('Erro ao atualizar bloco de tempo:', error);
      return false;
    }
  };

  // Remover bloco de tempo
  const removerBlocoTempo = async (id: string) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('blocos_tempo')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setBlocosTempo(prev => prev.filter(bloco => bloco.id !== id));
      return true;
    } catch (error: any) {
      setError(error.message);
      console.error('Erro ao remover bloco de tempo:', error);
      return false;
    }
  };

  // Carregar blocos de tempo inicialmente
  useEffect(() => {
    carregarBlocosTempo();
    
    // Configurar subscrição em tempo real para blocos de tempo
    const channel = supabase
      .channel('blocos-tempo-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'blocos_tempo',
      }, () => {
        // Recarregar blocos de tempo quando houver mudanças
        carregarBlocosTempo();
      })
      .subscribe();
    
    // Limpar subscrição ao desmontar
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    blocosTempo,
    loading,
    error,
    carregarBlocosTempo,
    adicionarBlocoTempo,
    atualizarBlocoTempo,
    removerBlocoTempo
  };
} 