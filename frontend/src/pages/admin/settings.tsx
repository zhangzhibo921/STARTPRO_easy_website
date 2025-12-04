import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import {
  Save,
  Globe,
  Mail,
  Phone,
  MapPin,
  Settings as SettingsIcon,
  AlertTriangle,
  Image as ImageIcon,
  Building,
  Menu,
  Link as LinkIcon,
  Plus,
  Trash2
} from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'
import ThemeAwareFooter from '@/components/ThemeAwareFooter'
import AssetPickerModal, { SelectedAsset } from '@/components/AssetPickerModal'
import { ThemeAwareInput, ThemeAwareSelect, ThemeAwareTextarea } from '@/components/ThemeAwareFormControls'
import BackgroundRenderer from '@/components/theme-backgrounds/BackgroundRenderer'
import FontSelector from '@/components/admin/settings/FontSelector'
import toast from 'react-hot-toast'
import { settingsApi } from '@/utils/api'
import { useSettings } from '@/contexts/SettingsContext'
import type { Settings, FooterSection, FooterLayout, FooterSocialLink } from '@/types'
import { getThemeById, resolveBackgroundEffect, type ThemeBackgroundChoice } from '@/styles/themes'

const EMPTY_FOOTER_LAYOUT: FooterLayout = {
  brand: { name: '', description: '', logo: '' },
  sections: []
}

const backgroundOptions = [
  { value: 'theme-default', label: '系统默认背景' },
  { value: 'starfield', label: '星空粒子特效' },
  { value: 'gradient', label: '动态渐变' },
  { value: 'pattern', label: '几何纹理' }
]

const sanitizeColorValue = (value?: string | null) => (typeof value === 'string' ? value.trim() : '')

const normalizeFooterLayoutPayload = (layout?: FooterLayout | null): FooterLayout => {
  const sourceLayout = layout ?? EMPTY_FOOTER_LAYOUT
  const brand = sourceLayout.brand || EMPTY_FOOTER_LAYOUT.brand
  const timestamp = Date.now()

  const normalizedBrand = {
    name: (brand.name || '').trim(),
    description: brand.description || '',
    logo: brand.logo || ''
  }

  const sectionsSource = Array.isArray(sourceLayout.sections) ? sourceLayout.sections : []
  const sections = sectionsSource
    .map((section, index) => {
      const linksSource = Array.isArray(section?.links) ? section.links : []
      const links = linksSource
        .filter(link => link && ((link.label && link.label.trim()) || (link.url && link.url.trim())))
        .map((link, linkIndex) => ({
          id: link.id || `link_${index}_${linkIndex}_${timestamp}`,
          label: (link.label && link.label.trim()) || `链接${linkIndex + 1}`,
          url: (link.url && link.url.trim()) || '#',
          target: link.target || '_self'
        }))
      return {
        id: section.id || `section_${index}_${timestamp}`,
        title: (section.title && section.title.trim()) || `栏目${index + 1}`,
        description: section.description || '',
        links
      }
    })
    .filter(section => section.title || section.links.length)

  return { brand: normalizedBrand, sections }
}

const sanitizeFooterSocialLinksPayload = (links?: FooterSocialLink[] | null): FooterSocialLink[] => {
  const timestamp = Date.now()
  const source = Array.isArray(links) ? links : []
  return source
    .filter(link => link && ((link.label && link.label.trim()) || (link.url && link.url.trim())))
    .map((link, index) => ({
      id: link.id || `social_${index}_${timestamp}`,
      label: (link.label && link.label.trim()) || `社交链接${index + 1}`,
      url: (link.url && link.url.trim()) || '#',
      icon: link.icon || '',
      target: link.target === '_self' ? '_self' : '_blank',
      color: sanitizeColorValue(link.color),
      show_hover_image: link.show_hover_image === true,
      hover_image: link.hover_image || ''
    }))
}

