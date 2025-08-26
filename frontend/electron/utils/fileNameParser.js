/**
 * 文件名解析工具模块
 * 
 * 支持的文件名格式：
 * - filename (1).ext  - 带编号的文件
 * - filename.ext       - 普通文件
 * - filename          - 无扩展名文件
 * 
 * @author IWMS Team
 * @version 1.0.0
 */

/**
 * 解析文件名，提取主名、编号和扩展名
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

module.exports = {
  parseFileName
}
