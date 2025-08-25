#!/bin/bash

/**
 * IWMS 智能文件管理解决方案 - 开发模式启动脚本
 * 
 * 本脚本用于启动 IWMS 应用的开发模式，负责：
 * - 检查项目依赖是否已安装
 * - 清理之前的构建文件
 * - 启动 Electron 开发模式
 * - 提供用户友好的启动信息
 * 
 * @author IWMS Team
 * @version 1.0.0
 * @usage ./start.sh
 */

echo "启动IWMS智能文件管理解决方案开发模式..."
echo "=========================================="

# 检查是否已安装依赖
# 如果 node_modules 目录不存在，则自动安装依赖
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖..."
    echo "这可能需要几分钟时间，请耐心等待..."
    npm install
    
    # 检查安装是否成功
    if [ $? -eq 0 ]; then
        echo "✅ 依赖安装成功！"
    else
        echo "❌ 依赖安装失败，请检查网络连接或 Node.js 版本"
        exit 1
    fi
else
    echo "✅ 依赖已安装，跳过安装步骤"
fi

# 清理之前的构建文件
# 删除 dist 和 dist-electron 目录，确保使用最新代码
echo "清理之前的构建..."
echo "删除 dist 和 dist-electron 目录..."
rm -rf dist dist-electron

# 检查清理是否成功
if [ $? -eq 0 ]; then
    echo "✅ 清理完成"
else
    echo "⚠️  清理过程中出现警告，但继续执行..."
fi

# 启动开发模式
echo ""
echo "启动Electron开发模式..."
echo "请等待 Vite 开发服务器启动完成后再操作..."
echo "=========================================="
echo ""

# 使用 npm 脚本启动开发模式
# 这会同时启动 Vite 开发服务器和 Electron 应用
npm run electron:dev
