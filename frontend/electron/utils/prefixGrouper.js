/**
 * 按前缀分文件夹工具模块
 * 
 * 实现文件名前缀解析、目录创建和文件移动功能
 * 支持多种配置选项和冲突处理策略
 * 
 * @author IWMS Team
 * @version 1.0.0
 */

const fs = require('fs-extra')
const path = require('path')
const crypto = require('crypto')

/**
 * 支持的图片扩展名（不区分大小写）
 */
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.heic', '.tif', '.tiff', '.gif']

/**
 * 前缀解析正则表达式
 * 匹配模式：^(?P<prefix>.+?)(?:\s*\(\d+\))?$
 */
const PREFIX_REGEX = /^(.+?)(?:\s*\(\d+\))?$/

/**
 * 编号后缀正则表达式
 * 匹配模式：\s*\(\d+\)$
 */
const INDEX_SUFFIX_REGEX = /\s*\(\d+\)$/

/**
 * 非法路径字符映射
 */
const ILLEGAL_CHARS_MAP = {
  '/': '_',
  '\\': '_',
  ':': '_',
  '*': '_',
  '?': '_',
  '"': '_',
  '<': '_',
  '>': '_',
  '|': '_'
}

/**
 * 从文件名中提取前缀
 * 
 * @param {string} fileName - 文件名（不含扩展名）
 * @returns {string} 提取的前缀
 */
function extractPrefix(fileName) {
  const match = fileName.match(PREFIX_REGEX)
  if (!match) {
    return fileName // 如果正则不匹配，返回原文件名
  }
  
  return match[1].trim()
}

/**
 * 检查文件名是否包含编号后缀
 * 
 * @param {string} fileName - 文件名（不含扩展名）
 * @returns {boolean} 是否包含编号后缀
 */
function hasIndexSuffix(fileName) {
  return INDEX_SUFFIX_REGEX.test(fileName)
}

/**
 * 清洗目录名，替换非法字符
 * 
 * @param {string} folderName - 原始目录名
 * @param {number} maxLength - 最大长度限制
 * @returns {string} 清洗后的目录名
 */
function sanitizeFolderName(folderName, maxLength = 100) {
  if (!folderName || folderName.trim() === '') {
    return '__UNCLASSIFIED__'
  }
  
  let sanitized = folderName.trim()
  
  // 替换非法字符
  for (const [illegal, replacement] of Object.entries(ILLEGAL_CHARS_MAP)) {
    sanitized = sanitized.replace(new RegExp('\\' + illegal, 'g'), replacement)
  }
  
  // 合并连续空白为单空格
  sanitized = sanitized.replace(/\s+/g, ' ')
  
  // 长度限制
  if (sanitized.length > maxLength) {
    const hash = crypto.createHash('md5').update(sanitized).digest('hex').substring(0, 8)
    sanitized = sanitized.substring(0, maxLength - 8) + '_' + hash
  }
  
  return sanitized || '__UNCLASSIFIED__'
}

/**
 * 解析文件路径，获取相对路径信息
 * 
 * @param {string} filePath - 文件完整路径
 * @param {string} rootPath - 根目录路径
 * @param {boolean} recursive - 是否递归模式
 * @returns {Object|null} 解析结果或null
 */
function parseFilePath(filePath, rootPath, recursive = false) {
  try {
    const relativePath = path.relative(rootPath, filePath)
    const pathParts = relativePath.split(path.sep)
    
    // 检查是否为根目录第一层文件
    if (!recursive && pathParts.length > 1) {
      return null // 非递归模式下跳过子目录文件
    }
    
    return {
      relativePath,
      pathParts,
      isDirectChild: pathParts.length === 1,
      fileName: path.basename(filePath),
      dirName: path.dirname(filePath)
    }
  } catch (error) {
    console.error('解析文件路径失败:', error.message)
    return null
  }
}

/**
 * 生成目标路径，处理冲突
 * 
 * @param {string} targetPath - 目标路径
 * @param {string} conflictPolicy - 冲突处理策略
 * @returns {string} 最终目标路径
 */
