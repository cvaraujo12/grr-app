'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

// Definição de tipos para registros de humor
interface RegistroHumor {
  id: string;
  user_id: string;
  data: string;
  nivel: number;
  notas: string | null;
  created_at: string;
  fatores: string[];
}

/**
 * Hook para gerenciamento de registros de humor usando Supabase
 */
export function useRegistrosHumor() {
  const [registros, setRegistros] = useState<RegistroHumor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar registros de humor
  const carregarRegistros = async (mes?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Obter ID do usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      // Construir consulta base
      let query = supabase
        .from('registros_humor')
        .select(`
          *,
          fatores_humor(fator)
        `)
        .eq('user_id', user.id)
        .order('data', { ascending: false });
      
      // Filtrar por mês se especificado
      if (mes) {
        const inicio = `${mes}-01`;
        const [ano, mesNum] = mes.split('-').map(Number);
        const fim = new Date(ano, mesNum, 0).toISOString().split('T')[0]; // Último dia do mês
        
        query = query.gte('data', inicio).lte('data', fim);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Processar os dados para o formato esperado
      const registrosProcessados = data?.map(item => ({
        ...item,
        fatores: item.fatores_humor?.map((f: any) => f.fator) || []
      })) || [];
      
      setRegistros(registrosProcessados);
    } catch (error: any) {
      setError(error.message);
      console.error('Erro ao carregar registros de humor:', error);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar registro de humor
  const adicionarRegistro = async (
    novoRegistro: {
      data: string;
      nivel: number;
      notas?: string;
      fatores: string[];
    }
  ) => {
    try {
      setError(null);
      
      // Obter ID do usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      // 1. Inserir o registro principal
      const { data: registroData, error: registroError } = await supabase
        .from('registros_humor')
        .insert([{
          user_id: user.id,
          data: novoRegistro.data,
          nivel: novoRegistro.nivel,
          notas: novoRegistro.notas || null
        }])
        .select();
      
      if (registroError) throw registroError;
      
      if (!registroData || registroData.length === 0) {
        throw new Error('Erro ao criar registro de humor');
      }
      
      const registroId = registroData[0].id;
      
      // 2. Inserir os fatores
      if (novoRegistro.fatores.length > 0) {
        const fatoresObjects = novoRegistro.fatores.map(fator => ({
          registro_id: registroId,
          fator
        }));
        
        const { error: fatoresError } = await supabase
          .from('fatores_humor')
          .insert(fatoresObjects);
        
        if (fatoresError) throw fatoresError;
      }
      
      // 3. Recarregar os dados
      await carregarRegistros();
      
      return registroId;
    } catch (error: any) {
      setError(error.message);
      console.error('Erro ao adicionar registro de humor:', error);
      return null;
    }
  };

  // Atualizar registro de humor
  const atualizarRegistro = async (
    id: string,
    updates: {
      nivel?: number;
      notas?: string | null;
      fatores?: string[];
    }
  ) => {
    try {
      setError(null);
      
      // 1. Atualizar dados básicos do registro
      if (updates.nivel !== undefined || updates.notas !== undefined) {
        const updateData: any = {};
        if (updates.nivel !== undefined) updateData.nivel = updates.nivel;
        if (updates.notas !== undefined) updateData.notas = updates.notas;
        
        const { error: updateError } = await supabase
          .from('registros_humor')
          .update(updateData)
          .eq('id', id);
        
        if (updateError) throw updateError;
      }
      
      // 2. Atualizar fatores, se fornecidos
      if (updates.fatores !== undefined) {
        // Remover fatores existentes
        const { error: deleteError } = await supabase
          .from('fatores_humor')
          .delete()
          .eq('registro_id', id);
        
        if (deleteError) throw deleteError;
        
        // Adicionar novos fatores
        if (updates.fatores.length > 0) {
          const fatoresObjects = updates.fatores.map(fator => ({
            registro_id: id,
            fator
          }));
          
          const { error: insertError } = await supabase
            .from('fatores_humor')
            .insert(fatoresObjects);
          
          if (insertError) throw insertError;
        }
      }
      
      // 3. Recarregar os dados
      await carregarRegistros();
      
      return true;
    } catch (error: any) {
      setError(error.message);
      console.error('Erro ao atualizar registro de humor:', error);
      return false;
    }
  };

  // Remover registro de humor
  const removerRegistro = async (id: string) => {
    try {
      setError(null);
      
      // As tabelas relacionadas serão excluídas automaticamente devido ao ON DELETE CASCADE
      const { error } = await supabase
        .from('registros_humor')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Atualizar estado
      setRegistros(prev => prev.filter(registro => registro.id !== id));
      
      return true;
    } catch (error: any) {
      setError(error.message);
      console.error('Erro ao remover registro de humor:', error);
      return false;
    }
  };

  // Obter estatísticas de humor
  const obterEstatisticas = async (inicio: string, fim: string) => {
    try {
      setError(null);
      
      // Obter ID do usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      // Buscar registros no período
      const { data, error } = await supabase
        .from('registros_humor')
        .select(`
          *,
          fatores_humor(fator)
        `)
        .eq('user_id', user.id)
        .gte('data', inicio)
        .lte('data', fim)
        .order('data', { ascending: true });
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return {
          media: 0,
          melhorDia: null,
          piorDia: null,
          fatoresPositivos: [],
          fatoresNegativos: []
        };
      }
      
      // Processar os registros
      const registrosProcessados = data.map(item => ({
        ...item,
        fatores: item.fatores_humor?.map((f: any) => f.fator) || []
      }));
      
      // Calcular média
      const soma = registrosProcessados.reduce((acc, reg) => acc + reg.nivel, 0);
      const media = soma / registrosProcessados.length;
      
      // Encontrar melhor e pior dia
      let melhorRegistro = registrosProcessados[0];
      let piorRegistro = registrosProcessados[0];
      
      for (const registro of registrosProcessados) {
        if (registro.nivel > melhorRegistro.nivel) {
          melhorRegistro = registro;
        }
        if (registro.nivel < piorRegistro.nivel) {
          piorRegistro = registro;
        }
      }
      
      // Analisar fatores
      const fatorContagem: Record<string, { soma: number, count: number }> = {};
      
      registrosProcessados.forEach(registro => {
        registro.fatores.forEach((fator: string) => {
          if (!fatorContagem[fator]) {
            fatorContagem[fator] = { soma: 0, count: 0 };
          }
          fatorContagem[fator].soma += registro.nivel;
          fatorContagem[fator].count += 1;
        });
      });
      
      // Calcular média por fator e classificar
      const fatoresMedia = Object.entries(fatorContagem).map(([fator, { soma, count }]) => ({
        fator,
        media: soma / count
      }));
      
      const fatoresPositivos = fatoresMedia
        .filter(f => f.media > 3)
        .sort((a, b) => b.media - a.media)
        .map(f => f.fator);
      
      const fatoresNegativos = fatoresMedia
        .filter(f => f.media <= 3)
        .sort((a, b) => a.media - b.media)
        .map(f => f.fator);
      
      return {
        media: Math.round(media * 10) / 10,
        melhorDia: melhorRegistro.data,
        piorDia: piorRegistro.data,
        fatoresPositivos,
        fatoresNegativos
      };
    } catch (error: any) {
      setError(error.message);
      console.error('Erro ao obter estatísticas de humor:', error);
      return null;
    }
  };

  // Carregar registros inicialmente
  useEffect(() => {
    carregarRegistros();
    
    // Configurar subscrição em tempo real
    const channel = supabase
      .channel('registros-humor-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'registros_humor',
      }, () => {
        carregarRegistros();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'fatores_humor',
      }, () => {
        carregarRegistros();
      })
      .subscribe();
    
    // Limpar subscrição ao desmontar
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    registros,
    loading,
    error,
    carregarRegistros,
    carregarRegistrosPorMes: carregarRegistros,
    adicionarRegistro,
    atualizarRegistro,
    removerRegistro,
    obterEstatisticas
  };
} 