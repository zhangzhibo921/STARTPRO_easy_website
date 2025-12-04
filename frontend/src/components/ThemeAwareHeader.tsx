import Link from 'next/link'
import { useRouter } from 'next/router'
import { Menu, X, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { settingsApi, navigationApi } from '@/utils/api'
import type { NavigationItem } from '@/types'
import { getCurrentThemeId, getThemeById } from '@/styles/themes'
import { createIsolatedComponentTheme } from '@/styles/themeComponents'
import type { NavItem, ThemeAwareHeaderProps, NavStyles } from '@/types/navigation'

const defaultNavigation: NavItem[] = [
  { label: '首页', href: '/' },
  { 
    label: '产品服务', 
    href: '/services',
    children: [
      { label: '技术咨询', href: '/services/consulting' },
      { label: '软件开发', href: '/services/development' },
      { label: '系统集成', href: '/services/integration' }
    ]
  },
  { label: '解决方案', href: '/solutions' },
  { label: '案例展示', href: '/cases' },
  { label: '关于我们', href: '/about' },
  { label: '联系我们', href: '/contact' }
]

/**
 * 主题感知导航栏组件
 * 自动根据当前主题调整背景色、文本颜色和边框颜色，确保所有主题下都有良好的对比度和可读性
 */
export default function ThemeAwareHeader({
  logo,
  siteName,
  navigation
}: ThemeAwareHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [dynamicNavigation, setDynamicNavigation] = useState<NavItem[]>(defaultNavigation)
  const [dynamicSettings, setDynamicSettings] = useState<{ site_name?: string; site_logo?: string; company_name?: string; nav_color_style?: string }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [currentThemeId, setCurrentThemeId] = useState('')
  const [headerStyles, setHeaderStyles] = useState<NavStyles>({
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    textColor: 'rgb(255, 255, 255)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    hoverColor: 'rgb(255, 255, 255)',
    activeColor: 'var(--color-primary)',
    dropdownBgColor: 'rgba(0, 0, 0, 0.9)',
    dropdownBorderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: 'rgba(var(--color-accent-rgb), 0.1)'
  })
  
  const router = useRouter()

  // 检查是否在客户端环境
  const [isClient, setIsClient] = useState(typeof window !== 'undefined')

  // 获取当前主题ID并计算主题适配样式
  useEffect(() => {
    if (!isClient) return

    // 计算并设置基于主题的样式
    const updateThemeStyles = () => {
      const themeId = getCurrentThemeId()
      setCurrentThemeId(themeId)

      // 使用隔离的主题变量系统
      const isolatedTheme = createIsolatedComponentTheme(themeId);
      const theme = getThemeById(themeId);
      const isDarkTheme = ['neo-futuristic', 'elegant-dark'].includes(themeId)

      // 基于主题类型计算适合的导航栏样式
      const bgColorOpacity = scrolled ? 0.9 : 0.7
      const textColor = theme.colors.text.primary
      const borderColorOpacity = isDarkTheme ? 0.1 : 0.2

      // 根据主题类型设置悬停颜色，使交互效果更明显
      let hoverColor = theme.colors.text.primary
      if (theme.id === 'neo-futuristic') {
        // 新科技未来主题使用强调色作为悬停颜色
        hoverColor = theme.colors.accent
      } else if (theme.id === 'corporate-blue') {
        // 企业蓝主题使用强调色作为悬停颜色
        hoverColor = theme.colors.accent
      } else if (theme.id === 'elegant-dark') {
        // 优雅暗色主题使用强调色作为悬停颜色
        hoverColor = theme.colors.accent
      } else {
        // 其他主题使用主色作为悬停颜色
        hoverColor = theme.colors.primary
      }

      setHeaderStyles({
        backgroundColor: `rgba(${hexToRgb(theme.colors.surface).join(', ')}, ${bgColorOpacity})`,
        textColor: textColor,
        borderColor: `rgba(${hexToRgb(theme.colors.text.muted).join(', ')}, ${borderColorOpacity})`,
        hoverColor: hoverColor,
        activeColor: theme.colors.primary,
        dropdownBgColor: `rgba(${hexToRgb(theme.colors.surface).join(', ')}, 0.95)`,
        dropdownBorderColor: `rgba(${hexToRgb(theme.colors.text.muted).join(', ')}, ${borderColorOpacity})`,
        shadowColor: `rgba(${hexToRgb(theme.colors.accent).join(', ')}, 0.1)`
      })
    }

    // 初始化主题
    updateThemeStyles()

    // 添加事件监听器
    const handleThemeChange = () => {
      updateThemeStyles()
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    // 监听主题变化和滚动事件
    window.addEventListener('themeChanged', handleThemeChange)
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('themeChanged', handleThemeChange)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isClient, scrolled])

  // 十六进制颜色转RGB
  const hexToRgb = (hex: string): number[] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0]
  }

  // 获取动态导航数据
  useEffect(() => {
    const fetchDynamicData = async () => {
      try {
        // 获取导航数据
        const navResponse = await navigationApi.getAll()
        if (navResponse.success && navResponse.data) {
          const navItems = navResponse.data.map((item: NavigationItem) => ({
            label: item.name,
            href: item.url,
            external: item.target === '_blank',
            children: item.children?.map(child => ({
              label: child.name,
              href: child.url,
              external: child.target === '_blank'
            }))
          }))
          setDynamicNavigation(navItems)
        } else {
          // 如果 API 返回数据为空，使用默认导航
          setDynamicNavigation(defaultNavigation)
        }

        // 获取网站设置
        try {
          const settingsResponse = await settingsApi.get()
          if (settingsResponse.success && settingsResponse.data) {
            setDynamicSettings(settingsResponse.data)
          }
        } catch (error) {
          console.log('获取设置失败，使用默认值:', error)
        }
      } catch (error) {
        console.log('获取导航失败，使用默认导航:', error)
        setDynamicNavigation(defaultNavigation)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDynamicData()
  }, [])

  // 当滚动状态改变时更新样式
  useEffect(() => {
    if (!isClient) return
    
    const updateThemeStyles = () => {
      const themeId = getCurrentThemeId()

      // 使用隔离的主题变量系统
      const isolatedTheme = createIsolatedComponentTheme(themeId);
      const theme = getThemeById(themeId);
      const isDarkTheme = ['neo-futuristic', 'elegant-dark'].includes(themeId)

      const bgColorOpacity = scrolled ? 0.9 : 0.7
      const textColor = isDarkTheme ? theme.colors.text.primary : theme.colors.text.primary
      const borderColorOpacity = isDarkTheme ? 0.1 : 0.2

      setHeaderStyles(prev => ({
        ...prev,
        backgroundColor: `rgba(${hexToRgb(theme.colors.surface).join(', ')}, ${bgColorOpacity})`
      }))
    }

    updateThemeStyles()
  }, [isClient, scrolled])

  // 检查导航项是否为当前活动项
  const isActiveRoute = (href: string) => {
    return router.pathname === href || (href !== '/' && router.pathname.startsWith(href))
  }

  // 设置为客户端环境
  useEffect(() => {
    setIsClient(true)
  }, [])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
    setActiveDropdown(null)
  }

  const toggleDropdown = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label)
  }

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return router.pathname === '/'
    }
    return router.pathname.startsWith(href)
  }

  // 使用动态数据或传入的props，加载时使用默认导航
  const currentNavigation = navigation || dynamicNavigation
  const currentSiteName = siteName || dynamicSettings.company_name || dynamicSettings.site_name || '科技公司'
  const currentLogo = logo || dynamicSettings.site_logo || '/logo.png'
  // 生成样式对象
  const headerStyleObject = {
    backgroundColor: headerStyles.backgroundColor,
    backdropFilter: 'blur(10px)',
    borderBottom: `1px solid ${headerStyles.borderColor}`,
    color: headerStyles.textColor,
    boxShadow: scrolled ? `0 4px 20px ${headerStyles.shadowColor}` : 'none',
  }

  // 根据主题特性决定使用哪种logo文字样式 - neo-futuristic主题不使用渐变效果以保持白色公司名称
  const useTextGradient = ['corporate-blue', 'emerald-forest', 'mystic-purple'].includes(currentThemeId)

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={headerStyleObject}
      className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 nav-container ${scrolled ? 'py-1' : 'py-2'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between" style={{ height: '70px' }}>
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img 
                src={currentLogo} 
                alt={currentSiteName} 
                className="h-9 w-auto transition-transform duration-300 group-hover:scale-110" 
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzAwZDRmZiIvPgo8cGF0aCBkPSJNOCAxMmg0djhoLTR2LTh6TTEyIDhoNHYxMmgtNHYtMTJ6TTE2IDRoNHYxNmgtNHYtMTZ6IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded"></div>
            </div>
            {/* 公司名称使用与导航项一致的字体颜色 */}
            <span className="text-xl font-bold hidden sm:block" style={{
              color: headerStyles.textColor
            }}>
              {currentSiteName}
            </span>
          </Link>

          {/* Desktop Navigation - 简洁设计 */}
          <nav className="hidden md:flex items-center space-x-6">
            {currentNavigation.map((item: NavItem) => (
              <div key={item.label} className="relative group">
                {item.children ? (
                  <div className="relative">
                    <div
                      className="flex items-center transition-all duration-300"
                      style={{
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={() => setActiveDropdown(item.label)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <Link
                        href={item.href}
                        className={`flex items-center px-4 py-2 rounded-md transition-all duration-300 ease-in-out relative ${isActiveLink(item.href) ? 'font-semibold' : ''}`}
                        style={{
                          color: isActiveLink(item.href) ? headerStyles.activeColor : headerStyles.textColor,
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = headerStyles.hoverColor
                          // 添加背景色效果，移除阴影
                          e.currentTarget.style.backgroundColor = `rgba(${hexToRgb(headerStyles.hoverColor).join(', ')}, 0.15)`
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = isActiveLink(item.href) ? headerStyles.activeColor : headerStyles.textColor
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      >
                        <span className="relative z-20">{item.label}</span>
                      </Link>
                    </div>

                    {/* 下拉菜单 */}
                    <AnimatePresence>
                      {activeDropdown === item.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute top-full left-0 mt-2 w-48 rounded-lg backdrop-blur-sm overflow-hidden border z-[1200]"
                          style={{
                            backgroundColor: headerStyles.dropdownBgColor,
                            borderColor: `rgba(${hexToRgb(headerStyles.textColor).join(', ')}, 0.1)`,
                            transformOrigin: 'top center'
                          }}
                          onMouseEnter={() => setActiveDropdown(item.label)}
                          onMouseLeave={() => setActiveDropdown(null)}
                        >
                          <div className="py-1">
                            {item.children.map((child: NavItem, index: number) => (
                              <Link
                                key={child.label}
                                href={child.href}
                                className={`block px-4 py-2 text-sm transition-all duration-200 ease-in-out ${index !== (item.children?.length || 0) - 1 ? 'border-b' : ''}`}
                                style={{
                                  color: isActiveLink(child.href) ? headerStyles.activeColor : headerStyles.textColor,
                                  backgroundColor: 'transparent',
                                  borderColor: `rgba(${hexToRgb(headerStyles.textColor).join(', ')}, 0.1)`
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = headerStyles.hoverColor
                                  e.currentTarget.style.backgroundColor = `rgba(${hexToRgb(headerStyles.hoverColor).join(', ')}, 0.1)`
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = isActiveLink(child.href) ? headerStyles.activeColor : headerStyles.textColor
                                  e.currentTarget.style.backgroundColor = 'transparent'
                                }}
                              >
                                <span>{child.label}</span>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-2 rounded-md transition-all duration-300 ease-in-out relative ${isActiveLink(item.href) ? 'font-semibold' : ''}`}
                    style={{
                      color: isActiveLink(item.href) ? headerStyles.activeColor : headerStyles.textColor,
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = headerStyles.hoverColor
                      // 只添加背景色效果，移除阴影和位移
                      e.currentTarget.style.backgroundColor = `rgba(${hexToRgb(headerStyles.hoverColor).join(', ')}, 0.15)`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = isActiveLink(item.href) ? headerStyles.activeColor : headerStyles.textColor
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                    {...(item.external && { target: '_blank', rel: 'noopener noreferrer' })}
                  >
                    <span className="relative z-20">{item.label}</span>
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 rounded-md transition-colors duration-200"
            style={{ color: headerStyles.textColor }}
            aria-label="切换菜单"
            onMouseEnter={(e) => {
              e.currentTarget.style.color = headerStyles.hoverColor
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = headerStyles.textColor
            }}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 移动端菜单 - 全新设计 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="md:hidden absolute top-full left-0 right-0 border-t shadow-2xl backdrop-blur-xl rounded-b-2xl overflow-hidden"
            style={{
              backgroundColor: headerStyles.dropdownBgColor,
              borderColor: headerStyles.dropdownBorderColor
            }}
          >
            <div className="px-4 py-6 space-y-3">
              {currentNavigation.map((item: NavItem) => (
                <div key={item.label} className="rounded-xl overflow-hidden">
                  {item.children ? (
                    <div className="rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between bg-white/5">
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex-1 px-5 py-4 text-left text-base font-medium transition-all duration-300 ease-in-out ${isActiveLink(item.href) ? 'font-semibold' : ''}`}
                          style={{
                            color: isActiveLink(item.href) ? headerStyles.activeColor : headerStyles.textColor,
                            backgroundColor: isActiveLink(item.href) ? `rgba(${hexToRgb(headerStyles.activeColor).join(', ')}, 0.1)` : 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = headerStyles.hoverColor
                            e.currentTarget.style.backgroundColor = `rgba(${hexToRgb(headerStyles.hoverColor).join(', ')}, 0.1)`
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = isActiveLink(item.href) ? headerStyles.activeColor : headerStyles.textColor
                            e.currentTarget.style.backgroundColor = isActiveLink(item.href) ? `rgba(${hexToRgb(headerStyles.activeColor).join(', ')}, 0.1)` : 'transparent'
                          }}
                        >
                          {item.label}
                        </Link>
                        <button
                          onClick={() => toggleDropdown(item.label)}
                          className="p-4 transition-colors duration-200"
                          style={{ color: headerStyles.textColor }}
                        >
                          <ChevronDown
                            className={`w-5 h-5 transition-transform duration-300 ${activeDropdown === item.label ? 'rotate-180' : ''}`}
                          />
                        </button>
                      </div>

                      <AnimatePresence>
                        {activeDropdown === item.label && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-black/20"
                          >
                            <div className="py-2 space-y-1">
                              {item.children.map((child: NavItem) => (
                                <Link
                                  key={child.label}
                                  href={child.href}
                                  onClick={() => setIsOpen(false)}
                                  className={`block px-8 py-4 text-sm transition-all duration-200 ease-in-out border-l-4 border-transparent rounded-r-lg`}
                                  style={{
                                    color: isActiveLink(child.href) ? headerStyles.activeColor : headerStyles.textColor,
                                    backgroundColor: 'transparent',
                                    borderLeftColor: 'transparent'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = headerStyles.hoverColor
                                    e.currentTarget.style.backgroundColor = `rgba(${hexToRgb(headerStyles.hoverColor).join(', ')}, 0.1)`
                                    e.currentTarget.style.borderLeftColor = headerStyles.hoverColor
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = isActiveLink(child.href) ? headerStyles.activeColor : headerStyles.textColor
                                    e.currentTarget.style.backgroundColor = 'transparent'
                                    e.currentTarget.style.borderLeftColor = 'transparent'
                                  }}
                                >
                                  <div className="flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-current opacity-30 mr-3"></span>
                                    <span>{child.label}</span>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-5 py-4 text-base font-medium transition-all duration-300 ease-in-out rounded-lg ${isActiveLink(item.href) ? 'font-semibold' : ''}`}
                      style={{
                        color: isActiveLink(item.href) ? headerStyles.activeColor : headerStyles.textColor,
                        backgroundColor: isActiveLink(item.href) ? `rgba(${hexToRgb(headerStyles.activeColor).join(', ')}, 0.1)` : 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = headerStyles.hoverColor
                        e.currentTarget.style.backgroundColor = `rgba(${hexToRgb(headerStyles.hoverColor).join(', ')}, 0.1)`
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = isActiveLink(item.href) ? headerStyles.activeColor : headerStyles.textColor
                        e.currentTarget.style.backgroundColor = isActiveLink(item.href) ? `rgba(${hexToRgb(headerStyles.activeColor).join(', ')}, 0.1)` : 'transparent'
                      }}
                      {...(item.external && { target: '_blank', rel: 'noopener noreferrer' })}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
