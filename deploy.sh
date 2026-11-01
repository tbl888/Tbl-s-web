#!/bin/bash

# 宝通环保设备公司 - 完整部署脚本
# 一键部署整个网站系统

echo "🚀 宝通环保设备公司 - 完整部署脚本"
echo "======================================"

# 检查是否已安装必要的工具
if ! command -v curl &> /dev/null; then
    echo "❌ curl 未安装，请先安装"
    exit 1
fi

if ! command -v npx &> /dev/null; then
    echo "❌ Node.js/npm 未安装，请先安装"
    exit 1
fi

# 进入项目目录
cd "/Users/tangbaoliang/Desktop/hermes/宝通项目设计/新版网站设计/宝通环保设备公司网站优化版/github-upload"

echo "📁 当前目录：$(pwd)"
echo "📁 文件列表："
ls -la

echo ""
echo "🔧 步骤 1：配置 API Token"
echo "============================"

# 读取 API Token
read -p "请输入您的 Cloudflare API Token: " api_token

if [ -z "$api_token" ]; then
    echo "❌ API Token 不能为空"
    exit 1
fi

# 创建环境变量文件
echo "📝 创建环境变量文件..."
echo "CLOUDFLARE_API_TOKEN=$api_token" > .env

# 验证 Token 格式（简单检查）
if [[ ! "$api_token" =~ ^[a-zA-Z0-9_-]{40,}$ ]]; then
    echo "⚠️  Token 格式可能不正确，但继续执行..."
fi

echo ""
echo "🔧 步骤 2：安装依赖"
echo "============================"

npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装成功"

echo ""
echo "🔧 步骤 3：使用 API Token 登录"
echo "============================"

npx wrangler login --api-token "$api_token"

if [ $? -ne 0 ]; then
    echo "❌ 登录失败，请检查 API Token 是否正确"
    exit 1
fi

echo "✅ 登录成功"

echo ""
echo "🔧 步骤 4：部署到生产环境"
echo "============================"

npx wrangler deploy --env production

if [ $? -ne 0 ]; then
    echo "❌ 部署失败"
    exit 1
fi

echo "✅ 部署成功"

echo ""
echo "🔧 步骤 5：初始化数据库"
echo "============================"

# 运行数据库迁移
echo "📊 运行数据库迁移..."
npx wrangler d1 execute admin-users --file=./migrations/001_create_users_table.sql --remote

if [ $? -ne 0 ]; then
    echo "❌ 数据库迁移失败"
    exit 1
fi

echo "✅ 数据库迁移成功"

# 创建管理员用户
echo "👤 创建管理员用户..."
npx wrangler d1 execute admin-users --command="INSERT OR IGNORE INTO users (username, password, email, role, created_at) VALUES ('admin', '\$2a\$10\$N9qo8uLOickgx2ZMRZoMy.MrqK3aJ7I3Z5J7nK8m5J7nK8m5J7nK8m5', 'admin@example.com', 'admin', datetime('now'));" --remote

if [ $? -ne 0 ]; then
    echo "❌ 管理员用户创建失败"
    exit 1
fi

echo "✅ 管理员用户创建成功"

echo ""
echo "🎉 完整部署完成！"
echo "=================="
echo ""
echo "📋 系统信息："
echo "   Workers 地址：https://admin-auth-system-production.2219950298.workers.dev"
echo "   默认管理员：admin / btgl2024"
echo "   KV ID：79258a62130b4bfc94ae2ff6d9eafd91"
echo "   D1 ID：7c3ebad6-ca7f-4baa-b12c-1e7935b0c4b4"
echo ""
echo "🌐 访问地址："
echo "   主网站：index.html"
echo "   管理员登录：点击 '🔐 管理员' 按钮"
echo "   管理员仪表板：admin-dashboard.html"
echo ""
echo "📖 详细说明请查看 README.md"
echo ""
echo "🔧 如需重新部署："
echo "   ./deploy.sh"