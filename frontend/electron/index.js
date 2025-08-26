/**
 * IWMS 模块索引文件
 * 
 * 统一导出所有功能模块
 * 便于管理和维护
 * 
 * @author IWMS Team
 * @version 2.0.0
 */

// 工具模块
const fileNameParser = require('./utils/fileNameParser')
const fileScanner = require('./utils/fileScanner')
const excelProcessor = require('./utils/excelProcessor')
const reportExporter = require('./utils/reportExporter')

// 服务模块
const renameService = require('./services/renameService')

// 主进程
const main = require('./main')

module.exports = {
  // 工具模块
  utils: {
    fileNameParser,
    fileScanner,
    excelProcessor,
    reportExporter
  },
  
  // 服务模块
  services: {
    renameService
  },
  
  // 主进程
  main
}
