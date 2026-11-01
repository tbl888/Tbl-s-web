# 🎯 宝通环保设备公司 - 完整部署指南

## 📦 项目概述
这是一个完整的网站系统，包含主网站和 Cloudflare Workers 后台管理系统。

## 📁 完整文件结构
```
github-upload/
├── 📄 index.html              # 主网站（已集成管理员登录功能）
├── 📄 admin-dashboard.html     # 管理员仪表板
├── 📂 backend/               # Cloudflare Workers 后端
│   ├── 📄 wrangler.toml     # Cloudflare 配置
│   ├── 📄 package.json      # 项目配置
│   ├── 📄 package-lock.json # 依赖锁定
│   ├── 📂 src/              # 源代码
│   │   ├── 📄 index.js      # 主要应用逻辑
│   │   └── 📂 utils/        # 工具函数
│   │       ├── 📄 password.js  # 密码处理（PBKDF2）
│   │       ├── 📄 session.js  # 会话管理（KV存储）
│   │       └── 📄 database.js # 数据库操作（D1）
│   ├── 📂 workers/          # Workers 入口
│   │   └── 📄 index.js     # Workers 主文件
│   └── 📂 migrations/       # 数据库迁移
│       ├── 📄 001_create_users_table.sql
│       └── 📄 002_create_admin_user.sql
├── 📄 README.md              # 项目说明
├── 📄 deploy.sh             # 自动部署脚本
├── 📄 .env.example          # 环境变量模板
├── 📄 .gitignore            # Git 忽略文件
└── 📄 package.json          # 项目配置
```

## 🔧 文件检查结果

### ✅ 已修复的问题
1. **Workers 引用路径**：已修复为相对路径 `./src/utils/`
2. **前端 API 调用**：已修复为相对路径 `/api/`
3. **文件结构**：已整理为标准的 Cloudflare Workers 项目结构
4. **静态文件**：已创建完整的管理员仪表板

### ✅ Cloudflare 兼容性
- ✅ Workers 配置正确 (`wrangler.toml`)
- ✅ 路径引用正确 (`./src/utils/`)
- ✅ CORS 配置完整
- ✅ 数据库绑定正确

## 🚀 完整部署步骤

### 步骤 1：上传文件到 GitHub
```bash
# 1. 将 github-upload 文件夹上传到您的 GitHub 仓库
# 2. 确保所有文件都上传完成
```

### 步骤 2：确认资源配置
您的 KV ID 和 D1 ID 已经在 wrangler.toml 中配置：
- KV ID：79258a62130b4bfc94ae2ff6d9eafd91
- D1 ID：7c3ebad6-ca7f-4baa-b12c-1e7935b0c4b4

### 步骤 3：运行部署脚本

#### 方法 1：安全部署（推荐，不包含密钥）
```bash
# 运行安全部署脚本（不包含敏感信息）
./安全部署.sh
```

#### 方法 2：手动部署
```bash
# 运行部署脚本
./deploy.sh
```

脚本会提示您：
1. 输入 API Token
2. 安装依赖
3. 登录 Cloudflare
4. 部署到生产环境
5. 初始化数据库

### 步骤 5：测试系统
```bash
# 创建管理员用户
curl -X POST "/api/admin/init" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"btgl2024","email":"admin@example.com"}'

# 测试登录
curl -X POST "/api/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"btgl2024"}'
```

## 🎯 系统信息

### 默认管理员账号
- 用户名：`admin`
- 密码：`btgl2024`
- 邮箱：`admin@example.com`

### 访问地址
- 主网站：直接访问 `index.html`
- 管理员登录：点击 "🔐 管理员" 按钮
- 管理员仪表板：`admin-dashboard.html`

## 🔧 故障排除

### 常见问题
1. **部署失败**
   - 检查 API Token 是否正确
   - 确保 KV 和 D1 资源已创建
   - 检查网络连接

2. **登录失败**
   - 确认管理员用户已创建
   - 检查用户名和密码
   - 查看 Workers 日志

3. **404 错误**
   - 检查文件路径是否正确
   - 确认 Workers 已正确部署

### 调试命令
```bash
# 查看日志
npx wrangler tail

# 本地测试
npx wrangler dev

# 检查配置
npx wrangler whoami
```

## 📋 检查清单

- [ ] 上传 `github-upload` 文件夹到 GitHub
- [ ] 运行 `./安全部署.sh` 脚本（推荐）
- [ ] 或运行 `./deploy.sh` 脚本（手动）
- [ ] 测试管理员登录功能
- [ ] 测试网站资源（图片、视频）
- [ ] 测试管理员仪表板
- [ ] 测试管理员仪表板

## 🎉 完成！

完成以上步骤后，您就拥有了一个完整的网站系统，包含：
- ✅ 完整的主网站
- ✅ 管理员登录功能
- ✅ 管理员仪表板
- ✅ Cloudflare Workers 后端
- ✅ 安全的认证系统

---
**版本**：1.0.0  
**最后更新**：2026年11月1日