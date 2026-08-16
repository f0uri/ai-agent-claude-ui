import { MessageSquare, Plus, Trash2, X, Sparkles, Search } from 'lucide-react'
import clsx from 'clsx'

function formatDate(value) {
  if (!value) return ''
  try {
    return new Intl.DateTimeFormat('ar', { month: 'short', day: 'numeric' }).format(new Date(value))
  } catch {
    return ''
  }
}

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  isOpen,
  isMobile,
  onClose,
}) {
  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/[0.35] backdrop-blur-[2px] md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          'z-40 flex shrink-0 flex-col overflow-hidden border-l border-black/5 bg-[#f3ede5]/[0.88] text-[#2c2723] backdrop-blur-2xl transition-all duration-300 dark:border-white/[0.08] dark:bg-[#25211d]/[0.88] dark:text-[#f4eee8]',
          isOpen ? 'w-[310px]' : 'w-0 border-l-0',
          isMobile && 'fixed right-0 top-0 h-full shadow-2xl shadow-black/30',
          !isMobile && 'relative h-full',
        )}
      >
        <div className="min-w-[310px] flex-1 overflow-hidden">
          <div className="px-4 pb-3 pt-[max(16px,env(safe-area-inset-top))]">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-[18px] bg-gradient-to-br from-[#efad8e] via-[#d97757] to-[#a94a34] text-white shadow-lg shadow-[#d97757]/30">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold tracking-[-0.02em]">AI Agent</h2>
                  <p className="text-xs text-[#8f8175] dark:text-[#aea39b]">محادثاتك الذكية</p>
                </div>
              </div>

              {isMobile && (
                <button
                  onClick={onClose}
                  className="grid h-9 w-9 place-items-center rounded-full bg-black/[0.05] text-[#76685d] transition hover:bg-black/[0.08] dark:bg-white/[0.07] dark:text-[#cfc4bb]"
                  aria-label="إغلاق القائمة"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <button
              onClick={onNew}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2c2723] px-4 py-3 text-sm font-bold text-white shadow-xl shadow-black/10 transition-all hover:-translate-y-0.5 hover:bg-[#1f1b18] active:translate-y-0 dark:bg-[#f2e9df] dark:text-[#251f1a] dark:hover:bg-white"
            >
              <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
              محادثة جديدة
            </button>

            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-black/5 bg-white/[0.55] px-3 py-2 text-[#8f8175] shadow-sm dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-[#aea39b]">
              <Search className="h-4 w-4" />
              <span className="text-xs">ابحث في المحادثات</span>
            </div>
          </div>

          <div className="h-[calc(100%-184px)] overflow-y-auto px-3 pb-3">
            {conversations.length === 0 && (
              <div className="mx-1 mt-8 rounded-3xl border border-dashed border-black/10 bg-white/[0.35] p-5 text-center dark:border-white/[0.10] dark:bg-white/[0.04]">
                <MessageSquare className="mx-auto mb-2 h-7 w-7 text-[#d97757]" />
                <p className="text-sm font-semibold">لا توجد محادثات بعد</p>
                <p className="mt-1 text-xs leading-5 text-[#8f8175] dark:text-[#aea39b]">
                  ابدأ محادثة جديدة وستظهر هنا مثل تطبيقات iPhone.
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => onSelect(conv.id)}
                  className={clsx(
                    'group relative flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-200',
                    activeId === conv.id
                      ? 'bg-white text-[#2c2723] shadow-md shadow-black/5 ring-1 ring-black/5 dark:bg-white/[0.12] dark:text-white dark:ring-white/[0.08]'
                      : 'text-[#534940] hover:bg-white/[0.55] dark:text-[#e9ded4] dark:hover:bg-white/[0.07]'
                  )}
                >
                  <div className={clsx(
                    'grid h-10 w-10 shrink-0 place-items-center rounded-2xl transition-colors',
                    activeId === conv.id
                      ? 'bg-[#d97757]/[0.15] text-[#d97757]'
                      : 'bg-black/[0.04] text-[#9a8b7e] dark:bg-white/[0.06] dark:text-[#aea39b]'
                  )}>
                    <MessageSquare className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold">{conv.title || 'محادثة جديدة'}</p>
                      <span className="shrink-0 text-[10px] text-[#9a8b7e] dark:text-[#9e9289]">
                        {formatDate(conv.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-[#8f8175] dark:text-[#aea39b]">
                      {conv.messages?.at(-1)?.content || 'جاهزة للدردشة والملفات'}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(conv.id)
                    }}
                    className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-red-500/10 text-red-500 opacity-0 transition-all hover:bg-red-500 hover:text-white group-hover:opacity-100"
                    aria-label="حذف المحادثة"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-black/5 px-4 py-3 dark:border-white/[0.08]">
            <div className="rounded-2xl bg-white/[0.45] p-3 text-center text-[11px] font-medium text-[#8f8175] dark:bg-white/[0.05] dark:text-[#aea39b]">
              تصميم iOS · يدعم الصور والملفات والكود
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
