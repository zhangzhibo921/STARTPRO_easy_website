import React from 'react'
import { MoveHorizontal } from 'lucide-react'

interface ImageTextHorizontalEditorProps {
  imageWidthPercent?: number
  onWidthChange: (value: number) => void
}

const clampWidthPercent = (value?: number) => {
  const numericValue = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(numericValue)) return 100
  return Math.min(100, Math.max(40, numericValue))
}

const ImageTextHorizontalEditor: React.FC<ImageTextHorizontalEditorProps> = ({
  imageWidthPercent,
  onWidthChange
}) => {
  const widthPercent = clampWidthPercent(imageWidthPercent ?? 100)

  const handleChange = (next: number) => {
    const clamped = clampWidthPercent(next)
    onWidthChange(clamped)
  }

  return (
    <div className="mb-6 bg-theme-surface p-4 rounded-lg border border-theme-divider space-y-4">
      <div className="flex items-center gap-2">
        <MoveHorizontal className="w-4 h-4 text-tech-accent" />
        <div>
          <h4 className="font-medium text-theme-textPrimary">图片宽度</h4>
          <p className="text-xs text-theme-textSecondary">拖动调整左右结构中图片列的宽度占比，默认填满该列。</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-theme-textPrimary">列内宽度百分比</span>
          <span className="text-theme-textSecondary">{widthPercent}%</span>
        </div>
        <input
          type="range"
          min={40}
          max={100}
          step={1}
          value={widthPercent}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="w-full"
          style={{ accentColor: 'var(--color-accent, #06B6D4)' }}
        />
        <div className="bg-theme-surfaceAlt border border-theme-divider rounded-lg p-3">
          <div className="h-10 flex items-center justify-center">
            <div className="w-full h-2 rounded-full bg-theme-surface border border-dashed border-theme-divider overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${widthPercent}%`,
                  maxWidth: '100%',
                  backgroundColor: 'var(--color-accent, #06B6D4)',
                  opacity: 0.45,
                  transition: 'width 150ms ease'
                }}
              />
            </div>
          </div>
          <p className="text-[11px] text-theme-textSecondary mt-2">
            100% 为填满图片列（约占整体的 50%），缩小时图片仍会在列内居中显示。
          </p>
        </div>
      </div>
    </div>
  )
}

export default ImageTextHorizontalEditor
