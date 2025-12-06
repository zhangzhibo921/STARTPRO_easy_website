import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import type { GetServerSideProps } from 'next'
import type { Doc, DocNode } from '@/types'
import DOMPurify from 'isomorphic-dompurify'
import { marked } from 'marked'
import { DocsLayout } from '@/components/docs/DocsLayout'
import { DocsSidebar } from '@/components/docs/DocsSidebar'
import { DocContent } from '@/components/docs/DocContent'

interface DocsPageProps {
  doc: Doc
  tree: DocNode[]
  slugPath: string
  settings: {
    site_name?: string | null
    site_logo?: string | null
    site_favicon?: string | null
    copyright?: string | null
    icp?: string | null
  }
}

const findFirstPublishedSlug = (nodes: DocNode[]): string | null => {
  for (const node of nodes) {
    if (node.status === 'published') return node.slug
    if (node.children) {
      const child = findFirstPublishedSlug(node.children)
      if (child) return child
    }
  }
  return null
}

// 公共侧边栏：文件夹始终保留；文档需已发布
const filterPublishedTree = (nodes: DocNode[]): DocNode[] =>
  nodes
    .filter((node) => node.type === 'folder' || node.status === 'published')
    .map((node) => ({
      ...node,
      children: node.children ? filterPublishedTree(node.children) : []
    }))

