import { useState } from 'react'
import { openWhatsApp } from '../utils/export'

function TreeNode({ node, depth = 0 }) {
  const [open, setOpen] = useState(true)
  const hasChildren = node.children && node.children.length > 0

  return (
    <div>
      <div className={`flex gap-2 ${depth > 0 ? 'pl-4 mt-1.5 border-l-2 border-surface-700' : ''}`}>
        {hasChildren && (
          <button
            onClick={() => setOpen(o => !o)}
            className="shrink-0 mt-1 w-4 h-4 rounded bg-surface-700 text-surface-300 hover:text-white hover:bg-primary-600 flex items-center justify-center transition-colors"
            title={open ? 'Recolher' : 'Expandir'}
          >
            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {open ? <path d="M18 15l-6-6-6 6" /> : <path d="M6 9l6 6 6-6" />}
            </svg>
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <span className={`shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full ${depth === 0 ? 'bg-cyan-400' : 'bg-primary-400'}`} />
            <div className="min-w-0">
              <p className={`text-sm font-semibold text-white leading-snug ${depth === 0 ? '' : 'text-[13px]'}`}>
                {node.label}
              </p>
              {node.detail && (
                <p className="text-[11px] text-surface-300 mt-0.5 leading-relaxed">{node.detail}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      {hasChildren && open && (
        <div className="ml-1.5">
          {node.children.map((child, i) => (
            <TreeNode key={i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function flattenText(node, depth = 0) {
  const indent = '  '.repeat(depth)
  let text = `${indent}• ${node.label}`
  if (node.detail) text += ` — ${node.detail.replace(/^/gm, '   ')}`
  const lines = [text]
  if (node.children) {
    node.children.forEach(c => lines.push(...flattenText(c, depth + 1)))
  }
  return lines
}

export default function ConceptMap({ data, onDownloadPdf }) {
  if (!data || !data.title) return null

  const shareText = (data.children || [])
    .map(c => flattenText(c, 1).join('\n'))
    .join('\n')

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-semibold text-surface-300 uppercase tracking-wider">
          Mapa Conceitual
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={onDownloadPdf}
            className="flex items-center gap-1.5 text-[11px] font-medium text-primary-400 hover:text-primary-300 transition-colors"
            title="Baixar PDF"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            PDF
          </button>
          <button
            onClick={() => openWhatsApp(data.title, shareText)}
            className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 ml-2 transition-colors"
            title="Enviar para o WhatsApp"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a10 10 0 0 0-8.66 15L2 22l5.11-1.32A10 10 0 1 0 12 2zm0 1.8a8.2 8.2 0 1 1-4.15 15.3l-.3-.18-3 .78.8-2.94-.2-.3A8.2 8.2 0 0 1 12 3.8zm-3.1 4.1c-.18 0-.47.07-.7.33-.24.25-.9.87-.9 2.13s.92 2.48 1.05 2.65c.13.17 1.82 2.78 4.41 3.9 2.16.93 2.6.74 3.06.7.47-.05 1.5-.62 1.71-1.21.21-.6.21-1.1.15-1.21-.13-.13-.31-.2-.48-.35-.17-.15-1.02-.5-1.18-.55-.16-.05-.28-.07-.4.08-.12.16-.46.55-.56.66-.1.1-.21.11-.37.04-.17-.08-.7-.25-1.33-.82-.5-.46-.83-1.02-.93-1.19-.1-.17-.01-.26.08-.35.08-.08.18-.21.27-.32.1-.1.13-.18.2-.3.06-.12.03-.25-.03-.35-.05-.11-.39-.94-.54-1.28-.15-.34-.29-.29-.4-.3l-.35-.03z" />
            </svg>
            WhatsApp
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-surface-800 border border-surface-700 p-4">
        <p className="text-xs font-semibold text-cyan-300 mb-3">{data.title}</p>
        <div className="space-y-1">
          {(data.children || []).map((node, i) => (
            <TreeNode key={i} node={node} />
          ))}
        </div>
      </div>
    </div>
  )
}