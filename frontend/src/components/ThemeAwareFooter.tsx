import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'
import { getCurrentThemeId, getThemeById } from '@/styles/themes'
import type { ThemeAwareFooterProps, FooterStyles } from '@/types/navigation'
import type { FooterLayout, FooterSocialLink, FooterSection } from '@/types'
import { getDefaultFooterLayout, getDefaultFooterSocialLinks } from '@/constants/footerDefaults'

const DEFAULT_QUICK_LINKS: Array<{ label: string; href: string; external?: boolean }> = [
  { label: '关于我们', href: '/about' },
  { label: '产品服务', href: '/services' },
  { label: '解决方案', href: '/solutions' },
  { label: '联系我们', href: '/contact' },
  { label: '隐私政策', href: '/privacy' },
  { label: '服务条款', href: '/terms' }
]

const sanitizeSvg = (svgMarkup: string) =>
  svgMarkup
    .replace(/<\?xml.*?\?>/gi, '')
    .replace(/<!DOCTYPE.*?>/gi, '')

const normalizeHexColor = (value?: string | null) => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed) ? trimmed : undefined
}

const prepareSvgMarkup = (svgMarkup: string, color?: string) => {
  const sanitized = sanitizeSvg(svgMarkup)
  if (!color) return sanitized
  const cleaned = sanitized
    .replace(/fill="(?!none).*?"/gi, '')
    .replace(/stroke="(?!none).*?"/gi, '')
  return cleaned.replace(/<svg([^>]*)>/i, (_match, attrs) => `<svg${attrs} fill="currentColor" stroke="currentColor">`)
}

const isSvgUrl = (value?: string) => {
  if (!value) return false
  const url = value.split('?')[0] || ''
  return url.toLowerCase().endsWith('.svg')
}

