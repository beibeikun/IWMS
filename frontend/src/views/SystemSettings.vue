<template>
  <div class="system-settings-container">
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </div>
      </template>
      
      <el-form :model="settings" label-width="120px" class="settings-form">
        <!-- 基本设置 -->
        <el-divider content-position="left">
          <span class="section-title">基本设置</span>
        </el-divider>
        
        <el-form-item label="默认输出路径:">
          <el-input 
            v-model="settings.defaultOutputPath" 
            placeholder="请选择默认输出文件夹"
            readonly
          >
            <template #append>
              <el-button @click="selectDefaultOutputPath">选择文件夹</el-button>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="默认压缩模式:">
          <el-radio-group v-model="settings.defaultCompressionMode">
            <el-radio label="dimension">最长边模式</el-radio>
            <el-radio label="filesize">最大体积模式</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="默认最长边:">
          <el-input-number 
            v-model="settings.defaultMaxDimension" 
            :min="0" 
            :max="10000"
            placeholder="默认最长边像素数"
          >
            <template #append>像素</template>
          </el-input-number>
        </el-form-item>
        
        <el-form-item label="默认文件大小:">
          <el-input-number 
            v-model="settings.defaultMaxFileSize" 
            :min="0" 
            :max="10000"
            placeholder="默认最大文件大小"
          >
            <template #append>KB</template>
          </el-input-number>
        </el-form-item>
        
        <!-- 处理设置 -->
        <el-divider content-position="left">
          <span class="section-title">处理设置</span>
        </el-divider>
        
        <el-form-item label="默认文件类型:">
          <el-radio-group v-model="settings.defaultFileTypes">
            <el-radio label="image">仅图片文件</el-radio>
            <el-radio label="all">所有文件</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="默认递归扫描:">
          <el-switch 
            v-model="settings.defaultRecursive" 
            active-text="包含子文件夹"
            inactive-text="仅当前文件夹"
          />
        </el-form-item>
        
        <el-form-item label="默认冲突处理:">
          <el-select v-model="settings.defaultConflictStrategy" placeholder="选择冲突处理策略">
            <el-option label="跳过" value="skip" />
            <el-option label="覆盖" value="overwrite" />
            <el-option label="追加后缀" value="append" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="多线程使用数量:">
          <el-input-number 
            v-model="settings.maxThreads" 
            :min="1" 
            :max="16"
            placeholder="设置最大线程数"
            style="width: 200px"
          >
            <template #prepend>线程数</template>
            <template #append>个</template>
          </el-input-number>
          <div style="margin-top: 5px; color: #909399; font-size: 12px;">
            建议设置：内存 < 8GB 选择 2，内存 8-16GB 选择 4，内存 > 16GB 选择 6-8
          </div>
        </el-form-item>
        
        <el-form-item label="启用多线程:">
          <el-switch 
            v-model="settings.useMultiThread" 
            active-text="启用"
            inactive-text="禁用"
          />
          <div style="margin-top: 5px; color: #909399; font-size: 12px;">
            禁用时将使用单线程处理，内存占用更少但速度较慢
          </div>
        </el-form-item>
        
        <!-- 界面设置 -->
        <el-divider content-position="left">
          <span class="section-title">界面设置</span>
        </el-divider>
        
        <el-form-item label="侧边栏默认状态:">
          <el-radio-group v-model="settings.sidebarCollapsed">
            <el-radio :label="false">展开</el-radio>
            <el-radio :label="true">折叠</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="自动保存设置:">
          <el-switch 
            v-model="settings.autoSaveSettings" 
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
        
        <!-- 操作按钮 -->
        <el-form-item>
          <el-button type="primary" @click="saveSettings">保存设置</el-button>
          <el-button @click="resetSettings">重置默认</el-button>
          <el-button @click="exportSettings">导出设置</el-button>
          <el-button @click="importSettings">导入设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'SystemSettings',
  setup() {
    // 默认设置
    const defaultSettings = {
      defaultOutputPath: '',
      defaultCompressionMode: 'dimension',
      defaultMaxDimension: 1920,
      defaultMaxFileSize: 500,
      defaultFileTypes: 'image',
      defaultRecursive: true,
      defaultConflictStrategy: 'skip',
      maxThreads: 4,
      useMultiThread: true,
      sidebarCollapsed: false,
      autoSaveSettings: true
    }
    
    const settings = reactive({ ...defaultSettings })
    
    // 辅助函数：从reactive对象中提取普通JavaScript对象
    const extractSettings = () => {
      return {
        defaultOutputPath: settings.defaultOutputPath,
        defaultCompressionMode: settings.defaultCompressionMode,
        defaultMaxDimension: settings.defaultMaxDimension,
        defaultMaxFileSize: settings.defaultMaxFileSize,
        defaultFileTypes: settings.defaultFileTypes,
        defaultRecursive: settings.defaultRecursive,
        defaultConflictStrategy: settings.defaultConflictStrategy,
        maxThreads: settings.maxThreads,
        useMultiThread: settings.useMultiThread,
        sidebarCollapsed: settings.sidebarCollapsed,
        autoSaveSettings: settings.autoSaveSettings
      }
    }
    
    // 选择默认输出路径
    const selectDefaultOutputPath = async () => {
      try {
        const result = await window.electronAPI.selectFolder()
        if (result) {
          settings.defaultOutputPath = result
        }
      } catch (error) {
        ElMessage.error('选择文件夹失败: ' + error.message)
      }
    }
    
    // 保存设置
    const saveSettings = async () => {
      try {
        await window.electronAPI.saveSettings(extractSettings())
        ElMessage.success('设置保存成功')
      } catch (error) {
        ElMessage.error('保存设置失败: ' + error.message)
      }
    }
    
    // 重置设置
    const resetSettings = async () => {
      try {
        await ElMessageBox.confirm(
          '确定要重置所有设置为默认值吗？',
          '确认重置',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        Object.assign(settings, defaultSettings)
        await window.electronAPI.saveSettings(extractSettings())
        ElMessage.success('设置已重置为默认值')
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('重置设置失败: ' + error.message)
        }
      }
    }
    
    // 导出设置
    const exportSettings = async () => {
      try {
        await window.electronAPI.exportSettings(extractSettings())
        ElMessage.success('设置导出成功')
      } catch (error) {
        ElMessage.error('导出设置失败: ' + error.message)
      }
    }
    
    // 导入设置
    const importSettings = async () => {
      try {
        const importedSettings = await window.electronAPI.importSettings()
        if (importedSettings) {
          Object.assign(settings, importedSettings)
          ElMessage.success('设置导入成功')
        }
      } catch (error) {
        ElMessage.error('导入设置失败: ' + error.message)
      }
    }
    
    // 加载设置
    const loadSettings = async () => {
      try {
        const savedSettings = await window.electronAPI.loadSettings()
        if (savedSettings) {
          Object.assign(settings, savedSettings)
        }
      } catch (error) {
        console.warn('加载设置失败:', error.message)
      }
    }
    
    onMounted(() => {
      loadSettings()
    })
    
    return {
      settings,
      selectDefaultOutputPath,
      saveSettings,
      resetSettings,
      exportSettings,
      importSettings
    }
  }
}
</script>

