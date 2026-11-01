// Cloudflare Workers 后台管理系统
// 专业级安全认证系统

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { hashPassword, verifyPassword } from '../src/utils/password.js'
import { generateSessionToken, validateSessionToken } from '../src/utils/session.js'
import { getUserByUsername, updateUserLastLogin } from '../src/utils/database.js'

const app = new Hono()

// CORS 配置
app.use('*', cors({
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// 健康检查
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: Date.now(),
    service: 'admin-auth-system'
  })
})

// 认证路由
const auth = new Hono()

// 用户注册
auth.post('/register', async (c) => {
  try {
    const { username, password, email } = await c.req.json()
    
    // 输入验证
    if (!username || !password || !email) {
      return c.json({ 
        error: '缺少必要字段',
        required: ['username', 'password', 'email']
      }, 400)
    }
    
    // 密码强度检查
    const passwordStrength = checkPasswordStrength(password)
    if (passwordStrength.score < 3) {
      return c.json({ 
        error: '密码强度不足',
        strength: passwordStrength.strength,
        requirements: {
          length: '至少8位字符',
          uppercase: '包含大写字母',
          lowercase: '包含小写字母',
          numbers: '包含数字',
          special: '包含特殊字符'
        }
      }, 400)
    }
    
    // 检查用户是否已存在
    const existingUser = await getUserByUsername(username)
    if (existingUser) {
      return c.json({ 
        error: '用户名已存在',
        code: 'USERNAME_EXISTS'
      }, 409)
    }
    
    // 创建新用户
    const hashedPassword = await hashPassword(password)
    const user = await createUser(username, hashedPassword, email)
    
    // 返回用户信息（不包含密码）
    const { password: _, ...userInfo } = user
    
    return c.json({ 
      message: '注册成功',
      user: userInfo,
      timestamp: Date.now()
    }, 201)
    
  } catch (error) {
    console.error('注册错误:', error)
    return c.json({ 
      error: '服务器内部错误',
      message: error.message
    }, 500)
  }
})

// 用户登录
auth.post('/login', async (c) => {
  try {
    const { username, password } = await c.req.json()
    
    // 输入验证
    if (!username || !password) {
      return c.json({ 
        error: '用户名和密码不能为空',
        code: 'INVALID_CREDENTIALS'
      }, 400)
    }
    
    // 获取用户信息
    const user = await getUserByUsername(username)
    if (!user) {
      return c.json({ 
        error: '用户名或密码错误',
        code: 'USER_NOT_FOUND'
      }, 401)
    }
    
    // 验证密码
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return c.json({ 
        error: '用户名或密码错误',
        code: 'INVALID_PASSWORD'
      }, 401)
    }
    
    // 生成会话令牌
    const sessionToken = await generateSessionToken(user.id)
    
    // 更新最后登录时间
    await updateUserLastLogin(user.id)
    
    // 设置安全 cookie
    c.cookie('session_token', sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24小时
      path: '/',
      domain: '.yourdomain.com'
    })
    
    // 返回用户信息（不包含密码）
    const { password: _, ...userInfo } = user
    
    return c.json({ 
      message: '登录成功',
      user: userInfo,
      loginTime: Date.now(),
      sessionToken: sessionToken.substring(0, 8) + '...' // 只显示前8位
    }, 200)
    
  } catch (error) {
    console.error('登录错误:', error)
    return c.json({ 
      error: '服务器内部错误',
      message: error.message
    }, 500)
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
      path: '/',
      domain: '.yourdomain.com'
    })
    
    return c.json({ 
      message: '登出成功',
      timestamp: Date.now()
    }, 200)
    
  } catch (error) {
    console.error('登出错误:', error)
    return c.json({ 
      error: '服务器内部错误',
      message: error.message
    }, 500)
  }
})

// 受保护的路由
const protectedRoutes = new Hono()

// 验证会话
protectedRoutes.use('*', async (c, next) => {
  try {
    const sessionToken = c.req.cookie('session_token')
    
    if (!sessionToken) {
      return c.json({ 
        error: '未登录',
        code: 'NOT_AUTHENTICATED',
        message: '请先登录'
      }, 401)
    }
    
    const session = await validateSessionToken(sessionToken)
    if (!session) {
      return c.json({ 
        error: '会话已过期',
        code: 'SESSION_EXPIRED',
        message: '请重新登录'
      }, 401)
    }
    
    // 将用户信息添加到上下文
    c.set('user', session.user)
    c.set('sessionId', session.sessionId)
    
    await next()
    
  } catch (error) {
    console.error('会话验证错误:', error)
    return c.json({ 
      error: '会话验证失败',
      code: 'SESSION_VALIDATION_FAILED',
      message: '会话验证出现错误'
    }, 401)
  }
})

