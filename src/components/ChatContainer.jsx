import { useEffect, useRef } from 'react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import EmptyState from './EmptyState'

export default function ChatContainer({ messages, isLoading, onSend, onClear, onOpenSettings }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-dvh bg-surface-900">
      <header className="shrink-0 border-b border-surface-700 bg-surface-900/80 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-sm font-bold">FA</div>
          <div>
            <h1 className="text-sm font-semibold text-white">FisioAI</h1>
            <p className="text-[11px] text-surface-200">Assistente de Fisiologia</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))
        )}
        <div ref={bottomRef} />
      </main>

      <ChatInput onSend={onSend} isLoading={isLoading} />
    </div>
  )
}
