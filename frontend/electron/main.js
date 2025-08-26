/**
 * IWMS 智能文件管理解决方案 - 主进程
 * 
 * 重构后的模块化主进程文件
 * 负责IPC通信和窗口管理
 * 
 * @author IWMS Team
 * @version 2.0.0
 */

const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs-extra')

// 导入模块化服务
const { scanDirectory } = require('./utils/fileScanner.js')
const { readExcelMapping } = require('./utils/excelProcessor.js')
const { previewFileChanges, processFiles } = require('./services/renameService.js')
const { exportResultsToCSV } = require('./utils/reportExporter.js')

let mainWindow

/**
 * 创建主窗口
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    title: 'IWMS - 智能文件管理解决方案'
  })

  // 加载应用
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // 窗口关闭事件
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

/**
 * 应用就绪事件
 */
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

/**
 * 所有窗口关闭事件
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// ==================== IPC 通信处理 ====================

/**
 * 选择文件夹
 */
ipcMain.handle('select-folder', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: '选择文件夹'
    })
    
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0]
    }
    return null
  } catch (error) {
    throw new Error(`选择文件夹失败: ${error.message}`)
  }
})

/**
 * 选择文件
 */
ipcMain.handle('select-file', async (event, options = {}) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      title: options.title || '选择文件',
      filters: options.filters || [
        { name: 'Excel文件', extensions: ['xlsx', 'xls'] },
        { name: '所有文件', extensions: ['*'] }
      ]
    })
    
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0]
    }
    return null
  } catch (error) {
    throw new Error(`选择文件失败: ${error.message}`)
  }
})

/**
 * 选择Excel文件（保持向后兼容性）
 */
ipcMain.handle('select-excel-file', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      title: '选择Excel文件',
      filters: [
        { name: 'Excel文件', extensions: ['xlsx', 'xls', 'csv'] }
      ]
    })
    
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0]
    }
    return null
  } catch (error) {
    throw new Error(`选择Excel文件失败: ${error.message}`)
  }
})

/**
 * 扫描目录
 */
ipcMain.handle('scan-directory', async (event, { inputPath, recursive, fileTypes }) => {
  try {
    const files = await scanDirectory(inputPath, recursive, fileTypes)
    return files
  } catch (error) {
    throw new Error(`扫描目录失败: ${error.message}`)
  }
})

/**
 * 扫描文件（保持向后兼容性）
 */
ipcMain.handle('scan-files', async (event, inputPath, recursive, fileTypes) => {
  try {
    const files = await scanDirectory(inputPath, recursive, fileTypes)
    return files
  } catch (error) {
    throw new Error(`扫描文件失败: ${error.message}`)
  }
})

/**
 * 读取Excel映射文件
 */
ipcMain.handle('read-excel-mapping', async (event, filePath) => {
  try {
    return await readExcelMapping(filePath)
  } catch (error) {
    throw new Error(`读取Excel文件失败: ${error.message}`)
  }
})

/**
 * 预览文件变更
 */
ipcMain.handle('preview-file-changes', async (event, params) => {
  try {
    return await previewFileChanges(params)
  } catch (error) {
    throw new Error(`预览文件变更失败: ${error.message}`)
  }
})

/**
 * 处理文件（执行重命名）
 */
ipcMain.handle('process-files', async (event, params) => {
  try {
    return await processFiles(params)
  } catch (error) {
    throw new Error(`处理文件失败: ${error.message}`)
  }
})

/**
 * 导出处理结果
 */
ipcMain.handle('export-results', async (event, results, outputPath) => {
  try {
    console.log('export-results: 开始导出，参数:', { 
      resultsType: typeof results, 
      resultsLength: results?.length, 
      outputPath,
      resultsSample: results?.slice(0, 2) // 只记录前两个样本用于调试
    })
    
    // 验证输入参数
    if (!results) {
      console.warn('export-results: results 参数为空')
      return {
        success: false,
        error: '结果数据为空',
        message: '没有可导出的数据'
      }
    }
    
    if (!outputPath) {
      console.warn('export-results: outputPath 参数为空')
      return {
        success: false,
        error: '输出路径为空',
        message: '请选择输出目录'
      }
    }
    
    const reportPath = await exportResultsToCSV(results, outputPath, 'execution')
    
    if (reportPath) {
      console.log('export-results: 导出成功:', reportPath)
      return {
        success: true,
        reportPath: reportPath,
        message: '报告导出成功'
      }
    } else {
      console.log('export-results: 导出失败，返回null')
      return {
        success: false,
        error: '导出函数返回null',
        message: '报告导出失败'
      }
    }
  } catch (error) {
    console.error('export-results: 捕获到异常:', error.message, error.stack)
    return {
      success: false,
      error: error.message,
      message: '报告导出失败'
    }
  }
})

