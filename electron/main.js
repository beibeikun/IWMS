const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs-extra')
const XLSX = require('xlsx')
const glob = require('fast-glob')
const sharp = require('sharp')
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads')
const os = require('os')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'IWMS',
    icon: path.join(__dirname, '../assets/icon.png')
  })

  if (process.env.IS_DEV) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC 处理器
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  })
  return result.filePaths[0] || null
})

ipcMain.handle('select-excel-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Excel文件', extensions: ['xlsx', 'xls', 'csv'] }
    ]
  })
  return result.filePaths[0] || null
})

ipcMain.handle('read-excel-mapping', async (event, filePath) => {
  try {
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    
    const mapping = new Map()
    const errors = []
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      if (row.length >= 2 && row[0] && row[1]) {
        const oldName = String(row[0]).trim()
        const newName = String(row[1]).trim()
        
        if (oldName && newName) {
          if (mapping.has(oldName)) {
            errors.push(`第${i + 1}行: 重复的旧名称 "${oldName}"`)
          } else {
            mapping.set(oldName, newName)
          }
        }
      }
    }
    
    return { mapping: Array.from(mapping.entries()), errors }
  } catch (error) {
    throw new Error(`读取Excel文件失败: ${error.message}`)
  }
})

ipcMain.handle('scan-files', async (event, inputPath, recursive = false, fileTypes = ['image']) => {
  try {
    const pattern = recursive ? '**/*.*' : '*.*'
    const files = await glob(pattern, {
      cwd: inputPath,
      absolute: true,
      ignore: ['**/.*', '**/node_modules/**']
    })
    
    // 图片文件扩展名
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp', '.svg', '.ico']
    
    return files.filter(file => {
      const stat = fs.statSync(file)
      if (!stat.isFile()) return false
      
      const ext = path.extname(file).toLowerCase()
      
      if (fileTypes.includes('image')) {
        return imageExtensions.includes(ext)
      }
      
      // 如果没有指定文件类型，则包含所有文件
      return true
    })
  } catch (error) {
    throw new Error(`扫描文件失败: ${error.message}`)
  }
})

