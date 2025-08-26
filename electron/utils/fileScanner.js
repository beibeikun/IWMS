/**
 * 文件扫描工具模块
 * 
 * 支持递归扫描目录
 * 支持文件类型过滤
 * 支持文件大小过滤
 * 
 * @author IWMS Team
 * @version 1.0.0
 */

const fs = require('fs-extra')
const path = require('path')

/**
 * 扫描指定目录中的文件
 * 
 * @param {string} inputPath - 输入目录路径
 * @param {boolean} recursive - 是否递归扫描子目录
 * @param {string} fileTypes - 文件类型过滤（'image', 'all'）
 * @returns {Array} 符合条件的文件路径数组
 */
async function scanDirectory(inputPath, recursive = false, fileTypes = 'image') {
  try {
    const files = []
    
    if (recursive) {
      await scanDirectoryRecursive(inputPath, files, fileTypes)
    } else {
      await scanDirectoryNonRecursive(inputPath, files, fileTypes)
    }
    
    return files
  } catch (error) {
    throw new Error(`扫描目录失败: ${error.message}`)
  }
}

/**
 * 递归扫描目录
 */
async function scanDirectoryRecursive(dirPath, files, fileTypes) {
  const items = await fs.readdir(dirPath)
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item)
    const stat = await fs.stat(fullPath)
    
    if (stat.isDirectory()) {
      await scanDirectoryRecursive(fullPath, files, fileTypes)
    } else if (stat.isFile()) {
      if (shouldIncludeFile(fullPath, fileTypes)) {
        files.push(fullPath)
      }
    }
  }
}

/**
 * 非递归扫描目录
 */
async function scanDirectoryNonRecursive(dirPath, files, fileTypes) {
  const items = await fs.readdir(dirPath)
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item)
    const stat = await fs.stat(fullPath)
    
    if (stat.isFile()) {
      if (shouldIncludeFile(fullPath, fileTypes)) {
        files.push(fullPath)
      }
    }
  }
}

/**
 * 判断文件是否应该被包含
 */
function shouldIncludeFile(filePath, fileTypes) {
  if (fileTypes === 'all') {
    return true
  }
  
  if (fileTypes === 'image') {
    return isImageFile(filePath)
  }
  
  return false
}

/**
 * 判断是否为图片文件
 */
function isImageFile(filePath) {
  const imageExtensions = [
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', 
    '.tiff', '.webp', '.svg', '.ico', '.tga'
  ]
  
  const ext = path.extname(filePath).toLowerCase()
  return imageExtensions.includes(ext)
}

/**
 * 获取文件统计信息
 */
async function getFileStats(files) {
  const stats = {
    totalFiles: files.length,
    totalSize: 0,
    fileTypes: {},
    averageSize: 0
  }
  
  for (const filePath of files) {
    try {
      const stat = await fs.stat(filePath)
      const ext = path.extname(filePath).toLowerCase()
      
      stats.totalSize += stat.size
      
      if (stats.fileTypes[ext]) {
        stats.fileTypes[ext].count++
        stats.fileTypes[ext].size += stat.size
      } else {
        stats.fileTypes[ext] = {
          count: 1,
          size: stat.size
        }
      }
    } catch (error) {
      console.warn(`获取文件统计失败: ${filePath}`, error.message)
    }
  }
  
  if (stats.totalFiles > 0) {
    stats.averageSize = Math.round(stats.totalSize / stats.totalFiles)
  }
  
  return stats
}

/**
 * 过滤文件（按大小、类型等）
 */
function filterFiles(files, options = {}) {
  let filteredFiles = [...files]
  
  // 按文件大小过滤
  if (options.maxFileSize && options.maxFileSize > 0) {
    filteredFiles = filteredFiles.filter(filePath => {
      try {
        const stat = fs.statSync(filePath)
        return stat.size <= options.maxFileSize * 1024 // 转换为字节
      } catch (error) {
        return false
      }
    })
  }
  
  // 按文件类型过滤
  if (options.fileTypes && options.fileTypes !== 'all') {
    filteredFiles = filteredFiles.filter(filePath => {
      return shouldIncludeFile(filePath, options.fileTypes)
    })
  }
  
  return filteredFiles
}

module.exports = {
  scanDirectory,
  getFileStats,
  filterFiles,
  isImageFile,
  shouldIncludeFile
}
