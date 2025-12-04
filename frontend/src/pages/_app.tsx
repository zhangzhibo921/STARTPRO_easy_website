import '@/styles/globals.css'
import '@/styles/cyber-timeline.css'
import '@/styles/cyber-showcase.css'
import '@/styles/cyber-super-card.css'
import '@/styles/link-block.css'
import '@/styles/table-block.css'
import type { AppProps } from 'next/app'
import { Toaster } from 'react-hot-toast'
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext'
import { useMetaInfo } from '@/hooks/useMetaInfo'
import { useEffect } from 'react'
import { applyTheme, getThemeById } from '@/styles/themes'
import { applyIsolatedThemeVariables } from '@/styles/themeComponents'
import { applyFont } from '@/styles/fontLoader'

// 内部组件来使用useMetaInfo Hook
function AppContent({ Component, pageProps }: AppProps) {
  // 使用Hook来动态更新网站元信息
  useMetaInfo()
  const { settings } = useSettings()

  useEffect(() => {
    if (settings?.site_theme) {
      const theme = getThemeById(settings.site_theme)
      applyTheme(theme)
      applyIsolatedThemeVariables(settings.site_theme)
    }
  }, [settings?.site_theme])

  useEffect(() => {
    applyFont(settings?.site_font || 'inter', {
      name: settings?.site_font_custom_name,
      url: settings?.site_font_url
    })
  }, [settings?.site_font, settings?.site_font_custom_name, settings?.site_font_url])

  return (
    <>
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a1b23',
            color: '#fff',
            border: '1px solid #374151',
          },
          success: {
            style: {
              border: '1px solid #00d4ff',
            },
          },
          error: {
            style: {
              border: '1px solid #ef4444',
            },
          },
        }}
      />
    </>
  )
}

export default function App(props: AppProps) {
  return (
    <SettingsProvider>
      <AppContent {...props} />
    </SettingsProvider>
  )
}
