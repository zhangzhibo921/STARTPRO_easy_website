const express = require('express')
const router = express.Router()
const db = require('../config/database')
const { authenticateToken, requireEditor, logActivity } = require('../middleware/auth')
const {
  validateCreateDoc,
  validateUpdateDoc,
  validateDocListQuery,
  validateId,
  validateDocSlugPath
} = require('../middleware/validation')

const normalizeSlug = (slug) => {
  if (!slug || typeof slug !== 'string') return ''
  return slug.trim().replace(/^\/+|\/+$/g, '').toLowerCase()
}

const buildTree = (flatDocs) => {
  const map = new Map()
  const roots = []
  flatDocs.forEach((doc) => map.set(doc.id, { ...doc, children: [] }))
  flatDocs.forEach((doc) => {
    const node = map.get(doc.id)
    if (doc.parent_id && map.has(doc.parent_id)) map.get(doc.parent_id).children.push(node)
    else roots.push(node)
  })
  const sortNodes = (nodes) => {
    nodes.sort((a, b) => (a.sort_order === b.sort_order ? a.id - b.id : a.sort_order - b.sort_order))
    nodes.forEach((n) => sortNodes(n.children))
  }
  sortNodes(roots)
  return roots
}

// Tree for both admin/public
router.get('/tree', async (req, res) => {
  try {
    const [docs] = await db.execute(
      `SELECT id, title, slug, parent_id, sort_order, status, type
       FROM docs
       ORDER BY parent_id ASC, sort_order ASC, id ASC`
    )
    res.json({ success: true, data: buildTree(docs) })
  } catch (error) {
    console.error('get docs tree failed', error)
    res.status(500).json({ success: false, message: '获取文档树失败' })
  }
})

// Admin list
router.get('/list', authenticateToken, requireEditor, validateDocListQuery, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, parent_id } = req.query
    const pageNum = Number(page) || 1
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 10))
    const offset = (pageNum - 1) * limitNum
    const filters = []
    const params = []

    if (search) {
      filters.push('(title LIKE ? OR slug LIKE ?)')
      params.push(`%${search}%`, `%${search}%`)
    }
    if (status) {
      filters.push('status = ?')
      params.push(status)
    }
    if (parent_id !== undefined && parent_id !== null && parent_id !== '') {
      filters.push('parent_id = ?')
      params.push(Number(parent_id))
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : ''
    const [countRows] = await db.execute(`SELECT COUNT(*) AS total FROM docs ${whereClause}`, params)
    const total = countRows[0].total

    const [rows] = await db.execute(
      `SELECT id, title, slug, parent_id, sort_order, status, type, summary, cover, published_at, created_at, updated_at
       FROM docs
       ${whereClause}
       ORDER BY parent_id ASC, sort_order ASC, id DESC
       LIMIT ${limitNum} OFFSET ${offset}`,
      params
    )

    res.json({
      success: true,
      data: rows,
      meta: {
        current_page: pageNum,
        per_page: limitNum,
        total,
        total_pages: Math.ceil(total / limitNum),
        has_next: pageNum * limitNum < total,
        has_prev: pageNum > 1
      }
    })
  } catch (error) {
    console.error('list docs failed:', error)
    res.status(500).json({ success: false, message: '获取文档列表失败' })
  }
})

// Admin get by id
router.get('/id/:id', authenticateToken, requireEditor, validateId, async (req, res) => {
  try {
    const { id } = req.params
    const [docs] = await db.execute(
      `SELECT id, title, slug, parent_id, sort_order, status, type, content, summary, cover, published_at, created_at, updated_at
       FROM docs
       WHERE id = ?
       LIMIT 1`,
      [id]
    )
    if (!docs.length) return res.status(404).json({ success: false, message: '文档不存在' })
    res.json({ success: true, data: docs[0] })
  } catch (error) {
    console.error('get doc detail failed:', error)
    res.status(500).json({ success: false, message: '获取文档详情失败' })
  }
})

