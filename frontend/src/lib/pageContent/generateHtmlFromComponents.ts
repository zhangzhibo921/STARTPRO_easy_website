import { RenderMap } from '@/types/pageContent'
import { renderHero, renderTextBlock, renderImageBlock, renderImageText, renderImageTextHorizontal, renderContentSection, renderBannerCarousel, renderTable } from './renderers/basic'
import { renderFeatureGrid, renderFeatureGridLarge, renderServiceGrid, renderLogoWall, renderLogoScroll, renderLinkBlock } from './renderers/collections'
import { renderPricingCards } from './renderers/pricing'
import { renderTeamGrid, renderTestimonials } from './renderers/team'
import { renderCallToAction } from './renderers/cta'
import { renderContactForm, renderFaqSection } from './renderers/forms'
import { renderStatsSection, renderTimeline, renderCyberTimeline } from './renderers/statsTimeline'
import { renderCyberShowcase, renderCyberSuperCard } from './renderers/cyber'
import { renderNewsList, renderVideoPlayer } from './renderers/newsVideo'
import { renderRawHtml } from './renderers/rawHtml'
import {
  renderPremiumHero,
  renderPremiumFeatureGrid,
  renderPremiumStats,
  renderPremiumTestimonials,
  renderPremiumShowcase,
  renderPremiumPartners,
  renderPremiumPricing
} from './renderers/premium'

const renderers: RenderMap = {
  'hero': renderHero,
  'text-block': renderTextBlock,
  'image-block': renderImageBlock,
  'image-text': renderImageText,
  'image-text-horizontal': renderImageTextHorizontal,
  'content-section': renderContentSection,
  'banner-carousel': renderBannerCarousel,
  'table': renderTable,
  'feature-grid': renderFeatureGrid,
  'feature-grid-large': renderFeatureGridLarge,
  'pricing-cards': renderPricingCards,
  'contact-form': renderContactForm,
  'team-grid': renderTeamGrid,
  'call-to-action': renderCallToAction,
  'faq-section': renderFaqSection,
  'stats-section': renderStatsSection,
  'timeline': renderTimeline,
  'cyber-timeline': renderCyberTimeline,
  'cyber-showcase': renderCyberShowcase,
  'cyber-super-card': renderCyberSuperCard,
  'testimonials': renderTestimonials,
  'news-list': renderNewsList,
  'service-grid': renderServiceGrid,
  'logo-wall': renderLogoWall,
  'logo-scroll': renderLogoScroll,
  'link-block': renderLinkBlock,
  'video-player': renderVideoPlayer,
  'raw-html': renderRawHtml,
  'premium-hero': renderPremiumHero,
  'premium-feature-grid': renderPremiumFeatureGrid,
  'premium-stats': renderPremiumStats,
  'premium-testimonials': renderPremiumTestimonials,
  'premium-showcase': renderPremiumShowcase,
  'premium-partners': renderPremiumPartners,
  'premium-pricing': renderPremiumPricing
}

export const generateHtmlFromComponents = (components: any[]): string => {
  if (!Array.isArray(components) || components.length === 0) return ''

  const parts = components.map((component) => {
    const renderer = renderers[component.type]
    if (!renderer) {
      return `<!-- Unknown component: ${component.type} -->`
    }
    try {
      return renderer(component) || `<!-- Empty component: ${component.type} -->`
    } catch (err) {
      console.error('Component render failed', component?.type, err)
      return `<!-- Render error: ${component.type} -->`
    }
  })

  return parts.join('\n\n')
}

export default generateHtmlFromComponents
