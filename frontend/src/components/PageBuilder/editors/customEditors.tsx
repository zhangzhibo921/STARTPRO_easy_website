import React from 'react'
import { CustomEditorProps } from './editorRenderers'
import { editorRegistry } from './registry'

export const renderCustomEditor = (props: CustomEditorProps) => {
  const editor = editorRegistry[props.component.type]
  if (!editor) return null
  return editor(props)
}
