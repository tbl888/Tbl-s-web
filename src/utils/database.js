export async function getUserByUsername(db, username) {
  try {
    const { results } = await db.prepare(`
      SELECT id, username, email, password_hash, created_at, last_login 
      FROM users 
      WHERE username = ?
    `).bind(username).all()
    
    return results[0] || null
  } catch (error) {
    console.error('获取用户错误:', error)
    throw error
  }
}

export async function updateUserLastLogin(db, userId) {
  try {
    await db.prepare(`
      UPDATE users 
      SET last_login = datetime('now') 
      WHERE id = ?
    `).bind(userId).run()
  } catch (error) {
    console.error('更新登录时间错误:', error)
    throw error
  }
}

export async function createUser(db, username, email, passwordHash) {
  try {
    const { success } = await db.prepare(`
      INSERT INTO users (username, email, password_hash, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `).bind(username, email, passwordHash).run()
    
    return success
  } catch (error) {
    console.error('创建用户错误:', error)
    throw error
  }
}

export async function getAllUsers(db) {
  try {
    const { results } = await db.prepare(`
      SELECT id, username, email, created_at, last_login 
      FROM users 
      ORDER BY created_at DESC
    `).all()
    
    return results
  } catch (error) {
    console.error('获取所有用户错误:', error)
    throw error
  }
}