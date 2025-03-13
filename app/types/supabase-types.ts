export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/**
 * Definição da estrutura do banco de dados Supabase
 * Esta interface representa todas as tabelas no esquema público
 */
export interface Database {
  public: {
    Tables: {
      configuracoes_usuario: {
        Row: {
          id: string
          user_id: string
          tema: string
          notificacoes_ativas: boolean
          tamanho_fonte: string
          alto_contraste: boolean
          tempo_foco: number
          tempo_pausa: number
          tema_escuro: boolean
          reducao_estimulos: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tema?: string
          notificacoes_ativas?: boolean
          tamanho_fonte?: string
          alto_contraste?: boolean
          tempo_foco?: number
          tempo_pausa?: number
          tema_escuro?: boolean
          reducao_estimulos?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tema?: string
          notificacoes_ativas?: boolean
          tamanho_fonte?: string
          alto_contraste?: boolean
          tempo_foco?: number
          tempo_pausa?: number
          tema_escuro?: boolean
          reducao_estimulos?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string | null
        }
      }

      // Tabela de tarefas
      tarefas: {
        Row: {
          id: string
          user_id: string
          texto: string
          concluida: boolean
          categoria: 'inicio' | 'alimentacao' | 'estudos' | 'saude' | 'lazer'
          data: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          texto: string
          concluida?: boolean
          categoria: 'inicio' | 'alimentacao' | 'estudos' | 'saude' | 'lazer'
          data: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          texto?: string
          concluida?: boolean
          categoria?: 'inicio' | 'alimentacao' | 'estudos' | 'saude' | 'lazer'
          data?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }

      // Tabela de blocos de tempo
      blocos_tempo: {
        Row: {
          id: string
          user_id: string
          hora: string
          atividade: string
          categoria: 'inicio' | 'alimentacao' | 'estudos' | 'saude' | 'lazer' | 'nenhuma'
          data: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          hora: string
          atividade: string
          categoria: 'inicio' | 'alimentacao' | 'estudos' | 'saude' | 'lazer' | 'nenhuma'
          data: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          hora?: string
          atividade?: string
          categoria?: 'inicio' | 'alimentacao' | 'estudos' | 'saude' | 'lazer' | 'nenhuma'
          data?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocos_tempo_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }

      // Tabela de refeições
      refeicoes: {
        Row: {
          id: string
          user_id: string
          hora: string
          descricao: string
          foto: string | null
          data: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          hora: string
          descricao: string
          foto?: string | null
          data: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          hora?: string
          descricao?: string
          foto?: string | null
          data?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "refeicoes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }

      // Tabela de medicações
      medicacoes: {
        Row: {
          id: string
          user_id: string
          nome: string
          dosagem: string | null
          frequencia: string
          observacoes: string | null
          data_inicio: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nome: string
          dosagem?: string | null
          frequencia: string
          observacoes?: string | null
          data_inicio: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nome?: string
          dosagem?: string | null
          frequencia?: string
          observacoes?: string | null
          data_inicio?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicacoes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }

      // Tabela de horários de medicações
      medicacoes_horarios: {
        Row: {
          id: string
          medicacao_id: string
          horario: string
        }
        Insert: {
          id?: string
          medicacao_id: string
          horario: string
        }
        Update: {
          id?: string
          medicacao_id?: string
          horario?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicacoes_horarios_medicacao_id_fkey"
            columns: ["medicacao_id"]
            referencedRelation: "medicacoes"
            referencedColumns: ["id"]
          }
        ]
      }

      // Tabela de medicações tomadas
      medicacoes_tomadas: {
        Row: {
          id: string
          medicacao_id: string
          data: string
          horario: string
          tomada: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          medicacao_id: string
          data: string
          horario: string
          tomada?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          medicacao_id?: string
          data?: string
          horario?: string
          tomada?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicacoes_tomadas_medicacao_id_fkey"
            columns: ["medicacao_id"]
            referencedRelation: "medicacoes"
            referencedColumns: ["id"]
          }
        ]
      }

      // Tabela de registros de humor
      registros_humor: {
        Row: {
          id: string
          user_id: string
          data: string
          nivel: number
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          data: string
          nivel: number
          notas?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          data?: string
          nivel?: number
          notas?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "registros_humor_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }

      // Tabela de fatores de humor
      fatores_humor: {
        Row: {
          id: string
          registro_id: string
          fator: string
        }
        Insert: {
          id?: string
          registro_id: string
          fator: string
        }
        Update: {
          id?: string
          registro_id?: string
          fator?: string
        }
        Relationships: [
          {
            foreignKeyName: "fatores_humor_registro_id_fkey"
            columns: ["registro_id"]
            referencedRelation: "registros_humor"
            referencedColumns: ["id"]
          }
        ]
      }

      // Adicione as demais tabelas conforme necessário...
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Tipos auxiliares derivados da definição de Database

/**
 * Tipo representando um perfil de usuário
 */
export type Profile = Database['public']['Tables']['profiles']['Row']

/**
 * Tipo representando uma tarefa
 */
export type Tarefa = Database['public']['Tables']['tarefas']['Row']

/**
 * Tipo para inserção de uma nova tarefa
 */
export type TarefaInsert = Database['public']['Tables']['tarefas']['Insert']

/**
 * Tipo representando um bloco de tempo
 */
export type BlocoTempo = Database['public']['Tables']['blocos_tempo']['Row']

/**
 * Tipo representando uma refeição
 */
export type Refeicao = Database['public']['Tables']['refeicoes']['Row']

/**
 * Tipo representando uma medicação
 */
export type Medicacao = Database['public']['Tables']['medicacoes']['Row']

/**
 * Tipo personalizado para medicações com horários incluídos
 */
export type MedicacaoComHorarios = Medicacao & {
  horarios: string[]
  tomadas: Record<string, boolean>
}

export type MedicacaoTomada = Database['public']['Tables']['medicacoes_tomadas']['Row']

export type RegistroHumor = Database['public']['Tables']['registros_humor']['Row']

export type FatorHumor = Database['public']['Tables']['fatores_humor']['Row']

export type RegistroHumorComFatores = RegistroHumor & {
  fatores_humor: FatorHumor[]
} 