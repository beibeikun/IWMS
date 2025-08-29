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
│   ├── architecture/             # 架构文档
│   └── development/              # 开发文档
├── 🚀 start-all.sh               # 一键启动所有服务
├── 🛑 stop-all.sh                # 一键停止所有服务
└── 📄 README.md                  # 项目说明文档
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

### 📁 文件操作功能
- **整理排序**: 智能文件排序和整理，支持多种排序规则
- **文件整理排序**: 智能识别主图和从图，支持两种重命名模式，保证幂等性
- **批量操作**: 批量移动、复制、重命名等操作
- **文件过滤**: 按类型、大小、时间等条件过滤文件
- **预览功能**: 操作前预览，确保操作安全
- **进度监控**: 实时显示操作进度和状态
- **子菜单导航**: 完整的子菜单结构，提供更好的导航体验

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

### 🎯 一键启动所有服务
```bash
# 启动所有服务（推荐）
./start-all.sh

# 或者使用npm命令
npm run dev:all
```

### 🔧 单独启动服务
```bash
# 启动后端服务
npm run dev:backend

# 启动Web管理界面
npm run dev:web

# 启动桌面应用
npm run dev:desktop
```

### 🛑 停止所有服务
```bash
# 停止所有服务
./stop-all.sh

# 或者使用npm命令
npm run stop:all
```

## 📚 详细文档

- **📋 [项目架构](docs/architecture/ARCHITECTURE.md)** - 系统架构详细说明
- **🏗️ [项目结构](docs/architecture/PROJECT_STRUCTURE.md)** - 目录结构说明
- **🔄 [重构总结](docs/architecture/REFACTOR_SUMMARY.md)** - 项目重构历程
- **🔧 [故障排除](docs/development/TROUBLESHOOTING.md)** - 常见问题解决方案
- **🔒 [安全指南](docs/development/SECURITY.md)** - 安全配置和最佳实践
- **📝 [贡献指南](docs/development/CONTRIBUTING.md)** - 如何参与项目开发
- **📋 [行为准则](docs/development/CODE_OF_CONDUCT.md)** - 社区行为规范

## 🌐 服务访问

启动成功后，可以通过以下地址访问各服务：

- **🖥️ 桌面应用**: 自动打开Electron窗口
- **🌐 Web管理界面**: http://localhost:3000
- **🔧 后端API**: http://localhost:8080/api
- **📊 健康检查**: http://localhost:8080/api/actuator/health
- **🗄️ H2数据库**: http://localhost:8080/api/h2-console

## 🛠️ 开发指南

### 安装依赖
```bash
# 安装所有依赖
npm run install:all

# 单独安装
npm run install:desktop  # 桌面应用依赖
npm run install:web      # Web界面依赖
```

### 构建项目
```bash
# 构建所有项目
npm run build:all

# 单独构建
npm run build:desktop  # 构建桌面应用
npm run build:web      # 构建Web界面
npm run build:backend  # 构建后端服务
```

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](docs/development/CONTRIBUTING.md) 了解详情。

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

<div align="center">

**IWMS - 让文件管理更智能** 🚀

</div>
