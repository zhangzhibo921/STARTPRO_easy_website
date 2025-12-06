const express = require('express')
const path = require('path')
const fs = require('fs')
const router = express.Router()

// 系统默认素材目录路径
const systemDefaultDir = path.join(__dirname, '../../system-default')

// 确保 system-default 目录存在
if (!fs.existsSync(systemDefaultDir)) {
  fs.mkdirSync(systemDefaultDir, { recursive: true })
}

// 安全检查：防止路径遍历攻击
const isSafePath = (relativePath) => {
  const resolvedPath = path.resolve(systemDefaultDir, relativePath)
  const baseDir = path.resolve(systemDefaultDir)
  return resolvedPath.startsWith(baseDir)
}

// 扫描目录结构（递归，返回扁平列表）
const scanDirectory = (dirPath, basePath = '') => {
  const result = []
  if (!fs.existsSync(dirPath)) return result

  let directoryItems = []
  try {
    directoryItems = fs.readdirSync(dirPath, { withFileTypes: true })
  } catch (error) {
    console.error('Error reading directory:', dirPath, error)
    return result
  }

  for (const item of directoryItems) {
    if (!item.isDirectory()) continue

    const folderName = item.name
    const relativePath = basePath ? `${basePath}/${folderName}` : folderName
    const folderPath = path.join(dirPath, folderName)

    result.push({
      id: relativePath,
      name: folderName,
      path: relativePath,
      type: 'folder'
    })

    const children = scanDirectory(folderPath, relativePath)
    if (children.length > 0) {
      result.push(...children)
    }
  }

  return result
}

// 获取系统默认素材文件夹结构
router.get('/folders', async (req, res) => {
  try {
    // 添加根目录
    const folders = [{
      id: 'root',
      name: '系统默认素材',
      path: 'root',
      type: 'root'
    }]

    // 扫描 system-default 目录结构
    const systemDefaultItems = scanDirectory(systemDefaultDir)
    if (systemDefaultItems.length > 0) {
      folders.push(...systemDefaultItems)
    }

    res.json({
      success: true,
      data: folders
    })
  } catch (error) {
    console.error('获取系统默认素材文件夹列表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取系统默认素材文件夹列表失败'
    })
  }
})

// 获取系统默认素材文件列表
const ALLOWED_LIMITS = [40, 80, 160]
const NORMAL_IMAGE_EXT = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'avif', 'heic']

const normalizeLimit = (value) => {
  const parsed = parseInt(value, 10)
  if (ALLOWED_LIMITS.includes(parsed)) return parsed
  return ALLOWED_LIMITS[0]
}

const normalizePage = (value) => {
  const parsed = parseInt(value, 10)
  return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed
}

const detectFileType = (ext = '') => {
  const lower = ext.toLowerCase()
  if (lower === 'svg') return 'icon'
  if (NORMAL_IMAGE_EXT.includes(lower)) return 'image'
  return 'file'
}

router.get('/files', async (req, res) => {
  try {
    let { folder = 'root', page = 1, limit = 40 } = req.query

    const normalizedLimit = normalizeLimit(limit)
    const normalizedPage = normalizePage(page)
    const offset = (normalizedPage - 1) * normalizedLimit

    // 确定目标目录
    let targetDir = systemDefaultDir
    // 使用 /uploads/system-default 走现有 nginx 代理，无需额外配置
    let baseUrl = '/uploads/system-default'

    if (folder !== 'root') {
      // 验证路径安全性
      if (!isSafePath(folder)) {
        return res.status(400).json({
          success: false,
          message: '无效的文件夹路径'
        })
      }

      targetDir = path.join(systemDefaultDir, folder)
      baseUrl = `/uploads/system-default/${folder}`
    }

    // 获取文件列表（不递归，只获取当前目录）
    const getFilesInDirectory = (dir, baseUrl) => {
      const files = []
      if (!fs.existsSync(dir)) {
        return files
      }

      const items = fs.readdirSync(dir, { withFileTypes: true })

      for (const item of items) {
        if (!item.isDirectory()) {
          const fullPath = path.join(dir, item.name)
          const relativePath = path.relative(systemDefaultDir, fullPath)
          const url = `${baseUrl}/${item.name}`.replace('//', '/')

          const stats = fs.statSync(fullPath)
          const extension = path.extname(item.name).substring(1).toLowerCase().replace('.', '') || 'unknown'
          files.push({
            name: item.name,
            path: relativePath,
            url,
            size: stats.size,
            modified: stats.mtime,
            extension,
            type: detectFileType(extension)
          })
        }
      }

      return files
    }

    const files = getFilesInDirectory(targetDir, baseUrl)

    // 按修改时间排序（最新在前）
    files.sort((a, b) => new Date(b.modified) - new Date(a.modified))

    // 分页
    const total = files.length
    const paginatedFiles = files.slice(offset, offset + normalizedLimit)
    const totalPages = Math.max(1, Math.ceil(total / normalizedLimit))

    res.json({
      success: true,
      data: paginatedFiles,
      meta: {
        current_page: normalizedPage,
        per_page: normalizedLimit,
        total,
        total_pages: totalPages,
        has_next: normalizedPage < totalPages,
        has_prev: normalizedPage > 1,
        current_folder: folder
      }
    })
  } catch (error) {
    console.error('获取系统默认素材文件列表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取系统默认素材文件列表失败'
    })
  }
})

// 所有写操作都返回403错误（只读）
const readOnlyHandler = (req, res) => {
  res.status(403).json({
    success: false,
    message: '系统默认素材为只读，不允许修改'
  })
}

// 禁止所有写操作
router.post('*', readOnlyHandler)
router.put('*', readOnlyHandler)
router.delete('*', readOnlyHandler)
router.patch('*', readOnlyHandler)

module.exports = router
