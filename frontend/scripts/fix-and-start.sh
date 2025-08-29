#!/bin/bash

# IWMS 修复和启动脚本
# 
# 清理构建文件并重新启动应用
# 
# @author IWMS Team
# @version 1.0.0

echo "🔧 IWMS 修复和启动脚本"
echo "=========================="

# 清理构建文件
echo "🧹 清理构建文件..."
rm -rf dist dist-electron

if [ $? -eq 0 ]; then
    echo "✅ 清理完成"
else
    echo "⚠️  清理过程中出现警告，但继续执行..."
fi

# 设置环境变量
echo "⚙️  设置环境变量..."
export NODE_OPTIONS="--max-old-space-size=8192"

# 线程配置
export IWMS_MAX_THREADS=4
export IWMS_BATCH_SIZE=10
export IWMS_MULTI_THREAD=true
export IWMS_MEMORY_THRESHOLD=80

# 其他配置
export IWMS_AUTO_GC=true
export IWMS_GC_INTERVAL=5000
export IWMS_MONITOR_INTERVAL=5000
export IWMS_MAX_CONCURRENT_FILES=100
export IWMS_SCAN_TIMEOUT=30000

echo "🧵 线程配置: ${IWMS_MAX_THREADS}个线程"
echo "📦 批次大小: ${IWMS_BATCH_SIZE}张图片"
echo "⚡ 多线程: ${IWMS_MULTI_THREAD}"
echo "💾 内存阈值: ${IWMS_MEMORY_THRESHOLD}%"
echo "🧹 自动垃圾回收: ${IWMS_AUTO_GC}"

# 启动应用
echo ""
echo "🚀 启动应用..."
echo "=========================="
npm run electron:dev
