/**
 * 重命名服务模块
 * 
 * 核心重命名逻辑
 * 冲突处理策略
 * 文件处理流程
 * 
 * @author IWMS Team
 * @version 1.0.0
 */

const fs = require('fs-extra')
const path = require('path')
const { parseFileName } = require('../utils/fileNameParser')
const { compressImagesBatch, compressImagesBatchByDimension } = require('../utils/imageCompressor')
const { getRecommendedBatchSize, forceGarbageCollection } = require('../utils/memoryManager')

/**
 * 预览文件变更
 * 
 * @param {Object} params - 预览参数
 * @param {Array} params.files - 文件路径数组
 * @param {Array} params.mapping - 文件名映射数组
 * @param {string} params.outputPath - 输出目录路径
 * @returns {Object} 预览结果和统计信息
 */
async function previewFileChanges({ files, mapping, outputPath }) {
  try {
    const mappingMap = new Map(mapping)
    const results = []
    let processedCount = 0
    let skippedCount = 0
    let conflictCount = 0
    
    // 创建带时间戳的输出目录名称用于预览
    const timestamp = new Date().toISOString().slice(0, 23).replace(/:/g, '-').replace(/\./g, '-')
    const outputDirName = `IWMS_重命名结果_${timestamp}`
    const previewOutputPath = path.join(outputPath, outputDirName)
    
    for (const filePath of files) {
      try {
        const fileName = path.basename(filePath)
        const { base, sequence, extension } = parseFileName(fileName)
        
        if (mappingMap.has(base)) {
          const newBase = mappingMap.get(base)
          let newFileName = newBase
          
          if (sequence) {
            newFileName += ` (${sequence})`
          }
          
          if (extension) {
            newFileName += extension
          }
          
          // 检查冲突
          const outputFilePath = path.join(previewOutputPath, newFileName)
          
          if (await fs.pathExists(outputFilePath)) {
            conflictCount++
            results.push({
              sourcePath: filePath,
              originalName: fileName,
              newName: newFileName,
              status: 'conflict',
              message: '目标文件已存在'
            })
          } else {
            processedCount++
            results.push({
              sourcePath: filePath,
              originalName: fileName,
              newName: newFileName,
              status: 'success',
              message: ''
            })
          }
        } else {
          skippedCount++
          results.push({
            sourcePath: filePath,
            originalName: fileName,
            newName: '',
            status: 'skipped',
            message: '未命中映射表'
          })
        }
      } catch (error) {
        // 单个文件处理出错，记录错误但继续处理其他文件
        results.push({
          sourcePath: filePath,
          originalName: path.basename(filePath),
          newName: '',
          status: 'error',
          message: `处理失败: ${error.message}`
        })
      }
    }
    
    return {
      results,
      summary: {
        processed: processedCount,
        skipped: skippedCount,
        conflicts: conflictCount,
        total: files.length
      }
    }
  } catch (error) {
    throw new Error(`预览文件变更失败: ${error.message}`)
  }
}

/**
 * 执行文件重命名
 * 
 * @param {Object} params - 重命名参数
 * @returns {Object} 处理结果和统计信息
 */
