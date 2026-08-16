import { PanelRightClose, PanelRightOpen, Sun, Moon, Sparkles } from 'lucide-react'

export default function TopBar({ onToggleSidebar, onToggleTheme, theme, sidebarOpen, conversation }) {
  return (
    <header className="relative z-10 flex items-center justify-between border-b border-black/5 bg-[#fbf7f1]/[0.78] px-3 py-3 backdrop-blur-2xl dark:border-white/[0.08] dark:bg-[#191715]/[0.72] md:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="grid h-10 w-10 place-items-center rounded-full bg-black/[0.04] text-[#6f6258] shadow-sm transition-all hover:scale-105 hover:bg-black/[0.08] active:scale-95 dark:bg-white/[0.07] dark:text-[#cfc4bb] dark:hover:bg-white/[0.11]"
          title="إظهار/إخفاء القائمة"
        >
          {sidebarOpen ? (
            <PanelRightClose className="h-5 w-5" />
          ) : (
            <PanelRightOpen className="h-5 w-5" />
          )}
        </button>

        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-[#e89b79] to-[#c45f42] text-white shadow-lg shadow-[#d97757]/25 sm:grid">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-[15px] font-bold tracking-[-0.01em] text-[#2c2723] dark:text-[#f4eee8]">
                {conversation?.title || 'Claude AI Agent'}
              </h1>
              <span className="rounded-full border border-[#d97757]/20 bg-[#d97757]/10 px-2 py-0.5 text-[10px] font-bold text-[#bd6347] dark:text-[#f1a27e]">
                Pro
              </span>
            </div>
            <p className="mt-0.5 hidden truncate text-xs text-[#8b7d70] dark:text-[#a99f96] sm:block">
              واجهة هادئة بتجربة iPhone — جاهزة للملفات والمحادثات
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onToggleTheme}
        className="grid h-10 w-10 place-items-center rounded-full bg-black/[0.04] text-[#6f6258] shadow-sm transition-all hover:scale-105 hover:bg-black/[0.08] active:scale-95 dark:bg-white/[0.07] dark:text-[#cfc4bb] dark:hover:bg-white/[0.11]"
        title="تبديل الوضع"
      >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </button>
    </header>
  )
}