ipcMain.handle('process-files', async (event, { inputPath, outputPath, mapping, files, conflictStrategy, maxDimension }) => {
  const results = []
  let processedCount = 0
  let skippedCount = 0
  let conflictCount = 0
  let errorCount = 0
  let compressedCount = 0
  let compressionTime = 0
  let threadsUsed = 1
  
  // 收集图片压缩任务
  const imageCompressionTasks = []
  
  // 确保输出目录存在
  await fs.ensureDir(outputPath)
  
  for (const filePath of files) {
    try {
      const fileName = path.basename(filePath)
      const { base, sequence, extension } = parseFileName(fileName)
      
      if (mapping.has(base)) {
        const newBase = mapping.get(base)
        let newFileName = newBase
        
        if (sequence) {
          newFileName += ` (${sequence})`
        }
        
        if (extension) {
          newFileName += extension
        }
        
        const outputFilePath = path.join(outputPath, newFileName)
        
        // 检查冲突
        if (await fs.pathExists(outputFilePath)) {
          conflictCount++
          let finalOutputPath = outputFilePath
          
          if (conflictStrategy === 'append') {
            let counter = 1
            while (await fs.pathExists(finalOutputPath)) {
              const nameWithoutExt = path.parse(newFileName).name
              const ext = path.parse(newFileName).ext
              finalOutputPath = path.join(outputPath, `${nameWithoutExt}_conflict-${counter}${ext}`)
              counter++
            }
          } else if (conflictStrategy === 'skip') {
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
          // 如果conflictStrategy是'overwrite'，直接使用原路径
        }
        
        // 检查是否为图片文件且需要压缩
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp']
        const isImage = imageExtensions.includes(extension?.toLowerCase())
        
        if (isImage && maxDimension && maxDimension > 0) {
          // 收集图片压缩任务，稍后批量处理
          imageCompressionTasks.push({
            inputPath: filePath,
            outputPath: finalOutputPath || outputFilePath,
            fileName: fileName
          })
        } else {
          // 直接复制文件
          await fs.copy(filePath, finalOutputPath || outputFilePath)
          results.push({
            sourcePath: filePath,
            originalName: fileName,
            newName: path.basename(finalOutputPath || outputFilePath),
            status: 'success',
            message: ''
          })
        }
        
        processedCount++
      } else {
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
  
  // 批量处理图片压缩任务
  if (imageCompressionTasks.length > 0) {
    try {
      const compressionStartTime = Date.now()
      const compressionResult = await ipcMain.handlers['compress-images-batch'](undefined, {
        imageTasks: imageCompressionTasks,
        maxDimension: maxDimension,
        useMultiThread: true
      })
      
      if (compressionResult.success) {
        // 将压缩结果添加到results中
        for (const compressResult of compressionResult.results) {
          const task = imageCompressionTasks.find(t => t.inputPath === compressResult.filePath)
          if (task) {
            results.push({
              sourcePath: task.inputPath,
              originalName: task.fileName,
              newName: path.basename(task.outputPath),
              status: 'success',
              message: compressResult.message
            })
            
            if (compressResult.compressed) {
              compressedCount++
            }
          }
        }
        
        compressionTime = compressionResult.totalTime
        threadsUsed = compressionResult.threadsUsed
      } else {
        // 压缩失败，回退到复制
        for (const task of imageCompressionTasks) {
          await fs.copy(task.inputPath, task.outputPath)
          results.push({
            sourcePath: task.inputPath,
            originalName: task.fileName,
            newName: path.basename(task.outputPath),
            status: 'success',
            message: '批量压缩失败，已复制原文件'
          })
        }
      }
    } catch (error) {
      // 压缩出错，回退到复制
      for (const task of imageCompressionTasks) {
        await fs.copy(task.inputPath, task.outputPath)
        results.push({
          sourcePath: task.inputPath,
          originalName: task.fileName,
          newName: path.basename(task.outputPath),
          status: 'success',
          message: `压缩出错，已复制原文件: ${error.message}`
        })
      }
    }
  }
  
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
      total: files.length
    }
  }
})

// 解析文件名，提取主名、编号和扩展名
function parseFileName(fileName) {
  // 匹配带编号的文件名: filename (1).ext
  const numberedPattern = /^(.+?)\s*\((\d+)\)(\.[^.]+)$/
  const match = fileName.match(numberedPattern)
  
  if (match) {
    return {
      base: match[1].trim(),
      sequence: match[2],
      extension: match[3]
    }
  }
  
  // 匹配不带编号的文件名: filename.ext
  const simplePattern = /^(.+?)(\.[^.]+)$/
  const simpleMatch = fileName.match(simplePattern)
  
  if (simpleMatch) {
    return {
      base: simpleMatch[1].trim(),
      sequence: null,
      extension: simpleMatch[2]
    }
  }
  
  // 无扩展名的情况
  return {
    base: fileName,
    sequence: null,
    extension: ''
  }
}

ipcMain.handle('export-results', async (event, results, outputPath) => {
  try {
    const csvContent = [
      '源文件路径,原文件名,新文件名,处理状态,备注/错误信息'
    ]
    
    for (const result of results) {
      csvContent.push([
        result.sourcePath,
        result.originalName,
        result.newName,
        result.status,
        result.message
      ].map(field => `"${field}"`).join(','))
    }
    
    const reportPath = path.join(outputPath, `处理报告_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`)
    await fs.writeFile(reportPath, csvContent.join('\n'), 'utf8')
    
    return reportPath
  } catch (error) {
    throw new Error(`导出报告失败: ${error.message}`)
  }
})

// 多线程图片压缩功能
ipcMain.handle('compress-images-batch', async (event, { imageTasks, maxDimension, useMultiThread = true }) => {
  try {
    if (!maxDimension || maxDimension <= 0) {
      // 不压缩，直接复制所有文件
      const results = []
      for (const task of imageTasks) {
        await fs.copy(task.inputPath, task.outputPath)
        results.push({
          success: true,
          compressed: false,
          message: '未压缩，直接复制',
          filePath: task.inputPath
        })
      }
      return { results, totalTime: 0, threadsUsed: 1 }
    }

    if (!useMultiThread || imageTasks.length <= 2) {
      // 单线程处理
      const startTime = Date.now()
      const results = []
      
      for (const task of imageTasks) {
        try {
          const image = sharp(task.inputPath)
          const metadata = await image.metadata()
          
          let { width, height } = metadata
          
          // 计算新的尺寸，保持宽高比
          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width)
              width = maxDimension
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height)
              height = maxDimension
            }
          }
          
          // 压缩图片
          await image
            .resize(width, height, {
              fit: 'inside',
              withoutEnlargement: true
            })
            .jpeg({ quality: 85 })
            .toFile(task.outputPath)
          
          results.push({
            success: true,
            compressed: true,
            originalSize: { width: metadata.width, height: metadata.height },
            newSize: { width, height },
            message: `压缩完成: ${metadata.width}x${metadata.height} → ${width}x${height}`,
            filePath: task.inputPath
          })
        } catch (error) {
          // 压缩失败，回退到复制
          await fs.copy(task.inputPath, task.outputPath)
          results.push({
            success: true,
            compressed: false,
            message: `压缩失败，已复制原文件: ${error.message}`,
            filePath: task.inputPath
          })
        }
      }
      
      const totalTime = Date.now() - startTime
      return { results, totalTime, threadsUsed: 1 }
    }

    // 多线程处理
    const startTime = Date.now()
    const numThreads = Math.min(os.cpus().length, imageTasks.length, 8) // 最多8个线程
    const results = []
    
    // 将任务分配给多个线程
    const tasksPerThread = Math.ceil(imageTasks.length / numThreads)
    const workerPromises = []
    
    for (let i = 0; i < numThreads; i++) {
      const startIndex = i * tasksPerThread
      const endIndex = Math.min(startIndex + tasksPerThread, imageTasks.length)
      const threadTasks = imageTasks.slice(startIndex, endIndex)
      
      if (threadTasks.length > 0) {
        const workerPromise = new Promise((resolve, reject) => {
          const worker = new Worker(`
            const { parentPort, workerData } = require('worker_threads');
            const sharp = require('sharp');
            const fs = require('fs-extra');
            
            async function compressImages(tasks, maxDimension) {
              const results = [];
              
              for (const task of tasks) {
                try {
                  const image = sharp(task.inputPath);
                  const metadata = await image.metadata();
                  
                  let { width, height } = metadata;
                  
                  // 计算新的尺寸，保持宽高比
                  if (width > height) {
                    if (width > maxDimension) {
                      height = Math.round((height * maxDimension) / width);
                      width = maxDimension;
                    }
                  } else {
                    if (height > maxDimension) {
                      width = Math.round((width * maxDimension) / height);
                      height = maxDimension;
                    }
                  }
                  
                  // 压缩图片
                  await image
                    .resize(width, height, {
                      fit: 'inside',
                      withoutEnlargement: true
                    })
                    .jpeg({ quality: 85 })
                    .toFile(task.outputPath);
                  
                  results.push({
                    success: true,
                    compressed: true,
                    originalSize: { width: metadata.width, height: metadata.height },
                    newSize: { width, height },
                    message: \`压缩完成: \${metadata.width}x\${metadata.height} → \${width}x\${height}\`,
                    filePath: task.inputPath
                  });
                } catch (error) {
                  // 压缩失败，回退到复制
                  await fs.copy(task.inputPath, task.outputPath);
                  results.push({
                    success: true,
                    compressed: false,
                    message: \`压缩失败，已复制原文件: \${error.message}\`,
                    filePath: task.inputPath
                  });
                }
              }
              
              return results;
            }
            
            compressImages(workerData.tasks, workerData.maxDimension)
              .then(results => parentPort.postMessage(results))
              .catch(error => parentPort.postMessage({ error: error.message }));
          `, {
            eval: true,
            workerData: { tasks: threadTasks, maxDimension }
          });
          
          worker.on('message', (message) => {
            if (message.error) {
              reject(new Error(message.error));
            } else {
              resolve(message);
            }
            worker.terminate();
          });
          
          worker.on('error', reject);
          worker.on('exit', (code) => {
            if (code !== 0) {
              reject(new Error(`Worker stopped with exit code ${code}`));
            }
          });
        });
        
        workerPromises.push(workerPromise);
      }
    }
    
    // 等待所有线程完成
    const threadResults = await Promise.all(workerPromises);
    
    // 合并结果
    for (const threadResult of threadResults) {
      results.push(...threadResult);
    }
    
    const totalTime = Date.now() - startTime
    return { results, totalTime, threadsUsed: numThreads }
    
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      results: [],
      totalTime: 0,
      threadsUsed: 0
    }
  }
})

// 单张图片压缩功能（保持兼容性）
ipcMain.handle('compress-image', async (event, { inputPath, outputPath, maxDimension }) => {
  try {
    if (!maxDimension || maxDimension <= 0) {
      // 不压缩，直接复制
      await fs.copy(inputPath, outputPath)
      return { success: true, compressed: false, message: '未压缩，直接复制' }
    }

    // 获取图片信息
    const image = sharp(inputPath)
    const metadata = await image.metadata()
    
    let { width, height } = metadata
    
    // 计算新的尺寸，保持宽高比
    if (width > height) {
      if (width > maxDimension) {
        height = Math.round((height * maxDimension) / width)
        width = maxDimension
      }
    } else {
      if (height > maxDimension) {
        width = Math.round((width * maxDimension) / height)
        height = maxDimension
      }
    }
    
    // 压缩图片
    await image
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toFile(outputPath)
    
    return { 
      success: true, 
      compressed: true, 
      originalSize: { width: metadata.width, height: metadata.height },
      newSize: { width, height },
      message: `压缩完成: ${metadata.width}x${metadata.height} → ${width}x${height}`
    }
  } catch (error) {
    return { 
      success: false, 
      compressed: false, 
      message: `压缩失败: ${error.message}` 
    }
  }
})
