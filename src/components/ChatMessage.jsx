import { useMemo } from 'react'
import { marked } from 'marked'
import katex from 'katex'

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

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  const html = useMemo(() => {
    return renderKatex(message.text)
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
