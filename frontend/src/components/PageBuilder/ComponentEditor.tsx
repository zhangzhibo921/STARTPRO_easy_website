import React, { useState, useEffect } from 'react'
import { X, Settings, Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import { TemplateComponent } from '@/types/templates'
import { componentDefinitions } from '@/lib/templates'
import toast from 'react-hot-toast'
import AssetPickerModal, { SelectedAsset } from '@/components/AssetPickerModal'
import useAssetPicker, { AssetPickerTarget } from './hooks/useAssetPicker'
import FaqSectionEditor from './editors/FaqSectionEditor'
import StatsSectionEditor from './editors/StatsSectionEditor'
import CyberShowcaseEditor from './editors/CyberShowcaseEditor'
import CyberSuperCardEditor from './editors/CyberSuperCardEditor'
import ContactFormEditor from './editors/ContactFormEditor'
import { renderCustomEditor } from './editors/customEditors'
import { WidthBackgroundEditor } from './editors/common/WidthBackgroundEditor'
import { TextFieldsEditor } from './editors/common/TextFieldsEditor'
import { MediaPickerField } from './editors/common/MediaPickerField'
import { IconColorControls } from './editors/common/IconColorControls'
import { CyberEffectsEditor } from './editors/common/CyberEffectsEditor'

interface ComponentEditorProps {
  component: TemplateComponent
  onUpdate: (props: any) => void
  onClose: () => void
}

const assetUrlRegex = /\.(png|jpe?g|gif|webp|svg|avif)$/i

const isAssetUrl = (value?: string) => {
  if (!value || typeof value !== 'string') return false
  const trimmed = value.trim()
  if (!trimmed) return false
  if (trimmed.startsWith('data:')) return true
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('//')) return true
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('/system-default/')) return true
  return assetUrlRegex.test(trimmed)
}

const isSvgMarkup = (value?: string) => {
  if (!value || typeof value !== 'string') return false
  return value.trim().startsWith('<svg')
}

const getPreferredSource = (value?: string): 'user' | 'system' => {
  if (value && value.includes('/system-default/')) {
    return 'system'
  }
  return 'user'
}

const ICON_COLOR_COMPONENTS = new Set([
  'feature-grid',
  'feature-grid-large',
  'stats-section',
  'timeline',
  'cyber-timeline',
  'service-grid',
  'premium-feature-grid',
  'premium-stats'
])
const DEFAULT_ICON_COLOR = '#0ea5e9'

