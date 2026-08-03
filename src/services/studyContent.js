import { getModel } from './gemini'

const FLASHCARD_PROMPT = `
Você é um tutor de Fisiologia Humana especializado em técnicas de memorização ativa.

Transforme a resposta abaixo em flashcards de estudo no formato Pergunta/Resposta (frente e verso),
pensados para memorização em exames e provas.

Regras:
- Responda EXCLUSIVAMENTE com JSON válido, sem markdown, sem texto antes ou depois.
- Formato: {"cards":[{"q":"pergunta curta","a":"resposta concisa e direta"}]}
- 5 a 8 cards, cobrindo os conceitos-chave (definições, mecanismos, causa-consequência, termos técnicos).
- Perguntas curtas e objetivas. Respostas de 1 a 3 frases, sem detalhes irrelevantes.
- Quando houver íons, fórmulas ou valores, use notação de texto simples (ex: Na+, K+, Ca2+, mmHg, mV).

RESPOSTA ORIGINAL:
[ANSWER]
`.trim()

const CONCEPT_MAP_PROMPT = `
Você é um tutor de Fisiologia Humana especializado em organizar conhecimento visualmente.

Transforme a resposta abaixo em um mapa conceitual hierárquico de causa e efeito,
estruturado em tópicos (uma árvore de conceitos que mostra relações entre causa e consequência).

Regras:
- Responda EXCLUSIVAMENTE com JSON válido, sem markdown, sem texto antes ou depois.
- Formato: {"title":"Título curto do mapa","children":[{"label":"Conceito central","detail":"explicação em 1-2 frases","children":[{"label":"...","detail":"...","children":[]}]}]}
- Máximo 4 níveis de profundidade.
- Cada nó deve ter um "label" (2-6 palavras) e, opcionalmente, um "detail" explicativo (1-2 frases).
- Hierarquia deve refletir relações causais: do conceito geral para os mecanismos específicos, terminando em consequências/efeitos.
- Sempre inclua a chave "children" (pode ser array vazio). Não omita campos.
- Quando houver íons, fórmulas ou valores, use notação de texto simples (ex: Na+, K+, Ca2+, mmHg, mV).

RESPOSTA ORIGINAL:
[ANSWER]
`.trim()

function extractJson(raw) {
  if (!raw) return null
  let text = raw.trim()
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  if (fence) text = fence[1].trim()

  const firstBrace = text.indexOf('{')
  const lastBrace = text.lastIndexOf('}')
  const firstBracket = text.indexOf('[')
  const lastBracket = text.lastIndexOf(']')

  const objStart = firstBrace === -1 ? firstBracket : firstBrace
  const objEnd = firstBrace === -1 ? lastBracket : lastBrace
  if (objStart === -1 || objEnd === -1 || objEnd <= objStart) return null

  try {
    return JSON.parse(text.slice(objStart, objEnd + 1))
  } catch {
    try {
      const cleaned = text
        .slice(objStart, objEnd + 1)
        .replace(/,\s*([}\]])/g, '$1')
      return JSON.parse(cleaned)
    } catch {
      return null
    }
  }
}

async function generateJsonContent(prompt) {
  const model = getModel()
  const result = await model.generateContent(prompt)
  const raw = result.response.text()
  const data = extractJson(raw)
  if (!data) throw new Error('Resposta do Gemini não pôde ser interpretada como JSON.')
  return data
}

export async function generateFlashcards(answerText) {
  const prompt = FLASHCARD_PROMPT.replace('[ANSWER]', answerText.slice(0, 12000))
  const data = await generateJsonContent(prompt)
  if (!Array.isArray(data.cards) || data.cards.length === 0) {
    throw new Error('Nenhum flashcard válido foi gerado.')
  }
  return data.cards
    .filter(c => c && typeof c.q === 'string' && typeof c.a === 'string' && c.q.trim() && c.a.trim())
    .map(c => ({ q: c.q.trim(), a: c.a.trim() }))
}

export async function generateConceptMap(answerText) {
  const prompt = CONCEPT_MAP_PROMPT.replace('[ANSWER]', answerText.slice(0, 12000))
  const data = await generateJsonContent(prompt)
  if (!data.title || !Array.isArray(data.children)) {
    throw new Error('Estrutura do mapa conceitual inválida.')
  }
  return data
}
