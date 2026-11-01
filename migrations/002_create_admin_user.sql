-- 创建默认管理员用户
INSERT INTO users (username, password, email, role, created_at, last_login) 
VALUES ('admin', 'pbkdf2:100000:Vb6k8f7e9m2p1q5r:s3c5r8t2w9x1y6z0', 'admin@example.com', 'admin', datetime('now'), null)
ON CONFLICT(username) DO NOTHING;