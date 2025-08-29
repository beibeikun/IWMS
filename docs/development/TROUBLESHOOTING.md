# IWMS 故障排除指南

## 🚨 常见启动问题

### 问题1：模块找不到错误

#### 错误信息
```
Error: Cannot find module '../config/performance'
```

#### 原因分析
- 模块路径引用错误
- 循环依赖问题
- 构建文件未正确生成

#### 解决方案

##### 方法1：使用修复启动脚本（推荐）
```bash
cd frontend
npm run electron:dev:fix
```

##### 方法2：手动清理和重启
```bash
cd frontend

# 清理构建文件
rm -rf dist dist-electron

# 设置环境变量
export NODE_OPTIONS="--max-old-space-size=8192 --expose-gc"
export IWMS_MAX_THREADS=4

# 重新启动
npm run electron:dev
```

##### 方法3：使用优化启动脚本
```bash
cd frontend
npm run electron:dev:optimized
```

### 问题2：内存溢出错误

#### 错误信息
```
FATAL ERROR: Committing semi space failed. Allocation failed - JavaScript heap out of memory
```

#### 解决方案
```bash
# 设置更大的内存限制
export NODE_OPTIONS="--max-old-space-size=8192 --expose-gc"

# 减少线程数
export IWMS_MAX_THREADS=2

# 启动应用
npm run electron:dev
```

### 问题3：依赖模块错误

#### 错误信息
```
Cannot find module 'fs-extra'
Cannot find module 'sharp'
```

#### 解决方案
```bash
cd frontend

# 重新安装依赖
npm install

# 或者清理后重新安装
rm -rf node_modules package-lock.json
npm install
```

## 🔧 启动脚本说明

### 1. **修复启动脚本** (`fix-and-start.sh`)
- 自动清理构建文件
- 设置优化环境变量
- 重新启动应用
- **推荐用于解决模块找不到问题**

### 2. **优化启动脚本** (`start-optimized.sh`)
- 设置内存限制和垃圾回收
- 配置线程数和批次大小
- 启动优化模式

### 3. **标准启动脚本** (`start.sh`)
- 基础启动流程
- 依赖检查和安装
- 标准开发模式

## 📋 启动命令对比

| 命令 | 用途 | 特点 |
|------|------|------|
| `npm run electron:dev` | 标准启动 | 基础功能，可能遇到模块问题 |
| `npm run electron:dev:fix` | 修复启动 | 清理构建文件，解决模块问题 |
| `npm run electron:dev:optimized` | 优化启动 | 内存优化，性能配置 |
| `npm run electron:dev:fallback` | 备用启动 | 兼容性启动方式 |

## 🛠️ 手动修复步骤

### 步骤1：检查文件结构
```bash
cd frontend
ls -la electron/
ls -la electron/config/
ls -la electron/utils/
```

### 步骤2：清理构建文件
```bash
rm -rf dist dist-electron
```

### 步骤3：设置环境变量
```bash
export NODE_OPTIONS="--max-old-space-size=8192 --expose-gc"
export IWMS_MAX_THREADS=4
export IWMS_BATCH_SIZE=10
export IWMS_MULTI_THREAD=true
```

### 步骤4：重新启动
```bash
npm run electron:dev
```

## 🔍 问题诊断

### 1. **检查控制台输出**
- 查看具体的错误信息
- 检查模块加载顺序
- 确认文件路径是否正确

### 2. **检查依赖状态**
```bash
# 检查Node.js版本
node --version

# 检查npm版本
npm --version

# 检查依赖安装状态
npm list --depth=0
```

### 3. **检查文件权限**
```bash
# 检查脚本执行权限
ls -la scripts/

# 添加执行权限
chmod +x scripts/*.sh
```

## 📝 预防措施

### 1. **定期清理**
```bash
# 定期清理构建文件
npm run clean

# 或者手动清理
rm -rf dist dist-electron
```

### 2. **使用优化脚本**
- 优先使用 `npm run electron:dev:fix`
- 避免直接使用 `npm run electron:dev`

### 3. **环境变量配置**
- 在 `.bashrc` 或 `.zshrc` 中设置环境变量
- 避免每次手动设置

## 🚀 快速恢复

如果遇到严重问题，可以使用以下命令快速恢复：

```bash
cd frontend

# 完全重置
rm -rf dist dist-electron node_modules package-lock.json

# 重新安装依赖
npm install

# 使用修复脚本启动
npm run electron:dev:fix
```

## 📞 获取帮助

如果问题仍然存在：

1. **查看日志**：检查控制台输出和错误信息
2. **检查版本**：确认Node.js和npm版本兼容性
3. **提交Issue**：在GitHub仓库提交详细的问题描述
4. **社区支持**：在项目讨论区寻求帮助

---

**记住**：大多数启动问题都可以通过使用 `npm run electron:dev:fix` 命令解决！
