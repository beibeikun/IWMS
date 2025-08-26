# IWMS 项目结构

## 📁 目录结构

```
IWMS/
├── 📁 assets/                 # 应用资源文件
│   └── icon.png              # 应用图标
├── 📁 build/                 # 构建配置文件
│   └── entitlements.mac.plist # macOS 权限配置
├── 📁 dist/                  # Vite 构建输出
├── 📁 dist-electron/         # Electron 主进程构建输出
├── 📁 docs/                  # 项目文档
│   ├── BUILD_GUIDE.md       # 构建指南
│   ├── BUILD_RESULTS.md     # 构建结果
│   ├── WINDOWS_STARTUP_ISSUE.md # Windows 启动问题
│   ├── README.md            # 文档首页
│   ├── 📁 en/               # 英文文档
│   └── 📁 zh-CN/            # 中文文档
├── 📁 electron/              # Electron 主进程代码
│   ├── main.js              # 主进程入口
│   └── preload.js           # 预加载脚本
├── 📁 public/                # 静态资源
│   ├── logo.png             # 项目 Logo
│   └── README_logo.png      # README Logo
├── 📁 release/               # 应用打包输出
├── 📁 scripts/               # 构建和开发脚本
│   ├── build-all.sh         # 一键构建所有平台
│   ├── build-icons.sh       # 图标构建脚本
│   ├── start.sh             # 开发启动脚本
│   └── debug-start.sh       # 调试启动脚本
├── 📁 src/                   # Vue 前端源码
│   ├── App.vue              # 主应用组件
│   └── main.js              # 前端入口
├── 📄 .gitignore            # Git 忽略文件
├── 📄 CHANGELOG.md          # 更新日志
├── 📄 CODE_OF_CONDUCT.md    # 行为准则
├── 📄 CONTRIBUTING.md       # 贡献指南
├── 📄 GITHUB_READY_SUMMARY.md # GitHub 准备总结
├── 📄 index.html            # HTML 入口文件
├── 📄 LICENSE               # 开源许可证
├── 📄 package.json          # 项目配置和依赖
├── 📄 package-lock.json     # 依赖锁定文件
├── 📄 PROJECT_STRUCTURE.md  # 项目结构文档（本文件）
├── 📄 README.md             # 项目说明文档
├── 📄 SECURITY.md           # 安全政策
├── 📄 TROUBLESHOOTING.md    # 故障排除指南
└── 📄 vite.config.js        # Vite 配置文件
```

## 🗂️ 文件分类说明

### 📋 核心配置文件
- `package.json` - 项目配置、依赖管理、构建脚本
- `vite.config.js` - Vite 构建配置
- `index.html` - 应用 HTML 入口
- `.gitignore` - Git 版本控制忽略规则

### 🏗️ 源代码目录
- `src/` - Vue 3 前端源码
- `electron/` - Electron 主进程代码
- `assets/` - 应用资源文件

### 📚 文档目录
- `docs/` - 项目文档集合
- `README.md` - 项目主要说明
- `CHANGELOG.md` - 版本更新记录
- `TROUBLESHOOTING.md` - 故障排除指南

### 🔧 构建和脚本
- `scripts/` - 开发和构建脚本
- `build/` - 构建配置文件
- `dist/` - 构建输出目录
- `release/` - 应用打包输出

### 📦 依赖和输出
- `node_modules/` - npm 依赖包
- `dist-electron/` - Electron 构建输出
- `release/` - 最终应用包

## 🚀 快速导航

### 开发相关
- **启动开发**: `npm run electron:dev` 或 `./scripts/start.sh`
- **调试模式**: `./scripts/debug-start.sh`
- **构建应用**: `npm run build` 或 `./scripts/build-all.sh`

### 文档相关
- **项目说明**: `README.md`
- **构建指南**: `docs/BUILD_GUIDE.md`
- **故障排除**: `TROUBLESHOOTING.md`
- **Windows 问题**: `docs/WINDOWS_STARTUP_ISSUE.md`

### 配置相关
- **项目配置**: `package.json`
- **构建配置**: `vite.config.js`
- **Git 配置**: `.gitignore`

## 📝 文件命名规范

### 目录命名
- 使用小写字母和连字符
- 例如: `dist-electron/`, `node_modules/`

### 文件命名
- **配置文件**: 使用连字符，如 `package.json`, `vite.config.js`
- **文档文件**: 使用大写和下划线，如 `README.md`, `BUILD_GUIDE.md`
- **脚本文件**: 使用连字符，如 `build-all.sh`, `start.sh`

### 版本控制
- 忽略 `node_modules/`, `dist/`, `release/` 等构建输出
- 包含所有源代码和配置文件
- 包含必要的文档和脚本

## 🔄 最近优化

### 文件清理
- ✅ 删除了测试文件 (`test-layout.html`, `performance-test.js`)
- ✅ 删除了演示文件 (`iwms-demo.js`)
- ✅ 删除了重复文档 (`QUICK_TROUBLESHOOTING.md`, `CODE_COMMENTS.md`)
- ✅ 删除了系统文件 (`.DS_Store`)

### 目录重组
- ✅ 创建了 `scripts/` 目录，统一管理脚本文件
- ✅ 将构建相关文档移动到 `docs/` 目录
- ✅ 更新了 README.md 中的文件路径引用

### 结构优化
- ✅ 根目录文件数量从 30+ 减少到 20+
- ✅ 提高了文件组织的逻辑性和可维护性
- ✅ 保持了所有重要功能的完整性
