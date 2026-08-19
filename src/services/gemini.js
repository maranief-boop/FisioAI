import { SYSTEM_PROMPT } from '../utils/systemPrompt'
import { GEMINI_MODEL } from '../constants'

// Endpoint oficial: https://ai.google.dev/api/generate-content
// v1beta é a versão correta para os modelos Gemini atuais.
const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

const GENERATION_CONFIG = {
  temperature: 0.5,
  topP: 0.9,
  topK: 32,
  maxOutputTokens: 4096
}

// Nota: NÃO enviamos safetySettings. Para modelos Gemini 2.5+/3.x os
// filtros de segurança já vêm desligados por padrão e enviar
// "BLOCK_NONE" pode gerar erro 400 (INVALID_ARGUMENT).

let apiKey = null

export function initGemini(key) {
  apiKey = key
  return getModel()
}

// Mantém compatibilidade com o SDK para quem usa getModel().generateContent()
export function getModel() {
  return {
    async generateContent(prompt) {
      const text = await requestCompletion(prompt)
      return { response: { text: () => text } }
    }
  }
}

export async function sendMessage(message, history = []) {
  return requestCompletion(message, history)
}

export async function sendMessageWithPdfContext(message, pdfText, history = []) {
  const contextualizedMessage = pdfText
    ? `[CONTEXTO DOS PDFs DE FISIOLOGIA]\n${pdfText.slice(0, 30000)}\n\n[PERGUNTA DO USUÁRIO]\n${message}`
    : message
  return sendMessage(contextualizedMessage, history)
}

async function requestCompletion(message, history = []) {
  if (!apiKey) {
    throw new Error('Gemini não inicializado. Forneça uma API key.')
  }

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    generationConfig: GENERATION_CONFIG,
    contents: [
      ...(history || []).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : msg.role || 'user',
        parts: [{ text: msg.text || '' }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ]
  }

  const url = `${API_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const message = data?.error?.message || `Falha na chamada à API Gemini (HTTP ${res.status}).`
    const err = new Error(message)
    err.status = res.status
    err.raw = data
    throw err
  }

  const parts = data?.candidates?.[0]?.content?.parts
  const text = Array.isArray(parts)
    ? parts.map(p => p.text || '').join('')
    : ''

  if (!text && data?.promptFeedback?.blockReason) {
    throw new Error(`Solicitação bloqueada pela API Gemini (${data.promptFeedback.blockReason}).`)
  }

  if (!text) {
    throw new Error('A API Gemini retornou uma resposta vazia.')
  }

  return text
}