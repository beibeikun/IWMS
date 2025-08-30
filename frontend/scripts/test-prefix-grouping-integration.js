#!/usr/bin/env node

/**
 * 前缀分组功能集成测试脚本
 * 
 * 测试前缀分组功能在实际环境中的工作情况
 * 
 * @author IWMS Team
 * @version 1.0.0
 */

const path = require('path')
const { organizeFiles } = require('../electron/utils/fileOrganizer.js')

console.log('🧪 开始前缀分组功能集成测试...\n')

// 模拟文件数据
const mockFiles = [
  {
    name: 'A-1.JPG',
    path: '/test/A-1.JPG',
    size: 1024,
    type: '.jpg',
    extension: '.jpg',
    mtime: new Date(),
    ctime: new Date()
  },
  {
    name: 'A-1 (1).JPG',
    path: '/test/A-1 (1).JPG',
    size: 1024,
    type: '.jpg',
    extension: '.jpg',
    mtime: new Date(),
    ctime: new Date()
  },
  {
    name: 'A-1 (2).JPG',
    path: '/test/A-1 (2).JPG',
    size: 1024,
    type: '.jpg',
    extension: '.jpg',
    mtime: new Date(),
    ctime: new Date()
  },
  {
    name: 'B-3 (1).JPG',
    path: '/test/B-3 (1).JPG',
    size: 1024,
    type: '.jpg',
    extension: '.jpg',
    mtime: new Date(),
    ctime: new Date()
  },
  {
    name: 'B-3 (2).JPG',
    path: '/test/B-3 (2).JPG',
    size: 1024,
    type: '.jpg',
    extension: '.jpg',
    mtime: new Date(),
    ctime: new Date()
  }
]

async function testPrefixGrouping() {
  try {
    console.log('📁 测试文件数量:', mockFiles.length)
    console.log('📁 测试文件列表:')
    mockFiles.forEach(file => console.log(`  - ${file.name}`))
    console.log('')
    
    // 测试1: 不启用前缀分组
    console.log('🔍 测试1: 不启用前缀分组')
    const result1 = await organizeFiles(mockFiles, '/test', {
      primaryNoIndex: true,
      groupByPrefix: false
    })
    
    console.log('结果1:', {
      success: result1.success,
      renamedFiles: result1.stats.renamedFiles,
      prefixGrouping: result1.stats.prefixGrouping
    })
    console.log('')
    
    // 测试2: 启用前缀分组
    console.log('🔍 测试2: 启用前缀分组')
    const result2 = await organizeFiles(mockFiles, '/test', {
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
      prefixGrouping: result2.stats.prefixGrouping
    })
    
    if (result2.stats.prefixGrouping) {
      console.log('前缀分组统计:')
      console.log(`  - 移动文件数: ${result2.stats.prefixGrouping.movedFiles}`)
      console.log(`  - 跳过文件数: ${result2.stats.prefixGrouping.skippedFiles}`)
      console.log(`  - 失败文件数: ${result2.stats.prefixGrouping.failedFiles}`)
      console.log(`  - 创建文件夹数: ${result2.stats.prefixGrouping.createdFolders}`)
    }
    
    console.log('')
    
    // 测试3: 检查模块导入
    console.log('🔍 测试3: 检查模块导入')
    try {
      const { executePrefixGrouping } = require('../electron/utils/prefixGrouper.js')
      console.log('✅ prefixGrouper.js 模块导入成功')
    } catch (error) {
      console.log('❌ prefixGrouper.js 模块导入失败:', error.message)
    }
    
    console.log('')
    
    // 总结
    console.log('📊 测试总结:')
    console.log(`  测试1 (不启用前缀分组): ${result1.success ? '✅ 成功' : '❌ 失败'}`)
    console.log(`  测试2 (启用前缀分组): ${result2.success ? '✅ 成功' : '❌ 失败'}`)
    
    if (result2.success && result2.stats.prefixGrouping) {
      console.log('🎉 前缀分组功能工作正常！')
    } else {
      console.log('⚠️  前缀分组功能可能存在问题')
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message)
    console.error('错误堆栈:', error.stack)
  }
}

// 运行测试
testPrefixGrouping()
