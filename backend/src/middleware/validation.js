const Joi = require('joi')

// 验证中间件生成器
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false
    })

    if (error) {
      const errors = {}
      error.details.forEach(detail => {
        const key = detail.path.join('.')
        errors[key] = [detail.message]
      })

      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        errors
      })
    }

    req[property] = value
    next()
  }
}

// 用户验证规则
const userSchemas = {
  login: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).max(100).required()
  }),

  updateProfile: Joi.object({
    email: Joi.string().email().optional(),
    currentPassword: Joi.string().min(6).when('newPassword', {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    newPassword: Joi.string().min(6).max(100).optional()
  })
}

// 页面验证规则
const pageSchemas = {
  create: Joi.object({
    title: Joi.string().min(1).max(200).required(),
    slug: Joi.string().pattern(/^[a-z0-9_-]+$/).min(1).max(200).required(),
    content: Joi.string().required(),
    excerpt: Joi.string().max(500).optional().allow(''),
    featured_image: Joi.string().uri().optional().allow(''),
    meta_title: Joi.string().max(200).optional().allow(''),
    meta_description: Joi.string().max(500).optional().allow(''),
    published: Joi.boolean().default(false),
    sort_order: Joi.number().integer().min(0).default(0),
    category: Joi.string().valid('general', 'product', 'about', 'news', 'help', 'legal').default('general'),
    template_data: Joi.alternatives([
      Joi.string().allow('').allow(null),
      Joi.object({
        components: Joi.array().items(Joi.object({
          id: Joi.string().required(),
          type: Joi.string().required(),
          props: Joi.object().optional()
        })).optional()
      }).optional()
    ]).optional()
  }),

  update: Joi.object({
    title: Joi.string().min(1).max(200).optional(),
    slug: Joi.string().pattern(/^[a-z0-9_-]+$/).min(1).max(200).optional(),
    content: Joi.string().optional(),
    excerpt: Joi.string().max(500).optional().allow(''),
    featured_image: Joi.string().uri().optional().allow(''),
    meta_title: Joi.string().max(200).optional().allow(''),
    meta_description: Joi.string().max(500).optional().allow(''),
    published: Joi.boolean().optional(),
    sort_order: Joi.number().integer().min(0).optional(),
    category: Joi.string().valid('general', 'product', 'about', 'news', 'help', 'legal').optional(),
    template_data: Joi.alternatives([
      Joi.string().allow('').allow(null),
      Joi.object({
        components: Joi.array().items(Joi.object({
          id: Joi.string().required(),
          type: Joi.string().required(),
          props: Joi.object().optional()
        })).optional()
      }).optional()
    ]).optional()
  })
}

const footerLinkSchema = Joi.object({
  id: Joi.string().max(100).allow('', null).optional(),
  label: Joi.string().max(100).required(),
  url: Joi.string().max(500).required(),
  target: Joi.string().valid('_self', '_blank', '_parent', '_top').default('_self')
})

const footerSectionSchema = Joi.object({
  id: Joi.string().max(100).allow('', null).optional(),
  title: Joi.string().max(100).required(),
  description: Joi.string().allow('', null).optional(),
  links: Joi.array().items(footerLinkSchema).default([])
})

// 设置验证规则
const settingsSchemas = {
  update: Joi.object({
    site_name: Joi.string().max(100).optional(),
    company_name: Joi.string().max(100).optional(),
    site_description: Joi.string().max(500).optional(),
    site_keywords: Joi.string().max(500).optional().allow(''),
    site_statement: Joi.string().max(500).optional().allow(''),
    icp_link: Joi.string().uri().optional().allow(''),
    site_logo: Joi.string().optional().allow(''),
    site_favicon: Joi.string().optional().allow(''),
    site_font: Joi.string().max(100).optional().allow(''),
    site_font_custom_name: Joi.string().max(200).optional().allow(''),
    site_font_url: Joi.string().uri().optional().allow(''),
    contact_email: Joi.string().email().optional().allow(''),
    contact_phone: Joi.string().max(20).optional().allow(''),
    address: Joi.string().max(200).optional().allow(''),
    icp_number: Joi.string().max(50).optional(),
    allow_search_index: Joi.boolean().optional(),
    verification_tags: Joi.object({
      google: Joi.string().max(200).optional().allow('', null),
      bing: Joi.string().max(200).optional().allow('', null),
      baidu: Joi.string().max(200).optional().allow('', null)
    }).optional(),
    copyright: Joi.string().max(500).optional().allow(''),
    analytics_code: Joi.string().optional().allow(''),
    nav_color_style: Joi.string().valid('default', 'dark', 'blue', 'green').optional(),
    site_theme: Joi.string()
      .valid(
        'neo-futuristic',
        'corporate-blue',
        'elegant-dark',
        'emerald-forest',
        'royal-amber',
        'mystic-purple',
        'minimal-pro',
        'serene-white',
        'starry-night'
      )
      .optional(),
    social_links: Joi.object({
      weibo: Joi.string().uri().optional().allow(''),
      wechat: Joi.string().optional().allow(''),
      qq: Joi.string().optional().allow(''),
      email: Joi.string().email().optional().allow('')
    }).optional(),
    quick_links: Joi.array().items(
      Joi.object({
        label: Joi.string().required(),
        href: Joi.string().required(),
        external: Joi.boolean().optional()
      })
    ).optional(),
    footer_layout: Joi.object({
      brand: Joi.object({
        name: Joi.string().max(100).allow('').required(),
        description: Joi.string().allow('', null).optional(),
        logo: Joi.string().allow('', null).optional()
      }).required(),
      sections: Joi.array().items(footerSectionSchema).default([])
    }).optional(),
    footer_social_links: Joi.array().items(
      Joi.object({
        id: Joi.string().max(100).required(),
        label: Joi.string().max(100).required(),
        url: Joi.string().max(500).allow('').required(),
        icon: Joi.string().allow('', null).optional(),
        target: Joi.string().valid('_self', '_blank').default('_blank'),
        color: Joi.string().allow('', null).optional(),
        show_hover_image: Joi.boolean().optional(),
        hover_image: Joi.string().allow('', null).optional()
      })
    ).optional(),
    theme_background: Joi.string()
      .valid('theme-default', 'starfield', 'gradient', 'pattern')
      .optional(),
    verification_tags: Joi.object({
      google: Joi.string().max(200).optional().allow('', null),
      bing: Joi.string().max(200).optional().allow('', null),
      baidu: Joi.string().max(200).optional().allow('', null)
    }).optional()
  }).unknown(false)
}

// 通知/邮件与联系表单校验
const notificationSchemas = {
  emailSettings: Joi.object({
    smtp_host: Joi.string().hostname().required(),
    smtp_port: Joi.number().integer().min(1).max(65535).default(587),
    secure: Joi.boolean().default(false),
    username: Joi.string().required(),
    password: Joi.string().allow('', null).optional(),
    from_name: Joi.string().allow('', null).optional(),
    from_email: Joi.string().email().required(),
    default_recipients: Joi.array().items(Joi.string().email()).default([]),
    contact_enabled: Joi.boolean().default(false),
    contact_recipients: Joi.array().items(Joi.string().email()).default([]),
    status: Joi.string().valid('active', 'inactive').optional()
  }).unknown(true),
  testEmail: Joi.object({
    to: Joi.alternatives().try(
      Joi.string().email(),
      Joi.array().items(Joi.string().email()).min(1)
    ).optional(),
    subject: Joi.string().max(200).optional(),
    message: Joi.string().max(2000).optional(),
    config: Joi.object({
      smtp_host: Joi.string().hostname().optional(),
      smtp_port: Joi.number().integer().min(1).max(65535).optional(),
      secure: Joi.boolean().optional(),
      username: Joi.string().optional(),
      password: Joi.string().optional(),
      from_name: Joi.string().allow('', null).optional(),
      from_email: Joi.string().email().optional(),
      default_recipients: Joi.array().items(Joi.string().email()).optional()
    }).optional()
  }),
  contactSubmission: Joi.object({
    fields: Joi.array().items(
      Joi.object({
        name: Joi.string().max(100).allow('', null),
        label: Joi.string().max(100).allow('', null),
        type: Joi.string().max(30).allow('', null),
        value: Joi.string().max(1000).allow('', null),
        required: Joi.boolean().optional(),
        options: Joi.array().optional()
      }).unknown(true)
    ).max(30).required(),
    page: Joi.string().max(255).optional().allow(''),
    honeypot: Joi.string().max(100).optional().allow('')
  }),
  adminMessagesQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid('new', 'read').optional(),
    keyword: Joi.string().max(200).optional().allow(''),
    source: Joi.string().max(255).optional().allow(''),
    start_date: Joi.date().iso().optional(),
    end_date: Joi.date().iso().optional()
  }).unknown(true),
  markRead: Joi.object({
    status: Joi.string().valid('new', 'read').required()
  }),
  resendMessage: Joi.object({}).optional()
}

// 查询参数验证规则
const querySchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(100).optional().allow('')
  }).unknown(true)
}

module.exports = {
  validate,
  validateLogin: validate(userSchemas.login),
  validateUpdateProfile: validate(userSchemas.updateProfile),
  validateCreatePage: validate(pageSchemas.create),
  validateUpdatePage: validate(pageSchemas.update),
  validateUpdateSettings: validate(settingsSchemas.update),
  validatePagination: validate(querySchemas.pagination, 'query'),
  validateId: validate(Joi.object({
    id: Joi.number().integer().positive().required()
  }), 'params'),
  validateSlug: validate(Joi.object({
    slug: Joi.string().pattern(/^[a-z0-9_-]+$/).required()
  }), 'params'),
  validateEmailSettings: validate(notificationSchemas.emailSettings),
  validateTestEmail: validate(notificationSchemas.testEmail),
  validateContactSubmission: validate(notificationSchemas.contactSubmission),
  validateAdminMessagesQuery: validate(notificationSchemas.adminMessagesQuery, 'query'),
  validateMarkRead: validate(notificationSchemas.markRead),
  validateResendMessage: validate(notificationSchemas.resendMessage)
}
