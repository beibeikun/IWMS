#!/usr/bin/env node

/**
 * 前缀分组功能调试脚本
 * 
 * 详细调试前缀分组功能的问题
 * 
 * @author IWMS Team
 * @version 1.0.0
 */

const path = require('path')
const { organizeFiles } = require('../electron/utils/fileOrganizer.js')
const { groupFilesByPrefix, extractPrefix } = require('../electron/utils/prefixGrouper.js')

console.log('🔍 开始前缀分组功能调试...\n')

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
  }
]

async function debugPrefixGrouping() {
  try {
    console.log('📁 调试文件列表:')
    mockFiles.forEach(file => console.log(`  - ${file.name}`))
    console.log('')
    
    // 调试1: 测试前缀提取
    console.log('🔍 调试1: 测试前缀提取')
    mockFiles.forEach(file => {
      const baseName = path.basename(file.name, path.extname(file.name))
      const prefix = extractPrefix(baseName)
      console.log(`  ${file.name} → 前缀: "${prefix}"`)
    })
    console.log('')
    
    // 调试2: 测试文件分组
    console.log('🔍 调试2: 测试文件分组')
    const options = {
      recursive: false,
      conflictPolicy: 'keep',
      sanitizeFolderName: true,
      caseSensitivePrefix: false,
      logMoveCsv: true,
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.heic', '.tif', '.tiff', '.gif'],
      maxFolderNameLength: 100
    }
    
    const groups = groupFilesByPrefix(mockFiles, '/test', options)
    console.log(`分组数量: ${groups.size}`)
    
    for (const [folderName, groupFiles] of groups) {
      console.log(`  📂 ${folderName}: ${groupFiles.length} 个文件`)
      groupFiles.forEach(file => {
        console.log(`    - ${file.name} (前缀: ${file.prefix})`)
      })
    }
    console.log('')
    
    // 调试3: 测试完整的organizeFiles函数
    console.log('🔍 调试3: 测试完整的organizeFiles函数')
    const result = await organizeFiles(mockFiles, '/test', {
      primaryNoIndex: true,
      groupByPrefix: true,
      recursive: false,
      conflictPolicy: 'keep',
      sanitizeFolderName: true,
      caseSensitivePrefix: false,
      logMoveCsv: true
    })
    
    console.log('完整结果:', JSON.stringify(result, null, 2))
    
    // 调试4: 检查重命名计划
    console.log('\n🔍 调试4: 检查重命名计划')
    if (result.renamePlan) {
      console.log(`重命名计划数量: ${result.renamePlan.length}`)
      result.renamePlan.forEach((plan, index) => {
        console.log(`  ${index + 1}. ${plan.oldName} → ${plan.newName} (${plan.reason})`)
      })
    }
    
    // 调试5: 检查前缀分组结果
    console.log('\n🔍 调试5: 检查前缀分组结果')
    if (result.results && result.results.prefixGrouping) {
      const pg = result.results.prefixGrouping
      console.log('前缀分组结果:')
      console.log(`  - 成功: ${pg.success.length}`)
      console.log(`  - 失败: ${pg.failed.length}`)
      console.log(`  - 跳过: ${pg.skipped.length}`)
      console.log(`  - 创建文件夹: ${pg.createdFolders.size}`)
      
      if (pg.success.length > 0) {
        console.log('成功移动的文件:')
        pg.success.forEach(item => {
          console.log(`  - ${item.file.name} → ${item.targetPath}`)
        })
      }
      
      if (pg.failed.length > 0) {
        console.log('失败的文件:')
        pg.failed.forEach(item => {
          console.log(`  - ${item.file.name}: ${item.error}`)
        })
      }
    }
    
  } catch (error) {
    console.error('❌ 调试过程中出现错误:', error.message)
    console.error('错误堆栈:', error.stack)
  }
}

// 运行调试
debugPrefixGrouping()
