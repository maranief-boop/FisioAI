import { useState, useEffect, useCallback } from 'react'
import { initGemini } from './services/gemini'
import { STORAGE_KEYS } from './constants'
import ChatContainer from './components/ChatContainer'
import OnboardingScreen from './components/OnboardingScreen'
import SettingsDrawer from './components/SettingsDrawer'
import { useChat } from './hooks/useChat'

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem(STORAGE_KEYS.API_KEY))
  const [ready, setReady] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { messages, isLoading, send, clearHistory } = useChat()

  useEffect(() => {
    if (apiKey) {
      try { initGemini(apiKey); setReady(true) }
      catch { setReady(false) }
    }
  }, [apiKey])

  const handleApiKeySet = useCallback((key) => {
    setApiKey(key)
    if (key) { initGemini(key); setReady(true) }
    else { setReady(false) }
  }, [])

  if (!ready) {
    return <OnboardingScreen onApiKeySet={handleApiKeySet} />
  }

  return (
    <>
      <ChatContainer
        messages={messages}
        isLoading={isLoading}
        onSend={send}
        onClear={clearHistory}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onApiKeySet={handleApiKeySet}
      />
    </>
  )
}
