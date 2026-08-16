import { useState, useEffect, useRef, useCallback } from 'react'
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
  }, [])

  // Save conversations
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
    }
  }, [conversations])

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
  const createNewConversation = () => {
    const newConv = {
      id: `conv-${Date.now()}`,
      title: 'محادثة جديدة',
      messages: [],
      createdAt: new Date().toISOString(),
    }
    setConversations([newConv, ...conversations])
    setActiveConversationId(newConv.id)
    if (isMobile) setSidebarOpen(false)
  }

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
    <div className="flex h-screen w-screen overflow-hidden bg-claude-bg dark:bg-claude-bg light:bg-light-bg">
      {/* Sidebar */}
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

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopBar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onToggleTheme={toggleTheme}
          theme={theme}
          sidebarOpen={sidebarOpen}
        />
        <ChatArea
          conversation={activeConversation}
          onUpdateConversation={updateConversation}
          onNewConversation={createNewConversation}
        />
      </div>
    </div>
  )
}
