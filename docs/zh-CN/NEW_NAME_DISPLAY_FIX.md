# IWMS 新名称显示功能修复

## 🐛 问题描述

用户反馈：文件预览界面的新名称列显示不正确，无法预览文件整理后的重命名效果。

### **问题表现**
- 新名称列显示"保持不变"或原文件名
- 无法预览文件整理后的重命名效果
- 用户无法确认整理操作的结果
- 扩展名大小写被改变（如 JPG → jpg）

## 🔍 问题分析

### **根本原因**

1. **函数缺失**：在移除其他操作选项时，删除了 `generateNewName` 函数，但没有为文件整理功能提供新的新名称显示逻辑
2. **扩展名处理问题**：原逻辑将扩展名统一转换为小写，导致用户看到的文件名发生变化
3. **预览数据生成时机问题**：预览数据可能没有在正确的时机生成
4. **Vue响应式更新问题**：预览数据更新后，表格可能没有正确重新渲染

## ✅ 修复方案

### **1. 添加重命名预览数据存储**

#### **新增数据模型**
```javascript
// 文件重命名预览数据
const renamePreview = ref(null)
```

### **2. 修复扩展名大小写问题**

#### **保留原始扩展名**
```javascript
// 修复前
const parseFileName = (fileName) => {
  const match = fileName.match(FILE_NAME_REGEX)
  if (!match) return null
  
  const [, base, idx, ext] = match
  return {
    base: base.trim(),
    idx: idx ? parseInt(idx) : null,
    ext: ext.toLowerCase(), // 只保留小写版本
    isMain: !idx
  }
}

// 修复后
const parseFileName = (fileName) => {
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
```

#### **更新重命名计划生成**
```javascript
// 修复前
const targetName = `${base}.${file.parsed.ext}`

// 修复后
const targetName = `${base}.${file.parsed.originalExt}`
```

### **3. 更新预览整理功能**

#### **保存预览数据**
```javascript
if (result.success) {
  ElMessage.success(`预览完成！将处理 ${result.stats.processedFiles} 个文件组，重命名 ${result.stats.willRename} 个文件`)
  
  // 保存重命名预览数据
  renamePreview.value = result.renamePlan
  
  // 显示预览结果...
}
```

### **4. 添加新名称获取函数**

#### **从预览数据中获取新名称**
```javascript
// 从预览数据中获取新名称
const getNewNameFromPreview = (file) => {
  if (!renamePreview.value) {
    console.log(`getNewNameFromPreview: 无预览数据，返回原名称: ${file.name}`)
    return file.name
  }

  console.log(`getNewNameFromPreview: 查找文件 ${file.name} 的重命名计划`)
  console.log(`getNewNameFromPreview: 预览数据长度: ${renamePreview.value.length}`)
  
  const plan = renamePreview.value.find(p => p.file.name === file.name)
  if (plan) {
    console.log(`找到重命名计划: ${file.name} → ${plan.newName}`)
    return plan.newName
  }
  
  console.log(`未找到重命名计划: ${file.name}`)
  return file.name
}
```

### **5. 更新表格显示逻辑**

#### **修复前（错误）**
```vue
<el-table-column prop="newName" label="新名称" min-width="200">
  <template #default="{ row }">
    <span class="text-muted">保持不变</span>
  </template>
</el-table-column>
```

#### **修复后（正确）**
```vue
<el-table-column prop="newName" label="新名称" min-width="200">
  <template #default="{ row }">
    <span v-if="renamePreview && organizeConfig.enableOrganize">
      {{ getNewNameFromPreview(row) }}
    </span>
    <span v-else class="text-muted">保持不变</span>
  </template>
</el-table-column>
```

### **6. 优化预览数据生成时机**

#### **文件加载后自动生成预览**
```javascript
const loadFiles = async () => {
  // ... 文件加载逻辑
  
  if (files.length > 0) {
    ElMessage.success(`已加载 ${files.length} 个文件`)
    
    // 自动生成预览
    console.log('文件加载完成，自动生成预览')
    generatePreview()
    
    // 验证预览数据
    if (renamePreview.value) {
      console.log('预览数据生成成功:', renamePreview.value.length, '个重命名计划')
    } else {
      console.log('预览数据生成失败')
    }
  }
}
```

#### **添加文件列表变化监听**
```javascript
// 监听文件列表变化，自动生成预览
watch(() => fileList.value.length, (newLength, oldLength) => {
  console.log(`文件列表长度变化: ${oldLength} → ${newLength}`)
  if (newLength > 0 && organizeConfig.enableOrganize) {
    console.log('文件列表变化，自动生成预览')
    generatePreview()
  }
})
```

### **7. 强制Vue响应式更新**

#### **使用计算属性强制更新**
```javascript
// 强制更新的计算属性
const previewData = computed(() => {
  console.log('previewData 计算属性触发，renamePreview:', renamePreview.value?.length)
  return renamePreview.value
})
```

#### **使用nextTick确保DOM更新**
```javascript
const generatePreview = async () => {
  // ... 生成逻辑
  
  // 强制DOM更新
  await nextTick()
  console.log('预览数据更新完成，DOM已刷新')
}
```

## 🎯 修复效果

### **修复前的问题**
- ❌ 新名称列显示"保持不变"或原文件名
- ❌ 无法预览重命名效果
- ❌ 用户无法确认操作结果
- ❌ 扩展名大小写被改变

### **修复后的改进**
- ✅ 新名称列正确显示重命名后的名称
- ✅ 可以预览文件整理效果
- ✅ 用户可以确认操作结果
- ✅ 支持两种整理模式的预览
- ✅ 保留原始扩展名大小写
- ✅ 实时响应式更新

## 📊 功能特性

### **智能显示逻辑**
- **有预览数据且启用整理**：显示重命名后的新名称
- **无预览数据或未启用整理**：显示"保持不变"
- **支持多种文件格式**：图片、文档、视频等
- **保留原始扩展名**：不改变文件扩展名的大小写

### **调试支持**
- 详细的调试日志输出
- 预览数据状态监控
- 文件匹配过程追踪
- 错误信息详细记录

## 🔧 技术实现

### **核心算法**
```javascript
// 文件名解析正则表达式
const FILE_NAME_REGEX = /^(.+?)\s*\((\d+)\)(\.[^.]+)$|^(.+?)(\.[^.]+)$/

// 重命名计划生成
const generateRenamePlan = (files, organizeConfig) => {
  const plans = []
  
  files.forEach(file => {
    const parsed = parseFileName(file.name)
    if (parsed) {
      const newName = generateNewName(parsed, organizeConfig)
      plans.push({
        file: file,
        oldName: file.name,
        newName: newName,
        reason: '整理排序'
      })
    }
  })
  
  return plans
}
```

### **性能优化**
- 异步处理大量文件
- 批量更新DOM
- 内存使用优化
- 响应式更新优化

## 📝 版本历史

- **V1**: 基础修复，添加预览数据存储
- **V2**: 修复扩展名大小写问题，增强调试信息
- **V3**: 优化预览数据生成时机，强制Vue响应式更新

---

**相关文档**: [文件整理功能](FILE_ORGANIZE_FEATURE.md) | [UI优化](UI_OPTIMIZATION.md)
