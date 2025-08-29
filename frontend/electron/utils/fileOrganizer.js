/**
 * 文件整理工具模块
 * 
 * 实现文件名解析、分组处理和重命名功能
 * 支持图片文件的规范化排序和重命名
 * 
 * @author IWMS Team
 * @version 1.0.0
 */

const fs = require('fs-extra')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

/**
 * 文件名解析正则表达式
 * 匹配模式：^(?P<base>.+?)\s?(?:\((?P<idx>\d+)\))?\.(?P<ext>jpg|jpeg|png|tif|tiff|webp)$
 */
const FILE_NAME_REGEX = /^(.+?)\s?(?:\((\d+)\))?\.(jpg|jpeg|png|tif|tiff|webp)$/i

/**
 * 支持的图片扩展名（不区分大小写）
 */
const SUPPORTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'tif', 'tiff', 'webp']

/**
 * 解析文件名
 * 
 * @param {string} fileName - 文件名
 * @returns {Object|null} 解析结果或null（不匹配）
 */
function parseFileName(fileName) {
  const match = fileName.match(FILE_NAME_REGEX)
  if (!match) {
    return null
  }
  
  const [, base, idx, ext] = match
  return {
    base: base.trim(),
    idx: idx ? parseInt(idx, 10) : null,
    ext: ext.toLowerCase(),
    isMain: !idx, // 主图：无序号
    isSub: !!idx  // 从图：有序号
  }
}

/**
 * 按base分组文件
 * 
 * @param {Array} files - 文件列表
 * @returns {Map} 分组结果，key为base，value为文件数组
 */
function groupFilesByBase(files) {
  const groups = new Map()
  
  for (const file of files) {
    const parsed = parseFileName(file.name)
    if (!parsed) {
      continue // 跳过不匹配的文件
    }
    
    if (!groups.has(parsed.base)) {
      groups.set(parsed.base, [])
    }
    groups.get(parsed.base).push({
      ...file,
      parsed
    })
  }
  
  return groups
}

/**
 * 对组内文件进行排序
 * 
 * @param {Array} groupFiles - 组内文件
 * @returns {Array} 排序后的文件
 */
function sortGroupFiles(groupFiles) {
  return groupFiles.sort((a, b) => {
    // 主图在前
    if (a.parsed.isMain && !b.parsed.isMain) return -1
    if (!a.parsed.isMain && b.parsed.isMain) return 1
    
    // 从图按序号排序
    if (a.parsed.isSub && b.parsed.isSub) {
      return a.parsed.idx - b.parsed.idx
    }
    
    return 0
  })
}

/**
 * 生成重命名计划
 * 
 * @param {Map} groups - 文件分组
 * @param {boolean} primaryNoIndex - 主图无序号模式
 * @returns {Array} 重命名计划
 */
function generateRenamePlan(groups, primaryNoIndex = true) {
  const renamePlan = []
  
  for (const [base, groupFiles] of groups) {
    const sortedFiles = sortGroupFiles(groupFiles)
    const mainFile = sortedFiles.find(f => f.parsed.isMain)
    const subFiles = sortedFiles.filter(f => f.parsed.isSub)
    
    if (primaryNoIndex) {
      // 模式A：主图无序号
      generateRenamePlanModeA(base, mainFile, subFiles, renamePlan)
    } else {
      // 模式B：主图也编号
      generateRenamePlanModeB(base, sortedFiles, renamePlan)
    }
  }
  
  return renamePlan
}

/**
 * 生成模式A的重命名计划（主图无序号）
 * 
 * @param {string} base - 文件base名
 * @param {Object} mainFile - 主图文件
 * @param {Array} subFiles - 从图文件
 * @param {Array} renamePlan - 重命名计划
 */