async function processFiles({ inputPath, outputPath, mapping, files, conflictStrategy, compressionMode, maxDimension, maxFileSize }) {
  const results = []
  let processedCount = 0
  let skippedCount = 0
  let conflictCount = 0
  let errorCount = 0
  let compressedCount = 0
  let compressionTime = 0
  let threadsUsed = 1
  
  // 收集图片压缩任务，稍后批量处理
  const imageCompressionTasks = []
  
  // 创建带时间戳的输出目录，避免重名
  const timestamp = new Date().toISOString().slice(0, 23).replace(/:/g, '-').replace(/\./g, '-')
  const outputDirName = `IWMS_重命名结果_${timestamp}`
  const finalOutputPath = path.join(outputPath, outputDirName)
  
  // 确保输出目录存在
  await fs.ensureDir(finalOutputPath)
  
  // 将数组格式的映射转换为 Map 对象，确保兼容性
  let mappingMap
  if (Array.isArray(mapping)) {
    mappingMap = new Map(mapping)
  } else if (mapping instanceof Map) {
    mappingMap = mapping
  } else {
    throw new Error('映射数据格式无效，期望数组或 Map 对象')
  }
  
  // 遍历处理每个文件
  for (const filePath of files) {
    try {
      const fileName = path.basename(filePath)
      const { base, sequence, extension } = parseFileName(fileName)
      
      if (mappingMap.has(base)) {
        // 如果文件名在映射表中，进行重命名处理
        const newBase = mappingMap.get(base)
        let newFileName = newBase
        
        // 保持原有的编号和扩展名
        if (sequence) {
          newFileName += ` (${sequence})`
        }
        
        if (extension) {
          newFileName += extension
        }
        
        const outputFilePath = path.join(finalOutputPath, newFileName)
        
        // 初始化最终输出路径
        let finalOutputFilePath = outputFilePath
        
        // 检查文件名冲突
        if (await fs.pathExists(outputFilePath)) {
          conflictCount++
          
          if (conflictStrategy === 'append') {
            // 冲突策略：追加标识符
            let counter = 1
            while (await fs.pathExists(finalOutputFilePath)) {
              const nameWithoutExt = path.parse(newFileName).name
              const ext = path.parse(newFileName).ext
              finalOutputFilePath = path.join(finalOutputPath, `${nameWithoutExt}_conflict-${counter}${ext}`)
              counter++
            }
          } else if (conflictStrategy === 'skip') {
            // 冲突策略：跳过
            results.push({
              sourcePath: filePath,
              originalName: fileName,
              newName: newFileName,
              status: 'skipped',
              message: '目标文件已存在'
            })
            skippedCount++
            continue
          }
          // 如果conflictStrategy是'overwrite'，finalOutputFilePath 保持为 outputFilePath
        }
        
        // 检查是否为图片文件且需要压缩
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp']
        const isImage = imageExtensions.includes(extension?.toLowerCase())
        
        if (isImage) {
          // 图片文件，添加到压缩任务中
          imageCompressionTasks.push({
            inputPath: filePath,
            outputPath: finalOutputFilePath,
            fileName: fileName,
            maxDimension: maxDimension,
            maxFileSize: maxFileSize
          })
          
          // 先添加一个占位结果，稍后会被压缩结果替换
          results.push({
            sourcePath: filePath,
            originalName: fileName,
            newName: path.basename(finalOutputFilePath),
            status: 'pending',
            message: '等待压缩处理'
          })
        } else {
          // 非图片文件，直接复制
          await fs.copy(filePath, finalOutputFilePath)
          results.push({
            sourcePath: filePath,
            originalName: fileName,
            newName: path.basename(finalOutputFilePath),
            status: 'success',
            message: ''
          })
        }
        
        processedCount++
      } else {
        // 文件名不在映射表中，跳过
        results.push({
          sourcePath: filePath,
          originalName: fileName,
          newName: '',
          status: 'skipped',
          message: '未命中映射表'
        })
        skippedCount++
      }
    } catch (error) {
      // 处理过程中出现错误
      errorCount++
      results.push({
        sourcePath: filePath,
        originalName: path.basename(filePath),
        newName: '',
        status: 'error',
        message: error.message
      })
    }
  }
  
  // 处理图片压缩任务
  if (imageCompressionTasks.length > 0) {
    const startTime = Date.now()
    
    // 分批处理图片，避免内存溢出
    const configManager = require('../utils/configManager')
    const config = configManager.getCurrentConfig()
    
    // 使用配置管理器中的批次大小
    const batchSize = config.imageProcessing.batchSize
    const batches = []
    for (let i = 0; i < imageCompressionTasks.length; i += batchSize) {
      batches.push(imageCompressionTasks.slice(i, i + batchSize))
    }
    
    console.log(`📦 图片处理批次: ${batches.length}批，每批${batchSize}张图片`)
    console.log(`🧵 当前线程配置: ${config.imageProcessing.maxThreads}个线程，多线程${config.imageProcessing.enableMultiThread ? '启用' : '禁用'}`)
    
    let allResults = []
    let totalCompressionTime = 0
    let totalThreadsUsed = 0
    
    for (const batch of batches) {
      if (compressionMode === 'dimension') {
        // 按尺寸压缩模式
        const compressionResult = await compressImagesBatchByDimension({
          imageTasks: batch,
          maxDimension: maxDimension,
          useMultiThread: config.imageProcessing.enableMultiThread,
          maxThreads: config.imageProcessing.maxThreads
        })
      
        if (compressionResult.success) {
          // 将压缩结果转换为正确的格式，并替换占位结果
          for (const compressResult of compressionResult.results) {
            const task = batch.find(t => t.inputPath === compressResult.filePath)
            if (task) {
              // 找到对应的占位结果并替换
              const existingResultIndex = results.findIndex(r => r.sourcePath === task.inputPath && r.status === 'pending')
              if (existingResultIndex !== -1) {
                results[existingResultIndex] = {
                  sourcePath: task.inputPath,
                  originalName: task.fileName,
                  newName: path.basename(task.outputPath),
                  status: 'success',
                  message: compressResult.message
                }
              }
              
              if (compressResult.compressed) {
                compressedCount++
              }
            }
          }
          allResults.push(...compressionResult.results)
          totalCompressionTime += compressionResult.totalTime
          totalThreadsUsed = Math.max(totalThreadsUsed, compressionResult.threadsUsed)
        }
      } else if (compressionMode === 'filesize') {
        // 按文件大小压缩模式
        const compressionResult = await compressImagesBatch({
          imageTasks: batch,
          maxFileSize: maxFileSize,
          useMultiThread: config.imageProcessing.enableMultiThread,
          maxThreads: config.imageProcessing.maxThreads
        })
        
        if (compressionResult.success) {
          // 将压缩结果转换为正确的格式，并替换占位结果
          for (const compressResult of compressionResult.results) {
            const task = batch.find(t => t.inputPath === compressResult.filePath)
            if (task) {
              // 找到对应的占位结果并替换
              const existingResultIndex = results.findIndex(r => r.sourcePath === task.inputPath && r.status === 'pending')
              if (existingResultIndex !== -1) {
                results[existingResultIndex] = {
                  sourcePath: task.inputPath,
                  originalName: task.fileName,
                  newName: path.basename(task.outputPath),
                  status: 'success',
                  message: compressResult.message
                }
              }
              
              if (compressResult.compressed) {
                compressedCount++
              }
            }
          }
          allResults.push(...compressionResult.results)
          totalCompressionTime += compressionResult.totalTime
          totalThreadsUsed = Math.max(totalThreadsUsed, compressionResult.threadsUsed)
        }
      }
      
      // 每批处理完后强制垃圾回收
      if (global.gc) {
        global.gc()
      }
    }
    
    // 使用累计的统计信息
    compressionTime = totalCompressionTime
    threadsUsed = totalThreadsUsed
  }
  
  // 返回处理结果和统计信息
  return {
    results,
    summary: {
      processed: processedCount,
      skipped: skippedCount,
      conflicts: conflictCount,
      errors: errorCount,
      compressed: compressedCount,
      compressionTime: compressionTime,
      threadsUsed: threadsUsed,
      total: files.length,
      outputDirectory: finalOutputPath
    }
  }
}

module.exports = {
  previewFileChanges,
  processFiles
}
