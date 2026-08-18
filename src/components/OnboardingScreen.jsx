import { useState } from 'react'
import Logo from './Logo'
import { STORAGE_KEYS, TUTORIAL_VIDEO_ID, FREE_SEARCH_LIMIT, SUBSCRIPTION_PRICE, SUBSCRIPTION_PERIOD } from '../constants'

const STEPS = [
  {
    num: 1,
    title: 'Acesse o Google AI Studio',
    desc: 'Crie ou faça login com sua conta Google para acessar o painel de APIs.',
    action: (
      <a
        href="https://aistudio.google.com/app/apikey"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
      >
        Abrir Google AI Studio
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </a>
    )
  },
  {
    num: 2,
    title: 'Gere sua chave de API',
    desc: 'No painel, clique em "Create API Key" e selecione ou crie um projeto. Uma chave será gerada automaticamente.',
    action: null
  },
  {
    num: 3,
    title: 'Copie e cole abaixo',
    desc: 'Copie a chave gerada (começa com "AIza...") e cole no campo de segurança abaixo.',
    action: null
  }
]

export default function OnboardingScreen({ onApiKeySet }) {
  const [key, setKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    const trimmed = key.trim()
    if (!trimmed) { setError('Informe sua chave da API Gemini.'); return }
    setError('')
    setLoading(true)
    localStorage.setItem(STORAGE_KEYS.API_KEY, trimmed)
    onApiKeySet(trimmed)
  }

  return (
    <div className="min-h-dvh bg-surface-900 flex flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-8">
        <div className="max-w-md mx-auto space-y-8 animate-fade-in">

          {/* Hero */}
          <div className="flex flex-col items-center pt-4">
            <Logo size={80} showSubtitle={false} className="flex-col items-center gap-4" />
            <p className="text-sm text-surface-300 mt-4 max-w-xs mx-auto leading-relaxed text-center">
              Assistente de Q&A de Fisiologia Humana para estudantes e profissionais da saúde
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            <p className="text-xs text-surface-400 uppercase tracking-wider font-semibold text-center">
              Configure sua chave de API gratuita
            </p>

            {STEPS.map((step) => (
              <div key={step.num} className="bg-surface-800 rounded-2xl border border-surface-700 p-4 animate-slide-up">
                <div className="flex gap-4">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-primary-600/20 text-primary-400 flex items-center justify-center text-sm font-bold">
                    {step.num}
                  </span>
                  <div className="space-y-1.5 min-w-0">
                    <h3 className="text-sm font-semibold text-white">{step.title}</h3>
                    <p className="text-xs text-surface-300 leading-relaxed">{step.desc}</p>
                    {step.action && <div className="pt-1">{step.action}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Video tutorial */}
          {TUTORIAL_VIDEO_ID && (
            <div className="bg-surface-800 rounded-2xl border border-surface-700 p-4 space-y-3 animate-slide-up">
              <p className="text-xs text-surface-400 uppercase tracking-wider font-semibold text-center">
                Vídeo tutorial (30-60s)
              </p>
              <div className="aspect-video rounded-xl overflow-hidden bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${TUTORIAL_VIDEO_ID}`}
                  title="Tutorial: como gerar sua chave de API no Google AI Studio"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <p className="text-xs text-surface-400 text-center">
                Aprenda passo a passo a gerar e copiar sua chave no Google AI Studio.
              </p>
            </div>
          )}

          {/* Free trial notice */}
          <div className="bg-surface-800 rounded-2xl border border-primary-700/40 p-4 flex gap-3 items-start animate-slide-up">
            <div className="shrink-0 w-8 h-8 rounded-full bg-primary-600/20 text-primary-400 flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white">Teste grátis: {FREE_SEARCH_LIMIT} pesquisas</h3>
              <p className="text-xs text-surface-300 leading-relaxed">
                Após o teste, assine por {SUBSCRIPTION_PRICE}/{SUBSCRIPTION_PERIOD} e continue com acesso ilimitado. Sua chave fica salva no seu aparelho.
              </p>
            </div>
          </div>

          {/* Input + CTA */}
          <div className="bg-surface-800 rounded-2xl border border-surface-700 p-5 space-y-4">
            <label className="block text-sm font-medium text-surface-200">
              Sua chave da API Gemini
            </label>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={e => { setKey(e.target.value); setError('') }}
                placeholder="Cole sua chave de API do Gemini aqui..."
                className="w-full rounded-xl bg-surface-900 pl-4 pr-12 py-3.5 text-sm text-white placeholder-surface-600 border border-surface-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowKey(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-surface-400 hover:text-white transition-colors"
                tabIndex={-1}
                title={showKey ? 'Ocultar chave' : 'Mostrar chave'}
              >
                {showKey ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-400 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {error}
              </p>
            )}

            <button
              onClick={handleStart}
              disabled={!key.trim() || loading}
              className="w-full rounded-xl bg-primary-600 py-3.5 text-sm font-semibold text-white hover:bg-primary-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Inicializando...
                </>
              ) : (
                'Salvar Chave e Acessar o App'
              )}
            </button>
          </div>

          {/* Footer */}
          <p className="text-xs text-surface-500 text-center pb-4">
            Sua chave fica salva apenas no seu navegador. Nunca é enviada para nossos servidores.
          </p>
        </div>
      </div>
    </div>
  )
}
