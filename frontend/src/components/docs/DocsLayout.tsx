import React, { useState } from 'react'
import Link from 'next/link'
import { DocsThemeToggle } from './DocsThemeToggle'

interface DocsLayoutProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  logo?: { url?: string | null; name?: string | null }
  footer?: { copyright?: string | null; icp?: string | null }
  breadcrumbs: React.ReactNode
  sidebar: React.ReactNode
  children: React.ReactNode
}

export const DocsLayout: React.FC<DocsLayoutProps> = ({
  theme,
  onToggleTheme,
  logo,
  footer,
  breadcrumbs,
  sidebar,
  children
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  React.useEffect(() => {
    const handler = () => setSidebarOpen(false)
    if (typeof window !== 'undefined') {
      window.addEventListener('docs-sidebar-navigate', handler)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('docs-sidebar-navigate', handler)
      }
    }
  }, [])

  return (
    <div className={`docs-shell ${theme === 'light' ? 'docs-theme-light' : 'docs-theme-dark'}`}>
      <div className="doc-layout">
        {/* 顶部导航 */}
        <div className="doc-topbar">
          <div className="doc-logo flex items-center gap-2">
            <button
              type="button"
              className="doc-menu-btn"
              aria-label="打开导航"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            {logo?.url ? (
              <img src={logo.url} alt={logo.name || 'logo'} className="h-8 w-auto object-contain" />
            ) : null}
            <Link href="/" className="text-lg font-semibold text-[var(--color-text-primary)]">
              {logo?.name || '文档中心'}
            </Link>
          </div>
          <div className="doc-topbar__right flex items-center gap-3">
            <div className="doc-breadcrumb text-base font-semibold text-[var(--color-text-primary)]">{breadcrumbs}</div>
            <DocsThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
        </div>

        <div className="doc-breadcrumb-bar">{breadcrumbs}</div>

        <div className="doc-grid">
          <aside className={`doc-aside ${sidebarOpen ? 'is-open' : ''}`}>
            <div className="doc-aside__inner">
              {sidebar}
            </div>
          </aside>
          <main className="doc-main">{children}</main>
        </div>
      </div>

      {sidebarOpen && <div className="doc-aside__mask" onClick={() => setSidebarOpen(false)} />}

      <footer className="doc-footer">
        <div className="doc-footer__inner">
          <span>{footer?.copyright || ''}</span>
          {footer?.icp ? (
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer" className="hover:underline">
              {footer.icp}
            </a>
          ) : null}
        </div>
      </footer>
    </div>
  )
}
