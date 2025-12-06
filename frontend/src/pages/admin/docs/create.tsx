import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/AdminLayout'
import DocForm from '@/components/docs/DocForm'
import DocTreePanel from '@/components/docs/DocTreePanel'
import { docsApi } from '@/utils/api'
import type { DocNode, Doc } from '@/types'
import toast from 'react-hot-toast'

export default function CreateDocPage() {
  const router = useRouter()
  const { type, parent_id } = router.query
  const isFolder = useMemo(() => type === 'folder', [type])

  const [tree, setTree] = useState<DocNode[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [sortOrder, setSortOrder] = useState(0)

  const fetchTree = async () => {
    try {
      const res = await docsApi.getTree()
      if (res.success) {
        setTree(res.data || [])
      }
    } catch (error) {
      console.error('加载目录树失败', error)
      toast.error('加载目录树失败')
    }
  }

  useEffect(() => {
    fetchTree()
  }, [])

  const handleSubmitDoc = async (payload: Partial<Doc>) => {
    try {
      setSubmitting(true)
      const res = await docsApi.create(payload)
      if (res.success) {
        toast.success('创建成功')
        router.push(`/admin/docs?select=${res.data?.id}`)
      }
    } catch (error) {
      console.error('创建文档失败', error)
      toast.error('创建失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !slug.trim()) {
      toast.error('标题和路径不能为空')
      return
    }
    try {
      setSubmitting(true)
      const res = await docsApi.create({
        title: title.trim(),
        slug: slug.trim(),
        parent_id: null,
        sort_order: sortOrder || 0,
        status: 'draft',
        type: 'folder',
        content: ''
      })
      if (res.success) {
        toast.success('文件夹创建成功')
        router.push(`/admin/docs?select=${res.data?.id || ''}`)
      }
    } catch (error) {
      console.error('创建文件夹失败', error)
      toast.error('创建失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePreview = (slugVal: string) => {
    window.open(`/docs/${slugVal}`, '_blank')
  }

  return (
    <AdminLayout title={isFolder ? '新建文件夹' : '新建文档'} description="创建文档中心内容">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-theme-text">{isFolder ? '新建文件夹' : '新建文档'}</h1>
      </div>

      {isFolder ? (
        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-4">
          <div className="bg-theme-surface border border-theme-divider rounded-lg p-3">
            <DocTreePanel tree={tree} loading={false} selectedDocId={null} onSelectDoc={() => {}} onRefresh={fetchTree} />
          </div>
          <div className="bg-theme-surface border border-theme-divider rounded-lg p-6 max-w-3xl space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-theme-text">名称</label>
              <input
                className="theme-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="输入文件夹名称"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-theme-text">Slug（路径）</label>
              <input
                className="theme-input"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="例如：product-a"
              />
              <p className="text-xs text-theme-textSecondary">自动创建介绍文档（路径：目录slug/index）</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-theme-text">排序</label>
              <input
                type="number"
                className="theme-input"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSubmitFolder}
                disabled={submitting}
                className="px-4 py-2 rounded-md bg-semantic-hero-accent text-white shadow hover:opacity-90 transition disabled:opacity-60"
              >
                保存
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/docs')}
                className="px-4 py-2 rounded-md bg-theme-surfaceAlt border border-theme-divider text-theme-text hover:bg-theme-surface transition"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-4">
          <div className="bg-theme-surface border border-theme-divider rounded-lg p-3">
            <DocTreePanel tree={tree} loading={false} selectedDocId={null} onSelectDoc={() => {}} onRefresh={fetchTree} />
          </div>
          <div className="bg-theme-surface border border-theme-divider rounded-lg p-6">
            <DocForm
              parentTree={tree}
              onSubmit={handleSubmitDoc}
              submitting={submitting}
              onPreview={handlePreview}
              initialData={{
                parent_id: parent_id ? Number(parent_id) : null,
                status: 'draft'
              }}
            />
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
