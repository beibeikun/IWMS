/**
 * IWMS 智能文件管理解决方案 - 主进程文件
 * 
 * 本文件是 Electron 应用的主进程，负责：
 * - 创建和管理主窗口
 * - 处理 IPC 通信
 * - 文件操作（重命名、压缩、扫描等）
 * - 多线程图片处理
 * - 应用生命周期管理
 * 
 * @author IWMS Team
 * @version 1.0.0
 */

// 导入 Electron 核心模块
const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
// 导入 Node.js 核心模块
const path = require('path')

// 导入第三方依赖
const fs = require('fs-extra')           // 增强的文件系统操作
const XLSX = require('xlsx')            // Excel 文件处理
const glob = require('fast-glob')       // 快速文件匹配

// Windows 平台 Sharp 模块特殊处理
let sharp
try {
  // 尝试直接加载 Sharp
  sharp = require('sharp')
  console.log('✅ Sharp 模块加载成功')
} catch (error) {
  console.error('❌ Sharp 模块加载失败:', error.message)
  
  // 如果是 Windows 平台，尝试特殊处理
  if (process.platform === 'win32') {
    try {
      // 设置 Sharp 环境变量
      process.env.SHARP_DIST_BASE_URL = 'https://github.com/lovell/sharp-libvips/releases/download/v8.17.1/'
      process.env.SHARP_IGNORE_GLOBAL_LIBVIPS = '1'
      
      // 重新尝试加载
      sharp = require('sharp')
      console.log('✅ Windows Sharp 模块加载成功')
    } catch (winError) {
      console.error('❌ Windows Sharp 模块加载失败:', winError.message)
      // 如果还是失败，创建一个模拟的 Sharp 对象
      sharp = {
        versions: { sharp: '0.34.3' },
        format: {},
        // 添加基本的错误处理方法
        resize: () => ({ toBuffer: () => Promise.reject(new Error('Sharp not available')) }),
        png: () => ({ toBuffer: () => Promise.reject(new Error('Sharp not available')) }),
        jpeg: () => ({ toBuffer: () => Promise.reject(new Error('Sharp not available')) })
      }
    }
  } else {
    // 非 Windows 平台，创建模拟对象
    sharp = {
      versions: { sharp: '0.34.3' },
      format: {},
      resize: () => ({ toBuffer: () => Promise.reject(new Error('Sharp not available')) }),
      png: () => ({ toBuffer: () => Promise.reject(new Error('Sharp not available')) }),
      jpeg: () => ({ toBuffer: () => Promise.reject(new Error('Sharp not available')) })
    }
  }
}

const { Worker, isMainThread, parentPort, workerData } = require('worker_threads')  // 多线程支持
const os = require('os')                // 操作系统信息

// 全局变量：主窗口实例
let mainWindow

/**
 * 创建主窗口
 * 
 * 负责：
 * - 配置窗口属性（尺寸、标题、图标等）
 * - 设置 Web 安全策略
 * - 加载前端页面
 * - 配置开发/生产环境
 * - 设置窗口显示时机
 */
function createWindow() {
  // 创建新的浏览器窗口实例
  mainWindow = new BrowserWindow({
    width: 1200,                        // 窗口宽度
    height: 1000,                       // 窗口高度
    show: false,                        // 延迟显示，避免白屏闪烁
    webPreferences: {
      nodeIntegration: false,            // 禁用 Node.js 集成（安全考虑）
      contextIsolation: true,            // 启用上下文隔离
      preload: path.join(__dirname, 'preload.js')  // 预加载脚本路径
    },
    title: 'IWMS',                      // 窗口标题
    icon: path.join(__dirname, '../assets/icon.png')  // 应用图标
  })

  // 检测是否为开发模式
  // 通过多种方式判断：环境变量、打包状态等
  const isDev = process.env.NODE_ENV === 'development' || 
                 process.env.IS_DEV === 'true' || 
                 !app.isPackaged

  if (isDev) {
    console.log('开发模式：连接到 Vite 开发服务器...')
    // 开发模式：连接到 Vite 开发服务器
    mainWindow.loadURL('http://localhost:5173')
    
    // 开发模式下打开开发者工具
    mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.openDevTools()
    })
  } else {
    console.log('生产模式：加载本地文件...')
    // 生产模式：加载打包后的本地文件
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // 改进的窗口显示逻辑
  // 等待页面内容加载完成后再显示窗口，避免白屏
  mainWindow.once('ready-to-show', () => {
    console.log('窗口准备就绪，显示窗口...')
    mainWindow.show()                    // 显示窗口
    mainWindow.focus()                   // 聚焦窗口
  })

  // 添加错误处理：页面加载失败时的处理逻辑
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('页面加载失败:', errorCode, errorDescription, validatedURL)
    
    if (isDev) {
      // 开发模式下，如果加载失败，等待一段时间后重试
      setTimeout(() => {
        console.log('尝试重新加载开发服务器...')
        mainWindow.loadURL('http://localhost:5173')
      }, 2000)
    }
  })

  // 添加加载状态监听，用于调试和状态跟踪
  mainWindow.webContents.on('did-start-loading', () => {
    console.log('开始加载页面...')
  })

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('页面加载完成')
  })
}

