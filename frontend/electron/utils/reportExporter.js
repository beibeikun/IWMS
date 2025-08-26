/**
 * 报告导出工具模块
 * 
 * 支持导出CSV格式的处理报告
 * 支持多种报告类型
 * 
 * @author IWMS Team
 * @version 1.0.0
 */

const fs = require('fs-extra')
const path = require('path')

/**
 * 导出处理结果到 CSV 文件
 * 
 * @param {Array} results - 处理结果数组
 * @param {string} outputPath - 输出目录路径
 * @param {string} reportType - 报告类型 ('preview', 'execution')
 * @returns {string} 生成的报告文件路径
 */
async function exportResultsToCSV(results, outputPath, reportType = 'execution') {
  try {
    console.log('exportResultsToCSV: 开始导出，参数:', { 
      resultsType: typeof results, 
      resultsLength: results?.length, 
      outputPath, 
      reportType 
    })
    
    // 确保输入参数是数组
    if (!Array.isArray(results)) {
      console.warn('exportResultsToCSV: results 不是数组，转换为空数组')
      results = []
    }
    
    // 深度清理数据，只保留可序列化的属性
    const cleanResults = results.map((result, index) => {
      try {
        // 确保每个字段都是字符串类型
        const cleanResult = {
          sourcePath: String(result?.sourcePath || ''),
          originalName: String(result?.originalName || ''),
          newName: String(result?.newName || ''),
          status: String(result?.status || ''),
          message: String(result?.message || '')
        }
        
        // 验证清理后的数据
        Object.keys(cleanResult).forEach(key => {
          if (typeof cleanResult[key] !== 'string') {
            console.warn(`exportResultsToCSV: 第 ${index} 项的 ${key} 字段不是字符串，强制转换`)
            cleanResult[key] = String(cleanResult[key] || '')
          }
        })
        
        return cleanResult
      } catch (itemError) {
        console.warn(`exportResultsToCSV: 清理第 ${index} 项数据失败:`, itemError.message)
        return {
          sourcePath: '',
          originalName: '',
          newName: '',
          status: 'error',
          message: '数据清理失败'
        }
      }
    })
    
    // 构建 CSV 内容
    const csvContent = [
      '源文件路径,原文件名,新文件名,处理状态,备注/错误信息'
    ]
    
    // 添加每一行的数据
    for (const result of cleanResults) {
      try {
        csvContent.push([
          result.sourcePath,               // 源文件路径
          result.originalName,             // 原文件名
          result.newName,                  // 新文件名
          result.status,                   // 处理状态
          result.message                   // 备注或错误信息
        ].map(field => `"${String(field || '')}"`).join(','))
      } catch (rowError) {
        console.warn('exportResultsToCSV: 处理行数据失败:', rowError.message)
        csvContent.push('"","","","error","行数据处理失败"')
      }
    }
    
    // 生成带时间戳的报告文件名
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const reportFileName = `${reportType === 'preview' ? '预览报告' : '处理报告'}_${timestamp}.csv`
    const reportPath = path.join(outputPath, reportFileName)
    
    // 确保输出目录存在
    await fs.ensureDir(outputPath)
    
    // 写入文件
    await fs.writeFile(reportPath, csvContent.join('\n'), 'utf8')
    
    console.log(`exportResultsToCSV: 成功导出报告到 ${reportPath}`)
    return reportPath
  } catch (error) {
    console.error('exportResultsToCSV: 导出失败:', error.message)
    // 不抛出异常，返回错误信息
    return null
  }
}

/**
 * 导出映射表到 CSV 文件
 * 
 * @param {Array} mapping - 映射数据数组
 * @param {string} outputPath - 输出目录路径
 * @returns {string} 生成的映射表文件路径
 */
async function exportMappingToCSV(mapping, outputPath) {
  try {
    // 确保输入参数是数组
    if (!Array.isArray(mapping)) {
      console.warn('exportMappingToCSV: mapping 不是数组，转换为空数组')
      mapping = []
    }
    
    // 构建 CSV 内容
    const csvContent = [
      '原文件名,新文件名'
    ]
    
    // 添加映射数据
    for (let i = 0; i < mapping.length; i++) {
      try {
        const item = mapping[i]
        if (Array.isArray(item) && item.length >= 2) {
          csvContent.push([
            String(item[0] || ''),        // 原文件名
            String(item[1] || '')         // 新文件名
          ].map(field => `"${String(field || '')}"`).join(','))
        }
      } catch (itemError) {
        console.warn(`exportMappingToCSV: 处理第 ${i} 项映射数据失败:`, itemError.message)
        csvContent.push('"","映射数据处理失败"')
      }
    }
    
    // 生成带时间戳的文件名
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const fileName = `映射表_${timestamp}.csv`
    const filePath = path.join(outputPath, fileName)
    
    // 确保输出目录存在
    await fs.ensureDir(outputPath)
    
    await fs.writeFile(filePath, csvContent.join('\n'), 'utf8')
    
    console.log(`exportMappingToCSV: 成功导出映射表到 ${filePath}`)
    return filePath
  } catch (error) {
    console.error('exportMappingToCSV: 导出失败:', error.message)
    // 不抛出异常，返回错误信息
    return null
  }
}

