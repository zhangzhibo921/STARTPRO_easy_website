const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const router = express.Router()
const { authenticateToken, requireEditor } = require('../middleware/auth')


// 确保上传目录存在
const uploadsDir = path.join(__dirname, '../../uploads')
const publicDir = path.join(__dirname, '../../public')

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}
const imagesDir = path.join(uploadsDir, 'images')
const filesDir = path.join(uploadsDir, 'files')

for (const dir of [imagesDir, filesDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// 尝试将以 latin1 编码的文件名解码为 UTF-8，避免中文等字符出现乱码
const decodeOriginalName = (name = '') => {
  try {
    // 将 latin1 字符串转回 Buffer 再按 UTF-8 解码
    return Buffer.from(name, 'latin1').toString('utf8')
  } catch (error) {
    console.warn('Failed to decode original filename, fallback to raw value:', name, error)
    return name
  }
}

// 生成文件名 - 尽量保留原始文件名
const generateFileName = (originalName = '') => {
  const decodedName = decodeOriginalName(originalName)
  // 简单清理文件名，移除路径遍历字符，但保留原始名称
  return decodedName.replace(/[/\\]/g, '_') // 替换路径分隔符为下划线
}

// 生成文件URL
const getFileUrl = (filename, folder, mimetype) => {
  console.log('getFileUrl called with:', { filename, folder, mimetype });
  // 处理具体文件夹
  if (folder && folder !== 'root') {
    return `/uploads/${folder}/${filename}`;
  }

  // 处理根目录 - 所有文件都直接放在根目录
  return `/uploads/${filename}`;
}

// 获取文件夹路径 - 最简版本
const getFolderPath = (folderPath) => {
  if (!folderPath || folderPath === 'root') {
    return null;
  }

  // 处理任意用户上传目录路径
  // 确保路径在 uploads 目录下，防止路径遍历攻击
  const resolvedPath = path.resolve(uploadsDir, folderPath);

  // 安全检查：确保路径在 uploads 目录内（简化版本）
  const uploadsResolved = path.resolve(uploadsDir);
  if (!resolvedPath.startsWith(uploadsResolved)) {
    console.warn('Security warning: Attempted path traversal detected:', folderPath);
    return null;
  }

  // 确保目录存在
  if (!fs.existsSync(resolvedPath)) {
    try {
      fs.mkdirSync(resolvedPath, { recursive: true });
    } catch (error) {
      console.error('Failed to create directory:', resolvedPath, error);
      return null;
    }
  }

  return resolvedPath;
}

const resolveExistingFolderPath = (folderPath) => {
  if (!folderPath || folderPath === 'root') {
    return uploadsDir
  }

  const resolvedPath = path.resolve(uploadsDir, folderPath)
  const uploadsResolved = path.resolve(uploadsDir)
  if (!resolvedPath.startsWith(uploadsResolved)) {
    console.warn('Security warning: Attempted path traversal detected:', folderPath)
    return null
  }

  if (!fs.existsSync(resolvedPath)) {
    return null
  }

  return resolvedPath
}

// 获取文件类型目录 - 简化版本
const getFileTypeDir = (mimetype, folderPath) => {
  // 如果指定了具体文件夹路径，直接返回
  const specificFolder = getFolderPath(folderPath)
  if (specificFolder) {
    return specificFolder
  }

  // 否则保存到根 uploads 目录
  return uploadsDir
}

// 图片上传配置
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.body.folder || 'root'
    const destinationDir = getFileTypeDir(file.mimetype, folder)
    cb(null, destinationDir)
  },
  filename: (req, file, cb) => {
    cb(null, generateFileName(file.originalname))
  }
})

// 文件上传配置
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.body.folder || 'root'
    const destinationDir = getFileTypeDir(file.mimetype, folder)
    cb(null, destinationDir)
  },
  filename: (req, file, cb) => {
    cb(null, generateFileName(file.originalname))
  }
})

// 图片文件过滤器
const imageFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',    // SVG文件支持
    'image/x-icon',     // ICO文件支持
    'image/vnd.microsoft.icon',  // ICO文件支持
    'image/icon',       // ICO文件支持
    'image/bmp',        // BMP文件支持
    'image/tiff',       // TIFF文件支持
    'image/heic',       // HEIC文件支持
    'image/heif'        // HEIF文件支持
  ]
  
  // 检查文件扩展名
  const fileExt = path.extname(file.originalname).toLowerCase()
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.ico', '.svg', '.bmp', '.tiff', '.tif', '.heic', '.heif']
  
  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
    cb(null, true)
  } else {
    cb(new Error(`只允许上传图片文件 (JPEG, JPG, PNG, GIF, WebP, ICO, SVG)，当前文件类型: ${file.mimetype}, 扩展名: ${fileExt}`), false)
  }
}

