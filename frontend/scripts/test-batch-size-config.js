#!/usr/bin/env node

/**
 * 测试批次大小配置
 * 验证新添加的批次大小设置是否能够正确保存和加载
 */

const path = require('path')
const fs = require('fs-extra')

// 模拟Electron环境
process.type = 'browser'
process.resourcesPath = path.join(__dirname, '..')

// 添加Electron模拟
global.process = process
global.require = require

console.log('🧪 测试批次大小配置...')

try {
  // 测试配置管理器
  console.log('\n📁 测试配置管理器...')
  const configManager = require('../electron/utils/configManager')
  
  const config = configManager.getCurrentConfig()
  console.log('🔧 配置管理器读取结果:')
  console.log('最大线程数:', config.imageProcessing.maxThreads)
  console.log('批次大小:', config.imageProcessing.batchSize)
  console.log('启用多线程:', config.imageProcessing.enableMultiThread)
  
  // 测试设置管理器
  console.log('\n📁 测试设置管理器...')
  const settingsManager = require('../electron/utils/settingsManager')
  
  const settingsInfo = settingsManager.getSettingsInfo()
  console.log('设置文件路径:', settingsInfo.settingsPath)
  console.log('默认设置:', settingsInfo.defaultSettings)
  
  // 检查设置文件是否存在
  if (fs.existsSync(settingsInfo.settingsPath)) {
    console.log('✅ 设置文件存在')
    const settings = fs.readJsonSync(settingsInfo.settingsPath)
    console.log('当前设置文件内容:')
    console.log(JSON.stringify(settings, null, 2))
    
    // 验证批次大小设置
    if (settings.batchSize !== undefined) {
      console.log(`✅ 批次大小设置存在: ${settings.batchSize}`)
    } else {
      console.log('❌ 批次大小设置缺失')
    }
    
    if (settings.maxThreads !== undefined) {
      console.log(`✅ 最大线程数设置存在: ${settings.maxThreads}`)
    } else {
      console.log('❌ 最大线程数设置缺失')
    }
  } else {
    console.log('❌ 设置文件不存在')
  }
  
  // 测试设置验证
  console.log('\n🔍 测试设置验证...')
  const testSettings = {
    maxThreads: 6,
    batchSize: 15,
    useMultiThread: true
  }
  
  const validatedSettings = settingsManager.validateSettings(testSettings)
  console.log('验证后的设置:', validatedSettings)
  
  console.log('\n✅ 测试完成')
  
} catch (error) {
  console.error('❌ 测试失败:', error.message)
  console.error(error.stack)
}