// 应用生命周期管理
// 当 Electron 完成初始化时创建窗口
app.whenReady().then(createWindow)

// 当所有窗口关闭时退出应用（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// macOS 应用激活事件处理
// 当应用被激活时，如果没有窗口则创建新窗口
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

/**
 * 预览文件变更
 * 在主进程中安全地预览文件重命名结果，避免在渲染进程中使用 Node.js 模块
 * 
 * @param {Object} event - IPC 事件对象
 * @param {Object} params - 预览参数
 * @param {Array} params.files - 文件路径数组
 * @param {Array} params.mapping - 文件名映射数组
 * @param {string} params.outputPath - 输出目录路径
 * @returns {Object} 预览结果和统计信息
 */
ipcMain.handle('preview-file-changes', async (event, { files, mapping, outputPath }) => {
  try {
    const mappingMap = new Map(mapping)
    const results = []
    let processedCount = 0
    let skippedCount = 0
    let conflictCount = 0
    
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
          const outputFilePath = path.join(outputPath, newFileName)
          
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
})

// ==================== IPC 通信处理器 ====================

/**
 * 选择文件夹对话框
 * 返回用户选择的文件夹路径
 */
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']        // 只允许选择文件夹
  })
  return result.filePaths[0] || null    // 返回第一个选择的路径或 null
})

/**
 * 选择 Excel 文件对话框
 * 返回用户选择的 Excel 文件路径
 */
ipcMain.handle('select-excel-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],           // 只允许选择文件
    filters: [
      { name: 'Excel文件', extensions: ['xlsx', 'xls', 'csv'] }  // 文件类型过滤器
    ]
  })
  return result.filePaths[0] || null
})

/**
 * 读取 Excel 映射文件
 * 
 * @param {Object} event - IPC 事件对象
 * @param {string} filePath - Excel 文件路径
 * @returns {Object} 包含映射数据和错误信息的对象
 */
ipcMain.handle('read-excel-mapping', async (event, filePath) => {
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
})

/**
 * 扫描指定目录中的文件
 * 
 * @param {Object} event - IPC 事件对象
 * @param {string} inputPath - 输入目录路径
 * @param {boolean} recursive - 是否递归扫描子目录
 * @param {Array} fileTypes - 文件类型过滤（目前支持 'image'）
 * @returns {Array} 符合条件的文件路径数组
 */
ipcMain.handle('scan-files', async (event, inputPath, recursive = false, fileTypes = ['image']) => {
  try {
    // 根据是否递归设置文件匹配模式
    const pattern = recursive ? '**/*.*' : '*.*'
    
    // 使用 fast-glob 扫描文件
    const files = await glob(pattern, {
      cwd: inputPath,                   // 基础目录
      absolute: true,                   // 返回绝对路径
      ignore: ['**/.*', '**/node_modules/**']  // 忽略隐藏文件和 node_modules
    })
    
    // 图片文件扩展名列表
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp', '.svg', '.ico']
    
    // 过滤文件：只保留符合条件的文件
    return files.filter(file => {
      const stat = fs.statSync(file)    // 获取文件状态
      if (!stat.isFile()) return false  // 只处理文件，忽略目录
      
      const ext = path.extname(file).toLowerCase()  // 获取文件扩展名
      
      if (fileTypes.includes('image')) {
        // 如果指定了图片类型，只返回图片文件
        return imageExtensions.includes(ext)
      }
      
      // 如果没有指定文件类型，则包含所有文件
      return true
    })
  } catch (error) {
    throw new Error(`扫描文件失败: ${error.message}`)
  }
})

