import React, { useState, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import {
  LayoutDashboard,
  FileText,
  Settings,
  BarChart3,
  Upload,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  Bell,
  Inbox,
  Key
} from 'lucide-react'
import { authApi } from '@/utils/api'
import { getThemeById, defaultTheme, resolveBackgroundEffect, type ThemeBackgroundChoice } from '@/styles/themes'
import BackgroundRenderer from '@/components/theme-backgrounds/BackgroundRenderer'
import { useSettings } from '@/contexts/SettingsContext'
import type { User as UserType } from '@/types'
import UserProfileModal from '@/components/UserProfileModal'
import ChangePasswordModal from '@/components/ChangePasswordModal'

interface AdminLayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

interface MenuItem {
  label: string
  href: string
  icon: ReactNode
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    label: '仪表面板',
    href: '/admin/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />
  },
  {
    label: '页面管理',
    href: '/admin/pages',
    icon: <FileText className="w-5 h-5" />
  },
  {
    label: '文档中心',
    href: '/admin/docs',
    icon: <FileText className="w-5 h-5" />
  },
  {
    label: '导航管理',
    href: '/admin/navigation',
    icon: <Menu className="w-5 h-5" />
  },
  {
    label: '素材管理',
    href: '/admin/files',
    icon: <Upload className="w-5 h-5" />
  },
  {
    label: '数据分析',
    href: '/admin/analytics',
    icon: <BarChart3 className="w-5 h-5" />
  },
  {
    label: '通知设置',
    href: '/admin/notifications',
    icon: <Bell className="w-5 h-5" />
  },
  {
    label: '通知记录',
    href: '/admin/notifications/messages',
    icon: <Inbox className="w-5 h-5" />
  },
  {
    label: '系统设置',
    href: '/admin/settings',
    icon: <Settings className="w-5 h-5" />
  }
]

export default function AdminLayout({
  children,
  title = '后台管理',
  description = '科技公司后台管理系统'
}: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const router = useRouter()

  const pageTitle = title === '后台管理' ? title : `${title} - 后台管理`

  // 检查认证状态
  const refreshUserProfile = async (): Promise<void> => {
    const response = await authApi.getProfile()
    if (response.success) {
      setUser(response.data)
      return
    }
    throw new Error('获取用户信息失败')
  }

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get('auth-token')
      
      if (!token) {
        router.replace('/admin/login')
        return
      }

      try {
        await refreshUserProfile()
      } catch (error: any) {
        console.error('AdminLayout: 认证失败:', error)
        Cookies.remove('auth-token')
        router.replace('/admin/login')
        toast.error('登录已过期，请重新登录')
      } finally {
        setIsLoading(false)
      }
    }

    // 添加短暂延迟避免竞态
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [router])

  // 登出功能
  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('登出错误:', error)
    } finally {
      Cookies.remove('auth-token')
      router.replace('/admin/login')
      toast.success('已安全退出登录')
    }
  }

  const handleOpenProfile = () => {
    setIsUserMenuOpen(false)
    setShowProfileModal(true)
  }

  const handleOpenPassword = () => {
    setIsUserMenuOpen(false)
    setShowPasswordModal(true)
  }

  // 检查菜单是否激活
  const { settings } = useSettings()
  const currentThemeId = settings?.site_theme
  const activeTheme = useMemo(() => getThemeById(currentThemeId || defaultTheme.id), [currentThemeId])
  const backgroundPreference: ThemeBackgroundChoice = (settings?.theme_background || 'theme-default') as ThemeBackgroundChoice
  const resolvedBackground = useMemo(
    () => resolveBackgroundEffect(activeTheme, backgroundPreference),
    [activeTheme, backgroundPreference]
  )
  const isMenuActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return router.pathname === '/admin/dashboard'
    }
    return router.pathname.startsWith(href)
  }

  const logoSrc = settings?.site_logo || '/system-default/元兴logo.png'
  const siteName = settings?.site_name || '管理员后台'

  useEffect(() => {
    if (!settings?.site_favicon) return
    const applyFavicon = (rel: string) => {
      let link = document.querySelector<HTMLLinkElement>(`link[rel='${rel}']`)
      if (!link) {
        link = document.createElement('link')
        link.rel = rel
        document.head.appendChild(link)
      }
      link.href = settings.site_favicon as string
    }
    applyFavicon('icon')
    applyFavicon('shortcut icon')
  }, [settings?.site_favicon])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-semantic-mutedBg text-theme-text flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-accent mx-auto mb-4"></div>
          <p className="text-theme-textSecondary">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="relative min-h-screen overflow-hidden">
        <BackgroundRenderer effect={resolvedBackground} />
        <div className="admin-shell relative z-990 min-h-screen bg-semantic-mutedBg text-theme-text transition-colors">
        {/* 侧边栏*/}
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-semantic-panel transform transition-transform duration-300 lg:translate-x-0">
          {/* Logo区域 */}
          <div className="flex items-center justify-between h-16 px-6">
              <Link href="/admin/dashboard" className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r from-theme-primary to-theme-accent text-white shadow-md">
                  {logoSrc ? <img src={logoSrc} alt="Logo" className="h-6 w-auto object-contain" /> : null}
                </div>
                {/* <span className="text-lg font-semibold text-theme-text">{siteName}</span> */}
                <span className="text-lg font-semibold text-theme-text">管理员后台</span>
              </Link>
            
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-theme-textSecondary hover:text-theme-text"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isMenuActive(item.href)
                    ? 'bg-semantic-hero-accent text-white shadow-semantic'
                    : 'text-theme-textSecondary hover:text-theme-text hover:bg-semantic-mutedBg/80'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* 底部用户信息 */}
          <div className="p-4">
            <div className="flex items-center space-x-3 text-sm text-theme-textSecondary">
              <div className="w-8 h-8 bg-semantic-hero-accent rounded-full flex items-center justify-center text-white">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-theme-text font-medium">{user?.username}</p>
                <p className="text-xs text-theme-textSecondary">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 涓诲唴瀹瑰尯鍩?*/}
        <div className="lg:pl-64">
          {/* 顶部导航栏*/}
          <header className="bg-semantic-panel h-16 shadow-sm relative z-999">
            <div className="flex items-center justify-between h-full px-6">
              {/* 移动端菜单按钮*/}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-theme-textSecondary hover:text-theme-text transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* 桌面导航*/}
              <div className="hidden lg:block">
                <h1 className="text-xl font-semibold text-theme-text">
                  {title}
                </h1>
              </div>

              {/* 用户菜单 */}
              <div className="relative z-[1200]">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg text-theme-textSecondary hover:text-theme-text transition-colors"
                >
                  <div className="w-8 h-8 bg-semantic-mutedBg rounded-full flex items-center justify-center text-theme-primary">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {user?.username}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-semantic-panel rounded-lg shadow-lg z-[1200] border border-semantic-panelBorder backdrop-blur-sm"
                    >
                      <div className="py-2">
                        <div className="px-4 py-2">
                          <p className="text-sm font-medium text-theme-text">
                            {user?.username}
                          </p>
                          <p className="text-xs text-theme-textSecondary">
                            {user?.email}
                          </p>
                        </div>

                        <button
                          onClick={handleOpenProfile}
                          className="w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-[rgba(var(--color-text-muted-rgb),0.1)] flex items-center space-x-2 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          <span>账户资料</span>
                        </button>
                        <button
                          onClick={handleOpenPassword}
                          className="w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-[rgba(var(--color-text-muted-rgb),0.1)] flex items-center space-x-2 transition-colors"
                        >
                          <Key className="w-4 h-4" />
                          <span>修改密码</span>
                        </button>

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-[rgba(var(--color-text-muted-rgb),0.1)] flex items-center space-x-2 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>退出登录</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* 页面内容 */}
          <main className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </main>
        </div>

        {/* 移动端遮罩*/}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        </div>
      </div>
      <UserProfileModal
        isOpen={showProfileModal}
        user={user}
        onClose={() => setShowProfileModal(false)}
        onProfileUpdated={refreshUserProfile}
      />
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onPasswordChanged={refreshUserProfile}
      />
    </>
  )
}












