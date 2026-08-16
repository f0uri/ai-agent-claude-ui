import { MessageSquare, Plus, Trash2, X, Sparkles } from 'lucide-react'
import clsx from 'clsx'

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  isOpen,
  isMobile,
  onClose,
  theme
}) {
  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          'flex flex-col bg-claude-surface dark:bg-claude-surface light:bg-light-surface border-l border-claude-border dark:border-claude-border light:border-light-border z-40 transition-all-smooth',
          isOpen ? 'w-72' : 'w-0',
          isMobile && !isOpen && 'absolute',
          isMobile && isOpen && 'absolute h-full shadow-xl',
          !isMobile && !isOpen && 'overflow-hidden',
        )}
        style={isMobile ? { position: 'fixed', right: 0, top: 0, height: '100%' } : {}}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-claude-border dark:border-claude-border light:border-light-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-claude-accent" />
            <span className="font-semibold text-claude-text dark:text-claude-text light:text-light-text">
              AI Agent
            </span>
          </div>
          {isMobile && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-claude-surface2 dark:hover:bg-claude-surface2 light:hover:bg-light-surface2"
            >
              <X className="w-5 h-5 text-claude-textMuted" />
            </button>
          )}
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={onNew}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-claude-accent hover:bg-claude-accentHover text-white font-medium text-sm transition-all-smooth"
          >
            <Plus className="w-4 h-4" />
            محادثة جديدة
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {conversations.length === 0 && (
            <div className="text-center text-claude-textMuted dark:text-claude-textMuted light:text-light-textMuted text-sm py-8">
              لا توجد محادثات بعد
            </div>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={clsx(
                'group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all-smooth mb-0.5',
                activeId === conv.id
                  ? 'bg-claude-surface2 dark:bg-claude-surface2 light:bg-light-surface2'
                  : 'hover:bg-claude-surface2 dark:hover:bg-claude-surface2 light:hover:bg-light-surface2'
              )}
            >
              <MessageSquare className="w-4 h-4 text-claude-textMuted flex-shrink-0" />
              <span className="flex-1 text-sm text-claude-text dark:text-claude-text light:text-light-text truncate">
                {conv.title || 'محادثة جديدة'}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(conv.id)
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-claude-accent/20 transition-all-smooth"
              >
                <Trash2 className="w-3.5 h-3.5 text-claude-textMuted hover:text-red-400" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-claude-border dark:border-claude-border light:border-light-border">
          <p className="text-xs text-claude-textMuted dark:text-claude-textMuted light:text-light-textMuted text-center">
            AI Agent · يدعم جميع الملفات
          </p>
        </div>
      </aside>
    </>
  )
}
