import React from "react"
import { TemplateComponent } from "@/types/templates"
import { scopeStylesToClass } from "@/lib/pageContent/renderers/rawHtml"

export const RawHtmlPreview: React.FC<{ component: TemplateComponent }> = ({ component }) => {
  const html = component.props?.html || ""
  const baseClass = component.props?.className || "raw-html-block"
  const uniqueClass = `${baseClass}-${component.id || "instance"}`
  const scopedHtml = scopeStylesToClass(html, uniqueClass)
  const placeholder = `
    <div class="raw-html-placeholder">
      <p>在此处粘贴自定义 HTML。注意事项：</p>
      <ul>
        <li>资源引用请使用可访问的 URL，例如 /uploads/xxx 或 https://...</li>
        <li>避免 body/html/* 等全局选择器，样式会自动加上作用域前缀</li>
        <li>不要包含 &lt;script&gt;，仅支持静态 HTML/CSS</li>
      </ul>
    </div>
  `
  const content = scopedHtml && scopedHtml.trim() ? scopedHtml : placeholder

  return (
    <div className="p-4 min-h-[140px]">
      <div
        className={`prose dark:prose-invert max-w-none text-theme-textPrimary ${baseClass} ${uniqueClass}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}
