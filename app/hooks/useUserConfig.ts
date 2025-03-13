import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { usePerfilStore } from '@/app/stores/perfilStore'

export function useUserConfig() {
  const [loading, setLoading] = useState(true)
  const { atualizarPreferenciasVisuais, atualizarNome } = usePerfilStore()

  useEffect(() => {
    async function loadUserConfig() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user?.id) {
          const { data: config, error } = await supabase
            .from('configuracoes_usuario')
            .select('*')
            .eq('user_id', session.user.id)
            .single()

          if (error) throw error

          if (config) {
            atualizarPreferenciasVisuais({
              altoContraste: config.alto_contraste,
              reducaoEstimulos: config.reducao_estimulos,
              textoGrande: config.tamanho_fonte === 'grande'
            })
          }

          // Carregar perfil do usuário
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .single()

          if (!profileError && profile) {
            atualizarNome(profile.full_name)
          }
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserConfig()
  }, [])

  return { loading }
} 