// 通用文件过滤器
const fileFilter = (req, file, cb) => {
  // 禁止的文件类型
  const forbiddenTypes = [
    'application/x-executable',
    'application/x-msdownload',
    'application/x-msdos-program'
  ]
  
  const forbiddenExtensions = ['.exe', '.bat', '.cmd', '.com', '.scr', '.vbs', '.js', '.jar']
  const fileExt = path.extname(file.originalname).toLowerCase()
  
  if (forbiddenTypes.includes(file.mimetype) || forbiddenExtensions.includes(fileExt)) {
    cb(new Error('不允许上传此类型的文件'), false)
  } else {
    cb(null, true)
  }
}

// 创建multer实例
const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB限制
    files: 1
  }
})

const uploadFile = multer({
  storage: fileStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB限制
    files: 1
  }
})

// 上传图片
router.post('/image', authenticateToken, requireEditor, (req, res) => {

  uploadImage.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: '图片文件大小不能超过5MB'
          })
        }
      }

      return res.status(400).json({
        success: false,
        message: err.message || '上传失败'
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的图片文件'
      })
    }

    console.log('DEBUG: Upload image request body after multer:', req.body)

    const folder = req.body.folder || 'root';
    const fileUrl = getFileUrl(req.file.filename, folder, req.file.mimetype);

    res.json({
      success: true,
      message: '图片上传成功',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: fileUrl,
        fullUrl: `${req.protocol}://localhost:3003${fileUrl}`
      }
    })
  })
})

// 上传文件
router.post('/file', authenticateToken, requireEditor, (req, res) => {

  uploadFile.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: '文件大小不能超过10MB'
          })
        }
      }
      
      return res.status(400).json({
        success: false,
        message: err.message || '上传失败'
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的文件'
      })
    }

    const folder = req.body.folder || 'root';
    const fileUrl = getFileUrl(req.file.filename, folder, req.file.mimetype);

    res.json({
      success: true,
      message: '文件上传成功',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl,
        fullUrl: `${req.protocol}://localhost:3003${fileUrl}`
      }
    })
  })
})

// 多图片上传
router.post('/images', authenticateToken, requireEditor, (req, res) => {
  const uploadMultipleImages = multer({
    storage: imageStorage,
    fileFilter: imageFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB限制
      files: 10 // 最多10个文件
    }
  }).array('files', 10)

  uploadMultipleImages(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: '图片文件大小不能超过5MB'
          })
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: '最多只能上传10个文件'
          })
        }
      }
      
      return res.status(400).json({
        success: false,
        message: err.message || '上传失败'
      })
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的图片文件'
      })
    }

    const uploadedFiles = req.files.map(file => {
      const folder = req.body.folder || 'root';
      const fileUrl = getFileUrl(file.filename, folder, file.mimetype)
      return {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        url: fileUrl,
        fullUrl: `${req.protocol}://localhost:3003${fileUrl}`
      }
    })
    
    res.json({
      success: true,
      message: `成功上传${uploadedFiles.length}个图片文件`,
      data: uploadedFiles
    })
  })
})

