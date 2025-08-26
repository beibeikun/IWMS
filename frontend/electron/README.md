# IWMS Electron 主进程 - 模块化重构

## 概述

本项目已从单一的大型 `main.js` 文件重构为模块化的架构，提高了代码的可维护性、可读性和可扩展性。

## 重构前后对比

### 重构前
- **main.js**: 1348行，功能混杂，难以维护
- 所有功能集中在一个文件中
- 代码重复，逻辑复杂
- 难以定位和修改特定功能

### 重构后
- **main.js**: 约200行，只负责IPC通信和窗口管理
- 功能模块化分离，职责清晰
- 代码复用，逻辑简化
- 易于维护和扩展

## 目录结构

```
electron/
├── main.js                 # 主进程入口（简化后）
├── preload.js             # 预加载脚本
├── index.js               # 模块索引文件
├── README.md              # 本文档
├── utils/                 # 工具模块
│   ├── fileNameParser.js  # 文件名解析工具
│   ├── fileScanner.js     # 文件扫描工具
│   ├── excelProcessor.js  # Excel处理工具
│   └── reportExporter.js  # 报告导出工具
└── services/              # 服务模块
    └── renameService.js   # 重命名服务
```

## 模块说明

### 1. 工具模块 (utils/)

#### `fileNameParser.js`
- **功能**: 智能解析文件名格式
- **支持**: 带编号文件、普通文件、无扩展名文件
- **核心函数**: `parseFileName(fileName)`

#### `fileScanner.js`
- **功能**: 目录扫描和文件过滤
- **特性**: 递归扫描、文件类型过滤、文件大小过滤
- **核心函数**: `scanDirectory()`, `filterFiles()`

#### `excelProcessor.js`
- **功能**: Excel文件读取和处理
- **支持**: .xlsx, .xls, .csv 格式
- **核心函数**: `readExcelMapping()`, `validateMapping()`

#### `reportExporter.js`
- **功能**: 处理报告导出
- **格式**: CSV, TXT
- **核心函数**: `exportResultsToCSV()`, `exportSummaryReport()`

### 2. 服务模块 (services/)

#### `renameService.js`
- **功能**: 核心重命名逻辑
- **特性**: 预览、执行、冲突处理、图片压缩集成
- **核心函数**: `previewFileChanges()`, `processFiles()`

### 3. 主进程 (main.js)
- **功能**: IPC通信处理、窗口管理
- **职责**: 路由请求到相应模块、错误处理
- **简化**: 从1348行减少到约200行

## 重构优势

### 1. 可维护性
- 每个模块职责单一，易于理解和修改
- 代码结构清晰，便于定位问题
- 模块间依赖关系明确

### 2. 可扩展性
- 新增功能只需添加新模块
- 现有模块可以独立升级
- 支持插件化架构

### 3. 可测试性
- 每个模块可以独立测试
- 依赖注入，便于单元测试
- 接口清晰，测试用例编写简单

### 4. 团队协作
- 不同开发者可以并行开发不同模块
- 代码冲突减少
- 代码审查更容易

## 使用方式

### 导入模块
```javascript
// 导入特定工具
const { parseFileName } = require('./utils/fileNameParser')
const { scanDirectory } = require('./utils/fileScanner')

// 导入服务
const { processFiles } = require('./services/renameService')
```

### 模块间调用
```javascript
// 在重命名服务中使用文件名解析工具
const { parseFileName } = require('../utils/fileNameParser')

// 在报告导出中使用Excel处理工具
const { readExcelMapping } = require('../utils/excelProcessor')
```

## 开发指南

### 添加新功能
1. 在 `utils/` 或 `services/` 目录下创建新模块
2. 在 `index.js` 中导出新模块
3. 在 `main.js` 中添加相应的IPC处理器

### 修改现有功能
1. 定位到相应的模块文件
2. 修改模块内的具体功能
3. 确保模块接口保持不变

### 测试模块
1. 为每个模块编写单元测试
2. 测试模块间的集成
3. 验证整体功能正常

## 注意事项

1. **模块依赖**: 避免循环依赖，保持依赖关系清晰
2. **接口稳定**: 模块的公共接口应该保持稳定
3. **错误处理**: 每个模块都应该有完善的错误处理
4. **文档更新**: 修改模块后及时更新相关文档

## 未来规划

1. **类型支持**: 添加TypeScript支持
2. **测试覆盖**: 提高测试覆盖率
3. **性能优化**: 进一步优化模块性能
4. **插件系统**: 支持第三方插件扩展

## 总结

通过模块化重构，IWMS项目的代码质量得到了显著提升：
- 代码行数从1348行减少到约200行
- 功能模块化，职责清晰
- 维护性和可扩展性大幅提升
- 为未来的功能扩展奠定了良好基础

这种模块化的架构设计，不仅解决了当前代码维护的困难，也为项目的长期发展提供了可持续的技术基础。
