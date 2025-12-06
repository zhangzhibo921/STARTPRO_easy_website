import React from 'react'

interface DocsThemeToggleProps {
  theme: 'light' | 'dark'
  onToggle: () => void
}

export const DocsThemeToggle: React.FC<DocsThemeToggleProps> = ({ theme, onToggle }) => {
  return (
    <button
      type="button"
      aria-label="切换主题"
      className="flex items-center justify-center px-3 h-9 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-alt)]/80 hover:border-[var(--color-text-primary)] font-semibold text-xs transition-colors"
      onClick={onToggle}
    >
      {theme === 'light' ? '深色模式' : '浅色模式'}
    </button>
  )
}
