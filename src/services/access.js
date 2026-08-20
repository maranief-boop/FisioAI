import {
  STORAGE_KEYS,
  SUPABASE_URL,
  SUPABASE_ANON_KEY
} from '../constants'

export function getSearchesUsed() {
  try {
    const n = parseInt(localStorage.getItem(STORAGE_KEYS.SEARCHES_USED) || '0', 10)
    return isNaN(n) ? 0 : n
  } catch { return 0 }
}

export function saveSearchesUsed(count) {
  localStorage.setItem(STORAGE_KEYS.SEARCHES_USED, String(count))
}

export function getSubscription() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function saveSubscription(subscription) {
  localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(subscription))
}

export function clearSubscription() {
  localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTION)
}

export function isSubscriptionActive(subscription) {
  return !!(subscription && subscription.expiresAt && new Date(subscription.expiresAt).getTime() > Date.now())
}

export function isBackendConfigured() {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY)
}

export async function validateEmail(email) {
  console.log('[validateEmail] Config disponível?', {
    hasUrl: !!SUPABASE_URL,
    urlPrefix: SUPABASE_URL ? SUPABASE_URL.slice(0, 20) : null,
    hasKey: !!SUPABASE_ANON_KEY,
    keyLength: SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.length : 0
  })

  if (!isBackendConfigured()) {
    throw new Error('A validação de assinatura ainda não foi configurada. Entre em contato com o suporte.')
  }

  const normalized = (email || '').trim().toLowerCase()
  if (!normalized || !normalized.includes('@')) {
    throw new Error('Informe um e-mail válido.')
  }

  const base = SUPABASE_URL.replace(/\/+$/, '')
  const url = `${base}/rest/v1/subscriptions?email=eq.${encodeURIComponent(normalized)}&status=eq.active&select=email,expires_at,status`

  console.log('[validateEmail] URL:', url, 'E-mail:', normalized)

  let res
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      }
    })
    console.log('[validateEmail] Response status:', res.status, 'OK:', res.ok)
  } catch (fetchErr) {
    console.log('[validateEmail] Fetch error:', fetchErr.message)
    throw new Error('Falha de conexão. Verifique sua internet e tente novamente.')
  }

  if (!res.ok) {
    console.log('[validateEmail] Response not ok, status:', res.status)
    let errorText = ''
    try {
      errorText = await res.text()
    } catch (textErr) {
      console.log('[validateEmail] Erro ao ler corpo da resposta:', textErr.message)
    }
    console.log('[validateEmail] Error body:', errorText)
    throw new Error('Falha ao consultar o servidor. Tente novamente.')
  }

  // Normaliza a resposta: sempre um array. Se o Supabase retornar
  // vazio, undefined ou JSON de erro, usamos [] para evitar erros de .map.
  let rows = []
  try {
    const data = await res.json()
    console.log('[validateEmail] API response data:', data, 'type:', typeof data, 'isArray:', Array.isArray(data))
    if (Array.isArray(data)) {
      rows = data
    }
  } catch (jsonErr) {
    console.log('[validateError] JSON parse error:', jsonErr.message)
    rows = []
  }

  const row = Array.isArray(rows) ? rows[0] : null

  console.log('[validateEmail] rows count:', rows.length, 'first row:', row)

  if (!row || row.status !== 'active' || !row.expires_at) {
    return { active: false, expiresAt: null, email: normalized }
  }

  const active = new Date(row.expires_at).getTime() > Date.now()
  return {
    active,
    expiresAt: active ? row.expires_at : null,
    email: normalized
  }
}
