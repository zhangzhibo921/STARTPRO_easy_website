import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Eye, EyeOff, Lock, User, LogIn } from 'lucide-react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Cookies from 'js-cookie'
import { authApi } from '@/utils/api'
import type { LoginForm } from '@/types'

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginForm>()

  // 检查是否已登录
  useEffect(() => {
    const checkExistingAuth = async () => {
      const token = Cookies.get('auth-token')
      console.log('登录页: 检查现有token:', token)
      
      if (token) {
        try {
          console.log('登录页: 验证token有效性')
          const response = await authApi.getProfile()
          if (response.success) {
            console.log('登录页: token有效，重定向到dashboard')
            router.push('/admin/dashboard')
          } else {
            console.log('登录页: token无效，清除cookie')
            Cookies.remove('auth-token')
          }
        } catch (error) {
          console.log('登录页: token验证失败，清除cookie')
          Cookies.remove('auth-token')
        }
      }
    }
    
    checkExistingAuth()
  }, [router])

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    
    try {
      console.log('开始登录:', data.username)
      // 确保API调用使用正确的基础URL
      const response = await authApi.login(data)
      console.log('登录响应:', response)
      
      if (response.success) {
        // 保存token
        console.log('设置cookie, token:', response.data.token)
        Cookies.set('auth-token', response.data.token, {
          // 不设置 expires => 会话 Cookie，关闭浏览器后失效
          secure: false, // 开发环境中设置为false
          sameSite: 'lax'
        })
        
        // 验证cookie是否正确设置
        const savedToken = Cookies.get('auth-token')
        console.log('验证保存的token:', savedToken)
        
        toast.success('登录成功！')
        
        // 添加小延迟确保 cookie 正确设置
        setTimeout(() => {
          console.log('重定向到 dashboard')
          router.push('/admin/dashboard')
        }, 100)
      } else {
        console.log('登录失败:', response.message)
        toast.error(response.message || '登录失败')
      }
    } catch (error: any) {
      console.error('登录错误:', error)
      // 更详细的错误信息
      const errorMessage = error.response?.data?.message || error.message || '登录失败，请稍后重试'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>管理员登录 - 后台管理系统</title>
        <meta name="description" content="后台管理系统登录页面" />
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-screen bg-tech-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {/* 背景效果 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-tech-dark via-tech-darker to-tech-dark"></div>
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          ></div>
          
          {/* 浮动粒子 */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-tech-accent rounded-full opacity-30 animate-float"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-tech-secondary rounded-full opacity-40 animate-float delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-tech-accent rounded-full opacity-20 animate-float delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-md w-full space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card-tech"
          >
            {/* Logo和标题 */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto h-16 w-16 bg-gradient-to-r from-tech-accent to-tech-secondary rounded-xl flex items-center justify-center mb-4"
              >
                <Lock className="h-8 w-8 text-white" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-white">
                管理员登录
              </h2>
              <p className="mt-2 text-gray-400">
                请使用您的管理员账户登录系统
              </p>
            </div>

            {/* 登录表单 */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* 用户名输入 */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  用户名
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('username', { 
                      required: '请输入用户名',
                      minLength: { value: 3, message: '用户名至少3个字符' }
                    })}
                    type="text"
                    className="input-tech pl-10 w-full"
                    placeholder="请输入用户名"
                    autoComplete="username"
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* 密码输入 */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  密码
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('password', { 
                      required: '请输入密码',
                      minLength: { value: 6, message: '密码至少6个字符' }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className="input-tech pl-10 pr-10 w-full"
                    placeholder="请输入密码"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* 登录按钮 */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary flex items-center justify-center space-x-2 py-3"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>登录中...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    <span>登录</span>
                  </>
                )}
              </motion.button>
            </form>

            {/* 提示信息 */}
            <div className="mt-6 p-4 bg-tech-accent/10 border border-tech-accent/20 rounded-lg">
              <div className="text-sm text-gray-300">
                <p className="font-medium text-tech-accent mb-1">默认账户信息：</p>
                <p>用户名: admin</p>
                <p>密码: admin123</p>
                <p className="text-yellow-400 text-xs mt-2">
                  ⚠️ 首次登录后请立即修改密码
                </p>
              </div>
            </div>
          </motion.div>

          {/* 版权信息 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-center text-sm text-gray-500"
          >
            <p>© 2024 科技公司后台管理系统</p>
          </motion.div>
        </div>
      </div>
    </>
  )
}
