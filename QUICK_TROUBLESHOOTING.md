# IWMS 快速排错清单

## ✅ 已完成修复的问题

### 1. 全局唯一窗口
- ✅ 确保项目里只有一个 `createWindow()` 定义与调用路径
- ✅ 主进程文件 `electron/main.js` 中只有一个窗口创建函数

### 2. 去重事件
- ✅ 使用 `app.whenReady()` 启动应用
- ✅ 没有重复的 `app.on('ready', ...)` 事件监听器

### 3. macOS 激活守则
- ✅ `activate` 事件处理中已添加判空检查
- ✅ 使用 `BrowserWindow.getAllWindows().length === 0` 判断

### 4. 延迟显示
- ✅ 使用 `show: false` + `ready-to-show` 事件再 `show()`
- ✅ 窗口创建时设置 `show: false`
- ✅ 监听 `ready-to-show` 事件后显示窗口

### 5. 脚本去重
- ✅ 开发脚本中只保留一种 Electron 启动方式
- ✅ 使用 `vite-plugin-electron` 插件方式
- ✅ 移除了手写的 `electron .` 启动脚本
- ✅ 清理了不需要的依赖包

### 6. 白屏问题修复
- ✅ 改进了环境变量检测逻辑
- ✅ 添加了页面加载状态监听
- ✅ 增加了错误处理和重试机制
- ✅ 提供了备用启动方式

### 7. 预览功能修复
- ✅ 解决了 "require is not defined" 错误
- ✅ 将文件预览逻辑移到主进程处理
- ✅ 添加了 previewFileChanges API 接口
- ✅ 避免了渲染进程中使用 Node.js 模块

## 🔧 修复详情

### 主要变更
1. **package.json**: 简化启动脚本，移除重复的 electron 启动方式
2. **electron/main.js**: 添加延迟显示机制，优化窗口创建
3. **vite.config.js**: 优化配置，确保开发模式正确启动
4. **依赖清理**: 移除 `concurrently`, `cross-env`, `wait-on` 等不再需要的包

### 启动方式
- 开发模式: `npm run electron:dev` (使用 vite + vite-plugin-electron)
- 备用开发模式: `npm run electron:dev:fallback` (使用 concurrently + wait-on)
- 构建: `npm run electron:build`
- 发布: `npm run dist`

## 🚀 使用方法

### 开发模式启动
```bash
# 主要方式
npm run electron:dev

# 如果上面有问题，使用备用方式
npm run electron:dev:fallback

# 或者使用脚本
./start.sh
```

### 调试启动
```bash
./debug-start.sh
```

### 构建应用
```bash
npm run electron:build
```

## 📝 注意事项

1. 确保 Node.js 版本兼容 (推荐 16+)
2. 首次运行前执行 `npm install` 安装依赖
3. 开发模式下会自动打开 DevTools
4. 窗口会在内容加载完成后才显示，避免白屏闪烁

## 🐛 常见问题排查

### 白屏问题解决方案
1. **使用备用启动方式**：
   ```bash
   npm run electron:dev:fallback
   ```

2. **检查开发服务器**：
   - 确保 Vite 开发服务器在端口 5173 上运行
   - 检查控制台是否有错误信息

3. **环境变量问题**：
   - 确保 `NODE_ENV=development` 和 `IS_DEV=true`
   - 使用调试脚本检查环境

4. **依赖问题**：
   - 删除 `node_modules` 重新安装
   - 检查 `package-lock.json` 是否损坏

### 如果遇到启动问题
1. 检查 Node.js 版本
2. 删除 `node_modules` 重新安装依赖
3. 检查端口 5173 是否被占用
4. 查看控制台错误信息
5. 使用 `./debug-start.sh` 进行诊断

### 如果遇到预览问题
1. **"require is not defined" 错误**：
   - 这是渲染进程安全限制导致的
   - 已通过将预览逻辑移到主进程解决
   - 使用 `previewFileChanges` API 进行预览

2. **预览失败**：
   - 检查映射表是否正确上传
   - 确认输入和输出路径是否有效
   - 查看主进程控制台错误信息

### 如果遇到构建问题
1. 确保已安装所有依赖
2. 检查 `dist-electron` 目录是否正确生成
3. 验证 `dist` 目录中的前端文件

## 🔍 调试技巧

### 查看主进程日志
在主进程控制台中查看以下日志：
- "开发模式：连接到 Vite 开发服务器..."
- "窗口准备就绪，显示窗口..."
- "页面加载完成"

### 检查网络连接
确保 Electron 可以连接到 `http://localhost:5173`

### 使用备用启动方式
如果 vite-plugin-electron 有问题，使用：
```bash
npm run electron:dev:fallback
```
