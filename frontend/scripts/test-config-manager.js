/**
 * 配置管理器测试脚本
 * 
 * 测试配置管理器是否正确读取系统设置
 * 
 * @author IWMS Team
 * @version 1.0.0
 */

console.log('🧪 IWMS 配置管理器测试')
console.log('==========================')

// 测试配置管理器
console.log('📁 配置管理器测试:')
try {
  const configManager = require('../electron/utils/configManager')
  console.log('✅ 配置管理器加载成功')
  
  // 获取当前配置
  const config = configManager.getCurrentConfig()
  console.log('配置内容:', JSON.stringify(config, null, 2))
  
  // 测试特定配置项
  console.log('\n🔍 特定配置项测试:')
  console.log('maxThreads:', configManager.getConfigItem('imageProcessing.maxThreads'))
  console.log('batchSize:', configManager.getConfigItem('imageProcessing.batchSize'))
  console.log('enableMultiThread:', configManager.getConfigItem('imageProcessing.enableMultiThread'))
  
  // 测试配置刷新
  console.log('\n🔄 配置刷新测试:')
  const refreshedConfig = configManager.refreshConfig()
  console.log('刷新后配置:', JSON.stringify(refreshedConfig, null, 2))
  
} catch (error) {
  console.log('❌ 配置管理器加载失败:', error.message)
}

// 测试图片压缩器配置
console.log('\n🖼️  图片压缩器配置测试:')
try {
  const imageCompressor = require('../electron/utils/imageCompressor')
  console.log('✅ 图片压缩器加载成功')
} catch (error) {
  console.log('❌ 图片压缩器加载失败:', error.message)
}

// 测试重命名服务配置
console.log('\n🔄 重命名服务配置测试:')
try {
  const renameService = require('../electron/services/renameService')
  console.log('✅ 重命名服务加载成功')
} catch (error) {
  console.log('❌ 重命名服务加载失败:', error.message)
}

console.log('\n==========================')
console.log('测试完成')
