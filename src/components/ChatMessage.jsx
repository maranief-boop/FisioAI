import { useMemo } from 'react'
import { marked } from 'marked'

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  const html = useMemo(() => {
    return marked.parse(message.text, { breaks: true, gfm: true })
  }, [message.text])

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
          <div
            className="prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </div>
  )
}
