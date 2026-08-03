import { useState } from 'react'

export default function FlashcardDeck({ cards, onDownload }) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  if (!cards || cards.length === 0) return null

  const card = cards[index]

  const next = () => {
    setFlipped(false)
    setIndex(i => (i + 1) % cards.length)
  }

  const prev = () => {
    setFlipped(false)
    setIndex(i => (i - 1 + cards.length) % cards.length)
  }

  const handleFlip = (e) => {
    if (e.target.closest('button')) return
    setFlipped(f => !f)
  }

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-semibold text-surface-300 uppercase tracking-wider">
          Flashcards
        </p>
        <button
          onClick={onDownload}
          className="flex items-center gap-1.5 text-[11px] font-medium text-primary-400 hover:text-primary-300 transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Baixar PDF
        </button>
      </div>

      <div
        onClick={handleFlip}
        className="relative h-52 cursor-pointer select-none"
        style={{ perspective: '1200px' }}
      >
        <div
          className="relative w-full h-full transition-transform duration-500"
          style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'none' }}
        >
          <div
            className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 border border-primary-500/40 flex items-center justify-center p-6"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-center space-y-3">
              <span className="inline-block text-[10px] font-semibold text-primary-200 uppercase tracking-wider bg-primary-900/60 rounded-full px-3 py-1">
                Pergunta
              </span>
              <p className="text-sm font-medium text-white leading-relaxed max-w-xs">{card.q}</p>
              <p className="text-[10px] text-primary-300/70 pt-1">Toque para virar</p>
            </div>
          </div>

          <div
            className="absolute inset-0 rounded-xl bg-surface-800 border border-cyan-500/40 flex items-center justify-center p-6"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="text-center space-y-3">
              <span className="inline-block text-[10px] font-semibold text-cyan-300 uppercase tracking-wider bg-cyan-500/10 rounded-full px-3 py-1">
                Resposta
              </span>
              <p className="text-sm text-surface-50 leading-relaxed max-w-xs">{card.a}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <button
          onClick={prev}
          className="w-8 h-8 rounded-lg bg-surface-800 border border-surface-700 text-surface-300 hover:text-white hover:border-primary-500 flex items-center justify-center transition-colors"
          title="Anterior"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <span className="text-[11px] font-medium text-surface-400">
          {index + 1} / {cards.length}
        </span>

        <button
          onClick={next}
          className="w-8 h-8 rounded-lg bg-surface-800 border border-surface-700 text-surface-300 hover:text-white hover:border-primary-500 flex items-center justify-center transition-colors"
          title="Próximo"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  )
}
