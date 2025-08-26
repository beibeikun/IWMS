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
        
        <el-form-item label="多线程处理:">
          <el-switch 
            v-model="settings.useMultiThread" 
            active-text="启用"
            inactive-text="禁用"
          />
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
      useMultiThread: true,
      sidebarCollapsed: false,
      autoSaveSettings: true
    }
    
    const settings = reactive({ ...defaultSettings })
    
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
        await window.electronAPI.saveSettings(settings)
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
        await window.electronAPI.saveSettings(settings)
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
        await window.electronAPI.exportSettings(settings)
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
  min-height: calc(100vh - 120px);
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
}

.settings-card {
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
}

.card-header .el-icon {
  font-size: 20px;
  color: #60a5fa;
}

.settings-form {
  margin-top: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #60a5fa;
}

.el-divider {
  margin: 30px 0 20px 0;
}

.el-divider__text {
  background: transparent;
  color: #60a5fa;
  font-weight: 600;
}

.el-form-item {
  margin-bottom: 25px;
}

.el-form-item__label {
  color: #e2e8f0;
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
}

.el-button:last-child {
  margin-right: 0;
}

/* 深色主题适配 */
:deep(.el-card) {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

:deep(.el-card__header) {
  background: rgba(51, 65, 85, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.el-input__wrapper) {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

:deep(.el-input__wrapper:hover) {
  border-color: #60a5fa;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #60a5fa;
  box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.2);
}

:deep(.el-input__inner) {
  color: #e2e8f0;
}

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  background: rgba(51, 65, 85, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #e2e8f0;
}

:deep(.el-radio__label) {
  color: #e2e8f0;
}

:deep(.el-switch__label) {
  color: #e2e8f0;
}

:deep(.el-select-dropdown) {
  background: rgba(30, 41, 59, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.el-select-dropdown__item) {
  color: #e2e8f0;
}

:deep(.el-select-dropdown__item:hover) {
  background: rgba(96, 165, 250, 0.2);
}

:deep(.el-select-dropdown__item.selected) {
  background: #60a5fa;
  color: #ffffff;
}
</style>
