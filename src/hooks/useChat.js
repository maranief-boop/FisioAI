import { useState, useCallback, useRef } from 'react'
import { sendMessage } from '../services/gemini'
import { STORAGE_KEYS, MAX_HISTORY_LENGTH } from '../constants'

function loadHistory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY)
    return saved ? JSON.parse(saved) : []
  } catch { return [] }
}

export function useChat() {
  const [messages, setMessages] = useState(loadHistory)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const saveMessages = useCallback((msgs) => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(msgs))
  }, [])

  const append = useCallback((role, text) => {
    setMessages(prev => {
      const updated = [...prev, { role, text, id: Date.now() + Math.random() }]
      saveMessages(updated)
      return updated
    })
  }, [saveMessages])

  const send = useCallback(async (text) => {
    if (!text.trim() || isLoading) return
    setError(null)
    append('user', text)
    setIsLoading(true)

    const historyForApi = (messages || [])
      .slice(-MAX_HISTORY_LENGTH)
      .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', text: m.text }))

    try {
      const reply = await sendMessage(text, historyForApi)
      append('assistant', reply)
    } catch (err) {
      const raw = err.message || ''
      let msg
      if (raw.includes('API_KEY_INVALID') || raw.includes('API key not valid') || raw.includes('invalid api key')) {
        msg = '**Chave de API inválida.** A chave que você inseriu não é válida.\n\nAcesse [Google AI Studio](https://aistudio.google.com/app/apikey), crie uma nova chave em **"Create API key in new project"** e cole-a no app.'
      } else if (raw.includes('limit: 0') || raw.includes('not enabled')) {
        msg = '**API Gemini não habilitada para este projeto.**\n\nSua chave foi criada, mas a API Generative Language não está ativa.\n\n**Solução:**\n1. Acesse [Google Cloud Console](https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com)\n2. Clique em **"Enable"** (Ativar)\n3. Aguarde 1 minuto e tente novamente\n\n**Ou crie uma nova chave em novo projeto:**\n1. Vá em [Google AI Studio](https://aistudio.google.com/app/apikey)\n2. Clique em **"Create API Key" → "Create API key in new project"**\n3. Use essa nova chave'
      } else if (raw.includes('429') || raw.includes('quota') || raw.includes('RESOURCE_EXHAUSTED')) {
        msg = '**Limite de requisições atingido.** O plano gratuito do Gemini tem restrições de uso.\n\n**Solução definitiva (recomendada):**\n1. Acesse [Google Cloud Console](https://console.cloud.google.com/apis/enableflow?apiid=generativelanguage.googleapis.com)\n2. Ative o faturamento **(Pay-as-you-go)** — você continua dentro do plano gratuito, mas sem as restrições de cota\n3. Funciona imediatamente, sem custos se ficar dentro do limite gratuito'
      } else {
        msg = `**Erro na API Gemini.** ${raw.slice(0, 500)}`
      }
      setError(msg)
      append('assistant', `⚠️ **Erro:** ${msg}`)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, messages, append])

  const clearHistory = useCallback(() => {
    setMessages([])
    setError(null)
    localStorage.removeItem(STORAGE_KEYS.HISTORY)
  }, [])

  return { messages, isLoading, error, send, clearHistory }
}
