import { useState } from 'react'
import { STORAGE_KEYS } from '../constants'

export default function SettingsDrawer({ isOpen, onClose, onApiKeySet }) {
  const [key, setKey] = useState(localStorage.getItem(STORAGE_KEYS.API_KEY) || '')
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(!!localStorage.getItem(STORAGE_KEYS.API_KEY))
  const [feedback, setFeedback] = useState('')

  const handleSave = () => {
    if (!key.trim()) return
    localStorage.setItem(STORAGE_KEYS.API_KEY, key.trim())
    setSaved(true)
    setFeedback('Chave salva com sucesso!')
    onApiKeySet(key.trim())
    setTimeout(() => { setFeedback(''); onClose() }, 800)
  }

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEYS.API_KEY)
    setKey('')
    setSaved(false)
    setFeedback('Chave removida.')
    onApiKeySet(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-surface-900 border-l border-surface-700 h-full animate-slide-up overflow-y-auto">
        <div className="p-5 border-b border-surface-700 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Configurações</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-surface-300 hover:text-white hover:bg-surface-700 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-6">
          <div>
            <label className="block text-sm font-medium text-surface-200 mb-2">
              Chave da API Gemini
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={e => { setKey(e.target.value); setFeedback('') }}
                placeholder="Cole sua API key aqui"
                className="w-full rounded-xl bg-surface-800 pl-4 pr-12 py-3 text-sm text-white placeholder-surface-700 border border-surface-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowKey(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-surface-400 hover:text-white transition-colors"
                tabIndex={-1}
                title={showKey ? 'Ocultar chave' : 'Mostrar chave'}
              >
                {showKey ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-surface-400 mt-2">
              Obtenha sua chave gratuitamente em{' '}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary-400 underline">
                Google AI Studio
              </a>
            </p>
          </div>

          {feedback && (
            <p className="text-xs text-emerald-400 flex items-center gap-1.5 animate-fade-in">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {feedback}
            </p>
          )}

          <div className="flex gap-2">
            <button onClick={handleSave} disabled={!key.trim()} className="flex-1 rounded-xl bg-primary-600 py-3 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-40 transition-colors">
              Salvar
            </button>
            {saved && (
              <button onClick={handleClear} className="rounded-xl bg-surface-700 py-3 px-4 text-sm font-medium text-surface-300 hover:text-white transition-colors">
                Remover
              </button>
            )}
          </div>

          <div className="border-t border-surface-700 pt-5">
            <h3 className="text-sm font-medium text-white mb-3">Sobre o FisioAI</h3>
            <div className="text-xs text-surface-400 space-y-2 leading-relaxed">
              <p>Assistente de Q&A especializado em Fisiologia Humana.</p>
              <p>Baseado na literatura clássica:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Guyton & Hall — Tratado de Fisiologia Médica</li>
                <li>Silverthorn — Fisiologia Humana</li>
                <li>Ganong — Fisiologia Médica</li>
                <li>Berne & Levy — Fisiologia</li>
                <li>Aires — Fisiologia</li>
                <li>Curi — Fisiologia Básica</li>
              </ul>
              <p className="pt-2">Versão 1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
