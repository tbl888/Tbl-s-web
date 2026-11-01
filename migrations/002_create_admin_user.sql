-- 创建默认管理员用户
-- 密码: btgl2024 (哈希值)
INSERT OR IGNORE INTO users (username, email, password_hash) 
VALUES ('admin', 'admin@example.com', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');