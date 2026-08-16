import { PanelRightClose, PanelRightOpen, Sun, Moon } from 'lucide-react'
import clsx from 'clsx'

export default function TopBar({ onToggleSidebar, onToggleTheme, theme, sidebarOpen }) {
  return (
    <header className="flex items-center justify-between px-4 py-2.5 border-b border-claude-border dark:border-claude-border light:border-light-border bg-claude-bg dark:bg-claude-bg light:bg-light-bg">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-claude-surface2 dark:hover:bg-claude-surface2 light:hover:bg-light-surface2 transition-all-smooth"
          title="إظهار/إخفاء القائمة"
        >
          {sidebarOpen ? (
            <PanelRightClose className="w-5 h-5 text-claude-textMuted" />
          ) : (
            <PanelRightOpen className="w-5 h-5 text-claude-textMuted" />
          )}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-claude-text dark:text-claude-text light:text-light-text">
            AI Agent
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-claude-accent/15 text-claude-accent font-medium">
            Pro
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg hover:bg-claude-surface2 dark:hover:bg-claude-surface2 light:hover:bg-light-surface2 transition-all-smooth"
          title="تبديل الوضع"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-claude-textMuted" />
          ) : (
            <Moon className="w-5 h-5 text-claude-textMuted" />
          )}
        </button>
      </div>
    </header>
  )
}
