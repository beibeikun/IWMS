# IWMS 线程配置指南

## 🎯 并发线程数调整位置

### 主要配置文件

#### 1. **性能配置文件** (`frontend/electron/config/performance.js`)

这是主要的配置位置，包含所有性能相关参数：

```javascript
module.exports = {
  imageProcessing: {
    // 最大并发线程数 - 在这里调整！
    maxThreads: process.env.IWMS_MAX_THREADS ? parseInt(process.env.IWMS_MAX_THREADS) : 4,
    
    // 每批处理的图片数量
    batchSize: process.env.IWMS_BATCH_SIZE ? parseInt(process.env.IWMS_BATCH_SIZE) : 10,
    
    // 是否启用多线程
    enableMultiThread: process.env.IWMS_MULTI_THREAD !== 'false',
  }
}
```

#### 2. **图片压缩器** (`frontend/electron/utils/imageCompressor.js`)

线程数在这里被使用：

```javascript
// 第152行和第198行
const numThreads = Math.min(numCPUs, imageTasks.length, config.imageProcessing.maxThreads)
```

## 🔧 调整方法

### 方法1：修改配置文件（推荐）

直接编辑 `frontend/electron/config/performance.js`：

```javascript
// 将 maxThreads 改为您想要的数值
maxThreads: 2,  // 使用2个线程
maxThreads: 6,  // 使用6个线程
maxThreads: 8,  // 使用8个线程
```

### 方法2：通过环境变量配置

在启动前设置环境变量：

```bash
# 设置2个线程
export IWMS_MAX_THREADS=2
npm run electron:dev

# 设置6个线程
export IWMS_MAX_THREADS=6
npm run electron:dev

# 设置8个线程
export IWMS_MAX_THREADS=8
npm run electron:dev
```

### 方法3：修改启动脚本

编辑 `frontend/scripts/start-optimized.sh`：

```bash
#!/bin/bash
# 设置环境变量
export IWMS_MAX_THREADS=2  # 改为您想要的线程数
export NODE_OPTIONS="--max-old-space-size=8192 --expose-gc"

# 启动应用
npm run electron:dev
```

## 📊 线程数建议

### 根据系统配置选择

| 系统配置 | 推荐线程数 | 说明 |
|---------|-----------|------|
| **内存 < 8GB** | 2 | 内存紧张，减少并发 |
| **内存 8-16GB** | 4 | 平衡性能和内存使用 |
| **内存 > 16GB** | 6-8 | 内存充足，可以更多并发 |
| **CPU < 4核** | 2-3 | CPU核心数限制 |
| **CPU 4-8核** | 4-6 | 充分利用多核 |
| **CPU > 8核** | 6-8 | 高并发处理 |

### 根据任务类型选择

| 任务类型 | 推荐线程数 | 说明 |
|---------|-----------|------|
| **小图片 (< 1MB)** | 6-8 | 处理快速，可以高并发 |
| **中等图片 (1-10MB)** | 4-6 | 平衡处理速度和内存 |
| **大图片 (> 10MB)** | 2-4 | 内存占用大，减少并发 |
| **批量处理 (> 100张)** | 2-4 | 避免内存溢出 |
| **实时处理** | 4-6 | 平衡响应时间和性能 |

## ⚠️ 注意事项

### 1. 内存使用

- **线程数越多，内存占用越大**
- 每个线程处理图片时都会占用内存
- 建议监控内存使用情况

### 2. CPU使用

- **线程数不应超过CPU核心数**
- 过多线程会导致上下文切换开销
- 建议线程数 = CPU核心数 × 0.5 到 1.0

### 3. 稳定性

- **线程数过多可能导致内存溢出**
- 建议从低线程数开始测试
- 根据实际使用情况逐步调整

## 🧪 测试建议

### 1. 渐进式测试

```bash
# 从2个线程开始测试
export IWMS_MAX_THREADS=2
npm run electron:dev

# 如果稳定，增加到4个线程
export IWMS_MAX_THREADS=4
npm run electron:dev

# 继续测试更高线程数
export IWMS_MAX_THREADS=6
npm run electron:dev
```

### 2. 监控指标

- **内存使用率**：不应超过80%
- **处理速度**：线程数增加应该提升速度
- **稳定性**：不应出现崩溃或错误

### 3. 找到最佳配置

记录不同配置下的性能表现：

| 线程数 | 内存使用 | 处理速度 | 稳定性 | 推荐度 |
|--------|----------|----------|--------|--------|
| 2 | 低 | 慢 | 高 | ⭐⭐⭐ |
| 4 | 中 | 中 | 高 | ⭐⭐⭐⭐⭐ |
| 6 | 中高 | 快 | 中 | ⭐⭐⭐⭐ |
| 8 | 高 | 很快 | 低 | ⭐⭐ |

## 🔄 动态调整

系统支持根据内存使用情况动态调整批次大小：

```javascript
// 在 memoryManager.js 中
function getRecommendedBatchSize() {
  const memUsage = process.memoryUsage()
  const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100
  
  if (heapUsagePercent > 80) {
    return 5 // 内存紧张时，减少批次大小
  } else if (heapUsagePercent > 60) {
    return 8 // 内存适中时，适中的批次大小
  } else {
    return 15 // 内存充足时，可以处理更多文件
  }
}
```

## 📝 配置示例

### 保守配置（适合内存紧张的系统）

```javascript
// frontend/electron/config/performance.js
module.exports = {
  imageProcessing: {
    maxThreads: 2,        // 2个线程
    batchSize: 5,         // 每批5张图片
    enableMultiThread: true,
    memoryThreshold: 70   // 70%内存阈值
  }
}
```

### 平衡配置（推荐）

```javascript
// frontend/electron/config/performance.js
module.exports = {
  imageProcessing: {
    maxThreads: 4,        // 4个线程
    batchSize: 10,        // 每批10张图片
    enableMultiThread: true,
    memoryThreshold: 80   // 80%内存阈值
  }
}
```

### 高性能配置（适合高配置系统）

```javascript
// frontend/electron/config/performance.js
module.exports = {
  imageProcessing: {
    maxThreads: 6,        // 6个线程
    batchSize: 15,        // 每批15张图片
    enableMultiThread: true,
    memoryThreshold: 85   // 85%内存阈值
  }
}
```

## 🚀 快速调整命令

```bash
# 进入前端目录
cd frontend

# 保守配置（2线程）
sed -i '' 's/maxThreads:.*/maxThreads: 2,/' electron/config/performance.js

# 平衡配置（4线程）
sed -i '' 's/maxThreads:.*/maxThreads: 4,/' electron/config/performance.js

# 高性能配置（6线程）
sed -i '' 's/maxThreads:.*/maxThreads: 6,/' electron/config/performance.js
```

---

**总结**：线程数主要在 `frontend/electron/config/performance.js` 文件的 `maxThreads` 参数中调整，建议根据系统配置从4个线程开始测试，逐步调整找到最佳配置。
