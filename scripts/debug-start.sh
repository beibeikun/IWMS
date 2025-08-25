#!/bin/bash

/**
 * IWMS 智能文件管理解决方案 - 调试启动脚本
 * 
 * 本脚本用于诊断和启动 IWMS 应用，负责：
 * - 检查系统环境（Node.js、npm 版本）
 * - 检查端口占用情况
 * - 验证项目依赖安装状态
 * - 清理构建文件
 * - 使用备用启动方式启动应用
 * 
 * 当主启动方式出现问题时，使用此脚本进行诊断和备用启动
 * 
 * @author IWMS Team
 * @version 1.0.0
 * @usage ./debug-start.sh
 */

echo "=== IWMS 调试启动脚本 ==="
echo "本脚本将帮助您诊断启动问题并提供备用启动方式"
echo ""

# 检查 Node.js 版本
# 确保 Node.js 版本兼容性
echo "🔍 检查 Node.js 环境..."
echo "Node.js 版本:"
node --version

# 检查 npm 版本
echo ""
echo "npm 版本:"
npm --version

# 检查端口占用情况
# 确保开发服务器端口 5173 未被其他进程占用
echo ""
echo "🔍 检查端口占用情况..."
echo "检查端口 5173 占用情况:"
if lsof -i :5173 > /dev/null 2>&1; then
    echo "⚠️  端口 5173 已被占用，可能影响开发服务器启动"
    lsof -i :5173
else
    echo "✅ 端口 5173 未被占用"
fi

# 检查项目依赖状态
echo ""
echo "🔍 检查项目依赖状态..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules 目录存在"
    echo "检查关键依赖:"
    
    # 检查关键依赖是否已安装
    if ls node_modules | grep -E "(electron|vite)" > /dev/null 2>&1; then
        echo "✅ 找到关键依赖包"
        ls node_modules | grep -E "(electron|vite)" | head -5
    else
        echo "❌ 未找到关键依赖包"
    fi
else
    echo "❌ node_modules 目录不存在"
    echo "请先运行 npm install 安装依赖"
fi

# 检查 package.json 文件
echo ""
echo "🔍 检查项目配置文件..."
if [ -f "package.json" ]; then
    echo "✅ package.json 文件存在"
    echo "项目名称: $(grep '"name"' package.json | cut -d'"' -f4)"
    echo "项目版本: $(grep '"version"' package.json | cut -d'"' -f4)"
else
    echo "❌ package.json 文件不存在"
    echo "当前目录可能不是有效的 Node.js 项目"
    exit 1
fi

# 清理构建文件
echo ""
echo "🧹 清理之前的构建文件..."
echo "删除 dist 和 dist-electron 目录..."
rm -rf dist dist-electron

# 检查清理操作结果
if [ $? -eq 0 ]; then
    echo "✅ 清理完成"
else
    echo "⚠️  清理过程中出现警告，但继续执行..."
fi

# 启动开发模式（使用备用方式）
echo ""
echo "🚀 启动开发模式..."
echo "使用备用启动方式 (concurrently + wait-on)..."
echo "这种方式更稳定，适合调试环境"
echo "=========================================="
echo ""

# 使用备用的启动方式
# 这会先启动 Vite 开发服务器，等待就绪后再启动 Electron
npm run electron:dev:fallback
