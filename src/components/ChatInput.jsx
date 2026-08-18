import { useState, useRef, useEffect } from 'react'

export default function ChatInput({ onSend, isLoading, disabled, placeholder }) {
  const [text, setText] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (!isLoading && !disabled) inputRef.current?.focus()
  }, [isLoading, disabled])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim() || isLoading || disabled) return
    onSend(text.trim())
    setText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-surface-700 bg-surface-900 p-3 pb-6 md:pb-3">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <textarea
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Pergunte sobre Fisiologia Humana...'}
          rows={1}
          disabled={isLoading || disabled}
          className="flex-1 resize-none rounded-xl bg-surface-800 px-4 py-3 text-sm text-white placeholder-surface-700 border border-surface-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!text.trim() || isLoading || disabled}
          className="shrink-0 rounded-xl bg-primary-600 p-3 text-white hover:bg-primary-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>
    </form>
  )
}
