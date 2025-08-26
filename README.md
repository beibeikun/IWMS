# IWMS - 智能文件管理系统

<div align="center">

<img src="frontend/public/README_logo.png" alt="IWMS Logo" width="200">

# *Image Warehouse Management System*

---

[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue.svg)](https://electronjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16.0+-green.svg)](https://nodejs.org/)
[![Java](https://img.shields.io/badge/Java-17+-orange.svg)](https://adoptium.net/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/beibeikun/IWMS?style=social)](https://github.com/beibeikun/IWMS)

**IWMS是一个完整的智能文件管理解决方案，包含桌面应用、Web管理界面和后端服务**

</div>

---

## 🏗️ 项目架构

IWMS采用现代化的前后端分离架构，提供多种使用方式：

```
IWMS 完整系统架构
├── 🖥️ 桌面客户端 (Electron + Vue 3)
│   ├── 用户界面 (Vue 3 + Element Plus)
│   ├── 本地文件处理 (Node.js)
│   └── 进程间通信 (IPC)
├── 🌐 Web管理界面 (Vue 3 + Element Plus)
│   ├── 在线文件管理
│   ├── 任务监控面板
│   └── 系统管理控制台
└── 🔧 后端服务 (Spring Boot)
    ├── RESTful API
    ├── 文件处理服务
    ├── 任务调度管理
    └── 数据持久化
```

## 📁 项目结构

```
IWMS/
├── 🖥️ frontend/                    # 桌面应用 (Electron + Vue)
│   ├── src/                       # Vue 3 前端代码
│   ├── electron/                  # Electron 主进程
│   ├── public/                    # 静态资源
│   ├── scripts/                   # 构建脚本
│   └── package.json              # 前端依赖配置
├── 🌐 web-admin/                   # Web管理界面
│   ├── src/                       # Vue 3 组件和页面
│   ├── public/                    # 静态资源
│   └── package.json              # Web界面依赖配置
├── 🔧 backend/                     # 后端服务 (Spring Boot)
│   ├── src/main/java/            # Java 源代码
│   ├── src/main/resources/       # 配置文件
│   ├── pom.xml                   # Maven 配置
│   └── Dockerfile                # 容器化配置
├── 📚 docs/                       # 项目文档
├── 📄 ARCHITECTURE.md             # 架构说明文档
└── 📄 README.md                   # 项目说明文档
```

## ✨ 功能特性

### 🎯 核心功能
- **智能映射**: 基于Excel映射表的文件批量重命名
- **批量处理**: 支持大量文件的批量重命名操作
- **预览功能**: 执行前可预览所有变更，确保操作安全
- **详细报告**: 生成详细的处理报告，包含成功、跳过、冲突等统计
- **灵活配置**: 支持递归扫描、冲突处理策略等配置选项
- **安全可靠**: 默认复制模式，不修改源文件，支持回滚

### 🗜️ 图片压缩功能
- **智能压缩**: 按最长边像素数压缩图片，保持宽高比
- **多线程处理**: 支持多线程并行压缩，大幅提升性能
- **格式支持**: 支持主流图片格式的压缩和转换
- **质量保证**: 使用专业算法，平衡文件大小和图片质量

### 🌐 Web管理功能
- **任务监控**: 实时监控任务执行状态和进度
- **数据统计**: 系统使用统计和性能指标
- **用户管理**: 多用户权限管理和认证
- **报告中心**: 集中管理和查看所有报告

## 🚀 快速开始

### 环境要求
- **Node.js**: 16.0+ (桌面应用和Web界面)
- **Java**: 17+ (后端服务)
- **Maven**: 3.6+ (后端构建)

### 1. 启动后端服务
```bash
# 进入后端目录
cd backend

# 启动Spring Boot服务
./start.sh
# 或使用Maven
mvn spring-boot:run
```

### 2. 启动Web管理界面
```bash
# 进入Web管理界面目录
cd web-admin

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 3. 启动桌面应用
```bash
# 进入桌面应用目录
cd frontend

# 安装依赖
npm install

# 启动开发环境
npm run electron:dev:fallback
```

## 🌐 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| **桌面应用** | 桌面窗口 | Electron桌面应用 |
| **Web管理界面** | http://localhost:3000 | Vue 3管理界面 |
| **后端API** | http://localhost:8080/api | Spring Boot服务 |
| **健康检查** | http://localhost:8080/api/actuator/health | 服务状态监控 |
| **H2数据库** | http://localhost:8080/api/h2-console | 数据库管理 |

## 📦 应用打包

### 桌面应用打包
```bash
cd frontend

# 一键构建所有平台
npm run build:all

# 平台特定打包
npm run build:mac-arm    # macOS ARM64
npm run build:mac-x64    # macOS x64
npm run build:win-x64    # Windows x64
npm run build:linux      # Linux
```

### 后端服务打包
```bash
cd backend

# Maven打包
mvn clean package

# Docker构建
docker build -t iwms-backend .
```

## 🔧 开发指南

### 桌面应用开发
- 基于Electron + Vue 3
- 支持热重载开发
- 模块化架构设计

### Web界面开发
- 基于Vue 3 + Element Plus
- 响应式设计
- 组件化开发

### 后端服务开发
- 基于Spring Boot 3.2
- RESTful API设计
- 数据持久化支持

## 📚 详细文档

- [📋 项目架构说明](ARCHITECTURE.md) - 完整的架构设计文档
- [🖥️ 桌面应用文档](frontend/README.md) - 桌面应用使用说明
- [🌐 Web界面文档](web-admin/README.md) - Web管理界面说明
- [🔧 后端服务文档](backend/README.md) - 后端服务详细文档

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🆘 技术支持

如果您在使用过程中遇到问题，请：

1. 查看 [📚 文档](docs/)
2. 搜索 [Issues](../../issues)
3. 创建新的 [Issue](../../issues/new)

---

<div align="center">

**IWMS - 让文件管理更智能，让工作更高效！** 🚀

</div>
