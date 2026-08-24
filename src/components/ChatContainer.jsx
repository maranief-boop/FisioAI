import { useEffect, useRef } from 'react'
import Logo from './Logo'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import EmptyState from './EmptyState'
import { FREE_SEARCH_LIMIT } from '../constants'

export default function ChatContainer({
  messages,
  isLoading,
  onSend,
  onClear,
  onOpenSettings,
  trial,
  locked,
  searchesUsed,
  onOpenLock
}) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-dvh bg-surface-900">
      <header className="shrink-0 border-b border-surface-700 bg-surface-900/80 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          {trial && (
            <span
              title="Pesquisas restantes do teste gratuito"
              className="text-xs font-medium text-surface-300 bg-surface-800 border border-surface-700 rounded-full px-3 py-1.5 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              Teste grátis: {Math.max(0, FREE_SEARCH_LIMIT - searchesUsed)}/{FREE_SEARCH_LIMIT}
            </span>
          )}
          {locked && (
            <button
              onClick={onOpenLock}
              title="Desbloquear acesso"
              className="text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/40 rounded-full px-3 py-1.5 hover:bg-amber-500/20 transition-colors"
            >
              Bloqueado — desbloquear
            </button>
          )}
          {messages.length > 0 && (
            <button onClick={onClear} title="Nova conversa" className="p-2 rounded-lg text-surface-300 hover:text-white hover:bg-surface-700 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
            </button>
          )}
          <button onClick={onOpenSettings} title="Configurações" className="p-2 rounded-lg text-surface-300 hover:text-white hover:bg-surface-700 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {!messages || messages.length === 0 ? (
          <EmptyState onSend={onSend} />
        ) : (
          (messages || []).map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))
        )}
        <div ref={bottomRef} />
      </main>

      {locked && (
        <div className="shrink-0 border-t border-surface-700 bg-surface-800/80 backdrop-blur-md px-4 py-2.5 text-center">
          <p className="text-xs text-surface-300">
            Teste gratuito encerrado.{' '}
            <button onClick={onOpenLock} className="text-primary-400 font-semibold hover:text-primary-300 underline underline-offset-2">
              Assinar ou validar acesso
            </button>
          </p>
        </div>
      )}

      <ChatInput
        onSend={onSend}
        isLoading={isLoading}
        disabled={locked}
        placeholder={locked ? 'Assine para continuar enviando mensagens...' : undefined}
      />
      <div className="mt-4 text-center text-sm text-surface-500">
        Precisa de ajuda? <a href="https://chat.whatsapp.com/Gvq0JSaRGn6IBps8Jz4o37?s=cl&p=a&ilr=1" target="_blank" rel="noopener noreferrer" className="text-primary-400 underline underline-offset-2">Entre no nosso grupo</a>
      </div>
    </div>
  )
}
