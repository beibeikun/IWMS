#!/bin/bash

# IWMS后端服务启动脚本

echo "🚀 启动IWMS后端服务..."

# 检查Java版本
if ! command -v java &> /dev/null; then
    echo "❌ 错误: 未找到Java环境，请先安装Java 17+"
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 17 ]; then
    echo "❌ 错误: Java版本过低，需要Java 17+，当前版本: $JAVA_VERSION"
    exit 1
fi

echo "✅ Java版本检查通过: $(java -version 2>&1 | head -n 1)"

# 检查Maven
if ! command -v mvn &> /dev/null; then
    echo "❌ 错误: 未找到Maven，请先安装Maven 3.6+"
    exit 1
fi

echo "✅ Maven检查通过: $(mvn -version | head -n 1)"

# 创建必要的目录
echo "📁 创建必要的目录..."
mkdir -p data

# 编译项目
echo "🔨 编译项目..."
mvn clean compile

if [ $? -ne 0 ]; then
    echo "❌ 编译失败"
    exit 1
fi

echo "✅ 编译成功"

# 启动服务
echo "🌟 启动Spring Boot服务..."
echo "📊 健康检查: http://localhost:8080/api/actuator/health"
echo "🗄️  H2数据库: http://localhost:8080/api/h2-console"
echo "📚 API文档: http://localhost:8080/api/swagger-ui.html"
echo ""

mvn spring-boot:run