/**
 * 打开文件夹
 */
ipcMain.handle('open-folder', async (event, folderPath) => {
  try {
    const { shell } = require('electron')
    await shell.openPath(folderPath)
    return {
      success: true,
      message: '文件夹已打开'
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
})

/**
 * 获取应用版本
 */
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

/**
 * 获取系统信息
 */
ipcMain.handle('get-system-info', () => {
  const os = require('os')
  return {
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    electronVersion: process.versions.electron,
    osType: os.type(),
    osRelease: os.release(),
    totalMemory: Math.round(os.totalmem() / (1024 * 1024 * 1024)), // GB
    freeMemory: Math.round(os.freemem() / (1024 * 1024 * 1024)),   // GB
    cpuCores: os.cpus().length
  }
})

// ==================== 系统设置相关 ====================

/**
 * 保存系统设置
 */
ipcMain.handle('save-settings', async (event, settings) => {
  try {
    const settingsPath = path.join(app.getPath('userData'), 'settings.json')
    await fs.writeJson(settingsPath, settings, { spaces: 2 })
    return {
      success: true,
      message: '设置保存成功'
    }
  } catch (error) {
    console.error('保存设置失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
})

/**
 * 加载系统设置
 */
ipcMain.handle('load-settings', async () => {
  try {
    const settingsPath = path.join(app.getPath('userData'), 'settings.json')
    
    if (await fs.pathExists(settingsPath)) {
      const settings = await fs.readJson(settingsPath)
      return settings
    }
    
    // 返回默认设置
    return {
      defaultOutputPath: '',
      defaultCompressionMode: 'dimension',
      defaultMaxDimension: 1920,
      defaultMaxFileSize: 500,
      defaultFileTypes: 'image',
      defaultRecursive: true,
      defaultConflictStrategy: 'skip',
      useMultiThread: true,
      sidebarCollapsed: false,
      autoSaveSettings: true
    }
  } catch (error) {
    console.error('加载设置失败:', error)
    return null
  }
})

/**
 * 导出系统设置
 */
ipcMain.handle('export-settings', async (event, settings) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: '导出系统设置',
      defaultPath: 'iwms-settings.json',
      filters: [
        { name: 'JSON文件', extensions: ['json'] },
        { name: '所有文件', extensions: ['*'] }
      ]
    })
    
    if (!result.canceled && result.filePath) {
      await fs.writeJson(result.filePath, settings, { spaces: 2 })
      return {
        success: true,
        message: '设置导出成功'
      }
    }
    
    return {
      success: false,
      message: '用户取消导出'
    }
  } catch (error) {
    console.error('导出设置失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
})

/**
 * 导入系统设置
 */
ipcMain.handle('import-settings', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: '导入系统设置',
      filters: [
        { name: 'JSON文件', extensions: ['json'] },
        { name: '所有文件', extensions: ['*'] }
      ],
      properties: ['openFile']
    })
    
    if (!result.canceled && result.filePaths.length > 0) {
      const settingsPath = result.filePaths[0]
      const settings = await fs.readJson(settingsPath)
      return settings
    }
    
    return null
  } catch (error) {
    console.error('导入设置失败:', error)
    throw new Error(error.message)
  }
})

// ==================== 错误处理 ====================

/**
 * 未捕获的异常处理
 */
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error)
  
  if (mainWindow) {
    mainWindow.webContents.send('uncaught-exception', {
      message: error.message,
      stack: error.stack
    })
  }
})

/**
 * 未处理的Promise拒绝处理
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason)
  
  if (mainWindow) {
    mainWindow.webContents.send('unhandled-rejection', {
      reason: reason?.message || String(reason),
      promise: promise
    })
  }
})

// ==================== 开发模式支持 ====================

if (process.env.NODE_ENV === 'development') {
  // 开发模式下的额外功能
  ipcMain.handle('dev-reload', () => {
    if (mainWindow) {
      mainWindow.reload()
    }
  })
  
  ipcMain.handle('dev-open-devtools', () => {
    if (mainWindow) {
      mainWindow.webContents.openDevTools()
    }
  })
}
