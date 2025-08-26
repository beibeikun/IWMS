# 批量重命名功能更新说明

## 更新概述

简化批量重命名流程，去除第二步"选择输出路径"，直接使用系统设置中的默认输出路径，提升用户体验。

## 主要变更

### 1. 步骤流程简化

**之前的流程**：
1. 选择输入文件夹
2. 选择输出路径
3. 上传映射表
4. 预览与执行

**现在的流程**：
1. 选择输入文件夹
2. 上传映射表
3. 预览与执行

### 2. 输出路径处理

#### 自动使用系统设置
- 页面加载时自动从系统设置中读取默认输出路径
- 如果设置了默认输出路径，直接使用并显示
- 显示提示信息说明使用的是系统设置中的路径

#### 手动选择备选方案
- 如果未设置默认输出路径，显示警告提示
- 提供"手动选择输出路径"按钮作为备选方案
- 用户仍可选择手动指定输出路径

### 3. 冲突处理策略

#### 自动应用系统设置
- 从系统设置中读取默认冲突处理策略
- 在第一步中显示冲突处理选项
- 用户可以在当前操作中覆盖默认设置

#### 策略选项
- **跳过冲突文件**: 不处理冲突文件，记录到日志
- **覆盖已存在的文件**: 直接覆盖目标文件
- **自动追加后缀**: 自动添加后缀避免冲突

## 技术实现

### 1. 系统设置集成

```javascript
// 加载系统设置
const loadSystemSettings = async () => {
  try {
    const settings = await window.electronAPI.loadSettings()
    if (settings) {
      systemSettings.value = settings
      // 应用默认设置
      form.outputPath = settings.defaultOutputPath || ''
      form.recursive = settings.defaultRecursive !== undefined ? settings.defaultRecursive : true
      form.fileTypes = settings.defaultFileTypes || 'image'
      form.conflictStrategy = settings.defaultConflictStrategy || 'skip'
      form.compressionMode = settings.defaultCompressionMode || 'dimension'
      form.maxDimension = settings.defaultMaxDimension || 0
      form.maxFileSize = settings.defaultMaxFileSize || 0
    }
  } catch (error) {
    console.warn('加载系统设置失败:', error.message)
  }
}
```

### 2. 页面加载时自动应用

```javascript
// 组件挂载时加载系统设置
onMounted(() => {
  loadSystemSettings()
})
```

### 3. 条件显示逻辑

```vue
<!-- 有默认输出路径时显示 -->
<el-form-item label="输出路径:" v-if="form.outputPath">
  <el-input v-model="form.outputPath" readonly>
    <template #prepend>
      <el-icon><Folder /></el-icon>
    </template>
  </el-input>
  <div style="margin-top: 5px; color: #909399; font-size: 12px;">
    使用系统设置中的默认输出路径，可在系统设置中修改
  </div>
</el-form-item>

<!-- 无默认输出路径时显示警告 -->
<el-form-item label="输出路径:" v-else>
  <el-alert title="未设置默认输出路径" type="warning">
    <template #default>
      请在系统设置中设置默认输出路径，或点击下方按钮手动选择
    </template>
  </el-alert>
  <el-button type="primary" @click="selectOutputFolder">
    手动选择输出路径
  </el-button>
</el-form-item>
```

## 用户体验改进

### 1. 操作简化
- 减少一个步骤，流程更加简洁
- 减少重复配置，提高效率

### 2. 智能默认值
- 自动应用用户习惯的设置
- 减少每次操作的配置时间

### 3. 灵活备选
- 保留手动选择的选项
- 适应不同用户的需求

### 4. 清晰提示
- 明确显示使用的设置来源
- 提供修改设置的指引

## 验证逻辑

### 第一步验证
- 必须选择输入文件夹
- 必须有输出路径（来自系统设置或手动选择）

### 第二步验证
- 必须选择Excel映射文件
- 映射文件必须有效（有映射数据）

## 兼容性

### 向后兼容
- 保留手动选择输出路径的功能
- 不影响现有用户的使用习惯

### 设置依赖
- 依赖系统设置功能
- 如果系统设置不可用，提供备选方案

## 相关文件

### 修改的文件
- `src/views/BatchRename.vue` - 批量重命名页面

### 依赖的功能
- 系统设置功能
- IPC通信接口

### 相关文档
- `docs/zh-CN/SYSTEM_SETTINGS.md` - 系统设置功能说明
- `docs/zh-CN/SETTINGS_FIX.md` - 设置保存修复说明

## 未来规划

### 1. 智能路径建议
- 基于输入路径自动建议输出路径
- 学习用户的使用模式

### 2. 路径模板
- 支持输出路径模板
- 支持变量替换（如日期、时间等）

### 3. 批量操作优化
- 支持多个输出路径
- 支持条件输出路径

## 注意事项

1. **设置依赖**: 需要先配置系统设置才能获得最佳体验
2. **路径验证**: 确保输出路径存在且有写入权限
3. **错误处理**: 提供清晰的错误提示和解决建议
4. **用户引导**: 引导用户配置系统设置以获得更好的体验
