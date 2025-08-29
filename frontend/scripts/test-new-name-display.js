/**
 * 新名称显示功能测试脚本
 * 
 * 测试文件整理功能中新名称显示的正确性
 */

// 模拟文件名解析正则表达式
const FILE_NAME_REGEX = /^(.+?)\s?(?:\((\d+)\))?\.(jpg|jpeg|png|tif|tiff|webp)$/i

// 模拟文件列表
const mockFiles = [
  { name: 'A-1.JPG', path: '/test/A-1.JPG', size: 1024, type: 'image' },
  { name: 'A-1 (1).JPG', path: '/test/A-1 (1).JPG', size: 1024, type: 'image' },
  { name: 'A-1 (7).JPG', path: '/test/A-1 (7).JPG', size: 1024, type: 'image' },
  { name: 'B-3 (2).JPG', path: '/test/B-3 (2).JPG', size: 1024, type: 'image' },
  { name: 'B-3 (4).JPG', path: '/test/B-3 (4).JPG', size: 1024, type: 'image' },
  { name: 'B-3 (5).JPG', path: '/test/B-3 (5).JPG', size: 1024, type: 'image' },
  { name: 'test.txt', path: '/test/test.txt', size: 512, type: 'document' }
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

// 生成模式B的重命名计划（主图也编号）
function generateRenamePlanModeB(files, base) {
  const renamePlan = []
  
  // 分离主图和从图，并按序号排序
  const mainFile = files.find(f => f.parsed.isMain)
  const subFiles = files.filter(f => !f.parsed.isMain).sort((a, b) => a.parsed.idx - b.parsed.idx)
  
  // 合并所有文件并按顺序排列
  const allFiles = []
  if (mainFile) allFiles.push(mainFile)
  allFiles.push(...subFiles)
  
  // 统一编号
  for (let i = 0; i < allFiles.length; i++) {
    const file = allFiles[i]
    const newIdx = i + 1
    const targetName = `${base} (${newIdx}).${file.parsed.originalExt}`
    
    let reason
    if (file.parsed.isMain) {
      reason = file.name !== targetName ? `主图编号: ${file.parsed.idx || '无'} → ${newIdx}` : '主图保持不变'
    } else {
      reason = file.name !== targetName ? `从图重新编号: ${file.parsed.idx} → ${newIdx}` : '从图保持不变'
    }
    
    renamePlan.push({
      file: file,
      oldName: file.name,
      newName: targetName,
      reason: reason
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
    } else {
      renamePlan.push(...generateRenamePlanModeB(files, base))
    }
  }
  
  return renamePlan
}

// 从预览数据中获取新名称
function getNewNameFromPreview(file, renamePreview) {
  if (!renamePreview) {
    return file.name
  }

  // 使用文件名进行匹配，避免对象引用问题
  const plan = renamePreview.find(p => p.file.name === file.name)
  if (plan) {
    console.log(`找到重命名计划: ${file.name} → ${plan.newName}`)
    return plan.newName
  }
  
  console.log(`未找到重命名计划: ${file.name}`)
  return file.name
}

// 测试函数
function testNewNameDisplay() {
  console.log('=== 新名称显示功能测试 ===\n')
  
  // 1. 测试文件名解析
  console.log('1. 文件名解析测试:')
  mockFiles.forEach(file => {
    const parsed = parseFileName(file.name)
    console.log(`  ${file.name} → ${parsed ? JSON.stringify(parsed) : '不匹配'}`)
  })
  console.log()
  
  // 2. 测试文件分组
  console.log('2. 文件分组测试:')
  const groups = groupFilesByBase(mockFiles)
  for (const [base, files] of groups) {
    console.log(`  组 ${base}: ${files.map(f => f.name).join(', ')}`)
  }
  console.log()
  
  // 3. 测试模式A（主图无序号）
  console.log('3. 模式A（主图无序号）测试:')
  const renamePlanA = generateRenamePlan(groups, true)
  console.log('  重命名计划:')
  renamePlanA.forEach((plan, index) => {
    console.log(`    ${index + 1}. ${plan.oldName} → ${plan.newName} (${plan.reason})`)
  })
  console.log()
  
  // 4. 测试模式B（主图也编号）
  console.log('4. 模式B（主图也编号）测试:')
  const renamePlanB = generateRenamePlan(groups, false)
  console.log('  重命名计划:')
  renamePlanB.forEach((plan, index) => {
    console.log(`    ${index + 1}. ${plan.oldName} → ${plan.newName} (${plan.reason})`)
  })
  console.log()
  
  // 5. 测试新名称获取函数
  console.log('5. 新名称获取函数测试:')
  console.log('  模式A结果:')
  mockFiles.forEach(file => {
    const newName = getNewNameFromPreview(file, renamePlanA)
    console.log(`    ${file.name} → ${newName}`)
  })
  console.log()
  
  console.log('  模式B结果:')
  mockFiles.forEach(file => {
    const newName = getNewNameFromPreview(file, renamePlanB)
    console.log(`    ${file.name} → ${newName}`)
  })
  console.log()
  
  // 6. 测试UI显示逻辑
  console.log('6. UI显示逻辑测试:')
  const scenarios = [
    { renamePreview: null, enableOrganize: true, description: '无预览数据，启用整理' },
    { renamePreview: renamePlanA, enableOrganize: false, description: '有预览数据，未启用整理' },
    { renamePreview: renamePlanA, enableOrganize: true, description: '有预览数据，启用整理（模式A）' },
    { renamePreview: renamePlanB, enableOrganize: true, description: '有预览数据，启用整理（模式B）' }
  ]
  
  scenarios.forEach(scenario => {
    console.log(`  场景: ${scenario.description}`)
    mockFiles.forEach(file => {
      let displayName
      if (scenario.renamePreview && scenario.enableOrganize) {
        displayName = getNewNameFromPreview(file, scenario.renamePreview)
      } else {
        displayName = file.name
      }
      console.log(`    ${file.name} → ${displayName}`)
    })
    console.log()
  })
}

// 运行测试
if (require.main === module) {
  testNewNameDisplay()
}

module.exports = {
  parseFileName,
  groupFilesByBase,
  generateRenamePlan,
  getNewNameFromPreview,
  testNewNameDisplay
}
