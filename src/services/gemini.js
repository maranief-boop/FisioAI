import { GoogleGenerativeAI } from '@google/generative-ai'
import { SYSTEM_PROMPT } from '../utils/systemPrompt'
import { GEMINI_MODEL } from '../constants'

let genAI = null
let model = null

export function initGemini(apiKey) {
  genAI = new GoogleGenerativeAI(apiKey)
  model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: SYSTEM_PROMPT
  })
  return model
}

export function getModel() {
  if (!model) throw new Error('Gemini não inicializado. Forneça uma API key.')
  return model
}

export async function sendMessage(message, history = []) {
  const m = getModel()
  const chat = m.startChat({
    history: (history || []).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    })),
    generationConfig: {
      temperature: 0.5,
      topP: 0.9,
      topK: 32,
      maxOutputTokens: 4096
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
    ]
  })

  const result = await chat.sendMessage(message)
  const response = result.response
  return response.text()
}

export async function sendMessageWithPdfContext(message, pdfText, history = []) {
  const m = getModel()
  const contextualizedMessage = pdfText
    ? `[CONTEXTO DOS PDFs DE FISIOLOGIA]\n${pdfText.slice(0, 30000)}\n\n[PERGUNTA DO USUÁRIO]\n${message}`
    : message

  return sendMessage(contextualizedMessage, history)
}
