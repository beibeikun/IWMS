/**
 * 前端预览功能测试脚本
 * 
 * 测试前端文件整理逻辑是否正常工作
 * 
 * @author IWMS Team
 * @version 1.0.0
 */

// 模拟文件名解析正则表达式
const FILE_NAME_REGEX = /^(.+?)\s?(?:\((\d+)\))?\.(jpg|jpeg|png|tif|tiff|webp)$/i

// 模拟文件数据
const mockFiles = [
  { name: '10 (1).jpg', path: '/test/10 (1).jpg', size: 1024, type: 'image', extension: 'jpg' },
  { name: '10 (2).jpg', path: '/test/10 (2).jpg', size: 1024, type: 'image', extension: 'jpg' },
  { name: '10 (6).jpg', path: '/test/10 (6).jpg', size: 1024, type: 'image', extension: 'jpg' },
  { name: '10 (8).jpg', path: '/test/10 (8).jpg', size: 1024, type: 'image', extension: 'jpg' },
  { name: '2.jpg', path: '/test/2.jpg', size: 1024, type: 'image', extension: 'jpg' },
  { name: '2 (1).jpg', path: '/test/2 (1).jpg', size: 1024, type: 'image', extension: 'jpg' },
  { name: '2 (5).jpg', path: '/test/2 (5).jpg', size: 1024, type: 'image', extension: 'jpg' },
  { name: '2 (7).jpg', path: '/test/2 (7).jpg', size: 1024, type: 'image', extension: 'jpg' },
  { name: 'test.txt', path: '/test/test.txt', size: 100, type: 'document', extension: 'txt' }
]

// 前端文件整理逻辑
const parseFileName = (fileName) => {
  const match = fileName.match(FILE_NAME_REGEX)
  if (!match) return null
  
  const [, base, idx, ext] = match
  return {
    base: base.trim(),
    idx: idx ? parseInt(idx) : null,
    ext: ext.toLowerCase(),
    isMain: !idx
  }
}

