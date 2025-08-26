/**
 * 图片压缩工具模块
 * 
 * 支持按尺寸和文件大小两种压缩模式
 * 支持单线程和多线程处理
 * 
 * @author IWMS Team
 * @version 1.0.0
 */

const fs = require('fs-extra')
const path = require('path')
const sharp = require('sharp')
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads')

/**
 * 批量图片压缩功能（按文件体积压缩）
 * 
 * @param {Object} params - 压缩参数
 * @param {Array} params.imageTasks - 图片任务数组
 * @param {number} params.maxFileSize - 最大文件大小（KB）
 * @param {boolean} params.useMultiThread - 是否使用多线程
 * @returns {Object} 压缩结果和统计信息
 */
async function compressImagesBatch({ imageTasks, maxFileSize, useMultiThread = true }) {
  try {
    if (!maxFileSize || maxFileSize <= 0) {
      // 不压缩，直接复制所有文件
      const results = []
      for (const task of imageTasks) {
        await fs.copy(task.inputPath, task.outputPath)
        results.push({
          success: true,
          compressed: false,
          originalSize: { width: 0, height: 0, sizeKB: 0 },
          newSize: { width: 0, height: 0, sizeKB: 0 },
          message: '未压缩，直接复制',
          filePath: task.inputPath
        })
      }
      return { success: true, results, totalTime: 0, threadsUsed: 1 }
    }

    if (useMultiThread && imageTasks.length > 1) {
      return await compressImagesMultiThread(imageTasks, maxFileSize)
    } else {
      return await compressImagesSingleThread(imageTasks, maxFileSize)
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * 批量图片压缩功能（按尺寸压缩）
 * 
 * @param {Object} params - 压缩参数
 * @param {Array} params.imageTasks - 图片任务数组
 * @param {number} params.maxDimension - 最大尺寸
 * @param {boolean} params.useMultiThread - 是否使用多线程
 * @returns {Object} 压缩结果和统计信息
 */
async function compressImagesBatchByDimension({ imageTasks, maxDimension, useMultiThread = true }) {
  try {
    if (!maxDimension || maxDimension <= 0) {
      // 不压缩，直接复制所有文件
      const results = []
      for (const task of imageTasks) {
        await fs.copy(task.inputPath, task.outputPath)
        results.push({
          success: true,
          compressed: false,
          originalSize: { width: 0, height: 0, sizeKB: 0 },
          newSize: { width: 0, height: 0, sizeKB: 0 },
          message: '未压缩，直接复制',
          filePath: task.inputPath
        })
      }
      return { success: true, results, totalTime: 0, threadsUsed: 1 }
    }

    if (useMultiThread && imageTasks.length > 1) {
      return await compressImagesByDimensionMultiThread(imageTasks, maxDimension)
    } else {
      return await compressImagesByDimensionSingleThread(imageTasks, maxDimension)
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * 单线程按文件大小压缩
 */
async function compressImagesSingleThread(imageTasks, maxFileSize) {
  const startTime = Date.now()
  const results = []
  
  for (const task of imageTasks) {
    try {
      const result = await compressImageByFileSize(task.inputPath, task.outputPath, maxFileSize)
      results.push(result)
    } catch (error) {
      results.push({
        success: false,
        compressed: false,
        originalSize: { width: 0, height: 0, sizeKB: 0 },
        newSize: { width: 0, height: 0, sizeKB: 0 },
        message: `压缩失败: ${error.message}`,
        filePath: task.inputPath
      })
    }
  }
  
  const totalTime = Date.now() - startTime
  return { success: true, results, totalTime, threadsUsed: 1 }
}

/**
 * 单线程按尺寸压缩
 */
async function compressImagesByDimensionSingleThread(imageTasks, maxDimension) {
  const startTime = Date.now()
  const results = []
  
  for (const task of imageTasks) {
    try {
      const result = await compressImageByDimension(task.inputPath, task.outputPath, maxDimension)
      results.push(result)
    } catch (error) {
      results.push({
        success: false,
        compressed: false,
        originalSize: { width: 0, height: 0, sizeKB: 0 },
        newSize: { width: 0, height: 0, sizeKB: 0 },
        message: `压缩失败: ${error.message}`,
        filePath: task.inputPath
      })
    }
  }
  
  const totalTime = Date.now() - startTime
  return { success: true, results, totalTime, threadsUsed: 1 }
}

/**
 * 多线程按文件大小压缩
 */
async function compressImagesMultiThread(imageTasks, maxFileSize) {
  const startTime = Date.now()
  const numCPUs = require('os').cpus().length
  const numThreads = Math.min(numCPUs, imageTasks.length, 8) // 最多8个线程
  
  const results = await Promise.all(
    imageTasks.map((task, index) => {
      return new Promise((resolve) => {
        const worker = new Worker(__filename, {
          workerData: { task, maxFileSize, mode: 'filesize' }
        })
        
        worker.on('message', (result) => {
          resolve(result)
          worker.terminate()
        })
        
        worker.on('error', (error) => {
          resolve({
            success: false,
            compressed: false,
            originalSize: { width: 0, height: 0, sizeKB: 0 },
            newSize: { width: 0, height: 0, sizeKB: 0 },
            message: `压缩失败: ${error.message}`,
            filePath: task.inputPath
          })
          worker.terminate()
        })
      })
    })
  )
  
  const totalTime = Date.now() - startTime
  return { success: true, results, totalTime, threadsUsed: numThreads }
}

/**
 * 多线程按尺寸压缩
 */
async function compressImagesByDimensionMultiThread(imageTasks, maxDimension) {
  const startTime = Date.now()
  const numCPUs = require('os').cpus().length
  const numThreads = Math.min(numCPUs, imageTasks.length, 8) // 最多8个线程
  
  const results = await Promise.all(
    imageTasks.map((task, index) => {
      return new Promise((resolve) => {
        const worker = new Worker(__filename, {
          workerData: { task, maxDimension, mode: 'dimension' }
        })
        
        worker.on('message', (result) => {
          resolve(result)
          worker.terminate()
        })
        
        worker.on('error', (error) => {
          resolve({
            success: false,
            compressed: false,
            originalSize: { width: 0, height: 0, sizeKB: 0 },
            newSize: { width: 0, height: 0, sizeKB: 0 },
            message: `压缩失败: ${error.message}`,
            filePath: task.inputPath
          })
          worker.terminate()
        })
      })
    })
  )
  
  const totalTime = Date.now() - startTime
  return { success: true, results, totalTime, threadsUsed: numThreads }
}

/**
 * 按文件大小压缩单张图片
 */
async function compressImageByFileSize(inputPath, outputPath, maxFileSizeKB) {
  try {
    const image = sharp(inputPath)
    const metadata = await image.metadata()
    
    const originalSizeKB = Math.round(metadata.size / 1024)
    let quality = 80
    let compressed = false
    
    if (originalSizeKB <= maxFileSizeKB) {
      // 文件已经足够小，直接复制
      await fs.copy(inputPath, outputPath)
      return {
        success: true,
        compressed: false,
        originalSize: { width: metadata.width, height: metadata.height, sizeKB: originalSizeKB },
        newSize: { width: metadata.width, height: metadata.height, sizeKB: originalSizeKB },
        message: '文件已足够小，无需压缩',
        filePath: inputPath
      }
    }
    
    // 尝试压缩到目标大小
    let outputBuffer
    while (quality > 10) {
      outputBuffer = await image.jpeg({ quality }).toBuffer()
      const newSizeKB = Math.round(outputBuffer.length / 1024)
      
      if (newSizeKB <= maxFileSizeKB) {
        compressed = true
        break
      }
      quality -= 10
    }
    
    if (compressed) {
      await fs.writeFile(outputPath, outputBuffer)
      return {
        success: true,
        compressed: true,
        originalSize: { width: metadata.width, height: metadata.height, sizeKB: originalSizeKB },
        newSize: { width: metadata.width, height: metadata.height, sizeKB: Math.round(outputBuffer.length / 1024) },
        message: `压缩完成，质量: ${quality}%`,
        filePath: inputPath
      }
    } else {
      // 即使最低质量也无法达到目标大小，使用最低质量
      outputBuffer = await image.jpeg({ quality: 10 }).toBuffer()
      await fs.writeFile(outputPath, outputBuffer)
      return {
        success: true,
        compressed: true,
        originalSize: { width: metadata.width, height: metadata.height, sizeKB: originalSizeKB },
        newSize: { width: metadata.width, height: metadata.height, sizeKB: Math.round(outputBuffer.length / 1024) },
        message: '使用最低质量压缩',
        filePath: inputPath
      }
    }
  } catch (error) {
    throw new Error(`压缩图片失败: ${error.message}`)
  }
}

/**
 * 按尺寸压缩单张图片
 */
async function compressImageByDimension(inputPath, outputPath, maxDimension) {
  try {
    const image = sharp(inputPath)
    const metadata = await image.metadata()
    
    const { width, height } = metadata
    let newWidth = width
    let newHeight = height
    let compressed = false
    
    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        newWidth = maxDimension
        newHeight = Math.round((height * maxDimension) / width)
      } else {
        newHeight = maxDimension
        newWidth = Math.round((width * maxDimension) / height)
      }
      compressed = true
    }
    
    if (compressed) {
      await image.resize(newWidth, newHeight).toFile(outputPath)
      const newStats = await fs.stat(outputPath)
      const newSizeKB = Math.round(newStats.size / 1024)
      const originalSizeKB = Math.round(metadata.size / 1024)
      
      return {
        success: true,
        compressed: true,
        originalSize: { width, height, sizeKB: originalSizeKB },
        newSize: { width: newWidth, height: newHeight, sizeKB: newSizeKB },
        message: `尺寸压缩: ${width}x${height} → ${newWidth}x${newHeight}`,
        filePath: inputPath
      }
    } else {
      // 尺寸已经足够小，直接复制
      await fs.copy(inputPath, outputPath)
      const originalSizeKB = Math.round(metadata.size / 1024)
      
      return {
        success: true,
        compressed: false,
        originalSize: { width, height, sizeKB: originalSizeKB },
        newSize: { width, height, sizeKB: originalSizeKB },
        message: '尺寸已足够小，无需压缩',
        filePath: inputPath
      }
    }
  } catch (error) {
    throw new Error(`压缩图片失败: ${error.message}`)
  }
}

// Worker线程处理逻辑
if (!isMainThread) {
  const { task, maxFileSize, maxDimension, mode } = workerData
  
  if (mode === 'filesize') {
    compressImageByFileSize(task.inputPath, task.outputPath, maxFileSize)
      .then(result => parentPort.postMessage(result))
      .catch(error => parentPort.postMessage({
        success: false,
        compressed: false,
        originalSize: { width: 0, height: 0, sizeKB: 0 },
        newSize: { width: 0, height: 0, sizeKB: 0 },
        message: `压缩失败: ${error.message}`,
        filePath: task.inputPath
      }))
  } else if (mode === 'dimension') {
    compressImageByDimension(task.inputPath, task.outputPath, maxDimension)
      .then(result => parentPort.postMessage(result))
      .catch(error => parentPort.postMessage({
        success: false,
        compressed: false,
        originalSize: { width: 0, height: 0, sizeKB: 0 },
        newSize: { width: 0, height: 0, sizeKB: 0 },
        message: `压缩失败: ${error.message}`,
        filePath: task.inputPath
      }))
  }
}

module.exports = {
  compressImagesBatch,
  compressImagesBatchByDimension,
  compressImageByFileSize,
  compressImageByDimension
}
