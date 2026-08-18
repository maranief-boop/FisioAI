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
  const url = `${SUPABASE_URL.replace(/\/+$/, '')}/functions/v1/validate-access`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({ email })
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'Falha ao validar o acesso. Tente novamente.')
  }
  const data = await res.json()
  return {
    active: !!data.active,
    expiresAt: data.expiresAt || null,
    email: data.email || email
  }
}
