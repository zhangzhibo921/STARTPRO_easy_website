const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../../.env') })

const { normalizeSystemDefaultSvgs } = require('./utils/svgNormalizer')

const app = express()
// Behind one reverse proxy; use numeric setting to keep rate-limit safe checks happy
app.set('trust proxy', 1)
const PORT = process.env.BACKEND_PORT || 3003

// 安全中间件
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))

// CORS配置
app.use(cors({
  origin: '*', // 允许所有来源，用于调试
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}))

// 压缩响应
app.use(compression())

// 日志记录
app.use(morgan('combined'))

// 创建一个智能限流中间件
const createRateLimiter = () => {
  // 通用限流（未认证请求）
  const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1分钟
    max: 1000, // 限制每个IP最多1000个请求
    message: {
      success: false,
      message: '请求过于频繁，请稍后再试'
    }
  })

  // 管理员用户限流（更宽松）
  const adminLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1分钟
    max: 10000, // 管理员限制每个IP最多10000个请求
    message: {
      success: false,
      message: '请求过于频繁，请稍后再试'
    }
  })

  // 普通用户限流
  const userLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1分钟
    max: 1000, // 普通用户限制每个IP最多1000个请求
    message: {
      success: false,
      message: '请求过于频繁，请稍后再试'
    }
  })

  return (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    // 如果没有token，使用通用限流
    if (!token) {
      return generalLimiter(req, res, next)
    }

    // 验证token获取用户角色
    const jwt = require('jsonwebtoken')
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
      const db = require('./config/database')

      db.execute('SELECT role FROM users WHERE id = ?', [decoded.userId])
        .then(([users]) => {
          if (users.length > 0 && users[0].role === 'admin') {
            // 管理员用户使用宽松限流
            adminLimiter(req, res, next)
          } else {
            // 普通用户使用普通限流
            userLimiter(req, res, next)
          }
        })
        .catch(() => {
          // 数据库错误时使用通用限流
          generalLimiter(req, res, next)
        })
    } catch (error) {
      // token无效时使用通用限流
      generalLimiter(req, res, next)
    }
  }
}

// 为所有API路由应用智能限流
app.use('/api/', createRateLimiter())

// 解析JSON和URL编码的数据
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 静态文件服务
app.use('/uploads', express.static('uploads'))
// 为系统默认素材提供一个经过 /uploads 前缀的访问路径，兼容前端现有代理规则
app.use('/uploads/system-default', express.static('system-default'))
app.use('/system-default', express.static('system-default'))

// 数据库连接
const db = require('./config/database')

// 路由
const authRoutes = require('./routes/auth')
const pagesRoutes = require('./routes/pages')
const navigationRoutes = require('./routes/navigation')
const settingsRoutes = require('./routes/settings')
const statsRoutes = require('./routes/stats')
const uploadRoutes = require('./routes/upload')
const systemDefaultRoutes = require('./routes/system-default')
const tagsRoutes = require('./routes/tags')
const notificationRoutes = require('./routes/notifications')
const contactRoutes = require('./routes/contact')
const docsRoutes = require('./routes/docs')

normalizeSystemDefaultSvgs()
  .then(summary => {
    if (summary.modified > 0) {
      console.log(`[SVG] Normalized ${summary.modified}/${summary.scanned} system-default SVG assets`)
    }
  })
  .catch(error => {
    console.warn('[SVG] Failed to normalize system-default SVGs:', error.message)
  })

app.use('/api/auth', authRoutes)
app.use('/api/pages', pagesRoutes)
app.use('/api/navigation', navigationRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/system-default', systemDefaultRoutes)
app.use('/api/tags', tagsRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/docs', docsRoutes)

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API服务运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  })
})

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err)
  
  // 数据库错误
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      success: false,
      message: '数据已存在'
    })
  }
  
  // 验证错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: '数据验证失败',
      errors: err.details
    })
  }
  
  // JWT错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: '令牌无效'
    })
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: '令牌已过期'
    })
  }
  
  // 默认错误
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器内部错误'
  })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器启动成功！`)
  console.log(`📱 API地址: http://localhost:${PORT}/api`)
  console.log(`🔍 健康检查: http://localhost:${PORT}/api/health`)
  console.log(`📋 环境: ${process.env.NODE_ENV || 'development'}`)
})

module.exports = app