<style scoped>
.system-settings-container {
  padding: 20px;
  background-color: #f8fafc;
  min-height: calc(100vh - 80px);
}

.settings-card {
  max-width: 800px;
  margin: 0 auto;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.card-header .el-icon {
  font-size: 20px;
  color: #3b82f6;
}

.settings-form {
  margin-top: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #3b82f6;
}

.el-divider {
  margin: 30px 0 20px 0;
}

.el-divider__text {
  background: transparent;
  color: #3b82f6;
  font-weight: 600;
}

.el-form-item {
  margin-bottom: 25px;
}

.el-form-item__label {
  color: #374151;
  font-weight: 500;
}

.el-input,
.el-input-number,
.el-select {
  width: 100%;
}

.el-radio-group {
  display: flex;
  gap: 20px;
}

.el-button {
  margin-right: 10px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid #dcdfe6;
  background: #ffffff;
  color: #606266;
  padding: 8px 16px;
  font-size: 14px;
}

.el-button:hover {
  background: #f5f7fa;
  border-color: #c0c4cc;
  color: #409eff;
  transform: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.el-button:last-child {
  margin-right: 0;
}

.el-button--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-color: #3b82f6;
  color: #ffffff;
}

.el-button--primary:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  border-color: #2563eb;
  color: #ffffff;
}

/* 浅色主题适配 */
:deep(.el-card) {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: none;
  color: #374151;
}

:deep(.el-card__header) {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-bottom: 1px solid #e2e8f0;
  border-radius: 12px 12px 0 0;
}

:deep(.el-input__wrapper) {
  background: #ffffff;
  border: 1px solid #d1d5db;
}

:deep(.el-input__wrapper:hover) {
  border-color: #3b82f6;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2);
}

:deep(.el-input__inner) {
  color: #374151;
}

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  background: #f8fafc;
  border: 1px solid #d1d5db;
  color: #374151;
}

:deep(.el-radio__label) {
  color: #374151;
}

:deep(.el-switch__label) {
  color: #374151;
}

:deep(.el-select-dropdown) {
  background: #ffffff;
  border: 1px solid #d1d5db;
}

:deep(.el-select-dropdown__item) {
  color: #374151;
}

:deep(.el-select-dropdown__item:hover) {
  background: #f1f5f9;
}

:deep(.el-select-dropdown__item.selected) {
  background: #3b82f6;
  color: #ffffff;
}
</style>
