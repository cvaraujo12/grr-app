'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, PlusCircle, Edit2, Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import { Modal } from '@/app/components/ui/Modal'
import { Badge } from '@/app/components/ui/Badge'
import { useTarefas } from '@/app/hooks/useTarefas'
import { Tarefa } from '@/app/types/supabase-types'

export function ListaPrioridades() {
  const { 
    tarefas, 
    loading,
    adicionarTarefa, 
    atualizarTarefa, 
    removerTarefa, 
    alternarTarefaConcluida,
    recarregarTarefas
  } = useTarefas()
  
  const [novoTexto, setNovoTexto] = useState('')
  const [tarefaEditando, setTarefaEditando] = useState<Tarefa | null>(null)
  const [textoEditando, setTextoEditando] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [dataAtual, setDataAtual] = useState(new Date().toISOString().split('T')[0])
  const [tarefasExibidas, setTarefasExibidas] = useState<Tarefa[]>([])
  const [datasHistorico, setDatasHistorico] = useState<string[]>([])

  // Filtrar prioridades (tarefas da categoria 'inicio')
  const prioridades = tarefas.filter(tarefa => tarefa.categoria === 'inicio')

  // Atualizar tarefas exibidas quando mudar a data ou as tarefas
  useEffect(() => {
    const tarefasDoDia = prioridades.filter(tarefa => tarefa.data === dataAtual)
    setTarefasExibidas(tarefasDoDia)
  }, [prioridades, dataAtual])

  // Extrair datas únicas das prioridades
  useEffect(() => {
    const datasSet = new Set(prioridades.map(p => p.data))
    const datas = Array.from(datasSet).sort().reverse()
    setDatasHistorico(datas)
  }, [prioridades])

  // Verifica se estamos vendo o dia atual
  const isToday = () => {
    const hoje = new Date().toISOString().split('T')[0]
    return dataAtual === hoje
  }

  // Funções para navegação no histórico
  const irParaDataAnterior = () => {
    const indexAtual = datasHistorico.indexOf(dataAtual)
    if (indexAtual < datasHistorico.length - 1) {
      setDataAtual(datasHistorico[indexAtual + 1])
    }
  }

  const irParaDataProxima = () => {
    const indexAtual = datasHistorico.indexOf(dataAtual)
    if (indexAtual > 0) {
      setDataAtual(datasHistorico[indexAtual - 1])
    }
  }

  const voltarParaHoje = () => {
    setDataAtual(new Date().toISOString().split('T')[0])
  }

  // Função para adicionar nova prioridade
  const handleAdicionarPrioridade = async () => {
    if (!novoTexto.trim() || tarefasExibidas.length >= 3) return
    
    await adicionarTarefa({
      texto: novoTexto,
      concluida: false,
      categoria: 'inicio',
      data: dataAtual
    })
    
    setNovoTexto('')
  }

  // Função para iniciar edição
  const iniciarEdicao = (tarefa: Tarefa) => {
    setTarefaEditando(tarefa)
    setTextoEditando(tarefa.texto)
  }

  // Função para salvar edição
  const salvarEdicao = async () => {
    if (tarefaEditando && textoEditando.trim()) {
      await atualizarTarefa(tarefaEditando.id, { texto: textoEditando })
      setTarefaEditando(null)
    }
  }

  // Função para cancelar edição
  const cancelarEdicao = () => {
    setTarefaEditando(null)
  }

  // Formatar data para exibição (DD/MM/YYYY)
  const formatarData = (dataISO: string) => {
    const partes = dataISO.split('-')
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho com controles de histórico */}
      <div className="flex justify-between items-center mb-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowHistory(!showHistory)}
          aria-label={showHistory ? "Esconder histórico" : "Mostrar histórico"}
        >
          <Calendar className="h-4 w-4 mr-1" />
          {showHistory ? 'Esconder Histórico' : 'Ver Histórico'}
        </Button>
        
        {isToday() ? (
          <Badge>Hoje</Badge>
        ) : (
          <Badge variant="secondary">{formatarData(dataAtual)}</Badge>
        )}
      </div>

      {/* Controles de navegação no histórico */}
      {showHistory && (
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-lg mb-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={irParaDataAnterior}
            disabled={datasHistorico.indexOf(dataAtual) >= datasHistorico.length - 1}
            aria-label="Data anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-sm font-medium">
            {formatarData(dataAtual)}
            {!isToday() && (
              <Button 
                variant="link" 
                size="sm" 
                className="ml-2 underline text-blue-600 dark:text-blue-400"
                onClick={voltarParaHoje}
              >
                Voltar para hoje
              </Button>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={irParaDataProxima}
            disabled={datasHistorico.indexOf(dataAtual) <= 0}
            aria-label="Próxima data"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Lista de prioridades */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : tarefasExibidas.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            {isToday() ? (
              <p>Nenhuma prioridade definida para hoje.</p>
            ) : (
              <p>Nenhuma prioridade registrada para esta data.</p>
            )}
          </div>
        ) : (
          tarefasExibidas.map((tarefa) => (
            <div
              key={tarefa.id}
              className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                tarefa.concluida
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-white dark:bg-gray-800'
              }`}
            >
              {isToday() && (
                <button
                  onClick={() => alternarTarefaConcluida(tarefa.id)}
                  className="mr-3 text-green-600 dark:text-green-400 focus:outline-none"
                  aria-label={tarefa.concluida ? 'Marcar como não concluída' : 'Marcar como concluída'}
                >
                  {tarefa.concluida ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <Circle className="h-6 w-6" />
                  )}
                </button>
              )}
              
              <span
                className={`flex-1 ${
                  tarefa.concluida
                    ? 'text-gray-500 dark:text-gray-400 line-through'
                    : 'text-gray-900 dark:text-white'
                }`}
              >
                {tarefa.texto}
              </span>
              
              {isToday() && (
                <button
                  onClick={() => iniciarEdicao(tarefa)}
                  className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
                  aria-label="Editar prioridade"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input para adicionar nova prioridade (apenas no dia atual) */}
      {isToday() && tarefasExibidas.length < 3 && (
        <div className="flex items-center mt-4">
          <Input
            type="text"
            value={novoTexto}
            onChange={(e) => setNovoTexto(e.target.value)}
            placeholder="Nova prioridade..."
            className="flex-1"
            maxLength={50}
          />
          <Button
            onClick={handleAdicionarPrioridade}
            className="ml-2"
            aria-label="Adicionar prioridade"
          >
            <PlusCircle className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Mensagem quando atingir o limite de prioridades */}
      {isToday() && tarefasExibidas.length >= 3 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          Máximo de 3 prioridades para manter o foco.
        </p>
      )}

      {/* Modal de edição */}
      {tarefaEditando && (
        <Modal 
          isOpen={!!tarefaEditando} 
          onClose={cancelarEdicao} 
          title="Editar Prioridade"
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Editar Prioridade</h3>
              <Button variant="ghost" size="sm" onClick={cancelarEdicao}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <Input
              type="text"
              value={textoEditando}
              onChange={(e) => setTextoEditando(e.target.value)}
              className="mb-4"
              maxLength={50}
            />
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={cancelarEdicao}>
                Cancelar
              </Button>
              <Button onClick={salvarEdicao}>
                Salvar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
