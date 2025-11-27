import React from 'react'
import { TemplateComponent } from '@/types/templates'
import { AssetPickerTarget } from '../hooks/useAssetPicker'
import { Clapperboard, ExternalLink, Image as ImageIcon } from 'lucide-react'
import FeatureGridEditor from './FeatureGridEditor'
import PricingCardsEditor from './PricingCardsEditor'
import TeamGridEditor from './TeamGridEditor'
import TimelineEditor from './TimelineEditor'
import CyberTimelineEditor from './CyberTimelineEditor'
import NewsListEditor from './NewsListEditor'
import TestimonialsEditor from './TestimonialsEditor'
import BannerCarouselEditor from './BannerCarouselEditor'
import LinkBlockEditor from './LinkBlockEditor'
import ImageTextEditor from './ImageTextEditor'
import ImageTextHorizontalEditor from './ImageTextHorizontalEditor'

type CustomEditorProps = {
  component: TemplateComponent
  formData: any
  handleFieldChange: (key: string, value: any) => void
  handleArrayFieldChange: (arrayKey: string, index: number, fieldKey: string, value: any) => void
  openAssetPickerWithValue: (target: AssetPickerTarget, currentValue?: string) => void
  addArrayItem: (arrayKey: string, template: any) => void
  removeArrayItem: (arrayKey: string, index: number) => void
  isAssetUrl: (value?: string) => boolean
  isSvgMarkup: (value?: string) => boolean
}

type CustomEditorRenderer = (props: CustomEditorProps) => JSX.Element | null

