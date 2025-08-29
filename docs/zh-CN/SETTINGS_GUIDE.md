# ⚙️ IWMS 设置指南

## 📋 概述

本文档涵盖了IWMS项目的所有设置相关内容，包括系统设置、侧边栏设置、子菜单功能等。

## 🎯 系统设置

### 设置功能概述

IWMS提供了完整的系统设置功能，允许用户自定义应用行为和界面显示。

### 主要设置项

#### 1. 默认配置设置
- **默认输出路径**: 设置文件处理的默认输出目录
- **默认压缩模式**: 选择图片压缩的默认模式
- **默认最大尺寸**: 设置图片压缩的默认最大尺寸
- **默认最大文件大小**: 设置文件大小的默认限制
- **默认文件类型**: 选择默认处理的文件类型
- **默认递归扫描**: 设置是否默认包含子文件夹

#### 2. 冲突处理设置
- **默认冲突策略**: 选择文件冲突时的默认处理方式
  - 跳过: 不处理冲突文件
  - 覆盖: 直接覆盖目标文件
  - 追加后缀: 自动添加后缀避免冲突

#### 3. 性能设置
- **最大线程数**: 设置文件处理的最大线程数
- **批量大小**: 设置每批处理的文件数量
- **多线程处理**: 启用/禁用多线程处理
- **内存优化**: 内存使用优化选项

#### 4. 界面设置
- **侧边栏折叠**: 控制侧边栏的默认状态
- **自动保存设置**: 是否自动保存用户设置
- **主题选择**: 选择应用主题（浅色/深色）
- **语言设置**: 选择界面语言

### 设置管理

#### 设置保存
```javascript
// 保存设置到本地存储
const saveSettings = async (settings) => {
  try {
    const settingsPath = path.join(app.getPath('userData'), 'settings.json')
    await fs.writeJson(settingsPath, settings, { spaces: 2 })
    return { success: true, message: '设置保存成功' }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

#### 设置加载
```javascript
// 从本地存储加载设置
const loadSettings = async () => {
  try {
    const settingsPath = path.join(app.getPath('userData'), 'settings.json')
    
    if (await fs.pathExists(settingsPath)) {
      return await fs.readJson(settingsPath)
    }
    
    // 返回默认设置
    return getDefaultSettings()
  } catch (error) {
    console.error('加载设置失败:', error)
    return getDefaultSettings()
  }
}
```

#### 默认设置
```javascript
// 获取默认设置
const getDefaultSettings = () => ({
  defaultOutputPath: '',
  defaultCompressionMode: 'dimension',
  defaultMaxDimension: 1920,
  defaultMaxFileSize: 500,
  defaultFileTypes: 'image',
  defaultRecursive: true,
  defaultConflictStrategy: 'skip',
  maxThreads: 4,
  batchSize: 10,
  useMultiThread: true,
  sidebarCollapsed: false,
  autoSaveSettings: true,
  theme: 'light',
  language: 'zh-CN'
})
```

## 🎛️ 侧边栏设置

### 侧边栏功能

#### 1. 侧边栏布局
- **可折叠设计**: 支持展开和折叠
- **快速访问**: 常用功能的快速入口
- **状态显示**: 显示当前处理状态
- **设置入口**: 快速访问设置面板

#### 2. 侧边栏内容
- **功能导航**: 主要功能的导航菜单
- **最近操作**: 显示最近的操作记录
- **系统状态**: 显示系统资源使用情况
- **快捷操作**: 常用操作的快捷按钮

#### 3. 侧边栏设置修复

**问题描述**: 侧边栏设置功能存在显示和保存问题
**修复内容**:
- 修复设置面板显示问题
- 优化设置保存逻辑
- 增强设置验证功能
- 完善错误处理机制

**修复代码**:
```javascript
// 侧边栏设置组件
const SidebarSettings = {
  setup() {
    const settings = ref({})
    const loading = ref(false)
    
    const saveSettings = async () => {
      loading.value = true
      try {
        const result = await window.electronAPI.saveSettings(settings.value)
        if (result.success) {
          ElMessage.success('设置保存成功')
        } else {
          ElMessage.error(`保存失败: ${result.error}`)
        }
      } catch (error) {
        ElMessage.error(`保存失败: ${error.message}`)
      } finally {
        loading.value = false
      }
    }
    
    return { settings, loading, saveSettings }
  }
}
```

## 📋 子菜单功能

### 子菜单系统

#### 1. 菜单结构
```
主菜单
├── 文件操作
│   ├── 批量重命名
│   ├── 文件整理
│   └── 文件移动
├── 设置
│   ├── 系统设置
│   ├── 界面设置
│   └── 高级设置
└── 帮助
    ├── 使用指南
    ├── 关于
    └── 反馈
