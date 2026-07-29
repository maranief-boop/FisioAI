export default function EmptyState() {
  const suggestions = [
    "Explique o potencial de ação cardíaco passo a passo",
    "Como ocorre a filtração glomerular?",
    "Qual a diferença entre os tipos de fibras musculares?",
    "Descreva a cascata de coagulação sanguínea",
    "Como o sistema renina-angiotensina-aldosterona regula a pressão arterial?",
    "Explique o transporte de oxigênio pela hemoglobina"
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-12 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-primary-600/20 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-white mb-1">FisioAI</h2>
      <p className="text-sm text-surface-200 mb-6 max-w-sm">
        Assistente de Q&A de Fisiologia Humana. Baseado na literatura clássica de Guyton, Silverthorn, Ganong e outros.
      </p>
      <div className="w-full max-w-md space-y-2">
        <p className="text-xs text-surface-400 uppercase tracking-wider font-medium mb-3">Perguntas sugeridas</p>
        {suggestions.map((q, i) => (
          <button
            key={i}
            onClick={() => {
              const input = document.querySelector('textarea')
              if (input) { input.value = q; input.focus() }
            }}
            className="w-full text-left text-sm text-surface-300 bg-surface-800 hover:bg-surface-700 hover:text-white rounded-xl px-4 py-3 transition-colors border border-surface-700"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
