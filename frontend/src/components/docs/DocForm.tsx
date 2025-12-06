import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { Doc, DocNode } from '@/types'
import DocParentSelector from './DocParentSelector'
import AssetPickerModal, { type SelectedAsset } from '@/components/AssetPickerModal'

type DocStatus = 'draft' | 'published'

interface DocFormProps {
  parentTree: DocNode[]
  initialData?: Partial<Doc>
  onSubmit: (payload: Partial<Doc> & { status: DocStatus }) => Promise<void>
  submitting?: boolean
  excludeId?: number
  onPreview?: (slug: string) => void
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s/-]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^\/+|\/+$/g, '')

const defaultForm: Partial<Doc> = {
  title: '',
  slug: '',
  parent_id: null,
  sort_order: 0,
  status: 'draft',
  content: '',
  summary: '',
  cover: ''
}

export default function DocForm({
  parentTree,
  initialData,
  onSubmit,
  submitting,
  excludeId,
  onPreview
}: DocFormProps) {
  const [form, setForm] = useState<Partial<Doc>>({ ...defaultForm, ...initialData })
  const [editorLoaded, setEditorLoaded] = useState(false)
  const [editorError, setEditorError] = useState<string | null>(null)
  const editorHostRef = useRef<HTMLDivElement | null>(null)
  const editorInstanceRef = useRef<any>(null)
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false)
  const [assetSource, setAssetSource] = useState<'user' | 'system'>('user')

  useEffect(() => {
    setForm((prev) => ({ ...prev, ...initialData }))
  }, [initialData])

  useEffect(() => {
    let mounted = true

    const cleanupExisting = () => {
      delete (window as any).CKEditor
      delete (window as any).CKEDITOR
      delete (window as any).ClassicEditor
      delete (window as any).CKEDITOR_VERSION
      delete (globalThis as any).CKEDITOR_VERSION
    }

    const loadFirstAvailable = (type: 'css' | 'js', urls: string[], attr: string) =>
      new Promise<void>((resolve, reject) => {
        const tryNext = (index: number) => {
          if (index >= urls.length) {
            reject(new Error(`CKEditor ${type} load failed`))
            return
          }
          const url = urls[index]
          if (type === 'css') {
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = url
            link.setAttribute(attr, 'true')
            link.onload = () => resolve()
            link.onerror = () => {
              link.remove()
              tryNext(index + 1)
            }
            document.head.appendChild(link)
          } else {
            const script = document.createElement('script')
            script.src = url
            script.async = true
            script.setAttribute(attr, 'true')
            script.onload = () => resolve()
            script.onerror = () => {
              script.remove()
              tryNext(index + 1)
            }
            document.body.appendChild(script)
          }
        }

        tryNext(0)
      })

    const initEditor = async () => {
      if (typeof window === 'undefined') return
      cleanupExisting()

      await loadFirstAvailable('css', ['/ck-umd/cke-global.css'], 'data-ckeditor-css')
      await loadFirstAvailable('js', ['/ck-umd/cke-global.umd.cjs'], 'data-ckeditor-js')

      const ClassicEditor =
        (window as any).CKEDITOR?.ClassicEditor ||
        (window as any).ClassicEditor ||
        (window as any).CKEditor?.ClassicEditor
      if (!ClassicEditor || !editorHostRef.current) {
        throw new Error('CKEditor not found')
      }

      ;(window as any).CKEDITOR_LICENSE_KEY = 'GPL'
      const baseConfig = (window as any).CKEDITOR_DEFAULT_CONFIG || {}

      const disallow = new Set([
        'fontColor',
        'fontBackgroundColor',
        'fontFamily',
        'fontSize',
        'style',
        'styles',
        'language',
        'textPartLanguage',
        'textPartLanguageDropdown'
      ])
      const filteredToolbar =
        Array.isArray(baseConfig.toolbar) && baseConfig.toolbar.every((t: any) => typeof t === 'string')
          ? baseConfig.toolbar.filter((item: string) => !disallow.has(item))
          : baseConfig.toolbar

      editorInstanceRef.current = await ClassicEditor.create(editorHostRef.current, {
        ...baseConfig,
        toolbar: filteredToolbar,
        licenseKey: 'GPL',
        placeholder: '请输入正文...'
      })

      if (form.content) {
        editorInstanceRef.current.setData(form.content)
      }
      editorInstanceRef.current.model.document.on('change:data', () => {
        const data = editorInstanceRef.current.getData()
        setForm((prev) => ({ ...prev, content: data }))
      })

      if (mounted) {
        setEditorLoaded(true)
        setEditorError(null)
      }
    }

    initEditor().catch((error) => {
      console.error('加载 CKEditor 失败', error)
      if (mounted) {
        setEditorError('编辑器加载失败，已切换为纯文本输入')
      }
    })

    return () => {
      mounted = false
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy().catch(() => {})
        editorInstanceRef.current = null
      }
    }
  }, [])

  const parentSlugMap = useMemo(() => {
    const map = new Map<number, string>()
    const walk = (nodes: DocNode[], prefix = '') => {
      nodes.forEach((n) => {
        const full = prefix ? `${prefix}/${n.slug}` : n.slug
        map.set(n.id, full)
        if (n.children) walk(n.children, full)
      })
    }
    walk(parentTree)
    return map
  }, [parentTree])

  const handleChange = (key: keyof Doc, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleTitleBlur = () => {
    if (!form.title) return
    const parentSlug = form.parent_id ? parentSlugMap.get(form.parent_id) : ''
    const base = slugify(form.title)
    const nextSlug = parentSlug ? `${parentSlug}/${base}` : base
    if (!form.slug || form.slug === slugify(form.title || '')) {
      handleChange('slug', nextSlug)
    } else if (parentSlug && !form.slug.startsWith(parentSlug)) {
      handleChange('slug', `${parentSlug}/${form.slug}`)
    }
  }

  const handleSubmit = async (status: DocStatus) => {
    const trimmedTitle = (form.title || '').trim()
    const rawSlug = form.slug || form.title || ''
    const finalSlug = rawSlug ? slugify(rawSlug) : ''

    if (!trimmedTitle) {
      setEditorError(null)
      alert('标题不能为空')
      return
    }
    if (!finalSlug) {
      setEditorError(null)
      alert('Slug 不能为空')
      return
    }

    await onSubmit({
      ...form,
      status,
      title: trimmedTitle,
      slug: finalSlug
    })
  }

  const previewable = useMemo(() => Boolean(form.slug && form.status === 'published'), [form.slug, form.status])

  const normalizeAssetUrl = (url?: string) => {
    if (!url || typeof url !== 'string') return ''
    const trimmed = url.trim()
    if (!trimmed) return ''
    const uploadsIndex = trimmed.indexOf('/uploads/')
    if (uploadsIndex >= 0) return trimmed.slice(uploadsIndex)
    const systemIndex = trimmed.indexOf('/system-default/')
    if (systemIndex >= 0) return trimmed.slice(systemIndex)
    return trimmed
  }

  const insertImage = (src: string) => {
    if (!editorInstanceRef.current) return
    const editor = editorInstanceRef.current
    const url = normalizeAssetUrl(src)
    editor.model.change((writer: any) => {
      const imageElement = writer.createElement('imageBlock', { src: url })
      editor.model.insertContent(imageElement, editor.model.document.selection)
    })
  }

  const openAssetPicker = (source: 'user' | 'system' = 'user') => {
    setAssetSource(source)
    setIsAssetPickerOpen(true)
  }

  const handleAssetSelect = (asset: SelectedAsset) => {
    insertImage(asset.url || '')
    setIsAssetPickerOpen(false)
  }

  return (
    <div className="space-y-5 w-full min-w-0">
      <div className="rounded-xl bg-theme-surface p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-theme-text">标题</label>
            <input
              className="w-full theme-input rounded-lg"
              style={{ borderRadius: 10 }}
              value={form.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="输入文档标题"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-theme-text">Slug（路径）</label>
            <input
              className="w-full theme-input rounded-lg"
              style={{ borderRadius: 10 }}
              value={form.slug || ''}
              onChange={(e) => handleChange('slug', e.target.value)}
              placeholder="例如：guide/getting-started"
            />
            <p className="text-xs text-theme-textSecondary">支持多级路径，使用 / 分隔，会自动转为小写</p>
          </div>
          <div className="space-y-2">
            <DocParentSelector
              tree={parentTree}
              value={form.parent_id ?? null}
              excludeId={excludeId}
              onChange={(id) => {
                handleChange('parent_id', id)
                // 自动补齐 slug 前缀
                if (id) {
                  const pSlug = parentSlugMap.get(id)
                  if (pSlug) {
                    const base = form.slug ? form.slug.replace(/^.*\//, '') : slugify(form.title || '')
                    handleChange('slug', base ? `${pSlug}/${base}` : pSlug)
                  }
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-theme-text">排序</label>
            <input
              type="number"
              className="w-full theme-input rounded-lg"
              style={{ borderRadius: 10 }}
              value={form.sort_order ?? 0}
              onChange={(e) => handleChange('sort_order', Number(e.target.value))}
              min={0}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-theme-surface p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-theme-text">正文</p>
            {!editorLoaded && !editorError && <span className="text-xs text-theme-textSecondary">加载编辑器中...</span>}
            {editorError && <span className="text-xs text-red-500">{editorError}</span>}
          </div>
          <div className="flex items-center gap-3">
            <span
              className="px-3 py-1 text-xs font-semibold rounded-full"
              style={{
                background: form.status === 'published' ? 'rgba(56,189,248,0.12)' : 'rgba(148,163,184,0.15)',
                color: form.status === 'published' ? '#22d3ee' : '#cbd5e1'
              }}
            >
              {form.status === 'published' ? '已发布' : '草稿'}
            </span>
            {!editorError && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openAssetPicker('user')}
                  className="px-3 py-1.5 text-xs rounded-md bg-theme-surfaceAlt border border-theme-divider text-theme-text hover:bg-theme-surface"
                >
                  从素材库插入图片
                </button>
              </div>
            )}
          </div>
        </div>

        {editorError ? (
          <textarea
            className="w-full theme-input min-h-[260px]"
            value={form.content || ''}
            onChange={(e) => handleChange('content', e.target.value)}
            placeholder="编辑器加载失败，直接输入纯文本"
          />
        ) : (
          <>
            <style>{`
              .ck-content ol { list-style: decimal; margin-left: 1.5rem; }
              .ck-content ul { list-style: disc; margin-left: 1.5rem; }
              .ck-content .todo-list { list-style: none; margin-left: 1.5rem; }
              .ck-content h1 { font-size: 2em; margin: 0.67em 0; }
              .ck-content h2 { font-size: 1.5em; margin: 0.75em 0; }
              .ck-content h3 { font-size: 1.17em; margin: 0.83em 0; }
              .ck-content h4 { font-size: 1em; margin: 1.12em 0; }
              .ck-content h5 { font-size: 0.83em; margin: 1.5em 0; }
              .ck-content h6 { font-size: 0.75em; margin: 1.67em 0; }
            `}</style>
            <div
              ref={editorHostRef}
              className="min-h-[360px] bg-theme-surfaceAlt rounded-md p-2 min-w-0"
            />
          </>
        )}
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={() => handleSubmit('draft')}
          disabled={submitting}
          className="px-4 py-2 rounded-md bg-theme-surfaceAlt border border-theme-divider text-theme-text hover:bg-theme-surface transition-colors disabled:opacity-60"
        >
          保存草稿
        </button>
        <button
          type="button"
          onClick={() => handleSubmit('published')}
          disabled={submitting}
          className="px-4 py-2 rounded-md bg-semantic-hero-accent text-white shadow-sm hover:opacity-90 transition-colors disabled:opacity-60"
        >
          发布 / 更新
        </button>
        {previewable && onPreview && (
          <button
            type="button"
            onClick={() => onPreview(form.slug as string)}
            className="px-4 py-2 rounded-md bg-theme-surfaceAlt border border-theme-divider text-theme-text hover:bg-theme-surface transition-colors"
          >
            预览前台
          </button>
        )}
      </div>

      <AssetPickerModal
        isOpen={isAssetPickerOpen}
        onClose={() => setIsAssetPickerOpen(false)}
        onSelect={handleAssetSelect}
        initialSource={assetSource}
      />
    </div>
  )
}
