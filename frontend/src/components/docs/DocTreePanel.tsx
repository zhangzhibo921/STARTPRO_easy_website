import React, { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { DocNode } from '@/types'

interface DocTreePanelProps {
  tree: DocNode[]
  selectedDocId?: number | null
  loading?: boolean
  onSelectDoc: (node: DocNode | null) => void
  onRefresh?: () => void
}

// 只展开一个顶层目录（folder），folder 下显示 doc；若点击 folder 自动选中其第一个 doc
export default function DocTreePanel({ tree, selectedDocId, loading, onSelectDoc, onRefresh }: DocTreePanelProps) {
  const [openFolderId, setOpenFolderId] = useState<number | null>(null)

  // 仅显示一层目录：顶层 folder；doc 作为其子节点
  const folders = useMemo(() => tree.filter((n) => n.type === 'folder'), [tree])

  // 当选中文档时，自动展开其父目录
  useEffect(() => {
    if (!selectedDocId) return
    const findParent = (nodes: DocNode[], targetId: number, parentId: number | null = null): number | null => {
      for (const n of nodes) {
        if (n.id === targetId) return parentId
        const child = n.children || []
        const found = findParent(child, targetId, n.type === 'folder' ? n.id : parentId)
        if (found !== null) return found
      }
      return null
    }
    const parent = findParent(tree, selectedDocId, null)
    if (parent !== null) setOpenFolderId(parent)
  }, [selectedDocId, tree])

  const handleFolderClick = (folder: DocNode) => {
    const next = openFolderId === folder.id ? null : folder.id
    setOpenFolderId(next)
    onSelectDoc(folder)
  }

  const handleDocClick = (doc: DocNode) => {
    onSelectDoc(doc)
  }

  return (
    <div className="rounded-lg bg-theme-surface p-3 space-y-3 shadow-sm min-w-0">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-theme-text">目录</h3>
          <p className="text-xs text-theme-textSecondary">仅展开一个目录</p>
        </div>
        {onRefresh && (
          <button
            type="button"
            className="text-xs px-2 py-1 rounded bg-theme-surfaceAlt text-theme-text hover:bg-theme-surface"
            onClick={onRefresh}
          >
            刷新
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-xs text-theme-textSecondary">加载目录...</div>
      ) : (
        <div className="space-y-1 max-h-[70vh] overflow-auto">
          {folders.map((folder) => {
            const isOpen = openFolderId === folder.id
            return (
              <div key={folder.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleFolderClick(folder)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition ${
                    isOpen
                      ? 'bg-theme-surfaceAlt text-theme-text font-semibold'
                      : 'text-theme-textSecondary hover:text-theme-text hover:bg-theme-surfaceAlt/70'
                  }`}
                >
                  <span className="truncate">{folder.title}</span>
                  {isOpen ? (
                    <ChevronDown size={14} className="opacity-70" />
                  ) : (
                    <ChevronRight size={14} className="opacity-70" />
                  )}
                </button>
                {isOpen && (
                  <div className="ml-3 pl-2 space-y-1">
                    {(folder.children || [])
                      .filter((n) => n.type !== 'folder')
                      .map((doc) => {
                        const active = selectedDocId === doc.id
                        return (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => handleDocClick(doc)}
                            className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition ${
                              active
                                ? 'bg-theme-surfaceAlt text-theme-text font-semibold'
                                : 'text-theme-textSecondary hover:text-theme-text hover:bg-theme-surfaceAlt/70'
                            }`}
                            style={{ paddingLeft: 8 }}
                          >
                            {doc.title}
                          </button>
                        )
                      })}
                    {(!folder.children || folder.children.filter((n) => n.type !== 'folder').length === 0) && (
                      <div className="text-xs text-theme-textSecondary px-3 py-1.5">暂无文档</div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          {!folders.length && <div className="text-xs text-theme-textSecondary">暂无目录</div>}
        </div>
      )}
    </div>
  )
}
