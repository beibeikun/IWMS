/**
 * 配置代理文件
 * 
 * 使用配置管理器，支持实时更新
 * 
 * @author IWMS Team
 * @version 1.0.0
 */

// 使用配置管理器
const configManager = require('./configManager')

// 导出配置管理器的当前配置
module.exports = configManager.getCurrentConfig()