// 获取上传的文件列表
router.get('/files', authenticateToken, requireEditor, async (req, res) => {
  try {
    let { type = 'all', folder = 'root', page = 1, limit = 20 } = req.query
    // SVG目录显示更多文件
    if (folder === 'svg') {
      limit = 50
    }
    const offset = (page - 1) * limit

    // 根据文件夹参数确定目标目录
    let targetDir = uploadsDir
    let baseUrl = '/uploads'

    if (folder !== 'root') {
      // 使用统一的 getFolderPath 函数来确定目标目录
      const resolvedTargetDir = getFolderPath(folder);

      if (resolvedTargetDir) {
        targetDir = resolvedTargetDir;
        baseUrl = `/uploads/${folder}`;
      } else {
        // 如果 getFolderPath 返回 null，使用根 uploads 目录
        targetDir = uploadsDir;
        baseUrl = `/uploads/${folder}`;
      }
    } else {
      // 根目录
      targetDir = uploadsDir;
      baseUrl = '/uploads';
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
          const relativePath = path.relative(uploadsDir, fullPath);
          const url = `${baseUrl}/${item.name}`.replace('//', '/')

          const stats = fs.statSync(fullPath)
          files.push({
            name: item.name,
            path: relativePath,
            url,
            size: stats.size,
            modified: stats.mtime,
            type: path.extname(item.name).substring(1) || 'unknown'
          })
        }
      }

      return files
    }

    const files = getFilesInDirectory(targetDir, baseUrl)

    // 按修改时间排序
    files.sort((a, b) => new Date(b.modified) - new Date(a.modified))

    // 分页
    const total = files.length
    const paginatedFiles = files.slice(offset, offset + parseInt(limit))

    res.json({
      success: true,
      data: paginatedFiles,
      meta: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit),
        has_next: page < Math.ceil(total / limit),
        has_prev: page > 1,
        current_folder: folder
      }
    })
  } catch (error) {
    console.error('获取文件列表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取文件列表失败'
    })
  }
})

// 删除文件
router.delete('/file/:filename', authenticateToken, requireEditor, async (req, res) => {
  try {
    const { filename } = req.params
    const { folder } = req.query

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: '缺少必要的文件名参数'
      })
    }

    let targetDir = uploadsDir
    if (folder && folder !== 'root') {
      const resolvedTargetDir = resolveExistingFolderPath(folder)
      if (!resolvedTargetDir) {
        return res.status(400).json({
          success: false,
          message: '无效的文件夹路径'
        })
      }
      targetDir = resolvedTargetDir
    }

    const filePath = path.join(targetDir, filename)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      })
    }

    fs.unlinkSync(filePath)

    res.json({
      success: true,
      message: '文件删除成功'
    })
  } catch (error) {
    console.error('删除文件失败:', error)
    res.status(500).json({
      success: false,
      message: '删除文件失败'
    })
  }
})

router.get('/storage', authenticateToken, requireEditor, async (req, res) => {
  try {
    const getDirectorySize = (dirPath) => {
      let totalSize = 0
      let fileCount = 0

      if (!fs.existsSync(dirPath)) {
        return { size: 0, count: 0 }
      }

      const items = fs.readdirSync(dirPath, { withFileTypes: true })

      for (const item of items) {
        const fullPath = path.join(dirPath, item.name)

        if (item.isDirectory()) {
          const subDir = getDirectorySize(fullPath)
          totalSize += subDir.size
          fileCount += subDir.count
        } else {
          const stats = fs.statSync(fullPath)
          totalSize += stats.size
          fileCount++
        }
      }

      return { size: totalSize, count: fileCount }
    }

    const imagesInfo = getDirectorySize(imagesDir)
    const filesInfo = getDirectorySize(filesDir)
    const totalSize = imagesInfo.size + filesInfo.size
    const totalCount = imagesInfo.count + filesInfo.count

    res.json({
      success: true,
      data: {
        total: {
          size: totalSize,
          count: totalCount,
          size_mb: Math.round(totalSize / 1024 / 1024 * 100) / 100
        },
        images: {
          size: imagesInfo.size,
          count: imagesInfo.count,
          size_mb: Math.round(imagesInfo.size / 1024 / 1024 * 100) / 100
        },
        files: {
          size: filesInfo.size,
          count: filesInfo.count,
          size_mb: Math.round(filesInfo.size / 1024 / 1024 * 100) / 100
        }
      }
    })
  } catch (error) {
    console.error('获取存储信息失败:', error)
    res.status(500).json({
      success: false,
      message: '获取存储信息失败'
    })
  }
})

