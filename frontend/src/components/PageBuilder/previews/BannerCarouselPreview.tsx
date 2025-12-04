import React, { useEffect, useState } from "react"
import { TemplateComponent } from "@/types/templates"

const getOverlayPositionClass = (
  position?: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
) => {
  switch (position) {
    case 'top-left':
      return 'top-6 left-6 md:top-10 md:left-10'
    case 'top-center':
      return 'top-6 left-1/2 -translate-x-1/2'
    case 'top-right':
      return 'top-6 right-6 md:top-10 md:right-10'
    case 'center-left':
      return 'top-1/2 left-6 md:left-10 -translate-y-1/2'
    case 'center-right':
      return 'top-1/2 right-6 md:right-10 -translate-y-1/2'
    case 'bottom-left':
      return 'bottom-6 left-6 md:bottom-10 md:left-10'
    case 'bottom-center':
      return 'bottom-6 left-1/2 -translate-x-1/2'
    case 'bottom-right':
      return 'bottom-6 right-6 md:bottom-10 md:right-10'
    default:
      return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
  }
}

export const BannerCarouselPreview: React.FC<{ component: TemplateComponent }> = ({ component }) => {
  const {
    title,
    subtitle,
    slides = [],
    autoPlay = true,
    interval = 5000,
    showIndicators = true,
    showArrows = true,
    widthOption = 'full',
    backgroundColorOption = 'default',
    titleColorMode = 'default',
    customTitleColor = '',
    subtitleColorMode = 'default',
    customSubtitleColor = ''
  } = component.props

  const containerClass = `${widthOption === 'standard' ? 'max-w-screen-2xl mx-auto' : 'w-full'} ${
    backgroundColorOption === 'transparent' ? '' : 'bg-color-surface'
  }`

  const [currentIndex, setCurrentIndex] = useState(0)
  const slideCount = slides.length

  useEffect(() => {
    setCurrentIndex(0)
  }, [slideCount])

  useEffect(() => {
    if (!autoPlay || slideCount <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideCount)
    }, interval || 5000)
    return () => clearInterval(timer)
  }, [autoPlay, interval, slideCount])

  // 占位态
  if (slideCount === 0) {
    return (
      <div className={containerClass}>
        <div className="relative overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-700 banner-carousel-preview">
          <div className="relative w-full h-96 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-5xl mb-4">🖼️</div>
              <h3 className="text-2xl font-bold mb-2">横幅轮播图</h3>
              <p className="text-lg opacity-90">自动播放的图片轮播组件</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentSlide = slides[currentIndex] || {}
  const overlayPosClass = getOverlayPositionClass(currentSlide.overlayPosition as any)

  return (
    <div className={containerClass}>
      <div className="relative overflow-hidden rounded-xl bg-color-background banner-carousel-preview">
          <div className="relative w-full h-96 md:h-[480px] banner-slide-container">
          <div className="absolute inset-0">
            {currentSlide.image ? (
              <img
                key={currentSlide.image}
                src={currentSlide.image}
                alt={currentSlide.title || '轮播图'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/70 to-secondary/70 flex items-center justify-center">
                <div className="text-5xl opacity-50">🖼️</div>
              </div>
            )}
            <div className="absolute inset-0 bg-black/25" />
          </div>

          <div className={`absolute ${overlayPosClass} z-10 banner-slide-content-container px-4 md:px-6`}>
            <div className="max-w-3xl bg-color-surface/70 backdrop-blur-sm rounded-xl p-6 md:p-8 banner-slide-content">
              {currentSlide.title && (
                <h2
                  className="text-3xl font-bold text-text-primary mb-4 leading-tight banner-slide-title dark:text-white"
                  style={titleColorMode === 'custom' && customTitleColor ? { color: customTitleColor } : undefined}
                >
                  {currentSlide.title}
                </h2>
              )}
              {currentSlide.description && (
                <p
                  className="text-lg text-text-secondary mb-6 opacity-90 banner-slide-description dark:text-white"
                  style={subtitleColorMode === 'custom' && customSubtitleColor ? { color: customSubtitleColor } : undefined}
                >
                  {currentSlide.description}
                </p>
              )}
              {currentSlide.buttonText && (
                <a
                  href={currentSlide.buttonLink || '#'}
                  className="inline-block px-6 py-3 bg-primary text-text-primary font-medium rounded-lg hover:bg-secondary transition-colors duration-300 banner-slide-button dark:text-white"
                >
                  {currentSlide.buttonText}
                </a>
              )}
            </div>
          </div>

          {showIndicators && slideCount > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20 banner-indicators">
              {slides.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'bg-text-primary w-6' : 'bg-text-primary/50 hover:bg-text-primary/70'
                  }`}
                  aria-label={`切换到第${index + 1}张幻灯片`}
                />
              ))}
            </div>
          )}

          {showArrows && slideCount > 1 && (
            <>
              <button
                onClick={() => setCurrentIndex((prev) => (prev - 1 + slideCount) % slideCount)}
                className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 bg-color-surface/70 text-text-primary p-2 rounded-full shadow-sm hover:bg-color-surface transition-colors z-20 banner-arrow banner-arrow-left"
                aria-label="上一张"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button
                onClick={() => setCurrentIndex((prev) => (prev + 1) % slideCount)}
                className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 bg-color-surface/70 text-text-primary p-2 rounded-full shadow-sm hover:bg-color-surface transition-colors z-20 banner-arrow banner-arrow-right"
                aria-label="下一张"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}
        </div>
      </div>

      {(title || subtitle) && (
        <div className="p-4 bg-color-surface banner-info-container">
          <div className="text-center">
            {title && (
              <h3
                className="font-bold text-text-primary mb-1 banner-info-title dark:text-white"
                style={titleColorMode === 'custom' && customTitleColor ? { color: customTitleColor } : undefined}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                className="text-sm text-text-secondary banner-info-subtitle dark:text-gray-300"
                style={subtitleColorMode === 'custom' && customSubtitleColor ? { color: customSubtitleColor } : undefined}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// 横幅轮播图实际组件（已发布页）
export const BannerCarousel: React.FC<{ component: TemplateComponent }> = ({ component }) => {
  const {
    title,
    subtitle,
    slides = [],
    autoPlay = true,
    interval = 5000,
    showIndicators = true,
    showArrows = true,
    widthOption = 'full',
    backgroundColorOption = 'default',
    titleColorMode = 'default',
    customTitleColor = '',
    subtitleColorMode = 'default',
    customSubtitleColor = ''
  } = component.props
  const containerClass = `${widthOption === 'standard' ? 'max-w-screen-2xl mx-auto' : 'w-full'} ${
    backgroundColorOption === 'transparent' ? '' : 'bg-color-surface'
  }`

  const BannerCarouselComponent = require('@/components/BannerCarousel').default

  return (
    <div className={containerClass}>
      <BannerCarouselComponent
        slides={slides}
        autoPlay={autoPlay}
        interval={interval}
        showIndicators={showIndicators}
        showArrows={showArrows}
        className="rounded-xl overflow-hidden"
      />

      {/* 仅保留标题与副标题信息 */}
      {(title || subtitle) && (
        <div className="p-4 bg-color-surface banner-info-container">
          <div className="text-center">
            {title && (
              <h3
                className="font-bold text-text-primary mb-1 banner-info-title dark:text-white"
                style={titleColorMode === 'custom' && customTitleColor ? { color: customTitleColor } : undefined}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                className="text-sm text-text-secondary banner-info-subtitle dark:text-gray-300"
                style={subtitleColorMode === 'custom' && customSubtitleColor ? { color: customSubtitleColor } : undefined}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
