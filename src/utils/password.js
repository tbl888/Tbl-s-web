import { crypto } from 'crypto'

export async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  
  // 使用 PBKDF2 进行密码哈希
  const hashedBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashedArray = Array.from(new Uint8Array(hashedBuffer))
  const hashedHex = hashedArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return hashedHex
}

export async function verifyPassword(password, hashedPassword) {
  const hashedInput = await hashPassword(password)
  return hashedInput === hashedPassword
}