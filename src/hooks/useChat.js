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

    const historyForApi = messages
      .slice(-MAX_HISTORY_LENGTH)
      .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', text: m.text }))

    try {
      const reply = await sendMessage(text, historyForApi)
      append('assistant', reply)
    } catch (err) {
      let msg = err.message || 'Erro ao conectar com a IA. Verifique sua chave de API.'
      if (msg.includes('429') || msg.includes('quota')) {
        msg = '**Limite da API atingido.** A cota gratuita do Gemini foi excedida.\n\n**O que fazer:**\n1. Aguarde alguns minutos e tente novamente\n2. Acesse [Google AI Studio](https://aistudio.google.com/app/apikey) e crie **uma nova chave**\n3. Se precisar de mais uso, ative o plano pago ("Pay-as-you-go") no [Google Cloud Console](https://console.cloud.google.com/apis/enableflow?apiid=generativelanguage.googleapis.com)'
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
