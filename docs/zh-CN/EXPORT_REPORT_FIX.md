# 导出报告问题修复说明

## 问题描述

在重命名任务中，点击"导出预览报告"和"导出执行报告"按钮时，出现以下错误：

```
导出报告失败: An object could not be cloned.
```

## 问题原因

这个错误是由于在IPC（进程间通信）中尝试传递包含不可序列化对象的数据结构导致的。具体原因包括：

1. **Vue响应式数据**: Vue的响应式数据可能包含不可序列化的内部属性
2. **对象引用**: 数据中可能包含函数、Symbol或其他不可序列化的对象
3. **IPC序列化限制**: Electron的IPC通信只能传递可序列化的数据

## 修复方案

### 1. 前端数据清理

在传递数据到主进程之前，先清理数据确保只包含可序列化的属性：

```javascript
// 清理数据，确保只传递可序列化的对象
const cleanResults = previewResults.value.map((result, index) => {
  try {
    const cleanResult = {
      sourcePath: String(result?.sourcePath || ''),
      originalName: String(result?.originalName || ''),
      newName: String(result?.newName || ''),
      status: String(result?.status || ''),
      message: String(result?.message || '')
    }
    
    // 验证清理后的数据
    Object.keys(cleanResult).forEach(key => {
      if (typeof cleanResult[key] !== 'string') {
        console.warn(`第 ${index} 项的 ${key} 字段不是字符串，强制转换`)
        cleanResult[key] = String(cleanResult[key] || '')
      }
    })
    
    return cleanResult
  } catch (itemError) {
    console.warn(`清理第 ${index} 项数据失败:`, itemError.message)
    return {
      sourcePath: '',
      originalName: '',
      newName: '',
      status: 'error',
      message: '数据清理失败'
    }
  }
})
```

### 2. 后端数据验证

在导出函数中增加数据验证和错误处理：

```javascript
async function exportResultsToCSV(results, outputPath, reportType = 'execution') {
  try {
    console.log('exportResultsToCSV: 开始导出，参数:', { 
      resultsType: typeof results, 
      resultsLength: results?.length, 
      outputPath, 
      reportType 
    })
    
    // 确保输入参数是数组
    if (!Array.isArray(results)) {
      console.warn('exportResultsToCSV: results 不是数组，转换为空数组')
      results = []
    }
    
    // 深度清理数据，只保留可序列化的属性
    const cleanResults = results.map((result, index) => {
      try {
        // 确保每个字段都是字符串类型
        const cleanResult = {
          sourcePath: String(result?.sourcePath || ''),
          originalName: String(result?.originalName || ''),
          newName: String(result?.newName || ''),
          status: String(result?.status || ''),
          message: String(result?.message || '')
        }
        
        // 验证清理后的数据
        Object.keys(cleanResult).forEach(key => {
          if (typeof cleanResult[key] !== 'string') {
            console.warn(`第 ${index} 项的 ${key} 字段不是字符串，强制转换`)
            cleanResult[key] = String(cleanResult[key] || '')
          }
        })
        
        return cleanResult
      } catch (itemError) {
        console.warn(`清理第 ${index} 项数据失败:`, itemError.message)
        return {
          sourcePath: '',
          originalName: '',
          newName: '',
          status: 'error',
          message: '数据清理失败'
        }
      }
    })
    
    // ... 生成CSV文件的代码
  } catch (error) {
    console.error('exportResultsToCSV: 导出失败:', error.message)
    return null
  }
}
```

### 3. 增强错误处理

在IPC处理函数中增加更详细的错误处理和调试信息：

```javascript
ipcMain.handle('export-results', async (event, results, outputPath) => {
  try {
    console.log('export-results: 开始导出，参数:', { 
      resultsType: typeof results, 
      resultsLength: results?.length, 
      outputPath,
      resultsSample: results?.slice(0, 2) // 只记录前两个样本用于调试
    })
    
    // 验证输入参数
    if (!results) {
      console.warn('export-results: results 参数为空')
      return {
        success: false,
        error: '结果数据为空',
        message: '没有可导出的数据'
      }
    }
    
    if (!outputPath) {
      console.warn('export-results: outputPath 参数为空')
      return {
        success: false,
        error: '输出路径为空',
        message: '请选择输出目录'
      }
    }
    
    const reportPath = await exportResultsToCSV(results, outputPath, 'execution')
    
    if (reportPath) {
      console.log('export-results: 导出成功:', reportPath)
      return {
        success: true,
        reportPath: reportPath,
        message: '报告导出成功'
      }
    } else {
      console.log('export-results: 导出失败，返回null')
      return {
        success: false,
        error: '导出函数返回null',
        message: '报告导出失败'
      }
    }
  } catch (error) {
    console.error('export-results: 捕获到异常:', error.message, error.stack)
    return {
      success: false,
      error: error.message,
      message: '报告导出失败'
    }
  }
})
```

## 修复的文件

1. **frontend/src/views/BatchRename.vue**
   - 修改 `exportPreviewResults` 函数
   - 修改 `exportExecutionResults` 函数
   - 增加数据清理和验证逻辑

2. **frontend/electron/utils/reportExporter.js**
   - 增强 `exportResultsToCSV` 函数
   - 增加数据验证和错误处理
   - 添加详细的调试日志

3. **frontend/electron/main.js**
   - 增强 `export-results` IPC处理函数
   - 增加参数验证和错误处理
   - 添加详细的调试信息

## 测试验证

修复后，导出报告功能应该能够正常工作：

1. **预览报告导出**: 点击"导出预览报告"按钮，应该成功生成CSV文件
2. **执行报告导出**: 点击"导出执行报告"按钮，应该成功生成CSV文件
3. **错误处理**: 如果出现问题，会显示详细的错误信息而不是"An object could not be cloned"

## 预防措施

为了避免类似问题再次发生：

1. **数据清理**: 在IPC通信前始终清理数据
2. **类型验证**: 确保传递的数据只包含基本类型（字符串、数字、布尔值、数组、普通对象）
3. **错误处理**: 增加详细的错误处理和调试信息
4. **测试覆盖**: 对导出功能进行充分测试

## 相关技术说明

- **IPC通信**: Electron的主进程和渲染进程之间的通信机制
- **序列化**: 将对象转换为可传输格式的过程
- **Vue响应式**: Vue的响应式系统可能包含不可序列化的内部属性
- **错误处理**: 完善的错误处理机制有助于快速定位和解决问题