// 重命名文件
router.put('/file/rename', authenticateToken, requireEditor, async (req, res) => {
  try {
    const { filename, newFilename, folder } = req.body

    if (!filename || !newFilename) {
      return res.status(400).json({
        success: false,
        message: '缺少必要的参数：filename 和 newFilename'
      })
    }

    const invalidChars = /[<>:"/\|?*]/g
    if (invalidChars.test(newFilename)) {
      return res.status(400).json({
        success: false,
        message: '文件名包含非法字符'
      })
    }

    let targetDir = uploadsDir
    if (folder && folder !== 'root') {
      const resolvedTargetDir = resolveExistingFolderPath(folder)
      if (!resolvedTargetDir) {
        return res.status(400).json({
          success: false,
          message: '无效的文件夹路径'
        })
      }
      targetDir = resolvedTargetDir
    }

    const sourcePath = path.join(targetDir, filename)
    const targetPath = path.join(targetDir, newFilename)

    if (!fs.existsSync(sourcePath)) {
      return res.status(404).json({
        success: false,
        message: '源文件不存在'
      })
    }

    if (fs.existsSync(targetPath)) {
      return res.status(400).json({
        success: false,
        message: '目标文件已存在'
      })
    }

    fs.renameSync(sourcePath, targetPath)

    const url = folder && folder !== 'root'
      ? `/uploads/${folder}/${newFilename}`
      : `/uploads/${newFilename}`

    res.json({
      success: true,
      message: '文件重命名成功',
      data: {
        oldFilename: filename,
        newFilename: newFilename,
        url
      }
    })
  } catch (error) {
    console.error('重命名文件失败:', error)
    res.status(500).json({
      success: false,
      message: '重命名文件失败'
    })
  }
})

router.delete('/files/batch', authenticateToken, requireEditor, async (req, res) => {
  try {
    const { filenames, folder, type } = req.body

    if (!Array.isArray(filenames) || filenames.length === 0) {
      return res.status(400).json({
        success: false,
        message: '缺少必要的参数：filenames 数组'
      })
    }

    let targetDir = uploadsDir
    if (folder && folder !== 'root') {
      const resolvedTargetDir = resolveExistingFolderPath(folder)
      if (!resolvedTargetDir) {
        return res.status(400).json({
          success: false,
          message: '无效的文件夹路径'
        })
      }
      targetDir = resolvedTargetDir
    } else if (folder === 'root') {
      targetDir = uploadsDir
    } else if (type === 'images') {
      targetDir = imagesDir
    } else if (type === 'files') {
      targetDir = filesDir
    }

    const deletedFiles = []
    const errors = []

    for (const filename of filenames) {
      const filePath = path.join(targetDir, filename)

      if (!fs.existsSync(filePath)) {
        errors.push({ filename, reason: '文件不存在' })
        continue
      }

      try {
        fs.unlinkSync(filePath)
        deletedFiles.push(filename)
      } catch (err) {
        errors.push({ filename, reason: err.message })
      }
    }

    res.json({
      success: true,
      message: '批量删除操作完成',
      data: {
        deleted: deletedFiles,
        errors
      }
    })
  } catch (error) {
    console.error('批量删除文件失败:', error)
    res.status(500).json({
      success: false,
      message: '批量删除文件失败'
    })
  }
})

router.get('/folders', authenticateToken, requireEditor, async (req, res) => {
  try {
    const folders = []

    // 添加根目录
    folders.push({ id: 'root', name: 'root', path: 'root', type: 'root' })

    // 扫描 uploads 目录结构
    const scanDirectory = (dirPath, basePath, parentId) => {
      if (!fs.existsSync(dirPath)) return []

      const result = []
      let directoryItems = []
      try {
        directoryItems = fs.readdirSync(dirPath, { withFileTypes: true })
          .filter(item => item.isDirectory())
      } catch (error) {
        console.error('Error reading directory:', dirPath, error)
        return result
      }

      const items = directoryItems.map(dir => {
        const dirName = dir.name
        const fullPath = basePath ? `${basePath}/${dirName}` : dirName
        const fullId = parentId ? `${parentId}_${dirName}` : dirName
        return {
          id: fullId,
          name: dirName,
          path: fullPath,
          type: 'folder'
        }
      })

      result.push(...items)

      // Recursively scan subdirectories
      for (const item of items) {
        const subDirPath = path.join(dirPath, item.name)
        const subItems = scanDirectory(subDirPath, item.path, item.id)
        result.push(...subItems)
      }

      return result
    }

    // 扫描 uploads 目录（用户可操作）
    const uploadsItems = scanDirectory(uploadsDir, '', 'uploads')
    folders.push(...uploadsItems)

    res.json({
      success: true,
      data: folders
    })
  } catch (error) {
    console.error('获取文件夹列表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取文件夹列表失败'
    })
  }
})

