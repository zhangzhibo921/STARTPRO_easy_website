import React from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface LinkBlockEditorProps {
  links: any[]
  onAdd: () => void
  onChange: (index: number, fieldKey: string, value: any) => void
  onRemove: (index: number) => void
  linkStyle: string
  linkShape: string
  linkGlow: boolean
  hoverEffect: string
  onStyleChange: (key: string, value: any) => void
}

const LinkBlockEditor: React.FC<LinkBlockEditorProps> = ({
  links,
  onAdd,
  onChange,
  onRemove,
  linkStyle,
  linkShape,
  linkGlow,
  hoverEffect,
  onStyleChange
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 dark:text-white">链接列表</h4>
        <button
          onClick={onAdd}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-tech-accent text-white rounded-lg hover:bg-tech-secondary transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>新增链接</span>
        </button>
      </div>

      {links.map((link: any, index: number) => (
        <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              链接 {index + 1}
            </span>
            <button
              onClick={() => onRemove(index)}
              className="p-1 text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
          <input
            type="text"
            value={link.text || ''}
            onChange={(e) => onChange(index, 'text', e.target.value)}
            placeholder="链接文本"
            className="w-full px-2 py-1 text-sm rounded theme-input"
          />
          <input
            type="url"
            value={link.url || ''}
            onChange={(e) => onChange(index, 'url', e.target.value)}
            placeholder="链接地址"
            className="w-full px-2 py-1 text-sm rounded theme-input"
          />
        </div>
      ))}

      <div className="mt-4 space-y-3">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">按钮样式</label>
          <select
            value={linkStyle}
            onChange={(e) => onStyleChange('linkStyle', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg theme-input"
          >
            <option value="gradient">渐变</option>
            <option value="solid">填充</option>
            <option value="outline">描边</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">圆角</label>
          <select
            value={linkShape}
            onChange={(e) => onStyleChange('linkShape', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg theme-input"
          >
            <option value="pill">胶囊</option>
            <option value="rounded">圆角</option>
            <option value="square">直角</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={linkGlow}
            onChange={(e) => onStyleChange('linkGlow', e.target.checked)}
            className="rounded border-theme-divider text-tech-accent focus:ring-tech-accent"
          />
          开启流光/光晕
        </label>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">悬浮特效</label>
          <select
            value={hoverEffect}
            onChange={(e) => onStyleChange('hoverEffect', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg theme-input"
          >
            <option value="lift">浮起</option>
            <option value="glow">发光</option>
            <option value="none">关闭</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default LinkBlockEditor