const Breadcrumbs = ({ items }: { items: { label: string; href?: string }[] }) => (
  <nav className="text-sm text-[var(--color-text-secondary)] flex flex-wrap items-center gap-2">
    {items.map((item, idx) => (
      <React.Fragment key={item.href || item.label + idx}>
        {idx > 0 && <span>/</span>}
        {item.href ? (
          <a className="hover:text-[var(--color-text-primary)]" href={item.href}>
            {item.label}
          </a>
        ) : (
          <span className="text-[var(--color-text-primary)]">{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
)

export default function DocsPage({ doc, tree, slugPath, settings }: DocsPageProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const rawHtml = useMemo(() => marked.parse(doc.content || ''), [doc.content])
  const safeHtml = useMemo(() => DOMPurify.sanitize(rawHtml), [rawHtml])
  const siteName = settings.site_name || doc.title
  const logoName = `${siteName || '文档中心'} | 文档中心`

  // 避免被全局标题覆盖，强制文档页标题
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = `文档 - ${doc.title}`
    }
  }, [doc.title])

  const findPath = useCallback((nodes: DocNode[], target: string, path: string[] = []): string[] | null => {
    for (const node of nodes) {
      const nextPath = [...path, node.slug]
      if (node.slug === target) return nextPath
      if (node.children) {
        const found = findPath(node.children, target, nextPath)
        if (found) return found
      }
    }
    return null
  }, [])

  const defaultExpanded = useMemo(() => {
    const path = findPath(tree, slugPath) || []
    return new Set(path)
  }, [tree, slugPath, findPath])

  // 仅展示文件夹 + 其文档（保持与后台一致）
  const sidebarTree = useMemo(
    () =>
      tree
        .filter((n) => n.type === 'folder')
        .map((folder) => ({
          ...folder,
          children: (folder.children || []).filter((c) => c.type !== 'folder' && c.status === 'published')
        })),
    [tree]
  )

  const [expanded, setExpanded] = useState<Set<string>>(defaultExpanded)

  useEffect(() => {
    setExpanded(defaultExpanded)
  }, [defaultExpanded])

  const toggle = (slug: string) => {
    setExpanded((prev) => {
      const next = new Set<string>()
      if (slug && !prev.has(slug)) next.add(slug)
      return next
    })
  }

  const findNodeBySlug = useCallback((nodes: DocNode[], target: string): DocNode | null => {
    for (const node of nodes) {
      if (node.slug === target) return node
      if (node.children) {
        const found = findNodeBySlug(node.children, target)
        if (found) return found
      }
    }
    return null
  }, [])

  const breadcrumbItems = useMemo(() => {
    const parts = slugPath.split('/').filter(Boolean)
    const items: { label: string; href?: string }[] = [{ label: '文档中心', href: '/docs' }]
    let current = ''
    parts.forEach((part, idx) => {
      current = current ? `${current}/${part}` : part
      const node = findNodeBySlug(tree, current)
      const label = node?.title || part
      const isLast = idx === parts.length - 1
      items.push({ label: isLast ? doc.title : label, href: isLast ? undefined : `/docs/${current}` })
    })
    return items
  }, [slugPath, tree, findNodeBySlug, doc.title])

  return (
    <>
      <Head>
        <title>文档 - {doc.title}</title>
        <link id="favicon" rel="icon" href={settings.site_favicon || settings.site_logo || '/favicon.ico'} />
        <link rel="shortcut icon" href={settings.site_favicon || settings.site_logo || '/favicon.ico'} />
      </Head>
      <DocsLayout
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        logo={{ url: settings.site_logo || undefined, name: logoName }}
        footer={{ copyright: settings.copyright, icp: settings.icp }}
        breadcrumbs={<Breadcrumbs items={breadcrumbItems} />}
        sidebar={<DocsSidebar nodes={sidebarTree} activeSlug={slugPath} expanded={expanded} onToggle={toggle} />}
      >
        <DocContent title={doc.title} summary={doc.summary} html={safeHtml} />
      </DocsLayout>

      <style jsx global>{`
        /* 主题变量 */
        .docs-theme-light {
          --color-surface: #fefefe;          /* 页面背景 */
          --color-surface-alt: #ffffff;      /* 卡片背景 */
          --color-text-primary: #1f2329;     /* 主文字稍深 */
          --color-text-secondary: #4b5563;   /* 次文字 */
          --color-border: #e5e7eb;           /* 边框 */
          --color-primary: #087ea4;          /* 链接/高亮 */
          --color-primary-bg-parent: #e6f6fb; /* 父级选中底色 */
          --color-primary-bg-child: #e9eef6;  /* 子级选中底色 */
        }
        .docs-theme-dark {
          --color-surface: #23272f;          /* 页面背景 */
          --color-surface-alt: #2b303a;      /* 卡片背景 */
          --color-text-primary: #f6f7f9;     /* 主文字 */
          --color-text-secondary: #c2c7d0;   /* 次文字 */
          --color-border: #3a404c;           /* 边框 */
          --color-primary: #58c4dc;          /* 链接/高亮 */
          --color-primary-bg-parent: #1f2f38; /* 父级选中底色 */
          --color-primary-bg-child: #2d333d;  /* 子级选中底色 */
        }
        /* 布局样式 */
        .docs-shell {
          min-height: 100vh;
          background: var(--color-surface, #0f141d);
          color: var(--color-text-primary, #e5e7eb);
          transition: background 0.25s ease, color 0.25s ease;
        }
        html, body {
          background: var(--color-surface, #0f141d);
        }
        .doc-layout {
          width: 100%;
          max-width: none;
          margin: 0;
          font-family: "Optimistic Text", -apple-system, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
        }
        .doc-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 24px;
          position: sticky;
          top: 0;
          z-index: 10;
          padding: 12px 24px;
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
        }
        .doc-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 18px;
          font-weight: 700;
          color: var(--color-text-primary);
        }
        .doc-menu-btn {
          display: none;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          background: var(--color-surface-alt);
          color: var(--color-text-primary);
          font-size: 18px;
          cursor: pointer;
        }
        .doc-topbar__right {
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .doc-breadcrumb {
          display: block;
          color: var(--color-primary);
          font-weight: 600;
        }
        .doc-breadcrumb a {
          color: var(--color-primary);
        }
        .doc-breadcrumb a:hover {
          text-decoration: underline;
        }
        .doc-breadcrumb-bar {
          display: none;
          color: var(--color-primary);
          font-weight: 600;
        }
        .doc-breadcrumb-bar nav,
        .doc-breadcrumb-bar a {
          color: var(--color-primary);
        }
        @media (max-width: 900px) {
          .doc-breadcrumb-bar {
            display: block;
            padding: 0 16px 4px;
            margin-bottom: 10px;
          }
          .doc-topbar__right {
            margin-left: auto;
          }
          .doc-topbar__right .doc-breadcrumb {
            display: none;
          }
        }
        .doc-grid {
          display: grid;
          grid-template-columns: 280px minmax(0, 1fr);
          gap: 32px;
          padding: 0 24px 48px;
        }
        .doc-aside {
          border-right: none;
          padding-right: 12px;
        }
        .doc-aside__inner {
          position: sticky;
          top: 80px;
          padding-top: 8px;
        }
        .doc-aside__label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .doc-sidebar-search {
          display: flex;
          gap: 8px;
          padding: 0 4px 8px;
        }
        .doc-sidebar-search__input {
          flex: 1;
          height: 36px;
          border: 1px solid var(--color-border);
          background: var(--color-surface-alt);
          border-radius: 10px;
          padding: 0 12px;
          color: var(--color-text-primary);
          font-size: 14px;
          outline: none;
        }
        .doc-sidebar-search__input::placeholder {
          color: var(--color-text-secondary);
        }
        .doc-main {
          width: 100%;
        }
        .doc-main__inner {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 8px;
        }
        .doc-header {
          margin-bottom: 24px;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 16px;
        }
        .doc-title {
          font-size: 32px;
          line-height: 1.25;
          font-weight: 800;
          margin: 0 0 10px;
          color: var(--color-text-primary);
        }
        .doc-summary {
          margin: 0;
          color: var(--color-text-secondary);
          font-size: 16px;
          line-height: 1.7;
        }
        /* 正文默认样式，允许富文本内联样式覆盖 */
        .doc-html {
          color: var(--color-text-primary);
          line-height: 1.85;
          font-size: 17px;
          max-width: 820px;
          font-family: "Optimistic Text", -apple-system, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
        }
        .doc-html h1,
        .doc-html h2,
        .doc-html h3,
        .doc-html h4 {
          color: var(--color-text-primary);
          margin: 1.5em 0 0.8em;
          font-weight: 700;
          line-height: 1.3;
        }
        .doc-html h1 { font-size: 34px; }
        .doc-html h2 { font-size: 28px; }
        .doc-html h3 { font-size: 22px; }
        .doc-html h4 { font-size: 18px; }
        .doc-html strong { font-weight: 700; color: var(--color-text-primary); }
        .doc-html em { font-style: italic; }
        .doc-html u { text-decoration: underline; text-decoration-color: var(--color-primary); }
        .doc-html s { text-decoration: line-through; }
        .doc-html sub { vertical-align: sub; font-size: 0.85em; }
        .doc-html sup { vertical-align: super; font-size: 0.85em; }
        .doc-html mark { background: rgba(252, 211, 77, 0.35); padding: 0 4px; border-radius: 4px; }
        .doc-html p {
          margin: 1em 0;
          color: var(--color-text-secondary);
          font-size: 17px;
          line-height: 1.85;
        }
        .doc-html ul,
        .doc-html ol {
          padding-left: 1.4em;
          margin: 1em 0;
        }
        .doc-html li {
          margin: 0.35em 0;
          padding-left: 2px;
        }
        .doc-html ol { list-style: decimal; }
        .doc-html ul { list-style: disc; }
        .doc-html input[type='checkbox'] {
          width: 16px;
          height: 16px;
          margin-right: 8px;
          border-radius: 4px;
          border: 1.5px solid var(--color-border);
          background: var(--color-surface-alt);
          appearance: none;
          display: inline-grid;
          place-content: center;
          transition: all 0.15s ease;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
        }
        .doc-html input[type='checkbox']:checked {
          border-color: var(--color-primary);
          background: var(--color-primary);
          box-shadow: 0 0 0 2px rgba(88, 196, 220, 0.18);
        }
        .doc-html input[type='checkbox']:checked::after {
          content: '✓';
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          line-height: 1;
          transform: translateY(-1px);
        }
        .doc-html blockquote {
          position: relative;
          margin: 1.2em 0;
          padding: 14px 16px 14px 24px;
          border: 1px solid var(--color-border);
          border-radius: 10px;
          background: var(--color-surface-alt);
          color: var(--color-text-secondary);
        }
        .docs-theme-light .doc-html blockquote {
          background: #f8fafc;
          border-color: #d8e2ef;
        }
        .docs-theme-dark .doc-html blockquote {
          background: #1f242d;
          border-color: #2f3542;
        }
        .doc-html code {
          background: rgba(255, 255, 255, 0.06);
          padding: 0.15em 0.35em;
          border-radius: 4px;
          font-size: 0.95em;
          color: var(--color-text-primary);
        }
        .doc-html pre {
          position: relative;
          background: var(--color-surface-alt);
          padding: 1em;
          border-radius: 8px;
          overflow: auto;
          border: 1px solid var(--color-border);
          font-size: 14px;
          color: var(--color-text-primary);
        }
        .docs-theme-light .doc-html input[type='checkbox'] {
          border-color: #94a3b8;
          background: #edf2f7;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95);
        }
        .docs-theme-light .doc-html input[type='checkbox']:checked {
          border-color: #0f749a;
          background: #0f749a;
          box-shadow: 0 0 0 2px rgba(15, 116, 154, 0.22);
        }
        .docs-theme-light .doc-html input[type='checkbox']:checked::after {
          color: #fff;
        }
        .docs-theme-dark .doc-html input[type='checkbox'] {
          background: #1f242d;
          border-color: #3a404c;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }
        .docs-theme-dark .doc-html input[type='checkbox']:checked {
          box-shadow: 0 0 0 2px rgba(88, 196, 220, 0.2);
        }
        .docs-theme-light .doc-html pre {
          background: #e7edf5;
          border-color: #d2dae6;
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.12);
        }
        .docs-theme-dark .doc-html pre {
          background: #171b23;
          border-color: #2f3542;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
        }
        .doc-html .code-copy-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          padding: 4px 8px;
          font-size: 12px;
          border-radius: 6px;
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          color: var(--color-text-primary);
          cursor: pointer;
          opacity: 0.9;
        }
        .doc-html img {
          max-width: 100%;
          border-radius: 10px;
          margin: 1em 0;
        }
        .doc-html a {
          color: var(--color-primary);
          text-decoration: underline;
        }
        .doc-html hr {
          border: 0;
          border-top: 1px solid var(--color-border);
          margin: 1.5em 0;
        }
        .doc-html table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.2em 0;
          font-size: 15px;
        }
        .doc-html th,
        .doc-html td {
          border: 1px solid var(--color-border);
          padding: 10px 12px;
          text-align: left;
        }
        .doc-html th {
          background: var(--color-surface-alt);
          font-weight: 600;
        }
        .doc-footer {
          border-top: 1px solid var(--color-border);
          padding: 16px 0;
          margin-top: 24px;
          text-align: center;
          font-size: 12px;
          color: var(--color-text-secondary);
        }
        .doc-footer__inner {
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        @media (max-width: 1100px) {
          .doc-layout {
            padding: 20px 16px 48px;
          }
          .doc-grid {
            grid-template-columns: 1fr;
            gap: 28px;
          }
          .doc-aside {
            position: fixed;
            inset: 0 auto 0 0;
            width: 100vw;
            max-width: 100vw;
            background: var(--color-surface);
            border-right: 1px solid var(--color-border);
            transform: translateX(-100%);
            transition: transform 0.25s ease;
            z-index: 20;
            box-shadow: 6px 0 16px rgba(0, 0, 0, 0.15);
          }
          .doc-aside.is-open {
            transform: translateX(0);
          }
          .doc-aside__inner {
            position: static;
            top: auto;
            padding: 16px 14px 24px;
          }
          .doc-main__inner {
            max-width: 100%;
          }
          .doc-menu-btn {
            display: inline-flex;
          }
          .doc-aside__mask {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.3);
            z-index: 10;
          }
        }
      `}</style>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<DocsPageProps> = async (context) => {
  const slugParam = context.params?.slug
  const slugPath = Array.isArray(slugParam) ? slugParam.join('/') : ''
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3003'

  try {
    const [treeRes, settingsRes] = await Promise.all([
      fetch(`${baseUrl}/api/docs/tree`),
      fetch(`${baseUrl}/api/settings`).catch(() => null)
    ])
    if (!treeRes.ok) return { notFound: true }
    const treeData = await treeRes.json()
    const tree: DocNode[] = filterPublishedTree(treeData.data || [])

    if (!slugPath) {
      const first = findFirstPublishedSlug(tree)
      if (first) {
        return {
          redirect: { destination: `/docs/${first}`, permanent: false }
        }
      }
      return { notFound: true }
    }

    const docRes = await fetch(`${baseUrl}/api/docs/${slugPath}`)
    if (docRes.status === 404) return { notFound: true }
    const docData = await docRes.json()

    const settingsJson = settingsRes && settingsRes.ok ? await settingsRes.json() : { data: {} }
    const settings = settingsJson?.data || {}

    return {
      props: {
        doc: docData.data,
        tree,
        slugPath,
        settings: {
          site_name: settings.site_name || settings.siteName || '',
          site_logo: settings.site_logo || settings.logo_url || settings.logoUrl || '',
          site_favicon: settings.site_favicon || settings.favicon_url || settings.faviconUrl || settings.icon_url || settings.favicon || '',
          copyright: settings.copyright || '',
          icp: settings.icp || settings.icp_number || ''
        }
      }
    }
  } catch (error) {
    console.error('获取文档失败', error)
    return { notFound: true }
  }
}
