import React from 'react'
import { Clapperboard, ExternalLink, Image as ImageIcon } from 'lucide-react'
import { AssetPickerTarget } from '../hooks/useAssetPicker'

type VideoEditorProps = {
  formData: any
  handleFieldChange: (key: string, value: any) => void
  openAssetPickerWithValue: (target: AssetPickerTarget, currentValue?: string) => void
}

const VideoEditor: React.FC<VideoEditorProps> = ({ formData, handleFieldChange, openAssetPickerWithValue }) => {
  return (
    <div className="mb-6 bg-theme-surface p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Clapperboard className="w-4 h-4 text-tech-accent" />
        <h4 className="font-medium text-theme-textPrimary">视频资源</h4>
      </div>
      <p className="text-xs text-theme-textSecondary">从素材库选择或粘贴可播放的视频地址</p>

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

export default VideoEditor
