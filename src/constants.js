export const APP_NAME = 'FisioAI'
export const STORAGE_KEYS = {
  API_KEY: '@fisioai/api_key',
  HISTORY: '@fisioai/history',
  SEARCHES_USED: '@fisioai/searches_used',
  SUBSCRIPTION: '@fisioai/subscription'
}
export const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.5-flash-lite'
export const MAX_HISTORY_LENGTH = 20

export const FREE_SEARCH_LIMIT = 2
export const SUBSCRIPTION_DAYS = 180

export const PAYMENT_URL = 'https://pay.kiwify.com.br/uUzoR23'
export const SUBSCRIPTION_PRICE = 'R$ 37,00'
export const SUBSCRIPTION_PERIOD = 'semestre'

// ID do vídeo do YouTube com o tutorial (parte "v=..." da URL do vídeo).
// Configure via VITE_TUTORIAL_VIDEO_ID no .env
export const TUTORIAL_VIDEO_ID = import.meta.env.VITE_TUTORIAL_VIDEO_ID || ''

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