function generateRenamePlanModeA(base, mainFile, subFiles, renamePlan) {
  // 模式A：主图无序号（primaryNoIndex = true）
  
  if (mainFile) {
    // 1. 若组内已有主图：保留主图文件名为 base.ext 不变
    const targetName = `${base}.${mainFile.parsed.ext}`
    renamePlan.push({
      file: mainFile,
      oldName: mainFile.name,
      newName: targetName,
      reason: mainFile.name !== targetName ? '主图标准化' : '主图保持不变'
    })
    
    // 2. 组内其余从图按原序号升序压缩为连续(1..k)
    for (let i = 0; i < subFiles.length; i++) {
      const file = subFiles[i]
      const newIdx = i + 1
      const targetName = `${base} (${newIdx}).${file.parsed.ext}`
      renamePlan.push({
        file: file,
        oldName: file.name,
        newName: targetName,
        reason: file.name !== targetName ? `从图重新编号: ${file.parsed.idx} → ${newIdx}` : '从图保持不变'
      })
    }
  } else if (subFiles.length > 0) {
    // 3. 若组内无主图：将最小序号的从图提升为主图，重命名为 base.ext
    const minSubFile = subFiles[0]
    const targetName = `${base}.${minSubFile.parsed.ext}`
    renamePlan.push({
      file: minSubFile,
      oldName: minSubFile.name,
      newName: targetName,
      reason: '从图提升为主图'
    })
    
    // 4. 组内其余从图按原序号升序压缩为连续(1..k)
    const remainingSubFiles = subFiles.slice(1)
    for (let i = 0; i < remainingSubFiles.length; i++) {
      const file = remainingSubFiles[i]
      const newIdx = i + 1
      const targetName = `${base} (${newIdx}).${file.parsed.ext}`
      renamePlan.push({
        file: file,
        oldName: file.name,
        newName: targetName,
        reason: `从图重新编号: ${file.parsed.idx} → ${newIdx}`
      })
    }
  }
}

/**
 * 生成模式B的重命名计划（主图也编号）
 * 
 * @param {string} base - 文件base名
 * @param {Array} sortedFiles - 排序后的文件
 * @param {Array} renamePlan - 重命名计划
 */
function generateRenamePlanModeB(base, sortedFiles, renamePlan) {
  // 模式B：主图也编号（primaryNoIndex = false）
  // 组内将所有文件统一重排为连续序列 (1..k)
  
  for (let i = 0; i < sortedFiles.length; i++) {
    const file = sortedFiles[i]
    const newIdx = i + 1
    const targetName = `${base} (${newIdx}).${file.parsed.ext}`
    
    let reason
    if (file.parsed.isMain) {
      // 若存在主图 base.ext，按顺序将其视为第一张 → base (1).ext
      reason = file.name !== targetName ? `主图编号: ${file.parsed.idx || '无'} → ${newIdx}` : '主图保持不变'
    } else {
      // 其余从图按原序号升序依次编号为 (2..k)
      reason = file.name !== targetName ? `从图重新编号: ${file.parsed.idx} → ${newIdx}` : '从图保持不变'
    }
    
    renamePlan.push({
      file: file,
      oldName: file.name,
      newName: targetName,
      reason: reason
    })
  }
}

/**
 * 执行重命名操作
 * 
 * @param {Array} renamePlan - 重命名计划
 * @param {string} folderPath - 文件夹路径
 * @returns {Object} 执行结果
 */
async function executeRenamePlan(renamePlan, folderPath) {
  const results = {
    success: [],
    failed: [],
    skipped: []
  }
  
  if (renamePlan.length === 0) {
    return results
  }
  
  // 两阶段重命名：先重命名为临时名称，再重命名为目标名称
  const tempSuffix = `.__tmp__${uuidv4().replace(/-/g, '')}`
  
  try {
    // 第一阶段：重命名为临时名称
    for (const plan of renamePlan) {
      try {
        const oldPath = path.join(folderPath, plan.oldName)
        const tempName = plan.oldName + tempSuffix
        const tempPath = path.join(folderPath, tempName)
        
        await fs.move(oldPath, tempPath)
        plan.tempName = tempName
        plan.tempPath = tempPath
      } catch (error) {
        results.failed.push({
          ...plan,
          error: error.message
        })
      }
    }
    
    // 第二阶段：重命名为目标名称
    for (const plan of renamePlan) {
      if (plan.tempPath) {
        try {
          const newPath = path.join(folderPath, plan.newName)
          await fs.move(plan.tempPath, newPath)
          
          results.success.push({
            ...plan,
            oldPath: path.join(folderPath, plan.oldName),
            newPath: newPath
          })
        } catch (error) {
          // 如果第二阶段失败，尝试恢复原名称
          try {
            await fs.move(plan.tempPath, path.join(folderPath, plan.oldName))
          } catch (restoreError) {
            console.error('恢复文件失败:', restoreError.message)
          }
          
          results.failed.push({
            ...plan,
            error: error.message
          })
        }
      }
    }
    
  } catch (error) {
    console.error('重命名执行失败:', error.message)
    throw error
  }
  
  return results
}

