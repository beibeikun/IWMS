# 环境检测功能说明

## 功能概述

批量重命名功能现在支持环境检测，可以自动识别当前运行环境并相应地启用或禁用功能。这确保了功能的安全性和用户体验的一致性。

## 检测机制

### 1. 环境类型

- **Electron环境**: 桌面应用程序环境，具有完整的文件系统访问权限
- **网页环境**: 浏览器环境，受安全限制，无法访问本地文件系统

### 2. 检测方法

```javascript
// 检测运行环境
const checkEnvironment = async () => {
  try {
    // 检查是否在Electron环境中
    if (window.electronAPI && typeof window.electronAPI.isElectron === 'function') {
      isElectronMode.value = await window.electronAPI.isElectron()
    } else {
      isElectronMode.value = false
    }
  } catch (error) {
    console.warn('环境检测失败:', error.message)
    isElectronMode.value = false
  }
}
```

### 3. 检测逻辑

1. **API存在性检查**: 检查 `window.electronAPI` 是否存在
2. **方法可用性检查**: 检查 `isElectron` 方法是否可用
3. **功能调用**: 调用 `isElectron()` 方法获取环境状态
4. **错误处理**: 如果检测失败，默认返回 `false`（网页模式）

## 功能行为

### Electron模式

**可用功能**:
- ✅ 完整的批量重命名流程
- ✅ 文件系统访问（选择文件夹、读取文件）
- ✅ Excel映射表处理
- ✅ 文件预览和执行
- ✅ 系统设置集成
- ✅ 结果导出和报告

**UI显示**:
- 步骤向导界面
- 文件选择按钮
- Excel上传功能
- 预览和执行界面

### 网页模式

**禁用功能**:
- ❌ 文件系统访问
- ❌ 批量重命名操作
- ❌ 系统设置加载

**UI显示**:
- 环境警告提示
- 下载桌面应用按钮
- 返回首页按钮
- 隐藏所有功能界面

## 用户界面

### 环境警告界面

```vue
<!-- 环境检测提示 -->
<div v-if="!isElectronMode" class="environment-warning">
  <el-alert
    title="功能不可用"
    type="warning"
    :closable="false"
    show-icon
    class="environment-alert"
  >
    <template #default>
      <div class="warning-content">
        <p><strong>批量重命名功能仅在 Electron 桌面应用中可用</strong></p>
        <p>当前检测到您在网页环境中运行，该功能需要访问本地文件系统，因此无法使用。</p>
        <p>请下载并安装 IWMS 桌面应用以获得完整功能。</p>
        <div class="warning-actions">
          <el-button type="primary" @click="downloadApp">
            <el-icon><Download /></el-icon>
            下载桌面应用
          </el-button>
          <el-button @click="goHome">
            <el-icon><House /></el-icon>
            返回首页
          </el-button>
        </div>
      </div>
    </template>
  </el-alert>
</div>
```

### 样式设计

```css
/* 环境警告样式 */
.environment-warning {
  margin-bottom: 30px;
}

.environment-alert {
  border-radius: 12px;
  border: 2px solid #f59e0b;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.warning-content {
  padding: 10px 0;
}

.warning-content p {
  margin: 8px 0;
  line-height: 1.6;
  color: #92400e;
}

.warning-content p strong {
  color: #78350f;
  font-weight: 600;
}

.warning-actions {
  margin-top: 20px;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}
```

## 用户交互

### 下载桌面应用

```javascript
// 下载桌面应用
const downloadApp = () => {
  // 这里可以添加下载链接
  ElMessage.info('请访问项目主页下载桌面应用')
  // 可以打开新窗口到下载页面
  window.open('https://github.com/beibeikun/IWMS/releases', '_blank')
}
```

### 返回首页

```javascript
// 返回首页
const goHome = () => {
  // 使用路由导航到首页
  try {
    // 尝试使用Vue Router
    if (window.location.pathname !== '/') {
      window.history.back()
    } else {
      window.location.href = '/'
    }
  } catch (error) {
    // 如果路由导航失败，直接跳转
    window.location.href = '/'
  }
}
```

## 技术实现

### 1. API扩展

在 `electron/preload.js` 中添加环境检测API：

```javascript
/**
 * 检测是否为 Electron 环境
 * 用于判断当前是否在 Electron 应用中运行
 * 
 * @returns {boolean} 如果在 Electron 环境中返回 true，否则返回 false
 */
isElectron: () => true,
```

### 2. 组件状态管理

```javascript
// 环境状态
const isElectronMode = ref(false)

// 组件挂载时检测环境
onMounted(async () => {
  await checkEnvironment()
  if (isElectronMode.value) {
    await loadSystemSettings()
  }
})
```

### 3. 条件渲染

```vue
<!-- 功能内容（仅在Electron模式下显示） -->
<div v-if="isElectronMode">
  <!-- 批量重命名功能界面 -->
</div>
```

## 安全性考虑

### 1. 权限控制

- **网页环境**: 完全禁用文件系统访问功能
- **Electron环境**: 通过IPC通信安全访问文件系统

### 2. 错误处理

- 环境检测失败时默认禁用功能
- 提供清晰的错误提示和解决方案

### 3. 用户体验

- 明确的界面提示说明功能限制
- 提供便捷的下载和导航选项

## 测试验证

### 测试场景

1. **Electron环境检测**
   - 验证正确识别Electron环境
   - 验证功能正常启用

2. **网页环境检测**
   - 验证正确识别网页环境
   - 验证功能正确禁用

3. **部分API环境**
   - 验证API不完整时的处理
   - 验证默认行为

4. **错误处理**
   - 验证检测失败时的处理
   - 验证用户交互功能

### 测试结果

```
✅ 环境检测功能正常工作
✅ UI状态切换正确
✅ 用户交互功能完整
✅ 安全性得到保障
```

## 部署说明

### 1. 开发环境

- 在开发模式下，环境检测会正确识别Electron环境
- 功能开发和测试不受影响

### 2. 生产环境

- 网页版本会自动禁用批量重命名功能
- 桌面版本保持完整功能

### 3. 用户引导

- 网页用户会看到清晰的下载提示
- 桌面用户获得完整的功能体验

## 未来改进

### 1. 功能扩展

- 支持更多环境类型的检测
- 提供更细粒度的功能控制

### 2. 用户体验

- 添加更详细的说明文档
- 提供在线演示功能

### 3. 安全性

- 增强权限验证机制
- 添加更多安全检查

## 相关文件

### 修改的文件
- `src/views/BatchRename.vue` - 批量重命名页面
- `electron/preload.js` - 预加载脚本

### 相关文档
- `docs/zh-CN/SYSTEM_SETTINGS.md` - 系统设置功能说明
- `docs/zh-CN/BATCH_RENAME_UPDATE.md` - 批量重命名更新说明

## 使用说明

### 桌面应用用户

1. 正常使用批量重命名功能
2. 所有功能完全可用
3. 享受完整的用户体验

### 网页用户

1. 访问批量重命名页面
2. 看到环境警告提示
3. 点击"下载桌面应用"获取完整功能
4. 或点击"返回首页"继续浏览其他功能
