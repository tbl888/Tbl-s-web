import { Hono } from 'hono'
import { hashPassword, verifyPassword } from './utils/password.js'
import { generateSessionToken, validateSessionToken } from './utils/session.js'
import { getUserByUsername, updateUserLastLogin } from './utils/database.js'

const app = new Hono()

// CORS 配置
app.use('*', async (c, next) => {
  c.header('Access-Control-Allow-Origin', '*')
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (c.req.method === 'OPTIONS') {
    return c.text('', 200)
  }
  await next()
})

// 登录接口
app.post('/api/login', async (c) => {
  try {
    const { username, password } = await c.req.json()
    
    if (!username || !password) {
      return c.json({ error: '用户名和密码不能为空' }, 400)
    }
    
    // 获取用户
    const user = await getUserByUsername(c.env.DB, username)
    
    if (!user) {
      return c.json({ error: '用户名或密码错误' }, 401)
    }
    
    // 验证密码
    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) {
      return c.json({ error: '用户名或密码错误' }, 401)
    }
    
    // 更新最后登录时间
    await updateUserLastLogin(c.env.DB, user.id)
    
    // 生成会话令牌
    const sessionToken = await generateSessionToken(c.env.SESSIONS, user.id, username)
    
    return c.json({
      success: true,
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
        last_login: user.last_login
      },
      session_token: sessionToken
    })
    
  } catch (error) {
    console.error('登录错误:', error)
    return c.json({ error: '登录失败，请稍后重试' }, 500)
  }
})

// 验证会话接口
app.post('/api/verify', async (c) => {
  try {
    const { session_token } = await c.req.json()
    
    if (!session_token) {
      return c.json({ error: '会话令牌不能为空' }, 400)
    }
    
    const isValid = await validateSessionToken(c.env.SESSIONS, session_token)
    
    if (isValid) {
      return c.json({ valid: true })
    } else {
      return c.json({ valid: false, error: '会话已过期或无效' }, 401)
    }
    
  } catch (error) {
    console.error('验证错误:', error)
    return c.json({ error: '验证失败' }, 500)
  }
})

// 退出登录接口
app.post('/api/logout', async (c) => {
  try {
    const { session_token } = await c.req.json()
    
    if (session_token) {
      // 删除会话令牌（KV 会自动过期）
      await c.env.SESSIONS.delete(session_token)
    }
    
    return c.json({ success: true, message: '已退出登录' })
    
  } catch (error) {
    console.error('退出登录错误:', error)
    return c.json({ error: '退出登录失败' }, 500)
  }
})

// 健康检查接口
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'baotong-admin-auth'
  })
})

export default app