export default function ThemeAwareFooter({
  siteName = '科技公司',
  icpNumber = '京ICP备xxxxxxxx号',
  contactInfo = {
    email: 'contact@example.com',
    phone: '400-123-4567',
    address: '北京市朝阳区科技园'
  },
  socialLinks = {},
  quickLinks: propQuickLinks,
  className = '',
  onThemeChange,
  footerLayout: footerLayoutProp,
  footerSocialLinks: footerSocialLinksProp
}: ThemeAwareFooterProps) {
  const { settings } = useSettings()

  const [isClient, setIsClient] = useState(typeof window !== 'undefined')
  const [footerStyles, setFooterStyles] = useState<FooterStyles>({
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    textColor: 'rgb(209, 213, 219)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    linkColor: 'rgb(209, 213, 219)',
    hoverColor: 'rgb(255, 255, 255)',
    titleColor: 'rgb(255, 255, 255)',
    descriptionColor: 'rgb(209, 213, 219)',
    iconBackgroundColor: 'rgba(255, 255, 255, 0.1)'
  })
  const [hoverPreview, setHoverPreview] = useState<{
    src: string
    label: string
    x: number
    y: number
    visible: boolean
  }>({ src: '', label: '', x: 0, y: 0, visible: false })

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const updateThemeStyles = () => {
      const themeId = getCurrentThemeId()
      const theme = getThemeById(themeId)
      const isDarkTheme = ['neo-futuristic', 'elegant-dark', 'mystic-purple', 'royal-amber', 'emerald-forest'].includes(themeId)

      onThemeChange?.(themeId)

      const hexToRgb = (hex: string): number[] => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result
          ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
          : [0, 0, 0]
      }

      setFooterStyles({
        backgroundColor: `rgba(${hexToRgb(theme.colors.surface).join(', ')}, 0.95)`,
        textColor: theme.colors.text.primary,
        borderColor: `rgba(${hexToRgb(theme.colors.text.muted).join(', ')}, ${isDarkTheme ? 0.1 : 0.2})`,
        linkColor: theme.colors.text.primary,
        hoverColor: theme.colors.accent,
        titleColor: theme.colors.text.primary,
        descriptionColor: theme.colors.text.muted,
        iconBackgroundColor: `rgba(${hexToRgb(theme.colors.accent).join(', ')}, 0.1)`
      })
    }

    updateThemeStyles()
    window.addEventListener('themeChanged', updateThemeStyles)
    return () => window.removeEventListener('themeChanged', updateThemeStyles)
  }, [isClient, onThemeChange])

  const quickLinks = useMemo(() => {
    const raw = propQuickLinks || settings?.quick_links
    if (Array.isArray(raw) && raw.length) return raw
    return DEFAULT_QUICK_LINKS
  }, [propQuickLinks, settings?.quick_links])

  const providedFooterLayout = footerLayoutProp ?? settings?.footer_layout
  const hasExplicitFooterLayout = providedFooterLayout !== undefined && providedFooterLayout !== null
  const resolvedFooterLayout: FooterLayout = providedFooterLayout || getDefaultFooterLayout()

  const providedSocialLinks = footerSocialLinksProp ?? settings?.footer_social_links
  const hasExplicitFooterSocialLinks = providedSocialLinks !== undefined && providedSocialLinks !== null
  const resolvedFooterSocialLinks = useMemo<FooterSocialLink[]>(() => {
    const normalizedLinks = Array.isArray(providedSocialLinks)
      ? providedSocialLinks.filter(link => link && ((link.label && link.label.trim()) || (link.url && link.url.trim())))
      : []
    if (normalizedLinks.length) return normalizedLinks
    if (hasExplicitFooterSocialLinks) return []
    return getDefaultFooterSocialLinks()
  }, [hasExplicitFooterSocialLinks, providedSocialLinks])

  const legacySocialLinks = useMemo<FooterSocialLink[]>(() => {
    if (!socialLinks) return []
    return Object.entries(socialLinks)
      .filter(([, url]) => !!url)
      .map(([id, url]) => ({
        id,
        label: id,
        url: url as string,
        target: '_blank'
      }))
  }, [socialLinks])

  const socialLinksToRender = resolvedFooterSocialLinks.length ? resolvedFooterSocialLinks : legacySocialLinks

  const footerSections = Array.isArray(providedFooterLayout?.sections)
    ? providedFooterLayout.sections
    : !hasExplicitFooterLayout && Array.isArray(resolvedFooterLayout.sections)
      ? resolvedFooterLayout.sections
      : []

  const sectionsToRender: FooterSection[] = footerSections.length
    ? footerSections
    : hasExplicitFooterLayout
      ? []
      : [{
          id: 'quick-links',
          title: '快速链接',
          description: '',
          links: quickLinks.map((link, index) => ({
            id: `quick-link-${index}`,
            label: link.label,
            url: link.href,
            target: link.external ? '_blank' : '_self',
            icon: '',
            color: ''
          }))
        }]

  const sectionsForDisplay = useMemo(() => {
    const next = [...sectionsToRender]
    if (socialLinksToRender.length) {
      next.push({
        id: 'social-section',
        title: '关注我们',
        description: '',
        links: []
      })
    }
    return next
  }, [sectionsToRender, socialLinksToRender])

  const navigationSections = useMemo(
    () => sectionsForDisplay.filter(section => section.id !== 'social-section'),
    [sectionsForDisplay]
  )

  const socialSection = useMemo(
    () => sectionsForDisplay.find(section => section.id === 'social-section'),
    [sectionsForDisplay]
  )

  const getSectionGridClass = (count: number) => {
    if (count <= 0) return 'grid-cols-1 place-items-center'
    if (count === 1) return 'grid-cols-1 place-items-center max-w-xs mx-auto'
    if (count === 2) return 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto place-items-center'
    if (count === 3) return 'grid-cols-1 sm:grid-cols-3'
    if (count === 4) return 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'
    if (count <= 6) return 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
    if (count <= 8) return 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'
    return 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'
  }

  const sectionGridClass = getSectionGridClass(navigationSections.length)

  const brandInfo = hasExplicitFooterLayout
    ? (providedFooterLayout?.brand || { name: '', description: '', logo: '' })
    : (resolvedFooterLayout.brand || getDefaultFooterLayout().brand)
  const brandNameToShow = hasExplicitFooterLayout ? (brandInfo.name || '') : (brandInfo.name || siteName)

  const hasContactInfo = !!(contactInfo?.email || contactInfo?.phone || contactInfo?.address)
  const hasFooterLayoutContent = !!(
    (brandInfo?.name && brandInfo.name.trim()) ||
    (brandInfo?.description && brandInfo.description.trim()) ||
    (brandInfo?.logo && brandInfo.logo.trim()) ||
    footerSections.length
  )

  if (!hasFooterLayoutContent && !hasContactInfo) {
    return null
  }

  const footerStyleObject = {
    color: footerStyles.textColor
  }

  const handleHover = (
    link: FooterSocialLink,
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    show: boolean
  ) => {
    if (!isClient) return
    if (!show || !link.show_hover_image || !link.hover_image) {
      setHoverPreview(prev => ({ ...prev, visible: false }))
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    setHoverPreview({
      src: link.hover_image || '',
      label: link.label,
      x: rect.left + rect.width / 2,
      y: rect.top - 12,
      visible: true
    })
  }

  const renderSocialIcon = (link: FooterSocialLink, iconColor?: string) => {
    if (!link.icon) {
      return (
        <span className="text-sm font-semibold uppercase" style={iconColor ? { color: iconColor } : undefined}>
          {link.label.slice(0, 2)}
        </span>
      )
    }

    const trimmedIcon = link.icon.trim()
    if (trimmedIcon.startsWith('<svg')) {
      return (
        <span
          className="w-6 h-6 flex items-center justify-center"
          style={iconColor ? { color: iconColor } : undefined}
          dangerouslySetInnerHTML={{ __html: prepareSvgMarkup(trimmedIcon, iconColor) }}
        />
      )
    }

    if (isSvgUrl(trimmedIcon) && iconColor) {
      const maskStyle: React.CSSProperties = {
        WebkitMaskImage: `url(${trimmedIcon})`,
        maskImage: `url(${trimmedIcon})`,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        backgroundColor: iconColor
      }
      return <span className="w-6 h-6 inline-block" style={maskStyle} aria-label={link.label} />
    }

    return <img src={link.icon} alt={link.label} className="w-6 h-6 object-contain" loading="lazy" />
  }

  return (
    <>
      <footer className={`relative z-10 ${className}`} style={footerStyleObject}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          <div className="grid gap-8 lg:grid-cols-12 items-start">
            <div className="space-y-5 lg:col-span-3">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: footerStyles.titleColor }}>
                  {brandNameToShow}
                </p>
                {brandInfo.description && (
                  <p className="text-xs leading-relaxed" style={{ color: footerStyles.descriptionColor }}>
                    {brandInfo.description}
                  </p>
                )}
              </div>

              <div className="space-y-2 text-xs">
                {contactInfo.email && (
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="flex items-center space-x-2 text-xs transition-colors duration-300 max-w-[17rem]"
                    style={{ color: footerStyles.textColor }}
                  >
                    <Mail className="w-4 h-4" />
                    <span>{contactInfo.email}</span>
                  </a>
                )}
                {contactInfo.phone && (
                  <a
                    href={`tel:${contactInfo.phone}`}
                    className="flex items-center space-x-2 text-xs transition-colors duration-300 max-w-[17rem]"
                    style={{ color: footerStyles.textColor }}
                  >
                    <Phone className="w-4 h-4" />
                    <span>{contactInfo.phone}</span>
                  </a>
                )}
                {contactInfo.address && (
                  <div
                    className="flex items-start space-x-2 leading-relaxed max-w-[17rem] text-xs"
                    style={{ color: footerStyles.textColor }}
                  >
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{contactInfo.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={`grid gap-5 ${sectionGridClass} lg:col-span-6`}>
              {navigationSections.map(section => (
                <div key={section.id} className="space-y-2">
                  <div>
                    <h4
                      className="font-semibold text-sm uppercase tracking-wide"
                      style={{ color: footerStyles.titleColor }}
                    >
                      {section.title}
                    </h4>
                    {section.description && (
                      <p className="text-xs mt-1" style={{ color: footerStyles.descriptionColor }}>
                        {section.description}
                      </p>
                    )}
                  </div>
                  <ul className="space-y-1.5">
                    {(section.links || []).map(link => (
                      <li key={link.id || `${section.id}-${link.label}`}>
                        <Link
                          href={link.url}
                          className="flex items-center text-xs transition-colors duration-300 footer-nav-link"
                          style={{ color: footerStyles.linkColor }}
                          target={link.target || '_self'}
                          rel={link.target === '_blank' ? 'noopener noreferrer' : undefined}
                        >
                          <span>{link.label}</span>
                          {link.target === '_blank' && <ExternalLink className="w-3 h-3 ml-1" />}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="space-y-4 lg:col-span-3">
              {socialSection && socialLinksToRender.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm uppercase tracking-wide" style={{ color: footerStyles.titleColor }}>
                    关注我们
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {socialLinksToRender.map(link => {
                      const iconColor = normalizeHexColor(link.color)
                      return (
                        <div key={link.id} className="relative group">
                          <a
                            href={link.url}
                            target={link.target || '_blank'}
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300"
                            style={{
                              backgroundColor: footerStyles.iconBackgroundColor,
                              color: iconColor || footerStyles.textColor
                            }}
                            onMouseEnter={(e) => handleHover(link, e, true)}
                            onMouseLeave={(e) => handleHover(link, e, false)}
                          >
                            {renderSocialIcon(link, iconColor)}
                          </a>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>
      {isClient && hoverPreview.visible && hoverPreview.src &&
        createPortal(
          <div
            className="fixed z-[9999] pointer-events-none"
            style={{
              left: hoverPreview.x,
              top: hoverPreview.y,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="rounded-lg overflow-hidden shadow-2xl border border-black/10 bg-white/95 backdrop-blur-sm">
              <img
                src={hoverPreview.src}
                alt={`${hoverPreview.label} 预览图`}
                className="object-contain"
                style={{ width: 300, maxHeight: 320 }}
              />
            </div>
          </div>,
          document.body
        )
      }
    </>
  )
}