/**
 * 处理文件批量操作
 * 
 * 支持文件重命名、冲突处理、图片压缩等功能
 * 
 * @param {Object} event - IPC 事件对象
 * @param {Object} params - 处理参数对象
 * @param {string} params.inputPath - 输入目录路径
 * @param {string} params.outputPath - 输出目录路径
 * @param {Map} params.mapping - 文件名映射表
 * @param {Array} params.files - 要处理的文件列表
 * @param {string} params.conflictStrategy - 冲突处理策略
 * @param {string} params.compressionMode - 压缩模式：'dimension' 或 'filesize'
 * @param {number} params.maxDimension - 最长边像素数（dimension模式）
 * @param {number} params.maxFileSize - 最大文件大小KB（filesize模式）
 * @returns {Object} 处理结果和统计信息
 */
ipcMain.handle('process-files', async (event, { inputPath, outputPath, mapping, files, conflictStrategy, compressionMode, maxDimension, maxFileSize }) => {
  const results = []                    // 存储每个文件的处理结果
  let processedCount = 0               // 成功处理的文件数
  let skippedCount = 0                 // 跳过的文件数
  let conflictCount = 0                // 冲突的文件数
  let errorCount = 0                   // 错误的文件数
  let compressedCount = 0              // 压缩的文件数
  let compressionTime = 0              // 压缩总耗时
  let threadsUsed = 1                  // 使用的线程数
  
  // 收集图片压缩任务，稍后批量处理
  const imageCompressionTasks = []
  
  // 确保输出目录存在
  await fs.ensureDir(outputPath)
  
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
      const fileName = path.basename(filePath)      // 获取文件名
      const { base, sequence, extension } = parseFileName(fileName)  // 解析文件名
      
      if (mappingMap.has(base)) {
        // 如果文件名在映射表中，进行重命名处理
        const newBase = mappingMap.get(base)           // 获取新文件名
        let newFileName = newBase
        
        // 保持原有的编号和扩展名
        if (sequence) {
          newFileName += ` (${sequence})`
        }
        
        if (extension) {
          newFileName += extension
        }
        
        const outputFilePath = path.join(outputPath, newFileName)
        
        // 初始化最终输出路径
        let finalOutputPath = outputFilePath
        
        // 检查文件名冲突
        if (await fs.pathExists(outputFilePath)) {
          conflictCount++
          
          if (conflictStrategy === 'append') {
            // 冲突策略：追加标识符
            let counter = 1
            while (await fs.pathExists(finalOutputPath)) {
              const nameWithoutExt = path.parse(newFileName).name
              const ext = path.parse(newFileName).ext
              finalOutputPath = path.join(outputPath, `${nameWithoutExt}_conflict-${counter}${ext}`)
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
          // 如果conflictStrategy是'overwrite'，finalOutputPath 保持为 outputFilePath
        }
        
        // 检查是否为图片文件且需要压缩
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp']
        const isImage = imageExtensions.includes(extension?.toLowerCase())
        
        if (isImage) {
          // 图片文件，添加到压缩任务中
          imageCompressionTasks.push({
            inputPath: filePath,
            outputPath: finalOutputPath,
            fileName: fileName,
            maxDimension: maxDimension,
            maxFileSize: maxFileSize
          })
          
          // 先添加一个占位结果，稍后会被压缩结果替换
          results.push({
            sourcePath: filePath,
            originalName: fileName,
            newName: path.basename(finalOutputPath),
            status: 'pending', // 标记为待处理
            message: '等待压缩处理'
          })
        } else {
          // 非图片文件，直接复制
          await fs.copy(filePath, finalOutputPath)
          results.push({
            sourcePath: filePath,
            originalName: fileName,
            newName: path.basename(finalOutputPath),
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
    
    if (compressionMode === 'dimension') {
      // 按尺寸压缩模式
      const compressionResult = await compressImagesBatchByDimension({
        imageTasks: imageCompressionTasks,
        maxDimension: maxDimension,
        useMultiThread: true
      })
      
      if (compressionResult.success) {
        // 将压缩结果转换为正确的格式，并替换占位结果
        for (const compressResult of compressionResult.results) {
          const task = imageCompressionTasks.find(t => t.inputPath === compressResult.filePath)
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
        compressionTime = compressionResult.totalTime
        threadsUsed = compressionResult.threadsUsed
      }
    } else if (compressionMode === 'filesize') {
      // 按文件大小压缩模式
      const compressionResult = await compressImagesBatch({
        imageTasks: imageCompressionTasks,
        maxFileSize: maxFileSize,
        useMultiThread: true
      })
      
      if (compressionResult.success) {
        // 将压缩结果转换为正确的格式，并替换占位结果
        for (const compressResult of compressionResult.results) {
          const task = imageCompressionTasks.find(t => t.inputPath === compressResult.filePath)
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
        compressionTime = compressionResult.totalTime
        threadsUsed = compressionResult.threadsUsed
      }
    }
  }
  
  // 返回处理结果和统计信息
  return {
    results,
    summary: {
      processed: processedCount,        // 成功处理
      skipped: skippedCount,            // 跳过
      conflicts: conflictCount,         // 冲突
      errors: errorCount,               // 错误
      compressed: compressedCount,      // 压缩
      compressionTime: compressionTime, // 压缩耗时
      threadsUsed: threadsUsed,        // 使用线程数
      total: files.length               // 总文件数
    }
  }
})

/**
 * 解析文件名，提取主名、编号和扩展名
 * 
 * 支持的文件名格式：
 * - filename (1).ext  - 带编号的文件
 * - filename.ext       - 普通文件
 * - filename          - 无扩展名文件
 * 
 * @param {string} fileName - 要解析的文件名
 * @returns {Object} 包含 base、sequence、extension 的对象
 */
function parseFileName(fileName) {
  // 匹配带编号的文件名: filename (1).ext
  const numberedPattern = /^(.+?)\s*\((\d+)\)(\.[^.]+)$/
  const match = fileName.match(numberedPattern)
  
  if (match) {
    return {
      base: match[1].trim(),            // 主文件名
      sequence: match[2],               // 编号
      extension: match[3]               // 扩展名
    }
  }
  
  // 匹配不带编号的文件名: filename.ext
  const simplePattern = /^(.+?)(\.[^.]+)$/
  const simpleMatch = fileName.match(simplePattern)
  
  if (simpleMatch) {
    return {
      base: simpleMatch[1].trim(),      // 主文件名
      sequence: null,                   // 无编号
      extension: simpleMatch[2]         // 扩展名
    }
  }
  
  // 无扩展名的情况
  return {
    base: fileName,                     // 整个文件名作为主名
    sequence: null,                     // 无编号
    extension: ''                       // 无扩展名
  }
}

/**
 * 导出处理结果到 CSV 文件
 * 
 * @param {Object} event - IPC 事件对象
 * @param {Array} results - 处理结果数组
 * @param {string} outputPath - 输出目录路径
 * @returns {string} 生成的报告文件路径
 */
ipcMain.handle('export-results', async (event, results, outputPath) => {
  try {
    // 构建 CSV 内容
    const csvContent = [
      '源文件路径,原文件名,新文件名,处理状态,备注/错误信息'
    ]
    
    // 添加每一行的数据
    for (const result of results) {
      csvContent.push([
        result.sourcePath,               // 源文件路径
        result.originalName,             // 原文件名
        result.newName,                  // 新文件名
        result.status,                   // 处理状态
        result.message                   // 备注或错误信息
      ].map(field => `"${field}"`).join(','))
    }
    
    // 生成带时间戳的报告文件名
    const reportPath = path.join(outputPath, `处理报告_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`)
    await fs.writeFile(reportPath, csvContent.join('\n'), 'utf8')
    
    return reportPath
  } catch (error) {
    throw new Error(`导出报告失败: ${error.message}`)
  }
})

/**
 * 批量图片压缩功能（按文件体积压缩）
 * 
 * 支持批量处理多张图片，可选择单线程或多线程模式
 * 多线程模式会根据 CPU 核心数自动调整线程数量
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
          originalSize: { width: 0, height: 0, sizeKB: 0 }, // 无图片信息
          newSize: { width: 0, height: 0, sizeKB: 0 }, // 无图片信息
          message: '未压缩，直接复制',
          filePath: task.inputPath
        })
      }
      return { success: true, results, totalTime: 0, threadsUsed: 1 }
    }

    if (!useMultiThread || imageTasks.length <= 2) {
      // 单线程处理：适用于少量文件或禁用多线程的情况
      const startTime = Date.now()
      const results = []
      
      for (const task of imageTasks) {
        try {
          // 获取原文件大小
          const originalStats = await fs.stat(task.inputPath)
          const originalSizeKB = Math.round(originalStats.size / 1024)
          
          // 如果原文件已经小于目标大小，直接复制
          if (originalSizeKB <= maxFileSize) {
            await fs.copy(task.inputPath, task.outputPath)
            results.push({
              success: true,
              compressed: false,
              originalSize: { width: 0, height: 0, sizeKB: originalSizeKB },
              newSize: { width: 0, height: 0, sizeKB: originalSizeKB },
              message: `文件已小于目标大小(${maxFileSize}KB)，无需压缩`,
              filePath: task.inputPath
            })
            continue
          }

          const image = sharp(task.inputPath)
          const metadata = await image.metadata()
          
          let { width, height } = metadata
          let quality = 85
          let compressedSizeKB = originalSizeKB
          
          // 逐步调整质量和尺寸，直到文件大小符合要求
          while (compressedSizeKB > maxFileSize && quality > 10) {
            // 如果质量已经很低，开始缩小尺寸
            if (quality <= 30) {
              width = Math.round(width * 0.9)
              height = Math.round(height * 0.9)
              // 如果尺寸太小，停止压缩
              if (width < 100 || height < 100) {
                break
              }
            }
            
            // 压缩图片：调整尺寸并转换为 JPEG 格式
            await image
              .resize(width, height, {
                fit: 'inside',             // 保持宽高比，不放大
                withoutEnlargement: true   // 不放大图片
              })
              .jpeg({ quality })          // 转换为 JPEG，动态调整质量
              .toFile(task.outputPath)
            
            // 检查压缩后的文件大小
            const compressedStats = await fs.stat(task.outputPath)
            compressedSizeKB = Math.round(compressedStats.size / 1024)
            
            // 如果还是太大，降低质量
            if (compressedSizeKB > maxFileSize) {
              quality -= 5
            }
          }
          
          results.push({
            success: true,
            compressed: true,
            originalSize: { width: metadata.width, height: metadata.height, sizeKB: originalSizeKB },
            newSize: { width, height, sizeKB: compressedSizeKB },
            message: `压缩完成: ${originalSizeKB}KB → ${compressedSizeKB}KB (${width}x${height}, 质量:${quality}%)`,
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
      return { success: true, results, totalTime, threadsUsed: 1 }
    }

    // 多线程处理：适用于大量文件的情况
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
          // 创建 Worker 线程处理图片压缩
          const worker = new Worker(`
            const { parentPort, workerData } = require('worker_threads');
            const sharp = require('sharp');
            const fs = require('fs-extra');
            
            async function compressImages(tasks, maxFileSize) {
              const results = [];
              
              for (const task of tasks) {
                try {
                  const image = sharp(task.inputPath);
                  const metadata = await image.metadata();
                  
                  let { width, height } = metadata;
                  
                  // 获取原文件大小
                  const originalStats = await fs.stat(task.inputPath);
                  const originalSizeKB = Math.round(originalStats.size / 1024);
                  
                  // 如果原文件已经小于目标大小，直接复制
                  if (originalSizeKB <= maxFileSize) {
                    await fs.copy(task.inputPath, task.outputPath);
                    results.push({
                      success: true,
                      compressed: false,
                      originalSize: { width: 0, height: 0, sizeKB: originalSizeKB },
                      newSize: { width: 0, height: 0, sizeKB: originalSizeKB },
                      message: \`文件已小于目标大小(\${maxFileSize}KB)，无需压缩\`,
                      filePath: task.inputPath
                    });
                    continue;
                  }

                  let quality = 85;
                  let compressedSizeKB = originalSizeKB;
                  
                  // 逐步调整质量和尺寸，直到文件大小符合要求
                  while (compressedSizeKB > maxFileSize && quality > 10) {
                    // 如果质量已经很低，开始缩小尺寸
                    if (quality <= 30) {
                      width = Math.round(width * 0.9);
                      height = Math.round(height * 0.9);
                      // 如果尺寸太小，停止压缩
                      if (width < 100 || height < 100) {
                        break;
                      }
                    }
                    
                    // 压缩图片：调整尺寸并转换为 JPEG 格式
                    await image
                      .resize(width, height, {
                        fit: 'inside',             // 保持宽高比，不放大
                        withoutEnlargement: true   // 不放大图片
                      })
                      .jpeg({ quality })          // 转换为 JPEG，动态调整质量
                      .toFile(task.outputPath);
                    
                    // 检查压缩后的文件大小
                    const compressedStats = await fs.stat(task.outputPath);
                    compressedSizeKB = Math.round(compressedStats.size / 1024);
                    
                    // 如果还是太大，降低质量
                    if (compressedSizeKB > maxFileSize) {
                      quality -= 5;
                    }
                  }
                  
                  results.push({
                    success: true,
                    compressed: true,
                    originalSize: { width: metadata.width, height: metadata.height, sizeKB: originalSizeKB },
                    newSize: { width, height, sizeKB: compressedSizeKB },
                    message: \`压缩完成: \${originalSizeKB}KB → \${compressedSizeKB}KB (\${width}x\${height}, 质量:\${quality}%)\`,
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
            
            compressImages(workerData.tasks, workerData.maxFileSize)
              .then(results => parentPort.postMessage(results))
              .catch(error => parentPort.postMessage({ error: error.message }));
          `, {
            eval: true,
            workerData: { tasks: threadTasks, maxFileSize }
          });
          
          // 处理 Worker 消息
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
    
    // 合并所有线程的结果
    for (const threadResult of threadResults) {
      results.push(...threadResult);
    }
    
    const totalTime = Date.now() - startTime
    return { success: true, results, totalTime, threadsUsed: numThreads }
    
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      results: [],
      totalTime: 0,
      threadsUsed: 0
    }
  }
}

/**
 * 批量图片压缩功能（按尺寸压缩）
 * 
 * 支持批量处理多张图片，可选择单线程或多线程模式
 * 多线程模式会根据 CPU 核心数自动调整线程数量
 * 
 * @param {Object} params - 压缩参数
 * @param {Array} params.imageTasks - 图片任务数组
 * @param {number} params.maxDimension - 最大尺寸限制（像素）
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
          message: '未压缩，直接复制',
          filePath: task.inputPath
        })
      }
      return { success: true, results, totalTime: 0, threadsUsed: 1 }
    }

    if (!useMultiThread || imageTasks.length <= 2) {
      // 单线程处理：适用于少量文件或禁用多线程的情况
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
          
          // 压缩图片：调整尺寸并转换为 JPEG 格式
          await image
            .resize(width, height, {
              fit: 'inside',             // 保持宽高比，不放大
              withoutEnlargement: true   // 不放大图片
            })
            .jpeg({ quality: 85 })      // 转换为 JPEG，质量 85%
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
      return { success: true, results, totalTime, threadsUsed: 1 }
    }

    // 多线程处理：适用于大量文件的情况
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
          // 创建 Worker 线程处理图片压缩
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
                  
                  // 压缩图片：调整尺寸并转换为 JPEG 格式
                  await image
                    .resize(width, height, {
                      fit: 'inside',             // 保持宽高比，不放大
                      withoutEnlargement: true   // 不放大图片
                    })
                    .jpeg({ quality: 85 })      // 转换为 JPEG，质量 85%
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
          
          // 处理 Worker 消息
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
    
    // 合并所有线程的结果
    for (const threadResult of threadResults) {
      results.push(...threadResult);
    }
    
    const totalTime = Date.now() - startTime
    return { success: true, results, totalTime, threadsUsed: numThreads }
    
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      results: [],
      totalTime: 0,
      threadsUsed: 0
    }
  }
}

/**
 * 多线程图片压缩功能
 * 
 * 支持批量处理多张图片，可选择单线程或多线程模式
 * 多线程模式会根据 CPU 核心数自动调整线程数量
 * 
 * @param {Object} event - IPC 事件对象
 * @param {Object} params - 压缩参数
 * @param {Array} params.imageTasks - 图片任务数组
 * @param {number} params.maxDimension - 最大尺寸限制
 * @param {boolean} params.useMultiThread - 是否使用多线程
 * @returns {Object} 压缩结果和统计信息
 */
ipcMain.handle('compress-images-batch', async (event, params) => {
  return await compressImagesBatch(params)
})

/**
 * 单张图片压缩功能（按文件体积压缩）
 * 
 * 这是为了保持向后兼容性而保留的接口
 * 新代码建议使用 compress-images-batch 进行批量处理
 * 
 * @param {Object} event - IPC 事件对象
 * @param {Object} params - 压缩参数
 * @param {string} params.inputPath - 输入图片路径
 * @param {string} params.outputPath - 输出图片路径
 * @param {number} params.maxFileSize - 最大文件大小（KB）
 * @returns {Object} 压缩结果
 */
ipcMain.handle('compress-image', async (event, { inputPath, outputPath, maxFileSize }) => {
  try {
    if (!maxFileSize || maxFileSize <= 0) {
      // 不压缩，直接复制
      await fs.copy(inputPath, outputPath)
      return { success: true, compressed: false, message: '未压缩，直接复制' }
    }

    // 获取原文件大小
    const originalStats = await fs.stat(inputPath)
    const originalSizeKB = Math.round(originalStats.size / 1024)
    
    // 如果原文件已经小于目标大小，直接复制
    if (originalSizeKB <= maxFileSize) {
      await fs.copy(inputPath, outputPath)
      return { 
        success: true, 
        compressed: false, 
        originalSize: { width: 0, height: 0, sizeKB: originalSizeKB },
        newSize: { width: 0, height: 0, sizeKB: originalSizeKB },
        message: `文件已小于目标大小(${maxFileSize}KB)，无需压缩` 
      }
    }

    // 获取图片信息
    const image = sharp(inputPath)
    const metadata = await image.metadata()
    
    let { width, height } = metadata
    let quality = 85
    let compressedSizeKB = originalSizeKB
    
    // 逐步调整质量和尺寸，直到文件大小符合要求
    while (compressedSizeKB > maxFileSize && quality > 10) {
      // 如果质量已经很低，开始缩小尺寸
      if (quality <= 30) {
        width = Math.round(width * 0.9)
        height = Math.round(height * 0.9)
        // 如果尺寸太小，停止压缩
        if (width < 100 || height < 100) {
          break
      }
    }
    
    // 压缩图片
    await image
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
        .jpeg({ quality })
      .toFile(outputPath)
      
      // 检查压缩后的文件大小
      const compressedStats = await fs.stat(outputPath)
      compressedSizeKB = Math.round(compressedStats.size / 1024)
      
      // 如果还是太大，降低质量
      if (compressedSizeKB > maxFileSize) {
        quality -= 5
      }
    }
    
    return { 
      success: true, 
      compressed: true, 
      originalSize: { width: metadata.width, height: metadata.height, sizeKB: originalSizeKB },
      newSize: { width, height, sizeKB: compressedSizeKB },
      message: `压缩完成: ${originalSizeKB}KB → ${compressedSizeKB}KB (${width}x${height}, 质量:${quality}%)`
    }
  } catch (error) {
    return { 
      success: false, 
      compressed: false, 
      message: `压缩失败: ${error.message}` 
    }
  }
})

/**
 * 打开文件夹
 * 
 * 使用系统默认的文件管理器打开指定路径的文件夹
 * 支持跨平台（Windows、macOS、Linux）
 * 
 * @param {Object} event - IPC 事件对象
 * @param {string} folderPath - 要打开的文件夹路径
 * @returns {Object} 操作结果
 */
ipcMain.handle('open-folder', async (event, folderPath) => {
  try {
    // 检查路径是否存在
    if (!await fs.pathExists(folderPath)) {
      return { 
        success: false, 
        error: '文件夹路径不存在' 
      }
    }
    
    // 使用系统默认的文件管理器打开文件夹
    await shell.openPath(folderPath)
    
    return { 
      success: true, 
      message: '文件夹已打开' 
    }
  } catch (error) {
    return { 
      success: false, 
      error: `打开文件夹失败: ${error.message}` 
    }
  }
})
