import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import { ApiResponse, PaginatedResponse, PageContent, Doc } from '@/types'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    // 检查是否在浏览器环境中
    const isBrowser = typeof window !== 'undefined'
    
    this.client = axios.create({
      baseURL: isBrowser 
        ? '/api'  // 浏览器中使用相对路径，通过Next.js代理
        : process.env.NODE_ENV === 'production' 
          ? 'https://your-domain.com/api' 
          : 'http://localhost:3001/api', // 服务器端直接访问后端
      timeout: 10000,
      withCredentials: true, // 允许携带凭证
    })

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        const token = Cookies.get('auth-token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        return response
      },
      (error) => {
        if (error.response?.status === 401) {
          Cookies.remove('auth-token')
          if (typeof window !== 'undefined') {
            window.location.href = '/admin/login'
          }
        }
        
        const message = error.response?.data?.message || '请求失败，请稍后重试'
        // 只在浏览器环境中显示toast
        if (typeof window !== 'undefined') {
          toast.error(message)
        }
        
        return Promise.reject(error)
      }
    )
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, config)
    return response.data
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data, config)
    return response.data
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data, config)
    return response.data
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url, config)
    return response.data
  }

  async upload(url: string, file: File, onProgress?: (progress: number) => void, extraData?: Record<string, any>): Promise<ApiResponse> {
    const formData = new FormData()

    // 添加额外数据 first
    if (extraData) {
      Object.keys(extraData).forEach(key => {
        formData.append(key, extraData[key])
      })
    }

    // 然后添加文件
    formData.append('file', file)

    const response = await this.client.post(url, formData, {
      // 不设置 Content-Type，让浏览器自动设置 multipart/form-data 及边界
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })

    return response.data
  }
}

export const api = new ApiClient()

// API方法
export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/auth/login', credentials),

  logout: () => api.post('/auth/logout'),

  getProfile: () => api.get('/auth/profile'),

  updateProfile: (data: any) => api.put('/auth/profile', data),

  checkAuth: () => api.get('/auth/check'),
}

export const pagesApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; category?: string }): Promise<PaginatedResponse<PageContent>> =>
    api.get('/pages', { params }) as Promise<PaginatedResponse<PageContent>>,
  
  getById: (id: string) => api.get(`/pages/${id}`),
  
  getComponents: (id: string) => api.get(`/pages/${id}/components`),
  
  getBySlug: (slug: string) => api.get(`/pages/slug/${slug}`),
  
  create: (data: any) => api.post('/pages', data),
  
  update: (id: string, data: any) => api.put(`/pages/${id}`, data),
  
  delete: (id: string) => api.delete(`/pages/${id}`),
}

export const navigationApi = {
  getAll: () => api.get('/navigation'),
  
  getAdmin: () => api.get('/navigation/admin'),
  
  getById: (id: string) => api.get(`/navigation/${id}`),
  
  create: (data: any) => api.post('/navigation', data),
  
  update: (id: string, data: any) => api.put(`/navigation/${id}`, data),
  
  delete: (id: string) => api.delete(`/navigation/${id}`),
  
  updateSort: (items: { id: string; sort_order: number }[]) => 
    api.put('/navigation/batch/sort', { items }),
}

export const settingsApi = {
  get: () => api.get('/settings'),
  
  update: (data: any) => api.put('/settings', data),
}

export const statsApi = {
  getDashboard: () => api.get('/stats/dashboard'),

  getAnalytics: (params?: { range?: string }) => api.get('/stats/analytics', { params }),

  getUserStats: () => api.get('/stats/users'),

  getSystemStats: () => api.get('/stats/system'),
}

export const notificationsApi = {
  getEmailSettings: () => api.get('/notifications/email'),
  updateEmailSettings: (data: any) => api.put('/notifications/email', data),
  sendTestEmail: (data: any) => api.post('/notifications/email/test', data),
  getMessages: (params?: any) => api.get('/notifications/messages', { params }),
  getMessage: (id: string | number) => api.get(`/notifications/messages/${id}`),
  markMessageRead: (id: string | number, status: 'new' | 'read') => api.put(`/notifications/messages/${id}/read`, { status }),
  deleteMessage: (id: string | number) => api.delete(`/notifications/messages/${id}`),
  resendMessage: (id: string | number) => api.post(`/notifications/messages/${id}/resend`)
}

