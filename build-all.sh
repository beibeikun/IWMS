#!/bin/bash

# IWMS 一键构建脚本
# 构建所有平台的IWMS应用

set -e  # 遇到错误立即退出

echo "🚀 IWMS 应用构建开始..."
echo "=================================="

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未找到Node.js，请先安装Node.js"
    exit 1
fi

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ 未找到npm，请先安装npm"
    exit 1
fi

# 显示版本信息
echo "📋 环境信息："
echo "   Node.js: $(node --version)"
echo "   npm: $(npm --version)"
echo "   操作系统: $(uname -s) $(uname -m)"
echo ""

# 安装依赖
echo "📦 安装依赖..."
npm install

# 清理之前的构建
echo "🧹 清理之前的构建..."
rm -rf dist dist-electron release

# 构建Mac应用
echo "🍎 构建Mac应用..."
echo "   - ARM64 (Apple Silicon)..."
npm run build:mac-arm

echo "   - x64 (Intel)..."
npm run build:mac-x64

# 构建Windows应用
echo "🪟 构建Windows应用..."
echo "   - x64 + ia32..."
npm run build:win-x64

# 显示构建结果
echo ""
echo "🎉 构建完成！"
echo "=================================="
echo "📁 输出目录: release/"
echo ""

# 显示生成的文件
echo "📱 生成的应用："
ls -lh release/*.{zip,exe} 2>/dev/null || echo "   未找到应用文件"

echo ""
echo "📊 目录大小："
du -sh release/ 2>/dev/null || echo "   无法获取目录大小"

echo ""
echo "🚀 构建成功！现在可以分发应用了。"
echo ""
echo "💡 提示："
echo "   - Mac用户下载对应的ZIP文件"
echo "   - Windows用户下载Setup.exe安装程序"
echo "   - 或使用便携版exe文件"
echo ""
echo "📚 更多信息请查看 BUILD_RESULTS.md"
