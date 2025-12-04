/**
 * 获取API服务器基础URL
 */
const getApiBaseUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:3001'
  
  // 在开发环境中使用localhost，在生产环境中使用window.location.hostname
  const protocol = window.location.protocol
  const hostname = process.env.NODE_ENV === 'production' ? window.location.hostname : 'localhost'
  return `${protocol}//${hostname}:3001`
}

/**
 * 动态更新网站favicon
 */
export const updateFavicon = (faviconUrl: string) => {
  if (typeof window === 'undefined') return

  console.log('更新favicon:', faviconUrl)

  // 由于Next.js已经配置了uploads代理，直接使用路径即可
  if (!faviconUrl) {
    console.log('未提供自定义 favicon，跳过更新')
    return
  }

  let finalFaviconUrl = faviconUrl
  if (!faviconUrl.startsWith('/') && !faviconUrl.startsWith('http')) {
    finalFaviconUrl = `/${faviconUrl}`
  }

  console.log('最终favicon URL:', finalFaviconUrl)

  // 获取现有的favicon元素
  const faviconElement = document.getElementById('favicon') as HTMLLinkElement
  const appleTouchIconElement = document.getElementById('apple-touch-icon') as HTMLLinkElement

  if (faviconElement && finalFaviconUrl) {
    // 添加时间戳避免缓存问题
    const urlWithTimestamp = finalFaviconUrl + '?v=' + Date.now()
    faviconElement.href = urlWithTimestamp
    console.log('已更新favicon元素:', urlWithTimestamp)
  }

  if (appleTouchIconElement && finalFaviconUrl) {
    const urlWithTimestamp = finalFaviconUrl + '?v=' + Date.now()
    appleTouchIconElement.href = urlWithTimestamp
    console.log('已更新apple-touch-icon元素:', urlWithTimestamp)
  }
}

/**
 * 动态更新网站标题
 */
export const updateTitle = (title: string) => {
  if (typeof window === 'undefined') return

  document.title = title
}

/**
 * 动态更新Open Graph元信息
 */
export const updateOGMeta = (siteName: string, description: string, logoUrl?: string) => {
  if (typeof window === 'undefined') return

  console.log('更新OG信息:', { siteName, description, logoUrl })

  // 由于Next.js已经配置了uploads代理，直接使用路径即可
  let finalLogoUrl = logoUrl
  if (logoUrl && !logoUrl.startsWith('/') && !logoUrl.startsWith('http')) {
    finalLogoUrl = `/${logoUrl}`
  }

  console.log('最终logo URL:', finalLogoUrl)

  // 更新 og:title
  const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement
  if (ogTitle) {
    ogTitle.content = siteName
  }

  // 更新 og:description
  const ogDescription = document.querySelector('meta[property="og:description"]') as HTMLMetaElement
  if (ogDescription) {
    ogDescription.content = description
  }

  // 更新 og:image
  if (finalLogoUrl) {
    const ogImage = document.querySelector('meta[property="og:image"]') as HTMLMetaElement
    if (ogImage) {
      ogImage.content = finalLogoUrl
    }
  }

  // 更新页面描述
  const descriptionMeta = document.querySelector('meta[name="description"]') as HTMLMetaElement
  if (descriptionMeta) {
    descriptionMeta.content = description
  }
}
