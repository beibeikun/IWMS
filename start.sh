#!/bin/bash

echo "启动IWMS智能文件管理解决方案开发模式..."

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖..."
    npm install
fi

# 启动开发模式
echo "启动Electron开发模式..."
npm run electron:dev
