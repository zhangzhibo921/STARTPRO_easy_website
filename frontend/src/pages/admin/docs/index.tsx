import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/AdminLayout'
import { docsApi } from '@/utils/api'
import type { Doc, DocNode } from '@/types'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import DocTreePanel from '@/components/docs/DocTreePanel'
import DocForm from '@/components/docs/DocForm'

export default function DocsListPage() {
  const router = useRouter()
  const [tree, setTree] = useState<DocNode[]>([])
  const [treeLoading, setTreeLoading] = useState(false)

  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<DocNode | null>(null)
  const [docLoading, setDocLoading] = useState(false)
  const [docError, setDocError] = useState<string | null>(null)

  const [currentParent, setCurrentParent] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [searchResult, setSearchResult] = useState<Doc | null>(null)

  const fetchTree = async () => {
    try {
      setTreeLoading(true)
      const res = await docsApi.getTree()
      if (res.success) {
        setTree(res.data || [])
      }
    } catch (error) {
      console.error('获取目录失败', error)
    } finally {
      setTreeLoading(false)
    }
  }

  const fetchDoc = async (id: number) => {
    try {
      setDocLoading(true)
      setDocError(null)
      const res = await docsApi.getById(id)
      if (res.success) {
        setSelectedDoc(res.data as Doc)
      } else {
        setDocError(res.message || '加载文档失败')
      }
    } catch (error) {
      console.error('加载文档失败', error)
      setDocError('加载文档失败')
    } finally {
      setDocLoading(false)
    }
  }

  const handleSelectNode = (node: DocNode | null) => {
    if (!node) {
      setSelectedDoc(null)
      setSelectedFolder(null)
      setCurrentParent(null)
      return
    }
    if (node.type === 'folder') {
      setSelectedDoc(null)
      setSelectedFolder(node)
      setCurrentParent(node.id)
      return
    }
    setSelectedFolder(null)
    setCurrentParent(node.parent_id ?? null)
    fetchDoc(node.id)
  }

  useEffect(() => {
    fetchTree()
  }, [])

  useEffect(() => {
    const selectId = router.query.select ? Number(router.query.select) : null
    if (selectId) {
      fetchDoc(selectId)
    }
  }, [router.query.select])

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定删除该文档？删除后无法恢复')) return
    try {
      await docsApi.delete(id)
      toast.success('删除成功')
      setSelectedDoc(null)
      fetchTree()
    } catch (error) {
      console.error('删除文档失败', error)
      toast.error('删除失败')
    }
  }

  const handleUpdate = async (payload: Partial<Doc> & { status: 'draft' | 'published' }) => {
    if (!selectedDoc) return
    await docsApi.update(selectedDoc.id, payload)
    toast.success('更新成功')
    fetchTree()
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!search.trim()) {
      setSearchResult(null)
      return
    }
    try {
      // 简单按 slug 精确匹配或标题包含
      const res = await docsApi.list({ page: 1, limit: 1, search: search.trim() })
      if (res.success && res.data?.length) {
        const doc = res.data[0]
        setSearchResult(doc as Doc)
        fetchDoc(doc.id)
      } else {
        toast.error('未找到匹配的文档')
      }
    } catch (error) {
      toast.error('搜索失败')
    }
  }

  const detailTime = useMemo(() => {
    if (!selectedDoc) return null
    return {
      updated: selectedDoc.updated_at ? format(new Date(selectedDoc.updated_at), 'yyyy-MM-dd HH:mm') : '-',
      created: selectedDoc.created_at ? format(new Date(selectedDoc.created_at), 'yyyy-MM-dd HH:mm') : '-'
    }
  }, [selectedDoc])

  const handlePreview = (slug: string) => {
    if (!slug) return
    window.open(`/docs/${slug}`, '_blank')
  }

  return (
    <AdminLayout title="文档中心" description="管理文档目录与内容">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-theme-text">文档中心</h1>
          <p className="text-theme-textSecondary">管理文档目录、状态与内容</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/docs/create${currentParent ? `?parent_id=${currentParent}` : ''}`}
            className="px-3 py-2 rounded-md bg-semantic-hero-accent text-white shadow hover:opacity-90 transition text-sm"
          >
            新建文档
          </Link>
          <Link
            href={`/admin/docs/create?type=folder`}
            className="px-3 py-2 rounded-md bg-theme-surfaceAlt border border-theme-divider text-theme-text hover:bg-theme-surface transition text-sm"
          >
            新建文件夹
          </Link>
        </div>
      </div>

      <form onSubmit={handleSearch} className="mb-4 flex flex-col sm:flex-row gap-3">
        <input
          className="theme-input w-full text-sm rounded-lg h-10"
          placeholder="搜索标题或 slug"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ borderRadius: 10 }}
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center px-4 h-10 rounded-lg bg-theme-surfaceAlt border border-theme-divider text-theme-text hover:bg-theme-surface text-sm sm:w-auto whitespace-nowrap"
        >
          搜索
        </button>
      </form>

      <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-4 min-w-0">
        <div className="order-2 xl:order-1 min-w-0">
          <DocTreePanel
            tree={tree}
            loading={treeLoading}
            selectedDocId={selectedDoc?.id ?? null}
            onSelectDoc={handleSelectNode}
            onRefresh={fetchTree}
          />
        </div>

        <div className="order-1 xl:order-2 space-y-3 min-w-0">
          {docLoading && <div className="text-theme-textSecondary text-sm">加载文档...</div>}
          {docError && <div className="text-red-500 text-sm">{docError}</div>}
          {!selectedDoc && !selectedFolder && !docLoading && (
            <div className="text-theme-textSecondary text-sm">
              {searchResult ? '已选中文档，请稍候加载...' : '请选择左侧目录中的文档或目录'}
            </div>
          )}

          {selectedFolder && (
            <div className="space-y-3">
              <div className="rounded-lg bg-theme-surface p-4 space-y-3 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm text-theme-text">目录名称</label>
                    <input
                      className="theme-input w-full rounded-lg"
                      style={{ borderRadius: 10 }}
                      value={selectedFolder.title}
                      onChange={(e) =>
                        setSelectedFolder((prev) => (prev ? { ...prev, title: e.target.value } : prev))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-theme-text">路径</label>
                    <input
                      className="theme-input w-full rounded-lg"
                      style={{ borderRadius: 10 }}
                      value={selectedFolder.slug}
                      onChange={(e) =>
                        setSelectedFolder((prev) => (prev ? { ...prev, slug: e.target.value } : prev))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-theme-text">排序</label>
                  <input
                    type="number"
                    className="theme-input w-full rounded-lg"
                    style={{ borderRadius: 10 }}
                    value={selectedFolder.sort_order ?? 0}
                    onChange={(e) =>
                      setSelectedFolder((prev) => (prev ? { ...prev, sort_order: Number(e.target.value) } : prev))
                    }
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="px-3 py-2 rounded-md bg-theme-surfaceAlt border border-theme-divider text-theme-text hover:bg-theme-surface text-sm"
                    onClick={async () => {
                      if (!selectedFolder) return
                      await docsApi.update(selectedFolder.id, {
                        title: selectedFolder.title,
                        slug: selectedFolder.slug,
                        sort_order: selectedFolder.sort_order ?? 0,
                        type: 'folder'
                      })
                      toast.success('保存成功')
                      fetchTree()
                    }}
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedDoc && !docLoading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-theme-textSecondary">
                    更新时间：{detailTime?.updated} ｜ 创建时间：{detailTime?.created}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(selectedDoc.id)}
                  className="text-red-500 text-sm underline-offset-2 hover:underline"
                >
                  删除
                </button>
              </div>

              <DocForm
                parentTree={tree}
                initialData={selectedDoc}
                onSubmit={handleUpdate}
                excludeId={selectedDoc.id}
                submitting={false}
                onPreview={handlePreview}
              />
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
