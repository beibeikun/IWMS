# IWMS 后端服务

## 📋 项目概述

IWMS后端服务是基于Spring Boot构建的RESTful API服务，为IWMS桌面应用和Web管理界面提供强大的后端支持。

## 🏗️ 技术架构

### 核心技术栈
- **Spring Boot 3.2.0** - 主框架
- **Spring Data JPA** - 数据访问层
- **Spring Security** - 安全认证
- **H2 Database** - 内嵌数据库
- **Apache POI** - Excel文件处理
- **Thumbnailator** - 图片压缩处理
- **JWT** - 身份认证

### 项目结构
```
backend/
├── src/main/java/com/iwms/
│   ├── IwmsBackendApplication.java    # 主启动类
│   ├── controller/                    # 控制器层
│   │   └── FileTaskController.java
│   ├── service/                       # 服务层
│   │   ├── FileTaskService.java
│   │   └── impl/
│   │       └── FileTaskServiceImpl.java
│   ├── repository/                    # 数据访问层
│   │   └── FileTaskRepository.java
│   ├── entity/                        # 实体类
│   │   └── FileTask.java
│   └── dto/                           # 数据传输对象
│       └── ApiResponse.java
├── src/main/resources/
│   └── application.yml                # 配置文件
└── pom.xml                           # Maven配置
```

## 🚀 快速开始

### 环境要求
- Java 17+
- Maven 3.6+

### 启动步骤

1. **编译项目**
   ```bash
   cd backend
   mvn clean compile
   ```

2. **启动服务**
   ```bash
   mvn spring-boot:run
   ```

3. **访问服务**
   - 健康检查: http://localhost:8080/api/actuator/health
   - H2数据库: http://localhost:8080/api/h2-console
   - API文档: http://localhost:8080/api/swagger-ui.html

## 📚 API接口

### 文件任务管理

#### 创建重命名任务
```http
POST /api/tasks/rename
Content-Type: multipart/form-data

sourcePath: /path/to/source
targetPath: /path/to/target
mappingFile: [Excel文件]
taskName: 重命名任务
description: 任务描述
```

#### 创建压缩任务
```http
POST /api/tasks/compress
Content-Type: multipart/form-data

sourcePath: /path/to/source
targetPath: /path/to/target
maxWidth: 1920
maxHeight: 1080
quality: 0.8
taskName: 压缩任务
description: 任务描述
```

#### 获取任务列表
```http
GET /api/tasks?page=0&size=10
```

#### 获取任务详情
```http
GET /api/tasks/{id}
```

#### 启动任务
```http
POST /api/tasks/{id}/start
```

#### 取消任务
```http
POST /api/tasks/{id}/cancel
```

#### 删除任务
```http
DELETE /api/tasks/{id}
```

#### 获取任务统计
```http
GET /api/tasks/stats
```

#### 获取任务进度
```http
GET /api/tasks/{id}/progress
```

#### 下载任务报告
```http
GET /api/tasks/{id}/report
```

## 🔧 配置说明

### 数据库配置
- 默认使用H2内嵌数据库
- 数据文件位置: `./data/iwms.mv.db`
- 支持MySQL数据库（需要修改配置）

### 文件存储配置
- 上传目录: `./uploads`
- 临时目录: `./temp`
- 最大文件大小: 100MB
- 支持的文件类型: jpg,jpeg,png,gif,bmp,tiff,xlsx,xls,csv,txt

### 任务配置
- 最大并发任务数: 4
- 任务超时时间: 5分钟
- 图片压缩质量: 0.8
- 最大图片尺寸: 1920x1080

## 🔐 安全配置

### 默认用户
- 用户名: admin
- 密码: admin123

### JWT配置
- 令牌过期时间: 24小时
- 刷新令牌过期时间: 7天

## 📊 监控端点

### 健康检查
- GET `/api/actuator/health` - 应用健康状态
- GET `/api/actuator/info` - 应用信息
- GET `/api/actuator/metrics` - 性能指标

### 数据库监控
- H2控制台: http://localhost:8080/api/h2-console
- JDBC URL: `jdbc:h2:file:./data/iwms`
- 用户名: sa
- 密码: (空)

## 🧪 测试

### 运行测试
```bash
mvn test
```

### 集成测试
```bash
mvn verify
```

## 📦 部署

### 打包
```bash
mvn clean package
```

### 运行JAR包
```bash
java -jar target/iwms-backend-1.0.0.jar
```

### Docker部署
```bash
# 构建镜像
docker build -t iwms-backend .

# 运行容器
docker run -p 8080:8080 iwms-backend
```

## 🔄 与桌面应用集成

### 配置桌面应用
在桌面应用的配置文件中添加后端服务地址：
```json
{
  "backendUrl": "http://localhost:8080/api",
  "enableBackend": true
}
```

### API调用示例
```javascript
// 创建重命名任务
const response = await fetch('http://localhost:8080/api/tasks/rename', {
  method: 'POST',
  body: formData
});

// 获取任务进度
const progress = await fetch(`http://localhost:8080/api/tasks/${taskId}/progress`);
```

## 🛠️ 开发指南

### 添加新的任务类型
1. 在`FileTask`实体中添加新的任务类型
2. 在`FileTaskService`中添加创建方法
3. 在`FileTaskServiceImpl`中实现执行逻辑
4. 在`FileTaskController`中添加API接口

### 扩展API功能
1. 创建新的控制器类
2. 定义服务接口和实现
3. 添加数据访问层
4. 配置安全权限

## 📝 更新日志

### v1.0.0
- 初始版本发布
- 支持文件重命名任务
- 支持图片压缩任务
- 提供完整的任务管理API
- 集成H2数据库
- 添加健康检查和监控

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📄 许可证

MIT License
