<div align="center">

<img src="public/README_logo.png" alt="IWMS Logo" width="200">

# *Image Warehouse Management System*

---

[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue.svg)](https://electronjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16.0+-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/beibeikun/IWMS?style=social)](https://github.com/beibeikun/IWMS)

**IWMS是一个跨平台智能文件管理工具箱，基于Electron和Vue 3构建**

</div>

---

基于Electron和Vue 3构建的强大智能文件管理工具箱。目前包含IWMS核心功能，未来将扩展更多实用工具。

## ✨ 功能特性

### 🎯 IWMS核心功能
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

## 🚀 快速开始

### 环境要求
- Node.js 16.0 或更高版本
- npm 或 yarn 包管理器

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/beibeikun/IWMS.git
   cd IWMS
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发模式**
   ```bash
   npm run electron:dev
   ```

4. **构建生产版本**
   ```bash
   npm run electron:build
   ```

## 📖 文档

### 📚 中文文档
- [📋 项目总结](docs/zh-CN/PROJECT_SUMMARY.md) - 项目开发总结
- [🚀 更新日志](docs/zh-CN/CHANGELOG.md) - 功能更新总结
- [🗺️ 功能规划](docs/zh-CN/ROADMAP.md) - 功能规划
- [⚡ 快速启动](docs/zh-CN/QUICK_START.md) - 快速启动指南
- [🖼️ 图片压缩](docs/zh-CN/IMAGE_COMPRESSION.md) - 图片压缩功能说明
- [🔍 文件过滤](docs/zh-CN/FILE_FILTERING.md) - 文件过滤功能说明
- [🖥️ 界面预览](docs/zh-CN/UI_PREVIEW.md) - 界面预览说明
- [📝 映射示例](docs/zh-CN/MAPPING_EXAMPLES.md) - 示例映射表

### 🌍 英文文档
- 即将推出...

## 🏗️ 系统架构

### 当前版本 (v1.0.0)
- ✅ **IWMS核心** - 完整的文件重命名解决方案
- ✅ **图片压缩** - 集成的压缩功能

### 即将推出功能
- 🚧 **独立图片压缩工具** (v1.1.0)
- 📋 **批量格式转换** (v1.2.0)
- 📋 **文件整理工具** (v1.3.0)

### 长期规划
- 🔮 **文件同步工具** (v2.0.0)
- 🔮 **文件备份工具** (v2.1.0)
- 🔮 **文件搜索工具** (v2.2.0)

## 🛠️ 技术栈

- **前端**: Vue 3 + Element Plus + Vite
- **桌面端**: Electron
- **文件处理**: Node.js + fs-extra + fast-glob
- **Excel解析**: xlsx库
- **图片处理**: Sharp库

## 📁 项目结构

```
IWMS/
├── docs/                    # 文档目录
│   ├── zh-CN/             # 中文文档
│   └── en/                # 英文文档
├── electron/               # Electron主进程
│   ├── main.js            # 主进程入口
│   └── preload.js         # 预加载脚本
├── src/                    # Vue前端源码
│   ├── App.vue            # 主应用组件
│   └── main.js            # Vue应用入口
├── assets/                 # 静态资源
├── public/                 # 公共资源
├── package.json            # 项目配置
├── vite.config.js          # Vite构建配置
├── start.sh                # 开发启动脚本
└── README.md               # 本文档
```

## 🎯 使用场景

### 文件管理
- 基于Excel映射表的文件批量重命名
- 图片库整理
- 设计素材管理

### 图片优化
- 照片库优化（4K到1080p压缩）
- 网站图片优化
- 移动设备适配
- 存储空间管理

## 🔧 开发

### 可用脚本
- `npm run dev` - 启动Vite开发服务器
- `npm run electron:dev` - 启动Electron开发模式
- `npm run build` - 构建Vue应用
- `npm run electron:build` - 构建完整Electron应用

### 测试
```bash
# 运行演示脚本
node iwms-demo.js
```

## 📄 许可证

本项目采用MIT许可证 - 详情请查看 [LICENSE](LICENSE) 文件。

## 🤝 贡献

我们欢迎贡献！请随时提交issue和pull request来改进这个工具。

### 如何贡献
1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m '添加一些AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📞 支持

如果您有任何问题或需要帮助，请：
- 在GitHub上开启issue
- 查看 `docs/` 文件夹中的文档
- 查看更新日志了解最新更新

## ⭐ 星标历史

[![Star History Chart](https://api.star-history.com/svg?repos=beibeikun/IWMS&type=Date)](https://star-history.com/#beibeikun/IWMS&Date)

---

**由IWMS团队用心制作** ❤️
