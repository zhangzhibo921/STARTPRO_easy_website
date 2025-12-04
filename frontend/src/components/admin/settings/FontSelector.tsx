import React from 'react'
import { FONT_OPTIONS, type FontOption } from '@/constants/fonts'

type FontSelectorProps = {
  value?: string
  customName?: string
  customUrl?: string
  onChange: (fontId: string) => void
  onCustomChange: (payload: { name: string; url: string }) => void
}

const FontOptionCard: React.FC<{
  option: FontOption
  active: boolean
  onSelect: () => void
}> = ({ option, active, onSelect }) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left border rounded-lg p-3 transition-colors ${
        active
          ? 'border-tech-accent shadow-[0_8px_20px_rgba(0,212,255,0.15)]'
          : 'border-theme-divider hover:border-tech-accent/70'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-theme-textSecondary">字体</p>
          <p className="font-semibold text-theme-textPrimary">{option.label}</p>
        </div>
        {active && <span className="text-xs text-tech-accent">已选择</span>}
      </div>
      <p className="mt-2 text-theme-textPrimary" style={{ fontFamily: option.fontFamily }}>
        The quick brown fox jumps over the lazy dog. 文字示例
      </p>
    </button>
  )
}

const FontSelector: React.FC<FontSelectorProps> = ({ value, customName, customUrl, onChange, onCustomChange }) => {
  const current = value || 'inter'
  const handleCustomChange = (field: 'name' | 'url', val: string) => {
    onCustomChange({
      name: field === 'name' ? val : customName || '',
      url: field === 'url' ? val : customUrl || ''
    })
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-theme-textPrimary">站点字体</p>
        <p className="text-xs text-theme-textSecondary">选择内置免费字体，应用于全站文字显示。</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {FONT_OPTIONS.filter(opt => !opt.isCustom).map(option => (
          <FontOptionCard
            key={option.id}
            option={option}
            active={option.id === current}
            onSelect={() => onChange(option.id)}
          />
        ))}
      </div>
      <div className="border rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm text-theme-textSecondary">自定义字体</p>
            <p className="font-semibold text-theme-textPrimary">自定义</p>
          </div>
          <button
            type="button"
            className={`text-xs px-3 py-1 rounded-md border ${
              current === 'custom' ? 'border-tech-accent text-tech-accent' : 'border-theme-divider text-theme-textSecondary'
            }`}
            onClick={() => onChange('custom')}
          >
            {current === 'custom' ? '已选择' : '选择'}
          </button>
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-theme-textPrimary mb-1">font-family 名称</label>
              <input
                type="text"
                value={customName || ''}
                onChange={e => handleCustomChange('name', e.target.value)}
                className="w-full px-3 py-2 theme-input border border-theme-divider bg-theme-surfaceAlt focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                placeholder="例如：'MyFont', 'Open Sans', sans-serif"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-theme-textPrimary mb-1">样式表 URL（支持 https）</label>
              <input
                type="url"
                value={customUrl || ''}
                onChange={e => handleCustomChange('url', e.target.value)}
                className="w-full px-3 py-2 theme-input border border-theme-divider bg-theme-surfaceAlt focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                placeholder="https://.../font.css"
              />
            </div>
          </div>
          <p className="text-xs text-theme-textSecondary">
            建议使用可信 CDN（如 Google Fonts、字蛛等），确保有权使用该字体。
          </p>
        </div>
      </div>
    </div>
  )
}

export default FontSelector
