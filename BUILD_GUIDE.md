# IWMS 应用打包指南

本指南将帮助您将IWMS应用打包成不同平台的安装包。

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 构建图标（可选）
```bash
./build-icons.sh
```
**注意**：需要安装ImageMagick：`brew install imagemagick`

### 3. 选择打包命令

#### Mac应用
```bash
# ARM64架构 (Apple Silicon)
npm run build:mac-arm

# x64架构 (Intel)
npm run build:mac-x64
```

#### Windows应用
```bash
# x64架构 (64位)
npm run build:win-x64

# ia32架构 (32位)
npm run build:win-ia32
```

#### 所有平台
```bash
npm run build:all
```

## 📱 平台支持

### macOS
- **ARM64**: Apple Silicon (M1/M2/M3)
- **x64**: Intel处理器
- **格式**: DMG安装包 + ZIP压缩包
- **要求**: macOS 10.14+

### Windows
- **x64**: 64位系统
- **ia32**: 32位系统
- **格式**: NSIS安装包 + 便携版
- **要求**: Windows 7+

### Linux
- **x64**: 64位系统
- **armv7l**: ARM 32位
- **arm64**: ARM 64位
- **格式**: AppImage + DEB包

## 🔧 构建配置

### 主要配置
- **应用ID**: `com.iwms.app`
- **产品名称**: `IWMS`
- **输出目录**: `release/`

### Mac特定配置
- **类别**: 实用工具
- **硬化运行时**: 启用
- **门禁评估**: 禁用
- **权限**: 文件访问、网络等

### Windows特定配置
- **安装程序**: NSIS
- **执行级别**: 普通用户
- **快捷方式**: 桌面和开始菜单

## 📁 输出文件

构建完成后，您将在 `release/` 目录中找到：

### Mac
- `IWMS-{version}-arm64.dmg` - ARM64 DMG安装包
- `IWMS-{version}-arm64.zip` - ARM64 ZIP压缩包
- `IWMS-{version}-x64.dmg` - x64 DMG安装包
- `IWMS-{version}-x64.zip` - x64 ZIP压缩包

### Windows
- `IWMS Setup {version}.exe` - x64安装程序
- `IWMS Setup {version} (ia32).exe` - ia32安装程序
- `IWMS-{version}-x64-portable.exe` - x64便携版
- `IWMS-{version}-ia32-portable.exe` - ia32便携版

### Linux
- `IWMS-{version}-x64.AppImage` - x64 AppImage
- `IWMS-{version}-arm64.AppImage` - ARM64 AppImage
- `IWMS-{version}-x64.deb` - x64 DEB包

## ⚠️ 注意事项

### 代码签名
- **Mac**: 需要Apple Developer账号进行代码签名
- **Windows**: 建议使用代码签名证书
- **Linux**: 通常不需要签名

### 权限设置
- **Mac**: 已配置必要的entitlements
- **Windows**: 使用普通用户权限运行
- **Linux**: 遵循系统权限策略

### 依赖处理
- 所有Node.js依赖已包含在应用中
- 图片处理库(sharp)已预编译
- 无需额外安装依赖

## 🐛 常见问题

### 构建失败
1. 检查Node.js版本 (推荐16+)
2. 确保所有依赖已安装
3. 检查磁盘空间是否充足

### 图标问题
1. 运行 `./build-icons.sh` 生成图标
2. 确保图标文件存在且格式正确
3. 检查图标文件路径配置

### 权限问题
1. Mac: 检查entitlements配置
2. Windows: 确认执行级别设置
3. Linux: 检查文件权限

## 🔄 更新版本

### 修改版本号
```bash
# 在package.json中修改version字段
"version": "1.0.1"
```

### 重新构建
```bash
npm run build:all
```

## 📞 技术支持

如果遇到构建问题，请：
1. 检查错误日志
2. 确认系统环境
3. 查看electron-builder文档
4. 提交Issue到项目仓库

---

**祝您构建愉快！** 🎉
