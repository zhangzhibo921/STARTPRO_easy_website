import type { ThemeBackgroundChoice } from '@/styles/themes'
// 网站配置类型
export interface SiteConfig {
  name: string
  description: string
  logo: string
  domain: string
  icpNumber: string
}

// 导航菜单类型
export interface NavItem {
  id: string
  title: string
  href: string
  description?: string
  children?: NavItem[]
  external?: boolean
}

// 标签类型
export interface Tag {
  id: string
  name: string
}

// 页面内容类型
export interface PageContent {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featured_image?: string
  meta_title?: string
  meta_description?: string
  published: boolean
  category?: string
  tags?: Tag[]
  sort_order?: number
  created_at: string
  updated_at: string
  template_data?: {
    components: any[]
    template_id?: string
    theme_id?: string
  }
  show_updated_date?: boolean
}

export interface NavigationItem {
  id: string
  name: string
  url: string
  target?: string
  parent_id?: string | null
  sort_order?: number
  is_active?: boolean
  children?: NavigationItem[]
  created_at?: string
  updated_at?: string
}

export interface NavigationForm {
  name: string
  url: string
  target?: string
  parent_id?: string | null
  sort_order?: number
  is_active?: boolean
}

// 用户类型
export interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  created_at: string
  last_login?: string
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: Record<string, string[]>
}

// 分页类型
export interface PaginationMeta {
  current_page: number
  per_page: number
  total: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta?: PaginationMeta
}

// 表单类型
export interface LoginForm {
  username: string
  password: string
}

export interface PageForm {
  title: string
  slug: string
  content: string
  excerpt?: string
  featured_image?: string
  meta_title?: string
  meta_description?: string
  published: boolean
  category?: string
  tags?: string[]
  sort_order?: number
  show_updated_date?: boolean
}

// 设置类型
export interface FooterLink {
  id?: string
  label: string
  url: string
  target?: '_self' | '_blank' | '_parent' | '_top'
}

export interface FooterSection {
  id: string
  title: string
  description?: string
  links: FooterLink[]
}

export interface FooterBrand {
  name: string
  description?: string
  logo?: string | null
}

export interface FooterLayout {
  brand: FooterBrand
  sections: FooterSection[]
}

export interface FooterSocialLink {
  id: string
  label: string
  url: string
  icon?: string | null
  target?: '_self' | '_blank'
  color?: string | null
  show_hover_image?: boolean
  hover_image?: string | null
}

export interface ThemeOverrideSettings {
  accentSaturation: number
  panelBrightness: number
  borderRadiusScale: number
  shadowDepth: number
}

export interface Settings {
  site_name: string
  site_description: string
  site_keywords?: string
  site_font?: string
  site_font_custom_name?: string
  site_font_url?: string
  site_statement?: string
  icp_link?: string
  company_name: string
  site_logo: string
  site_favicon: string
  contact_email: string
  contact_phone: string
  address: string
  icp_number: string
  copyright?: string
  analytics_code?: string
  site_theme?: string
  allow_search_index?: boolean
  verification_tags?: {
    google?: string | null
    bing?: string | null
    baidu?: string | null
  }
  social_links: {
    weibo?: string
    wechat?: string
    qq?: string
    email?: string
  }
  quick_links?: Array<{
    label: string
    href: string
    external?: boolean
  }>
  footer_layout?: FooterLayout
  footer_social_links?: FooterSocialLink[]
  theme_background?: ThemeBackgroundChoice
}

export interface EmailNotificationSettings {
  smtp_host: string
  smtp_port: number
  secure: boolean
  username: string
  from_name?: string | null
  from_email: string
  default_recipients?: string[]
  contact_enabled?: boolean
  contact_recipients?: string[]
  status?: 'active' | 'inactive'
  test_status?: 'pending' | 'success' | 'failed'
  last_error?: string | null
  updated_at?: string
  has_password?: boolean
}

export interface ContactMessageField {
  name: string
  label: string
  type?: string
  value?: string
  required?: boolean
}

export interface ContactMessage {
  id: number
  name?: string | null
  email?: string | null
  phone?: string | null
  message?: string | null
  source_page?: string | null
  fields_json?: ContactMessageField[]
  status: 'new' | 'read'
  emailed_at?: string | null
  email_result?: string | null
  created_at: string
  ip_address?: string | null
  user_agent?: string | null
}

// 统计数据类型
export interface Stats {
  total_pages: number
  published_pages: number
  total_users: number
  total_visits: number
  today_visits: number
  week_visits: number
  month_visits: number
  recent_activities: Activity[]
  system_status?: {
    cpu_percent?: number
    memory?: {
      total?: string
      used?: string
      percent?: number
    }
    storage?: {
      total?: string
      used?: string
      available?: string
      percent?: string
    }
  }
}

// 分析数据类型
export interface AnalyticsData {
  pageViewsTrend: {
    name: string
    value: number
  }[]
  popularPages: {
    name: string
    value: number
  }[]
  userActivity: {
    name: string
    value: number
  }[]
  deviceStats: {
    name: string
    value: number
  }[]
  browserStats: {
    name: string
    value: number
  }[]
  metrics: {
    totalVisits: number
    uniqueVisitors: number
    pageViews: number
    avgTimeOnPage: string
    bounceRate: number
  }
  pageDetails: {
    title: string
    views: number
    unique_visitors: number
    avg_time: number
    bounce_rate: number
  }[]
}

export interface Activity {
  id: string
  type: 'create' | 'update' | 'delete' | 'login'
  description: string
  user: string
  created_at: string
}

