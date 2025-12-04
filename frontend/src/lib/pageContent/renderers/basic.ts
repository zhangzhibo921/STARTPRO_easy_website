import { escapeHtml, renderHeading, renderParagraph, wrapSection } from '../utils'

export const renderHero = (component: any): string => {
  const { props = {} } = component
  const {
    title,
    subtitle,
    backgroundImage,
    buttonText,
    buttonLink,
    titleColorMode = 'default',
    customTitleColor = '',
    subtitleColorMode = 'default',
    customSubtitleColor = ''
  } = props
  const titleStyle = titleColorMode === 'custom' && customTitleColor ? ` style="color:${escapeHtml(customTitleColor)}"` : ''
  const subtitleStyle =
    subtitleColorMode === 'custom' && customSubtitleColor ? ` style="color:${escapeHtml(customSubtitleColor)}"` : ''
  const button = buttonText
    ? `<a class="hero-button" href="${escapeHtml(buttonLink || '#')}">${escapeHtml(buttonText)}</a>`
    : ''
  const bg = backgroundImage ? ` style="background-image:url('${escapeHtml(backgroundImage)}')"` : ''
  return wrapSection(
    'hero-section',
    `<div class="hero-content"${bg}>
      ${title ? `<h1${titleStyle}>${escapeHtml(title)}</h1>` : ''}
      ${subtitle ? `<p${subtitleStyle}>${escapeHtml(subtitle)}</p>` : ''}
      ${button}
    </div>`
  )
}

export const renderTextBlock = (component: any): string => {
  const { props = {} } = component
  const { title, content, alignment = 'left' } = props
  const alignClass = alignment ? ` align-${alignment}` : ''
  return wrapSection(
    `text-block${alignClass}`,
    `${renderHeading('h2', title)}${content ? `<div class="text-body">${content}</div>` : ''}`
  )
}

export const renderImageBlock = (component: any): string => {
  const { props = {} } = component
  const { src, alt, caption, linkUrl, linkTarget } = props
  const image = src ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt || '')}" />` : ''
  const linkedImage =
    image && linkUrl
      ? `<a href="${escapeHtml(linkUrl)}"${
          linkTarget === '_blank' ? ' target="_blank" rel="noopener noreferrer"' : ''
        }>${image}</a>`
      : image
  return wrapSection(
    'image-block',
    `<figure>
      ${linkedImage}
      ${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ''}
    </figure>`
  )
}

export const renderImageText = (component: any): string => {
  const { props = {} } = component
  const { title, content, image, imageAlt, align } = props
  const imagePart = image
    ? `<div class="image-text__image"><img src="${escapeHtml(image)}" alt="${escapeHtml(imageAlt || '')}" /></div>`
    : ''
  return wrapSection(
    `image-text ${align === 'right' ? 'image-right' : 'image-left'}`,
    `${renderHeading('h2', title)}${renderParagraph(content)}${imagePart}`
  )
}

export const renderImageTextHorizontal = (component: any): string => {
  const { props = {} } = component
  const { title, content, image, imageAlt } = props
  return wrapSection(
    'image-text-horizontal',
    `<div class="image-text-horizontal__media">
      ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(imageAlt || '')}" />` : ''}
    </div>
    <div class="image-text-horizontal__content">
      ${renderHeading('h2', title)}
      ${renderParagraph(content)}
    </div>`
  )
}

export const renderContentSection = (component: any): string => {
  const { props = {} } = component
  const { title, subtitle, content } = props
  return wrapSection(
    'content-section',
    `${renderHeading('h2', title)}${renderParagraph(subtitle)}${content ? `<div class="content-body">${content}</div>` : ''}`
  )
}

export const renderBannerCarousel = (component: any): string => {
  const { props = {} } = component
  const { banners = [], slides = [] } = props
  const list = Array.isArray(banners) && banners.length > 0 ? banners : slides
  const output = (list || [])
    .map((banner: any) => {
      const image = banner.image || banner.src || ''
      return `<div class="banner-slide">
      ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(banner.alt || '')}" />` : ''}
      ${banner.title ? `<h3>${escapeHtml(banner.title)}</h3>` : ''}
      ${banner.description ? `<p>${escapeHtml(banner.description)}</p>` : ''}
    </div>`
    })
    .join('')
  return wrapSection('banner-carousel', output || '<div class="banner-slide empty"></div>')
}

export const renderTable = (component: any): string => {
  const { props = {} } = component
  const {
    title,
    columns = [],
    rows = [],
    backgroundColorOption = 'default',
    widthOption = 'full'
  } = props

  const rowKeys =
    Array.isArray(rows) && rows.length > 0
      ? Array.from(new Set(rows.flatMap((row: any) => Object.keys(row || {}))))
      : []

  const columnsFromProps = Array.isArray(columns) ? columns : []
  const safeColumnsBase = columnsFromProps.length > 0 ? [...columnsFromProps] : []
  const existingKeys = new Set(safeColumnsBase.map(col => col.key).filter(Boolean))

  // 将 rows 中新增的列 key 合并到 columns，避免 columns 未同步时漏渲染
  rowKeys.forEach(key => {
    if (!existingKeys.has(key)) {
      safeColumnsBase.push({ key, label: key, align: 'left' })
    }
  })

  const safeColumns =
    safeColumnsBase.length > 0
      ? safeColumnsBase
      : [
          { key: 'item', label: '名称', align: 'left' },
          { key: 'value', label: '数值', align: 'center' },
          { key: 'status', label: '状态', align: 'right' }
        ]

  const safeRows = Array.isArray(rows) ? rows : []

  const header = safeColumns
    .map(
      (col: any) =>
        `<th class="table-block__th${col.align ? ` align-${col.align}` : ''}">${escapeHtml(col.label || col.key || '')}</th>`
    )
    .join('')

  const body =
    safeRows.length > 0
      ? safeRows
          .map(
            (row: any) =>
              `<tr>${safeColumns
                .map((col: any) => {
                  const value = row?.[col.key]
                  return `<td class="table-block__td${col.align ? ` align-${col.align}` : ''}">${escapeHtml(
                    value ?? ''
                  )}</td>`
                })
                .join('')}</tr>`
          )
          .join('')
      : `<tr><td class="table-block__td" colspan="${safeColumns.length}"></td></tr>`

  return wrapSection(
    `table-block ${backgroundColorOption === 'transparent' ? 'table-block--transparent' : 'table-block--default'} ${
      widthOption === 'standard' ? 'table-block--standard' : ''
    }`,
    `${title ? `<h3 class="table-block__title">${escapeHtml(title)}</h3>` : ''}<div class="table-block__wrapper"><table class="table-block__table"><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table></div>`
  )
}
