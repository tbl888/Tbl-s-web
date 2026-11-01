// Cloudflare Workers 后台管理系统
// 安全的认证和会话管理

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { hashPassword, verifyPassword } from './utils/password.js'
import { generateSessionToken, validateSessionToken } from './utils/session.js'
import { createUser, getUserByUsername, updateUserLastLogin } from './utils/database.js'

const app = new Hono()

// CORS 配置
app.use('*', cors({
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// 健康检查
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: Date.now() })
})

// 认证路由
const auth = new Hono()

// 用户注册
auth.post('/register', async (c) => {
  try {
    const { username, password, email } = await c.req.json()
    
    // 验证输入
    if (!username || !password || !email) {
      return c.json({ error: '缺少必要字段' }, 400)
    }
    
    // 检查用户是否已存在
    const existingUser = await getUserByUsername(username)
    if (existingUser) {
      return c.json({ error: '用户名已存在' }, 409)
    }
    
    // 创建新用户
    const hashedPassword = await hashPassword(password)
    const user = await createUser(username, hashedPassword, email)
    
    // 返回用户信息（不包含密码）
    const { password: _, ...userInfo } = user
    return c.json({ message: '注册成功', user: userInfo }, 201)
    
  } catch (error) {
    console.error('注册错误:', error)
    return c.json({ error: '服务器内部错误' }, 500)
  }
})

// 用户登录
auth.post('/login', async (c) => {
  try {
    const { username, password } = await c.req.json()
    
    // 验证输入
    if (!username || !password) {
      return c.json({ error: '用户名和密码不能为空' }, 400)
    }
    
    // 获取用户信息
    const user = await getUserByUsername(username)
    if (!user) {
      return c.json({ error: '用户名或密码错误' }, 401)
    }
    
    // 验证密码
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return c.json({ error: '用户名或密码错误' }, 401)
    }
    
    // 生成会话令牌
    const sessionToken = await generateSessionToken(user.id)
    
    // 更新最后登录时间
    await updateUserLastLogin(user.id)
    
    // 设置会话 cookie
    c.cookie('session_token', sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24小时
      path: '/'
    })
    
    // 返回用户信息（不包含密码）
    const { password: _, ...userInfo } = user
    return c.json({ message: '登录成功', user: userInfo }, 200)
    
  } catch (error) {
    console.error('登录错误:', error)
    return c.json({ error: '服务器内部错误' }, 500)
  }
})

// 用户登出
auth.post('/logout', async (c) => {
  try {
    const sessionToken = c.req.cookie('session_token')
    
    if (sessionToken) {
      // 删除会话令牌
      await c.env.SESSIONS.delete(`session:${sessionToken}`)
    }
    
    // 清除 cookie
    c.cookie('session_token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    })
    
    return c.json({ message: '登出成功' }, 200)
    
  } catch (error) {
    console.error('登出错误:', error)
    return c.json({ error: '服务器内部错误' }, 500)
  }
})

// 受保护的路由
const protectedRoutes = new Hono()

// 验证会话
protectedRoutes.use('*', async (c, next) => {
  try {
    const sessionToken = c.req.cookie('session_token')
    
    if (!sessionToken) {
      return c.json({ error: '未登录' }, 401)
    }
    
    const session = await validateSessionToken(sessionToken)
    if (!session) {
      return c.json({ error: '会话已过期' }, 401)
    }
    
    // 将用户信息添加到上下文
    c.set('user', session.user)
    c.set('sessionId', session.sessionId)
    
    await next()
    
  } catch (error) {
    console.error('会话验证错误:', error)
    return c.json({ error: '会话验证失败' }, 401)
  }
})

// 获取当前用户信息
protectedRoutes.get('/user', async (c) => {
  const user = c.get('user')
  return c.json({ user }, 200)
})

// 管理员仪表板
protectedRoutes.get('/dashboard', async (c) => {
  const user = c.get('user')
  
  // 检查管理员权限
  if (user.role !== 'admin') {
    return c.json({ error: '权限不足' }, 403)
  }
  
  return c.json({ 
    message: '欢迎访问管理员仪表板',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      lastLogin: user.lastLogin
    }
  }, 200)
})

// 注册路由
app.route('/api/auth', auth)
app.route('/api', protectedRoutes)

// 默认路由
app.all('*', (c) => {
  return c.json({ error: '接口不存在' }, 404)
})

export default app