import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/AdminLayout'
import DocForm from '@/components/docs/DocForm'
import { docsApi } from '@/utils/api'
import type { Doc, DocNode } from '@/types'
import toast from 'react-hot-toast'

export default function EditDocPage() {
  const router = useRouter()
  const { id } = router.query
  const [doc, setDoc] = useState<Doc | null>(null)
  const [tree, setTree] = useState<DocNode[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchData = async () => {
    if (!id) return
    try {
      setLoading(true)
      const [docRes, treeRes] = await Promise.all([
        docsApi.getById(id as string),
        docsApi.getTree()
      ])
      if (docRes.success) {
        setDoc(docRes.data)
      }
      if (treeRes.success) {
        setTree(treeRes.data || [])
      }
    } catch (error) {
      console.error('加载文档失败', error)
      toast.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleSubmit = async (payload: Partial<Doc>) => {
    if (!id) return
    try {
      setSubmitting(true)
      const res = await docsApi.update(id as string, payload)
      if (res.success) {
        toast.success('更新成功')
        fetchData()
      }
    } catch (error) {
      console.error('更新文档失败', error)
      toast.error('更新失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePreview = (slug: string) => {
    window.open(`/docs/${slug}`, '_blank')
  }

  if (loading) {
    return (
      <AdminLayout title="编辑文档">
        <div className="text-theme-textSecondary">加载中...</div>
      </AdminLayout>
    )
  }

  if (!doc) {
    return (
      <AdminLayout title="编辑文档">
        <div className="text-theme-textSecondary">文档不存在</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title={`编辑：${doc.title}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-theme-text">编辑文档</h1>
          <p className="text-theme-textSecondary">ID：{doc.id}</p>
        </div>
      </div>

      <div className="bg-theme-surface border border-theme-divider rounded-lg p-6">
        <DocForm
          parentTree={tree}
          initialData={doc}
          onSubmit={handleSubmit}
          submitting={submitting}
          excludeId={doc.id}
          onPreview={handlePreview}
        />
      </div>
    </AdminLayout>
  )
}
