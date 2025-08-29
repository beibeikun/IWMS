/**
 * 配置管理器
 * 
 * 管理IWMS的所有配置，支持实时更新
 * 
 * @author IWMS Team
 * @version 1.0.0
 */

const fs = require('fs-extra')
const path = require('path')
const os = require('os')

// 获取设置文件路径
function getSettingsPath() {
  // 测试模式：优先使用测试设置文件
  if (process.env.NODE_ENV === 'test' || process.env.IWMS_TEST_MODE === 'true') {
    // 从当前工作目录查找测试设置文件
    const testPath = path.join(process.cwd(), 'test-settings.json')
    if (fs.existsSync(testPath)) {
      console.log('🧪 使用测试设置文件:', testPath)
      return testPath
    }
    
    // 备用路径：从脚本目录查找
    const scriptDir = path.dirname(require.main.filename)
    const altTestPath = path.join(scriptDir, 'test-settings.json')
    if (fs.existsSync(altTestPath)) {
      console.log('🧪 使用备用测试设置文件:', altTestPath)
      return altTestPath
    }
    
    console.log('⚠️ 测试设置文件未找到，使用默认配置')
  }
  
  // 使用Electron标准的userData路径，与main.js保持一致
  try {
    // 尝试获取Electron的userData路径
    const { app } = require('electron')
    if (app && app.getPath) {
      return path.join(app.getPath('userData'), 'settings.json')
    }
  } catch (error) {
    console.log('⚠️ 无法获取Electron userData路径，使用备用路径')
  }
  
  // 备用路径：使用传统的系统路径
  const platform = os.platform()
  let settingsDir
  
  if (platform === 'win32') {
    settingsDir = path.join(process.env.APPDATA, 'IWMS')
  } else if (platform === 'darwin') {
    settingsDir = path.join(os.homedir(), 'Library', 'Application Support', 'IWMS')
  } else {
    settingsDir = path.join(os.homedir(), '.config', 'iwms')
  }
  
  return path.join(settingsDir, 'settings.json')
}

// 默认配置
const defaultConfig = {
  imageProcessing: {
    maxThreads: 4,
    batchSize: 10,
    enableMultiThread: true,
    memoryThreshold: 80
  },
  
  memory: {
    enableAutoGC: true,
    gcInterval: 5000,
    monitorInterval: 5000
  },
  
  fileProcessing: {
    maxConcurrentFiles: 100,
    scanTimeout: 30000
  }
}

// 当前配置缓存
let currentConfig = null
let lastConfigUpdate = 0
const CONFIG_CACHE_DURATION = 1000 // 1秒缓存

/**
 * 读取系统设置
 */
function loadSystemSettings() {
  try {
    const settingsPath = getSettingsPath()
    
    if (fs.existsSync(settingsPath)) {
      const settings = fs.readJsonSync(settingsPath)
      return {
        maxThreads: settings.maxThreads || 4,
        batchSize: settings.batchSize || 10,
        useMultiThread: settings.useMultiThread !== undefined ? settings.useMultiThread : true
      }
    }
  } catch (error) {
    console.warn('⚠️ 读取系统设置失败:', error.message)
  }
  
  return {
    maxThreads: 4,
    batchSize: 10,
    useMultiThread: true
  }
}

/**
 * 获取当前配置
 */
function getCurrentConfig() {
  const now = Date.now()
  
  // 如果缓存过期，重新读取配置
  if (!currentConfig || (now - lastConfigUpdate) > CONFIG_CACHE_DURATION) {
    const systemSettings = loadSystemSettings()
    
    currentConfig = {
      imageProcessing: {
        // 最大并发线程数 - 优先使用系统设置，其次环境变量，最后默认值
        maxThreads: systemSettings.maxThreads || (process.env.IWMS_MAX_THREADS ? parseInt(process.env.IWMS_MAX_THREADS) : 4),
        
        // 每批处理的图片数量 - 优先使用系统设置，其次环境变量，最后默认值
        batchSize: systemSettings.batchSize || (process.env.IWMS_BATCH_SIZE ? parseInt(process.env.IWMS_BATCH_SIZE) : 10),
        
        // 是否启用多线程 - 优先使用系统设置，其次环境变量，最后默认值
        enableMultiThread: systemSettings.useMultiThread !== undefined ? systemSettings.useMultiThread : (process.env.IWMS_MULTI_THREAD !== 'false'),
        
        // 内存阈值（百分比）
        memoryThreshold: process.env.IWMS_MEMORY_THRESHOLD ? parseInt(process.env.IWMS_MEMORY_THRESHOLD) : 80
      },
      
      memory: {
        // 是否启用自动垃圾回收
        enableAutoGC: process.env.IWMS_AUTO_GC !== 'false',
        
        // 垃圾回收间隔（毫秒）
        gcInterval: process.env.IWMS_GC_INTERVAL ? parseInt(process.env.IWMS_GC_INTERVAL) : 5000,
        
        // 内存监控间隔（毫秒）
        monitorInterval: process.env.IWMS_MONITOR_INTERVAL ? parseInt(process.env.IWMS_MONITOR_INTERVAL) : 5000
      },
      
      fileProcessing: {
        // 最大同时处理的文件数
        maxConcurrentFiles: process.env.IWMS_MAX_CONCURRENT_FILES ? parseInt(process.env.IWMS_MAX_CONCURRENT_FILES) : 100,
        
        // 文件扫描超时时间（毫秒）
        scanTimeout: process.env.IWMS_SCAN_TIMEOUT ? parseInt(process.env.IWMS_SCAN_TIMEOUT) : 30000
      }
    }
    
    lastConfigUpdate = now
    
    // 打印配置信息
    console.log('🔧 IWMS配置更新:', {
      maxThreads: currentConfig.imageProcessing.maxThreads,
      batchSize: currentConfig.imageProcessing.batchSize,
      enableMultiThread: currentConfig.imageProcessing.enableMultiThread,
      memoryThreshold: currentConfig.imageProcessing.memoryThreshold,
      source: 'system-settings'
    })
  }
  
  return currentConfig
}

/**
 * 强制刷新配置
 */
function refreshConfig() {
  currentConfig = null
  lastConfigUpdate = 0
  return getCurrentConfig()
}

/**
 * 获取特定配置项
 */
function getConfigItem(key) {
  const config = getCurrentConfig()
  const keys = key.split('.')
  let value = config
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      return undefined
    }
  }
  
  return value
}

/**
 * 监听配置文件变化
 */
function watchConfigChanges(callback) {
  try {
    const settingsPath = getSettingsPath()
    const settingsDir = path.dirname(settingsPath)
    
    if (fs.existsSync(settingsDir)) {
      fs.watch(settingsPath, (eventType, filename) => {
        if (eventType === 'change' && filename) {
          console.log('📝 检测到配置文件变化，刷新配置...')
          refreshConfig()
          if (callback) callback(getCurrentConfig())
        }
      })
      console.log('👀 开始监听配置文件变化:', settingsPath)
    }
  } catch (error) {
    console.warn('⚠️ 无法监听配置文件变化:', error.message)
  }
}

module.exports = {
  getCurrentConfig,
  refreshConfig,
  getConfigItem,
  watchConfigChanges,
  defaultConfig
}