/**
 * 整理排序文件
 * 
 * @param {Array} files - 文件列表
 * @param {string} folderPath - 文件夹路径
 * @param {boolean} primaryNoIndex - 主图无序号模式
 * @returns {Object} 整理结果
 */
async function organizeFiles(files, folderPath, primaryNoIndex = true) {
  try {
    // 1. 解析和分组文件
    const groups = groupFilesByBase(files)
    
    // 2. 生成重命名计划
    const renamePlan = generateRenamePlan(groups, primaryNoIndex)
    
    // 3. 执行重命名
    const results = await executeRenamePlan(renamePlan, folderPath)
    
    // 4. 统计信息
    const stats = {
      totalFiles: files.length,
      processedFiles: groups.size,
      renamedFiles: results.success.length,
      failedFiles: results.failed.length,
      skippedFiles: results.skipped.length,
      groups: Array.from(groups.keys()).sort((a, b) => {
        // 自然排序：数值感知排序
        return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
      })
    }
    
    return {
      success: true,
      stats,
      results,
      renamePlan
    }
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stats: {
        totalFiles: files.length,
        processedFiles: 0,
        renamedFiles: 0,
        failedFiles: 0,
        skippedFiles: 0
      }
    }
  }
}

/**
 * 预览重命名计划
 * 
 * @param {Array} files - 文件列表
 * @param {boolean} primaryNoIndex - 主图无序号模式
 * @returns {Object} 预览结果
 */
function previewRenamePlan(files, primaryNoIndex = true) {
  try {
    // 1. 解析和分组文件
    const groups = groupFilesByBase(files)
    
    // 2. 生成重命名计划
    const renamePlan = generateRenamePlan(groups, primaryNoIndex)
    
    // 3. 添加不匹配的文件（保持原名称）
    const processedFiles = new Set()
    for (const plan of renamePlan) {
      processedFiles.add(plan.file.name)
    }
    
    for (const file of files) {
      if (!processedFiles.has(file.name)) {
        renamePlan.push({
          file: file,
          oldName: file.name,
          newName: file.name,
          reason: '不匹配的文件，保持原名称'
        })
      }
    }
    
    // 4. 统计信息
    const stats = {
      totalFiles: files.length,
      processedFiles: groups.size,
      willRename: renamePlan.filter(p => p.oldName !== p.newName).length,
      groups: Array.from(groups.keys()).sort((a, b) => {
        return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
      })
    }
    
    return {
      success: true,
      stats,
      renamePlan,
      groups: Array.from(groups.entries()).map(([base, files]) => ({
        base,
        files: sortGroupFiles(files).map(f => ({
          name: f.name,
          isMain: f.parsed.isMain,
          idx: f.parsed.idx,
          ext: f.parsed.ext
        }))
      }))
    }
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stats: {
        totalFiles: files.length,
        processedFiles: 0,
        willRename: 0
      }
    }
  }
}

module.exports = {
  parseFileName,
  groupFilesByBase,
  sortGroupFiles,
  generateRenamePlan,
  executeRenamePlan,
  organizeFiles,
  previewRenamePlan,
  SUPPORTED_EXTENSIONS,
  FILE_NAME_REGEX
}
