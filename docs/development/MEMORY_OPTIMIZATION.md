# IWMS 内存优化指南

## 🚨 问题描述

在使用IWMS进行批量重命名和图片压缩时，可能会遇到JavaScript堆内存溢出错误：

```
FATAL ERROR: Committing semi space failed. Allocation failed - JavaScript heap out of memory
```

## 🔍 问题原因

1. **图片数据过大**：处理大量或高分辨率图片时，Sharp库会在内存中加载图片数据
2. **多线程并发**：Worker线程同时处理多个图片，每个线程占用大量内存
3. **内存泄漏**：图片处理完成后，内存可能没有及时释放
4. **Node.js内存限制**：默认内存限制不足以处理大量图片

## ✅ 解决方案

### 1. 使用优化启动脚本

推荐使用优化启动脚本，自动配置内存限制：

```bash
# 进入前端目录
cd frontend

# 使用优化启动脚本
npm run electron:dev:optimized

# 或者直接运行脚本
./scripts/start-optimized.sh
```

### 2. 手动设置环境变量

如果不想使用脚本，可以手动设置：

```bash
# 设置Node.js内存限制为8GB
export NODE_OPTIONS="--max-old-space-size=8192 --expose-gc"

# 启动应用
npm run electron:dev
```

### 3. 修改package.json脚本

在`package.json`中添加内存限制：

```json
{
  "scripts": {
    "electron:dev:fallback": "node scripts/copy-electron-modules.js && concurrently \"npm run dev\" \"wait-on tcp:5173 && cross-env IS_DEV=true electron . --max-old-space-size=8192\""
  }
}
```

## 🛠️ 代码优化

### 1. 分批处理图片

系统已自动实现分批处理，避免一次性处理过多图片：

```javascript
// 根据内存使用情况动态调整批次大小
const batchSize = getRecommendedBatchSize() // 5-15张图片
const batches = []
for (let i = 0; i < imageCompressionTasks.length; i += batchSize) {
  batches.push(imageCompressionTasks.slice(i, i + batchSize))
}
```

### 2. 减少并发线程数

从8个线程减少到4个线程，降低内存压力：

```javascript
// 减少线程数，避免内存溢出
const numThreads = Math.min(numCPUs, imageTasks.length, 4) // 最多4个线程
```

### 3. 强制垃圾回收

每批处理完成后自动垃圾回收：

```javascript
// 每批处理完后强制垃圾回收
if (global.gc) {
  global.gc()
}
```

## 📊 内存监控

### 1. 内存使用情况

系统会实时监控内存使用：

```
🔍 内存监控: 14:30:25
📊 进程内存: 512.5 MB / 1.2 GB
💻 系统内存: 8.5 GB / 16.0 GB (53%)
💡 优化建议:
   ✅ 内存使用正常
   💡 可以继续处理更多文件
```

### 2. 自动优化建议

根据内存使用情况提供建议：

- **内存使用率 > 90%**：建议立即处理，减少并发数量
- **内存使用率 > 70%**：需要注意，考虑分批处理
- **内存使用率 > 50%**：正常，可以继续处理
- **内存使用率 < 50%**：良好，系统运行流畅

## 🎯 最佳实践

### 1. 处理大量图片时

- 使用优化启动脚本
- 分批处理，每批5-15张图片
- 监控内存使用情况
- 避免同时处理过多高分辨率图片

### 2. 系统配置建议

- **内存**：建议16GB以上
- **CPU**：多核心处理器，支持多线程
- **存储**：SSD硬盘，提升I/O性能

### 3. 图片处理建议

- **压缩模式**：优先使用"最长边模式"，内存占用更少
- **压缩参数**：合理设置压缩参数，避免过度压缩
- **文件格式**：优先处理常见格式（JPG、PNG）

## 🔧 故障排除

### 1. 仍然出现内存溢出

1. 检查是否使用了优化启动脚本
2. 减少同时处理的图片数量
3. 降低图片压缩质量
4. 重启应用，清理内存

### 2. 性能问题

1. 检查系统内存使用情况
2. 关闭其他占用内存的应用
3. 使用SSD硬盘提升I/O性能
4. 调整批次大小

### 3. 启动失败

1. 检查Node.js版本（建议16.0+）
2. 检查依赖是否正确安装
3. 清理node_modules重新安装
4. 检查系统权限

## 📝 更新日志

- **v1.0.0**：初始版本，基础内存优化
- **v1.1.0**：添加分批处理，减少内存占用
- **v1.2.0**：集成内存监控，自动优化建议
- **v1.3.0**：动态批次大小，智能内存管理

## 🤝 技术支持

如果遇到问题，请：

1. 查看控制台错误信息
2. 检查内存使用情况
3. 使用优化启动脚本
4. 提交Issue到GitHub仓库

---

**注意**：内存优化功能需要Node.js支持`--expose-gc`参数，确保使用正确的启动方式。
