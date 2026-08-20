import { useState } from 'react'
import {
  PAYMENT_URL,
  SUBSCRIPTION_PRICE,
  SUBSCRIPTION_PERIOD,
  FREE_SEARCH_LIMIT
} from '../constants'

export default function AccessLockModal({
  isOpen,
  expired,
  validating,
  error,
  onValidate,
  onClose
}) {
  const [email, setEmail] = useState('')
  const [showValidation, setShowValidation] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e) => {
    console.log('Botão clicado', { email, validating })
    e.preventDefault()
    if (!email.trim() || validating) return
    try {
      const result = onValidate(email.trim())
      if (result && typeof result.catch === 'function') {
        result.catch(err => {
          console.error('[Validar acesso] Erro na promessa de validação:', err)
        })
      }
    } catch (err) {
      console.error('[Validar acesso] Erro ao disparar validação:', err)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-md bg-surface-800 rounded-3xl border border-surface-700 shadow-2xl animate-slide-up max-h-[92dvh] overflow-y-auto">
        <div className="p-6 space-y-5">

          {/* Lock icon */}
          <div className="flex flex-col items-center text-center pt-2">
            <div className="w-16 h-16 rounded-full bg-amber-500/15 flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">
              {expired ? 'Assinatura expirada' : 'Teste gratuito encerrado'}
            </h2>
            <p className="text-sm text-surface-300 leading-relaxed mt-2">
              {expired
                ? 'Sua assinatura semestral chegou ao fim. Renove para continuar usando o FisioAI sem limites.'
                : `Você usou suas ${FREE_SEARCH_LIMIT} pesquisas gratuitas. Assine o FisioAI por ${SUBSCRIPTION_PRICE} por ${SUBSCRIPTION_PERIOD} e tenha acesso ilimitado.`}
            </p>
          </div>

          {/* CTA Kiwify */}
          <a
            href={PAYMENT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 text-sm font-semibold text-white hover:bg-primary-500 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.42 4.58a5.4 5.4 0 00-7.65 0l-.77.78-.77-.78a5.4 5.4 0 00-7.65 7.65l1.71 1.71 6.71 6.71 6.71-6.71 1.71-1.71a5.4 5.4 0 000-7.65z" />
            </svg>
            Assinar agora por {SUBSCRIPTION_PRICE}
          </a>
          <p className="text-xs text-surface-500 text-center -mt-2">
            Pagamento seguro via Kiwify — acesso por {SUBSCRIPTION_PERIOD} (6 meses)
          </p>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-surface-700" />
            <span className="text-xs text-surface-400">Já sou assinante</span>
            <div className="flex-1 h-px bg-surface-700" />
          </div>

          {!showValidation ? (
            <button
              type="button"
              onClick={() => setShowValidation(true)}
              className="w-full rounded-xl bg-surface-700 py-3 text-sm font-medium text-white hover:bg-surface-600 transition-colors"
            >
              Liberar meu acesso
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-xs text-surface-400 leading-relaxed">
                Digite o <strong className="text-surface-200">mesmo e-mail usado na compra</strong> para validar seu acesso automaticamente.
              </p>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                autoComplete="email"
                disabled={validating}
                className="w-full rounded-xl bg-surface-900 pl-4 pr-4 py-3 text-sm text-white placeholder-surface-600 border border-surface-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors disabled:opacity-60"
              />
              {error && (
                <p className="text-xs text-red-400 leading-relaxed">{error}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!email.trim() || validating}
                  className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
                >
                  {validating ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Validando...
                    </>
                  ) : 'Validar acesso'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowValidation(false)}
                  disabled={validating}
                  className="rounded-xl bg-surface-700 py-3 px-4 text-sm font-medium text-surface-300 hover:text-white transition-colors"
                >
                  Voltar
                </button>
              </div>
            </form>
          )}

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="w-full text-xs text-surface-500 hover:text-surface-300 transition-colors pt-1"
          >
            Continuar sem assinar
          </button>
        </div>
      </div>
    </div>
  )
}
