import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { X, Search, Folder, Image as ImageIcon, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { uploadApi } from '@/utils/api'

type SourceType = 'user' | 'system'

interface FolderItem {
  id: string
  name: string
  path: string
  type: 'root' | 'folder'
  children?: FolderItem[]
}

interface FileItem {
  name: string
  url: string
  path: string
  size: number
  type?: string
  mime_type?: string
}

export interface SelectedAsset {
  url: string
  name: string
  source: SourceType
  folder: string
  type?: string
}

interface AssetPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (asset: SelectedAsset) => void | Promise<void>
  onSelectMultiple?: (assets: SelectedAsset[]) => void
  initialSource?: SourceType
  initialFolder?: string
  selectionMode?: 'single' | 'multiple'
}

const defaultTree: FolderItem[] = [{ id: 'root', name: '根目录', path: 'root', type: 'root', children: [] }]

const buildFolderTree = (flatFolders: FolderItem[] = []): FolderItem[] => {
  const rootName = flatFolders.find(folder => folder.id === 'root')?.name || '根目录'
  const root: FolderItem = { id: 'root', name: rootName, path: 'root', type: 'root', children: [] }
  const pathToNode: Record<string, FolderItem> = {}

  flatFolders.forEach(folder => {
    if (folder.id === 'root') return
    pathToNode[folder.path] = { ...folder, children: [] }
  })

  flatFolders.forEach(folder => {
    if (folder.id === 'root') return
    const currentPath = folder.path
    const node = pathToNode[currentPath]
    const parts = currentPath.split('/')
    const parentPath = parts.length > 1 ? parts.slice(0, -1).join('/') : ''

    if (parentPath && pathToNode[parentPath]) {
      pathToNode[parentPath].children?.push(node)
    } else {
      root.children?.push(node)
    }
  })

  if (root.children) {
    root.children.sort((a, b) => a.path.localeCompare(b.path))
  }

  return [root]
}

const isImageFile = (file: FileItem) => {
  const mime = file.mime_type || file.type || ''
  if (mime.toLowerCase().includes('image')) return true
  return /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(file.name)
}

const isSystemSvgFile = (file: FileItem, source: SourceType) => {
  if (source !== 'system') return false
  const name = file.name || file.path || ''
  const type = file.mime_type || file.type || ''
  return type.toLowerCase().includes('svg') || /\.svg$/i.test(name)
}

