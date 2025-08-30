#!/usr/bin/env node

/**
 * 前缀分组功能测试脚本
 * 
 * 用于测试按前缀分文件夹功能的正确性
 * 包括文件名解析、目录创建、文件移动等
 * 
 * @author IWMS Team
 * @version 1.0.0
 */

const fs = require('fs-extra')
const path = require('path')
const { 
  extractPrefix, 
  hasIndexSuffix, 
  sanitizeFolderName,
  groupFilesByPrefix,
  previewPrefixGrouping 
} = require('../electron/utils/prefixGrouper.js')

console.log('🧪 开始测试前缀分组功能...\n')

// 测试用例
const testCases = [
  // 基本前缀提取测试
  {
    name: '基本前缀提取',
    tests: [
      { input: 'A-1', expected: 'A-1' },
      { input: 'A-1 (1)', expected: 'A-1' },
      { input: 'A-1 (12)', expected: 'A-1' },
      { input: 'Foo Bar-1 (123)', expected: 'Foo Bar-1' },
      { input: 'X-1(2)', expected: 'X-1' }, // 无空格
      { input: 'Test', expected: 'Test' }, // 无编号
      { input: 'Complex Name (99)', expected: 'Complex Name' }
    ]
  },
  
  // 编号后缀检测测试
  {
    name: '编号后缀检测',
    tests: [
      { input: 'A-1', expected: false },
      { input: 'A-1 (1)', expected: true },
      { input: 'A-1 (12)', expected: true },
      { input: 'Test (0)', expected: true },
      { input: 'Foo (123)', expected: true },
      { input: 'No Number', expected: false }
    ]
  },
  
  // 目录名清洗测试
  {
    name: '目录名清洗',
    tests: [
      { input: 'A:1 (1)', expected: 'A_1 (1)' },
      { input: 'File/Name', expected: 'File_Name' },
      { input: 'Test*File', expected: 'Test_File' },
      { input: 'Name<Test>', expected: 'Name_Test_' },
      { input: 'File|Name', expected: 'File_Name' },
      { input: '  Multiple   Spaces  ', expected: 'Multiple Spaces' },
      { input: '', expected: '__UNCLASSIFIED__' },
      { input: '   ', expected: '__UNCLASSIFIED__' }
    ]
  }
]

// 执行测试
let totalTests = 0
let passedTests = 0
let failedTests = 0

for (const testSuite of testCases) {
  console.log(`📋 ${testSuite.name}:`)
  
  for (const test of testSuite.tests) {
    totalTests++
    
    try {
      let result
      let passed = false
      
      switch (testSuite.name) {
        case '基本前缀提取':
          result = extractPrefix(test.input)
          passed = result === test.expected
          break
          
        case '编号后缀检测':
          result = hasIndexSuffix(test.input)
          passed = result === test.expected
          break
          
        case '目录名清洗':
          result = sanitizeFolderName(test.input)
          passed = result === test.expected
          break
      }
      
      if (passed) {
        console.log(`  ✅ ${test.input} → ${result}`)
        passedTests++
      } else {
        console.log(`  ❌ ${test.input} → ${result} (期望: ${test.expected})`)
        failedTests++
      }
      
    } catch (error) {
      console.log(`  💥 ${test.input} → 错误: ${error.message}`)
      failedTests++
    }
  }
  
  console.log('')
}

// 测试文件分组功能
console.log('📁 测试文件分组功能:')

const mockFiles = [
  { name: 'A-1.JPG', path: '/test/A-1.JPG' },
  { name: 'A-1 (1).JPG', path: '/test/A-1 (1).JPG' },
  { name: 'A-1 (2).JPG', path: '/test/A-1 (2).JPG' },
  { name: 'B-3 (1).JPG', path: '/test/B-3 (1).JPG' },
  { name: 'B-3 (2).JPG', path: '/test/B-3 (2).JPG' },
  { name: 'Foo Bar-1.JPG', path: '/test/Foo Bar-1.JPG' },
  { name: 'Test File (123).PNG', path: '/test/Test File (123).PNG' },
  { name: 'document.txt', path: '/test/document.txt' } // 不支持的文件类型
]

try {
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
  
  console.log(`  分组数量: ${groups.size}`)
  
  for (const [folderName, groupFiles] of groups) {
    console.log(`  📂 ${folderName}: ${groupFiles.length} 个文件`)
    for (const file of groupFiles) {
      console.log(`    - ${file.name} (前缀: ${file.prefix})`)
    }
  }
  
  // 测试预览功能
  const preview = previewPrefixGrouping(mockFiles, '/test', options)
  if (preview.success) {
    console.log(`\n  预览统计:`)
    console.log(`    总文件数: ${preview.stats.totalFiles}`)
    console.log(`    将移动: ${preview.stats.willMove}`)
    console.log(`    分组数: ${preview.stats.groups}`)
    console.log(`    文件夹: ${preview.stats.folders.join(', ')}`)
  }
  
} catch (error) {
  console.log(`  💥 文件分组测试失败: ${error.message}`)
}

// 测试结果统计
console.log('\n📊 测试结果统计:')
console.log(`  总测试数: ${totalTests}`)
console.log(`  通过测试: ${passedTests}`)
console.log(`  失败测试: ${failedTests}`)
console.log(`  成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`)

if (failedTests === 0) {
  console.log('\n🎉 所有测试通过！前缀分组功能工作正常。')
} else {
  console.log('\n⚠️  有测试失败，请检查相关功能实现。')
}

// 示例用法
console.log('\n📖 功能使用示例:')
console.log('1. 在文件整理界面勾选"按前缀分文件夹"')
console.log('2. 选择冲突处理策略（跳过/覆盖/重命名）')
console.log('3. 可选择是否清洗目录名（替换非法字符）')
console.log('4. 可选择是否大小写敏感')
console.log('5. 执行整理后，文件将按前缀自动分组到子文件夹')

console.log('\n📁 预期输出示例:')
console.log('输入文件:')
console.log('  A-1.JPG, A-1 (1).JPG, A-1 (2).JPG')
console.log('  B-3 (1).JPG, B-3 (2).JPG')
console.log('输出结构:')
console.log('  /A-1/')
console.log('    A-1.JPG')
console.log('    A-1 (1).JPG')
console.log('    A-1 (2).JPG')
console.log('  /B-3/')
console.log('    B-3 (1).JPG')
console.log('    B-3 (2).JPG')
