# 🔍 IWMS 过滤功能指南

## 📋 概述

本文档涵盖了IWMS项目的所有过滤功能，包括文件过滤、类型过滤、大小过滤等。

## 🎯 文件过滤功能

### 功能概述

文件过滤功能允许用户根据各种条件对文件进行筛选，提高文件处理的精确性和效率。

### 过滤类型

#### 1. 文件类型过滤
- **图片文件**: jpg, jpeg, png, gif, bmp, tiff, webp, svg, ico
- **文档文件**: pdf, doc, docx, xls, xlsx, ppt, pptx
- **视频文件**: mp4, avi, mov, wmv, flv, mkv
- **音频文件**: mp3, wav, flac, aac, ogg
- **所有文件**: 不限制文件类型

#### 2. 文件大小过滤
- **最小大小**: 设置文件最小大小限制
- **最大大小**: 设置文件最大大小限制
- **大小范围**: 设置文件大小范围
- **单位支持**: KB, MB, GB

#### 3. 文件名过滤
- **名称模式**: 支持通配符和正则表达式
- **包含关键词**: 文件名包含指定关键词
- **排除关键词**: 排除包含指定关键词的文件
- **大小写敏感**: 可选择是否区分大小写

#### 4. 日期过滤
- **创建日期**: 按文件创建日期过滤
- **修改日期**: 按文件修改日期过滤
- **日期范围**: 设置日期范围过滤
- **相对日期**: 最近N天、N周、N月

### 过滤配置

#### 1. 基础过滤配置
```javascript
// 过滤配置对象
const filterConfig = {
  fileTypes: 'image',           // 文件类型
  minSize: 0,                   // 最小大小(KB)
  maxSize: 10240,              // 最大大小(KB)
  namePattern: '',              // 名称模式
  includeKeywords: [],          // 包含关键词
  excludeKeywords: [],          // 排除关键词
  caseSensitive: false,         // 大小写敏感
  dateRange: null,              // 日期范围
  recursive: true               // 递归扫描
}
```

#### 2. 高级过滤配置
```javascript
// 高级过滤选项
const advancedFilter = {
  // 文件类型详细配置
  fileTypes: {
    images: ['jpg', 'jpeg', 'png', 'gif'],
    documents: ['pdf', 'doc', 'docx'],
    videos: ['mp4', 'avi', 'mov'],
    audio: ['mp3', 'wav', 'flac']
  },
  
  // 大小过滤
  sizeFilter: {
    min: 1024,      // 1KB
    max: 10485760,  // 10MB
    unit: 'KB'
  },
  
  // 名称过滤
  nameFilter: {
    pattern: '*.jpg',
    include: ['photo', 'image'],
    exclude: ['temp', 'backup'],
    caseSensitive: false
  },
  
  // 日期过滤
  dateFilter: {
    type: 'modified',  // created, modified
    start: '2024-01-01',
    end: '2024-12-31'
  }
}
```

## 🔧 过滤功能修复

### 文件类型过滤修复

#### 问题描述
- 文件类型过滤不准确
- 扩展名大小写问题
- 过滤结果不一致

#### 修复方案
```javascript
// 修复后的文件类型过滤
const filterByFileType = (files, fileTypes) => {
  const imageExtensions = [
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 
    'tiff', 'webp', 'svg', 'ico'
  ]
  
  const documentExtensions = [
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 
    'ppt', 'pptx', 'txt', 'rtf'
  ]
  
  const videoExtensions = [
    'mp4', 'avi', 'mov', 'wmv', 'flv', 
    'mkv', 'webm', 'm4v'
  ]
  
  const audioExtensions = [
    'mp3', 'wav', 'flac', 'aac', 'ogg', 
    'wma', 'm4a'
  ]
  
  let allowedExtensions = []
  
  switch (fileTypes) {
    case 'image':
      allowedExtensions = imageExtensions
      break
    case 'document':
      allowedExtensions = documentExtensions
      break
    case 'video':
      allowedExtensions = videoExtensions
      break
    case 'audio':
      allowedExtensions = audioExtensions
      break
    case 'all':
      return files
    default:
      allowedExtensions = imageExtensions
  }
  
  return files.filter(file => {
    const extension = file.name.split('.').pop().toLowerCase()
    return allowedExtensions.includes(extension)
  })
}
```

### 文档文件过滤修复

#### 问题描述
- 文档文件过滤功能缺失
- 支持的文件类型不完整
- 过滤逻辑有误