/**
 * 生成处理摘要报告
 * 
 * @param {Object} summary - 处理摘要信息
 * @param {string} outputPath - 输出目录路径
 * @returns {string} 生成的摘要报告文件路径
 */
async function exportSummaryReport(summary, outputPath) {
  try {
    // 清理摘要数据，只保留可序列化的属性
    const cleanSummary = {
      total: Number(summary.total || 0),
      processed: Number(summary.processed || 0),
      skipped: Number(summary.skipped || 0),
      conflicts: Number(summary.conflicts || 0),
      errors: Number(summary.errors || 0),
      compressed: summary.compressed !== undefined ? Number(summary.compressed || 0) : undefined,
      compressionTime: summary.compressionTime !== undefined ? Number(summary.compressionTime || 0) : undefined,
      threadsUsed: summary.threadsUsed !== undefined ? Number(summary.threadsUsed || 1) : undefined,
      outputDirectory: summary.outputDirectory ? String(summary.outputDirectory) : undefined
    }
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const fileName = `处理摘要_${timestamp}.txt`
    const filePath = path.join(outputPath, fileName)
    
    let content = `IWMS 文件处理摘要报告\n`
    content += `生成时间: ${new Date().toLocaleString('zh-CN')}\n`
    content += `==========================================\n\n`
    
    // 基本统计信息
    content += `基本统计:\n`
    content += `- 总文件数: ${cleanSummary.total}\n`
    content += `- 成功处理: ${cleanSummary.processed}\n`
    content += `- 跳过文件: ${cleanSummary.skipped}\n`
    content += `- 冲突文件: ${cleanSummary.conflicts}\n`
    content += `- 错误文件: ${cleanSummary.errors}\n`
    
    if (cleanSummary.compressed !== undefined) {
      content += `- 压缩文件: ${cleanSummary.compressed}\n`
    }
    
    if (cleanSummary.compressionTime !== undefined && cleanSummary.compressionTime > 0) {
      content += `- 压缩耗时: ${cleanSummary.compressionTime}ms\n`
      content += `- 使用线程: ${cleanSummary.threadsUsed}个\n`
    }
    
    if (cleanSummary.outputDirectory) {
      content += `- 输出目录: ${cleanSummary.outputDirectory}\n`
    }
    
    content += `\n处理结果:\n`
    content += `- 成功率: ${cleanSummary.total > 0 ? Math.round((cleanSummary.processed / cleanSummary.total) * 100) : 0}%\n`
    content += `- 跳过率: ${cleanSummary.total > 0 ? Math.round((cleanSummary.skipped / cleanSummary.total) * 100) : 0}%\n`
    content += `- 冲突率: ${cleanSummary.total > 0 ? Math.round((cleanSummary.conflicts / cleanSummary.total) * 100) : 0}%\n`
    content += `- 错误率: ${cleanSummary.total > 0 ? Math.round((cleanSummary.errors / cleanSummary.total) * 100) : 0}%\n`
    
    // 确保输出目录存在
    await fs.ensureDir(outputPath)
    
    await fs.writeFile(filePath, content, 'utf8')
    
    console.log(`exportSummaryReport: 成功导出摘要报告到 ${filePath}`)
    return filePath
  } catch (error) {
    console.error('exportSummaryReport: 导出失败:', error.message)
    // 不抛出异常，返回错误信息
    return null
  }
}

/**
 * 生成完整的处理报告包
 * 
 * @param {Object} params - 报告参数
 * @returns {Object} 报告文件路径信息
 */
async function exportCompleteReport({ results, summary, mapping, outputPath, reportType = 'execution' }) {
  try {
    const reports = {}
    
    // 导出处理结果CSV
    if (results && results.length > 0) {
      reports.resultsCSV = await exportResultsToCSV(results, outputPath, reportType)
    }
    
    // 导出映射表CSV
    if (mapping && mapping.length > 0) {
      reports.mappingCSV = await exportMappingToCSV(mapping, outputPath)
    }
    
    // 导出摘要报告
    if (summary) {
      reports.summaryTXT = await exportSummaryReport(summary, outputPath)
    }
    
    return {
      success: true,
      reports,
      message: '报告导出完成'
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: '报告导出失败'
    }
  }
}

module.exports = {
  exportResultsToCSV,
  exportMappingToCSV,
  exportSummaryReport,
  exportCompleteReport
}
