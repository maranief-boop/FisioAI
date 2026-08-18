import { useState, useCallback, useEffect } from 'react'
import { STORAGE_KEYS, FREE_SEARCH_LIMIT } from '../constants'
import {
  getSearchesUsed,
  saveSearchesUsed,
  getSubscription,
  saveSubscription,
  isSubscriptionActive,
  validateEmail
} from '../services/access'

export const ACCESS_STATUS = {
  ONBOARDING: 'onboarding',
  TRIAL: 'trial',
  ACTIVE: 'active',
  BLOCKED: 'blocked',
  EXPIRED: 'expired'
}

export function useAccess() {
  const [apiKey, setApiKeyState] = useState(() => localStorage.getItem(STORAGE_KEYS.API_KEY))
  const [searchesUsed, setSearchesUsedState] = useState(getSearchesUsed)
  const [subscription, setSubscriptionState] = useState(getSubscription)
  const [lockOpen, setLockOpen] = useState(false)
  const [validating, setValidating] = useState(false)
  const [validationError, setValidationError] = useState('')

  const status = !apiKey
    ? ACCESS_STATUS.ONBOARDING
    : subscription && isSubscriptionActive(subscription)
      ? ACCESS_STATUS.ACTIVE
      : searchesUsed >= FREE_SEARCH_LIMIT
        ? (subscription ? ACCESS_STATUS.EXPIRED : ACCESS_STATUS.BLOCKED)
        : ACCESS_STATUS.TRIAL

  // Revalida a assinatura quando o app volta a ficar visível
  useEffect(() => {
    const recheck = () => setSubscriptionState(getSubscription())
    const onVisibility = () => {
      if (document.visibilityState === 'visible') recheck()
    }
    window.addEventListener('focus', recheck)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('focus', recheck)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  const setApiKey = useCallback((key) => {
    if (key) {
      localStorage.setItem(STORAGE_KEYS.API_KEY, key)
      setApiKeyState(key)
    } else {
      localStorage.removeItem(STORAGE_KEYS.API_KEY)
      setApiKeyState(null)
    }
  }, [])

  const setSearchesUsed = useCallback((count) => {
    saveSearchesUsed(count)
    setSearchesUsedState(count)
  }, [])

  const handleValidate = useCallback(async (email) => {
    setValidating(true)
    setValidationError('')
    try {
      const result = await validateEmail(email)
      if (result.active) {
        const sub = { email: result.email, expiresAt: result.expiresAt }
        saveSubscription(sub)
        setSubscriptionState(sub)
        setLockOpen(false)
        return true
      }
      setValidationError('E-mail não encontrado ou assinatura inativa/expirada. Confira o e-mail usado na compra e tente novamente.')
      return false
    } catch (err) {
      setValidationError(err.message || 'Falha ao validar o acesso. Tente novamente.')
      return false
    } finally {
      setValidating(false)
    }
  }, [])

  const sendWithLimit = useCallback((send, text) => {
    if (status === ACCESS_STATUS.BLOCKED || status === ACCESS_STATUS.EXPIRED) {
      setLockOpen(true)
      return
    }
    if (status === ACCESS_STATUS.TRIAL) {
      const next = searchesUsed + 1
      setSearchesUsed(next)
      send(text)
    } else {
      send(text)
    }
  }, [status, searchesUsed, setSearchesUsed, send])

  return {
    apiKey,
    setApiKey,
    status,
    searchesUsed,
    searchesLeft: Math.max(0, FREE_SEARCH_LIMIT - searchesUsed),
    lockOpen,
    setLockOpen,
    validating,
    validationError,
    handleValidate,
    sendWithLimit
  }
}