async function resolveConflict(targetPath, conflictPolicy) {
  if (!await fs.pathExists(targetPath)) {
    return targetPath
  }
  
  switch (conflictPolicy) {
    case 'overwrite':
      return targetPath
      
    case 'rename':
      return generateUniquePath(targetPath)
      
    case 'keep':
    default:
      throw new Error('目标文件已存在')
  }
}

/**
 * 生成唯一的文件路径
 * 
 * @param {string} originalPath - 原始路径
 * @returns {string} 唯一路径
 */
function generateUniquePath(originalPath) {
  const ext = path.extname(originalPath)
  const base = path.basename(originalPath, ext)
  const dir = path.dirname(originalPath)
  
  let counter = 1
  let newPath = originalPath
  
  while (fs.existsSync(newPath)) {
    newPath = path.join(dir, `${base} (${counter})${ext}`)
    counter++
  }
  
  return newPath
}

/**
 * 按前缀分组文件
 * 
 * @param {Array} files - 文件列表
 * @param {string} rootPath - 根目录路径
 * @param {Object} options - 配置选项
 * @returns {Map} 分组结果，key为前缀，value为文件数组
 */
function groupFilesByPrefix(files, rootPath, options) {
  const groups = new Map()
  
  for (const file of files) {
    try {
      // 解析文件路径
      const pathInfo = parseFilePath(file.path, rootPath, options.recursive)
      if (!pathInfo) continue
      
      // 检查文件扩展名
      const ext = path.extname(file.name).toLowerCase()
      if (!options.allowedExtensions.includes(ext)) {
        continue // 跳过不支持的文件类型
      }
      
      // 提取前缀
      const baseName = path.basename(file.name, ext)
      let prefix = extractPrefix(baseName)
      
      // 大小写处理
      if (!options.caseSensitivePrefix) {
        prefix = prefix.toLowerCase()
      }
      
      // 清洗目录名
      let folderName = prefix
      if (options.sanitizeFolderName) {
        folderName = sanitizeFolderName(prefix, options.maxFolderNameLength)
      }
      
      // 分组
      if (!groups.has(folderName)) {
        groups.set(folderName, [])
      }
      
      groups.get(folderName).push({
        ...file,
        prefix,
        folderName,
        pathInfo
      })
      
    } catch (error) {
      console.error(`处理文件失败 ${file.name}:`, error.message)
    }
  }
  
  return groups
}

/**
 * 执行按前缀分文件夹操作
 * 
 * @param {Array} files - 文件列表
 * @param {string} rootPath - 根目录路径
 * @param {Object} options - 配置选项
 * @returns {Object} 执行结果
 */
async function executePrefixGrouping(files, rootPath, options) {
  const results = {
    success: [],
    failed: [],
    skipped: [],
    createdFolders: new Set(),
    moveLog: []
  }
  
  try {
    // 1. 按前缀分组文件
    const groups = groupFilesByPrefix(files, rootPath, options)
    
    // 2. 处理每个分组
    for (const [folderName, groupFiles] of groups) {
      try {
        // 创建目标目录
        const targetDir = path.join(rootPath, folderName)
        if (!results.createdFolders.has(targetDir)) {
          await fs.ensureDir(targetDir)
          results.createdFolders.add(targetDir)
        }
        
        // 移动组内文件
        for (const file of groupFiles) {
          try {
            const sourcePath = file.path
            const targetPath = path.join(targetDir, file.name)
            
            // 检查是否已在目标位置
            if (path.dirname(sourcePath) === targetDir) {
              results.skipped.push({
                file,
                reason: 'already_in_target_folder',
                sourcePath,
                targetPath
              })
              continue
            }
            
            // 处理冲突
            let finalTargetPath = targetPath
            try {
              finalTargetPath = await resolveConflict(targetPath, options.conflictPolicy)
            } catch (error) {
              if (options.conflictPolicy === 'keep') {
                results.skipped.push({
                  file,
                  reason: 'target_exists',
                  sourcePath,
                  targetPath,
                  error: error.message
                })
                continue
              }
            }
            
            // 移动文件
            await fs.move(sourcePath, finalTargetPath)
            
            // 记录成功
            const moveRecord = {
              sourcePath,
              destPath: finalTargetPath,
              status: 'moved',
              timestamp: new Date().toISOString(),
              error: null
            }
            
            results.success.push({
              file,
              sourcePath,
              targetPath: finalTargetPath,
              folderName
            })
            
            results.moveLog.push(moveRecord)
            
          } catch (error) {
            // 记录失败
            const moveRecord = {
              sourcePath: file.path,
              destPath: '',
              status: 'failed',
              timestamp: new Date().toISOString(),
              error: error.message
            }
            
            results.failed.push({
              file,
              error: error.message,
              folderName
            })
            
            results.moveLog.push(moveRecord)
          }
        }
        
      } catch (error) {
        console.error(`处理分组 ${folderName} 失败:`, error.message)
      }
    }
    
    // 3. 生成移动日志CSV
    if (options.logMoveCsv) {
      await generateMoveLogCSV(results.moveLog, rootPath)
    }
    
  } catch (error) {
    console.error('按前缀分文件夹执行失败:', error.message)
    throw error
  }
  
  return results
}

