import React from 'react'
import { TemplateComponent } from '@/types/templates'
import { motion } from 'framer-motion'

export const HeroPreview: React.FC<{ component: TemplateComponent }> = ({ component }) => {
  const {
    title,
    subtitle,
    backgroundImage,
    buttonText,
    buttonLink,
    backgroundColor,
    widthOption = 'full',
    backgroundColorOption = 'default',
    titleColorMode = 'default',
    customTitleColor = '',
    subtitleColorMode = 'default',
    customSubtitleColor = ''
  } = component.props
  const [bgImageLoaded, setBgImageLoaded] = React.useState(false)
  const [bgImageError, setBgImageError] = React.useState(false)

  // 预加载背景图片
  React.useEffect(() => {
    if (backgroundImage) {
      setBgImageLoaded(false)
      setBgImageError(false)
      const img = new Image()
      img.onload = () => setBgImageLoaded(true)
      img.onerror = () => {
        console.error('Background image failed to load:', backgroundImage)
        setBgImageError(true)
      }
      // 确保使用有效的URL格式
      img.src = backgroundImage
    } else {
      setBgImageLoaded(false)
      setBgImageError(false)
    }
  }, [backgroundImage])

  const shouldShowBackgroundImage = backgroundImage && bgImageLoaded && !bgImageError

  // 设置内联样式以保持功能完整性
  const heroStyle = {
    backgroundImage: shouldShowBackgroundImage
      ? `url(${backgroundImage})`
      : undefined,
    backgroundColor: backgroundColorOption === 'transparent'
      ? undefined
      : backgroundColor || 'var(--color-primary, #3B82F6)',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }

  // 根据宽度选项设置容器类名
  const containerClass = `${widthOption === 'standard' ? 'max-w-screen-2xl mx-auto' : 'w-full'} ${backgroundColorOption === 'transparent' ? '' : 'bg-color-surface'}`;

  return (
    <div className={containerClass}>
      <div
        className="hero-preview relative h-96 lg:h-[500px] flex items-center justify-center rounded-xl overflow-hidden group transition-all duration-300"
        style={heroStyle}
      >
      {/* 背景装饰 - 仅在非透明模式下显示 */}
      {!shouldShowBackgroundImage && backgroundColorOption !== 'transparent' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-90"></div>
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-text-primary/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-text-primary/10 rounded-full blur-xl animate-pulse delay-300"></div>
            <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-text-primary/10 rounded-full blur-xl animate-pulse delay-700"></div>
          </div>
        </>
      )}

      {/* 图片加载提示 - 根据背景选项调整背景色 */}
      {backgroundImage && !bgImageLoaded && !bgImageError && (
        <div className={`absolute inset-0 flex items-center justify-center ${backgroundColorOption === 'transparent' ? '' : 'bg-color-surface'}`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-text-primary border-t-transparent mx-auto mb-2"></div>
            <p className="text-text-primary/70 text-sm">加载背景图片...</p>
          </div>
        </div>
      )}

      {/* 图片加载错误 */}
      {backgroundImage && bgImageError && (
        <div className="absolute top-2 right-2 bg-error/80 text-text-primary text-xs px-2 py-1 rounded">
          背景图片加载失败
        </div>
      )}

      {/* 主内容 */}
      <motion.div
        className="hero-content relative text-center w-full px-8 z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {title && (
          <motion.h1
            className="hero-title text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-text-primary"
            style={titleColorMode === 'custom' && customTitleColor ? { color: customTitleColor } : undefined}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            {title}
          </motion.h1>
        )}

        {subtitle && (
          <motion.p
            className="hero-subtitle text-xl md:text-2xl lg:text-3xl mb-10 opacity-95 leading-relaxed font-light text-text-secondary"
            style={subtitleColorMode === 'custom' && customSubtitleColor ? { color: customSubtitleColor } : undefined}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            {subtitle}
          </motion.p>
        )}

        {buttonText && buttonLink && (
          <motion.a
              href={buttonLink}
              className="hero-button inline-flex items-center px-8 py-4 bg-color-surface text-color-text-primary rounded-full font-semibold text-lg shadow-2xl hover:shadow-text-primary/10 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 group-hover:shadow-text-primary/15"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
            >
            <span>{buttonText}</span>
            <motion.div
              className="ml-2 text-xl"
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              →
            </motion.div>
          </motion.a>
        )}
      </motion.div>

      {/* 底部装饰元素 - 仅在非透明模式下显示渐变背景 */}
      {backgroundColorOption !== 'transparent' && (
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-color-surface/20 to-transparent"></div>
      )}
    </div>
  </div>
  )
}

// 图文展示-上下结构-auto预览

// 文本区块预览
