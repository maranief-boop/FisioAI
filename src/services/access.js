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
  if (!isBackendConfigured()) {
    throw new Error('A validação de assinatura ainda não foi configurada. Entre em contato com o suporte.')
  }

  const normalized = email.trim().toLowerCase()
  const base = SUPABASE_URL.replace(/\/+$/, '')
  const url = `${base}/rest/v1/subscriptions?email=eq.${encodeURIComponent(normalized)}&status=eq.active&select=email,expires_at,status`

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`
    }
  })

  if (!res.ok) {
    throw new Error('Falha ao consultar o servidor. Tente novamente.')
  }

  const rows = await res.json()
  const row = Array.isArray(rows) ? rows[0] : rows

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
