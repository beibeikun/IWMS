# IWMS 新名称显示功能修复

## 🐛 问题描述

用户反馈：文件预览界面的新名称列显示的都是"保持不变"，没有正确显示文件整理后的新名称。

## 🔍 问题分析

### **根本原因**
在移除其他操作选项时，我们删除了 `generateNewName` 函数，但没有为文件整理功能提供新的新名称显示逻辑。导致表格中的新名称列始终显示"保持不变"。

### **问题表现**
- 文件预览表格的新名称列显示"保持不变"
- 无法预览文件整理后的重命名效果
- 用户无法确认整理操作的结果

## ✅ 修复方案

### **1. 添加重命名预览数据存储**

#### **新增数据模型**
```javascript
// 文件重命名预览数据
const renamePreview = ref(null)
```

### **2. 更新预览整理功能**

#### **保存预览数据**
```javascript
if (result.success) {
  ElMessage.success(`预览完成！将处理 ${result.stats.processedFiles} 个文件组，重命名 ${result.stats.willRename} 个文件`)
  
  // 保存重命名预览数据
  renamePreview.value = result.renamePlan
  
  // 显示预览结果...
}
```

### **3. 添加新名称获取函数**

#### **从预览数据中获取新名称**
```javascript
// 从预览数据中获取新名称
const getNewNameFromPreview = (file) => {
  if (!renamePreview.value) {
    return file.name
  }

  // 查找对应的重命名计划
  const plan = renamePreview.value.find(p => p.file.name === file.name)
  if (plan) {
    return plan.newName
  }

  return file.name
}
```

### **4. 更新表格显示逻辑**

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

## 🎯 修复效果

### **修复前的问题**
- ❌ 新名称列显示"保持不变"
- ❌ 无法预览重命名效果
- ❌ 用户无法确认操作结果

### **修复后的改进**
- ✅ 新名称列正确显示重命名后的名称
- ✅ 可以预览文件整理效果
- ✅ 用户可以确认操作结果
- ✅ 支持两种整理模式的预览

## 📊 功能特性

### **智能显示逻辑**
- **有预览数据且启用整理**：显示重命名后的新名称
- **无预览数据或未启用整理**：显示"保持不变"
- **不匹配的文件**：保持原名称不变

### **支持的文件类型**
- 图片文件：jpg、jpeg、png、tif、tiff、webp
- 自动识别主图和从图
- 跳过不匹配的文件

### **两种整理模式**
- **模式A（主图无序号）**：主图保持 base.ext，从图编号为 base (n).ext
- **模式B（主图也编号）**：所有文件统一编号为 base (n).ext

## 🔍 使用示例

### **预览整理流程**
1. 选择文件夹
2. 配置整理选项（主图无序号/主图也编号）
3. 点击"预览整理"
4. 查看文件预览表格中的新名称列

### **显示效果示例**

#### **模式A（主图无序号）**
```
原名称 → 新名称
A-1.JPG → A-1.jpg (主图标准化)
A-1 (1).JPG → A-1 (1).jpg (保持不变)
A-1 (7).JPG → A-1 (3).jpg (重新编号)
B-3 (2).JPG → B-3.jpg (提升为主图)
B-3 (4).JPG → B-3 (1).jpg (重新编号)
B-3 (5).JPG → B-3 (2).jpg (重新编号)
```

#### **模式B（主图也编号）**
```
原名称 → 新名称
A-1.JPG → A-1 (1).jpg (主图编号)
A-1 (1).JPG → A-1 (2).jpg (重新编号)
A-1 (7).JPG → A-1 (4).jpg (重新编号)
B-3 (2).JPG → B-3 (1).jpg (重新编号)
B-3 (4).JPG → B-3 (2).jpg (重新编号)
B-3 (5).JPG → B-3 (3).jpg (重新编号)
```

## 🧪 测试验证

### **测试脚本**
创建了专门的测试脚本 `scripts/test-new-name-display.js` 来验证修复效果：

#### **测试项目**
1. 从预览数据中获取新名称
2. 不同场景的显示逻辑
3. 重命名逻辑验证
4. UI显示逻辑测试
5. 模拟UI显示效果

#### **测试结果**
- ✅ 新名称获取正确
- ✅ 显示逻辑正确
- ✅ 重命名逻辑符合预期
- ✅ UI显示效果正确

## 📁 文件更新

### **主要修改文件**
- `frontend/src/views/FileOrganize.vue` - 添加新名称显示功能

### **新增文件**
- `frontend/scripts/test-new-name-display.js` - 新名称显示测试脚本
- `docs/zh-CN/NEW_NAME_DISPLAY_FIX.md` - 修复文档

### **修改内容**
- 添加 `renamePreview` 响应式数据
- 添加 `getNewNameFromPreview` 函数
- 更新预览整理功能保存预览数据
- 更新表格显示逻辑
- 完善return语句

## 🔧 技术实现

### **数据流**
1. 用户点击"预览整理"
2. 调用后端API获取重命名计划
3. 保存预览数据到 `renamePreview`
4. 表格根据预览数据显示新名称

### **显示条件**
```javascript
// 显示新名称的条件
renamePreview && organizeConfig.enableOrganize
```

### **查找逻辑**
```javascript
// 查找对应的重命名计划
const plan = renamePreview.value.find(p => p.file.name === file.name)
```

## 🚀 使用方法

### **修复后的使用流程**
1. 选择文件夹
2. 配置整理选项
3. 点击"预览整理"
4. 查看文件预览表格中的新名称列
5. 确认整理效果
6. 点击"开始整理"执行操作

### **界面效果**
- **新名称列**：正确显示重命名后的文件名
- **预览功能**：实时预览整理效果
- **确认操作**：用户可以确认整理结果

## 📈 优化效果

### **用户体验**
- ✅ 可以预览整理效果
- ✅ 界面信息更加准确
- ✅ 操作更加透明

### **功能完整性**
- ✅ 新名称显示功能完整
- ✅ 支持两种整理模式
- ✅ 错误处理完善

### **代码质量**
- ✅ 逻辑清晰
- ✅ 代码简洁
- ✅ 易于维护

## 📝 更新日志

### **v1.0.4** (2024-01-XX)
- ✅ 修复新名称显示问题
- ✅ 添加重命名预览数据存储
- ✅ 添加新名称获取函数
- ✅ 更新表格显示逻辑
- ✅ 完善预览整理功能
- ✅ 创建测试脚本验证功能

---

**IWMS 智能文件管理解决方案** - 让预览更准确、操作更透明！
