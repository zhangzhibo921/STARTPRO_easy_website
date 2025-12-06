import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import type { DocNode } from '@/types'

interface DocsSidebarProps {
  nodes: DocNode[]
  activeSlug: string
  expanded: Set<string>
  onToggle: (slug: string) => void
}

export const DocsSidebar: React.FC<DocsSidebarProps> = ({ nodes, activeSlug, expanded, onToggle }) => {
  const [search, setSearch] = useState('')

  const emitNavigate = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('docs-sidebar-navigate'))
    }
  }

  const filteredNodes = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return nodes

    const matchText = (text?: string | null) => (text || '').toLowerCase().includes(keyword)

    return nodes
      .map((node) => {
        const children = (node.children || []).filter((c) => c.type !== 'folder')
        const matchedChildren = children.filter((child) => matchText(child.title) || matchText(child.slug))
        const matchesSelf = matchText(node.title) || matchText(node.slug)
        if (matchesSelf || matchedChildren.length) {
          return {
            ...node,
            children: matchedChildren
          }
        }
        return null
      })
      .filter(Boolean) as DocNode[]
  }, [nodes, search])

  const renderTree = (items: DocNode[], depth = 0) => (
    <ul className="space-y-1">
      {items.map((node) => {
        const children = (node.children || []).filter((c) => c.type !== 'folder')
        const hasChildren = children.length > 0
        const isFolder = node.type === 'folder'
        const hasSearch = Boolean(search.trim())
        const isOpen = hasSearch ? true : expanded.has(node.slug)
        const isActive = node.slug === activeSlug
        const indent = 10 + depth * 14
        const isParent = depth === 0
        const bgColor =
          isActive || (isFolder && isOpen)
            ? isParent
              ? 'var(--color-primary-bg-parent)'
              : 'var(--color-primary-bg-child)'
            : 'transparent'
        const textClass = isActive ? 'text-[var(--color-primary)] font-semibold' : 'text-[var(--color-text-primary)]'
        const radius = isParent ? 8 : 9999

        const firstDoc =
          node.children?.find((c) => c.type !== 'folder' && c.slug.endsWith('/index')) ||
          node.children?.find((c) => c.type !== 'folder')

        const handleFolderClick = () => {
          // 单文件夹展开
          const nextOpen = isOpen ? new Set<string>() : new Set<string>([node.slug])
          onToggle(Array.from(nextOpen)[0] || '')
          if (firstDoc && typeof window !== 'undefined') {
            window.location.href = `/docs/${firstDoc.slug}`
            emitNavigate()
          }
        }

        return (
          <li key={node.id}>
            <div
              className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${textClass}`}
              style={{ paddingLeft: `${indent}px`, backgroundColor: bgColor, borderRadius: radius }}
              onClick={() => {
                if (isFolder) handleFolderClick()
              }}
            >
              {isFolder ? (
                <span className="block flex-1 truncate">{node.title}</span>
              ) : (
                <Link
                  href={`/docs/${node.slug}`}
                  className={`block flex-1 truncate ${
                    isActive
                      ? 'text-[var(--color-primary)]'
                      : 'text-[var(--color-text-primary)] hover:text-[var(--color-primary)]'
                  }`}
                  onClick={emitNavigate}
                >
                  {node.title}
                </Link>
              )}
              {hasChildren && isFolder ? (
                <span className="ml-2 text-xl leading-none font-semibold text-[var(--color-text-secondary)]">
                  {isOpen ? '▾' : '▸'}
                </span>
              ) : null}
            </div>
            {hasChildren && isOpen && children.length > 0 && <div className="mt-1">{renderTree(children, depth + 1)}</div>}
          </li>
        )
      })}
    </ul>
  )

  return (
    <div className="space-y-3">
      <form
        className="doc-sidebar-search"
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索文档"
          className="doc-sidebar-search__input"
        />
      </form>
      {filteredNodes.length ? renderTree(filteredNodes) : (
        <div className="text-sm text-[var(--color-text-secondary)] px-2">暂无匹配结果</div>
      )}
    </div>
  )
}
