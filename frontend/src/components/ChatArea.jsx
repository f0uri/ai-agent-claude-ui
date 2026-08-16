import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, Send, FileText, Image as ImageIcon, FileCode, FileArchive, FileSpreadsheet } from 'lucide-react'
import Message from './Message'
import MessageInput from './MessageInput'
import { uploadFiles, sendChatMessage } from '../utils/api'

export default function ChatArea({ conversation, onUpdateConversation, onNewConversation }) {
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  const messages = conversation?.messages || []

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length, isLoading])

  // Auto-scroll while streaming
  useEffect(() => {
    if (isLoading && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (text, files) => {
    let convId = conversation?.id
    let currentMessages = conversation?.messages || []

    // If no conversation exists, create one
    if (!convId) {
      onNewConversation()
      return
    }

    // Upload files if any
    let uploadedFiles = []
    if (files.length > 0) {
      try {
        uploadedFiles = await uploadFiles(files)
      } catch (error) {
        console.error('File upload error:', error)
      }
    }

    // Add user message
    const userMessage = {
      role: 'user',
      content: text,
      files: uploadedFiles.map(f => ({ name: f.name, type: f.type, url: f.url })),
      timestamp: new Date().toISOString(),
    }

    // Add empty assistant message (for typing indicator)
    const assistantMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    }

    const updatedMessages = [...currentMessages, userMessage, assistantMessage]

    // Update title if it's the first message
    const title = currentMessages.length === 0 ? (text?.slice(0, 40) || (uploadedFiles.length > 0 ? 'ملف مرفق' : 'محادثة جديدة')) : conversation.title

    onUpdateConversation(convId, {
      messages: updatedMessages,
      title,
    })

    setIsLoading(true)

    try {
      // Send to API
      const response = await sendChatMessage({
        message: text,
        files: uploadedFiles,
        history: currentMessages,
      })

      // Simulate streaming response
      const fullResponse = response.response || 'عذراً، لم أتمكن من معالجة طلبك.'
      const words = fullResponse.split(' ')
      let currentText = ''

      for (let i = 0; i < words.length; i++) {
        currentText += (i > 0 ? ' ' : '') + words[i]
        // Update assistant message with streaming text
        const streamingMessages = [...updatedMessages]
        streamingMessages[streamingMessages.length - 1] = {
          ...streamingMessages[streamingMessages.length - 1],
          content: currentText,
        }
        onUpdateConversation(convId, { messages: streamingMessages })
        await new Promise(r => setTimeout(r, 30))
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessages = [...updatedMessages]
      errorMessages[errorMessages.length - 1] = {
        ...errorMessages[errorMessages.length - 1],
        content: '⚠️ حدث خطأ أثناء الاتصال بالخادم. تأكد من تشغيل الخادم الخلفي ثم حاول مرة أخرى.',
      }
      onUpdateConversation(convId, { messages: errorMessages })
    }

    setIsLoading(false)
  }

  const handleRegenerate = () => {
    if (!conversation || conversation.messages.length < 2) return
    const msgs = [...conversation.messages]
    // Remove last assistant message
    msgs.pop()
    // Get the last user message
    const lastUser = [...msgs].reverse().find(m => m.role === 'user')
    if (lastUser) {
      handleSend(lastUser.content, lastUser.files || [])
    }
  }

  // Empty state
  if (!conversation || messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-claude-accent flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-claude-text dark:text-claude-text light:text-light-text mb-2 text-center">
            كيف أقدر أساعدك؟
          </h2>
          <p className="text-claude-textMuted dark:text-claude-textMuted light:text-light-textMuted text-center max-w-md mb-8">
            مساعد ذكي يدعم جميع أنواع الملفات — صور، PDF، كود، Excel، عروض تقديمية، وأكثر
          </p>

          {/* Feature cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl">
            {[
              { icon: ImageIcon, label: 'الصور', desc: 'PNG, JPG, WebP, SVG' },
              { icon: FileText, label: 'المستندات', desc: 'PDF, Word, TXT' },
              { icon: FileCode, label: 'البرمجة', desc: 'JS, Python, HTML' },
              { icon: FileArchive, label: 'الملفات المضغوطة', desc: 'ZIP, RAR, 7z' },
            ].map((feat, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-claude-surface dark:bg-claude-surface light:bg-light-surface border border-claude-border dark:border-claude-border light:border-light-border"
              >
                <feat.icon className="w-6 h-6 text-claude-accent" />
                <span className="text-sm font-medium text-claude-text dark:text-claude-text light:text-light-text">
                  {feat.label}
                </span>
                <span className="text-[11px] text-claude-textMuted">
                  {feat.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        <MessageInput onSend={handleSend} disabled={isLoading} />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto py-4"
      >
        {messages.map((msg, i) => (
          <Message
            key={i}
            message={msg}
            isLast={i === messages.length - 1 && msg.role === 'assistant' && msg.content}
            onRegenerate={handleRegenerate}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput onSend={handleSend} disabled={isLoading} />
    </div>
  )
}
