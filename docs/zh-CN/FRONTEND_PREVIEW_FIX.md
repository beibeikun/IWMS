# 前端预览功能改进

## 问题描述

用户反馈文件预览界面的"新名称"列显示不正确，总是显示"保持不变"或原文件名，而不是根据整理规则计算出的新名称。

## 根本原因分析

1. **IPC通信复杂性**：之前的实现通过后端API生成预览，涉及复杂的IPC通信和序列化问题
2. **数据流延迟**：后端处理需要时间，导致预览更新不及时
3. **序列化问题**：Date对象等复杂数据类型在IPC传输中可能出现问题

## 解决方案

### 1. 将预览逻辑移到前端

**优势：**
- ✅ **响应速度快**：无需IPC通信延迟
- ✅ **实时预览**：配置变化立即反映在界面上
- ✅ **减少复杂性**：避免序列化问题
- ✅ **更好的用户体验**：即时反馈

### 2. 实现前端文件整理逻辑

在 `frontend/src/views/FileOrganize.vue` 中添加了完整的前端文件整理逻辑：

```javascript
// 文件名解析正则表达式
const FILE_NAME_REGEX = /^(.+?)\s?(?:\((\d+)\))?\.(jpg|jpeg|png|tif|tiff|webp)$/i

// 文件名解析
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

// 按base分组文件
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

// 模式A：主图无序号
const generateRenamePlanModeA = (files, base) => {
  // 实现主图无序号的整理逻辑
}

// 模式B：主图也编号
const generateRenamePlanModeB = (files, base) => {
  // 实现主图也编号的整理逻辑
}

// 生成重命名计划
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
```

### 3. 修改预览生成函数

将 `generatePreview` 函数改为使用前端逻辑：

```javascript
const generatePreview = () => {
  if (!hasFiles.value || !organizeConfig.enableOrganize) {
    renamePreview.value = null
    return
  }

  try {
    // 使用前端逻辑生成重命名计划
    const groups = groupFilesByBase(fileList.value)
    const renamePlan = generateRenamePlan(groups, organizeConfig.primaryNoIndex)
    
    // 添加不匹配的文件（保持原名称）
    const processedFiles = new Set()
    for (const plan of renamePlan) {
      processedFiles.add(plan.file.name)
    }

    for (const file of fileList.value) {
      if (!processedFiles.has(file.name)) {
        renamePlan.push({
          file: file,
          oldName: file.name,
          newName: file.name,
          reason: '不匹配的文件，保持原名称'
        })
      }
    }
    
    // 保存预览数据
    renamePreview.value = renamePlan
  } catch (error) {
    console.error('前端生成预览失败:', error)
    renamePreview.value = null
  }
}
```

### 4. 添加配置监听器

添加监听器，当配置变化时自动重新生成预览：

```javascript
// 监听配置变化，重新生成预览
const watchConfig = () => {
  if (hasFiles.value && organizeConfig.enableOrganize) {
    generatePreview()
  }
}

// 添加监听器
watch(() => organizeConfig.primaryNoIndex, watchConfig)
watch(() => organizeConfig.enableOrganize, watchConfig)
```

## 测试验证

创建了测试脚本 `frontend/scripts/test-frontend-preview.js` 来验证前端逻辑：

```bash
node scripts/test-frontend-preview.js
```

测试结果显示前端逻辑完全正确：

### 模式A（主图无序号）结果：
- `10 (1).jpg` → `10.jpg` (从图提升为主图)
- `10 (2).jpg` → `10 (1).jpg` (从图重新编号)
- `10 (6).jpg` → `10 (2).jpg` (从图重新编号)
- `10 (8).jpg` → `10 (3).jpg` (从图重新编号)
- `2.jpg` → `2.jpg` (主图保持不变)
- `2 (1).jpg` → `2 (1).jpg` (从图保持不变)
- `2 (5).jpg` → `2 (2).jpg` (从图重新编号)
- `2 (7).jpg` → `2 (3).jpg` (从图重新编号)

### 模式B（主图也编号）结果：
- `10 (1).jpg` → `10 (1).jpg` (从图保持不变)
- `10 (2).jpg` → `10 (2).jpg` (从图保持不变)
- `10 (6).jpg` → `10 (3).jpg` (从图重新编号)
- `10 (8).jpg` → `10 (4).jpg` (从图重新编号)
- `2.jpg` → `2 (1).jpg` (主图编号)
- `2 (1).jpg` → `2 (2).jpg` (从图重新编号)
- `2 (5).jpg` → `2 (3).jpg` (从图重新编号)
- `2 (7).jpg` → `2 (4).jpg` (从图重新编号)

## 改进效果

### 用户体验提升：
1. **即时预览**：选择文件夹后立即显示新名称
2. **实时响应**：修改配置选项时预览立即更新
3. **无延迟**：无需等待后端处理
4. **更稳定**：避免了IPC通信可能出现的问题

### 技术优势：
1. **性能提升**：前端计算比IPC通信更快
2. **代码简化**：减少了复杂的序列化逻辑
3. **调试友好**：前端逻辑更容易调试和测试
4. **维护性**：逻辑集中在前端，便于维护

## 文件变更

### 修改的文件：
- `frontend/src/views/FileOrganize.vue` - 添加前端文件整理逻辑

### 新增的文件：
- `frontend/scripts/test-frontend-preview.js` - 前端逻辑测试脚本
- `docs/zh-CN/FRONTEND_PREVIEW_FIX.md` - 本文档

## 总结

通过将文件整理预览逻辑移到前端，成功解决了"新名称"显示不正确的问题。现在用户可以：

1. **即时看到预览**：选择文件夹后立即显示整理后的文件名
2. **实时调整配置**：修改整理选项时预览立即更新
3. **享受流畅体验**：无延迟、无卡顿的预览体验

这个改进不仅解决了当前问题，还为未来的功能扩展奠定了良好的基础。
