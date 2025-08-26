# 侧边栏设置修复说明

## 问题描述

界面设置中的侧边栏默认状态设置没有生效，用户设置的侧边栏状态在应用启动时没有被正确应用。

## 问题原因

1. **缺少设置加载**: App.vue 中的 `sidebarCollapsed` 状态是硬编码的 `false`，没有从系统设置中读取
2. **缺少自动保存**: 用户手动切换侧边栏状态时，没有自动保存到系统设置中
3. **缺少初始化**: 应用启动时没有加载和应用系统设置中的侧边栏状态

## 解决方案

### 1. 添加设置加载功能

在 App.vue 中添加加载系统设置的功能：

```javascript
// 加载系统设置
const loadSystemSettings = async () => {
  try {
    const settings = await window.electronAPI.loadSettings()
    if (settings && settings.sidebarCollapsed !== undefined) {
      sidebarCollapsed.value = settings.sidebarCollapsed
    }
  } catch (error) {
    console.warn('加载系统设置失败:', error.message)
  }
}

// 组件挂载时加载系统设置
onMounted(() => {
  loadSystemSettings()
})
```

### 2. 添加自动保存功能

修改 `toggleSidebar` 函数，使其在切换状态时自动保存：

```javascript
const toggleSidebar = async () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
  
  // 自动保存侧边栏状态到系统设置
  try {
    const settings = await window.electronAPI.loadSettings()
    if (settings) {
      settings.sidebarCollapsed = sidebarCollapsed.value
      await window.electronAPI.saveSettings(extractSettings(settings))
    }
  } catch (error) {
    console.warn('保存侧边栏状态失败:', error.message)
  }
}
```

### 3. 添加辅助函数

创建 `extractSettings` 函数来避免传递 reactive 对象：

```javascript
const extractSettings = (settings) => {
  return {
    defaultOutputPath: settings.defaultOutputPath || '',
    defaultCompressionMode: settings.defaultCompressionMode || 'dimension',
    defaultMaxDimension: settings.defaultMaxDimension || 1920,
    defaultMaxFileSize: settings.defaultMaxFileSize || 500,
    defaultFileTypes: settings.defaultFileTypes || 'image',
    defaultRecursive: settings.defaultRecursive !== undefined ? settings.defaultRecursive : true,
    defaultConflictStrategy: settings.defaultConflictStrategy || 'skip',
    useMultiThread: settings.useMultiThread !== undefined ? settings.useMultiThread : true,
    sidebarCollapsed: settings.sidebarCollapsed !== undefined ? settings.sidebarCollapsed : false,
    autoSaveSettings: settings.autoSaveSettings !== undefined ? settings.autoSaveSettings : true
  }
}
```

## 修复内容

### 1. 应用启动时加载设置
- 在 `onMounted` 钩子中调用 `loadSystemSettings()`
- 确保应用启动时应用用户设置的侧边栏状态

### 2. 实时保存状态变更
- 在 `toggleSidebar` 函数中添加自动保存逻辑
- 确保用户的手动操作能立即保存到系统设置

### 3. 默认值处理
- 提供合理的默认值（`false` 表示展开）
- 处理设置不存在的情况

## 技术实现

### 设置加载流程
1. **应用启动**: 触发 `onMounted` 钩子
2. **加载设置**: 调用 `window.electronAPI.loadSettings()`
3. **应用状态**: 将设置中的 `sidebarCollapsed` 值应用到组件状态
4. **错误处理**: 如果加载失败，使用默认值

### 状态保存流程
1. **用户操作**: 点击侧边栏切换按钮
2. **状态更新**: 更新 `sidebarCollapsed.value`
3. **加载当前设置**: 获取当前的系统设置
4. **更新设置**: 将新的侧边栏状态写入设置
5. **保存设置**: 调用 `window.electronAPI.saveSettings()`

### 数据流
```
用户设置 → 系统设置文件 → 应用启动时加载 → 侧边栏状态
用户操作 → 状态变更 → 自动保存 → 系统设置文件
```

## 用户体验改进

### 1. 设置持久化
- 用户的侧边栏偏好设置会被记住
- 应用重启后自动恢复上次的状态

### 2. 实时同步
- 手动切换侧边栏状态会立即保存
- 无需手动到系统设置页面保存

### 3. 智能默认
- 新用户使用合理的默认值（展开状态）
- 有设置的用户使用个人偏好

## 测试验证

### 测试场景
1. **设置保存**: 验证侧边栏设置能正确保存
2. **设置加载**: 验证应用启动时能正确加载设置
3. **状态切换**: 验证手动切换能自动保存
4. **默认值**: 验证没有设置时使用默认值
5. **错误处理**: 验证加载失败时的处理

### 测试结果
```
✅ 侧边栏设置保存成功
✅ 侧边栏设置加载成功
✅ 侧边栏设置值验证通过
✅ 侧边栏状态切换成功
✅ 默认值处理正确
```

## 相关功能

### 依赖功能
- 系统设置功能
- IPC通信接口
- 设置文件管理

### 影响范围
- 应用主界面的侧边栏状态
- 用户界面偏好设置
- 应用启动体验

## 预防措施

### 1. 错误处理
- 添加适当的错误捕获和处理
- 提供合理的默认值作为备选

### 2. 性能优化
- 避免频繁的设置读写操作
- 使用异步操作避免阻塞UI

### 3. 用户体验
- 确保设置变更的即时反馈
- 提供清晰的设置状态指示

## 未来改进

### 1. 设置同步
- 考虑多设备间的设置同步
- 支持云端设置备份

### 2. 高级设置
- 支持更复杂的侧边栏配置
- 支持自定义侧边栏内容

### 3. 用户反馈
- 收集用户对侧边栏设置的使用反馈
- 根据用户行为优化默认设置

## 相关文件

### 修改的文件
- `src/App.vue` - 主应用组件

### 相关文档
- `docs/zh-CN/SYSTEM_SETTINGS.md` - 系统设置功能说明
- `docs/zh-CN/SETTINGS_FIX.md` - 设置保存修复说明

## 使用说明

### 设置侧边栏默认状态
1. 进入系统设置页面
2. 在"界面设置"部分找到"侧边栏默认状态"
3. 选择"展开"或"折叠"
4. 点击"保存设置"

### 手动切换侧边栏
1. 点击侧边栏顶部的切换按钮
2. 状态会自动保存到系统设置
3. 下次启动应用时会应用保存的状态
