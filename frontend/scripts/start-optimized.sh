#!/bin/bash

/**
 * IWMS 智能文件管理解决方案 - 优化启动脚本
 * 
 * 本脚本用于启动 IWMS 应用的开发模式，包含内存优化配置：
 * - 增加Node.js内存限制到8GB
 * - 启用垃圾回收
 * - 优化图片处理性能
 * 
 * @author IWMS Team
 * @version 1.0.0
 * @usage ./start-optimized.sh
 */

echo "启动IWMS智能文件管理解决方案（优化模式）..."
echo "=========================================="
echo "内存优化配置："
echo "- Node.js堆内存限制: 8GB"
echo "- 启用垃圾回收"
echo "- 优化图片处理"
echo "=========================================="

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖..."
    echo "这可能需要几分钟时间，请耐心等待..."
    npm install
    
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
echo "清理之前的构建..."
rm -rf dist dist-electron

if [ $? -eq 0 ]; then
    echo "✅ 清理完成"
else
    echo "⚠️  清理过程中出现警告，但继续执行..."
fi

# 启动开发模式（优化配置）
echo ""
echo "启动Electron开发模式（优化配置）..."
echo "请等待 Vite 开发服务器启动完成后再操作..."
echo "=========================================="
echo ""

# 使用优化配置启动
export NODE_OPTIONS="--max-old-space-size=8192 --expose-gc"
export IWMS_MAX_THREADS=4
export IWMS_BATCH_SIZE=10
export IWMS_MULTI_THREAD=true
export IWMS_MEMORY_THRESHOLD=80

echo "🧵 线程配置: ${IWMS_MAX_THREADS}个线程"
echo "📦 批次大小: ${IWMS_BATCH_SIZE}张图片"
echo "⚡ 多线程: ${IWMS_MULTI_THREAD}"
echo "💾 内存阈值: ${IWMS_MEMORY_THRESHOLD}%"

npm run electron:dev
