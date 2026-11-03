export async function generateSessionToken(kv, userId, username) {
  const timestamp = Date.now()
  const token = `session_${userId}_${timestamp}_${Math.random().toString(36).substr(2, 9)}`
  
  // 存储会话信息，24小时后过期
  await kv.put(token, JSON.stringify({
    userId,
    username,
    createdAt: timestamp,
    expiresAt: timestamp + (24 * 60 * 60 * 1000) // 24小时
  }), {
    expirationTtl: 24 * 60 * 60 // 24小时（单位：秒）
  })
  
  return token
}

export async function validateSessionToken(kv, token) {
  try {
    const sessionData = await kv.get(token)
    
    if (!sessionData) {
      return false
    }
    
    const session = JSON.parse(sessionData)
    
    // 检查是否过期
    if (Date.now() > session.expiresAt) {
      await kv.delete(token)
      return false
    }
    
    return true
  } catch (error) {
    console.error('会话验证错误:', error)
    return false
  }
}

export async function getSessionInfo(kv, token) {
  try {
    const sessionData = await kv.get(token)
    
    if (!sessionData) {
      return null
    }
    
    const session = JSON.parse(sessionData)
    
    // 检查是否过期
    if (Date.now() > session.expiresAt) {
      await kv.delete(token)
      return null
    }
    
    return session
  } catch (error) {
    console.error('获取会话信息错误:', error)
    return null
  }
}