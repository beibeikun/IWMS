/**
 * Excel处理工具模块
 * 
 * 支持读取Excel映射表
 * 支持多种Excel格式
 * 数据验证和错误处理
 * 
 * @author IWMS Team
 * @version 1.0.0
 */

const XLSX = require('xlsx')

/**
 * 读取 Excel 映射文件
 * 
 * @param {string} filePath - Excel 文件路径
 * @returns {Object} 包含映射数据和错误信息的对象
 */
function readExcelMapping(filePath) {
  try {
    // 读取 Excel 文件
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]        // 获取第一个工作表
    const worksheet = workbook.Sheets[sheetName]    // 获取工作表数据
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })  // 转换为数组格式
    
    const mapping = new Map()                       // 存储文件名映射关系
    const errors = []                               // 存储错误信息
    
    // 遍历每一行数据，解析映射关系
    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      if (row.length >= 2 && row[0] && row[1]) {   // 确保有足够的列且不为空
        const oldName = String(row[0]).trim()       // 旧文件名（第一列）
        const newName = String(row[1]).trim()       // 新文件名（第二列）
        
        if (oldName && newName) {
          if (mapping.has(oldName)) {
            // 检查重复的旧文件名
            errors.push(`第${i + 1}行: 重复的旧名称 "${oldName}"`)
          } else {
            mapping.set(oldName, newName)            // 添加到映射表
          }
        }
      }
    }
    
    return { mapping: Array.from(mapping.entries()), errors }
  } catch (error) {
    throw new Error(`读取Excel文件失败: ${error.message}`)
  }
}

/**
 * 验证映射表数据
 * 
 * @param {Array} mapping - 映射数据数组
 * @returns {Object} 验证结果
 */
function validateMapping(mapping) {
  const errors = []
  const warnings = []
  
  if (!Array.isArray(mapping) || mapping.length === 0) {
    errors.push('映射表为空或格式无效')
    return { isValid: false, errors, warnings }
  }
  
  // 检查数据完整性
  for (let i = 0; i < mapping.length; i++) {
    const item = mapping[i]
    
    if (!Array.isArray(item) || item.length < 2) {
      errors.push(`第${i + 1}行: 数据格式无效，需要两列数据`)
      continue
    }
    
    const oldName = String(item[0] || '').trim()
    const newName = String(item[1] || '').trim()
    
    if (!oldName) {
      errors.push(`第${i + 1}行: 原文件名不能为空`)
    }
    
    if (!newName) {
      errors.push(`第${i + 1}行: 新文件名不能为空`)
    }
    
    // 检查文件名长度
    if (oldName.length > 255) {
      warnings.push(`第${i + 1}行: 原文件名过长 (${oldName.length}字符)`)
    }
    
    if (newName.length > 255) {
      warnings.push(`第${i + 1}行: 新文件名过长 (${newName.length}字符)`)
    }
    
    // 检查特殊字符
    const invalidChars = /[<>:"/\\|?*]/
    if (invalidChars.test(oldName)) {
      warnings.push(`第${i + 1}行: 原文件名包含特殊字符 "${oldName}"`)
    }
    
    if (invalidChars.test(newName)) {
      warnings.push(`第${i + 1}行: 新文件名包含特殊字符 "${newName}"`)
    }
  }
  
  // 检查重复的原文件名
  const oldNames = mapping.map(item => String(item[0] || '').trim()).filter(name => name)
  const duplicateOldNames = oldNames.filter((name, index) => oldNames.indexOf(name) !== index)
  
  if (duplicateOldNames.length > 0) {
    const uniqueDuplicates = [...new Set(duplicateOldNames)]
    errors.push(`发现重复的原文件名: ${uniqueDuplicates.join(', ')}`)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    totalMappings: mapping.length,
    validMappings: mapping.filter(item => 
      Array.isArray(item) && 
      item.length >= 2 && 
      String(item[0] || '').trim() && 
      String(item[1] || '').trim()
    ).length
  }
}

/**
 * 导出映射表到Excel
 * 
 * @param {Array} mapping - 映射数据
 * @param {string} outputPath - 输出路径
 * @returns {string} 输出文件路径
 */
function exportMappingToExcel(mapping, outputPath) {
  try {
    // 创建工作簿
    const workbook = XLSX.utils.book_new()
    
    // 准备数据
    const data = [
      ['原文件名', '新文件名'], // 表头
      ...mapping.map(item => [item[0], item[1]])
    ]
    
    // 创建工作表
    const worksheet = XLSX.utils.aoa_to_sheet(data)
    
    // 设置列宽
    worksheet['!cols'] = [
      { width: 30 }, // 原文件名列
      { width: 30 }  // 新文件名列
    ]
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, '文件名映射')
    
    // 写入文件
    XLSX.writeFile(workbook, outputPath)
    
    return outputPath
  } catch (error) {
    throw new Error(`导出Excel文件失败: ${error.message}`)
  }
}

/**
 * 获取支持的Excel格式
 */
function getSupportedFormats() {
  return [
    { extension: '.xlsx', description: 'Excel 2007+ (.xlsx)' },
    { extension: '.xls', description: 'Excel 97-2003 (.xls)' },
    { extension: '.csv', description: 'CSV 文件 (.csv)' }
  ]
}

module.exports = {
  readExcelMapping,
  validateMapping,
  exportMappingToExcel,
  getSupportedFormats
}
