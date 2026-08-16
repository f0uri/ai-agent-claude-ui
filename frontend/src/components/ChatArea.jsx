import { useState, useRef, useEffect } from 'react'
import { Sparkles, FileText, Image as ImageIcon, FileCode, FileArchive, Wand2 } from 'lucide-react'
import Message from './Message'
import MessageInput from './MessageInput'
import { uploadFiles, sendChatMessage } from '../utils/api'

const SUGGESTIONS = [
  'لخّص هذا الملف بأسلوب واضح',
  'اكتب كود React منظم',
  'حلّل الصورة أو المستند',
]

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
  }, [messages, isLoading])

  const handleSend = async (text, files = []) => {
    let convId = conversation?.id
    let currentMessages = conversation?.messages || []

    if (!convId) {
      const newConversation = onNewConversation()
      convId = newConversation.id
      currentMessages = newConversation.messages || []
    }

    let uploadedFiles = []
    if (files.length > 0) {
      try {
        uploadedFiles = await uploadFiles(files)
      } catch (error) {
        console.error('File upload error:', error)
      }
    }

    const userMessage = {
      role: 'user',
      content: text,
      files: uploadedFiles.map(f => ({
        name: f.name,
        type: f.type,
        size: f.size,
        url: f.url,
        content: f.content,
      })),
      timestamp: new Date().toISOString(),
    }

    const assistantMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    }

    const updatedMessages = [...currentMessages, userMessage, assistantMessage]
    const title = currentMessages.length === 0
      ? (text?.slice(0, 40) || (uploadedFiles.length > 0 ? 'ملف مرفق' : 'محادثة جديدة'))
      : (conversation?.title || 'محادثة جديدة')

    onUpdateConversation(convId, {
      messages: updatedMessages,
      title,
    })

    setIsLoading(true)

    try {
      const response = await sendChatMessage({
        message: text,
        files: uploadedFiles,
        history: currentMessages,
      })

      const fullResponse = response.response || 'عذراً، لم أتمكن من معالجة طلبك.'
      const words = fullResponse.split(' ')
      let currentText = ''

      for (let i = 0; i < words.length; i++) {
        currentText += (i > 0 ? ' ' : '') + words[i]
        const streamingMessages = [...updatedMessages]
        streamingMessages[streamingMessages.length - 1] = {
          ...streamingMessages[streamingMessages.length - 1],
          content: currentText,
        }
        onUpdateConversation(convId, { messages: streamingMessages })
        await new Promise(r => setTimeout(r, 22))
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

  const handleRegenerate = async () => {
    if (!conversation || conversation.messages.length < 2 || isLoading) return

    const messagesWithoutLastAnswer = [...conversation.messages]
    if (messagesWithoutLastAnswer.at(-1)?.role === 'assistant') {
      messagesWithoutLastAnswer.pop()
    }

    const lastUserIndex = messagesWithoutLastAnswer.findLastIndex(m => m.role === 'user')
    if (lastUserIndex === -1) return

    const lastUser = messagesWithoutLastAnswer[lastUserIndex]
    const assistantMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    }
    const updatedMessages = [...messagesWithoutLastAnswer, assistantMessage]

    onUpdateConversation(conversation.id, { messages: updatedMessages })
    setIsLoading(true)

    try {
      const response = await sendChatMessage({
        message: lastUser.content,
        files: lastUser.files || [],
        history: messagesWithoutLastAnswer.slice(0, lastUserIndex),
      })

      const fullResponse = response.response || 'عذراً، لم أتمكن من معالجة طلبك.'
      const words = fullResponse.split(' ')
      let currentText = ''

      for (let i = 0; i < words.length; i++) {
        currentText += (i > 0 ? ' ' : '') + words[i]
        const streamingMessages = [...updatedMessages]
        streamingMessages[streamingMessages.length - 1] = {
          ...streamingMessages[streamingMessages.length - 1],
          content: currentText,
        }
        onUpdateConversation(conversation.id, { messages: streamingMessages })
        await new Promise(r => setTimeout(r, 22))
      }
    } catch (error) {
      console.error('Regenerate error:', error)
      const errorMessages = [...updatedMessages]
      errorMessages[errorMessages.length - 1] = {
        ...errorMessages[errorMessages.length - 1],
        content: '⚠️ حدث خطأ أثناء إعادة توليد الرد. حاول مرة أخرى لاحقاً.',
      }
      onUpdateConversation(conversation.id, { messages: errorMessages })
    } finally {
      setIsLoading(false)
    }
  }

  if (!conversation || messages.length === 0) {
    return (
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-5 py-8 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-[34px] bg-[#d97757]/[0.35] blur-2xl" />
            <div className="relative grid h-20 w-20 place-items-center rounded-[28px] bg-gradient-to-br from-[#f0b091] via-[#d97757] to-[#9f4633] text-white shadow-2xl shadow-[#d97757]/25">
              <Sparkles className="h-9 w-9" />
            </div>
          </div>

          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#d97757]/[0.18] bg-[#d97757]/10 px-3 py-1 text-xs font-bold text-[#bf6348] dark:text-[#f0a17d]">
            <Wand2 className="h-3.5 w-3.5" />
            تجربة تشبه Claude على iPhone
          </div>

          <h2 className="max-w-2xl text-3xl font-black tracking-[-0.04em] text-[#2c2723] dark:text-[#f7efe8] md:text-5xl">
            كيف أقدر أساعدك اليوم؟
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#817368] dark:text-[#b7aba2] md:text-base">
            مساعد ذكي بواجهة هادئة ومنظمة، يدعم المحادثات والملفات والصور والكود بنفس سلاسة تطبيقات iPhone.
          </p>

          <div className="mt-8 grid w-full max-w-3xl grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { icon: ImageIcon, label: 'الصور', desc: 'PNG, JPG, WebP' },
              { icon: FileText, label: 'المستندات', desc: 'PDF, Word, TXT' },
              { icon: FileCode, label: 'الكود', desc: 'JS, Python, HTML' },
              { icon: FileArchive, label: 'المضغوط', desc: 'ZIP, RAR, 7z' },
            ].map((feat) => (
              <div
                key={feat.label}
                className="group rounded-[24px] border border-black/5 bg-white/[0.55] p-4 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-1 hover:bg-white/80 hover:shadow-xl dark:border-white/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.09]"
              >
                <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-[#d97757]/[0.12] text-[#d97757] transition-transform group-hover:scale-110">
                  <feat.icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-bold text-[#2c2723] dark:text-[#f7efe8]">{feat.label}</p>
                <p className="mt-1 text-[11px] text-[#8f8175] dark:text-[#aea39b]">{feat.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex max-w-2xl flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSend(suggestion, [])}
                className="rounded-full border border-black/5 bg-white/[0.55] px-4 py-2 text-xs font-semibold text-[#5f534a] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-[#d8cec5] dark:hover:bg-white/[0.1]"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <MessageInput onSend={handleSend} disabled={isLoading} />
      </div>
    )
  }

  return (
    <div className="relative z-10 flex min-h-0 flex-1 flex-col">
      <div
        ref={messagesContainerRef}
        className="chat-scroll flex-1 overflow-y-auto px-2 py-5 md:px-4"
      >
        <div className="mx-auto w-full max-w-4xl space-y-1">
          {messages.map((msg, i) => (
            <Message
              key={`${msg.timestamp || i}-${i}`}
              message={msg}
              isLast={i === messages.length - 1 && msg.role === 'assistant' && Boolean(msg.content)}
              onRegenerate={handleRegenerate}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <MessageInput onSend={handleSend} disabled={isLoading} />
    </div>
  )
}
