#!/bin/bash

echo "启动IWMS智能文件管理解决方案开发模式..."

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖..."
    npm install
fi

# 清理之前的构建
echo "清理之前的构建..."
rm -rf dist dist-electron

# 启动开发模式
echo "启动Electron开发模式..."
echo "请等待 Vite 开发服务器启动完成后再操作..."
npm run electron:dev
