'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Medicacao, MedicacaoComHorarios } from '@/app/types/supabase-types';

/**
 * Hook para gerenciamento de medicações usando Supabase
 * Inclui funcionalidades para horários e registro de tomadas
 */
export function useMedicacoes() {
  const [medicacoes, setMedicacoes] = useState<MedicacaoComHorarios[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar medicações com horários
  const carregarMedicacoes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obter ID do usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      // Buscar medicações
      const { data: medicacoesData, error: medicacoesError } = await supabase
        .from('medicacoes')
        .select('*')
        .eq('user_id', user.id)
        .order('nome');
      
      if (medicacoesError) throw medicacoesError;
      
      if (!medicacoesData || medicacoesData.length === 0) {
        setMedicacoes([]);
        return;
      }
      
      // Para cada medicação, buscar horários e tomadas
      const medicacoesCompletas = await Promise.all(
        medicacoesData.map(async (medicacao) => {
          // Buscar horários
          const { data: horariosData, error: horariosError } = await supabase
            .from('medicacoes_horarios')
            .select('horario')
            .eq('medicacao_id', medicacao.id);
          
          if (horariosError) throw horariosError;
          
          // Buscar tomadas dos últimos 7 dias
          const hoje = new Date();
          const dataInicio = new Date();
          dataInicio.setDate(hoje.getDate() - 7);
          
          const { data: tomadasData, error: tomadasError } = await supabase
            .from('medicacoes_tomadas')
            .select('*')
            .eq('medicacao_id', medicacao.id)
            .gte('data', dataInicio.toISOString().split('T')[0]);
          
          if (tomadasError) throw tomadasError;
          
          // Processar horários e tomadas
          const horarios = horariosData?.map(h => h.horario) || [];
          
          // Criar mapa de tomadas (chave: data-horario, valor: tomada ou não)
          const tomadas: Record<string, boolean> = {};
          tomadasData?.forEach(tomada => {
            tomadas[`${tomada.data}-${tomada.horario}`] = tomada.tomada;
          });
          
          return {
            ...medicacao,
            horarios,
            tomadas
          };
        })
      );
      
      setMedicacoes(medicacoesCompletas);
    } catch (error: any) {
      setError(error.message);
      console.error('Erro ao carregar medicações:', error);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar medicação
  const adicionarMedicacao = async (
    novaMedicacao: Omit<Medicacao, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
    horarios: string[]
  ) => {
    try {
      setError(null);
      
      // Obter ID do usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      // Iniciar transação com cliente RPC
      const { data: medicacaoData, error: medicacaoError } = await supabase
        .from('medicacoes')
        .insert([{ ...novaMedicacao, user_id: user.id }])
        .select();
      
      if (medicacaoError) throw medicacaoError;
      
      if (!medicacaoData || medicacaoData.length === 0) {
        throw new Error('Erro ao criar medicação');
      }
      
      const medicacaoId = medicacaoData[0].id;
      
      // Adicionar horários
      if (horarios.length > 0) {
        const horariosObjects = horarios.map(horario => ({
          medicacao_id: medicacaoId,
          horario
        }));
        
        const { error: horariosError } = await supabase
          .from('medicacoes_horarios')
          .insert(horariosObjects);
        
        if (horariosError) throw horariosError;
      }
      
      // Recarregar medicações
      await carregarMedicacoes();
      
      return medicacaoId;
    } catch (error: any) {
      setError(error.message);
      console.error('Erro ao adicionar medicação:', error);
      return null;
    }
  };

  // Atualizar medicação
  const atualizarMedicacao = async (
    id: string,
    updates: Partial<Omit<Medicacao, 'id' | 'user_id' | 'created_at' | 'updated_at'>>,
    horarios?: string[]
  ) => {
    try {
      setError(null);
      
      // Atualizar dados básicos da medicação
      const { error: medicacaoError } = await supabase
        .from('medicacoes')
        .update(updates)
        .eq('id', id);
      
      if (medicacaoError) throw medicacaoError;
      
      // Se horários foram fornecidos, atualizar
      if (horarios !== undefined) {
        // Remover horários existentes
        const { error: deleteError } = await supabase
          .from('medicacoes_horarios')
          .delete()
          .eq('medicacao_id', id);
        
        if (deleteError) throw deleteError;
        
        // Adicionar novos horários
        if (horarios.length > 0) {
          const horariosObjects = horarios.map(horario => ({
            medicacao_id: id,
            horario
          }));
          
          const { error: insertError } = await supabase
            .from('medicacoes_horarios')
            .insert(horariosObjects);
          
          if (insertError) throw insertError;
        }
      }
      
      // Recarregar medicações
      await carregarMedicacoes();
      
      return true;
    } catch (error: any) {
      setError(error.message);
      console.error('Erro ao atualizar medicação:', error);
      return false;
    }
  };

  // Remover medicação
  const removerMedicacao = async (id: string) => {
    try {
      setError(null);
      
      // As tabelas relacionadas serão excluídas automaticamente devido ao ON DELETE CASCADE
      const { error } = await supabase
        .from('medicacoes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Atualizar estado
      setMedicacoes(prev => prev.filter(med => med.id !== id));
      
      return true;
    } catch (error: any) {
      setError(error.message);
      console.error('Erro ao remover medicação:', error);
      return false;
    }
  };

  // Registrar tomada de medicação
  const registrarTomadaMedicacao = async (medicacaoId: string, data: string, horario: string, tomada: boolean) => {
    try {
      setError(null);
      
      // Verificar se já existe um registro para esta data e horário
      const { data: registros, error: consultaError } = await supabase
        .from('medicacoes_tomadas')
        .select('*')
        .eq('medicacao_id', medicacaoId)
        .eq('data', data)
        .eq('horario', horario);
      
      if (consultaError) throw consultaError;
      
      let error;
      
      if (registros && registros.length > 0) {
        // Atualizar registro existente
        const { error: updateError } = await supabase
          .from('medicacoes_tomadas')
          .update({ 
            tomada, 
            tomada_em: tomada ? new Date().toISOString() : null 
          })
          .eq('id', registros[0].id);
        
        error = updateError;
      } else {
        // Criar novo registro
        const { error: insertError } = await supabase
          .from('medicacoes_tomadas')
          .insert([{ 
            medicacao_id: medicacaoId, 
            data, 
            horario, 
            tomada, 
            tomada_em: tomada ? new Date().toISOString() : null 
          }]);
        
        error = insertError;
      }
      
      if (error) throw error;
      
      // Atualizar estado local
      setMedicacoes(prev => 
        prev.map(med => {
          if (med.id === medicacaoId) {
            return {
              ...med,
              tomadas: {
                ...med.tomadas,
                [`${data}-${horario}`]: tomada
              }
            };
          }
          return med;
        })
      );
      
      return true;
    } catch (error: any) {
      setError(error.message);
      console.error('Erro ao registrar tomada de medicação:', error);
      return false;
    }
  };

  // Carregar medicações inicialmente
  useEffect(() => {
    carregarMedicacoes();
    
    // Configurar subscrição em tempo real
    const channel = supabase
      .channel('medicacoes-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'medicacoes',
      }, () => {
        carregarMedicacoes();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'medicacoes_horarios',
      }, () => {
        carregarMedicacoes();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'medicacoes_tomadas',
      }, () => {
        carregarMedicacoes();
      })
      .subscribe();
    
    // Limpar subscrição ao desmontar
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    medicacoes,
    loading,
    error,
    carregarMedicacoes,
    adicionarMedicacao,
    atualizarMedicacao,
    removerMedicacao,
    registrarTomadaMedicacao
  };
} 