```

#### 2. 子菜单特性
- **动态加载**: 根据权限和状态动态显示
- **快捷键支持**: 支持键盘快捷键操作
- **状态指示**: 显示菜单项的状态
- **分组显示**: 相关功能分组显示

#### 3. 子菜单实现
```javascript
// 子菜单数据结构
const menuItems = [
  {
    id: 'file-operations',
    label: '文件操作',
    icon: 'Document',
    children: [
      {
        id: 'batch-rename',
        label: '批量重命名',
        icon: 'Edit',
        action: () => router.push('/batch-rename')
      },
      {
        id: 'file-organize',
        label: '文件整理',
        icon: 'Folder',
        action: () => router.push('/file-organize')
      }
    ]
  },
  {
    id: 'settings',
    label: '设置',
    icon: 'Setting',
    children: [
      {
        id: 'system-settings',
        label: '系统设置',
        icon: 'Tools',
        action: () => openSettings()
      }
    ]
  }
]
```

## 🔧 设置修复

### 设置功能修复

#### 1. 设置保存修复
**问题**: 设置保存失败或数据丢失
**解决方案**:
- 增强数据验证
- 添加备份机制
- 优化错误处理
- 完善用户反馈

#### 2. 设置加载修复
**问题**: 设置加载缓慢或失败
**解决方案**:
- 异步加载设置
- 添加加载状态
- 优化文件读取
- 提供默认值

#### 3. 设置同步修复
**问题**: 设置在不同组件间不同步
**解决方案**:
- 使用全局状态管理
- 添加设置监听
- 实时同步更新
- 统一设置接口

## 🎨 主题设置

### 主题系统

#### 1. 主题类型
- **浅色主题**: 默认主题，适合日间使用
- **深色主题**: 护眼主题，适合夜间使用
- **自动主题**: 根据系统设置自动切换

#### 2. 主题切换
```javascript
// 主题切换逻辑
const switchTheme = (theme) => {
  // 更新CSS变量
  document.documentElement.setAttribute('data-theme', theme)
  
  // 保存到设置
  settings.value.theme = theme
  saveSettings()
  
  // 触发主题变更事件
  emit('theme-changed', theme)
}
```

#### 3. 主题更新
- **颜色系统**: 完整的颜色变量定义
- **组件适配**: 所有组件支持主题切换
- **动画效果**: 平滑的主题切换动画
- **持久化**: 记住用户的主题选择

## 📊 设置管理

### 设置导入导出

#### 1. 设置导出
```javascript
// 导出设置到文件
const exportSettings = async () => {
  try {
    const result = await window.electronAPI.exportSettings(settings.value)
    if (result.success) {
      ElMessage.success('设置导出成功')
    } else {
      ElMessage.error(`导出失败: ${result.error}`)
    }
  } catch (error) {
    ElMessage.error(`导出失败: ${error.message}`)
  }
}
```

#### 2. 设置导入
```javascript
// 从文件导入设置
const importSettings = async () => {
  try {
    const importedSettings = await window.electronAPI.importSettings()
    if (importedSettings) {
      settings.value = { ...settings.value, ...importedSettings }
      ElMessage.success('设置导入成功')
    }
  } catch (error) {
    ElMessage.error(`导入失败: ${error.message}`)
  }
}
```

### 设置验证

#### 1. 数据验证
```javascript
// 设置数据验证
const validateSettings = (settings) => {
  const errors = []
  
  // 验证路径
  if (settings.defaultOutputPath && !fs.existsSync(settings.defaultOutputPath)) {
    errors.push('默认输出路径不存在')
  }
  
  // 验证数值
  if (settings.maxThreads < 1 || settings.maxThreads > 16) {
    errors.push('最大线程数应在1-16之间')
  }
  
  // 验证文件大小
  if (settings.defaultMaxFileSize < 1 || settings.defaultMaxFileSize > 10000) {
    errors.push('默认最大文件大小应在1-10000KB之间')
  }
  
  return errors
}
```

#### 2. 设置重置
```javascript
// 重置为默认设置
const resetSettings = () => {
  settings.value = getDefaultSettings()
  ElMessage.success('设置已重置为默认值')
}
```

## 🔮 未来规划

### 设置功能扩展
1. **云端同步**: 支持设置云端同步
2. **多用户支持**: 支持多用户设置管理
3. **设置模板**: 提供预设的设置模板
4. **高级设置**: 更多高级配置选项

### 界面改进
1. **设置向导**: 首次使用的设置向导
2. **设置搜索**: 快速搜索设置项
3. **设置分类**: 更清晰的设置分类
4. **设置预览**: 设置效果的实时预览

## 📚 相关文档

- [快速启动指南](QUICK_START.md) - 快速上手IWMS
- [UI界面指南](UI_GUIDE.md) - 界面使用说明
- [功能指南](FEATURES_GUIDE.md) - 功能使用说明
- [项目总结](PROJECT_SUMMARY.md) - 项目整体架构

---

**注意**: 本文档涵盖了IWMS的所有设置相关内容，如需了解具体实现细节，请参考相关源代码。
