'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Tarefa, TarefaInsert } from '@/app/types/supabase-types';

/**
 * Hook para gerenciamento de tarefas usando Supabase
 * Exemplo de implementação com tipos fortemente tipados
 */
export function useTarefas() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar tarefas
  const carregarTarefas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('tarefas')
        .select('*')
        .order('data', { ascending: false });
      
      if (error) throw error;
      
      setTarefas(data || []);
    } catch (error: any) {
      setError(error.message);
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar tarefa
  const adicionarTarefa = async (novaTarefa: Omit<TarefaInsert, 'user_id'>) => {
    try {
      setError(null);
      
      // Obter ID do usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data, error } = await supabase
        .from('tarefas')
        .insert([{ ...novaTarefa, user_id: user.id }])
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setTarefas(prev => [...prev, data[0]]);
        return data[0];
      }
      
      return null;
    } catch (error: any) {
      setError(error.message);
      console.error('Erro ao adicionar tarefa:', error);
      return null;
    }
  };

  // Atualizar tarefa
  const atualizarTarefa = async (id: string, updates: Partial<Tarefa>) => {
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('tarefas')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setTarefas(prev => 
          prev.map(tarefa => 
            tarefa.id === id ? { ...tarefa, ...data[0] } : tarefa
          )
        );
        return true;
      }
      
      return false;
    } catch (error: any) {
      setError(error.message);
      console.error('Erro ao atualizar tarefa:', error);
      return false;
    }
  };

  // Remover tarefa
  const removerTarefa = async (id: string) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('tarefas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setTarefas(prev => prev.filter(tarefa => tarefa.id !== id));
      return true;
    } catch (error: any) {
      setError(error.message);
      console.error('Erro ao remover tarefa:', error);
      return false;
    }
  };

  // Alternar status de conclusão
  const alternarTarefaConcluida = async (id: string) => {
    const tarefa = tarefas.find(t => t.id === id);
    
    if (!tarefa) return false;
    
    return atualizarTarefa(id, { concluida: !tarefa.concluida });
  };

  // Carregar tarefas inicialmente
  useEffect(() => {
    carregarTarefas();
    
    // Configurar subscrição em tempo real para tarefas
    const channel = supabase
      .channel('tarefas-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tarefas',
      }, () => {
        // Recarregar tarefas quando houver mudanças
        carregarTarefas();
      })
      .subscribe();
    
    // Limpar subscrição ao desmontar
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    tarefas,
    loading,
    error,
    adicionarTarefa,
    atualizarTarefa,
    removerTarefa,
    alternarTarefaConcluida,
    recarregarTarefas: carregarTarefas
  };
} 