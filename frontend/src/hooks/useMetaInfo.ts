import { useEffect } from 'react'
import { useSettings } from '@/contexts/SettingsContext'
import { updateFavicon, updateTitle, updateOGMeta } from '@/utils/favicon'

/**
 * 动态更新网站元信息的Hook
 */
export const useMetaInfo = () => {
  const { settings, isLoading } = useSettings()

  useEffect(() => {
    if (!isLoading && settings) {
      console.log('开始更新网站元信息:', settings)
      
      // 更新favicon（仅当用户上传了自定义路径时）
      if (settings.site_favicon) {
        console.log('更新favicon:', settings.site_favicon)
        updateFavicon(settings.site_favicon)
      }

      // 更新页面标题（非 docs 页）；docs 页内部会自定义标题
      const isDocsPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/docs')
      if (!isDocsPage && settings.site_name) {
        console.log('更新页面标题:', settings.site_name)
        updateTitle(settings.site_name)
      }

      // 更新Open Graph信息
      updateOGMeta(
        settings.site_name || '科技公司官网',
        settings.site_description || '现代化科技公司官网，提供专业的技术服务',
        settings.site_logo
      )
    } else if (!isLoading) {
      console.log('设置为空，使用默认值')
      updateFavicon('/favicon.ico')
      updateTitle('科技公司官网')
    }
  }, [settings, isLoading])

  return { settings, isLoading }
}