// 创建文件夹
router.post('/folder', authenticateToken, requireEditor, async (req, res) => {
  try {
    const { name, parentPath } = req.body

    if (!name) {
      return res.status(400).json({
        success: false,
        message: '文件夹名称不能为空'
      })
    }

    const invalidChars = /[<>:"/\|?*]/g
    if (invalidChars.test(name)) {
      return res.status(400).json({
        success: false,
        message: '文件夹名称包含无效字符'
      })
    }

    let parentDir = uploadsDir
    if (parentPath && parentPath !== 'root') {
      const resolvedParent = resolveExistingFolderPath(parentPath)
      if (!resolvedParent) {
        return res.status(400).json({
          success: false,
          message: '无效的父级路径'
        })
      }
      parentDir = resolvedParent
    }

    const targetDir = path.join(parentDir, name)

    if (fs.existsSync(targetDir)) {
      return res.status(400).json({
        success: false,
        message: '文件夹已存在'
      })
    }

    fs.mkdirSync(targetDir, { recursive: true })

    const folderPath = parentPath && parentPath !== 'root'
      ? `${parentPath}/${name}`
      : name

    res.json({
      success: true,
      message: '文件夹创建成功',
      data: {
        name,
        path: folderPath
      }
    })
  } catch (error) {
    console.error('创建文件夹失败:', error)
    res.status(500).json({
      success: false,
      message: '创建文件夹失败'
    })
  }
})

// 重命名文件夹
router.put('/folder/rename', authenticateToken, requireEditor, async (req, res) => {
  try {
    const { folderPath, newFolderName } = req.body

    if (!folderPath || !newFolderName) {
      return res.status(400).json({
        success: false,
        message: '缺少必要的参数：folderPath 和 newFolderName'
      })
    }

    const invalidChars = /[<>:"/\|?*]/g
    if (invalidChars.test(newFolderName)) {
      return res.status(400).json({
        success: false,
        message: '文件夹名称包含无效字符'
      })
    }

    const sourcePath = resolveExistingFolderPath(folderPath)
    if (!sourcePath) {
      return res.status(404).json({
        success: false,
        message: '源文件夹不存在'
      })
    }

    const parentDir = path.dirname(sourcePath)
    const targetPath = path.join(parentDir, newFolderName)

    if (fs.existsSync(targetPath)) {
      return res.status(400).json({
        success: false,
        message: '目标文件夹名已存在'
      })
    }

    fs.renameSync(sourcePath, targetPath)

    const lastSlash = folderPath.lastIndexOf('/')
    const newFolderPath = lastSlash === -1
      ? newFolderName
      : `${folderPath.substring(0, lastSlash)}/${newFolderName}`

    res.json({
      success: true,
      message: '文件夹重命名成功',
      data: {
        oldFolderPath: folderPath,
        newFolderPath
      }
    })
  } catch (error) {
    console.error('重命名文件夹失败:', error)
    res.status(500).json({
      success: false,
      message: '重命名文件夹失败'
    })
  }
})

// 复制文件
router.post('/file/copy', authenticateToken, requireEditor, async (req, res) => {
  try {
    const { sourceFilename, targetFilename, sourceFolder, targetFolder } = req.body

    if (!sourceFilename || !targetFilename) {
      return res.status(400).json({
        success: false,
        message: '缺少必要的参数：sourceFilename 和 targetFilename'
      })
    }

    const invalidChars = /[<>:"/\|?*]/g
    if (invalidChars.test(targetFilename)) {
      return res.status(400).json({
        success: false,
        message: '目标文件名包含非法字符'
      })
    }

    let sourceDir = uploadsDir
    if (sourceFolder && sourceFolder !== 'root') {
      const resolvedSourceDir = resolveExistingFolderPath(sourceFolder)
      if (!resolvedSourceDir) {
        return res.status(400).json({
          success: false,
          message: '无效的源文件夹路径'
        })
      }
      sourceDir = resolvedSourceDir
    }

    const sourcePath = path.join(sourceDir, sourceFilename)

    if (!fs.existsSync(sourcePath)) {
      return res.status(404).json({
        success: false,
        message: '源文件不存在'
      })
    }

    let targetDir = uploadsDir
    if (targetFolder && targetFolder !== 'root') {
      const resolvedTargetDir = resolveExistingFolderPath(targetFolder)
      if (!resolvedTargetDir) {
        return res.status(400).json({
          success: false,
          message: '无效的目标文件夹路径'
        })
      }
      targetDir = resolvedTargetDir
    }

    const targetPath = path.join(targetDir, targetFilename)

    if (fs.existsSync(targetPath)) {
      return res.status(400).json({
        success: false,
        message: '目标文件已存在'
      })
    }

    fs.copyFileSync(sourcePath, targetPath)

    const url = targetFolder && targetFolder !== 'root'
      ? `/uploads/${targetFolder}/${targetFilename}`
      : `/uploads/${targetFilename}`

    res.json({
      success: true,
      message: '文件复制成功',
      data: {
        sourceFilename,
        targetFilename,
        url
      }
    })
  } catch (error) {
    console.error('复制文件失败:', error)
    res.status(500).json({
      success: false,
      message: '复制文件失败'
    })
  }
})

router.post('/folder/copy', authenticateToken, requireEditor, async (req, res) => {
  try {
    const { sourceFolderPath, targetFolderName, targetParentPath } = req.body

    if (!sourceFolderPath || !targetFolderName) {
      return res.status(400).json({
        success: false,
        message: '缺少必要的参数：sourceFolderPath 和 targetFolderName'
      })
    }

    // 验证目标文件夹名称的安全性
    const invalidChars = /[<>:"/\\|?*]/g
    if (invalidChars.test(targetFolderName)) {
      return res.status(400).json({
        success: false,
        message: '目标文件夹名称包含无效字符'
      })
    }

    if (sourceFolderPath === 'root') {
      return res.status(400).json({
        success: false,
        message: '不支持复制根目录'
      })
    }

    const sourceDir = resolveExistingFolderPath(sourceFolderPath)

    // 检查源文件夹是否存在
    if (!sourceDir || !fs.existsSync(sourceDir)) {
      return res.status(404).json({
        success: false,
        message: '源文件夹不存在'
      })
    }

    // 确定目标父目录路径
    let targetParentDir
    if (targetParentPath && targetParentPath !== 'root') {
      const resolvedParent = resolveExistingFolderPath(targetParentPath)
      if (!resolvedParent) {
        return res.status(400).json({
          success: false,
          message: '无效的目标父级路径'
        })
      }
      targetParentDir = resolvedParent
    } else {
      targetParentDir = uploadsDir
    }

    // 确保目标父目录存在
    if (!fs.existsSync(targetParentDir)) {
      fs.mkdirSync(targetParentDir, { recursive: true })
    }

    const targetPath = path.join(targetParentDir, targetFolderName)

    // 检查目标文件夹是否已存在
    if (fs.existsSync(targetPath)) {
      return res.status(400).json({
        success: false,
        message: '目标文件夹名已存在'
      })
    }

    // 递归复制文件夹
    const copyFolderRecursive = (src, dest) => {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true })
      }

      const items = fs.readdirSync(src, { withFileTypes: true })
      for (const item of items) {
        const srcPath = path.join(src, item.name)
        const destPath = path.join(dest, item.name)

        if (item.isDirectory()) {
          copyFolderRecursive(srcPath, destPath)
        } else {
          fs.copyFileSync(srcPath, destPath)
        }
      }
    }

    copyFolderRecursive(sourceDir, targetPath)

    // 构建新的路径
    let newFolderPath
    if (targetParentPath) {
      newFolderPath = `${targetParentPath}/${targetFolderName}`
    } else {
      newFolderPath = targetFolderName
    }

    res.json({
      success: true,
      message: '文件夹复制成功',
      data: {
        sourceFolderPath: sourceFolderPath,
        targetFolderPath: newFolderPath
      }
    })
  } catch (error) {
    console.error('复制文件夹失败:', error)
    res.status(500).json({
      success: false,
      message: '复制文件夹失败'
    })
  }
})

// 移动文件
router.post('/file/move', authenticateToken, requireEditor, async (req, res) => {
  try {
    const { sourceFilename, targetFilename, sourceFolder, targetFolder } = req.body

    if (!sourceFilename || !targetFilename) {
      return res.status(400).json({
        success: false,
        message: '缺少必要的参数：sourceFilename 和 targetFilename'
      })
    }

    const invalidChars = /[<>:"/\|?*]/g
    if (invalidChars.test(targetFilename)) {
      return res.status(400).json({
        success: false,
        message: '目标文件名包含无效字符'
      })
    }

    let sourceDir = uploadsDir
    if (sourceFolder && sourceFolder !== 'root') {
      const resolvedSourceDir = resolveExistingFolderPath(sourceFolder)
      if (!resolvedSourceDir) {
        return res.status(400).json({
          success: false,
          message: '无效的源文件夹路径'
        })
      }
      sourceDir = resolvedSourceDir
    }

    const sourcePath = path.join(sourceDir, sourceFilename)

    if (!fs.existsSync(sourcePath)) {
      return res.status(404).json({
        success: false,
        message: '源文件不存在'
      })
    }

    let targetDir = uploadsDir
    if (targetFolder && targetFolder !== 'root') {
      const resolvedTargetDir = resolveExistingFolderPath(targetFolder)
      if (!resolvedTargetDir) {
        return res.status(400).json({
          success: false,
          message: '无效的目标文件夹路径'
        })
      }
      targetDir = resolvedTargetDir
    }

    const targetPath = path.join(targetDir, targetFilename)

    if (fs.existsSync(targetPath)) {
      return res.status(400).json({
        success: false,
        message: '目标文件已存在'
      })
    }

    fs.renameSync(sourcePath, targetPath)

    const url = targetFolder && targetFolder !== 'root'
      ? `/uploads/${targetFolder}/${targetFilename}`
      : `/uploads/${targetFilename}`

    res.json({
      success: true,
      message: '文件移动成功',
      data: {
        sourceFilename,
        targetFilename,
        url
      }
    })
  } catch (error) {
    console.error('移动文件失败:', error)
    res.status(500).json({
      success: false,
      message: '移动文件失败'
    })
  }
})

// 移动文件夹
router.post('/folder/move', authenticateToken, requireEditor, async (req, res) => {
  try {
    const { sourceFolderPath, targetFolderName, targetParentPath } = req.body

    if (!sourceFolderPath || !targetFolderName) {
      return res.status(400).json({
        success: false,
        message: '缺少必要的参数：sourceFolderPath 和 targetFolderName'
      })
    }

    if (sourceFolderPath === 'root') {
      return res.status(400).json({
        success: false,
        message: '不支持移动根目录'
      })
    }

    const invalidChars = /[<>:"/\|?*]/g
    if (invalidChars.test(targetFolderName)) {
      return res.status(400).json({
        success: false,
        message: '目标文件夹名称包含无效字符'
      })
    }

    const sourceDir = resolveExistingFolderPath(sourceFolderPath)
    if (!sourceDir || !fs.existsSync(sourceDir)) {
      return res.status(404).json({
        success: false,
        message: '源文件夹不存在'
      })
    }

    let targetParentDir = uploadsDir
    if (targetParentPath && targetParentPath !== 'root') {
      const resolvedParent = resolveExistingFolderPath(targetParentPath)
      if (!resolvedParent) {
        return res.status(400).json({
          success: false,
          message: '无效的目标父级路径'
        })
      }
      targetParentDir = resolvedParent
    }

    const targetPath = path.join(targetParentDir, targetFolderName)

    if (fs.existsSync(targetPath)) {
      return res.status(400).json({
        success: false,
        message: '目标文件夹名已存在'
      })
    }

    fs.renameSync(sourceDir, targetPath)

    const newFolderPath = targetParentPath && targetParentPath !== 'root'
      ? `${targetParentPath}/${targetFolderName}`
      : targetFolderName

    res.json({
      success: true,
      message: '文件夹移动成功',
      data: {
        sourceFolderPath,
        targetFolderPath: newFolderPath
      }
    })
  } catch (error) {
    console.error('移动文件夹失败:', error)
    res.status(500).json({
      success: false,
      message: '移动文件夹失败'
    })
  }
})

// 删除文件夹
router.delete('/folder', authenticateToken, requireEditor, async (req, res) => {
  try {
    const { folderPath } = req.query

    if (!folderPath || folderPath === 'root') {
      return res.status(400).json({
        success: false,
        message: '无效的文件夹路径'
      })
    }

    const decodedFolderPath = decodeURIComponent(folderPath)
    const targetPath = resolveExistingFolderPath(decodedFolderPath)

    if (!targetPath || !fs.existsSync(targetPath)) {
      return res.status(404).json({
        success: false,
        message: '文件夹不存在'
      })
    }

    const items = fs.readdirSync(targetPath)
    if (items.length > 0) {
      return res.status(400).json({
        success: false,
        message: '文件夹不为空，无法删除'
      })
    }

    fs.rmdirSync(targetPath)

    res.json({
      success: true,
      message: '文件夹删除成功'
    })
  } catch (error) {
    console.error('删除文件夹失败:', error)
    res.status(500).json({
      success: false,
      message: '删除文件夹失败'
    })
  }
})

module.exports = router
