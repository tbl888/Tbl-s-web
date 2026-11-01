// 会话管理工具
// 使用 Cloudflare KV 存储会话令牌

// 生成会话令牌
export async function generateSessionToken(userId) {
  try {
    // 生成安全的随机令牌
    const tokenBytes = new Uint8Array(32)
    crypto.getRandomValues(tokenBytes)
    const token = btoa(String.fromCharCode(...tokenBytes))
    
    // 创建会话数据
    const sessionData = {
      userId,
      createdAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24小时后过期
      userAgent: 'unknown',
      ipAddress: 'unknown'
    }
    
    // 存储到 KV
    await globalThis.env.SESSIONS.put(`session:${token}`, JSON.stringify(sessionData))
    
    return token
    
  } catch (error) {
    console.error('会话令牌生成错误:', error)
    throw new Error('会话令牌生成失败')
  }
}

// 验证会话令牌
export async function validateSessionToken(token) {
  try {
    if (!token) {
      return null
    }
    
    const sessionData = await globalThis.env.SESSIONS.get(`session:${token}`)
    
    if (!sessionData) {
      return null
    }
    
    const session = JSON.parse(sessionData)
    
    // 检查是否过期
    if (Date.now() > session.expiresAt) {
      // 删除过期会话
      await globalThis.env.SESSIONS.delete(`session:${token}`)
      return null
    }
    
    // 获取用户信息
    const user = await getUserById(session.userId)
    
    if (!user) {
      return null
    }
    
    return {
      sessionId: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin
      }
    }
    
  } catch (error) {
    console.error('会话验证错误:', error)
    return null
  }
}

// 删除会话
export async function deleteSession(token) {
  try {
    await globalThis.env.SESSIONS.delete(`session:${token}`)
    return true
  } catch (error) {
    console.error('会话删除错误:', error)
    return false
  }
}

// 清理过期会话
export async function cleanupExpiredSessions() {
  try {
    // 这里可以实现批量清理过期会话的逻辑
    // 由于 KV 的限制，这里可能需要其他实现方式
    return true
  } catch (error) {
    console.error('清理过期会话错误:', error)
    return false
  }
}

// 获取用户信息（需要从数据库获取）
async function getUserById(userId) {
  try {
    const db = globalThis.env.DB
    
    const user = await db.prepare(`
      SELECT id, username, email, role, last_login
      FROM users 
      WHERE id = ?
    `).bind(userId).first()
    
    return user
  } catch (error) {
    console.error('获取用户信息错误:', error)
    return null
  }
}

// 获取会话统计信息
export async function getSessionStats() {
  try {
    // 这里需要实现获取会话统计的逻辑
    return {
      totalSessions: 0,
      activeSessions: 0,
      expiredSessions: 0
    }
  } catch (error) {
    console.error('获取会话统计错误:', error)
    return {
      totalSessions: 0,
      activeSessions: 0,
      expiredSessions: 0
    }
  }
}