-- 创建默认管理员用户
-- 密码: btgl2024 (哈希值)
INSERT OR IGNORE INTO users (username, email, password_hash) 
VALUES ('admin', 'admin@example.com', '1987dfd2321f29f68455d55956d2da07903bc9eb016593245202313990552feb');