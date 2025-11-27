import React, { useEffect, useState } from 'react'
import { TemplateComponent } from '@/types/templates'

export const ImageTextPreview: React.FC<{ component: TemplateComponent }> = ({ component }) => {
  const {
    title = '标题',
    description = '这是一段描述文字，用来展示图文组件的内容。',
    image = '',
    imageWidthPercent = 100,
    widthOption = 'full',
    backgroundColorOption = 'default'
  } = component.props || {}

  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    if (!image) {
      setImageLoaded(false)
      setImageError(false)
      return
    }

    setImageLoaded(false)
    setImageError(false)

    const img = new Image()
    img.onload = () => {
      setImageLoaded(true)
      setImageError(false)
    }
    img.onerror = () => {
      console.error('ImageText image failed to load:', image)
      setImageLoaded(false)
      setImageError(true)
    }
    img.src = image
  }, [image])

  const containerClass = widthOption === 'standard' ? 'max-w-screen-2xl mx-auto' : 'w-full'
  const componentClass =
    backgroundColorOption === 'transparent'
      ? 'image-text-preview w-full h-full rounded-lg shadow-sm'
      : 'image-text-preview bg-color-surface w-full h-full rounded-lg shadow-sm'

  const normalizedWidthPercent = Math.min(100, Math.max(40, Number(imageWidthPercent) || 100))
  const imageWrapperStyle: React.CSSProperties = {
    width: `${normalizedWidthPercent}%`,
    maxWidth: '100%',
    transition: 'width 200ms ease'
  }

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: 'auto',
    maxWidth: '100%',
    objectFit: 'contain'
  }

  const textPaddingClass = widthOption === 'full' ? 'px-4 md:px-6 lg:px-8' : 'px-8'
  const imagePaddingClass = widthOption === 'full' ? 'px-4 md:px-6 lg:px-8 pb-8' : 'px-8 pb-8'

  return (
    <div className={containerClass}>
      <div className={componentClass}>
        <div className="w-full">
          <div className={`${textPaddingClass} pt-8 pb-4 text-left`}>
            <h2 className="text-3xl font-bold text-text-primary mb-4">{title}</h2>
            <p className="text-text-secondary leading-relaxed whitespace-pre-line">{description}</p>
          </div>

          <div className={`${imagePaddingClass} flex justify-center`}>
            <div style={imageWrapperStyle} className="w-full transition-all duration-200">
              {image ? (
                <>
                  {!imageLoaded && !imageError && (
                    <div className="w-full flex items-center justify-center py-16 animate-pulse text-text-tertiary">
                      <div className="text-center">
                        <div className="text-4xl mb-2 opacity-40">🖼️</div>
                        <p>图片加载中...</p>
                      </div>
                    </div>
                  )}
                  <img
                    src={image}
                    alt={title}
                    style={imageStyle}
                    className={`w-full ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => {
                      setImageLoaded(true)
                      setImageError(false)
                    }}
                    onError={() => {
                      setImageLoaded(false)
                      setImageError(true)
                    }}
                  />
                  {imageError && (
                    <div className="w-full flex items-center justify-center py-16 text-text-tertiary">
                      <div className="text-center">
                        <div className="text-4xl mb-2 opacity-40">⚠️</div>
                        <p>图片加载失败，请检查链接</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full flex items-center justify-center py-16 border border-dashed border-gray-300 text-text-tertiary">
                  <div className="text-center">
                    <div className="text-4xl mb-2 opacity-40">🖼️</div>
                    <p>点击“编辑”上传图片</p>
                    <p className="text-sm mt-2">支持 JPG / PNG / GIF</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
