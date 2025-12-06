import React, { useEffect, useRef } from 'react'

interface DocContentProps {
  title: string
  summary?: string | null
  html: string
}

export const DocContent: React.FC<DocContentProps> = ({ title, summary, html }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const copyText = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        return true
      }
    } catch (err) {
      // fallback below
    }
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      return true
    } catch (err) {
      return false
    }
  }

  useEffect(() => {
    const root = containerRef.current
    if (!root) return
    // 为所有 <pre> 添加复制按钮
    const pres = Array.from(root.querySelectorAll('pre'))
    pres.forEach((pre) => {
      if (pre.querySelector('.code-copy-btn')) return
      const btn = document.createElement('button')
      btn.className = 'code-copy-btn'
      btn.innerText = '复制'
      btn.addEventListener('click', async (e) => {
        e.stopPropagation()
        e.preventDefault()
        const codeEl = pre.querySelector('code')
        const codeText = codeEl?.textContent || pre.textContent || ''
        const ok = await copyText(codeText.trim())
        btn.innerText = ok ? '已复制' : '复制失败'
        setTimeout(() => (btn.innerText = '复制'), 1200)
      })
      pre.appendChild(btn)
    })
  }, [html])

  return (
    <div className="doc-main__inner">
      <header className="doc-header">
        <h1 className="doc-title">{title}</h1>
        {summary && <p className="doc-summary">{summary}</p>}
      </header>
      <div ref={containerRef} className="doc-html" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
