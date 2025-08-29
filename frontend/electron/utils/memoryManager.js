/**
 * 内存管理工具模块
 * 
 * 监控内存使用情况
 * 自动垃圾回收
 * 内存优化建议
 * 
 * @author IWMS Team
 * @version 1.0.0
 */

const os = require('os')

/**
 * 获取当前内存使用情况
 */
function getMemoryUsage() {
  const memUsage = process.memoryUsage()
  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  
  return {
    process: {
      rss: formatBytes(memUsage.rss),           // 常驻集大小
      heapTotal: formatBytes(memUsage.heapTotal), // 堆总大小
      heapUsed: formatBytes(memUsage.heapUsed),   // 堆已使用
      external: formatBytes(memUsage.external),   // 外部内存
      arrayBuffers: formatBytes(memUsage.arrayBuffers) // ArrayBuffer内存
    },
    system: {
      total: formatBytes(totalMem),             // 系统总内存
      free: formatBytes(freeMem),               // 系统可用内存
      used: formatBytes(totalMem - freeMem),    // 系统已用内存
      usagePercent: Math.round(((totalMem - freeMem) / totalMem) * 100)
    }
  }
}

/**
 * 格式化字节数
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 检查内存使用是否过高
 */
function isMemoryUsageHigh() {
  const memUsage = process.memoryUsage()
  const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100
  
  // 如果堆使用率超过80%，认为内存使用过高
  return heapUsagePercent > 80
}

/**
 * 强制垃圾回收
 */
function forceGarbageCollection() {
  if (global.gc) {
    global.gc()
    return true
  }
  return false
}

/**
 * 内存优化建议
 */
function getMemoryOptimizationTips() {
  const tips = []
  const memUsage = process.memoryUsage()
  const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100
  
  if (heapUsagePercent > 90) {
    tips.push('⚠️ 内存使用率过高，建议立即处理')
    tips.push('💡 减少并发处理的图片数量')
    tips.push('💡 降低图片压缩质量')
    tips.push('💡 分批处理文件')
  } else if (heapUsagePercent > 70) {
    tips.push('⚠️ 内存使用率较高，需要注意')
    tips.push('💡 考虑分批处理文件')
    tips.push('💡 监控内存使用情况')
  } else if (heapUsagePercent > 50) {
    tips.push('✅ 内存使用正常')
    tips.push('💡 可以继续处理更多文件')
  } else {
    tips.push('✅ 内存使用良好')
    tips.push('💡 系统运行流畅')
  }
  
  return tips
}

/**
 * 获取推荐的处理批次大小
 */
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

/**
 * 内存监控器
 */
class MemoryMonitor {
  constructor(intervalMs = 5000) {
    this.intervalMs = intervalMs
    this.monitorInterval = null
    this.isMonitoring = false
  }
  
  start() {
    if (this.isMonitoring) return
    
    this.isMonitoring = true
    this.monitorInterval = setInterval(() => {
      const memInfo = getMemoryUsage()
      const tips = getMemoryOptimizationTips()
      
      console.log('🔍 内存监控:', new Date().toLocaleTimeString())
      console.log('📊 进程内存:', memInfo.process.heapUsed, '/', memInfo.process.heapTotal)
      console.log('💻 系统内存:', memInfo.system.used, '/', memInfo.system.total, `(${memInfo.system.usagePercent}%)`)
      
      if (tips.length > 0) {
        console.log('💡 优化建议:')
        tips.forEach(tip => console.log('   ', tip))
      }
      
      // 如果内存使用过高，自动垃圾回收
      if (isMemoryUsageHigh()) {
        console.log('🧹 自动垃圾回收...')
        forceGarbageCollection()
      }
      
      console.log('---')
    }, this.intervalMs)
    
    console.log('✅ 内存监控已启动')
  }
  
  stop() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval)
      this.monitorInterval = null
    }
    this.isMonitoring = false
    console.log('⏹️ 内存监控已停止')
  }
  
  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      intervalMs: this.intervalMs
    }
  }
}

module.exports = {
  getMemoryUsage,
  isMemoryUsageHigh,
  forceGarbageCollection,
  getMemoryOptimizationTips,
  getRecommendedBatchSize,
  MemoryMonitor
}
