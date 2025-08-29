# IWMS 文件预览功能修复

## 🐛 问题描述

在整理排序功能中，选择文件夹后预览信息不正确，显示的是硬编码的模拟数据，而不是真实的文件夹内容。

## 🔍 问题分析

### **问题原因**
1. `loadFiles` 函数使用硬编码的模拟数据
2. 没有调用真实的文件扫描功能
3. 缺少文件统计信息获取功能

### **影响范围**
- 文件列表显示不准确
- 文件数量统计错误
- 文件类型识别不准确
- 文件大小和时间信息不正确

## ✅ 修复方案

### **1. 添加文件统计信息API**

#### **preload.js 新增方法**
```javascript
/**
 * 获取文件统计信息
 * 获取指定文件的详细信息，包括大小、修改时间等
 * 
 * @param {string} filePath - 文件路径
 * @returns {Promise<Object>} 文件统计信息对象
 */
getFileStats: (filePath) => ipcRenderer.invoke('get-file-stats', filePath),
```

#### **main.js 新增IPC处理器**
```javascript
/**
 * 获取文件统计信息
 */
ipcMain.handle('get-file-stats', async (event, filePath) => {
  try {
    const stats = await fs.stat(filePath)
    return {
      size: stats.size,
      mtime: stats.mtime.getTime(),
      birthtime: stats.birthtime.getTime(),
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory()
    }
  } catch (error) {
    throw new Error(`获取文件统计信息失败: ${error.message}`)
  }
})
```

### **2. 重写loadFiles函数**

#### **修复前（模拟数据）**
```javascript
const loadFiles = async () => {
  // 硬编码的模拟数据
  fileList.value = [
    {
      name: 'example1.jpg',
      size: 1024000,
      type: 'image',
      mtime: new Date('2024-01-15'),
      ctime: new Date('2024-01-10')
    },
    // ... 更多模拟数据
  ]
}
```

#### **修复后（真实数据）**
```javascript
const loadFiles = async () => {
  if (!selectedFolder.value) return
  
  loading.value = true
  try {
    // 使用真实的文件扫描功能
    const filePaths = await window.electronAPI.scanFiles(
      selectedFolder.value, 
      false, // 不递归扫描
      ['all'] // 扫描所有文件类型
    )
    
    // 获取文件详细信息
    const files = []
    for (const filePath of filePaths) {
      try {
        const fileName = filePath.split('/').pop() || filePath.split('\\').pop()
        const fileExt = fileName.split('.').pop()?.toLowerCase() || ''
        
        // 获取文件统计信息
        const stats = await window.electronAPI.getFileStats(filePath)
        
        // 确定文件类型
        let fileType = 'other'
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExt)) {
          fileType = 'image'
        } else if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(fileExt)) {
          fileType = 'document'
        } else if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(fileExt)) {
          fileType = 'video'
        } else if (['mp3', 'wav', 'flac', 'aac'].includes(fileExt)) {
          fileType = 'audio'
        }
        
        files.push({
          name: fileName,
          path: filePath,
          size: stats.size || 0,
          type: fileType,
          mtime: new Date(stats.mtime || Date.now()),
          ctime: new Date(stats.birthtime || Date.now()),
          extension: fileExt
        })
      } catch (error) {
        console.warn(`获取文件信息失败: ${filePath}`, error.message)
      }
    }
    
    fileList.value = files
    
    if (files.length > 0) {
      ElMessage.success(`已加载 ${files.length} 个文件`)
    } else {
      ElMessage.warning('选择的文件夹中没有找到文件')
    }
  } catch (error) {
    ElMessage.error(`加载文件失败: ${error.message}`)
    fileList.value = []
  } finally {
    loading.value = false
  }
}
```

## 🎯 修复效果

### **修复前的问题**
- ❌ 显示固定的模拟数据
- ❌ 文件数量始终为3个
- ❌ 文件类型识别不准确
- ❌ 文件大小和时间信息错误

### **修复后的改进**
- ✅ 显示真实的文件夹内容
- ✅ 准确的文件数量统计
- ✅ 智能的文件类型识别
- ✅ 正确的文件大小和时间信息
- ✅ 支持多种文件格式
- ✅ 错误处理和用户反馈

## 📋 支持的文件类型

### **图片文件**
- JPG, JPEG, PNG, GIF, BMP, WebP

### **文档文件**
- PDF, DOC, DOCX, TXT, RTF

### **视频文件**
- MP4, AVI, MOV, WMV, FLV

### **音频文件**
- MP3, WAV, FLAC, AAC

### **其他文件**
- 所有其他文件类型归类为 "other"

## 🔧 技术实现

### **文件扫描流程**
1. 用户选择文件夹
2. 调用 `scanFiles` API 扫描文件
3. 遍历文件列表获取详细信息
4. 识别文件类型和扩展名
5. 获取文件统计信息
6. 更新UI显示

### **错误处理**
- 文件访问权限错误
- 文件不存在错误
- 网络或系统错误
- 用户友好的错误提示

### **性能优化**
- 异步文件信息获取
- 批量处理文件列表
- 错误文件跳过处理
- 加载状态指示

## 🚀 使用方法

### **1. 选择文件夹**
```
整理排序页面 → 选择文件夹 → 点击"选择文件夹"按钮
```

### **2. 查看文件预览**
- 文件列表自动更新
- 显示真实文件信息
- 文件类型自动识别
- 文件大小和时间正确显示

### **3. 配置排序规则**
- 基于真实文件信息排序
- 支持按名称、大小、时间排序
- 文件过滤功能正常工作

## 📝 更新日志

### **v1.0.1** (2024-01-XX)
- ✅ 修复文件预览显示问题
- ✅ 添加真实文件扫描功能
- ✅ 新增文件统计信息API
- ✅ 改进文件类型识别
- ✅ 优化错误处理机制
- ✅ 增强用户体验

---

**IWMS 智能文件管理解决方案** - 让文件管理更准确、更可靠！