// Public get by slug (only published). Folder -> try index doc
router.get(
  '/:slugPath(*)',
  (req, res, next) => {
    if (req.params && req.params[0] && !req.params.slugPath) req.params.slugPath = req.params[0]
    if (req.params && req.params[0]) delete req.params[0]
    next()
  },
  validateDocSlugPath,
  async (req, res) => {
    try {
      const slugPath = normalizeSlug(req.params.slugPath)
      const [docs] = await db.execute(
        `SELECT id, title, slug, parent_id, sort_order, status, type, content, summary, cover, published_at, created_at, updated_at
         FROM docs
         WHERE slug = ?
         LIMIT 1`,
        [slugPath]
      )

      if (!docs.length || docs[0].status !== 'published') {
        return res.status(404).json({ success: false, message: '文档不存在' })
      }

      if (docs[0].type === 'folder') {
        return res.status(404).json({ success: false, message: '文档不存在' })
      }

      res.json({ success: true, data: docs[0] })
    } catch (error) {
      console.error('get doc detail failed:', error)
      res.status(500).json({ success: false, message: '获取文档详情失败' })
    }
  }
)

// Create doc/folder
router.post(
  '/',
  authenticateToken,
  requireEditor,
  validateCreateDoc,
  logActivity('create', 'doc'),
  async (req, res) => {
    try {
      const payload = { ...req.body }
      payload.slug = normalizeSlug(payload.slug)
      payload.parent_id = payload.parent_id ? Number(payload.parent_id) : null
      payload.sort_order = Number.isFinite(Number(payload.sort_order)) ? Number(payload.sort_order) : 0
      payload.status = payload.status || 'draft'
      payload.type = payload.type || 'doc'

      if (!payload.slug) return res.status(400).json({ success: false, message: 'slug 不能为空' })

      if (payload.parent_id) {
        const [parents] = await db.execute('SELECT id, type FROM docs WHERE id = ?', [payload.parent_id])
        if (!parents.length) return res.status(400).json({ success: false, message: '父级文档不存在' })
        if (parents[0].type !== 'folder') {
          return res.status(400).json({ success: false, message: '父级必须是文件夹' })
        }
      }

      if (payload.type === 'folder' && payload.parent_id) {
        return res.status(400).json({ success: false, message: '文件夹不允许设置父级' })
      }

      const [exists] = await db.execute('SELECT id FROM docs WHERE slug = ?', [payload.slug])
      if (exists.length > 0) return res.status(400).json({ success: false, message: 'slug 已存在' })

      const publishedAt = payload.status === 'published' ? new Date() : null

      if (payload.type === 'folder') {
        payload.content = ''
        payload.summary = null
        payload.cover = null
      }

      const [result] = await db.execute(
        `INSERT INTO docs (
            title, slug, parent_id, sort_order, status, type, content, summary, cover,
            published_at, created_by, updated_by
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          payload.title,
          payload.slug,
          payload.parent_id || null,
          payload.sort_order || 0,
          payload.status,
          payload.type,
          payload.content,
          payload.summary || null,
          payload.cover || null,
          publishedAt,
          req.user?.id || null,
          req.user?.id || null
        ]
      )

      res.status(201).json({
        success: true,
        message: '文档创建成功',
        data: { id: result.insertId, ...payload, published_at: publishedAt }
      })
    } catch (error) {
      console.error('创建文档失败:', error)
      res.status(500).json({ success: false, message: '创建文档失败' })
    }
  }
)

// Update doc/folder
router.put(
  '/:id',
  authenticateToken,
  requireEditor,
  validateId,
  validateUpdateDoc,
  logActivity('update', 'doc'),
  async (req, res) => {
    const { id } = req.params
    try {
      const [existingRows] = await db.execute('SELECT * FROM docs WHERE id = ?', [id])
      if (!existingRows.length) return res.status(404).json({ success: false, message: '文档不存在' })
      const existing = existingRows[0]

      const payload = { ...req.body }
      const updates = []
      const values = []

      if (payload.slug !== undefined) {
        payload.slug = normalizeSlug(payload.slug)
        if (!payload.slug) return res.status(400).json({ success: false, message: 'slug 不能为空' })
        const [conflicts] = await db.execute('SELECT id FROM docs WHERE slug = ? AND id != ?', [payload.slug, id])
        if (conflicts.length) return res.status(400).json({ success: false, message: 'slug 已存在' })
      }

      if (payload.parent_id !== undefined) {
        if (Number(payload.parent_id) === Number(id)) {
          return res.status(400).json({ success: false, message: '父级不能是自己' })
        }
        if (payload.parent_id) {
          const [parents] = await db.execute('SELECT id, type FROM docs WHERE id = ?', [payload.parent_id])
          if (!parents.length) return res.status(400).json({ success: false, message: '父级文档不存在' })
          if (parents[0].type !== 'folder') {
            return res.status(400).json({ success: false, message: '父级必须是文件夹' })
          }
        }
      }

      const nextType = payload.type || existing.type
      if (nextType === 'folder' && (payload.parent_id || existing.parent_id)) {
        return res.status(400).json({ success: false, message: '文件夹不允许设置父级' })
      }

      const allowed = ['title', 'slug', 'parent_id', 'sort_order', 'status', 'type', 'content', 'summary', 'cover']
      allowed.forEach((field) => {
        if (payload[field] !== undefined) {
          let value = payload[field]
          if (field === 'parent_id') value = payload[field] ? Number(payload[field]) : null
          if (field === 'sort_order') value = Number.isFinite(Number(payload[field])) ? Number(payload[field]) : 0
          if (field === 'summary' || field === 'cover') value = payload[field] === '' ? null : payload[field]
          updates.push(`${field} = ?`)
          values.push(value)
        }
      })

      if (!updates.length) return res.status(400).json({ success: false, message: '没有可更新的字段' })

      let publishedAt = existing.published_at
      if (payload.status) {
        if (payload.status === 'published' && !publishedAt) publishedAt = new Date()
        if (payload.status === 'draft') publishedAt = null
      }

      if (nextType === 'folder') {
        const pushOrSet = (field, val) => {
          const idx = updates.findIndex((u) => u.startsWith(`${field} =`))
          if (idx === -1) {
            updates.push(`${field} = ?`)
            values.push(val)
          } else {
            values[idx] = val
          }
        }
        pushOrSet('content', '')
        pushOrSet('summary', null)
        pushOrSet('cover', null)
      }

      updates.push('published_at = ?')
      values.push(publishedAt)
      updates.push('updated_by = ?')
      values.push(req.user?.id || null)
      updates.push('updated_at = NOW()')
      values.push(id)

      await db.execute(`UPDATE docs SET ${updates.join(', ')} WHERE id = ?`, values)

      res.json({ success: true, message: '文档更新成功' })
    } catch (error) {
      console.error('更新文档失败:', error)
      res.status(500).json({ success: false, message: '更新文档失败', detail: error.message })
    }
  }
)

// Delete
router.delete(
  '/:id',
  authenticateToken,
  requireEditor,
  validateId,
  logActivity('delete', 'doc'),
  async (req, res) => {
    const { id } = req.params
    try {
      const [existing] = await db.execute('SELECT id FROM docs WHERE id = ?', [id])
      if (!existing.length) return res.status(404).json({ success: false, message: '文档不存在' })

      await db.execute('DELETE FROM docs WHERE id = ?', [id])

      res.json({ success: true, message: '文档删除成功' })
    } catch (error) {
      console.error('删除文档失败:', error)
      res.status(500).json({ success: false, message: '删除文档失败' })
    }
  }
)

module.exports = router