const ComponentEditor = ({
  component,
  onUpdate,
  onClose
}: ComponentEditorProps) => {
  const componentDefinition = componentDefinitions.find(def => def.type === component.type);
  const [formData, setFormData] = useState<any>(component.props)
  const supportsIconColorControls = ICON_COLOR_COMPONENTS.has(component.type)

  useEffect(() => {
    setFormData(component.props)
  }, [component])

  const handleFieldChange = (key: string, value: any) => {
    const newFormData = { ...formData, [key]: value }
    setFormData(newFormData)
    onUpdate(newFormData)
  }

  const handleArrayFieldChange = (arrayKey: string, index: number, fieldKey: string, value: any) => {
    const array = [...(formData[arrayKey] || [])]
    array[index] = { ...array[index], [fieldKey]: value }
    handleFieldChange(arrayKey, array)
  }

  const addArrayItem = (arrayKey: string, template: any) => {
    const array = [...(formData[arrayKey] || [])]
    array.push({ ...template })
    handleFieldChange(arrayKey, array)
  }

  const removeArrayItem = (arrayKey: string, index: number) => {
    const array = [...(formData[arrayKey] || [])]
    array.splice(index, 1)
    handleFieldChange(arrayKey, array)
  }

  const handleIconColorModeChange = (mode: 'default' | 'custom') => {
    if (mode === 'custom' && (!formData.iconColor || typeof formData.iconColor !== 'string')) {
      handleFieldChange('iconColor', DEFAULT_ICON_COLOR)
    }
    handleFieldChange('iconColorMode', mode)
  }

  const handleIconColorValueChange = (value: string) => {
    handleFieldChange('iconColor', value)
  }

  const {
    isAssetPickerOpen,
    assetPickerSource,
    assetPickerMode,
    openAssetPicker,
    openMultiAssetPicker,
    closeAssetPicker,
    handleAssetSelect,
    handleMultiAssetSelect
  } = useAssetPicker({
    onFieldChange: handleFieldChange,
    onArrayFieldChange: handleArrayFieldChange
  })

  const openAssetPickerWithValue = (target: AssetPickerTarget, currentValue?: string) =>
    openAssetPicker(target, getPreferredSource(currentValue))

  const renderIconColorControls = () => {
    if (!supportsIconColorControls) return null
    const iconColorMode: 'default' | 'custom' = formData.iconColorMode === 'custom' ? 'custom' : 'default'
    const iconColorValue: string =
      typeof formData.iconColor === 'string' && formData.iconColor.trim() ? formData.iconColor : '#0ea5e9'
    return (
      <IconColorControls
        iconColorMode={iconColorMode}
        iconColor={iconColorValue}
        onModeChange={handleIconColorModeChange}
        onColorChange={handleIconColorValueChange}
      />
    )
  }

  const appendLogosFromAssets = (assets: SelectedAsset[]) => {
    if (!assets || assets.length === 0) return
    const currentLogos = Array.isArray(formData.logos) ? [...formData.logos] : []
    const existingImages = new Set(currentLogos.map((logo: any) => logo.image))

    const newLogos = assets
      .filter(asset => asset.url && !existingImages.has(asset.url))
      .map((asset, idx) => ({
        image: asset.url,
        alt: asset.name || `Logo ${currentLogos.length + idx + 1}`
      }))

    if (newLogos.length === 0) {
      toast.error('Selected assets already exist in the Logo list')
      return
    }

    handleFieldChange('logos', [...currentLogos, ...newLogos])
    toast.success(`已新增 ${newLogos.length} 个 Logo`)
  }

  const commonFields = [
    'src',
    'alt',
    'backgroundImage',
    'backgroundColor',
    'shape',
    'image',
    'imagePosition',
    'linkUrl',
    'linkTarget',
    'alignment',
    'titleColorMode',
    'customTitleColor',
    'subtitleColorMode',
    'customSubtitleColor'
  ]
  const fieldSkipMap: Record<string, Set<string>> = {
    'cyber-showcase': new Set(['title', 'description'])
  }

  const renderBasicFields = () => {
    return commonFields.map(key => {
      const skipForComponent = fieldSkipMap[component.type]?.has(key)
      if (skipForComponent) return null
      const fieldDef = componentDefinition?.editableFields?.find(field => field.key === key);
      const hasOptions = fieldDef && fieldDef.options && Array.isArray(fieldDef.options);
      const shouldRenderField = formData.hasOwnProperty(key) || (componentDefinition?.editableFields?.some(field => field.key === key) ?? false);

      if (shouldRenderField) {
        return (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {key === 'title' && '标题'}
              {key === 'subtitle' && '副标题'}
              {key === 'content' && '内容'}
              {key === 'description' && '描述'}
              {key === 'buttonText' && '按钮文字'}
              {key === 'buttonLink' && '按钮链接'}
              {key === 'src' && '图片URL'}
              {key === 'image' && '图片'}
              {key === 'alt' && '图片描述'}
              {key === 'caption' && '图片说明'}
              {key === 'linkUrl' && '链接地址'}
              {key === 'linkTarget' && '打开方式'}
              {key === 'backgroundImage' && '背景图片'}
              {key === 'backgroundColor' && '背景颜色'}
              {key === 'shape' && '容器形状'}
              {key === 'widthOption' && '宽度设置'}
              {key === 'backgroundColorOption' && '背景模式'}
              {key === 'imagePosition' && '图片位置'}
              {key === 'alignment' && '对齐方式'}
              {key === 'titleColorMode' && '标题颜色模式'}
              {key === 'customTitleColor' && '自定义标题颜色'}
              {key === 'subtitleColorMode' && '副标题颜色模式'}
              {key === 'customSubtitleColor' && '自定义副标题颜色'}
            </label>
            {(key === 'customTitleColor' || key === 'customSubtitleColor') ? (
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={
                    typeof formData[key] === 'string' && formData[key].trim()
                      ? formData[key]
                      : '#ffffff'
                  }
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  className="h-10 w-16 rounded border border-gray-300 dark:border-gray-600 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={formData[key] || ''}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  placeholder="如 #2563eb 或 rgba(...)"
                  className="flex-1 px-3 py-2 rounded-lg theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                />
              </div>
            ) : key === 'backgroundColor' ? (
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData[key] || '#3B82F6'}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  className="w-16 h-12 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
                <input
                  type="text"
                  value={formData[key] || '#3B82F6'}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg  theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                  placeholder="#3B82F6"
                />
              </div>
            ) : hasOptions ? (
              <select
                value={formData[key] || (fieldDef ? fieldDef.value : '')}
                onChange={(e) => handleFieldChange(key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg  theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
              >
                {fieldDef?.options?.map((option: any) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : key === 'content' || key === 'subtitle' || key === 'description' ? (
              <textarea
                value={formData[key] || ''}
                onChange={(e) => handleFieldChange(key, e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg  theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent resize-none"
                placeholder={`输入${key === 'content' ? '内容（支持HTML）' : key === 'description' ? '描述' : '副标题'}`}
              />
            ) : key === 'src' || key === 'backgroundImage' || key === 'image' ? (
              <MediaPickerField
                label={key === 'src' ? '图片URL' : key === 'backgroundImage' ? '背景图片' : '图片'}
                fieldKey={key}
                value={formData[key] || ''}
                placeholder="请输入或选择图片 URL"
                onChange={(val) => handleFieldChange(key, val)}
                openAssetPickerWithValue={(target, current) => openAssetPickerWithValue(target, current)}
              />
            ) : key === 'buttonLink' ? (
              <div className="space-y-2">
                <input
                  type="url"
                  value={formData[key] || ''}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg  theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                  placeholder="输入链接地址，例如 /about 或 https://example.com"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">可使用相对路径或完整URL</p>
              </div>
            ) : (
              <input
                type="text"
                value={formData[key] || ''}
                onChange={(e) => handleFieldChange(key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg  theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                placeholder={`请输入${key === 'title' ? '标题' : key === 'buttonText' ? '按钮文字' : key === 'alt' ? '图片描述' : key === 'image' ? '图片URL' : '内容'}`}
              />
            )}
          </div>
        )
      }
      return null
    })
  }

  const getComponentName = (type: string) => {
    const def = componentDefinitions.find(d => d.type === type)
    return def?.name || '组件'
  }

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 dark-border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-centre space-x-2">
              <Settings className="w-5 h-5 text-tech-accent" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{getComponentName(component.type)}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">编辑组件属性</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <TextFieldsEditor
            formData={formData}
            editableFields={componentDefinition?.editableFields}
            onChange={handleFieldChange}
          />
          {renderBasicFields()}
          <WidthBackgroundEditor
            formData={formData}
            editableFields={componentDefinition?.editableFields}
            onChange={handleFieldChange}
          />
          {renderIconColorControls()}

          {renderCustomEditor({
            component,
            formData,
          handleFieldChange,
          handleArrayFieldChange,
          addArrayItem,
          removeArrayItem,
          openAssetPickerWithValue,
          isAssetUrl,
          isSvgMarkup
        })}

          {(component.type === 'logo-wall' || component.type === 'logo-scroll') && (
            <div className="mb-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Logo 列表</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">支持批量导入或单个上传，可补充替代文本。</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => addArrayItem('logos', { image: '', alt: '' })}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-tech-accent text-white rounded-lg hover:bg-tech-secondary transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>新增 Logo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openMultiAssetPicker((assets) => appendLogosFromAssets(assets), 'user')}
                    className="flex items-center space-x-1 px-3 py-1 text-sm rounded border border-theme-divider bg-theme-surfaceAlt text-theme-textSecondary hover:bg-theme-surface transition-colors"
                  >
                    <ImageIcon className="w-3 h-3" />
                    <span>批量导入</span>
                  </button>
                </div>
              </div>

              {component.type === 'logo-scroll' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo 高度</label>
                    <select
                      value={formData.height || 'low'}
                      onChange={(e) => handleFieldChange('height', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg  theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                    >
                      <option value="low">低（80px）</option>
                      <option value="high">高（160px）</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">滚动速度</label>
                    <select
                      value={formData.scrollSpeed || 'slow'}
                      onChange={(e) => handleFieldChange('scrollSpeed', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg  theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                    >
                      <option value="slow">慢</option>
                      <option value="fast">快</option>
                    </select>
                  </div>
                </div>
              )}

              {(formData.logos || []).length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">还没有 Logo，可点击上方按钮快速导入。</p>
              )}

              {(formData.logos || []).map((logo: any, index: number) => (
                <div key={`${logo.image || 'logo'}-${index}`} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Logo {index + 1}</span>
                    <button onClick={() => removeArrayItem('logos', index)} className="p-1 text-red-500 hover:text-red-700">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-white dark:bg-gray-800 overflow-hidden">
                      {logo.image ? (
                        <img
                          key={`${logo.image}-${index}`}
                          src={logo.image}
                          alt={logo.alt || `Logo ${index + 1}`}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500">暂无图片</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={logo.image || ''}
                        onChange={(e) => handleArrayFieldChange('logos', index, 'image', e.target.value)}
                        placeholder="Logo 图片 URL"
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded  theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openAssetPickerWithValue({ fieldKey: 'image', arrayKey: 'logos', arrayIndex: index }, logo.image)
                          }
                          className="flex items-center space-x-1 px-2 py-1 text-xs rounded border border-theme-divider bg-theme-surfaceAlt text-theme-textSecondary hover:bg-theme-surface transition-colors"
                        >
                          <ImageIcon className="w-3 h-3" />
                          <span>从素材库选择</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={logo.alt || ''}
                        onChange={(e) => handleArrayFieldChange('logos', index, 'alt', e.target.value)}
                        placeholder="替代文本 / 说明"
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded  theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        {component.type === 'contact-form' && (
          <ContactFormEditor
            fields={formData.fields || []}
            onAdd={() => addArrayItem('fields', { name: 'field', label: '字段标签', type: 'text', required: false })}
            onChange={(index, key, value) => handleArrayFieldChange('fields', index, key, value)}
            onRemove={(index) => removeArrayItem('fields', index)}
          />
        )}

        {component.type === 'faq-section' && (
          <FaqSectionEditor
            faqs={formData.faqs || []}
            onAdd={() => addArrayItem('faqs', { question: 'Question', answer: 'Answer' })}
            onChange={(index, key, value) => handleArrayFieldChange('faqs', index, key, value)}
            onRemove={(index) => removeArrayItem('faqs', index)}
          />
        )}

        {component.type === 'stats-section' && (
          <StatsSectionEditor
            stats={formData.stats || []}
            onAdd={() => addArrayItem('stats', { label: '统计标签', value: '100+', icon: '📊' })}
            onChange={(index, key, value) => handleArrayFieldChange('stats', index, key, value)}
            onRemove={(index) => removeArrayItem('stats', index)}
            openAssetPicker={openAssetPickerWithValue}
            isAssetUrl={isAssetUrl}
            isSvgMarkup={isSvgMarkup}
            onFieldChange={handleFieldChange}
            textColorMode={formData.textColorMode}
            textColor={formData.textColor}
          />
        )}

        {component.type === 'cyber-showcase' && (
          <CyberShowcaseEditor
            controls={formData.controls || []}
            onAdd={() =>
              addArrayItem('controls', {
                id: 'control-' + Date.now(),
                title: '新的标题',
                label: '新的功能',
                icon: '✨',
                iconColor: '#60a5fa',
                image: '',
                description: '',
                imageDescription: ''
              })
            }
            onChange={(index, key, value) => handleArrayFieldChange('controls', index, key, value)}
            onRemove={(index) => removeArrayItem('controls', index)}
            openAssetPicker={openAssetPickerWithValue}
            isAssetUrl={isAssetUrl}
            isSvgMarkup={isSvgMarkup}
          />
        )}

        {component.type === 'cyber-super-card' && (
          <>
            <CyberEffectsEditor
              settings={{
                alignment: formData.alignment || 'left',
                hoverEffect: formData.hoverEffect !== false,
                flowingLight: formData.flowingLight !== false,
                iconFrame: formData.iconFrame !== false
              }}
              onChange={(key, value) => handleFieldChange(key, value)}
            />
            <CyberSuperCardEditor
              cards={formData.cards || []}
              settings={{
                cardsPerRow: formData.cardsPerRow ?? 3,
                layoutMode: formData.layoutMode || 'default',
                visualMode: formData.visualMode || 'icon',
                alignment: formData.alignment || 'left',
                hoverEffect: formData.hoverEffect !== false,
                flowingLight: formData.flowingLight !== false,
                iconFrame: formData.iconFrame !== false
              }}
              onSettingsChange={(key, value) => handleFieldChange(key, value)}
              onAdd={() =>
                addArrayItem('cards', {
                  id: `cyber-card-${Date.now()}`,
                  title: '新的卡片',
                  description: '',
                  icon: '✨',
                  iconColor: '#0ea5e9',
                  image: '',
                  tags: [],
                  link: ''
                })
              }
              onChange={(index, key, value) => handleArrayFieldChange('cards', index, key, value)}
              onRemove={(index) => removeArrayItem('cards', index)}
              openAssetPicker={openAssetPickerWithValue}
              isAssetUrl={isAssetUrl}
              isSvgMarkup={isSvgMarkup}
            />
          </>
        )}

        {Object.keys(formData).length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">该组件暂无可编辑内容</div>
        )}
      </div>
      </div>

      <AssetPickerModal
        isOpen={isAssetPickerOpen}
        onClose={closeAssetPicker}
        onSelect={handleAssetSelect}
        initialSource={assetPickerSource}
        selectionMode={assetPickerMode}
       onSelectMultiple={assetPickerMode === 'multiple' ? handleMultiAssetSelect : undefined}
      />
    </>
  )
}
export default ComponentEditor
