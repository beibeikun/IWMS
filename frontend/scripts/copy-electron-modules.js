/**
 * 复制Electron模块文件到构建目录
 */

const fs = require('fs-extra')
const path = require('path')

async function copyElectronModules() {
  try {
    const sourceDir = path.join(__dirname, '../electron')
    const targetDir = path.join(__dirname, '../dist-electron')
    
    // 确保目标目录存在
    await fs.ensureDir(targetDir)
    
    // 复制utils目录
    await fs.copy(
      path.join(sourceDir, 'utils'),
      path.join(targetDir, 'utils')
    )
    
    // 复制services目录
    await fs.copy(
      path.join(sourceDir, 'services'),
      path.join(targetDir, 'services')
    )
    
    // 复制config目录（如果存在）
    const configSourcePath = path.join(sourceDir, 'config')
    const configTargetPath = path.join(targetDir, 'config')
    
    if (await fs.pathExists(configSourcePath)) {
      await fs.copy(configSourcePath, configTargetPath)
    } else {
      console.log('ℹ️  config目录不存在，跳过复制')
    }
    
    console.log('✅ Electron模块文件复制完成')
  } catch (error) {
    console.error('❌ 复制失败:', error.message)
  }
}

copyElectronModules()
