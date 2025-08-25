#!/bin/bash

echo "=== IWMS 调试启动脚本 ==="
echo ""

# 检查 Node.js 版本
echo "Node.js 版本:"
node --version
echo ""

# 检查 npm 版本
echo "npm 版本:"
npm --version
echo ""

# 检查端口占用
echo "检查端口 5173 占用情况:"
lsof -i :5173 || echo "端口 5173 未被占用"
echo ""

# 检查依赖
echo "检查依赖安装:"
if [ -d "node_modules" ]; then
    echo "✅ node_modules 目录存在"
    echo "检查关键依赖:"
    ls node_modules | grep -E "(electron|vite)" || echo "未找到关键依赖"
else
    echo "❌ node_modules 目录不存在"
fi
echo ""

# 清理构建
echo "清理之前的构建..."
rm -rf dist dist-electron
echo "✅ 清理完成"
echo ""

# 启动开发模式
echo "启动开发模式..."
echo "使用备用启动方式 (concurrently + wait-on)..."
npm run electron:dev:fallback