const sanitizeSettingsPayload = (data: Settings): Settings => {
  const payload = { ...data } as any
  payload.footer_layout = normalizeFooterLayoutPayload(data.footer_layout)
  payload.footer_social_links = sanitizeFooterSocialLinksPayload(data.footer_social_links)
  payload.site_statement = (data.site_statement || '').trim()
  payload.icp_link = (data.icp_link || '').trim()
  payload.allow_search_index = data.allow_search_index !== false
  // 清理验证标签中的空值，并提取 content 代码片段
  const extractCode = (value: string) => {
    const trimmed = (value || '').trim()
    if (!trimmed) return ''
    const contentMatch = trimmed.match(/content=["']([^"']+)["']/i)
    if (contentMatch && contentMatch[1]) return contentMatch[1].trim()
    const noTags = trimmed.replace(/<[^>]+>/g, '').trim()
    return noTags
  }
  if (payload.verification_tags && typeof payload.verification_tags === 'object') {
    const cleaned: any = {}
    Object.entries(payload.verification_tags as Record<string, any>).forEach(([k, v]) => {
      const val = typeof v === 'string' ? extractCode(v) : ''
      if (val) cleaned[k] = val
    })
    payload.verification_tags = cleaned
  }
  delete payload.nav_layout_style
  delete payload.site_record
  delete payload.theme_overrides
  return payload as Settings
}