const renderVideoEditor: CustomEditorRenderer = ({
  formData,
  handleFieldChange,
  openAssetPickerWithValue
}) => {
  return (
    <div className="mb-6 bg-theme-surface p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Clapperboard className="w-4 h-4 text-tech-accent" />
        <h4 className="font-medium text-theme-textPrimary">视频资源</h4>
      </div>
      <p className="text-xs text-theme-textSecondary">
        从素材库选择或粘贴可播放的视频地址
      </p>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-theme-textPrimary">视频地址</label>
        <input
          type="url"
          value={formData.videoUrl || ''}
          onChange={(e) => handleFieldChange('videoUrl', e.target.value)}
          className="w-full px-3 py-2 border border-theme-divider bg-theme-surfaceAlt theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
          placeholder="如 /uploads/demo.mp4 或 https://example.com/video.mp4"
        />
        <p className="text-xs text-theme-textSecondary">
          支持 MP4 / WebM / MOV 等主流格式。自动播放时会默认静音以避免被浏览器拦截。
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => openAssetPickerWithValue({ fieldKey: 'videoUrl' }, formData.videoUrl)}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-theme-surfaceAlt text-theme-textSecondary hover:bg-theme-surface transition-colors"
          >
            <Clapperboard className="w-4 h-4" />
            <span>选择素材</span>
          </button>
          {formData.videoUrl && (
            <button
              type="button"
              onClick={() => window.open(formData.videoUrl, '_blank')}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>预览视频</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {formData.videoUrl ? (
          <video
            className="w-full aspect-video bg-black overflow-hidden"
            src={formData.videoUrl}
            poster={formData.poster || undefined}
            controls={formData.controls !== false}
            autoPlay={formData.autoPlay === true}
            loop={formData.loop === true}
            muted={formData.muted !== false || formData.autoPlay === true}
            playsInline
          >
            您的浏览器暂不支持视频播放。
          </video>
        ) : (
          <div className="aspect-video w-full bg-theme-surfaceAlt flex flex-col items-center justify-center gap-2 text-theme-textSecondary">
            <Clapperboard className="w-10 h-10 opacity-70" />
            <p className="text-sm">请先选择或粘贴视频地址</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-theme-textPrimary">封面图（可选）</label>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <input
            type="url"
            value={formData.poster || ''}
            onChange={(e) => handleFieldChange('poster', e.target.value)}
            className="w-full sm:flex-1 max-w-full px-3 py-2 bg-theme-surfaceAlt theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
            placeholder="可选：视频封面图片 URL"
          />
          <button
            type="button"
            onClick={() => openAssetPickerWithValue({ fieldKey: 'poster' }, formData.poster)}
            className="flex items-center gap-1 px-3 py-2 text-xs bg-theme-surfaceAlt text-theme-textSecondary hover:bg-theme-surface transition-colors sm:flex-none"
          >
            <ImageIcon className="w-4 h-4" />
            <span>选择素材</span>
          </button>
          {formData.poster && (
            <button
              type="button"
              onClick={() => window.open(formData.poster, '_blank')}
              className="flex items-center gap-1 px-3 py-2 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors sm:flex-none"
            >
              <ExternalLink className="w-4 h-4" />
              <span>预览</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-theme-textPrimary">播放控制</label>
        <div className="space-y-2">
          {[
            { key: 'autoPlay', label: '自动播放', defaultValue: false },
            { key: 'loop', label: '循环播放', defaultValue: false },
            { key: 'muted', label: '静音', defaultValue: true },
            { key: 'controls', label: '显示控制条', defaultValue: true }
          ].map(option => {
            const checked = (formData[option.key] ?? option.defaultValue) === true
            return (
              <label key={option.key} className="flex items-center gap-2 text-sm text-theme-textPrimary">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => handleFieldChange(option.key, e.target.checked)}
                  className="rounded border-theme-divider text-tech-accent focus:ring-tech-accent"
                />
                <span>{option.label}</span>
              </label>
            )
          })}
        </div>
        <p className="text-xs text-theme-textSecondary">
          提示：部分浏览器要求静音才能自动播放，已为自动播放场景默认静音。
        </p>
      </div>
    </div>
  )
}

const renderBannerCarouselEditor: CustomEditorRenderer = ({
  component,
  formData,
  addArrayItem,
  handleArrayFieldChange,
  removeArrayItem,
  handleFieldChange,
  openAssetPickerWithValue
}) => {
  if (component.type !== 'banner-carousel') return null
  return (
    <BannerCarouselEditor
      slides={formData.slides || []}
      settings={{
        autoPlay: formData.autoPlay !== false,
        showIndicators: formData.showIndicators !== false,
        showArrows: formData.showArrows !== false,
        interval: formData.interval || 5000
      }}
      onAdd={() =>
        addArrayItem('slides', {
          image: '',
          title: '横幅标题',
          description: '横幅说明',
          buttonText: '按钮文字',
          buttonLink: '#',
          overlayPosition: 'center'
        })
      }
      onChange={(index, key, value) => handleArrayFieldChange('slides', index, key, value)}
      onRemove={(index) => removeArrayItem('slides', index)}
      onToggle={(key, value) => handleFieldChange(key, value)}
      onIntervalChange={(value) => handleFieldChange('interval', value)}
      openAssetPicker={openAssetPickerWithValue}
    />
  )
}

const renderFeatureGridEditor: CustomEditorRenderer = ({
  component,
  formData,
  handleFieldChange,
  handleArrayFieldChange,
  addArrayItem,
  removeArrayItem,
  openAssetPickerWithValue,
  isAssetUrl,
  isSvgMarkup
}) => {
  if (component.type !== 'feature-grid' && component.type !== 'feature-grid-large') return null
  return (
    <FeatureGridEditor
      type={component.type}
      features={formData.features || []}
      cardsPerRow={formData.cardsPerRow}
      onCardsPerRowChange={(value) => handleFieldChange('cardsPerRow', value)}
      onChange={(index, key, value) => handleArrayFieldChange('features', index, key, value)}
      onAdd={() =>
        addArrayItem('features', {
          icon: '✨',
          title: '新的功能',
          description: '功能描述',
          link: ''
        })
      }
      onRemove={(idx) => removeArrayItem('features', idx)}
      openAssetPicker={openAssetPickerWithValue}
      isAssetUrl={isAssetUrl}
      isSvgMarkup={isSvgMarkup}
    />
  )
}

const renderPricingEditor: CustomEditorRenderer = ({
  component,
  formData,
  handleFieldChange,
  handleArrayFieldChange,
  addArrayItem,
  removeArrayItem
}) => {
  if (component.type !== 'pricing-cards') return null
  return (
    <PricingCardsEditor
      cards={formData.plans || []}
      onAdd={() =>
        addArrayItem('plans', {
          name: '基础版',
          price: '99',
          period: '月',
          features: ['功能1', '功能2'],
          recommended: false,
          link: '#'
        })
      }
      onChange={(index, key, value) => handleArrayFieldChange('plans', index, key, value)}
      onRemove={(index) => removeArrayItem('plans', index)}
      cardsPerRow={formData.cardsPerRow}
      onCardsPerRowChange={(value) => handleFieldChange('cardsPerRow', value)}
    />
  )
}

const renderTeamGridEditor: CustomEditorRenderer = ({
  component,
  formData,
  addArrayItem,
  handleArrayFieldChange,
  removeArrayItem,
  openAssetPickerWithValue
}) => {
  if (component.type !== 'team-grid') return null
  return (
    <TeamGridEditor
      members={formData.members || []}
      onAdd={() =>
        addArrayItem('members', {
          name: '成员姓名',
          role: '职位',
          bio: '个人简介',
          avatar: '/images/avatar-placeholder.jpg'
        })
      }
      onChange={(index, key, value) => handleArrayFieldChange('members', index, key, value)}
      onRemove={(index) => removeArrayItem('members', index)}
      openAssetPicker={openAssetPickerWithValue}
    />
  )
}

const renderTimelineEditorBlock: CustomEditorRenderer = ({
  component,
  formData,
  addArrayItem,
  handleArrayFieldChange,
  removeArrayItem,
  openAssetPickerWithValue,
  isAssetUrl,
  isSvgMarkup
}) => {
  if (component.type !== 'timeline') return null
  return (
    <TimelineEditor
      events={formData.events || []}
      onAdd={() =>
        addArrayItem('events', {
          date: '2024',
          title: '新事件',
          description: '事件描述',
          icon: '🗓️'
        })
      }
      onChange={(index, key, value) => handleArrayFieldChange('events', index, key, value)}
      onRemove={(index) => removeArrayItem('events', index)}
      openAssetPicker={openAssetPickerWithValue}
      isAssetUrl={isAssetUrl}
      isSvgMarkup={isSvgMarkup}
    />
  )
}

const renderCyberTimelineEditorBlock: CustomEditorRenderer = ({
  component,
  formData,
  addArrayItem,
  handleArrayFieldChange,
  removeArrayItem
}) => {
  if (component.type !== 'cyber-timeline') return null
  return (
    <CyberTimelineEditor
      events={formData.events || []}
      onAdd={() =>
        addArrayItem('events', {
          date: '2024',
          phase: '阶段名称',
          title: '新阶段',
          description: '阶段描述',
          link: '',
          tags: []
        })
      }
      onChange={(index, key, value) => handleArrayFieldChange('events', index, key, value)}
      onRemove={(index) => removeArrayItem('events', index)}
    />
  )
}

const renderNewsListEditor: CustomEditorRenderer = ({
  component,
  formData,
  addArrayItem,
  handleArrayFieldChange,
  removeArrayItem,
  openAssetPickerWithValue,
  handleFieldChange
}) => {
  if (component.type !== 'news-list') return null
  return (
    <NewsListEditor
      articles={formData.articles || []}
      cardsPerRow={formData.cardsPerRow}
      onCardsPerRowChange={(value) => handleFieldChange('cardsPerRow', value)}
      onBatchChange={(index, patch) => {
        const current = Array.isArray(formData.articles) ? [...formData.articles] : []
        current[index] = { ...(current[index] || {}), ...patch }
        handleFieldChange('articles', current)
      }}
      onAdd={() =>
        addArrayItem('articles', {
          title: '新闻标题',
          summary: '新闻摘要',
          excerpt: '新闻摘要',
            date: new Date().toISOString().slice(0, 10),
          image: '',
          icon: '📰',
          link: '#'
        })
      }
      onChange={(index, key, value) => handleArrayFieldChange('articles', index, key, value)}
      onRemove={(index) => removeArrayItem('articles', index)}
      openAssetPicker={openAssetPickerWithValue}
    />
  )
}

const renderTestimonialsEditor: CustomEditorRenderer = ({
  component,
  formData,
  addArrayItem,
  handleArrayFieldChange,
  removeArrayItem,
  openAssetPickerWithValue
}) => {
  if (component.type !== 'testimonials') return null
  return (
    <TestimonialsEditor
      testimonials={formData.testimonials || []}
      onAdd={() =>
        addArrayItem('testimonials', {
          name: '客户姓名',
          role: '职位',
          content: '推荐内容',
          avatar: '',
          rating: 5
        })
      }
      onChange={(index, key, value) => handleArrayFieldChange('testimonials', index, key, value)}
      onRemove={(index) => removeArrayItem('testimonials', index)}
      openAssetPicker={openAssetPickerWithValue}
    />
  )
}

const renderLinkBlockEditor: CustomEditorRenderer = ({
  component,
  formData,
  addArrayItem,
  handleArrayFieldChange,
  removeArrayItem
}) => {
  if (component.type !== 'link-block') return null
  const links = Array.isArray(formData.links) ? formData.links : []
  return (
    <LinkBlockEditor
      links={links}
      onAdd={() => addArrayItem('links', { text: '', url: '' })}
      onChange={(index, fieldKey, value) => handleArrayFieldChange('links', index, fieldKey, value)}
      onRemove={(index) => removeArrayItem('links', index)}
    />
  )
}

const renderImageTextEditor: CustomEditorRenderer = ({
  component,
  formData,
  handleFieldChange
}) => {
  if (component.type !== 'image-text') return null
  return (
    <ImageTextEditor
      imageWidthPercent={formData.imageWidthPercent}
      onWidthChange={(value) => handleFieldChange('imageWidthPercent', value)}
    />
  )
}

const renderImageTextHorizontalEditor: CustomEditorRenderer = ({
  component,
  formData,
  handleFieldChange
}) => {
  if (component.type !== 'image-text-horizontal') return null
  return (
    <ImageTextHorizontalEditor
      imageWidthPercent={formData.imageWidthPercent}
      onWidthChange={(value) => handleFieldChange('imageWidthPercent', value)}
    />
  )
}

const customEditors: Partial<Record<string, CustomEditorRenderer>> = {
  'video-player': renderVideoEditor,
  'banner-carousel': renderBannerCarouselEditor,
  'feature-grid': renderFeatureGridEditor,
  'feature-grid-large': renderFeatureGridEditor,
  'pricing-cards': renderPricingEditor,
  'team-grid': renderTeamGridEditor,
  'timeline': renderTimelineEditorBlock,
  'cyber-timeline': renderCyberTimelineEditorBlock,
  'news-list': renderNewsListEditor,
  'testimonials': renderTestimonialsEditor,
  'link-block': renderLinkBlockEditor,
  'image-text': renderImageTextEditor,
  'image-text-horizontal': renderImageTextHorizontalEditor
}

export const renderCustomEditor = (props: CustomEditorProps) => {
  const editor = customEditors[props.component.type]
  if (!editor) return null
  return editor(props)
}
