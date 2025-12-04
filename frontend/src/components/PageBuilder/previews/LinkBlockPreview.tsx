import React from 'react'
import { TemplateComponent } from '@/types/templates'

export const LinkBlockPreview: React.FC<{ component: TemplateComponent }> = ({ component }) => {
  const {
    title,
    links = [],
    widthOption = 'full',
    backgroundColorOption = 'default',
    linkStyle = 'gradient',
    linkShape = 'pill',
    linkGlow = true,
    hoverEffect = 'lift'
  } = component.props

  const glowEnabled = linkGlow !== false && linkGlow !== 'false'
  const containerClass = widthOption === 'standard' ? 'max-w-screen-2xl mx-auto' : 'w-full'
  const shellClass = `link-block ${backgroundColorOption === 'transparent' ? 'link-block--transparent' : 'link-block--default'}`
  const buttonClass = [
    'link-block__button',
    `link-block__button--${linkStyle}`,
    `link-block__button--${linkShape}`,
    glowEnabled ? 'link-block__button--glow' : '',
    hoverEffect ? `link-block__button--hover-${hoverEffect}` : ''
  ]
    .filter(Boolean)
    .join(' ')

  const displayLinks = links.length > 0 ? links : [
    { text: '官方网站', url: 'https://example.com' },
    { text: '产品文档', url: 'https://docs.example.com' },
    { text: '技术支持', url: 'https://support.example.com' }
  ]

  return (
    <div className={containerClass}>
      <div className={shellClass}>
        <div className="link-block__inner">
          {title && (
            <h2 className="link-block__title text-3xl font-bold mb-6">
              {title}
            </h2>
          )}
          <div className="link-block__grid">
            {displayLinks.map((link: any, index: number) => (
              <a
                key={index}
                href={link.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass}
              >
                {link.text || '链接文本'}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
