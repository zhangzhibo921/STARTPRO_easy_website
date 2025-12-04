import React from 'react'
import { TemplateComponent } from '@/types/templates'

export const TextBlockPreview: React.FC<{ component: TemplateComponent }> = ({ component }) => {
  const { title, content, widthOption = 'full', backgroundColorOption = 'default', alignment = 'left' } = component.props

  // 根据宽度选项设置容器类名
  const containerClass = widthOption === 'standard' ? 'max-w-screen-2xl mx-auto' : 'w-full';
  // 根据背景色选项设置组件内部背景色
  const componentClass = backgroundColorOption === 'transparent' ? 'text-block-preview p-8 rounded-lg' : 'text-block-preview bg-color-surface p-8 rounded-lg shadow-sm';
  const alignClass = alignment === 'center' ? 'text-center' : alignment === 'right' ? 'text-right' : 'text-left'

  return (
    <div className={containerClass}>
      <div className={componentClass}>
        {title && (
          <h2 className={`text-block-title text-3xl font-bold mb-6 text-text-primary leading-tight ${alignClass}`}>
            {title}
          </h2>
        )}
        <div className={`text-block-content prose prose-lg max-w-none ${alignClass}`}>
          {content ? (
            <div
              className="text-text-secondary leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <div className="text-text-tertiary italic">
              在这里输入文本内容...
              <br /><br />
              💡 支持HTML格式，可以使用 &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;a&gt; 等标签
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


// 图片区块预览
