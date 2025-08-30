#!/usr/bin/env node

/**
 * 实际场景测试脚本
 * 
 * 模拟实际使用场景中的前缀分组功能
 * 
 * @author IWMS Team
 * @version 1.0.0
 */

const path = require('path')
const fs = require('fs-extra')
const { organizeFiles } = require('../electron/utils/fileOrganizer.js')

console.log('🧪 开始实际场景测试...\n')

async function testRealScenario() {
  const testDir = path.join(__dirname, '../test-files')
  
  try {
    // 创建测试目录
    await fs.ensureDir(testDir)
    console.log(`📁 创建测试目录: ${testDir}`)
    
    // 创建测试文件
    const testFiles = [
      'A-1.JPG',
      'A-1 (1).JPG', 
      'A-1 (2).JPG',
      'B-3 (1).JPG',
      'B-3 (2).JPG'
    ]
    
    console.log('📄 创建测试文件...')
    for (const fileName of testFiles) {
      const filePath = path.join(testDir, fileName)
      await fs.writeFile(filePath, 'test content')
      console.log(`  ✅ 创建文件: ${fileName}`)
    }
    
    // 获取文件列表
    const files = []
    for (const fileName of testFiles) {
      const filePath = path.join(testDir, fileName)
      const stats = await fs.stat(filePath)
      files.push({
        name: fileName,
        path: filePath,
        size: stats.size,
        type: path.extname(fileName).toLowerCase(),
        extension: path.extname(fileName).toLowerCase(),
        mtime: stats.mtime,
        ctime: stats.ctime
      })
    }
    
    console.log(`\n📊 文件统计: ${files.length} 个文件`)
    
    // 测试1: 只重命名，不分组
    console.log('\n🔍 测试1: 只重命名，不分组')
    const result1 = await organizeFiles(files, testDir, {
      primaryNoIndex: true,
      groupByPrefix: false
    })
    
    console.log('结果1:', {
      success: result1.success,
      renamedFiles: result1.stats.renamedFiles,
      failedFiles: result1.stats.failedFiles,
      prefixGrouping: result1.stats.prefixGrouping
    })
    
    // 测试2: 重命名 + 前缀分组
    console.log('\n🔍 测试2: 重命名 + 前缀分组')
    const result2 = await organizeFiles(files, testDir, {
      primaryNoIndex: true,
      groupByPrefix: true,
      recursive: false,
      conflictPolicy: 'keep',
      sanitizeFolderName: true,
      caseSensitivePrefix: false,
      logMoveCsv: true
    })
    
    console.log('结果2:', {
      success: result2.success,
      renamedFiles: result2.stats.renamedFiles,
      failedFiles: result2.stats.failedFiles,
      prefixGrouping: result2.stats.prefixGrouping
    })
    
    if (result2.stats.prefixGrouping) {
      console.log('前缀分组统计:')
      console.log(`  - 移动文件数: ${result2.stats.prefixGrouping.movedFiles}`)
      console.log(`  - 跳过文件数: ${result2.stats.prefixGrouping.skippedFiles}`)
      console.log(`  - 失败文件数: ${result2.stats.prefixGrouping.failedFiles}`)
      console.log(`  - 创建文件夹数: ${result2.stats.prefixGrouping.createdFolders}`)
    }
    
    // 检查目录结构
    console.log('\n📁 检查目录结构:')
    const items = await fs.readdir(testDir, { withFileTypes: true })
    for (const item of items) {
      if (item.isDirectory()) {
        console.log(`  📂 ${item.name}/`)
        const subItems = await fs.readdir(path.join(testDir, item.name))
        subItems.forEach(subItem => console.log(`    - ${subItem}`))
      } else {
        console.log(`  📄 ${item.name}`)
      }
    }
    
    // 检查移动日志
    const logPath = path.join(testDir, 'move_log.csv')
    if (await fs.pathExists(logPath)) {
      console.log('\n📋 移动日志内容:')
      const logContent = await fs.readFile(logPath, 'utf8')
      console.log(logContent)
    }
    
    console.log('\n🎉 测试完成！')
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message)
    console.error('错误堆栈:', error.stack)
  } finally {
    // 清理测试文件
    try {
      await fs.remove(testDir)
      console.log('\n🧹 清理测试文件完成')
    } catch (error) {
      console.log('\n⚠️  清理测试文件失败:', error.message)
    }
  }
}

// 运行测试
testRealScenario()
