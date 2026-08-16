import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import { User, Sparkles, Copy, Check, RefreshCw, FileText } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative my-3 overflow-hidden rounded-2xl border border-black/10 bg-[#171412] shadow-sm dark:border-white/[0.10]">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-[#d8cec5]">
        <span className="font-mono">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-full px-2 py-1 transition-colors hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'تم النسخ' : 'نسخ'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: '13px',
          direction: 'ltr',
          textAlign: 'left',
          background: '#171412',
          padding: '16px',
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

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(message.content || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const fileAttachments = message.files?.length > 0 ? (
    <div className={clsx('mt-2 flex flex-wrap gap-2', isUser ? 'justify-end' : 'justify-start')}>
      {message.files.map((file, i) => {
        const isImage = file.type?.startsWith('image/')
        return (
          <div
            key={`${file.name}-${i}`}
            className="flex max-w-[220px] items-center gap-2 rounded-2xl border border-black/5 bg-white/[0.55] px-3 py-2 shadow-sm backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.07]"
          >
            {isImage && file.url ? (
              <img src={file.url} alt={file.name} className="h-9 w-9 rounded-xl object-cover" />
            ) : (
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#d97757]/[0.12] text-[#d97757]">
                <FileText className="h-4 w-4" />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-[#3a312b] dark:text-[#f2e9df]">{file.name}</p>
              <p className="text-[10px] text-[#8f8175] dark:text-[#aea39b]">{file.type || 'ملف'}</p>
            </div>
          </div>
        )
      })}
    </div>
  ) : null

  return (
    <div className={clsx('message-enter group flex w-full py-3', isUser ? 'justify-end' : 'justify-start')}>
      <div className={clsx('flex max-w-[92%] gap-3 md:max-w-[82%]', isUser ? 'flex-row-reverse' : 'flex-row')}>
        <div className={clsx(
          'mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-2xl shadow-sm',
          isUser
            ? 'bg-[#2c2723] text-white dark:bg-[#f2e9df] dark:text-[#2c2723]'
            : 'bg-gradient-to-br from-[#efad8e] to-[#c45f42] text-white shadow-[#d97757]/20'
        )}>
          {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        </div>

        <div className={clsx('min-w-0 flex-1', isUser && 'flex flex-col items-end')}>
          <div className={clsx('mb-1 flex items-center gap-2 px-1', isUser && 'flex-row-reverse')}>
            <span className="text-[11px] font-bold text-[#8f8175] dark:text-[#aea39b]">
              {isUser ? 'أنت' : 'AI Agent'}
            </span>
            {message.timestamp && (
              <span className="text-[10px] text-[#a79a8e] dark:text-[#81766d]">
                {new Date(message.timestamp).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          <div className={clsx(
            'overflow-hidden rounded-[26px] px-4 py-3 text-sm leading-7 shadow-sm backdrop-blur-xl md:text-[15px]',
            isUser
              ? 'rounded-tr-md bg-[#2c2723] text-white shadow-black/10 dark:bg-[#f2e9df] dark:text-[#2c2723]'
              : 'rounded-tl-md border border-black/5 bg-white/70 text-[#2c2723] dark:border-white/[0.08] dark:bg-white/[0.07] dark:text-[#f4eee8]'
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
              <div className="flex items-center gap-1 py-1.5">
                <span className="typing-dot animate-typing" style={{ animationDelay: '0s' }} />
                <span className="typing-dot animate-typing" style={{ animationDelay: '0.2s' }} />
                <span className="typing-dot animate-typing" style={{ animationDelay: '0.4s' }} />
              </div>
            )}
          </div>

          {fileAttachments}

          {!isUser && message.content && (
            <div className="mt-2 flex items-center gap-1 px-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
              <button
                onClick={handleCopyAll}
                className="grid h-8 w-8 place-items-center rounded-full bg-black/[0.04] text-[#8f8175] transition-all hover:bg-black/[0.08] hover:text-[#2c2723] dark:bg-white/[0.06] dark:text-[#aea39b] dark:hover:bg-white/[0.1] dark:hover:text-white"
                title="نسخ"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              {isLast && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="grid h-8 w-8 place-items-center rounded-full bg-black/[0.04] text-[#8f8175] transition-all hover:bg-black/[0.08] hover:text-[#2c2723] dark:bg-white/[0.06] dark:text-[#aea39b] dark:hover:bg-white/[0.1] dark:hover:text-white"
                  title="إعادة توليد"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
