/**
 * 设置管理工具模块
 * 
 * 管理系统设置的读取、保存和验证
 * 
 * @author IWMS Team
 * @version 1.0.0
 */

const fs = require('fs-extra')
const path = require('path')
const os = require('os')

// 获取设置文件路径
function getSettingsPath() {
  const platform = os.platform()
  let settingsDir
  
  if (platform === 'win32') {
    // Windows
    settingsDir = path.join(process.env.APPDATA, 'IWMS')
  } else if (platform === 'darwin') {
    // macOS
    settingsDir = path.join(os.homedir(), 'Library', 'Application Support', 'IWMS')
  } else {
    // Linux
    settingsDir = path.join(os.homedir(), '.config', 'iwms')
  }
  
  return path.join(settingsDir, 'settings.json')
}

// 默认设置
const defaultSettings = {
  defaultOutputPath: '',
  defaultCompressionMode: 'dimension',
  defaultMaxDimension: 1920,
  defaultMaxFileSize: 500,
  defaultFileTypes: 'image',
  defaultRecursive: true,
  defaultConflictStrategy: 'skip',
  maxThreads: 4,
  useMultiThread: true,
  sidebarCollapsed: false,
  autoSaveSettings: true
}

/**
 * 加载设置
 */
async function loadSettings() {
  try {
    const settingsPath = getSettingsPath()
    
    if (await fs.pathExists(settingsPath)) {
      const settings = await fs.readJson(settingsPath)
      // 合并默认设置和保存的设置
      return { ...defaultSettings, ...settings }
    }
  } catch (error) {
    console.warn('加载设置失败:', error.message)
  }
  
  return { ...defaultSettings }
}

/**
 * 保存设置
 */
async function saveSettings(settings) {
  try {
    const settingsPath = getSettingsPath()
    const settingsDir = path.dirname(settingsPath)
    
    // 确保目录存在
    await fs.ensureDir(settingsDir)
    
    // 验证设置
    const validatedSettings = validateSettings(settings)
    
    // 保存设置
    await fs.writeJson(settingsPath, validatedSettings, { spaces: 2 })
    
    console.log('✅ 设置保存成功:', settingsPath)
    return true
  } catch (error) {
    console.error('❌ 保存设置失败:', error.message)
    throw error
  }
}

/**
 * 验证设置
 */
function validateSettings(settings) {
  const validated = { ...settings }
  
  // 验证线程数
  if (typeof validated.maxThreads === 'number') {
    validated.maxThreads = Math.max(1, Math.min(16, validated.maxThreads))
  } else {
    validated.maxThreads = 4
  }
  
  // 验证压缩参数
  if (typeof validated.defaultMaxDimension === 'number') {
    validated.defaultMaxDimension = Math.max(0, Math.min(10000, validated.defaultMaxDimension))
  } else {
    validated.defaultMaxDimension = 1920
  }
  
  if (typeof validated.defaultMaxFileSize === 'number') {
    validated.defaultMaxFileSize = Math.max(0, Math.min(10000, validated.defaultMaxFileSize))
  } else {
    validated.defaultMaxFileSize = 500
  }
  
  // 验证布尔值
  validated.useMultiThread = Boolean(validated.useMultiThread)
  validated.defaultRecursive = Boolean(validated.defaultRecursive)
  validated.sidebarCollapsed = Boolean(validated.sidebarCollapsed)
  validated.autoSaveSettings = Boolean(validated.autoSaveSettings)
  
  // 验证字符串值
  const validCompressionModes = ['dimension', 'filesize']
  if (!validCompressionModes.includes(validated.defaultCompressionMode)) {
    validated.defaultCompressionMode = 'dimension'
  }
  
  const validFileTypes = ['image', 'all']
  if (!validFileTypes.includes(validated.defaultFileTypes)) {
    validated.defaultFileTypes = 'image'
  }
  
  const validConflictStrategies = ['skip', 'overwrite', 'append']
  if (!validConflictStrategies.includes(validated.defaultConflictStrategy)) {
    validated.defaultConflictStrategy = 'skip'
  }
  
  return validated
}

/**
 * 重置设置为默认值
 */
async function resetSettings() {
  try {
    const settingsPath = getSettingsPath()
    
    if (await fs.pathExists(settingsPath)) {
      await fs.remove(settingsPath)
      console.log('✅ 设置已重置为默认值')
    }
    
    return { ...defaultSettings }
  } catch (error) {
    console.error('❌ 重置设置失败:', error.message)
    throw error
  }
}

/**
 * 导出设置
 */
async function exportSettings(settings, exportPath) {
  try {
    const validatedSettings = validateSettings(settings)
    await fs.writeJson(exportPath, validatedSettings, { spaces: 2 })
    console.log('✅ 设置导出成功:', exportPath)
    return true
  } catch (error) {
    console.error('❌ 导出设置失败:', error.message)
    throw error
  }
}

/**
 * 导入设置
 */
async function importSettings(importPath) {
  try {
    const importedSettings = await fs.readJson(importPath)
    const validatedSettings = validateSettings(importedSettings)
    
    // 保存导入的设置
    await saveSettings(validatedSettings)
    
    console.log('✅ 设置导入成功')
    return validatedSettings
  } catch (error) {
    console.error('❌ 导入设置失败:', error.message)
    throw error
  }
}

/**
 * 获取设置信息
 */
function getSettingsInfo() {
  return {
    settingsPath: getSettingsPath(),
    defaultSettings,
    platform: os.platform(),
    homeDir: os.homedir()
  }
}

module.exports = {
  loadSettings,
  saveSettings,
  resetSettings,
  exportSettings,
  importSettings,
  getSettingsInfo,
  validateSettings,
  defaultSettings
}
