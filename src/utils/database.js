// 数据库操作工具
// 使用 Cloudflare D1 进行用户管理

// 创建用户
export async function createUser(username, password, email) {
  try {
    const db = globalThis.env.DB
    
    // 检查用户是否已存在
    const existingUser = await db.prepare(`
      SELECT id FROM users WHERE username = ?
    `).bind(username).first()
    
    if (existingUser) {
      throw new Error('用户名已存在')
    }
    
    // 检查邮箱是否已存在
    const existingEmail = await db.prepare(`
      SELECT id FROM users WHERE email = ?
    `).bind(email).first()
    
    if (existingEmail) {
      throw new Error('邮箱已存在')
    }
    
    // 插入新用户
    const result = await db.prepare(`
      INSERT INTO users (username, password, email, role, created_at, last_login)
      VALUES (?, ?, ?, 'admin', datetime('now'), datetime('now'))
    `).bind(username, password, email).run()
    
    if (result.success) {
      // 获取创建的用户信息
      const user = await db.prepare(`
        SELECT id, username, email, role, created_at, last_login
        FROM users WHERE id = ?
      `).bind(result.meta.last_row_id).first()
      
      return user
    } else {
      throw new Error('用户创建失败')
    }
    
  } catch (error) {
    console.error('创建用户错误:', error)
    throw error
  }
}

// 根据用户名获取用户
export async function getUserByUsername(username) {
  try {
    const db = globalThis.env.DB
    
    const user = await db.prepare(`
      SELECT id, username, password, email, role, created_at, last_login
      FROM users WHERE username = ?
    `).bind(username).first()
    
    return user
    
  } catch (error) {
    console.error('获取用户错误:', error)
    throw error
  }
}

// 根据邮箱获取用户
export async function getUserByEmail(email) {
  try {
    const db = globalThis.env.DB
    
    const user = await db.prepare(`
      SELECT id, username, password, email, role, created_at, last_login
      FROM users WHERE email = ?
    `).bind(email).first()
    
    return user
    
  } catch (error) {
    console.error('获取用户错误:', error)
    throw error
  }
}

// 更新最后登录时间
export async function updateUserLastLogin(userId) {
  try {
    const db = globalThis.env.DB
    
    const result = await db.prepare(`
      UPDATE users SET last_login = datetime('now') WHERE id = ?
    `).bind(userId).run()
    
    return result.success
    
  } catch (error) {
    console.error('更新登录时间错误:', error)
    throw error
  }
}

// 更新用户信息
export async function updateUser(userId, updates) {
  try {
    const db = globalThis.env.DB
    
    const fields = Object.keys(updates).filter(key => key !== 'id')
    const values = Object.values(updates)
    
    if (fields.length === 0) {
      return true
    }
    
    const setClause = fields.map(field => `${field} = ?`).join(', ')
    const query = `
      UPDATE users SET ${setClause} WHERE id = ?
    `
    
    const result = await db.prepare(query)
      .bind(...values, userId)
      .run()
    
    return result.success
    
  } catch (error) {
    console.error('更新用户信息错误:', error)
    throw error
  }
}

// 删除用户
export async function deleteUser(userId) {
  try {
    const db = globalThis.env.DB
    
    const result = await db.prepare(`
      DELETE FROM users WHERE id = ?
    `).bind(userId).run()
    
    return result.success
    
  } catch (error) {
    console.error('删除用户错误:', error)
    throw error
  }
}

// 获取所有用户（管理员功能）
export async function getAllUsers() {
  try {
    const db = globalThis.env.DB
    
    const users = await db.prepare(`
      SELECT id, username, email, role, created_at, last_login
      FROM users
      ORDER BY created_at DESC
    `).all()
    
    return users.results
    
  } catch (error) {
    console.error('获取所有用户错误:', error)
    throw error
  }
}

// 获取用户数量统计
export async function getUserCount() {
  try {
    const db = globalThis.env.DB
    
    const result = await db.prepare(`
      SELECT COUNT(*) as count FROM users
    `).first()
    
    return result.count
    
  } catch (error) {
    console.error('获取用户数量错误:', error)
    return 0
  }
}

// 数据库初始化
export async function initializeDatabase() {
  try {
    const db = globalThis.env.DB
    
    // 创建用户表
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
      )
    `)
    
    // 创建索引
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
    `)
    
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `)
    
    // 检查是否已存在管理员用户
    const adminUser = await getUserByUsername('admin')
    
    if (!adminUser) {
      // 创建默认管理员用户
      const defaultPassword = generateSecureToken(16)
      const hashedPassword = await hashPassword(defaultPassword)
      
      await createUser('admin', hashedPassword, 'admin@example.com')
      console.log('默认管理员用户已创建，密码:', defaultPassword)
    }
    
    return true
    
  } catch (error) {
    console.error('数据库初始化错误:', error)
    throw error
  }
}

// 生成安全的随机令牌
function generateSecureToken(length = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}