#### 修复方案
```javascript
// 文档文件过滤功能
const filterDocumentFiles = (files) => {
  const documentExtensions = [
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 
    'ppt', 'pptx', 'txt', 'rtf', 'csv',
    'odt', 'ods', 'odp', 'pages', 'numbers', 'keynote'
  ]
  
  return files.filter(file => {
    const extension = file.name.split('.').pop().toLowerCase()
    return documentExtensions.includes(extension)
  })
}
```

### 文件大小过滤修复

#### 问题描述
- 文件大小过滤不准确
- 单位转换错误
- 性能问题

#### 修复方案
```javascript
// 文件大小过滤
const filterByFileSize = (files, minSize, maxSize) => {
  return files.filter(file => {
    const sizeInKB = file.size / 1024
    
    if (minSize && sizeInKB < minSize) {
      return false
    }
    
    if (maxSize && sizeInKB > maxSize) {
      return false
    }
    
    return true
  })
}
```

## 🎛️ 过滤界面

### 过滤选项界面

#### 1. 文件类型选择
```vue
<template>
  <div class="file-type-selector">
    <el-radio-group v-model="selectedFileType">
      <el-radio label="image">仅图片文件</el-radio>
      <el-radio label="document">仅文档文件</el-radio>
      <el-radio label="video">仅视频文件</el-radio>
      <el-radio label="audio">仅音频文件</el-radio>
      <el-radio label="all">所有文件</el-radio>
    </el-radio-group>
  </div>
</template>
```

#### 2. 大小过滤界面
```vue
<template>
  <div class="size-filter">
    <el-form-item label="文件大小范围:">
      <el-input-number 
        v-model="minSize" 
        placeholder="最小大小(KB)"
        :min="0"
      />
      <span class="separator">-</span>
      <el-input-number 
        v-model="maxSize" 
        placeholder="最大大小(KB)"
        :min="0"
      />
    </el-form-item>
  </div>
</template>
```

#### 3. 名称过滤界面
```vue
<template>
  <div class="name-filter">
    <el-form-item label="文件名过滤:">
      <el-input 
        v-model="namePattern" 
        placeholder="支持通配符，如: *.jpg"
      />
    </el-form-item>
    
    <el-form-item label="包含关键词:">
      <el-select 
        v-model="includeKeywords" 
        multiple 
        placeholder="选择包含的关键词"
      >
        <el-option label="photo" value="photo" />
        <el-option label="image" value="image" />
        <el-option label="document" value="document" />
      </el-select>
    </el-form-item>
    
    <el-form-item label="排除关键词:">
      <el-select 
        v-model="excludeKeywords" 
        multiple 
        placeholder="选择排除的关键词"
      >
        <el-option label="temp" value="temp" />
        <el-option label="backup" value="backup" />
        <el-option label="old" value="old" />
      </el-select>
    </el-form-item>
  </div>
</template>
```

## 🔍 过滤算法

### 过滤逻辑

#### 1. 多条件过滤
```javascript
// 多条件过滤算法
const applyFilters = (files, filters) => {
  let filteredFiles = [...files]
  
  // 文件类型过滤
  if (filters.fileTypes && filters.fileTypes !== 'all') {
    filteredFiles = filterByFileType(filteredFiles, filters.fileTypes)
  }
  
  // 文件大小过滤
  if (filters.minSize || filters.maxSize) {
    filteredFiles = filterByFileSize(
      filteredFiles, 
      filters.minSize, 
      filters.maxSize
    )
  }
  
  // 文件名过滤
  if (filters.namePattern) {
    filteredFiles = filterByNamePattern(filteredFiles, filters.namePattern)
  }
  
  // 关键词过滤
  if (filters.includeKeywords && filters.includeKeywords.length > 0) {
    filteredFiles = filterByKeywords(
      filteredFiles, 
      filters.includeKeywords, 
      'include'
    )
  }
  
  if (filters.excludeKeywords && filters.excludeKeywords.length > 0) {
    filteredFiles = filterByKeywords(
      filteredFiles, 
      filters.excludeKeywords, 
      'exclude'
    )
  }
  
  return filteredFiles
}
```

