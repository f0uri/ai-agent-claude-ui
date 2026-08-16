import { useState, useRef, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { ArrowUp, File as FileIcon, X, Image as ImageIcon, FileText, FileCode, FileArchive, FileSpreadsheet, Presentation, Paperclip, Plus } from 'lucide-react'
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

function formatFileSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

function FilePreview({ file, onRemove }) {
  const [previewUrl, setPreviewUrl] = useState('')
  const Icon = getFileIcon(file.type)
  const isImage = file.type?.startsWith('image/')

  useEffect(() => {
    if (!isImage || !(file instanceof File)) return undefined
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file, isImage])

  return (
    <div className="relative flex max-w-[240px] items-center gap-2 rounded-2xl border border-black/5 bg-white/70 py-2 pl-2 pr-3 shadow-sm backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.07]">
      {isImage && previewUrl ? (
        <img src={previewUrl} alt={file.name} className="h-10 w-10 rounded-xl object-cover" />
      ) : (
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#d97757]/[0.12] text-[#d97757]">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-[#2c2723] dark:text-[#f4eee8]">{file.name}</p>
        <p className="mt-0.5 text-[10px] text-[#8f8175] dark:text-[#aea39b]">{formatFileSize(file.size)}</p>
      </div>
      <button
        onClick={onRemove}
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-black/[0.05] text-[#817368] transition-all hover:bg-red-500 hover:text-white dark:bg-white/[0.08] dark:text-[#cfc4bb]"
        aria-label="إزالة الملف"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
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
      textareaRef.current.style.height = '48px'
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
      el.style.height = '48px'
      el.style.height = Math.min(el.scrollHeight, 170) + 'px'
    }
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const canSend = (message.trim() || files.length > 0) && !disabled

  return (
    <div className="relative z-20 px-3 pb-[max(14px,env(safe-area-inset-bottom))] pt-2 md:px-5">
      <div
        {...getRootProps()}
        className={clsx(
          'relative mx-auto max-w-4xl rounded-[30px] border border-black/[0.06] bg-white/[0.72] p-2 shadow-[0_16px_44px_rgba(71,47,31,0.12)] backdrop-blur-2xl transition-all dark:border-white/[0.10] dark:bg-[#2a2520]/[0.82] dark:shadow-black/20',
          isDragActive && 'ring-2 ring-[#d97757]/70'
        )}
      >
        <input {...getInputProps()} />

        {isDragActive && (
          <div className="absolute inset-0 z-10 grid place-items-center rounded-[30px] border-2 border-dashed border-[#d97757] bg-[#fbf7f1]/90 backdrop-blur-xl dark:bg-[#211d19]/[0.92]">
            <div className="flex flex-col items-center gap-2 text-[#d97757]">
              <Paperclip className="h-8 w-8" />
              <span className="text-sm font-bold">أفلت الملفات هنا</span>
            </div>
          </div>
        )}

        {files.length > 0 && (
          <div className="mb-2 flex gap-2 overflow-x-auto px-1 pb-1">
            {files.map((file, i) => (
              <FilePreview key={`${file.name}-${i}`} file={file} onRemove={() => removeFile(i)} />
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <button
            onClick={open}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-black/[0.04] text-[#6f6258] transition-all hover:scale-105 hover:bg-black/[0.08] active:scale-95 dark:bg-white/[0.07] dark:text-[#cfc4bb] dark:hover:bg-white/[0.11]"
            title="رفع ملف"
          >
            <Plus className="h-5 w-5" />
          </button>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="اسألني أي شيء..."
            className="auto-resize min-h-12 flex-1 resize-none rounded-[22px] border-0 bg-transparent px-2 py-3 text-[15px] leading-6 text-[#2c2723] outline-none placeholder:text-[#9b8e83] disabled:opacity-60 dark:text-[#f4eee8] dark:placeholder:text-[#8d827a]"
            rows={1}
            disabled={disabled}
          />

          <button
            onClick={handleSend}
            disabled={!canSend}
            className={clsx(
              'grid h-12 w-12 shrink-0 place-items-center rounded-full shadow-lg transition-all active:scale-95',
              canSend
                ? 'bg-[#2c2723] text-white shadow-black/[0.15] hover:scale-105 dark:bg-[#f2e9df] dark:text-[#2c2723]'
                : 'bg-black/[0.04] text-[#a79a8e] shadow-none dark:bg-white/[0.06] dark:text-[#70675f]'
            )}
            title="إرسال"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center justify-between px-3 pb-1 pt-1.5">
          <span className="text-[10px] font-medium text-[#9b8e83] dark:text-[#81766d]">
            Enter للإرسال · Shift+Enter لسطر جديد
          </span>
          <span className="text-[10px] font-bold text-[#d97757]">
            {files.length > 0 ? `${files.length} ملف` : 'كل الملفات مدعومة'}
          </span>
        </div>
      </div>
    </div>
  )
}
