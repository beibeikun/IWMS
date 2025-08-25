# IWMS 问题解决指南

## 🚨 启动问题解决方案

### 问题描述
应用启动时出现错误：
```
Uncaught Exception: Error: Could not load the 'sharp' module using the darwin-arm64 runtime
ERR_DLOPEN_FAILED: dlopen(...): Library not loaded: @rpath/libvips-cpp.8.17.1.dylib
```

### 问题原因
1. **架构不匹配**：sharp 模块的原生依赖与当前系统架构不兼容
2. **依赖缺失**：某些平台特定的依赖没有正确安装
3. **打包问题**：原生模块在打包过程中没有正确处理
4. **路径丢失**：构建后的应用无法找到原生依赖的正确路径

### 解决步骤

#### 1. 重新安装 sharp 模块，确保包含所有依赖
```bash
# 卸载现有版本
npm uninstall sharp

# 清理 npm 缓存
npm cache clean --force

# 使用平台特定参数重新安装
npm install --os=darwin --cpu=arm64 --include=optional sharp
```

#### 2. 验证依赖安装
```bash
# 检查 sharp 版本
npm list sharp

# 检查原生依赖
ls -la node_modules/@img/
ls -la node_modules/@img/sharp-libvips-darwin-arm64/lib/
```

#### 3. 修改 electron-builder 配置
在 `package.json` 中添加以下配置：
```json
{
  "build": {
    "files": [
      "dist/**/*",
      "dist-electron/**/*",
      "node_modules/@img/**/*"
    ],
    "extraResources": [
      {
        "from": "node_modules/@img",
        "to": "node_modules/@img"
      }
    ],
    "asarUnpack": [
      "node_modules/sharp/**/*",
      "node_modules/@img/**/*"
    ]
  }
}
```

#### 4. 简化主进程代码（推荐方案）
在 `electron/main.js` 中直接导入 sharp 模块：
```javascript
// 导入第三方依赖
const fs = require('fs-extra')           // 增强的文件系统操作
const XLSX = require('xlsx')            // Excel 文件处理
const glob = require('fast-glob')       // 快速文件匹配
const sharp = require('sharp')          // 图片处理库
```

#### 5. 简化构建目标（避免 DMG 权限问题）
```json
{
  "mac": {
    "target": [
      {
        "target": "zip",
        "arch": ["arm64", "x64"]
      }
    ]
  }
}
```

#### 6. 测试开发模式
```bash
# 启动开发服务器
npm run dev

# 启动 Electron 应用
npm run electron:dev
```

#### 7. 重新构建应用
```bash
# 构建 ARM64 Mac 应用
npm run build:mac-arm

# 构建所有平台
npm run build:all
```

### 验证解决方案

#### ✅ 成功标志
- 开发模式下应用正常启动
- 构建过程无错误
- 生成的应用可以正常启动
- 图片压缩功能正常工作
- 不再出现 sharp 模块错误

#### ❌ 失败标志
- 仍然出现 sharp 模块错误
- 构建过程失败
- 应用无法启动
- 功能异常

### 关键配置说明

#### **extraResources 配置**
- 确保 `node_modules/@img` 目录被复制到应用包中
- 保持原生依赖的完整路径结构
- 解决构建后路径丢失问题

#### **files 配置**
- 明确包含 sharp 模块的所有文件
- 确保原生依赖被正确打包
- 避免依赖缺失问题

#### **平台特定安装**
- 使用 `--os=darwin --cpu=arm64` 参数
- 确保安装正确的架构版本
- 包含所有可选依赖

### 预防措施

#### 1. 依赖管理
- 使用平台特定参数安装 sharp
- 定期更新依赖版本
- 检查平台兼容性
- 清理 npm 缓存

#### 2. 构建配置
- 配置 extraResources 确保原生模块
- 简化构建目标避免权限问题
- 测试不同架构的构建
- 验证构建后的应用功能

#### 3. 测试流程
- 开发模式测试
- 构建测试
- 功能测试
- 跨平台测试

### 常见问题

#### Q: 为什么会出现 sharp 模块错误？
A: 通常是因为原生依赖与系统架构不匹配，或者依赖没有正确安装，或者构建后路径丢失。

#### Q: 如何确保 sharp 模块正常工作？
A: 使用平台特定参数安装，配置 extraResources，确保原生依赖被正确打包。

#### Q: 构建失败怎么办？
A: 检查构建配置，确保 extraResources 正确配置，简化构建目标避免权限问题。

#### Q: 应用启动后功能异常？
A: 检查控制台错误信息，验证所有依赖是否正确加载，测试核心功能。

### 技术支持

如果问题仍然存在：
1. 检查 Node.js 版本（推荐 16+）
2. 清理 node_modules 并重新安装
3. 检查系统架构兼容性
4. 查看详细错误日志
5. 提交 Issue 到项目仓库

---

**记住**：大多数启动问题都与依赖安装或配置有关，按照上述步骤通常可以解决。关键是要确保原生模块被正确打包和配置。
