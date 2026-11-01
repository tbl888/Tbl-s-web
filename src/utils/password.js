// 密码处理工具
// 使用 Web Crypto API 进行安全的密码哈希

// 密码哈希函数
export async function hashPassword(password) {
  try {
    // 生成随机盐值
    const salt = crypto.getRandomValues(new Uint8Array(16))
    
    // 使用 PBKDF2 进行哈希
    const passwordBuffer = new TextEncoder().encode(password)
    const hashedBuffer = await crypto.subtle.pbkdf2(
      passwordBuffer,
      salt,
      100000, // 迭代次数，防止暴力破解
      256,    // 输出长度（32字节）
      'SHA-256'
    )
    
    // 将盐值和哈希结果合并
    const combined = new Uint8Array(salt.length + hashedBuffer.byteLength)
    combined.set(salt)
    combined.set(new Uint8Array(hashedBuffer), salt.length)
    
    // 转换为 Base64
    return btoa(String.fromCharCode(...combined))
    
  } catch (error) {
    console.error('密码哈希错误:', error)
    throw new Error('密码哈希失败')
  }
}

// 密码验证函数
export async function verifyPassword(password, hashedPassword) {
  try {
    // 将 Base64 转换为 Uint8Array
    const combined = new Uint8Array(
      atob(hashedPassword)
        .split('')
        .map(char => char.charCodeAt(0))
    )
    
    // 提取盐值和哈希值
    const salt = combined.slice(0, 16)
    const storedHash = combined.slice(16)
    
    // 对输入的密码进行哈希
    const passwordBuffer = new TextEncoder().encode(password)
    const hashedBuffer = await crypto.subtle.pbkdf2(
      passwordBuffer,
      salt,
      100000,
      256,
      'SHA-256'
    )
    
    // 比较哈希值
    const hashedArray = new Uint8Array(hashedBuffer)
    return hashedArray.every((value, index) => value === storedHash[index])
    
  } catch (error) {
    console.error('密码验证错误:', error)
    return false
  }
}

// 生成随机密码
export function generateRandomPassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  
  const randomValues = new Uint32Array(length)
  crypto.getRandomValues(randomValues)
  
  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length]
  }
  
  return password
}

// 密码强度检查
export function checkPasswordStrength(password) {
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

// 安全的随机令牌生成
export function generateSecureToken(length = 32) {
  const tokenBytes = new Uint8Array(length)
  crypto.getRandomValues(tokenBytes)
  return btoa(String.fromCharCode(...tokenBytes))
}