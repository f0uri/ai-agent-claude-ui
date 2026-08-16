import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import TopBar from './components/TopBar'

const STORAGE_KEY = 'ai-agent-conversations'
const THEME_KEY = 'ai-agent-theme'

export default function App() {
  const [conversations, setConversations] = useState([])
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [theme, setTheme] = useState('dark')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load conversations and theme from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setConversations(parsed)
        if (parsed.length > 0) setActiveConversationId(parsed[0].id)
      } catch (e) {
        console.error('Failed to parse conversations', e)
      }
    }

    const storedTheme = localStorage.getItem(THEME_KEY) || 'dark'
    setTheme(storedTheme)
    document.documentElement.classList.toggle('dark', storedTheme === 'dark')
    document.documentElement.classList.toggle('light', storedTheme === 'light')
    setIsHydrated(true)
  }, [])

  // Save conversations
  useEffect(() => {
    if (!isHydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
  }, [conversations, isHydrated])

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setSidebarOpen(false)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem(THEME_KEY, newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    document.documentElement.classList.toggle('light', newTheme === 'light')
  }

  // Create new conversation
  const createNewConversation = useCallback((initial = {}) => {
    const newConv = {
      id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: initial.title || 'محادثة جديدة',
      messages: initial.messages || [],
      createdAt: new Date().toISOString(),
    }

    setConversations(prev => [newConv, ...prev])
    setActiveConversationId(newConv.id)
    if (isMobile) setSidebarOpen(false)

    return newConv
  }, [isMobile])

  // Delete conversation
  const deleteConversation = (id) => {
    const updated = conversations.filter(c => c.id !== id)
    setConversations(updated)
    if (activeConversationId === id) {
      setActiveConversationId(updated.length > 0 ? updated[0].id : null)
    }
  }

  // Update conversation
  const updateConversation = useCallback((id, updates) => {
    setConversations(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    )
  }, [])

  // Get active conversation
  const activeConversation = conversations.find(c => c.id === activeConversationId)

  return (
    <div className="app-shell h-[100dvh] w-screen overflow-hidden text-[#2c2723] dark:text-[#f4eee8]">
      <div className="safe-shell h-full w-full p-0 md:p-4 lg:p-6">
        <div className="mx-auto flex h-full w-full max-w-[1480px] overflow-hidden bg-white/80 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-2xl dark:bg-[#1f1b18]/[0.72] md:rounded-[34px] md:border md:border-black/5 dark:md:border-white/[0.12]">
          <Sidebar
            conversations={conversations}
            activeId={activeConversationId}
            onSelect={(id) => {
              setActiveConversationId(id)
              if (isMobile) setSidebarOpen(false)
            }}
            onNew={createNewConversation}
            onDelete={deleteConversation}
            isOpen={sidebarOpen}
            isMobile={isMobile}
            onClose={() => setSidebarOpen(false)}
            theme={theme}
          />

          <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[#fbf7f1]/90 dark:bg-[#191715]/[0.88]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,rgba(217,119,87,0.18),transparent_62%)]" />
            <TopBar
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              onToggleTheme={toggleTheme}
              theme={theme}
              sidebarOpen={sidebarOpen}
              conversation={activeConversation}
            />
            <ChatArea
              conversation={activeConversation}
              onUpdateConversation={updateConversation}
              onNewConversation={createNewConversation}
            />
          </main>
        </div>
      </div>
    </div>
  )
}
