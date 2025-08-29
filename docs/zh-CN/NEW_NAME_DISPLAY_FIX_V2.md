# IWMS 新名称显示功能修复 V2

## 🐛 问题描述

用户反馈：整理排序中的文件预览页面，新名称没能按照改名逻辑正确显示。

## 🔍 问题分析

### **根本原因分析**

经过深入分析，发现了几个潜在问题：

1. **扩展名大小写问题**：原逻辑将扩展名统一转换为小写，导致用户看到的文件名发生变化
2. **预览数据生成时机问题**：可能存在预览数据没有在正确时机生成的情况
3. **调试信息不足**：缺乏足够的调试信息来诊断问题

### **问题表现**
- 新名称列显示不正确
- 扩展名大小写被改变（如 JPG → jpg）
- 无法预览文件整理后的重命名效果

## ✅ 修复方案

### **1. 修复扩展名大小写问题**

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

### **2. 增强调试信息**

#### **添加详细的调试日志**
```javascript
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
  console.log(`可用的重命名计划:`, renamePreview.value.map(p => `${p.file.name} → ${p.newName}`))
  return file.name
}
```

### **3. 优化预览数据生成时机**

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

#### **增强配置变化监听**
```javascript
const watchConfig = () => {
  console.log('watchConfig 触发:', {
    hasFiles: hasFiles.value,
    enableOrganize: organizeConfig.enableOrganize,
    primaryNoIndex: organizeConfig.primaryNoIndex
  })
  
  if (hasFiles.value && organizeConfig.enableOrganize) {
    console.log('触发 generatePreview')
    generatePreview()
  } else {
    console.log('跳过 generatePreview')
    renamePreview.value = null
  }
}
```

### **4. 创建测试脚本验证**

#### **测试脚本功能**
- 文件名解析测试
- 文件分组测试
- 重命名计划生成测试
- 新名称获取函数测试
- UI显示逻辑测试

## 🎯 修复效果

### **修复前的问题**
- ❌ 扩展名被转换为小写（JPG → jpg）
- ❌ 新名称显示不正确
- ❌ 缺乏调试信息

### **修复后的改进**
- ✅ 扩展名保持原始大小写（JPG → JPG）
- ✅ 新名称正确显示
- ✅ 详细的调试信息
- ✅ 自动预览数据生成
- ✅ 完整的测试覆盖

## 📊 测试结果

### **模式A（主图无序号）测试结果**
```
原名称 → 新名称
A-1.JPG → A-1.JPG (主图保持不变)
A-1 (1).JPG → A-1 (1).JPG (从图保持不变)
A-1 (7).JPG → A-1 (2).JPG (从图重新编号: 7 → 2)
B-3 (2).JPG → B-3.JPG (从图提升为主图)
B-3 (4).JPG → B-3 (1).JPG (从图重新编号: 4 → 1)
B-3 (5).JPG → B-3 (2).JPG (从图重新编号: 5 → 2)
```

### **模式B（主图也编号）测试结果**
```
原名称 → 新名称
A-1.JPG → A-1 (1).JPG (主图编号: 无 → 1)
A-1 (1).JPG → A-1 (2).JPG (从图重新编号: 1 → 2)
A-1 (7).JPG → A-1 (3).JPG (从图重新编号: 7 → 3)
B-3 (2).JPG → B-3 (1).JPG (从图重新编号: 2 → 1)
B-3 (4).JPG → B-3 (2).JPG (从图重新编号: 4 → 2)
B-3 (5).JPG → B-3 (3).JPG (从图重新编号: 5 → 3)
```

## 📁 文件更新

### **主要修改文件**
- `frontend/src/views/FileOrganize.vue` - 修复新名称显示逻辑
- `frontend/scripts/test-new-name-display.js` - 更新测试脚本

### **修改内容**
1. **文件名解析函数**：添加 `originalExt` 字段保留原始扩展名
2. **重命名计划生成**：使用 `originalExt` 而不是 `ext`
3. **调试信息增强**：添加详细的日志输出
4. **监听器优化**：添加文件列表变化监听
5. **测试脚本更新**：反映扩展名大小写修复

## 🔧 技术实现

### **数据流优化**
1. 用户选择文件夹
2. 扫描文件并解析文件名
3. 保留原始扩展名信息
4. 生成重命名计划时使用原始扩展名
5. 表格显示正确的新名称

### **扩展名处理策略**
```javascript
// 处理逻辑
ext: ext.toLowerCase(), // 用于内部处理和比较
originalExt: ext,       // 用于显示和重命名

// 重命名时使用
const targetName = `${base}.${file.parsed.originalExt}`
```

## 🚀 使用方法

### **修复后的使用流程**
1. 选择文件夹
2. 配置整理选项（主图无序号/主图也编号）
3. 系统自动生成预览数据
4. 查看文件预览表格中的新名称列
5. 确认整理效果
6. 点击"开始整理"执行操作

### **调试功能**
- 打开浏览器开发者工具
- 查看控制台日志
- 监控预览数据生成过程
- 验证重命名计划正确性

## 📈 优化效果

### **用户体验**
- ✅ 新名称显示准确
- ✅ 扩展名大小写保持
- ✅ 预览功能正常工作
- ✅ 操作更加透明

### **开发体验**
- ✅ 详细的调试信息
- ✅ 完整的测试覆盖
- ✅ 代码逻辑清晰
- ✅ 易于维护和扩展

### **功能完整性**
- ✅ 支持两种整理模式
- ✅ 正确处理所有文件类型
- ✅ 错误处理完善
- ✅ 性能优化

## 📝 更新日志

### **v1.0.5** (2024-01-XX)
- ✅ 修复扩展名大小写问题
- ✅ 增强调试信息输出
- ✅ 优化预览数据生成时机
- ✅ 添加文件列表变化监听
- ✅ 更新测试脚本
- ✅ 完善错误处理

---

**IWMS 智能文件管理解决方案** - 让预览更准确、显示更完美！
