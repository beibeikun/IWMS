/**
 * IWMS 智能文件管理解决方案 - 预加载脚本
 * 
 * 本文件是 Electron 应用的预加载脚本，负责：
 * - 在渲染进程中暴露安全的 Node.js API
 * - 建立主进程和渲染进程之间的通信桥梁
 * - 提供文件系统操作的安全接口
 * - 确保渲染进程的安全性
 * 
 * @author IWMS Team
 * @version 1.0.0
 */

// 导入 Electron 的 contextBridge 和 ipcRenderer
const { contextBridge, ipcRenderer } = require('electron')

// 使用 contextBridge 在渲染进程中暴露安全的 API
// 这样可以避免直接暴露 Node.js 模块，提高安全性
contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * 选择文件夹
   * 打开系统文件夹选择对话框，返回用户选择的文件夹路径
   * 
   * @returns {Promise<string|null>} 选择的文件夹路径，如果取消则返回 null
   */
  selectFolder: () => ipcRenderer.invoke('select-folder'),

  /**
   * 选择 Excel 文件
   * 打开系统文件选择对话框，只允许选择 Excel 相关文件
   * 
   * @returns {Promise<string|null>} 选择的文件路径，如果取消则返回 null
   */
  selectExcelFile: () => ipcRenderer.invoke('select-excel-file'),

  /**
   * 读取 Excel 映射文件
   * 解析 Excel 文件内容，提取文件名映射关系
   * 
   * @param {string} filePath - Excel 文件路径
   * @returns {Promise<Object>} 包含映射数据和错误信息的对象
   */
  readExcelMapping: (filePath) => ipcRenderer.invoke('read-excel-mapping', filePath),

  /**
   * 扫描文件
   * 扫描指定目录中的文件，支持递归扫描和文件类型过滤
   * 
   * @param {string} inputPath - 输入目录路径
   * @param {boolean} recursive - 是否递归扫描子目录
   * @param {Array} fileTypes - 文件类型过滤数组
   * @returns {Promise<Array>} 符合条件的文件路径数组
   */
  scanFiles: (inputPath, recursive, fileTypes) => ipcRenderer.invoke('scan-files', inputPath, recursive, fileTypes),

  /**
   * 处理文件
   * 执行文件批量操作，包括重命名、压缩等
   * 
   * @param {Object} params - 处理参数对象
   * @param {string} params.inputPath - 输入目录路径
   * @param {string} params.outputPath - 输出目录路径
   * @param {Map} params.mapping - 文件名映射表
   * @param {Array} params.files - 要处理的文件列表
   * @param {string} params.conflictStrategy - 冲突处理策略
   * @param {string} params.compressionMode - 压缩模式：'dimension' 或 'filesize'
   * @param {number} params.maxDimension - 最长边像素数（dimension模式）
   * @param {number} params.maxFileSize - 最大文件大小（KB）（filesize模式）
   * @returns {Promise<Object>} 处理结果和统计信息
   */
  processFiles: (params) => ipcRenderer.invoke('process-files', params),

  /**
   * 导出结果
   * 将处理结果导出为 CSV 格式的报告文件
   * 
   * @param {Array} results - 处理结果数组
   * @param {string} outputPath - 输出目录路径
   * @returns {Promise<string>} 生成的报告文件路径
   */
  exportResults: (results, outputPath) => ipcRenderer.invoke('export-results', results, outputPath),

  /**
   * 压缩图片（批量）
   * 批量压缩图片文件，支持多线程处理
   * 
   * @param {Object} params - 压缩参数对象
   * @param {Array} params.imageTasks - 图片任务数组
   * @param {number} params.maxFileSize - 最大文件大小（KB）
   * @param {boolean} params.useMultiThread - 是否使用多线程
   * @returns {Promise<Object>} 压缩结果和统计信息
   */
  compressImagesBatch: (params) => ipcRenderer.invoke('compress-images-batch', params),

  /**
   * 压缩图片（单张）
   * 压缩单张图片文件（保持向后兼容性）
   * 
   * @param {Object} params - 压缩参数对象
   * @param {string} params.inputPath - 输入图片路径
   * @param {string} params.outputPath - 输出图片路径
   * @param {number} params.maxFileSize - 最大文件大小（KB）
   * @returns {Promise<Object>} 压缩结果
   */
  compressImage: (params) => ipcRenderer.invoke('compress-image', params),

  /**
   * 预览文件变更
   * 在渲染进程中安全地预览文件重命名结果，避免使用 Node.js 模块
   * 
   * @param {Object} params - 预览参数对象
   * @param {Array} params.files - 文件路径数组
   * @param {Array} params.mapping - 文件名映射数组
   * @param {string} params.outputPath - 输出目录路径
   * @returns {Promise<Object>} 预览结果和统计信息
   */
  previewFileChanges: (params) => ipcRenderer.invoke('preview-file-changes', params),

  /**
   * 打开文件夹
   * 使用系统默认的文件管理器打开指定路径的文件夹
   * 
   * @param {string} folderPath - 要打开的文件夹路径
   * @returns {Promise<Object>} 操作结果
   */
  openFolder: (folderPath) => ipcRenderer.invoke('open-folder', folderPath),

  // ==================== 系统设置相关 API ====================

  /**
   * 保存系统设置
   * 将用户设置保存到本地配置文件
   * 
   * @param {Object} settings - 设置对象
   * @returns {Promise<Object>} 保存结果
   */
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),

  /**
   * 加载系统设置
   * 从本地配置文件加载用户设置
   * 
   * @returns {Promise<Object>} 设置对象
   */
  loadSettings: () => ipcRenderer.invoke('load-settings'),

  /**
   * 导出系统设置
   * 将当前设置导出为JSON文件
   * 
   * @param {Object} settings - 要导出的设置对象
   * @returns {Promise<Object>} 导出结果
   */
  exportSettings: (settings) => ipcRenderer.invoke('export-settings', settings),

  /**
   * 导入系统设置
   * 从JSON文件导入设置
   * 
   * @returns {Promise<Object>} 导入的设置对象
   */
  importSettings: () => ipcRenderer.invoke('import-settings')
})
