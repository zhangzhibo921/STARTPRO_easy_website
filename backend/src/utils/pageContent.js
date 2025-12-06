// Simple helpers to keep pages routes slimmer and ensure consistent HTML generation

const escapeHtml = (value) => {
  if (value === null || value === undefined) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const wrapSection = (className, inner) => `<section class="${className}">${inner}</section>`
const renderHeading = (tag, text) => (text ? `<${tag}>${escapeHtml(text)}</${tag}>` : '')
const renderParagraph = (text) => (text ? `<p>${escapeHtml(text)}</p>` : '')
const renderList = (items) =>
  Array.isArray(items) && items.length > 0
    ? `<ul>${items.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`
    : ''

// 将 <style> 中的选择器加上作用域前缀，避免污染全局
const scopeStylesToClass = (html, scopeClass) => {
  if (!html || html.indexOf('<style') === -1) return html
  const prefixSelectors = (css) => {
    css = css.replace(/@media[^{]*{([\s\S]*?)}/gi, (m, inner) => {
      const prefixed = prefixSelectors(inner)
      return m.replace(inner, prefixed)
    })
    return css.replace(/(^|})([^@{}][^{}]*?){/g, (_m, sep, selectors) => {
      const scopedSelectors = selectors
        .split(',')
        .map((s) => {
          const trimmed = s.trim()
          if (!trimmed) return ''
          if (trimmed.includes(scopeClass)) return trimmed
          return `.${scopeClass} ${trimmed}`
        })
        .filter(Boolean)
        .join(', ')
      return `${sep}${scopedSelectors} {`
    })
  }

  try {
    return html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_match, css) => {
      const transformed = prefixSelectors(css)
      return `<style>${transformed}</style>`
    })
  } catch (err) {
    console.error('Raw HTML scoping failed:', err)
    // 遇到异常时，移除 <style> 避免污染
    return html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  }
}

