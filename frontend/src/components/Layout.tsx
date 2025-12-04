import React, { ReactNode, useMemo } from 'react'
import Head from 'next/head'
import ThemeAwareHeader from './ThemeAwareHeader'
import ThemeAwareFooter from './ThemeAwareFooter'
import { motion } from 'framer-motion'
import { useSettings } from '@/contexts/SettingsContext'

import BackgroundRenderer from '@/components/theme-backgrounds/BackgroundRenderer'
import { defaultTheme, getThemeById, resolveBackgroundEffect, type ThemeBackgroundChoice } from '@/styles/themes'

import type { Settings } from '@/types';

interface LayoutProps {
  children: ReactNode
  title?: string
  description?: string
  keywords?: string
  noindex?: boolean
  className?: string
  headerProps?: any
  footerProps?: any
  settings?: Settings
  disableDefaultMeta?: boolean
}

export type LayoutPropsType = LayoutProps;

export default function Layout({
  children,
  title,
  description,
  keywords,
  noindex = false,
  className = '',
  headerProps = {},
  footerProps = {},
  disableDefaultMeta = false,
  settings: settingsProp
}: LayoutProps) {
  const { settings: contextSettings } = useSettings()
  const settings = settingsProp || contextSettings

  const themeId = settings?.site_theme || defaultTheme.id
  const activeTheme = useMemo(() => getThemeById(themeId), [themeId])
  const backgroundPreference = (settings?.theme_background || 'theme-default') as ThemeBackgroundChoice
  const resolvedBackground = useMemo(
    () => resolveBackgroundEffect(activeTheme, backgroundPreference),
    [activeTheme, backgroundPreference]
  )
  const isStarfield = resolvedBackground?.type === 'starfield'

  const siteName = settings?.site_name || '信息技术有限公司出品'
  const siteDescription = description || settings?.site_description || ''
  const resolvedKeywords =
    keywords ??
    (settings?.site_keywords ??
      settings?.site_description ??
      '信息技术服务,官网,公司')
  const companyName = settings?.company_name || '信息技术有限公司出品'
  const favicon = settings?.site_favicon || ''
  const logo = settings?.site_logo || '/logo.png'
  const allowSearchIndex = settings?.allow_search_index !== false
  const shouldNoIndex = noindex || !allowSearchIndex
  const verificationTags = settings?.verification_tags || {}

  const pageTitle = title ? `${title} - ${siteName}` : siteName

  const finalHeaderProps = {
    logo,
    siteName: companyName,
    ...headerProps
  }

  const finalFooterProps = {
    siteName: companyName,
    icpNumber: settings?.icp_number,
    contactInfo: {
      email: settings?.contact_email,
      phone: settings?.contact_phone,
      address: settings?.address
    },
    socialLinks: settings?.social_links,
    quickLinks: settings?.quick_links,
    footerLayout: settings?.footer_layout,
    footerSocialLinks: settings?.footer_social_links,
    ...footerProps
  }

  return (
    <>
      <Head>
        {!disableDefaultMeta && (
          <>
            <title key="meta:title">{pageTitle}</title>
            <meta key="meta:description" name="description" content={siteDescription} />
            <meta key="meta:keywords" name="keywords" content={resolvedKeywords} />
            {shouldNoIndex && <meta key="meta:robots" name="robots" content="noindex,nofollow" />}

            {favicon && (
              <>
                <link rel="icon" href={favicon} id="favicon" />
                <link rel="shortcut icon" href={favicon} />
                <link rel="apple-touch-icon" href={favicon} id="apple-touch-icon" />
              </>
            )}

            <meta key="og:title" property="og:title" content={pageTitle} />
            <meta key="og:description" property="og:description" content={siteDescription} />
            <meta key="og:type" property="og:type" content="website" />
            <meta key="og:site_name" property="og:site_name" content={siteName} />

            <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
            <meta key="twitter:title" name="twitter:title" content={pageTitle} />
            <meta key="twitter:description" name="twitter:description" content={siteDescription} />

            {verificationTags.google && (
              <meta key="google-site-verification" name="google-site-verification" content={verificationTags.google as string} />
            )}
            {verificationTags.bing && (
              <meta key="msvalidate.01" name="msvalidate.01" content={verificationTags.bing as string} />
            )}
            {verificationTags.baidu && (
              <meta key="baidu-site-verification" name="baidu-site-verification" content={verificationTags.baidu as string} />
            )}
          </>
        )}

        {settings?.analytics_code && (
          <script dangerouslySetInnerHTML={{ __html: settings.analytics_code }} />
        )}
      </Head>

      <div
        className={`layout-container relative min-h-screen overflow-hidden text-theme-text ${!isStarfield ? 'bg-semantic-mutedBg' : ''} ${className}`}
      >
        <BackgroundRenderer effect={resolvedBackground} />

        <div className="relative z-10 min-h-screen">
          <ThemeAwareHeader {...finalHeaderProps} />

          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="pt-20 main-content content-container"
            style={{ background: 'transparent' }}
          >
            {children}
          </motion.main>

          <ThemeAwareFooter {...finalFooterProps} />
          {(() => {
            const stmt = (settings as any)?.site_statement ? String((settings as any).site_statement).trim() : ''
            const icp = settings?.icp_number ? String(settings.icp_number).trim() : ''
            const icpLink = (settings as any)?.icp_link ? String((settings as any).icp_link).trim() : ''
            const hasLegal = stmt || icp
            if (!hasLegal) return null
            return (
              <div className="text-center text-xs text-gray-400 py-0">
                <div className="flex flex-col sm:flex-row justify-center items-center sm:space-x-4 space-y-1 sm:space-y-0">
                  {stmt && <span>{stmt}</span>}
                  {icp && (
                    icpLink
                      ? <a href={icpLink} target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">{icp}</a>
                      : <span>{icp}</span>
                  )}
                </div>
              </div>
            )
          })()}
        </div>

        <BackToTop />
      </div>
    </>
  )
}

function BackToTop() {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  if (!isVisible) {
    return null
  }

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      onClick={scrollToTop}
      className="back-to-top-button"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      title="返回顶部"
    >
      <svg
        className="w-5 h-5 transition-transform duration-300 hover:-translate-y-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </motion.button>
  )
}
