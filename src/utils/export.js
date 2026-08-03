let jsPDFPromise = null
function getJsPDF() {
  if (!jsPDFPromise) {
    jsPDFPromise = import('jspdf').then(m => m.jsPDF)
  }
  return jsPDFPromise
}

const APP_TAG = 'FisioAI — Assistente de Fisiologia Humana'

function stripMarkdown(text) {
  return String(text || '')
    .replace(/[*_`#>|]/g, '')
    .replace(/\${1,2}/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function ensureSpace(doc, needed, startY, pageHeight, margin, bottomMargin) {
  if (startY + needed > pageHeight - bottomMargin) {
    doc.addPage()
    return margin + 8
  }
  return startY
}

function drawHeader(doc, title) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 50

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(43, 70, 105)
  doc.text(title || 'FisioAI', margin, 18)

  doc.setDrawColor(99, 102, 241)
  doc.setLineWidth(1.2)
  doc.line(margin, 23, pageWidth - margin, 23)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(120, 120, 120)
  doc.text(APP_TAG, margin, 31)
}

function drawChildren(doc, children, x, y, maxWidth, pageHeight, margin, bottomMargin) {
  for (const child of children || []) {
    const labelLines = doc.splitTextToSize(child.label || '', maxWidth)
    const detailLines = child.detail
      ? doc.splitTextToSize(stripMarkdown(child.detail), maxWidth)
      : []

    const block = labelLines.length * 6 + 4 + detailLines.length * 4.5 + 4
    y = ensureSpace(doc, block + 2, y, pageHeight, margin, bottomMargin)

    const dotY = y + 3
    doc.setFillColor(30, 80, 160)
    doc.circle(x, dotY, 1.4, 'F')

    doc.setTextColor(30, 41, 59)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text(labelLines, x + 5, y + 4)

    if (detailLines.length) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(90, 90, 90)
      doc.text(detailLines, x + 5, y + 4 + labelLines.length * 6)
    }

    y += block + 6

    if (child.children?.length) {
      y = drawChildren(doc, child.children, x + 14, y, maxWidth - 14, pageHeight, margin, bottomMargin)
    }
  }
  return y
}

export async function downloadConceptMapPdf({ title, children }) {
  const jsPDF = await getJsPDF()
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 50
  const bottomMargin = 60
  const maxWidth = pageWidth - margin * 2

  drawHeader(doc, title || 'Mapa Conceitual')
  let y = margin + 8

  for (const root of children || []) {
    const labelLines = doc.splitTextToSize(root.label || '', maxWidth)
    const detailLines = root.detail
      ? doc.splitTextToSize(stripMarkdown(root.detail), maxWidth)
      : []
    const block = labelLines.length * 6 + 4 + detailLines.length * 4.5 + 4

    y = ensureSpace(doc, block + 2, y, pageHeight, margin, bottomMargin)

    doc.setFillColor(79, 70, 229)
    doc.roundedRect(margin - 6, y - 5, maxWidth + 12, block, 5, 5, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(labelLines, margin, y + 4)

    if (detailLines.length) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(230, 230, 255)
      doc.text(detailLines, margin, y + 4 + labelLines.length * 6)
    }

    y += block + 8

    if (root.children?.length) {
      y = drawChildren(doc, root.children, margin, y, maxWidth, pageHeight, margin, bottomMargin)
      y += 6
    }
  }

  doc.save('fisioai-mapa-conceitual.pdf')
}

export async function downloadFlashcardsPdf(cards) {
  const jsPDF = await getJsPDF()
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 50
  const bottomMargin = 60
  const maxWidth = pageWidth - margin * 2

  drawHeader(doc, 'Flashcards de Fisiologia')
  let y = 46

  cards.forEach((card) => {
    const qLines = doc.splitTextToSize(`Q: ${card.q}`, maxWidth - 20)
    const aLines = doc.splitTextToSize(`A: ${card.a}`, maxWidth - 20)
    const block = qLines.length * 12 + aLines.length * 11 + 24

    y = ensureSpace(doc, block + 4, y, pageHeight, margin, bottomMargin)

    doc.setFillColor(238, 242, 255)
    doc.roundedRect(margin, y, maxWidth, block, 8, 8, 'F')

    doc.setTextColor(67, 56, 202)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('PERGUNTA', margin + 10, y + 12)

    doc.setTextColor(30, 41, 59)
    doc.text(qLines, margin + 10, y + 22)

    const aStart = y + 22 + qLines.length * 12 + 4
    doc.setTextColor(67, 56, 202)
    doc.setFontSize(10)
    doc.text('RESPOSTA', margin + 10, aStart)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(70, 70, 70)
    doc.text(aLines, margin + 10, aStart + 10)

    y += block + 12
  })

  doc.save('fisioai-flashcards.pdf')
}

export function buildWhatsAppLink(title, content) {
  const cleanContent = (typeof content === 'string' ? content : '')
    .replace(/\$.*?\$/g, '')
    .replace(/[#*_`>]/g, '')
  const message = `${title}\n\n${cleanContent}\n\n— ${APP_TAG}`
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}

export function openWhatsApp(title, content) {
  window.open(buildWhatsAppLink(title, content), '_blank', 'noopener,noreferrer')
}
