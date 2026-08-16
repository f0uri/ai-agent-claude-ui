import { useState, useRef, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File as FileIcon, X, Image as ImageIcon, FileText, FileCode, FileArchive, FileSpreadsheet, Presentation } from 'lucide-react'
import clsx from 'clsx'

const FILE_ICONS = {
  'image/': ImageIcon,
  'text/': FileText,
  'application/pdf': FileText,
  'application/json': FileCode,
  'application/zip': FileArchive,
  'application/x-rar': FileArchive,
  'application/x-7z': FileArchive,
  'application/vnd.ms-excel': FileSpreadsheet,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileSpreadsheet,
  'application/vnd.ms-powerpoint': Presentation,
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': Presentation,
  'text/javascript': FileCode,
  'text/html': FileCode,
  'text/css': FileCode,
  'application/x-javascript': FileCode,
}

function getFileIcon(fileType) {
  for (const [type, Icon] of Object.entries(FILE_ICONS)) {
    if (fileType?.startsWith(type) || fileType === type) return Icon
  }
  return FileIcon
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

export default function MessageInput({ onSend, disabled }) {
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState([])
  const textareaRef = useRef(null)

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
  })

  const handleSend = () => {
    if ((!message.trim() && files.length === 0) || disabled) return
    onSend(message.trim(), files)
    setMessage('')
    setFiles([])
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e) => {
    setMessage(e.target.value)
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 200) + 'px'
    }
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div
      {...getRootProps()}
      className={clsx(
        'dropzone px-4 py-3 m-4 mt-0',
        isDragActive && 'dropzone-active'
      )}
    >
      <input {...getInputProps()} />

      {/* Drag overlay */}
      {isDragActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-claude-surface/95 dark:bg-claude-surface/95 light:bg-light-surface/95 rounded-xl border-2 border-dashed border-claude-accent z-10">
          <div className="flex flex-col items-center gap-2 text-claude-accent">
            <Upload className="w-8 h-8" />
            <span className="text-sm font-medium">أفلت الملفات هنا</span>
          </div>
        </div>
      )}

      {/* File previews */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {files.map((file, i) => {
            const Icon = getFileIcon(file.type)
            const isImage = file.type?.startsWith('image/')
            return (
              <div
                key={i}
                className="relative flex items-center gap-2 bg-claude-surface2 dark:bg-claude-surface2 light:bg-light-surface2 rounded-lg px-3 py-2 pr-8 group"
              >
                {isImage ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-8 h-8 rounded object-cover"
                  />
                ) : (
                  <Icon className="w-5 h-5 text-claude-accent flex-shrink-0" />
                )}
                <div className="flex flex-col">
                  <span className="text-xs text-claude-text dark:text-claude-text light:text-light-text max-w-32 truncate">
                    {file.name}
                  </span>
                  <span className="text-[10px] text-claude-textMuted">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  className="absolute top-1 left-1 p-0.5 rounded hover:bg-claude-accent/20"
                >
                  <X className="w-3 h-3 text-claude-textMuted" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2">
        <button
          onClick={open}
          className="p-2.5 rounded-xl bg-claude-surface2 dark:bg-claude-surface2 light:bg-light-surface2 hover:bg-claude-accent/20 transition-all-smooth flex-shrink-0"
          title="رفع ملف"
        >
          <Upload className="w-5 h-5 text-claude-textMuted" />
        </button>

        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="اكتب رسالتك هنا... (Enter للإرسال، Shift+Enter لسطر جديد)"
          className="auto-resize flex-1 bg-claude-surface2 dark:bg-claude-surface2 light:bg-light-surface2 text-claude-text dark:text-claude-text light:text-light-text rounded-xl px-4 py-2.5 resize-none outline-none text-sm placeholder:text-claude-textMuted border border-claude-border dark:border-claude-border light:border-light-border focus:border-claude-accent transition-all-smooth"
          rows={1}
          disabled={disabled}
        />

        <button
          onClick={handleSend}
          disabled={(!message.trim() && files.length === 0) || disabled}
          className={clsx(
            'p-2.5 rounded-xl transition-all-smooth flex-shrink-0',
            (!message.trim() && files.length === 0) || disabled
              ? 'bg-claude-surface2 dark:bg-claude-surface2 light:bg-light-surface2 text-claude-textMuted cursor-not-allowed'
              : 'bg-claude-accent hover:bg-claude-accentHover text-white'
          )}
          title="إرسال"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.527-18.162a.5.5 0 0 0-.624-.624L3.214 9.403a.5.5 0 0 0-.024.937l7.99 4.079z"/>
            <path d="m21.85 3.15-9.67 9.67"/>
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-between mt-2 px-1">
        <span className="text-[11px] text-claude-textMuted">
          يدعم جميع أنواع الملفات · صور، PDF، كود، مستندات، Excel، وأكثر
        </span>
        <span className="text-[11px] text-claude-textMuted">
          {files.length > 0 && `${files.length} ملف مرفق`}
        </span>
      </div>
    </div>
  )
}
