import { useState, useEffect, useCallback } from 'react'
import { initGemini } from './services/gemini'
import ChatContainer from './components/ChatContainer'
import OnboardingScreen from './components/OnboardingScreen'
import SettingsDrawer from './components/SettingsDrawer'
import AccessLockModal from './components/AccessLockModal'
import { useChat } from './hooks/useChat'
import { useAccess, ACCESS_STATUS } from './hooks/useAccess'

export default function App() {
  const [ready, setReady] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { messages, isLoading, send, clearHistory } = useChat()
  const {
    apiKey,
    setApiKey,
    status,
    searchesUsed,
    lockOpen,
    setLockOpen,
    validating,
    validationError,
    handleValidate,
    sendWithLimit
  } = useAccess()

  useEffect(() => {
    if (apiKey) {
      try { initGemini(apiKey); setReady(true) }
      catch { setReady(false) }
    } else {
      setReady(false)
    }
  }, [apiKey])

  const handleSend = useCallback((text) => {
    if (isLoading) return
    sendWithLimit(send, text)
  }, [isLoading, sendWithLimit, send])

  const locked = status === ACCESS_STATUS.BLOCKED || status === ACCESS_STATUS.EXPIRED

  useEffect(() => {
    if (!isLoading && locked) setLockOpen(true)
  }, [isLoading, locked, setLockOpen])

  if (!ready) {
    return <OnboardingScreen onApiKeySet={setApiKey} />
  }

  return (
    <>
      <ChatContainer
        messages={messages}
        isLoading={isLoading}
        onSend={handleSend}
        onClear={clearHistory}
        onOpenSettings={() => setSettingsOpen(true)}
        trial={status === ACCESS_STATUS.TRIAL}
        locked={locked}
        searchesUsed={searchesUsed}
        onOpenLock={() => setLockOpen(true)}
      />
      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onApiKeySet={setApiKey}
      />
      <AccessLockModal
        key={lockOpen ? 'open' : 'closed'}
        isOpen={lockOpen}
        expired={status === ACCESS_STATUS.EXPIRED}
        validating={validating}
        error={validationError}
        onValidate={handleValidate}
        onClose={() => setLockOpen(false)}
      />
    </>
  )
}