// 获取当前用户信息
protectedRoutes.get('/user', async (c) => {
  const user = c.get('user')
  
  return c.json({ 
    user,
    timestamp: Date.now()
  }, 200)
})

// 管理员仪表板
protectedRoutes.get('/dashboard', async (c) => {
  const user = c.get('user')
  
  // 检查管理员权限
  if (user.role !== 'admin') {
    return c.json({ 
      error: '权限不足',
      code: 'INSUFFICIENT_PERMISSIONS',
      message: '只有管理员才能访问此功能'
    }, 403)
  }
  
  // 获取系统统计信息
  const stats = {
    totalUsers: await getUserCount(),
    totalSessions: await getSessionCount(),
    systemUptime: Date.now(),
    lastLogin: user.lastLogin
  }
  
  return c.json({ 
    message: '欢迎访问管理员仪表板',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin
    },
    stats,
    timestamp: Date.now()
  }, 200)
})

// 新闻管理
protectedRoutes.get('/news', async (c) => {
  const user = c.get('user')
  
  if (user.role !== 'admin') {
    return c.json({ 
      error: '权限不足',
      code: 'INSUFFICIENT_PERMISSIONS'
    }, 403)
  }
  
  // 获取新闻列表（这里需要实现实际的新闻获取逻辑）
  const news = [
    {
      id: 1,
      title: '环保设备新政策发布',
      content: '国家最新环保政策解读，为您的企业提供合规指导。',
      publishDate: '2024-01-15',
      author: 'admin'
    },
    {
      id: 2,
      title: '公司技术升级公告',
      content: '公司技术团队完成重大升级，设备性能提升30%。',
      publishDate: '2024-01-10',
      author: 'admin'
    }
  ]
  
  return c.json({ 
    news,
    count: news.length,
    timestamp: Date.now()
  }, 200)
})

// 添加新闻
protectedRoutes.post('/news', async (c) => {
  const user = c.get('user')
  
  if (user.role !== 'admin') {
    return c.json({ 
      error: '权限不足',
      code: 'INSUFFICIENT_PERMISSIONS'
    }, 403)
  }
  
  try {
    const { title, content } = await c.req.json()
    
    if (!title || !content) {
      return c.json({ 
        error: '标题和内容不能为空',
        code: 'MISSING_FIELDS'
      }, 400)
    }
    
    // 这里需要实现实际的新闻添加逻辑
    const newNews = {
      id: Date.now(),
      title,
      content,
      publishDate: new Date().toISOString().split('T')[0],
      author: user.username
    }
    
    // 保存到数据库（需要实现）
    // await saveNews(newNews)
    
    return c.json({ 
      message: '新闻添加成功',
      news: newNews,
      timestamp: Date.now()
    }, 201)
    
  } catch (error) {
    console.error('添加新闻错误:', error)
    return c.json({ 
      error: '添加新闻失败',
      message: error.message
    }, 500)
  }
})

// 辅助函数
async function getUserCount() {
  try {
    const db = c.env.DB
    const result = await db.prepare(`SELECT COUNT(*) as count FROM users`).first()
    return result.count
  } catch (error) {
    console.error('获取用户数量错误:', error)
    return 0
  }
}

async function getSessionCount() {
  try {
    // 这里需要实现获取会话数量的逻辑
    return 1
  } catch (error) {
    console.error('获取会话数量错误:', error)
    return 0
  }
}

function checkPasswordStrength(password) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    special: /[!@#$%^&*]/.test(password)
  }
  
  const score = Object.values(checks).filter(Boolean).length
  
  return {
    score,
    checks,
    strength: score >= 4 ? '强' : score >= 3 ? '中' : '弱'
  }
}

// 注册路由
app.route('/api/auth', auth)
app.route('/api', protectedRoutes)

// 默认路由
app.all('*', (c) => {
  return c.json({ 
    error: '接口不存在',
    code: 'ENDPOINT_NOT_FOUND',
    availableEndpoints: [
      'GET /health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/auth/logout',
      'GET /api/user',
      'GET /api/dashboard',
      'GET /api/news',
      'POST /api/news'
    ]
  }, 404)
})

export default app