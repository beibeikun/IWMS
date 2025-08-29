/**
 * 配置测试脚本
 * 
 * 测试环境变量和配置是否正确设置
 * 
 * @author IWMS Team
 * @version 1.0.0
 */

console.log('🧪 IWMS 配置测试')
console.log('==================')

// 测试环境变量
console.log('📋 环境变量检查:')
console.log('IWMS_MAX_THREADS:', process.env.IWMS_MAX_THREADS || '未设置 (默认: 4)')
console.log('IWMS_BATCH_SIZE:', process.env.IWMS_BATCH_SIZE || '未设置 (默认: 10)')
console.log('IWMS_MULTI_THREAD:', process.env.IWMS_MULTI_THREAD || '未设置 (默认: true)')
console.log('IWMS_MEMORY_THRESHOLD:', process.env.IWMS_MEMORY_THRESHOLD || '未设置 (默认: 80)')
console.log('NODE_OPTIONS:', process.env.NODE_OPTIONS || '未设置')

// 测试配置文件加载
console.log('\n📁 配置文件测试:')
try {
  const config = require('../electron/utils/config')
  console.log('✅ 配置文件加载成功')
  console.log('配置内容:', JSON.stringify(config, null, 2))
} catch (error) {
  console.log('❌ 配置文件加载失败:', error.message)
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

console.log('\n==================')
console.log('测试完成')