type AssetPickerTarget =
  | { type: 'siteLogo' }
  | { type: 'siteFavicon' }
  | { type: 'socialLinkIcon'; index: number }
  | { type: 'socialLinkHoverImage'; index: number }

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false)
  const [assetPickerTarget, setAssetPickerTarget] = useState<AssetPickerTarget | null>(null)
  const [assetPickerSource, setAssetPickerSource] = useState<'user' | 'system'>('user')
  const { refreshSettings } = useSettings()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    getValues,
    control,
    formState: { isDirty }
  } = useForm<Settings>({
    defaultValues: {
      site_name: '',
      company_name: '',
      site_description: '',
      contact_email: '',
      contact_phone: '',
      address: '',
      site_logo: '',
      site_favicon: '',
      icp_number: '',
      allow_search_index: true,
      verification_tags: {
        google: '',
        bing: '',
        baidu: ''
      },
      site_font: 'inter',
      site_font_custom_name: '',
      site_font_url: '',
      site_theme: 'neo-futuristic',
      theme_background: 'theme-default' as ThemeBackgroundChoice,
      quick_links: [],
      site_statement: '',
      icp_link: '',
      site_keywords: '',
      social_links: {},
      footer_layout: EMPTY_FOOTER_LAYOUT,
      footer_social_links: []
    },
    mode: 'onChange'
  })

  const { fields: footerSocialFields, append: appendFooterSocialLink, remove: removeFooterSocialLink } = useFieldArray({
    control,
    name: 'footer_social_links'
  })

  const watchedLogo = watch('site_logo')
  const watchedFavicon = watch('site_favicon')
  const watchedBrandName = watch('footer_layout.brand.name' as const)
  const watchedFooterLayout = watch('footer_layout') || settings?.footer_layout || EMPTY_FOOTER_LAYOUT
  const footerSections = watchedFooterLayout.sections || []
  const watchedFooterSocialLinks = watch('footer_social_links') || []
  const backgroundPreference = (watch('theme_background') || 'theme-default') as ThemeBackgroundChoice
  const selectedThemeId = watch('site_theme') || settings?.site_theme || 'neo-futuristic'
  const customFontName = watch('site_font_custom_name') || ''
  const customFontUrl = watch('site_font_url') || ''

  const previewTheme = useMemo(() => getThemeById(selectedThemeId), [selectedThemeId])
  const previewBackgroundEffect = resolveBackgroundEffect(previewTheme, backgroundPreference)
  const previewFieldBaseStyle: React.CSSProperties = {
    background: previewTheme.semantic.mutedBg,
    border: `1px solid ${previewTheme.semantic.panelBorder}`,
    borderRadius: '0.85rem',
    color: previewTheme.colors.text.primary,
    padding: '0.65rem 0.9rem',
    width: '100%',
    fontSize: '0.9rem',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.04)'
  }
  const previewSelectStyle: React.CSSProperties = {
    ...previewFieldBaseStyle,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem'
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const response = await settingsApi.get()
      if (response.success) {
        const { wechat_qrcode: _ignore, ...raw } = response.data || {}
        const { site_record: _r1, nav_layout_style: _r2, theme_overrides: _r3, ...serverSettings } =
          (raw as Partial<Settings> & Record<string, any>) || {}

        const dataWithDefaults: Settings = {
          site_name: (serverSettings as any)?.site_name || '',
          site_description: (serverSettings as any)?.site_description || '',
          company_name: (serverSettings as any)?.company_name || '',
          site_logo: (serverSettings as any)?.site_logo || '',
          site_favicon: (serverSettings as any)?.site_favicon || '',
          contact_email: (serverSettings as any)?.contact_email || '',
          contact_phone: (serverSettings as any)?.contact_phone || '',
          address: (serverSettings as any)?.address || '',
          icp_number: (serverSettings as any)?.icp_number || '',
          allow_search_index: (serverSettings as any)?.allow_search_index !== false,
          verification_tags: (serverSettings as any)?.verification_tags || {},
          social_links: (serverSettings as any)?.social_links || {},
          site_font: (serverSettings as any)?.site_font || 'inter',
          site_font_custom_name: (serverSettings as any)?.site_font_custom_name || '',
          site_font_url: (serverSettings as any)?.site_font_url || '',
          site_theme: (serverSettings as any)?.site_theme || 'neo-futuristic',
          quick_links: [],
          site_statement: '',
          icp_link: '',
          site_keywords: (serverSettings as any)?.site_keywords || '',
          ...serverSettings,
          footer_layout: serverSettings.footer_layout ?? EMPTY_FOOTER_LAYOUT,
          footer_social_links: serverSettings.footer_social_links ?? [],
          theme_background: (serverSettings.theme_background as ThemeBackgroundChoice) || 'theme-default'
        }

        if (!dataWithDefaults.footer_layout) dataWithDefaults.footer_layout = EMPTY_FOOTER_LAYOUT
        if (!dataWithDefaults.footer_social_links) dataWithDefaults.footer_social_links = []

        setSettings(dataWithDefaults)
        reset(dataWithDefaults)
      } else {
        toast.error(response.message || '获取设置失败')
      }
    } catch (error) {
      console.error('获取系统设置失败:', error)
      toast.error('获取设置失败')
    } finally {
      setIsLoading(false)
    }
  }

  const determineAssetSource = (url?: string | null) => (url && url.includes('/system-default/')) ? 'system' : 'user'

  const openAssetPicker = (target: AssetPickerTarget, currentValue?: string | null) => {
    setAssetPickerSource(determineAssetSource(currentValue || ''))
    setAssetPickerTarget(target)
    setIsAssetPickerOpen(true)
  }

  const closeAssetPicker = () => {
    setIsAssetPickerOpen(false)
    setAssetPickerTarget(null)
  }

  const handleAssetSelect = (asset: SelectedAsset) => {
    if (!assetPickerTarget) return
    switch (assetPickerTarget.type) {
      case 'siteLogo':
        setValue('site_logo', asset.url, { shouldDirty: true })
        break
      case 'siteFavicon':
        setValue('site_favicon', asset.url, { shouldDirty: true })
        break
      case 'socialLinkIcon': {
        const path = `footer_social_links.${assetPickerTarget.index}.icon`
        setValue(path as any, asset.url, { shouldDirty: true })
        break
      }
      case 'socialLinkHoverImage': {
        const path = `footer_social_links.${assetPickerTarget.index}.hover_image`
        setValue(path as any, asset.url, { shouldDirty: true })
        setValue(`footer_social_links.${assetPickerTarget.index}.show_hover_image` as const, true, { shouldDirty: true })
        break
      }
      default:
        break
    }
    closeAssetPicker()
  }

  const updateFooterSections = (updater: (sections: FooterSection[]) => FooterSection[]) => {
    const currentSections = getValues('footer_layout.sections') || []
    const nextSections = updater(currentSections)
    setValue('footer_layout.sections', nextSections, { shouldDirty: true })
  }

  const addFooterSection = () => {
    const timestamp = Date.now()
    updateFooterSections(sections => [
      ...sections,
      {
        id: `section_${timestamp}`,
        title: '新增栏目',
        description: '',
        links: []
      }
    ])
  }

  const removeFooterSection = (index: number) => {
    updateFooterSections(sections => sections.filter((_, idx) => idx !== index))
  }

  const addFooterLink = (sectionIndex: number) => {
    const timestamp = Date.now()
    updateFooterSections(sections =>
      sections.map((section, idx) => {
        if (idx !== sectionIndex) return section
        const links = section.links || []
        return {
          ...section,
          links: [
            ...links,
            {
              id: `link_${sectionIndex}_${links.length}_${timestamp}`,
              label: '新链接',
              url: '/',
              target: '_self'
            }
          ]
        }
      })
    )
  }

  const removeFooterLink = (sectionIndex: number, linkIndex: number) => {
    updateFooterSections(sections =>
      sections.map((section, idx) => {
        if (idx !== sectionIndex) return section
        const links = section.links || []
        return {
          ...section,
          links: links.filter((_, lIdx) => lIdx !== linkIndex)
        }
      })
    )
  }

  const handleSocialColorChange = (index: number, value: string) => {
    setValue(`footer_social_links.${index}.color` as const, value, { shouldDirty: true })
  }

  const isValidHexColor = (value: string) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test((value || '').trim())

  const onSubmit = async (data: Settings) => {
    setIsSaving(true)
    try {
      const payload = sanitizeSettingsPayload(data)
      // 若验证标签为空对象则移除，避免后端写入空对象
      if (payload.verification_tags && Object.keys(payload.verification_tags as any).length === 0) {
        delete (payload as any).verification_tags
      }
      const response = await settingsApi.update(payload)
      if (response.success) {
        toast.success('设置保存成功')
        setSettings(payload)
        reset(payload)
        await refreshSettings()
      } else {
        toast.error(response.message || '保存失败')
      }
    } catch (error) {
      console.error('保存设置失败:', error)
      toast.error('保存失败，请稍后重试')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout title="系统设置">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tech-accent" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="系统设置" description="管理站点主题、品牌、页脚与社交信息">
      <div className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* 站点信息与全局 SEO */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="bg-semantic-panel p-6 rounded-xl shadow-xl border border-semantic-panelBorder space-y-6">
            <div className="flex items-center space-x-3">
              <Globe className="w-6 h-6 text-theme-accent" />
              <div>
                <h2 className="text-xl font-bold text-theme-text">站点信息与全局 SEO</h2>
                <p className="text-sm text-theme-textSecondary">设置站点名称、描述、关键词及基础图标，影响页面默认 meta 信息。</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-theme-text mb-1">站点名称</label>
                <ThemeAwareInput type="text" {...register('site_name' as const)} placeholder="请输入站点名称" />
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-text mb-1">公司名称</label>
                <ThemeAwareInput type="text" {...register('company_name' as const)} placeholder="用于页眉/页脚展示的公司名称" />
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-text mb-1">SEO 关键词</label>
                <ThemeAwareInput type="text" {...register('site_keywords' as const)} placeholder="关键词之间用逗号分隔，例如：产品,服务,公司" />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-theme-text mb-1">SEO 描述</label>
                <ThemeAwareTextarea rows={1} {...register('site_description' as const)} placeholder="用于搜索引擎与社交分享的页面描述" />
              </div>
              <div className="md:col-span-3">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-theme-text">
                  <input
                    type="checkbox"
                    {...register('allow_search_index' as const)}
                    className="h-4 w-4 text-tech-accent border-theme-divider rounded"
                    defaultChecked
                  />
                  <span>允许搜索引擎收录</span>
                </label>
                <p className="text-xs text-theme-textSecondary mt-1">关闭后会输出 robots noindex，阻止搜索引擎收录。</p>
              </div>
              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-1">Google 验证（google-site-verification）</label>
                  <ThemeAwareInput type="text" {...register('verification_tags.google' as const)} placeholder="填写 Google 验证代码" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-1">Bing 验证（msvalidate.01）</label>
                  <ThemeAwareInput type="text" {...register('verification_tags.bing' as const)} placeholder="填写 Bing 验证代码" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-1">百度验证（baidu-site-verification）</label>
                  <ThemeAwareInput type="text" {...register('verification_tags.baidu' as const)} placeholder="填写百度验证代码" />
                </div>
                <div className="md:col-span-3">
                  <p className="text-xs text-theme-textSecondary">
                    留空则不输出对应验证标签；仅填写“验证代码”即可，系统会自动生成 meta 标签。
                    如果粘贴了整段 &lt;meta ... content="xxxx" /&gt;，会自动提取 content 中的值。
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-text mb-1">Logo</label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-2">
                    <ThemeAwareInput
                      type="text"
                      readOnly
                      value={watchedLogo || ''}
                      placeholder="请选择或上传品牌 Logo"
                      className="flex-1 cursor-not-allowed bg-theme-surfaceAlt text-theme-textSecondary"
                    />
                    <button
                      type="button"
                      onClick={() => openAssetPicker({ type: 'siteLogo' }, watchedLogo)}
                      className="inline-flex items-center px-3 py-2 rounded-lg border border-theme-divider bg-theme-surfaceAlt text-theme-textSecondary hover:text-theme-text transition-colors text-sm"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      选择素材
                    </button>
                  </div>
                  <div className="flex items-center justify-center w-14 h-14 rounded-lg border border-theme-divider bg-theme-surfaceAlt overflow-hidden">
                    {watchedLogo ? (
                      <img src={watchedLogo} alt="Logo 预览" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-theme-textSecondary" />
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-text mb-1">Favicon</label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-2">
                    <ThemeAwareInput
                      type="text"
                      readOnly
                      value={watchedFavicon || ''}
                      placeholder="/favicon.ico"
                      className="flex-1 cursor-not-allowed bg-theme-surfaceAlt text-theme-textSecondary"
                    />
                    <button
                      type="button"
                      onClick={() => openAssetPicker({ type: 'siteFavicon' }, watchedFavicon)}
                      className="inline-flex items-center px-3 py-2 rounded-lg border border-theme-divider bg-theme-surfaceAlt text-theme-textSecondary hover:text-theme-text transition-colors text-sm"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      选择素材
                    </button>
                  </div>
                  <div className="flex items-center justify-center w-14 h-14 rounded-lg border border-theme-divider bg-theme-surfaceAlt overflow-hidden">
                    {watchedFavicon ? (
                      <img src={watchedFavicon} alt="Favicon 预览" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-theme-textSecondary" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          {/* 网站声明与备案 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-semantic-panel p-6 rounded-xl shadow-xl border border-semantic-panelBorder">
            <div className="flex items-center space-x-3 mb-6">
              <LinkIcon className="w-6 h-6 text-theme-accent" />
              <div>
                <h2 className="text-xl font-bold text-theme-text">网站声明与备案</h2>
                <p className="text-sm text-theme-textSecondary">配置页脚展示的公司简介、站点声明与备案链接</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-theme-text mb-1">网站声明 / 公司简介</label>
                <ThemeAwareTextarea rows={1} {...register('site_statement' as const)} placeholder="用于页脚展示的公司简介或站点声明" />
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-text mb-1">ICP备案号</label>
                <ThemeAwareInput type="text" {...register('icp_number' as const)} placeholder="例如 粤ICP备xxxxxxx号" />
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-text mb-1">ICP备案链接</label>
                <ThemeAwareInput type="url" {...register('icp_link' as const)} placeholder="请输入工信部备案查询链接" />
              </div>
            </div>
          </motion.div>

          {/* 主题与预览 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-semantic-panel p-6 rounded-xl shadow-xl border border-semantic-panelBorder">
            <div className="flex items-center space-x-3 mb-6">
              <SettingsIcon className="w-6 h-6 text-semantic-hero-accent" />
              <div>
                <h2 className="text-xl font-bold text-theme-text">主题与视觉</h2>
                <p className="text-sm text-theme-textSecondary">切换站点主题与背景特效，并查看实时预览</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <div>
                <label className="block text-sm font-medium text-theme-text mb-1">主题颜色选择</label>
                <ThemeAwareSelect {...register('site_theme')}>
                  <option value="serene-white">素雅白色</option>
                  <option value="starry-night">深邃星空</option>
                  <option value="elegant-dark">优雅暗色</option>
                  <option value="minimal-pro">极简专业</option>
                  <option value="neo-futuristic">未来主义</option>
                  <option value="corporate-blue">商务蓝</option>
                  <option value="emerald-forest">翠绿森林</option>
                  <option value="royal-amber">琥珀金</option>
                  <option value="mystic-purple">秘境紫</option>
                  <option value="classic-blue">经典蓝</option>
                </ThemeAwareSelect>
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-text mb-1">背景特效</label>
                <ThemeAwareSelect {...register('theme_background' as const)}>
                  {backgroundOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </ThemeAwareSelect>
              </div>
            </div>
            <div className="mt-4">
              <Controller
                control={control}
                name="site_font"
                render={({ field }) => (
                  <FontSelector
                    value={field.value}
                    customName={customFontName}
                    customUrl={customFontUrl}
                    onChange={field.onChange}
                    onCustomChange={({ name, url }) => {
                      setValue('site_font', 'custom', { shouldDirty: true })
                      setValue('site_font_custom_name', name, { shouldDirty: true })
                      setValue('site_font_url', url, { shouldDirty: true })
                    }}
                  />
                )}
              />
            </div>
            <div className="relative rounded-xl overflow-hidden border border-semantic-panelBorder bg-black/5">
              <BackgroundRenderer effect={previewBackgroundEffect} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/30 text-white px-6 py-3 rounded-lg backdrop-blur-sm">
                  主题预览区
                </div>
              </div>
            </div>
          </motion.div>

          {/* 品牌与页脚栏目 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-semantic-panel p-6 rounded-xl shadow-xl border border-semantic-panelBorder space-y-6">
            <div className="flex items-center space-x-3">
              <Building className="w-6 h-6 text-theme-accent" />
              <div>
                <h2 className="text-xl font-bold text-theme-text">品牌与页脚栏目</h2>
                <p className="text-sm text-theme-textSecondary">可配置品牌名称、栏目与社交媒体信息，实时查看展示效果</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-theme-text mb-1">品牌名称</label>
                <ThemeAwareInput type="text" {...register('footer_layout.brand.name' as const)} className="px-3" />
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-text mb-1">品牌描述</label>
                <ThemeAwareInput type="text" {...register('footer_layout.brand.description' as const)} className="px-3" placeholder="一句话描述品牌定位" />
              </div>
            </div>

            {/* 栏目管理 */}
            <div className="pt-4 border-t border-semantic-dividerStrong">
              <h3 className="text-sm font-semibold text-theme-text mb-3">页脚栏目</h3>
              <div className="space-y-4">
                {footerSections.map((section, sectionIndex) => (
                  <div key={section.id || sectionIndex} className="border border-semantic-panelBorder rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-theme-text mb-1">栏目标题</label>
                          <ThemeAwareInput type="text" {...register(`footer_layout.sections.${sectionIndex}.title` as const)} className="px-3" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-theme-text mb-1">栏目描述</label>
                          <ThemeAwareInput type="text" {...register(`footer_layout.sections.${sectionIndex}.description` as const)} className="px-3" placeholder="用于说明该栏目展示内容" />
                        </div>
                      </div>
                      <button type="button" onClick={() => removeFooterSection(sectionIndex)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-4">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(section.links || []).map((link, linkIndex) => {
                        const labelField = `footer_layout.sections.${sectionIndex}.links.${linkIndex}.label` as const
                        const urlField = `footer_layout.sections.${sectionIndex}.links.${linkIndex}.url` as const
                        const targetField = `footer_layout.sections.${sectionIndex}.links.${linkIndex}.target` as const
                        return (
                          <div key={link.id || linkIndex} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-theme-text mb-1">链接名称</label>
                              <ThemeAwareInput type="text" {...register(labelField)} className="px-3" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-theme-text mb-1">链接地址</label>
                              <ThemeAwareInput type="text" {...register(urlField)} className="px-3" placeholder="https://example.com/about" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-theme-text mb-1">打开方式</label>
                              <ThemeAwareSelect {...register(targetField)} className="px-3">
                                <option value="_self">当前窗口</option>
                                <option value="_blank">新窗口</option>
                              </ThemeAwareSelect>
                            </div>
                            <div className="flex items-end justify-between md:justify-end">
                              <button type="button" onClick={() => removeFooterLink(sectionIndex, linkIndex)} className="inline-flex items-center px-3 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4 mr-2" />
                                删除
                              </button>
                            </div>
                          </div>
                        )
                      })}
                      <button type="button" onClick={() => addFooterLink(sectionIndex)} className="inline-flex items-center px-3 py-2 text-sm rounded-lg border border-theme-divider bg-theme-surfaceAlt text-theme-textSecondary hover:text-theme-text transition-colors">
                        <Plus className="w-4 h-4 mr-2" />
                        新增链接
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addFooterSection} className="inline-flex items-center px-4 py-2 bg-tech-accent text-white rounded-lg hover:bg-tech-accent/90 transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  新增栏目
                </button>
              </div>
            </div>

            {/* 社交媒体链接 */}
            <div className="pt-4 border-t border-semantic-dividerStrong">
              <h3 className="text-sm font-semibold text-theme-text mb-3">社交媒体链接</h3>
              <div className="space-y-4">
                {footerSocialFields.map((field, index) => {
                  const currentColor = (watchedFooterSocialLinks[index]?.color as string) || ''
                  const colorPreview = isValidHexColor(currentColor) ? currentColor : '#1385f0ff'
                  return (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-8 gap-3 border border-theme-divider rounded-lg p-3 bg-theme-surfaceAlt/60">
                      <div>
                        <label className="block text-sm font-medium text-theme-text mb-1">唯一 ID</label>
                        <ThemeAwareInput type="text" {...register(`footer_social_links.${index}.id` as const)} className="px-3" placeholder="wechat / github / linkedin" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-theme-text mb-1">显示名称</label>
                        <ThemeAwareInput type="text" {...register(`footer_social_links.${index}.label` as const)} className="px-3" placeholder="微信 / GitHub / LinkedIn" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-theme-text mb-1">跳转链接</label>
                        <ThemeAwareInput type="text" {...register(`footer_social_links.${index}.url` as const)} className="px-3" placeholder="https://..." />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-sm font-medium text-theme-text">社交图标</label>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <ThemeAwareInput
                            type="text"
                            {...register(`footer_social_links.${index}.icon` as const)}
                            readOnly
                            className="flex-1 cursor-not-allowed bg-theme-surfaceAlt text-theme-textSecondary"
                            placeholder="请选择或上传 SVG 图标"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              openAssetPicker({ type: 'socialLinkIcon', index }, getValues(`footer_social_links.${index}.icon` as const))
                            }
                            className="inline-flex items-center px-3 py-2 rounded-lg border border-theme-divider bg-theme-surfaceAlt text-theme-textSecondary hover:text-theme-text transition-colors text-sm"
                          >
                            <ImageIcon className="w-4 h-4 mr-2" />
                            选择素材
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-sm font-medium text-theme-text mb-1">自定义图标颜色</label>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <input
                            type="color"
                            value={colorPreview}
                            onChange={event => handleSocialColorChange(index, event.target.value)}
                            className="h-10 w-16 rounded border border-theme-divider bg-transparent cursor-pointer"
                          />
                          <ThemeAwareInput type="text" placeholder="示例：#0EA5E9" {...register(`footer_social_links.${index}.color` as const)} className="flex-1" />
                          <button type="button" onClick={() => handleSocialColorChange(index, '')} className="px-3 py-2 text-xs rounded-lg border border-theme-divider text-theme-textSecondary hover:text-theme-text transition-colors">
                            清除颜色
                          </button>
                        </div>
                        <p className="text-xs text-theme-textSecondary">
                          支持十六进制颜色值。如为 SVG 图标，渲染时会应用该颜色。
                        </p>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-sm font-medium text-theme-text mb-1">悬停弹出图片</label>
                        <div className="space-y-2">
                          <label className="inline-flex items-center gap-2 text-sm text-theme-text">
                            <input
                              type="checkbox"
                              {...register(`footer_social_links.${index}.show_hover_image` as const)}
                              className="h-4 w-4 text-tech-accent border-theme-divider rounded"
                            />
                            <span>启用悬浮图片提示</span>
                          </label>
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <ThemeAwareInput
                              type="text"
                              readOnly
                              {...register(`footer_social_links.${index}.hover_image` as const)}
                              className="flex-1 cursor-not-allowed bg-theme-surfaceAlt text-theme-textSecondary"
                              placeholder="选择悬浮时展示的小图（如二维码、Logo）"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                openAssetPicker({ type: 'socialLinkHoverImage', index }, getValues(`footer_social_links.${index}.hover_image` as const))
                              }
                              className="inline-flex items-center px-3 py-2 rounded-lg border border-theme-divider bg-theme-surfaceAlt text-theme-textSecondary hover:text-theme-text transition-colors text-sm"
                            >
                              <ImageIcon className="w-4 h-4 mr-2" />
                              选择素材
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setValue(`footer_social_links.${index}.hover_image` as const, '', { shouldDirty: true })
                                setValue(`footer_social_links.${index}.show_hover_image` as const, false, { shouldDirty: true })
                              }}
                              className="px-3 py-2 text-xs rounded-lg border border-theme-divider text-theme-textSecondary hover:text-theme-text transition-colors"
                            >
                              清除
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-theme-textSecondary">勾选并设置图片后，鼠标悬停该社交图标时会弹出预览图。</p>
                      </div>

                      <div className="flex items-end space-x-2">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-theme-text mb-1">打开方式</label>
                          <ThemeAwareSelect {...register(`footer_social_links.${index}.target` as const)} className="px-3">
                            <option value="_blank">新窗口</option>
                            <option value="_self">当前窗口</option>
                          </ThemeAwareSelect>
                        </div>
                        <button type="button" onClick={() => removeFooterSocialLink(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )
                })}

                <button
                  type="button"
                  onClick={() =>
                    appendFooterSocialLink({
                      id: `social_${Date.now()}`,
                      label: '新社交链接',
                      url: '',
                      target: '_blank',
                      icon: '',
                      color: '',
                      show_hover_image: false,
                      hover_image: ''
                    })
                  }
                  className="inline-flex items-center px-4 py-2 bg-tech-accent text-white rounded-lg hover:bg-tech-accent/90 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  新增社交链接
                </button>
              </div>
            </div>
          </motion.div>

          {/* 页脚预览 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-theme-surface p-6 rounded-xl shadow-xl border border-theme-divider">
            <div className="flex items-center space-x-3 mb-4">
              <SettingsIcon className="w-6 h-6 text-theme-accent" />
              <div>
                <h2 className="text-xl font-bold text-theme-text">页脚实时预览</h2>
                <p className="text-sm text-theme-textSecondary">实时渲染页脚品牌、栏目与社交信息</p>
              </div>
            </div>
            <div className="rounded-2xl border border-semantic-panelBorder overflow-hidden">
              <ThemeAwareFooter
                siteName={watchedBrandName || watch('company_name') || '未命名品牌'}
                icpNumber={watch('icp_number')}
                contactInfo={{
                  email: watch('contact_email'),
                  phone: watch('contact_phone'),
                  address: watch('address')
                }}
                footerLayout={watchedFooterLayout}
                footerSocialLinks={watchedFooterSocialLinks}
              />
            </div>
          </motion.div>

          {/* 操作区 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className="flex justify-end space-x-4">
            <button type="button" onClick={() => reset(settings || {})} className="px-6 py-2 border border-theme-divider text-theme-textSecondary rounded-lg hover:text-theme-text hover:bg-theme-surfaceAlt transition-colors" disabled={!isDirty || isSaving}>
              重置
            </button>
            <button type="submit" disabled={isSaving} className="inline-flex items-center px-6 py-2 bg-tech-accent text-white rounded-lg hover:bg-tech-accent/90 transition-colors disabled:opacity-50">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? '保存中...' : '保存设置'}
            </button>
          </motion.div>

          {/* 提示 */}
          {isDirty && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                <p className="text-sm text-yellow-700">有未保存的更改，请及时保存。</p>
              </div>
            </motion.div>
          )}
        </form>

        <AssetPickerModal isOpen={isAssetPickerOpen} onClose={closeAssetPicker} onSelect={handleAssetSelect} initialSource={assetPickerSource} />
      </div>
    </AdminLayout>
  )
}
