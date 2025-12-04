import dynamic from 'next/dynamic'
import type { CustomEditorRenderer } from './editorRenderers'
import { customEditors } from './editorRenderers'

// 当前注册表：保持路径不变，后续需要懒加载时可按需替换为 dynamic import
// 这里预留 dynamic 包装，方便后续扩展，不影响现有行为
const withIdentity = (renderer: CustomEditorRenderer) => renderer

export const editorRegistry: Partial<Record<string, CustomEditorRenderer>> = Object.entries(customEditors).reduce(
  (acc, [key, renderer]) => {
    if (renderer) {
      acc[key] = withIdentity(renderer)
    }
    return acc
  },
  {} as Partial<Record<string, CustomEditorRenderer>>
)

// 示例（未启用）：可以将某个编辑器改为懒加载
// acc['video-player'] = dynamic(() => import('./VideoEditor'), { ssr: false })

