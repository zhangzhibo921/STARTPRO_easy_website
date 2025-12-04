import { escapeHtml, renderHeading, renderParagraph, wrapSection } from '../utils'

export const renderFeatureGrid = (component: any): string => {
  const { props = {} } = component
  const { title, subtitle, features = [] } = props
  const items = features
    .map((f: any) => `<div class="feature-item">
      ${renderHeading('h3', f.title)}
      ${renderParagraph(f.description)}
    </div>`)
    .join('')
  return wrapSection('feature-grid', `${renderHeading('h2', title)}${renderParagraph(subtitle)}<div class="feature-grid__items">${items}</div>`)
}

export const renderFeatureGridLarge = renderFeatureGrid

export const renderServiceGrid = (component: any): string => {
  const { props = {} } = component
  const { title, subtitle, services = [] } = props
  const items = services
    .map((s: any) => `<div class="service-card">
      ${renderHeading('h3', s.title)}
      ${renderParagraph(s.description)}
    </div>`)
    .join('')
  return wrapSection('service-grid', `${renderHeading('h2', title)}${renderParagraph(subtitle)}<div class="service-grid__items">${items}</div>`)
}

export const renderLogoWall = (component: any): string => {
  const { props = {} } = component
  const { logos = [] } = props
  const items = logos
    .map((logo: any) => {
      const src = typeof logo === 'string' ? logo : logo?.image || logo?.url || ''
      const alt = typeof logo === 'string' ? 'logo' : logo?.alt || 'logo'
      return `<div class="logo-item">${src ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" />` : ''}</div>`
    })
    .join('')
  return wrapSection('logo-wall', `<div class="logo-wall__items">${items}</div>`)
}

export const renderLogoScroll = (component: any): string => {
  const { props = {} } = component
  const { logos = [] } = props
  const items = logos
    .map((logo: any) => {
      const src = typeof logo === 'string' ? logo : logo?.image || logo?.url || ''
      const alt = typeof logo === 'string' ? 'logo' : logo?.alt || 'logo'
      return `<div class="logo-scroll__item">${src ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" />` : ''}</div>`
    })
    .join('')
  return wrapSection('logo-scroll', `<div class="logo-scroll__track">${items}</div>`)
}

export const renderLinkBlock = (component: any): string => {
  const { props = {} } = component
  const {
    title,
    links = [],
    backgroundColorOption = 'default',
    linkStyle = 'gradient',
    linkShape = 'pill',
    linkGlow = true,
    hoverEffect = 'lift'
  } = props
  const glowEnabled = linkGlow !== false && linkGlow !== 'false'
  const buttonClass = [
    'link-block__button',
    `link-block__button--${linkStyle}`,
    `link-block__button--${linkShape}`,
    glowEnabled ? 'link-block__button--glow' : '',
    hoverEffect ? `link-block__button--hover-${hoverEffect}` : ''
  ]
    .filter(Boolean)
    .join(' ')
  const items = links
    .map(
      (link: any) =>
        `<li><a class="${buttonClass}" href="${escapeHtml(link.href || link.url || '#')}">${escapeHtml(
          link.label || link.text || ''
        )}</a></li>`
    )
    .join('')
  return wrapSection(
    `link-block ${backgroundColorOption === 'transparent' ? 'link-block--transparent' : 'link-block--default'}`,
    `<div class="link-block__inner">
      ${renderHeading('h3', title)}
      <ul class="link-block__list">${items}</ul>
    </div>`
  )
}
