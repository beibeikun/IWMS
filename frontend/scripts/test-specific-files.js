/**
 * 特定文件列表测试脚本
 * 
 * 测试用户提供的文件列表的重命名逻辑
 */

// 模拟文件名解析正则表达式
const FILE_NAME_REGEX = /^(.+?)\s?(?:\((\d+)\))?\.(jpg|jpeg|png|tif|tiff|webp)$/i

// 用户提供的文件列表
const userFiles = [
  { name: '10 (1).jpg', path: '/test/10 (1).jpg', size: 1024, type: 'image' },
  { name: '10 (2).jpg', path: '/test/10 (2).jpg', size: 1024, type: 'image' },
  { name: '10 (6).jpg', path: '/test/10 (6).jpg', size: 1024, type: 'image' },
  { name: '10 (8).jpg', path: '/test/10 (8).jpg', size: 1024, type: 'image' },
  { name: '2 (1).jpg', path: '/test/2 (1).jpg', size: 1024, type: 'image' },
  { name: '2 (5).jpg', path: '/test/2 (5).jpg', size: 1024, type: 'image' },
  { name: '2 (7).jpg', path: '/test/2 (7).jpg', size: 1024, type: 'image' },
  { name: '2.jpg', path: '/test/2.jpg', size: 1024, type: 'image' }
]

// 文件名解析函数
function parseFileName(fileName) {
  const match = fileName.match(FILE_NAME_REGEX)
  if (!match) return null
  
  const [, base, idx, ext] = match
  return {
    base: base.trim(),
    idx: idx ? parseInt(idx) : null,
    ext: ext.toLowerCase(), // 统一转换为小写用于处理
    originalExt: ext, // 保留原始扩展名用于显示
    isMain: !idx
  }
}

// 按base分组文件
function groupFilesByBase(files) {
  const groups = new Map()
  
  for (const file of files) {
    const parsed = parseFileName(file.name)
    if (!parsed) continue
    
    if (!groups.has(parsed.base)) {
      groups.set(parsed.base, [])
    }
    groups.get(parsed.base).push({
      ...file,
      parsed
    })
  }
  
  return groups
}

// 生成模式A的重命名计划（主图无序号）
function generateRenamePlanModeA(files, base) {
  const renamePlan = []
  
  // 分离主图和从图
  const mainFile = files.find(f => f.parsed.isMain)
  const subFiles = files.filter(f => !f.parsed.isMain).sort((a, b) => a.parsed.idx - b.parsed.idx)
  
  // 1. 处理主图
  if (mainFile) {
    // 主图已存在，保持不变
    const targetName = `${base}.${mainFile.parsed.originalExt}`
    renamePlan.push({
      file: mainFile,
      oldName: mainFile.name,
      newName: targetName,
      reason: mainFile.name !== targetName ? '主图标准化' : '主图保持不变'
    })
  } else if (subFiles.length > 0) {
    // 无主图，将最小序号的从图提升为主图
    const promotedFile = subFiles[0]
    const targetName = `${base}.${promotedFile.parsed.originalExt}`
    renamePlan.push({
      file: promotedFile,
      oldName: promotedFile.name,
      newName: targetName,
      reason: '从图提升为主图'
    })
    subFiles.splice(0, 1) // 移除已提升的文件
  }
  
  // 2. 处理从图（压缩编号）
  for (let i = 0; i < subFiles.length; i++) {
    const file = subFiles[i]
    const newIdx = i + 1
    const targetName = `${base} (${newIdx}).${file.parsed.originalExt}`
    
    renamePlan.push({
      file: file,
      oldName: file.name,
      newName: targetName,
      reason: file.parsed.idx !== newIdx ? `从图重新编号: ${file.parsed.idx} → ${newIdx}` : '从图保持不变'
    })
  }
  
  return renamePlan
}

// 生成重命名计划
function generateRenamePlan(groups, primaryNoIndex) {
  const renamePlan = []
  
  for (const [base, files] of groups) {
    if (primaryNoIndex) {
      renamePlan.push(...generateRenamePlanModeA(files, base))
    }
  }
  
  return renamePlan
}

// 从预览数据中获取新名称
function getNewNameFromPreview(file, renamePreview) {
  if (!renamePreview) {
    return file.name
  }

  const plan = renamePreview.find(p => p.file.name === file.name)
  if (plan) {
    return plan.newName
  }
  
  return file.name
}

// 测试函数
function testUserFiles() {
  console.log('=== 用户文件列表测试 ===\n')
  
  // 1. 测试文件名解析
  console.log('1. 文件名解析测试:')
  userFiles.forEach(file => {
    const parsed = parseFileName(file.name)
    console.log(`  ${file.name} → ${parsed ? JSON.stringify(parsed) : '不匹配'}`)
  })
  console.log()
  
  // 2. 测试文件分组
  console.log('2. 文件分组测试:')
  const groups = groupFilesByBase(userFiles)
  for (const [base, files] of groups) {
    console.log(`  组 ${base}: ${files.map(f => f.name).join(', ')}`)
  }
  console.log()
  
  // 3. 测试模式A（主图无序号）
  console.log('3. 模式A（主图无序号）测试:')
  const renamePlan = generateRenamePlan(groups, true)
  console.log('  重命名计划:')
  renamePlan.forEach((plan, index) => {
    console.log(`    ${index + 1}. ${plan.oldName} → ${plan.newName} (${plan.reason})`)
  })
  console.log()
  
  // 4. 测试新名称获取
  console.log('4. 新名称获取测试:')
  userFiles.forEach(file => {
    const newName = getNewNameFromPreview(file, renamePlan)
    console.log(`  ${file.name} → ${newName}`)
  })
  console.log()
  
  // 5. 验证期望结果
  console.log('5. 验证期望结果:')
  const expectedResults = [
    '10.jpg', '10 (1).jpg', '10 (2).jpg', '10 (3).jpg',
    '2.jpg', '2 (1).jpg', '2 (2).jpg', '2 (3).jpg'
  ]
  
  const actualResults = userFiles.map(file => getNewNameFromPreview(file, renamePlan))
  
  console.log('期望结果:', expectedResults)
  console.log('实际结果:', actualResults)
  
  const isCorrect = actualResults.every((result, index) => result === expectedResults[index])
  console.log('结果正确:', isCorrect ? '✅' : '❌')
  
  if (!isCorrect) {
    console.log('\n不匹配的项目:')
    actualResults.forEach((actual, index) => {
      const expected = expectedResults[index]
      if (actual !== expected) {
        console.log(`  ${userFiles[index].name}: 期望 ${expected}, 实际 ${actual}`)
      }
    })
  }
}

// 运行测试
if (require.main === module) {
  testUserFiles()
}

module.exports = {
  parseFileName,
  groupFilesByBase,
  generateRenamePlan,
  getNewNameFromPreview,
  testUserFiles
}