const SVG_COLOR_ATTR_REGEX = /(fill|stroke|stop-color)\s*=\s*(["'])(.*?)\2/gi
const SVG_STYLE_COLOR_REGEX = /(fill|stroke|stop-color)\s*:\s*([^;"]*)(;?)/gi

const sanitizeSvgContent = (svgMarkup: string) =>
  svgMarkup
    .replace(/<\?xml[\s\S]*?\?>/gi, '')
    .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(SVG_COLOR_ATTR_REGEX, (_match, prop, quote, value) => {
      const lower = String(value || '').trim().toLowerCase()
      if (!value || lower === 'none' || lower === 'currentcolor' || lower.startsWith('url(')) {
        return `${prop}=${quote}${value}${quote}`
      }
      return `${prop}=${quote}currentColor${quote}`
    })
    .replace(SVG_STYLE_COLOR_REGEX, (_match, prop, value, suffix) => {
      const lower = String(value || '').trim().toLowerCase()
      if (!value || lower === 'none' || lower === 'currentcolor' || lower.startsWith('url(')) {
        return `${prop}:${value}${suffix}`
      }
      return `${prop}:currentColor${suffix}`
    })

const AssetPickerModal = ({
  isOpen,
  onClose,
  onSelect,
  initialSource = 'user',
  initialFolder = 'root',
  onSelectMultiple,
  selectionMode = 'single'
}: AssetPickerModalProps) => {
  const [activeSource, setActiveSource] = useState<SourceType>(initialSource)
  const [folderTree, setFolderTree] = useState<{ user: FolderItem[]; system: FolderItem[] }>({
    user: defaultTree,
    system: defaultTree
  })
  const [currentFolder, setCurrentFolder] = useState<{ user: string; system: string }>({
    user: initialFolder || 'root',
    system: 'root'
  })
  const [files, setFiles] = useState<{ user: FileItem[]; system: FileItem[] }>({
    user: [],
    system: []
  })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isLoadingFolders, setIsLoadingFolders] = useState(false)
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [meta, setMeta] = useState<Record<SourceType, { page: number; totalPages: number }>>({
    user: { page: 1, totalPages: 1 },
    system: { page: 1, totalPages: 1 }
  })
  const pageLimitOptions: Array<40 | 80 | 160> = [40, 80, 160]
  const [pageLimit, setPageLimit] = useState<Record<SourceType, 40 | 80 | 160>>({
    user: 40,
    system: 40
  })
  const [multiSelection, setMultiSelection] = useState<Record<string, SelectedAsset>>({})
  const [svgPreviewCache, setSvgPreviewCache] = useState<Record<string, string>>({})
  const isMultiMode = selectionMode === 'multiple'
  const selectedAssets = useMemo(() => Object.values(multiSelection), [multiSelection])
  const selectedCount = selectedAssets.length
  const activeLimit = pageLimit[activeSource]

  useEffect(() => {
    if (!isOpen) return
    loadFolders(activeSource)
  }, [isOpen, activeSource])

  useEffect(() => {
    if (!isOpen) return
    loadFiles(activeSource, currentFolder[activeSource], meta[activeSource].page, activeLimit)
  }, [isOpen, activeSource, currentFolder, meta[activeSource].page, activeLimit])

  useEffect(() => {
    if (!isOpen || !isMultiMode) {
      setMultiSelection({})
    }
  }, [isOpen, isMultiMode])

  useEffect(() => {
    if (activeSource !== 'system') {
      return
    }
    const list = files.system || []
    const targets = list.filter(file => isSystemSvgFile(file, 'system') && !svgPreviewCache[file.url])
    if (!targets.length) return

    let cancelled = false
    const controller = new AbortController()

    const loadSvgPreviews = async () => {
      for (const file of targets) {
        try {
          const response = await fetch(file.url, { signal: controller.signal })
          if (!response.ok) {
            throw new Error(`Failed to fetch ${file.url}`)
          }
          const text = await response.text()
          if (!cancelled) {
            setSvgPreviewCache(prev => ({
              ...prev,
              [file.url]: sanitizeSvgContent(text)
            }))
          }
        } catch (error) {
          if (!cancelled && (error instanceof Error) && error.name !== 'AbortError') {
            console.warn('加载SVG预览失败:', file.url)
            setSvgPreviewCache(prev => ({ ...prev, [file.url]: '' }))
          }
        }
      }
    }

    loadSvgPreviews()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [activeSource, files, svgPreviewCache])

  const getSelectionKey = (file: FileItem, source: SourceType) => {
    const identifier = file.path || file.url
    return `${source}:${identifier}`
  }

  const buildSelectedAsset = (file: FileItem, source: SourceType): SelectedAsset => ({
    url: file.url,
    name: file.name,
    source,
    folder: currentFolder[source] || 'root',
    type: file.mime_type || file.type
  })

  const toggleFileSelection = (file: FileItem, source: SourceType) => {
    const key = getSelectionKey(file, source)
    setMultiSelection(prev => {
      const next = { ...prev }
      if (next[key]) {
        delete next[key]
      } else {
        next[key] = buildSelectedAsset(file, source)
      }
      return next
    })
  }

  const handleConfirmMultiSelect = () => {
    if (!isMultiMode || !onSelectMultiple) return
    if (selectedCount === 0) {
      toast.error('请选择至少一个素材')
      return
    }

    onSelectMultiple(selectedAssets)
  }

  const loadFolders = async (source: SourceType) => {
    try {
      setIsLoadingFolders(true)
      if (source === 'user') {
        const response = await uploadApi.getFolders()
        if (response.success) {
          setFolderTree(prev => ({ ...prev, user: buildFolderTree(response.data) }))
        }
      } else {
        const response = await fetch('/api/system-default/folders', {
          credentials: 'include'
        }).then(res => res.json())
        if (response.success) {
          setFolderTree(prev => ({ ...prev, system: buildFolderTree(response.data) }))
        }
      }
    } catch (error) {
      console.error('加载素材目录失败', error)
      toast.error('加载目录失败，请稍后重试')
    } finally {
      setIsLoadingFolders(false)
    }
  }

  const loadFiles = async (source: SourceType, folder: string, page: number, limitOverride?: number) => {
    try {
      setIsLoadingFiles(true)
      const limitValue = limitOverride || pageLimit[source]
      if (source === 'user') {
        const response = await uploadApi.getFiles({
          folder: folder || 'root',
          page,
          limit: limitValue
        })
        if (response.success) {
          setFiles(prev => ({ ...prev, user: response.data || [] }))
          setMeta(prev => ({
            ...prev,
            user: {
              page,
              totalPages: (response as any)?.meta?.total_pages || 1
            }
          }))
        }
      } else {
        const params = new URLSearchParams({
          folder: folder || 'root',
          page: page.toString(),
          limit: limitValue.toString()
        })
        const response = await fetch(`/api/system-default/files?${params.toString()}`, {
          credentials: 'include'
        }).then(res => res.json())
        if (response.success) {
          setFiles(prev => ({ ...prev, system: response.data || [] }))
          setMeta(prev => ({
            ...prev,
            system: {
              page,
              totalPages: response.meta?.total_pages || 1
            }
          }))
        }
      }
    } catch (error) {
      console.error('加载素材失败', error)
      toast.error('加载素材失败，请稍后重试')
    } finally {
      setIsLoadingFiles(false)
    }
  }

  const handleFolderSelect = (folderPath: string) => {
    setCurrentFolder(prev => ({ ...prev, [activeSource]: folderPath }))
    setMeta(prev => ({ ...prev, [activeSource]: { page: 1, totalPages: prev[activeSource].totalPages } }))
  }

  const handlePageChange = (direction: 'prev' | 'next') => {
    setMeta(prev => {
      const sourceMeta = prev[activeSource]
      const targetPage = direction === 'prev' ? sourceMeta.page - 1 : sourceMeta.page + 1
      if (targetPage < 1 || targetPage > sourceMeta.totalPages) return prev
      return {
        ...prev,
        [activeSource]: {
          ...sourceMeta,
          page: targetPage
        }
      }
    })
  }

  const filteredFiles = useMemo(() => {
    const list = files[activeSource] || []
    if (!searchTerm) return list
    return list.filter(file => file.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [files, activeSource, searchTerm])

  const uploadFilesToCurrentFolder = async (filesToUpload: File[]) => {
    if (!filesToUpload.length) return
    if (activeSource !== 'user') {
      toast.error('仅支持上传到“用户素材”')
      return
    }
    const targetFolder = currentFolder.user || 'root'
    try {
      setIsUploading(true)
      for (let i = 0; i < filesToUpload.length; i += 1) {
        const file = filesToUpload[i]
        setUploadProgress(0)
        const uploader = file.type?.startsWith('image/') ? uploadApi.image : uploadApi.file
        await uploader(
          file,
          progress => setUploadProgress(progress),
          targetFolder !== 'root' ? targetFolder : undefined
        )
      }
      toast.success(`成功上传 ${filesToUpload.length} 个文件`)
      await loadFiles('user', targetFolder, 1, activeLimit)
      setCurrentFolder(prev => ({ ...prev, user: targetFolder }))
      setMeta(prev => ({ ...prev, user: { page: 1, totalPages: prev.user.totalPages } }))
    } catch (error) {
      console.error('上传素材失败', error)
      toast.error('上传失败，请稍后重试')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleUploadInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (!fileList || !fileList.length) return
    await uploadFilesToCurrentFolder(Array.from(fileList))
  }

  const renderSystemIconPreview = (file: FileItem) => {
    const markup = svgPreviewCache[file.url]
    if (markup === '') {
      return (
        <div className="w-full h-full flex items-center justify-center text-theme-textSecondary">
          <ImageIcon className="w-7 h-7" />
        </div>
      )
    }
    if (!markup) {
      return (
        <div className="w-full h-full flex items-center justify-center text-theme-textSecondary">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      )
    }
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ color: 'var(--color-text-primary, #e2e8f0)', lineHeight: 0 }}
      >
        <div
          className="w-20 h-20 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:object-contain"
          dangerouslySetInnerHTML={{ __html: markup }}
        />
      </div>
    )
  }

  if (!isOpen) return null

  const renderFolderNode = (folder: FolderItem, level = 0) => (
    <div key={folder.path} className="space-y-1">
      <button
        className={`flex items-center w-full px-2 py-1 text-sm rounded ${
          currentFolder[activeSource] === folder.path
            ? 'bg-tech-accent text-white'
            : 'text-theme-textSecondary hover:bg-theme-surface'
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => handleFolderSelect(folder.path)}
      >
        <Folder className="w-4 h-4 mr-2" />
        {folder.name}
      </button>
      {folder.children && folder.children.length > 0 && (
        <div className="ml-2 space-y-1">
          {folder.children.map(child => renderFolderNode(child, level + 1))}
        </div>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="w-full max-w-5xl rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden text-theme-text border border-semantic-panelBorder"
        style={{ backgroundColor: 'var(--semantic-panel-bg, #0f172a)' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-semantic-dividerStrong bg-theme-surfaceAlt">
          <div>
            <h2 className="text-lg font-semibold text-theme-text">选择素材</h2>
            <p className="text-sm text-theme-textSecondary">从用户素材或系统默认素材中选择图片 / 图标</p>
          </div>
          <button className="p-2 text-theme-textSecondary hover:text-theme-text" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pt-4 flex space-x-4">
          {(['user', 'system'] as SourceType[]).map(source => (
            <button
              key={source}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activeSource === source
                  ? 'bg-tech-accent text-white shadow-[0_6px_18px_rgba(14,165,233,0.35)]'
                  : 'bg-theme-surfaceAlt text-theme-textSecondary hover:text-theme-text'
              }`}
              onClick={() => setActiveSource(source)}
            >
              {source === 'user' ? '用户素材' : '系统默认素材'}
            </button>
          ))}
        </div>

        <div className="px-6 py-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-textSecondary" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索素材..."
                className="w-full pl-10 pr-4 py-2 border border-theme-divider rounded-lg bg-theme-surface text-theme-text theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-theme-textSecondary">
              <span>每页数量</span>
              <select
                value={activeLimit}
                onChange={(e) => {
                  const newLimit = parseInt(e.target.value, 10) as 40 | 80 | 160
                  setPageLimit(prev => ({ ...prev, [activeSource]: newLimit }))
                  setMeta(prev => ({
                    ...prev,
                    [activeSource]: { ...prev[activeSource], page: 1 }
                  }))
                  loadFiles(activeSource, currentFolder[activeSource], 1, newLimit)
                }}
                className="px-3 py-1 border border-theme-divider rounded bg-theme-surface text-theme-textSecondary focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                style={{
                  backgroundColor: 'var(--semantic-panel-bg, var(--color-surface, #0f172a))',
                  color: 'var(--color-text-primary, #e2e8f0)',
                  borderColor: 'var(--semantic-panel-border, var(--color-border, #334155))'
                }}
              >
                {pageLimitOptions.map(limit => (
                  <option
                    key={limit}
                    value={limit}
                    style={{
                      backgroundColor: 'var(--semantic-panel-bg, var(--color-surface, #0f172a))',
                      color: 'var(--color-text-primary, #e2e8f0)'
                    }}
                  >
                    {limit} 项/页
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  if (activeSource !== 'user') {
                    toast.error('仅支持上传到“用户素材”')
                    return
                  }
                  fileInputRef.current?.click()
                }}
                className="ml-3 inline-flex items-center px-3 py-2 text-xs rounded border border-theme-divider bg-theme-surface text-theme-textSecondary hover:text-theme-text hover:bg-theme-surfaceAlt transition-colors disabled:opacity-50"
                disabled={isUploading}
              >
                {isUploading ? `上传中 ${uploadProgress}%` : '上传素材'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleUploadInputChange}
              />
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-4 max-h-[60vh]">
          <div
            className="w-64 rounded-lg border border-theme-divider p-3 overflow-y-auto"
            style={{ backgroundColor: 'var(--semantic-muted-bg, var(--semantic-panel-bg, #0f172a))' }}
          >
            <h3 className="text-sm font-semibold text-theme-text mb-3 flex items-center">
              <Folder className="w-4 h-4 mr-2" />
              目录
            </h3>
            {isLoadingFolders ? (
              <div className="flex items-center justify-center h-32 text-theme-textSecondary">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                加载中...
              </div>
            ) : (
              <div className="space-y-1">
                {(folderTree[activeSource] || defaultTree).map(folder => renderFolderNode(folder))}
              </div>
            )}
          </div>

          <div
            className="flex-1 rounded-lg border border-theme-divider p-4 overflow-y-auto"
            style={{ backgroundColor: 'var(--semantic-muted-bg, var(--semantic-panel-bg, #0f172a))' }}
          >
            {isLoadingFiles ? (
              <div className="flex items-center justify-center h-full text-theme-textSecondary">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                加载中...
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-theme-textSecondary">
                <ImageIcon className="w-10 h-10 mb-2" />
                <p>当前目录暂无素材</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredFiles.map(file => {
                  const selectionKey = getSelectionKey(file, activeSource)
                  const isSelected = Boolean(multiSelection[selectionKey])
                  return (
                    <button
                      key={file.path || file.url}
                      className={`relative bg-theme-surface rounded-xl border ${
                        isSelected
                          ? 'border-tech-accent ring-2 ring-tech-accent/40'
                          : 'border-theme-divider'
                      } shadow-sm hover:shadow transition-shadow overflow-hidden text-left`}
                      onClick={() => {
                        if (isMultiMode) {
                          toggleFileSelection(file, activeSource)
                        } else {
                          onSelect(buildSelectedAsset(file, activeSource))
                          onClose()
                        }
                      }}
                    >
                      {isMultiMode && (
                        <div
                          className={`absolute top-2 right-2 w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                            isSelected
                              ? 'bg-tech-accent border-tech-accent text-white'
                              : 'bg-theme-surface border-theme-divider text-theme-textSecondary'
                          }`}
                        >
                          ✓
                        </div>
                      )}
                      <div className="h-32 bg-theme-surfaceAlt flex items-center justify-center overflow-hidden">
                        {isSystemSvgFile(file, activeSource) ? (
                          renderSystemIconPreview(file)
                        ) : isImageFile(file) ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center text-theme-textSecondary">
                            <ImageIcon className="w-8 h-8 mb-2" />
                            <span className="text-xs">{file.type || '文件'}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-theme-text truncate">{file.name}</p>
                        <p className="text-xs text-theme-textSecondary mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {isMultiMode && (
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-theme-textSecondary">已选择 {selectedCount} 个素材</span>
                <div className="space-x-2">
                  <button
                    className="px-3 py-1 text-sm border border-theme-divider rounded bg-theme-surface text-theme-textSecondary hover:text-theme-text disabled:opacity-50"
                    onClick={() => setMultiSelection({})}
                    disabled={selectedCount === 0}
                  >
                    清空
                  </button>
                  <button
                    className="px-3 py-1 text-sm bg-tech-accent text-white rounded disabled:opacity-50"
                    onClick={handleConfirmMultiSelect}
                    disabled={selectedCount === 0 || !onSelectMultiple}
                  >
                    添加素材
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-theme-textSecondary">
                第 {meta[activeSource].page} / {meta[activeSource].totalPages} 页
              </span>
              <div className="space-x-2">
                <button
                  className="px-3 py-1 text-sm border border-theme-divider rounded bg-theme-surface text-theme-textSecondary hover:text-theme-text disabled:opacity-50"
                  onClick={() => handlePageChange('prev')}
                  disabled={meta[activeSource].page <= 1}
                >
                  上一页
                </button>
                <button
                  className="px-3 py-1 text-sm border border-theme-divider rounded bg-theme-surface text-theme-textSecondary hover:text-theme-text disabled:opacity-50"
                  onClick={() => handlePageChange('next')}
                  disabled={meta[activeSource].page >= meta[activeSource].totalPages}
                >
                  下一页
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssetPickerModal
