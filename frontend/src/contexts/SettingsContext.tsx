import React, { createContext, useContext, useState, useEffect } from 'react'
import { settingsApi } from '@/utils/api'
import type { Settings } from '@/types'
import { getDefaultFooterLayout, getDefaultFooterSocialLinks } from '@/constants/footerDefaults'

interface SettingsContextType {
  settings: Settings | null
  isLoading: boolean
  refreshSettings: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  isLoading: true,
  refreshSettings: async () => {}
})

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

interface SettingsProviderProps {
  children: React.ReactNode
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const response = await settingsApi.get()

      if (response.success) {
        const { site_record: _removedRecord, nav_layout_style: _removedLayout, theme_overrides: _removedOverrides, ...rest } =
          response.data || {}
        const settingsWithDefaults: Settings = {
          ...rest,
          site_keywords: (response.data as any)?.site_keywords || '',
          site_statement: (response.data as any)?.site_statement || '',
          icp_link: (response.data as any)?.icp_link || '',
          site_font: (response.data as any)?.site_font || 'inter',
          site_font_custom_name: (response.data as any)?.site_font_custom_name || '',
          site_font_url: (response.data as any)?.site_font_url || '',
          footer_layout: response.data.footer_layout ?? getDefaultFooterLayout(),
          footer_social_links: response.data.footer_social_links ?? [],
          theme_background: response.data.theme_background ?? 'theme-default',
          allow_search_index: (response.data as any)?.allow_search_index !== false,
          verification_tags: (response.data as any)?.verification_tags || {}
        }
        setSettings(settingsWithDefaults)
      } else {
        const defaultSettings: Settings = {
          site_name: '??????',
          company_name: '????',
          site_description: '???????????????????',
          site_keywords: '',
          site_font: 'inter',
          site_font_custom_name: '',
          site_font_url: '',
          site_statement: '',
          icp_link: '',
          site_logo: '/logo.png',
          site_favicon: '',
          contact_email: 'contact@example.com',
          contact_phone: '400-123-4567',
          address: '??????????',
          icp_number: '?ICP?xxxxxxxx?',
          analytics_code: '',
          site_theme: 'neo-futuristic',
          allow_search_index: true,
          verification_tags: {},
          social_links: {
            weibo: '',
            wechat: '',
            qq: '',
            email: ''
          },
          quick_links: [
            { label: '????', href: '/about' },
            { label: '????', href: '/services' },
            { label: '????', href: '/solutions' },
            { label: '????', href: '/contact' },
            { label: '????', href: '/privacy' },
            { label: '????', href: '/terms' }
          ],
          footer_layout: getDefaultFooterLayout(),
          footer_social_links: getDefaultFooterSocialLinks(),
          theme_background: 'theme-default'
        }
        setSettings(defaultSettings)
      }
    } catch (error) {
      console.error('获取设置失败:', error)
      const fallbackSettings: Settings = {
        site_name: '??????',
        company_name: '????',
          site_description: '???????????????????',
        site_keywords: '',
        site_font: 'inter',
        site_font_custom_name: '',
        site_font_url: '',
        site_statement: '',
        icp_link: '',
        site_logo: '/logo.png',
        site_favicon: '',
        contact_email: 'contact@example.com',
        contact_phone: '400-123-4567',
        address: '??????????',
        icp_number: '?ICP?xxxxxxxx?',
        analytics_code: '',
        site_theme: 'neo-futuristic',
        allow_search_index: true,
        verification_tags: {},
        social_links: {
          weibo: '',
          wechat: '',
          qq: '',
          email: ''
        },
        quick_links: [
          { label: '????', href: '/about' },
          { label: '????', href: '/services' },
          { label: '????', href: '/solutions' },
          { label: '????', href: '/contact' },
          { label: '????', href: '/privacy' },
          { label: '????', href: '/terms' }
        ],
        footer_layout: getDefaultFooterLayout(),
        footer_social_links: getDefaultFooterSocialLinks(),
        theme_background: 'theme-default'
      }
      setSettings(fallbackSettings)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshSettings = async () => {
    await fetchSettings()
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        refreshSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}