const groupFilesByBase = (files) => {
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

const generateRenamePlanModeA = (files, base) => {
  const renamePlan = []
  
  // 分离主图和从图
  const mainFile = files.find(f => f.parsed.isMain)
  const subFiles = files.filter(f => !f.parsed.isMain).sort((a, b) => a.parsed.idx - b.parsed.idx)
  
  // 1. 处理主图
  if (mainFile) {
    // 主图已存在，保持不变
    const targetName = `${base}.${mainFile.parsed.ext}`
    renamePlan.push({
      file: mainFile,
      oldName: mainFile.name,
      newName: targetName,
      reason: mainFile.name !== targetName ? '主图标准化' : '主图保持不变'
    })
  } else if (subFiles.length > 0) {
    // 无主图，将最小序号的从图提升为主图
    const promotedFile = subFiles[0]
    const targetName = `${base}.${promotedFile.parsed.ext}`
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
    const targetName = `${base} (${newIdx}).${file.parsed.ext}`
    
    renamePlan.push({
      file: file,
      oldName: file.name,
      newName: targetName,
      reason: file.parsed.idx !== newIdx ? `从图重新编号: ${file.parsed.idx} → ${newIdx}` : '从图保持不变'
    })
  }
  
  return renamePlan
}

const generateRenamePlanModeB = (files, base) => {
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
    const targetName = `${base} (${newIdx}).${file.parsed.ext}`
    
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

const generateRenamePlan = (groups, primaryNoIndex) => {
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

const generatePreview = (files, primaryNoIndex) => {
  console.log('开始生成预览，文件列表:', files.map(f => f.name))
  
  // 使用前端逻辑生成重命名计划
  const groups = groupFilesByBase(files)
  console.log('分组结果:', Array.from(groups.keys()))
  
  const renamePlan = generateRenamePlan(groups, primaryNoIndex)
  console.log('重命名计划长度:', renamePlan.length)
  
  // 添加不匹配的文件（保持原名称）
  const processedFiles = new Set()
  for (const plan of renamePlan) {
    processedFiles.add(plan.file.name)
  }

  for (const file of files) {
    if (!processedFiles.has(file.name)) {
      renamePlan.push({
        file: file,
        oldName: file.name,
        newName: file.name,
        reason: '不匹配的文件，保持原名称'
      })
    }
  }
  
  return renamePlan
}

// 测试函数
function testFrontendPreview() {
  console.log('🧪 前端预览功能测试')
  console.log('====================')
  console.log()

  console.log('📋 测试文件列表:')
  mockFiles.forEach(file => {
    console.log(`   - ${file.name}`)
  })
  console.log()

  // 测试模式A：主图无序号
  console.log('🔍 测试模式A：主图无序号 (primaryNoIndex = true)')
  console.log('----------------------------------------')
  const previewA = generatePreview(mockFiles, true)
  
  console.log('📊 重命名计划:')
  previewA.forEach(plan => {
    const status = plan.oldName === plan.newName ? '保持不变' : '重命名'
    console.log(`   ${plan.oldName} → ${plan.newName} (${status})`)
    console.log(`     原因: ${plan.reason}`)
  })
  console.log()

  // 测试模式B：主图也编号
  console.log('🔍 测试模式B：主图也编号 (primaryNoIndex = false)')
  console.log('----------------------------------------')
  const previewB = generatePreview(mockFiles, false)
  
  console.log('📊 重命名计划:')
  previewB.forEach(plan => {
    const status = plan.oldName === plan.newName ? '保持不变' : '重命名'
    console.log(`   ${plan.oldName} → ${plan.newName} (${status})`)
    console.log(`     原因: ${plan.reason}`)
  })
  console.log()

  // 验证结果
  console.log('✅ 预期结果验证:')
  console.log('模式A预期:')
  console.log('  10 (1).jpg → 10.jpg (从图提升为主图)')
  console.log('  10 (2).jpg → 10 (1).jpg (从图重新编号)')
  console.log('  10 (6).jpg → 10 (2).jpg (从图重新编号)')
  console.log('  10 (8).jpg → 10 (3).jpg (从图重新编号)')
  console.log('  2.jpg → 2.jpg (主图保持不变)')
  console.log('  2 (1).jpg → 2 (1).jpg (从图保持不变)')
  console.log('  2 (5).jpg → 2 (2).jpg (从图重新编号)')
  console.log('  2 (7).jpg → 2 (3).jpg (从图重新编号)')
  console.log('  test.txt → test.txt (不匹配的文件，保持原名称)')
  console.log()

  console.log('模式B预期:')
  console.log('  10 (1).jpg → 10 (1).jpg (从图保持不变)')
  console.log('  10 (2).jpg → 10 (2).jpg (从图保持不变)')
  console.log('  10 (6).jpg → 10 (3).jpg (从图重新编号)')
  console.log('  10 (8).jpg → 10 (4).jpg (从图重新编号)')
  console.log('  2.jpg → 2 (1).jpg (主图编号)')
  console.log('  2 (1).jpg → 2 (2).jpg (从图重新编号)')
  console.log('  2 (5).jpg → 2 (3).jpg (从图重新编号)')
  console.log('  2 (7).jpg → 2 (4).jpg (从图重新编号)')
  console.log('  test.txt → test.txt (不匹配的文件，保持原名称)')
  console.log()

  // 统计信息
  const willRenameA = previewA.filter(plan => plan.oldName !== plan.newName).length
  const willRenameB = previewB.filter(plan => plan.oldName !== plan.newName).length
  
  console.log('📈 统计信息:')
  console.log(`  模式A: 总文件 ${previewA.length} 个，重命名 ${willRenameA} 个`)
  console.log(`  模式B: 总文件 ${previewB.length} 个，重命名 ${willRenameB} 个`)
  console.log()

  console.log('🎯 测试完成！')
  console.log('如果结果符合预期，说明前端预览逻辑工作正常。')
}

// 运行测试
testFrontendPreview()
