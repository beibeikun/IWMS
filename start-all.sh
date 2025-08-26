#!/bin/bash

# IWMS 完整系统启动脚本

echo "🚀 启动IWMS完整系统..."
echo ""

# 检查必要的环境
check_environment() {
    echo "🔍 检查运行环境..."
    
    # 检查Java
    if ! command -v java &> /dev/null; then
        echo "❌ 错误: 未找到Java环境，请先安装Java 17+"
        exit 1
    fi
    
    # 检查Maven
    if ! command -v mvn &> /dev/null; then
        echo "❌ 错误: 未找到Maven，请先安装Maven 3.6+"
        exit 1
    fi
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ 错误: 未找到Node.js，请先安装Node.js 16+"
        exit 1
    fi
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        echo "❌ 错误: 未找到npm，请先安装npm"
        exit 1
    fi
    
    echo "✅ 环境检查通过"
    echo ""
}

# 启动后端服务
start_backend() {
    echo "🔧 启动Spring Boot后端服务..."
    cd backend
    
    # 检查是否已经编译
    if [ ! -d "target/classes" ]; then
        echo "📦 编译后端服务..."
        mvn clean compile
        if [ $? -ne 0 ]; then
            echo "❌ 后端服务编译失败"
            exit 1
        fi
    fi
    
    echo "🌟 启动后端服务..."
    echo "📊 健康检查: http://localhost:8080/api/actuator/health"
    echo "🗄️  H2数据库: http://localhost:8080/api/h2-console"
    echo ""
    
    # 后台启动后端服务
    mvn spring-boot:run > ../backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > backend.pid
    
    # 等待后端服务启动
    echo "⏳ 等待后端服务启动..."
    sleep 15
    
    # 检查后端服务状态
    if curl -s http://localhost:8080/api/actuator/health > /dev/null; then
        echo "✅ 后端服务启动成功 (PID: $BACKEND_PID)"
    else
        echo "❌ 后端服务启动失败，请检查日志: backend.log"
        exit 1
    fi
    
    cd ..
    echo ""
}

# 启动Web管理界面
start_web_admin() {
    echo "🌐 启动Web管理界面..."
    cd web-admin
    
    # 检查依赖是否安装
    if [ ! -d "node_modules" ]; then
        echo "📦 安装Web界面依赖..."
        npm install
        if [ $? -ne 0 ]; then
            echo "❌ Web界面依赖安装失败"
            exit 1
        fi
    fi
    
    echo "🌟 启动Web管理界面..."
    echo "🌐 访问地址: http://localhost:3000"
    echo ""
    
    # 后台启动Web界面
    npm run dev > ../web-admin.log 2>&1 &
    WEB_ADMIN_PID=$!
    echo $WEB_ADMIN_PID > web-admin.pid
    
    # 等待Web界面启动
    echo "⏳ 等待Web界面启动..."
    sleep 10
    
    # 检查Web界面状态
    if curl -s http://localhost:3000 > /dev/null; then
        echo "✅ Web管理界面启动成功 (PID: $WEB_ADMIN_PID)"
    else
        echo "❌ Web管理界面启动失败，请检查日志: web-admin.log"
    fi
    
    cd ..
    echo ""
}

# 启动桌面应用
start_desktop() {
    echo "🖥️ 启动桌面应用..."
    cd frontend
    
    # 检查依赖是否安装
    if [ ! -d "node_modules" ]; then
        echo "📦 安装桌面应用依赖..."
        npm install
        if [ $? -ne 0 ]; then
            echo "❌ 桌面应用依赖安装失败"
            exit 1
        fi
    fi
    
    echo "🌟 启动桌面应用..."
    echo "🖥️  Electron应用窗口将自动打开"
    echo ""
    
    # 后台启动桌面应用
    npm run electron:dev:fallback > ../desktop.log 2>&1 &
    DESKTOP_PID=$!
    echo $DESKTOP_PID > desktop.pid
    
    # 等待桌面应用启动
    echo "⏳ 等待桌面应用启动..."
    sleep 20
    
    # 检查桌面应用状态
    if lsof -i :5173 > /dev/null 2>&1; then
        echo "✅ 桌面应用启动成功 (PID: $DESKTOP_PID)"
    else
        echo "❌ 桌面应用启动失败，请检查日志: desktop.log"
    fi
    
    cd ..
    echo ""
}

# 显示服务状态
show_status() {
    echo "📊 IWMS系统启动完成！"
    echo ""
    echo "🌐 服务访问地址："
    echo "├── 🖥️  桌面应用: 桌面窗口"
    echo "├── 🌐  Web管理界面: http://localhost:3000"
    echo "├── 🔧  后端API: http://localhost:8080/api"
    echo "├── 📊  健康检查: http://localhost:8080/api/actuator/health"
    echo "└── 🗄️  H2数据库: http://localhost:8080/api/h2-console"
    echo ""
    echo "📝 日志文件："
    echo "├── backend.log      - 后端服务日志"
    echo "├── web-admin.log    - Web界面日志"
    echo "└── desktop.log      - 桌面应用日志"
    echo ""
    echo "🛑 停止服务："
    echo "   ./stop-all.sh"
    echo ""
}

# 主函数
main() {
    check_environment
    start_backend
    start_web_admin
    start_desktop
    show_status
}

# 运行主函数
main
