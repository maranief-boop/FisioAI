import { useMemo, useState } from 'react'
import { marked } from 'marked'
import katex from 'katex'
import { generateFlashcards, generateConceptMap } from '../services/studyContent'
import { downloadFlashcardsPdf, downloadConceptMapPdf } from '../utils/export'
import FlashcardDeck from './FlashcardDeck'
import ConceptMap from './ConceptMap'

const MATH_PATTERN = /\$\$([\s\S]*?)\$\$|\$([^$\n]+?)\$/g

function renderKatex(text) {
  const blocks = []
  let idx = 0
  const processed = text.replace(MATH_PATTERN, (_, block, inline) => {
    const placeholder = `%%KATEX_${idx}%%`
    try {
      const html = katex.renderToString(block || inline, {
        throwOnError: false,
        displayMode: !!block
      })
      blocks.push(html)
    } catch {
      blocks.push(block || inline)
    }
    idx++
    return placeholder
  })

  const html = marked.parse(processed, { breaks: true, gfm: true })
  return html.replace(/%%KATEX_(\d+)%%/g, (_, id) => blocks[+id])
}

function Spinner() {
  return (
    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function StudyButton({ onClick, loading, icon, children, className }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? <Spinner /> : icon}
      {loading ? 'Gerando...' : children}
    </button>
  )
}

const FLASHCARD_ICON = (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><path d="M8 14h4" />
  </svg>
)

const MAP_ICON = (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" />
    <path d="M12 7v6l-4 4M12 13l4 4" />
  </svg>
)

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  const [flashcards, setFlashcards] = useState(null)
  const [conceptMap, setConceptMap] = useState(null)
  const [loadingCards, setLoadingCards] = useState(false)
  const [loadingMap, setLoadingMap] = useState(false)
  const [genError, setGenError] = useState('')

  const html = useMemo(() => {
    return renderKatex(message.text)
  }, [message.text])

  const handleFlashcards = async () => {
    setGenError('')
    setLoadingCards(true)
    try {
      const cards = await generateFlashcards(message.text)
      setFlashcards(cards)
    } catch {
      setGenError('Não foi possível gerar os flashcards. Tente novamente.')
    } finally {
      setLoadingCards(false)
    }
  }

  const handleConceptMap = async () => {
    setGenError('')
    setLoadingMap(true)
    try {
      const map = await generateConceptMap(message.text)
      setConceptMap(map)
    } catch {
      setGenError('Não foi possível gerar o mapa conceitual. Tente novamente.')
    } finally {
      setLoadingMap(false)
    }
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 ${
        isUser
          ? 'bg-primary-600 text-white rounded-br-md'
          : 'bg-surface-800 text-surface-50 rounded-bl-md'
      }`}>
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
        ) : (
          <>
            <div
              className="prose prose-invert prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            <div className="mt-3 pt-3 border-t border-surface-700">
              <div className="flex flex-wrap items-center gap-2">
                <StudyButton
                  onClick={handleFlashcards}
                  loading={loadingCards}
                  icon={FLASHCARD_ICON}
                  className="text-primary-300 hover:bg-primary-600/15 hover:text-primary-200 border-primary-500/40"
                >
                  Gerar Flashcards
                </StudyButton>
                <StudyButton
                  onClick={handleConceptMap}
                  loading={loadingMap}
                  icon={MAP_ICON}
                  className="text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-200 border-cyan-500/40"
                >
                  Gerar Mapa Conceitual
                </StudyButton>
              </div>

              {genError && (
                <p className="mt-2 text-[11px] text-red-400">{genError}</p>
              )}

              {flashcards && (
                <FlashcardDeck
                  cards={flashcards}
                  onDownload={() => downloadFlashcardsPdf(flashcards)}
                />
              )}

              {conceptMap && (
                <ConceptMap
                  data={conceptMap}
                  onDownloadPdf={() => downloadConceptMapPdf(conceptMap)}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}