export const uploadApi = {
  image: (file: File, onProgress?: (progress: number) => void, folder?: string) =>
    api.upload('/upload/image', file, onProgress, folder ? { folder } : undefined),

  file: (file: File, onProgress?: (progress: number) => void, folder?: string) =>
    api.upload('/upload/file', file, onProgress, folder ? { folder } : undefined),

  getFiles: (params?: { type?: string; folder?: string; page?: number; limit?: number }) =>
    api.get('/upload/files', { params }),

  getFolders: () => api.get('/upload/folders'),

  deleteFile: (fileId: string, folder?: string) =>
    api.delete(`/upload/file/${fileId}`, {
      params: folder ? { folder } : undefined
    }),

  renameFile: (filename: string, newFilename: string, type: string = 'images', folder?: string) =>
    api.put('/upload/file/rename', { filename, newFilename, type, folder }),

  batchDeleteFiles: (filenames: string[], type: string = 'images', folder?: string) =>
    api.delete('/upload/files/batch', { data: { filenames, type, folder } }),

  createFolder: (name: string, parentPath?: string) =>
    api.post('/upload/folder', { name, parentPath }),

  renameFolder: (folderPath: string, newFolderName: string) =>
    api.put('/upload/folder/rename', { folderPath, newFolderName }),

  deleteFolder: (folderPath: string) =>
    api.delete('/upload/folder', {
      params: { folderPath }
    }),

  copyFile: (sourceFilename: string, targetFilename: string, sourceFolder?: string, targetFolder?: string) =>
    api.post('/upload/file/copy', { sourceFilename, targetFilename, sourceFolder, targetFolder }),

  copyFolder: (sourceFolderPath: string, targetFolderName: string, targetParentPath?: string) =>
    api.post('/upload/folder/copy', { sourceFolderPath, targetFolderName, targetParentPath }),

  moveFile: (sourceFilename: string, targetFilename: string, sourceFolder?: string, targetFolder?: string) =>
    api.post('/upload/file/move', { sourceFilename, targetFilename, sourceFolder, targetFolder }),

  moveFolder: (sourceFolderPath: string, targetFolderName: string, targetParentPath?: string) =>
    api.post('/upload/folder/move', { sourceFolderPath, targetFolderName, targetParentPath }),
}

export const tagsApi = {
  getAll: async () => {
    const response = await api.get('/tags')
    return response
  },

  create: async (data: { name: string; slug: string; description?: string }) => {
    const response = await api.post('/tags', data)
    return response
  },

  update: async (id: string, data: { name: string; slug: string; description?: string }) => {
    const response = await api.put(`/tags/${id}`, data)
    return response
  },

  delete: async (id: string) => {
    const response = await api.delete(`/tags/${id}`)
    return response
  },

  getPageTags: async (pageId: string) => {
    const response = await api.get(`/tags/page/${pageId}`)
    return response
  },

  setPageTags: async (pageId: string, tagIds: string[]) => {
    const response = await api.post(`/tags/page/${pageId}`, { tagIds })
    return response
  }
}

export const docsApi = {
  getTree: () => api.get('/docs/tree'),
  list: (params?: { page?: number; limit?: number; search?: string; status?: 'draft' | 'published'; parent_id?: number | null }) =>
    api.get('/docs/list', { params }) as Promise<PaginatedResponse<Doc>>,
  getBySlug: (slugPath: string) => api.get(`/docs/${slugPath}`),
  getById: (id: string | number) => api.get(`/docs/id/${id}`),
  create: (data: any) => api.post('/docs', data),
  update: (id: string | number, data: any) => api.put(`/docs/${id}`, data),
  delete: (id: string | number) => api.delete(`/docs/${id}`)
}
