#!/bin/bash

# IWMS 完整系统停止脚本

echo "🛑 停止IWMS完整系统..."
echo ""

# 停止后端服务
stop_backend() {
    echo "🔧 停止Spring Boot后端服务..."
    if [ -f "backend/backend.pid" ]; then
        BACKEND_PID=$(cat backend/backend.pid)
        if ps -p $BACKEND_PID > /dev/null; then
            echo "⏹️  停止后端服务 (PID: $BACKEND_PID)..."
            kill $BACKEND_PID
            sleep 5
            if ps -p $BACKEND_PID > /dev/null; then
                echo "⚠️  强制停止后端服务..."
                kill -9 $BACKEND_PID
            fi
            echo "✅ 后端服务已停止"
        else
            echo "ℹ️  后端服务未运行"
        fi
        rm -f backend/backend.pid
    else
        echo "ℹ️  后端服务PID文件不存在"
    fi
    echo ""
}

# 停止Web管理界面
stop_web_admin() {
    echo "🌐 停止Web管理界面..."
    if [ -f "web-admin/web-admin.pid" ]; then
        WEB_ADMIN_PID=$(cat web-admin/web-admin.pid)
        if ps -p $WEB_ADMIN_PID > /dev/null; then
            echo "⏹️  停止Web管理界面 (PID: $WEB_ADMIN_PID)..."
            kill $WEB_ADMIN_PID
            sleep 3
            if ps -p $WEB_ADMIN_PID > /dev/null; then
                echo "⚠️  强制停止Web管理界面..."
                kill -9 $WEB_ADMIN_PID
            fi
            echo "✅ Web管理界面已停止"
        else
            echo "ℹ️  Web管理界面未运行"
        fi
        rm -f web-admin/web-admin.pid
    else
        echo "ℹ️  Web管理界面PID文件不存在"
    fi
    echo ""
}

# 停止桌面应用
stop_desktop() {
    echo "🖥️ 停止桌面应用..."
    if [ -f "frontend/desktop.pid" ]; then
        DESKTOP_PID=$(cat frontend/desktop.pid)
        if ps -p $DESKTOP_PID > /dev/null; then
            echo "⏹️  停止桌面应用 (PID: $DESKTOP_PID)..."
            kill $DESKTOP_PID
            sleep 5
            if ps -p $DESKTOP_PID > /dev/null; then
                echo "⚠️  强制停止桌面应用..."
                kill -9 $DESKTOP_PID
            fi
            echo "✅ 桌面应用已停止"
        else
            echo "ℹ️  桌面应用未运行"
        fi
        rm -f frontend/desktop.pid
    else
        echo "ℹ️  桌面应用PID文件不存在"
    fi
    echo ""
}

# 停止所有相关进程
stop_all_processes() {
    echo "🔍 停止所有相关进程..."
    
    # 停止Electron进程
    echo "⏹️  停止Electron进程..."
    pkill -f "electron" 2>/dev/null
    sleep 2
    
    # 停止Vite开发服务器
    echo "⏹️  停止Vite开发服务器..."
    pkill -f "vite" 2>/dev/null
    sleep 2
    
    # 停止Spring Boot进程
    echo "⏹️  停止Spring Boot进程..."
    pkill -f "spring-boot:run" 2>/dev/null
    sleep 2
    
    # 停止Maven进程
    echo "⏹️  停止Maven进程..."
    pkill -f "mvn" 2>/dev/null
    sleep 2
    
    # 停止Node.js进程
    echo "⏹️  停止Node.js进程..."
    pkill -f "node.*dev" 2>/dev/null
    sleep 2
    
    echo "✅ 所有相关进程已停止"
    echo ""
}

# 清理端口占用
cleanup_ports() {
    echo "🧹 清理端口占用..."
    
    # 清理端口8080 (后端服务)
    PORT_8080=$(lsof -ti:8080 2>/dev/null)
    if [ ! -z "$PORT_8080" ]; then
        echo "⏹️  清理端口8080..."
        kill -9 $PORT_8080 2>/dev/null
    fi
    
    # 清理端口3000 (Web管理界面)
    PORT_3000=$(lsof -ti:3000 2>/dev/null)
    if [ ! -z "$PORT_3000" ]; then
        echo "⏹️  清理端口3000..."
        kill -9 $PORT_3000 2>/dev/null
    fi
    
    # 清理端口5173 (桌面应用)
    PORT_5173=$(lsof -ti:5173 2>/dev/null)
    if [ ! -z "$PORT_5173" ]; then
        echo "⏹️  清理端口5173..."
        kill -9 $PORT_5173 2>/dev/null
    fi
    
    echo "✅ 端口清理完成"
    echo ""
}

# 显示停止状态
show_status() {
    echo "📊 IWMS系统已停止！"
    echo ""
    echo "🔍 检查服务状态："
    echo "├── 后端服务: $(curl -s http://localhost:8080/api/actuator/health >/dev/null && echo "运行中" || echo "已停止")"
    echo "├── Web界面: $(curl -s http://localhost:3000 >/dev/null && echo "运行中" || echo "已停止")"
    echo "└── 桌面应用: $(lsof -i :5173 >/dev/null 2>&1 && echo "运行中" || echo "已停止")"
    echo ""
    echo "🚀 重新启动系统："
    echo "   ./start-all.sh"
    echo ""
}

# 主函数
main() {
    stop_backend
    stop_web_admin
    stop_desktop
    stop_all_processes
    cleanup_ports
    show_status
}

# 运行主函数
main
