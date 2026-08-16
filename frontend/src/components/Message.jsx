import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import { User, Sparkles, Copy, Check, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group my-3">
      <div className="flex items-center justify-between bg-[#1a1a1a] text-xs text-gray-400 px-4 py-1.5 rounded-t-lg border border-claude-border">
        <span className="font-mono">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-claude-accent transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'تم النسخ' : 'نسخ'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: '0 0 8px 8px',
          fontSize: '13px',
          direction: 'ltr',
          textAlign: 'left',
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  )
}

export default function Message({ message, isLast, onRegenerate }) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const handleCopyAll = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Render file attachments for user messages
  const fileAttachments = message.files?.length > 0 ? (
    <div className="flex flex-wrap gap-2 mt-2">
      {message.files.map((file, i) => {
        const isImage = file.type?.startsWith('image/')
        return (
          <div key={i} className="flex items-center gap-2 bg-claude-surface2 dark:bg-claude-surface2 light:bg-light-surface2 rounded-lg px-3 py-1.5">
            {isImage && file.url ? (
              <img src={file.url} alt={file.name} className="w-6 h-6 rounded object-cover" />
            ) : (
              <div className="w-6 h-6 rounded bg-claude-accent/15 flex items-center justify-center">
                <span className="text-[10px] text-claude-accent font-mono">
                  {(file.name || '').split('.').pop()?.toUpperCase().slice(0, 3) || 'FILE'}
                </span>
              </div>
            )}
            <span className="text-xs text-claude-textMuted max-w-32 truncate">
              {file.name}
            </span>
          </div>
        )
      })}
    </div>
  ) : null

  return (
    <div className="message-enter w-full">
      <div className={clsx(
        'flex gap-3 px-4 md:px-6 py-4 max-w-4xl mx-auto',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}>
        {/* Avatar */}
        <div className={clsx(
          'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
          isUser
            ? 'bg-claude-surface2 dark:bg-claude-surface2 light:bg-light-surface2'
            : 'bg-claude-accent'
        )}>
          {isUser ? (
            <User className="w-5 h-5 text-claude-textMuted" />
          ) : (
            <Sparkles className="w-5 h-5 text-white" />
          )}
        </div>

        {/* Message content */}
        <div className={clsx('flex-1 min-w-0', isUser && 'flex flex-col items-end')}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-claude-textMuted">
              {isUser ? 'أنت' : 'AI Agent'}
            </span>
          </div>

          <div className={clsx(
            'rounded-2xl px-4 py-3 max-w-full',
            isUser
              ? 'bg-claude-user dark:bg-claude-user light:bg-light-surface2 text-claude-text dark:text-claude-text light:text-light-text rounded-tr-sm'
              : 'bg-claude-assistant dark:bg-claude-assistant light:bg-light-surface text-claude-text dark:text-claude-text light:text-light-text rounded-tl-sm border border-claude-border dark:border-claude-border light:border-light-border'
          )}>
            {message.content ? (
              <div className="markdown-body">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '')
                      const value = String(children).replace(/\n$/, '')

                      if (!inline && match) {
                        return <CodeBlock language={match[1]} value={value} />
                      }

                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      )
                    },
                    a({ href, children }) {
                      return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex items-center gap-1 py-1">
                <span className="typing-dot animate-typing" style={{ animationDelay: '0s' }}></span>
                <span className="typing-dot animate-typing" style={{ animationDelay: '0.2s' }}></span>
                <span className="typing-dot animate-typing" style={{ animationDelay: '0.4s' }}></span>
              </div>
            )}
          </div>

          {fileAttachments}

          {/* Action buttons for assistant messages */}
          {!isUser && message.content && (
            <div className="flex items-center gap-1 mt-1.5 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopyAll}
                className="p-1.5 rounded-lg hover:bg-claude-surface2 dark:hover:bg-claude-surface2 light:hover:bg-light-surface2 text-claude-textMuted hover:text-claude-text transition-all-smooth"
                title="نسخ"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              {isLast && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-1.5 rounded-lg hover:bg-claude-surface2 dark:hover:bg-claude-surface2 light:hover:bg-light-surface2 text-claude-textMuted hover:text-claude-text transition-all-smooth"
                  title="إعادة توليد"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