/**
 * 生成移动日志CSV文件
 * 
 * @param {Array} moveLog - 移动日志
 * @param {string} rootPath - 根目录路径
 */
async function generateMoveLogCSV(moveLog, rootPath) {
  try {
    const csvPath = path.join(rootPath, 'move_log.csv')
    const csvContent = [
      'source_path,dest_path,status,timestamp,error',
      ...moveLog.map(record => [
        record.sourcePath,
        record.destPath,
        record.status,
        record.timestamp,
        record.error || ''
      ].join(','))
    ].join('\n')
    
    await fs.writeFile(csvPath, csvContent, 'utf8')
    console.log(`移动日志已保存到: ${csvPath}`)
  } catch (error) {
    console.error('生成移动日志CSV失败:', error.message)
  }
}

/**
 * 预览按前缀分文件夹计划
 * 
 * @param {Array} files - 文件列表
 * @param {string} rootPath - 根目录路径
 * @param {Object} options - 配置选项
 * @returns {Object} 预览结果
 */
function previewPrefixGrouping(files, rootPath, options) {
  try {
    // 按前缀分组文件
    const groups = groupFilesByPrefix(files, rootPath, options)
    
    // 生成预览计划
    const previewPlan = []
    let totalFiles = 0
    let willMove = 0
    
    for (const [folderName, groupFiles] of groups) {
      const groupPlan = {
        folderName,
        prefix: groupFiles[0]?.prefix || '',
        files: [],
        targetDir: path.join(rootPath, folderName)
      }
      
      for (const file of groupFiles) {
        const sourcePath = file.path
        const targetPath = path.join(groupPlan.targetDir, file.name)
        
        const willMoveFile = path.dirname(sourcePath) !== groupPlan.targetDir
        if (willMoveFile) {
          willMove++
        }
        
        groupPlan.files.push({
          name: file.name,
          sourcePath,
          targetPath,
          willMove: willMoveFile
        })
        
        totalFiles++
      }
      
      previewPlan.push(groupPlan)
    }
    
    return {
      success: true,
      previewPlan,
      stats: {
        totalFiles,
        willMove,
        groups: groups.size,
        folders: Array.from(groups.keys())
      }
    }
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stats: {
        totalFiles: files.length,
        willMove: 0,
        groups: 0,
        folders: []
      }
    }
  }
}

module.exports = {
  extractPrefix,
  hasIndexSuffix,
  sanitizeFolderName,
  parseFilePath,
  resolveConflict,
  generateUniquePath,
  groupFilesByPrefix,
  executePrefixGrouping,
  previewPrefixGrouping,
  SUPPORTED_EXTENSIONS,
  PREFIX_REGEX,
  INDEX_SUFFIX_REGEX
}