// Basic renderers (kept concise; align with frontend list for consistency)
const renderers = {
  'hero': (c) => {
    const p = c.props || {}
    const bg = p.backgroundImage ? ` style="background-image:url('${escapeHtml(p.backgroundImage)}')"` : ''
    const btn = p.buttonText ? `<a class="hero-button" href="${escapeHtml(p.buttonLink || '#')}">${escapeHtml(p.buttonText)}</a>` : ''
    return wrapSection(
      'hero-section',
      `<div class="hero-content"${bg}>${renderHeading('h1', p.title)}${renderParagraph(p.subtitle)}${btn}</div>`
    )
  },
  'text-block': (c) => {
    const p = c.props || {}
    return wrapSection('text-block', `${renderHeading('h2', p.title)}${p.content ? `<div class="text-body">${p.content}</div>` : ''}`)
  },
  'image-block': (c) => {
    const p = c.props || {}
    return wrapSection(
      'image-block',
      `<figure>${p.src ? `<img src="${escapeHtml(p.src)}" alt="${escapeHtml(p.alt || '')}" />` : ''}${
        p.caption ? `<figcaption>${escapeHtml(p.caption)}</figcaption>` : ''
      }</figure>`
    )
  },
  'feature-grid': (c) => {
    const p = c.props || {}
    const items = (p.features || [])
      .map(
        (f) => `<div class="feature-item">${renderHeading('h3', f.title)}${renderParagraph(f.description)}</div>`
      )
      .join('')
    return wrapSection(
      'feature-grid',
      `${renderHeading('h2', p.title)}${renderParagraph(p.subtitle)}<div class="feature-grid__items">${items}</div>`
    )
  },
  'feature-grid-large': (c) => renderers['feature-grid'](c),
  'pricing-cards': (c) => {
    const p = c.props || {}
    const items = (p.plans || [])
      .map(
        (plan) => `<div class="price-card${plan.recommended ? ' price-card--featured' : ''}">
      ${renderHeading('h3', plan.name)}
      <div class="price-card__price">${escapeHtml(plan.price || '0')}${plan.period ? `/${escapeHtml(plan.period)}` : ''}</div>
      ${renderList(plan.features)}
    </div>`
      )
      .join('')
    return wrapSection(
      'pricing-section',
      `${renderHeading('h2', p.title)}${renderParagraph(p.subtitle)}<div class="pricing-grid">${items}</div>`
    )
  },
  'contact-form': (c) => {
    const p = c.props || {}
    const inputs = (p.fields || [])
      .map((field) => {
        const req = field.required ? ' required' : ''
        if (field.type === 'textarea') {
          return `<div class="form-group"><label>${escapeHtml(field.label || field.name || '')}${
            field.required ? ' *' : ''
          }</label><textarea name="${escapeHtml(field.name || '')}"${req}></textarea></div>`
        }
        return `<div class="form-group"><label>${escapeHtml(field.label || field.name || '')}${
          field.required ? ' *' : ''
        }</label><input type="${escapeHtml(field.type || 'text')}" name="${escapeHtml(field.name || '')}"${req} /></div>`
      })
      .join('')
    return wrapSection(
      'contact-form',
      `${renderHeading('h2', p.title)}${renderParagraph(p.subtitle)}<form>${inputs}<button type="submit">提交</button></form>`
    )
  },
  'team-grid': (c) => {
    const p = c.props || {}
    const items = (p.members || [])
      .map(
        (m) => `<div class="team-member">
      ${m.avatar ? `<img src="${escapeHtml(m.avatar)}" alt="${escapeHtml(m.name || '')}" />` : ''}
      ${renderHeading('h3', m.name)}
      ${m.role ? `<p class="team-member__role">${escapeHtml(m.role)}</p>` : ''}
      ${renderParagraph(m.bio)}
    </div>`
      )
      .join('')
    return wrapSection(
      'team-grid',
      `${renderHeading('h2', p.title)}${renderParagraph(p.subtitle)}<div class="team-grid__items">${items}</div>`
    )
  },
  'call-to-action': (c) => {
    const p = c.props || {}
    const btn = p.buttonText ? `<a class="cta-button" href="${escapeHtml(p.buttonLink || '#')}">${escapeHtml(p.buttonText)}</a>` : ''
    const style = p.backgroundColor ? ` style="background-color:${escapeHtml(p.backgroundColor)}"` : ''
    return wrapSection(
      'call-to-action',
      `<div class="cta-content"${style}>${renderHeading('h2', p.title)}${renderParagraph(p.subtitle)}${btn}</div>`
    )
  },
  'faq-section': (c) => {
    const p = c.props || {}
    const items = (p.faqs || [])
      .map((faq) => `<div class="faq-item">${renderHeading('h3', faq.question)}${renderParagraph(faq.answer)}</div>`)
      .join('')
    return wrapSection('faq-section', `${renderHeading('h2', p.title)}${renderParagraph(p.subtitle)}${items}`)
  },
  'stats-section': (c) => {
    const p = c.props || {}
    const items = (p.stats || [])
      .map(
        (s) => `<div class="stat-item">
      ${renderHeading('h3', s.label)}
      <p class="stat-value">${escapeHtml(s.value || '')}</p>
      ${renderParagraph(s.description)}
    </div>`
      )
      .join('')
    return wrapSection(
      'stats-section',
      `${renderHeading('h2', p.title)}${renderParagraph(p.subtitle)}<div class="stats-grid">${items}</div>`
    )
  },
  'timeline': (c) => {
    const p = c.props || {}
    const items = (p.events || [])
      .map(
        (event) => `<div class="timeline-item">
      ${renderHeading('h3', event.title)}
      ${event.date ? `<p class="timeline-date">${escapeHtml(event.date)}</p>` : ''}
      ${renderParagraph(event.description)}
    </div>`
      )
      .join('')
    return wrapSection('timeline', `${renderHeading('h2', p.title)}${renderParagraph(p.subtitle)}<div class="timeline-items">${items}</div>`)
  },
  'cyber-timeline': (c) => renderers['timeline'](c),
  'cyber-showcase': (c) => {
    const p = c.props || {}
    const cards = (p.items || [])
      .map(
        (item) => `<div class="cyber-showcase__item">
      ${renderHeading('h3', item.title)}
      ${renderParagraph(item.description)}
      ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title || '')}" />` : ''}
    </div>`
      )
      .join('')
    return wrapSection(
      'cyber-showcase',
      `${renderHeading('h2', p.title)}${renderParagraph(p.subtitle)}<div class="cyber-showcase__grid">${cards}</div>`
    )
  },
  'cyber-super-card': (c) => {
    const p = c.props || {}
    return wrapSection(
      'cyber-super-card',
      `<div class="cyber-super-card__body">${renderHeading('h2', p.title)}${renderParagraph(p.subtitle)}${
        p.content ? `<div class="cyber-super-card__content">${p.content}</div>` : ''
      }${p.image ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title || '')}" />` : ''}</div>`
    )
  },
  'testimonials': (c) => {
    const p = c.props || {}
    const items = (p.testimonials || [])
      .map(
        (t) => `<blockquote class="testimonial">${renderParagraph(t.quote)}${t.author ? `<cite>${escapeHtml(t.author)}</cite>` : ''}</blockquote>`
      )
      .join('')
    return wrapSection('testimonials', `${renderHeading('h2', p.title)}${renderParagraph(p.subtitle)}${items}`)
  },
  'news-list': (c) => {
    const p = c.props || {}
    const list = (p.items || [])
      .map(
        (n) => `<article class="news-item">${renderHeading('h3', n.title)}${
          n.date ? `<p class="news-date">${escapeHtml(n.date)}</p>` : ''
        }${renderParagraph(n.excerpt || n.summary)}</article>`
      )
      .join('')
    return wrapSection('news-list', `${renderHeading('h2', p.title)}${renderParagraph(p.subtitle)}${list}`)
  },
  'service-grid': (c) => {
    const p = c.props || {}
    const items = (p.services || [])
      .map((s) => `<div class="service-card">${renderHeading('h3', s.title)}${renderParagraph(s.description)}</div>`)
      .join('')
    return wrapSection('service-grid', `${renderHeading('h2', p.title)}${renderParagraph(p.subtitle)}<div class="service-grid__items">${items}</div>`)
  },
  'logo-wall': (c) => {
    const p = c.props || {}
    const items = (p.logos || []).map((logo) => `<div class="logo-item">${logo ? `<img src="${escapeHtml(logo)}" alt="logo" />` : ''}</div>`).join('')
    return wrapSection('logo-wall', `<div class="logo-wall__items">${items}</div>`)
  },
  'logo-scroll': (c) => {
    const p = c.props || {}
    const items = (p.logos || []).map((logo) => `<div class="logo-scroll__item">${logo ? `<img src="${escapeHtml(logo)}" alt="logo" />` : ''}</div>`).join('')
    return wrapSection('logo-scroll', `<div class="logo-scroll__track">${items}</div>`)
  },
  'link-block': (c) => {
    const p = c.props || {}
    const items = (p.links || [])
      .map((link) => `<li><a href="${escapeHtml(link.href || '#')}">${escapeHtml(link.label || link.text || '')}</a></li>`)
      .join('')
    return wrapSection('link-block', `${renderHeading('h3', p.title)}<ul class="link-block__list">${items}</ul>`)
  },
  'video-player': (c) => {
    const p = c.props || {}
    return wrapSection(
      'video-player',
      `${renderHeading('h2', p.title)}${renderParagraph(p.description)}<video controls ${
        p.poster ? `poster="${escapeHtml(p.poster)}"` : ''
      }>${p.url ? `<source src="${escapeHtml(p.url)}" />` : ''}</video>`
    )
  },
  'raw-html': (c) => {
    const p = c.props || {}
    const html = p.html || ''
    const baseClass = p.className || 'raw-html-block'
    // 复杂 HTML 保持原样，不做样式作用域，避免破坏全局选择器/脚本
    return wrapSection(`${baseClass} raw-html-section`, html)
  },
  // Premium variants reuse base renderers
  'premium-hero': (c) => renderers['hero'](c),
  'premium-feature-grid': (c) => renderers['feature-grid'](c),
  'premium-stats': (c) => renderers['stats-section'](c),
  'premium-testimonials': (c) => renderers['testimonials'](c),
  'premium-showcase': (c) => renderers['text-block'](c),
  'premium-partners': (c) => renderers['team-grid'](c),
  'premium-pricing': (c) => renderers['pricing-cards'](c)
}

const generateHtmlFromComponents = (components) => {
  if (!Array.isArray(components) || components.length === 0) return ''
  return components
    .map((component) => {
      const renderer = renderers[component.type]
      if (!renderer) return `<!-- Unknown component: ${component.type} -->`
      try {
        return renderer(component) || `<!-- Empty component: ${component.type} -->`
      } catch (err) {
        console.error('Component render failed', component?.type, err)
        return `<!-- Render error: ${component.type} -->`
      }
    })
    .join('\n\n')
}

const parseTemplateData = (raw) => {
  if (!raw) return null
  if (typeof raw === 'object') return raw
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw)
    } catch (err) {
      console.error('parseTemplateData error', err)
      return null
    }
  }
  return null
}

module.exports = {
  generateHtmlFromComponents,
  parseTemplateData
}
