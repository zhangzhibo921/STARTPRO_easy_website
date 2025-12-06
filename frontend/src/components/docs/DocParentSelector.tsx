import React, { useMemo } from 'react'
import type { DocNode } from '@/types'

interface DocParentSelectorProps {
  tree: DocNode[]
  value?: number | null
  excludeId?: number
  onChange: (id: number | null) => void
}

interface Option {
  id: number
  label: string
  disabled: boolean
}

// Only folders can be selected as parent. Keep one-level readability with prefix.
const flattenTree = (nodes: DocNode[], prefix = '', excludeId?: number): Option[] => {
  const options: Option[] = []

  nodes.forEach((node) => {
    if (node.type !== 'folder') return
    const isExcluded = excludeId === node.id
    options.push({
      id: node.id,
      label: `${prefix}${node.title}`,
      disabled: !!excludeId && node.id === excludeId
    })
    // 仅需一层目录即可，如需继续向下可继续展开
    if (node.children && node.children.length > 0) {
      const childPrefix = `${prefix}${node.title} / `
      const childOptions = flattenTree(node.children, childPrefix, excludeId)
      options.push(...childOptions)
    }
  })

  return options
}

const isDescendant = (tree: DocNode[], parentId: number, targetId?: number): boolean => {
  if (!targetId) return false
  const stack = [...tree]
  while (stack.length) {
    const node = stack.pop()
    if (!node) break
    if (node.id === parentId) {
      const queue = [...(node.children || [])]
      while (queue.length) {
        const child = queue.shift()
        if (!child) continue
        if (child.id === targetId) return true
        queue.push(...(child.children || []))
      }
    }
    stack.push(...(node.children || []))
  }
  return false
}

export default function DocParentSelector({
  tree,
  value,
  excludeId,
  onChange
}: DocParentSelectorProps) {
  const options = useMemo(() => flattenTree(tree, '', excludeId), [tree, excludeId])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value
    onChange(next === '' ? null : Number(next))
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-theme-text">父级目录</label>
      <select
        value={value ?? ''}
        onChange={handleChange}
        className="w-full theme-input rounded-lg"
        style={{ borderRadius: 10 }}
      >
        <option value="">无（一级）</option>
        {options.map((option) => (
          <option
            key={option.id}
            value={option.id}
            disabled={excludeId !== undefined && (option.id === excludeId || isDescendant(tree, option.id, excludeId))}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
