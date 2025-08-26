# 使用OpenJDK 17作为基础镜像
FROM openjdk:17-jdk-slim

# 设置工作目录
WORKDIR /app

# 复制Maven配置文件
COPY pom.xml .

# 复制源代码
COPY src ./src

# 安装Maven并构建项目
RUN apt-get update && \
    apt-get install -y maven && \
    mvn clean package -DskipTests && \
    rm -rf /root/.m2 && \
    apt-get remove -y maven && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 暴露端口
EXPOSE 8080

# 创建必要的目录
RUN mkdir -p /app/data /app/uploads /app/temp /app/reports

# 设置环境变量
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# 启动命令
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar target/iwms-backend-1.0.0.jar"]