#### 2. 性能优化
```javascript
// 性能优化的过滤算法
const optimizedFilter = (files, filters) => {
  // 使用Set提高查找效率
  const includeSet = new Set(filters.includeKeywords || [])
  const excludeSet = new Set(filters.excludeKeywords || [])
  
  return files.filter(file => {
    // 快速检查文件类型
    const extension = file.name.split('.').pop().toLowerCase()
    if (filters.fileTypes !== 'all') {
      const allowedTypes = getFileTypes(filters.fileTypes)
      if (!allowedTypes.includes(extension)) {
        return false
      }
    }
    
    // 快速检查文件大小
    const sizeInKB = file.size / 1024
    if (filters.minSize && sizeInKB < filters.minSize) {
      return false
    }
    if (filters.maxSize && sizeInKB > filters.maxSize) {
      return false
    }
    
    // 关键词检查
    const fileName = file.name.toLowerCase()
    if (includeSet.size > 0) {
      const hasInclude = Array.from(includeSet).some(keyword => 
        fileName.includes(keyword.toLowerCase())
      )
      if (!hasInclude) {
        return false
      }
    }
    
    if (excludeSet.size > 0) {
      const hasExclude = Array.from(excludeSet).some(keyword => 
        fileName.includes(keyword.toLowerCase())
      )
      if (hasExclude) {
        return false
      }
    }
    
    return true
  })
}
```

## 📊 过滤统计

### 过滤结果统计

#### 1. 统计信息
```javascript
// 过滤结果统计
const getFilterStats = (originalFiles, filteredFiles) => {
  return {
    totalFiles: originalFiles.length,
    filteredFiles: filteredFiles.length,
    excludedFiles: originalFiles.length - filteredFiles.length,
    filterRate: ((originalFiles.length - filteredFiles.length) / originalFiles.length * 100).toFixed(2) + '%',
    
    // 按类型统计
    byType: getTypeStats(filteredFiles),
    
    // 按大小统计
    bySize: getSizeStats(filteredFiles),
    
    // 按日期统计
    byDate: getDateStats(filteredFiles)
  }
}
```

#### 2. 可视化展示
- **饼图**: 显示文件类型分布
- **柱状图**: 显示文件大小分布
- **折线图**: 显示文件时间分布
- **统计表格**: 详细的统计信息

## 🔧 高级功能

### 自定义过滤

#### 1. 正则表达式过滤
```javascript
// 正则表达式过滤
const filterByRegex = (files, pattern) => {
  try {
    const regex = new RegExp(pattern, 'i')
    return files.filter(file => regex.test(file.name))
  } catch (error) {
    console.error('正则表达式错误:', error)
    return files
  }
}
```

#### 2. 复合条件过滤
```javascript
// 复合条件过滤
const filterByComplexCondition = (files, condition) => {
  return files.filter(file => {
    // 支持复杂的条件表达式
    return evaluateCondition(file, condition)
  })
}
```

### 过滤预设

#### 1. 预设配置
```javascript
// 过滤预设
const filterPresets = {
  photos: {
    fileTypes: 'image',
    minSize: 100,  // 100KB
    maxSize: 10240, // 10MB
    includeKeywords: ['photo', 'image', 'pic']
  },
  
  documents: {
    fileTypes: 'document',
    minSize: 1,    // 1KB
    maxSize: 51200, // 50MB
    excludeKeywords: ['temp', 'backup']
  },
  
  videos: {
    fileTypes: 'video',
    minSize: 1024,  // 1MB
    maxSize: 1048576, // 1GB
    includeKeywords: ['video', 'movie', 'clip']
  }
}
```

#### 2. 预设管理
- **保存预设**: 用户可以保存自定义过滤配置
- **导入导出**: 支持预设的导入导出
- **预设分享**: 支持预设的分享功能

## 🔮 未来改进

### 功能扩展
1. **智能过滤**: 基于AI的智能文件过滤
2. **批量过滤**: 支持批量过滤操作
3. **过滤历史**: 记录过滤历史记录
4. **过滤模板**: 提供更多过滤模板

### 性能优化
1. **并行过滤**: 支持多线程并行过滤
2. **缓存机制**: 过滤结果缓存
3. **增量过滤**: 支持增量过滤更新
4. **内存优化**: 优化大文件集的过滤性能

## 📚 相关文档

- [快速启动指南](QUICK_START.md) - 快速上手IWMS
- [功能指南](FEATURES_GUIDE.md) - 功能使用说明
- [UI界面指南](UI_GUIDE.md) - 界面使用说明
- [项目总结](PROJECT_SUMMARY.md) - 项目整体架构

---

**注意**: 本文档涵盖了IWMS的所有过滤功能，如需了解具体实现细节，请参考相关源代码。
