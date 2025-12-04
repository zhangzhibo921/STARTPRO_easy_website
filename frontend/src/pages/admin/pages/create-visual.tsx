import React from 'react'
import { useRouter } from 'next/router'
import VisualPageEditor from '@/components/PageBuilder/VisualPageEditor'
import { pagesApi } from '@/utils/api'
import toast from 'react-hot-toast'

export default function CreateVisualPage() {
  const router = useRouter()

  const handleSaveVisual = async (pageData: any) => {
    try {
      console.log('准备保存的页面数据:', pageData);
      // 准备要保存的数据
      const formData = {
        ...pageData,
        // 确保content字段不为空
        content: pageData.content || '<p>页面内容</p>',
        // 将组件数据保存到 template_data 字段
        template_data: JSON.stringify({
          components: pageData.components,
          template_id: pageData.template_id || null
        })
      }

      // 移除临时字段，已保存在template_data中
      delete formData.components

      console.log('发送到后端的表单数据:', formData);
      console.log('表单数据的keys:', Object.keys(formData));
      console.log('slug字段值:', formData.slug, '类型:', typeof formData.slug);

      const response = await pagesApi.create(formData)

      if (response.success) {
        toast.success('页面创建成功')
        router.push('/admin/pages')
      } else {
        console.log('后端返回错误:', response);
        toast.error(response.message || '创建失败')
      }
    } catch (error) {
      console.error('创建页面失败:', error)
      toast.error('创建失败，请稍后重试')
    }
  }

  const handleCancel = () => {
    router.push('/admin/pages')
  }

  return (
    <VisualPageEditor
      editMode="create"
      initialData={{
        title: '',
        slug: '',
        content: '',
        published: false,
        category: 'general',
        components: [],
        template_id: null
      }}
      onSave={handleSaveVisual}
      onCancel={handleCancel}
    />
  )
}
