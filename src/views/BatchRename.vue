<template>
  <div class="batch-rename-container">
    <el-steps :active="currentStep" finish-status="success" align-center>
      <el-step title="选择输入文件夹" description="选择需要处理的文件所在文件夹" />
      <el-step title="选择输出路径" description="选择处理后的文件输出位置" />
      <el-step title="上传映射表" description="上传Excel映射文件" />
      <el-step title="预览与执行" description="预览变更并执行重命名" />
    </el-steps>

    <!-- 步骤1: 选择输入文件夹 -->
    <div v-if="currentStep === 0" class="step-content">
      <el-card>
        <template #header>
          <span>步骤 1: 选择输入文件夹</span>
        </template>
        
        <el-form :model="form" label-width="120px">
          <el-form-item label="输入文件夹:">
            <el-input 
              v-model="form.inputPath" 
              placeholder="请选择包含需要重命名文件的文件夹"
              readonly
            >
              <template #append>
                <el-button class="folder-select-btn" @click="selectInputFolder">选择文件夹</el-button>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="递归扫描:">
            <el-switch 
              v-model="form.recursive" 
              active-text="包含子文件夹"
              inactive-text="仅当前文件夹"
            />
          </el-form-item>
          
          <el-form-item label="文件类型:">
            <div class="file-type-selector">
              <div class="file-type-radio-group">
                <div 
                  class="file-type-option" 
                  :class="{ 'is-selected': form.fileTypes === 'image' }"
                  @click="form.fileTypes = 'image'"
                >
                  <div class="option-content">
                    <div class="option-icon">
                      <el-icon><Picture /></el-icon>
                    </div>
                    <div class="option-text">
                      <div class="option-label">仅图片文件</div>
                      <div class="option-description">只处理图片格式文件</div>
                    </div>
                    <div class="option-radio">
                      <div class="radio-dot" :class="{ 'active': form.fileTypes === 'image' }"></div>
                    </div>
                  </div>
                </div>
                
                <div 
                  class="file-type-option" 
                  :class="{ 'is-selected': form.fileTypes === 'all' }"
                  @click="form.fileTypes = 'all'"
                >
                  <div class="option-content">
                    <div class="option-icon">
                      <el-icon><Document /></el-icon>
                    </div>
                    <div class="option-text">
                      <div class="option-label">所有文件</div>
                      <div class="option-description">处理所有类型的文件</div>
                    </div>
                    <div class="option-radio">
                      <div class="radio-dot" :class="{ 'active': form.fileTypes === 'all' }"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="file-type-info" v-if="form.fileTypes === 'image'">
                <div class="info-header">
                  <el-icon><InfoFilled /></el-icon>
                  <span>支持的图片格式</span>
                </div>
                <div class="format-tags">
                  <el-tag size="small" type="success">.jpg</el-tag>
                  <el-tag size="small" type="success">.jpeg</el-tag>
                  <el-tag size="small" type="success">.png</el-tag>
                  <el-tag size="small" type="success">.gif</el-tag>
                  <el-tag size="small" type="success">.bmp</el-tag>
                  <el-tag size="small" type="success">.tiff</el-tag>
                  <el-tag size="small" type="success">.webp</el-tag>
                  <el-tag size="small" type="success">.svg</el-tag>
                  <el-tag size="small" type="success">.ico</el-tag>
                </div>
              </div>
            </div>
          </el-form-item>
          
          <el-form-item label="压缩模式:">
            <el-radio-group v-model="form.compressionMode">
              <el-radio label="dimension">最长边模式</el-radio>
              <el-radio label="filesize">最大体积模式</el-radio>
            </el-radio-group>
            <div style="margin-top: 5px; color: #909399; font-size: 12px;">
              最长边模式：按像素压缩，保持宽高比；最大体积模式：按文件大小压缩
            </div>
          </el-form-item>
          
          <el-form-item label="图片压缩:" v-if="form.compressionMode === 'dimension'">
            <el-input-number 
              v-model="form.maxDimension" 
              :min="0" 
              :max="10000"
              placeholder="输入最长边像素数，0表示不压缩"
              style="width: 100%"
            >
              <template #prepend>最长边</template>
              <template #append>像素</template>
            </el-input-number>
            <div style="margin-top: 5px; color: #909399; font-size: 12px;">
              例如: 1920 (保持宽高比，不输入则不压缩)
            </div>
          </el-form-item>
          
          <el-form-item label="图片压缩:" v-if="form.compressionMode === 'filesize'">
            <el-input-number 
              v-model="form.maxFileSize" 
              :min="0" 
              :max="10000"
              placeholder="输入目标文件大小，0表示不压缩"
              style="width: 100%"
            >
              <template #prepend>目标大小</template>
              <template #append>KB</template>
            </el-input-number>
            <div style="margin-top: 5px; color: #909399; font-size: 12px;">
              例如: 500 (压缩到500KB以下，0表示不压缩)
            </div>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="nextStep" :disabled="!form.inputPath" class="next-step-btn">
              下一步
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 步骤2: 选择输出路径 -->
    <div v-if="currentStep === 1" class="step-content">
      <el-card>
        <template #header>
          <span>步骤 2: 选择输出路径</span>
        </template>
        
        <el-form :model="form" label-width="120px">
          <el-form-item label="输出路径:">
            <el-input 
              v-model="form.outputPath" 
              placeholder="请选择处理后的文件输出位置"
              readonly
            >
              <template #append>
                <el-button class="folder-select-btn" @click="selectOutputFolder">选择文件夹</el-button>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="冲突处理策略:">
            <el-radio-group v-model="form.conflictStrategy">
              <el-radio label="skip">跳过冲突文件</el-radio>
              <el-radio label="overwrite">覆盖已存在的文件</el-radio>
              <el-radio label="append">自动追加后缀</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item>
            <el-button @click="prevStep">上一步</el-button>
            <el-button type="primary" @click="nextStep" :disabled="!form.outputPath" class="next-step-btn">
              下一步
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 步骤3: 上传映射表 -->
    <div v-if="currentStep === 2" class="step-content">
      <el-card>
        <template #header>
          <span>步骤 3: 上传Excel映射表</span>
        </template>
        
        <el-form :model="form" label-width="120px">
          <el-form-item label="映射文件:">
            <el-input 
              v-model="form.excelPath" 
              placeholder="请选择Excel映射文件（第一列=原名，第二列=新名）"
              readonly
            >
              <template #append>
                <el-button @click="selectExcelFile">选择文件</el-button>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item v-if="mappingData.length > 0">
            <el-alert
              title="映射表预览"
              type="info"
              :closable="false"
              show-icon
            />
            <el-table :data="mappingData.slice(0, 10)" style="margin-top: 10px">
              <el-table-column prop="0" label="原文件名" />
              <el-table-column prop="1" label="新文件名" />
            </el-table>
            <div v-if="mappingData.length > 10" style="margin-top: 10px; text-align: center; color: #909399;">
              显示前10条，共{{ mappingData.length }}条映射
            </div>
          </el-form-item>
          
          <el-form-item v-if="mappingErrors.length > 0">
            <el-alert
              title="映射表错误"
              type="warning"
              :closable="false"
              show-icon
            >
              <ul>
                <li v-for="error in mappingErrors" :key="error">{{ error }}</li>
              </ul>
            </el-alert>
          </el-form-item>
          
          <el-form-item>
            <el-button @click="prevStep">上一步</el-button>
            <el-button type="primary" @click="nextStep" :disabled="!form.excelPath || mappingData.length === 0" class="next-step-btn">
              下一步
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 步骤4: 预览与执行 -->
    <div v-if="currentStep === 3" class="step-content">
      <el-card>
        <template #header>
          <span>步骤 4: 预览与执行</span>
        </template>
        
        <div v-if="!previewResults.length">
          <el-alert
            title="预览说明"
            type="info"
            :closable="false"
            show-icon
            class="preview-info"
          >
            <p>点击"预览变更"按钮可以预览文件重命名的结果，包括：</p>
            <ul>
              <li>命中映射表的文件（将被重命名）</li>
              <li>跳过处理的文件（未命中映射表）</li>
              <li>冲突的文件（目标路径已存在）</li>
            </ul>
            <p>预览完成后，您可以重新预览或直接执行重命名操作。</p>
          </el-alert>
          
          <el-button type="primary" @click="previewChanges" :loading="previewLoading" class="next-step-btn">
            预览变更
          </el-button>
        </div>
        
        <div v-else>
          <el-alert
            :title="`预览结果: 命中 ${summary.processed} 个文件，跳过 ${summary.skipped} 个文件${summary.conflicts > 0 ? `，冲突 ${summary.conflicts} 个文件` : ''}`"
            type="success"
            :closable="false"
            show-icon
          />
          
          <el-tabs v-model="activeTab" style="margin-top: 20px">
            <el-tab-pane label="命中文件" name="matched">
              <el-table :data="matchedFiles" height="300">
                <el-table-column prop="originalName" label="原文件名" />
                <el-table-column prop="newName" label="新文件名" />
                <el-table-column prop="sourcePath" label="源路径" show-overflow-tooltip />
              </el-table>
            </el-tab-pane>
            
            <el-tab-pane label="跳过文件" name="skipped">
              <el-table :data="skippedFiles" height="300">
                <el-table-column prop="originalName" label="原文件名" />
                <el-table-column prop="message" label="跳过原因" />
                <el-table-column prop="sourcePath" label="源路径" show-overflow-tooltip />
              </el-table>
            </el-tab-pane>
            
            <el-tab-pane label="冲突文件" name="conflicts" v-if="conflictFiles.length > 0">
              <el-table :data="conflictFiles" height="300">
                <el-table-column prop="originalName" label="原文件名" />
                <el-table-column prop="newName" label="新文件名" />
                <el-table-column prop="message" label="冲突信息" />
              </el-table>
            </el-tab-pane>
          </el-tabs>
          
          <!-- 重新预览说明 -->
          <el-alert
            title="重新预览说明"
            type="info"
            :closable="false"
            show-icon
            class="repreview-info"
          >
            <p>如果您修改了输入文件夹、输出路径、映射表或扫描设置，建议重新预览以确保结果准确。</p>
          </el-alert>
          
          <div class="action-buttons">
            <el-button @click="prevStep">上一步</el-button>
            <el-button type="info" @click="previewChanges" :loading="previewLoading" class="repreview-btn">
              重新预览变更
            </el-button>
            <el-button type="primary" @click="executeRename" :loading="executing" class="next-step-btn">
              执行重命名
            </el-button>
            <el-button @click="exportPreviewResults">导出预览报告</el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 执行结果 -->
    <div v-if="executionResults.length > 0" class="step-content">
      <el-card>
        <template #header>
          <span>执行结果</span>
        </template>
        
        <el-alert
          :title="`执行完成: 成功 ${executionSummary.processed} 个，跳过 ${executionSummary.skipped} 个，错误 ${executionSummary.errors} 个${executionSummary.compressed ? '，压缩 ' + executionSummary.compressed + ' 个' : ''}`"
          :type="executionSummary.errors > 0 ? 'warning' : 'success'"
          :closable="false"
          show-icon
        />
        
        <el-alert
          v-if="executionSummary.compressionTime > 0"
          :title="`压缩性能: 使用 ${executionSummary.threadsUsed} 个线程，耗时 ${executionSummary.compressionTime}ms`"
          type="info"
          :closable="false"
          show-icon
        />
        
        <el-table :data="executionResults" height="400" style="margin-top: 20px">
          <el-table-column prop="originalName" label="原文件名" />
          <el-table-column prop="newName" label="新文件名" />
          <el-table-column prop="status" label="状态">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="message" label="备注/错误信息" show-overflow-tooltip />
        </el-table>
        
        <div style="margin-top: 20px; text-align: center;">
          <el-button type="success" @click="openOutputFolder" class="output-folder-btn">打开输出目录</el-button>
          <el-button @click="exportExecutionResults">导出执行报告</el-button>
          <el-button @click="resetApp">重新开始</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'BatchRename',
  setup() {
    const currentStep = ref(0)
    const activeTab = ref('matched')
    const previewLoading = ref(false)
    const executing = ref(false)
    
    const form = reactive({
      inputPath: '',
      outputPath: '',
      excelPath: '',
      recursive: false,
      fileTypes: 'image',
      maxFileSize: 0,
      conflictStrategy: 'skip',
      compressionMode: 'dimension',
      maxDimension: 0
    })
    
    const mappingData = ref([])
    const mappingErrors = ref([])
    const previewResults = ref([])
    const executionResults = ref([])
    const summary = ref({})
    const executionSummary = ref({})
    
    const matchedFiles = computed(() => 
      previewResults.value.filter(r => r.status === 'success')
    )
    
    const skippedFiles = computed(() => 
      previewResults.value.filter(r => r.status === 'skipped')
    )
    
    const conflictFiles = computed(() => 
      previewResults.value.filter(r => r.status === 'conflict')
    )
    
    const nextStep = () => {
      if (currentStep.value < 3) {
        currentStep.value++
      }
    }
    
    const prevStep = () => {
      if (currentStep.value > 0) {
        currentStep.value--
      }
    }
    
    const selectInputFolder = async () => {
      try {
        const path = await window.electronAPI.selectFolder()
        if (path) {
          form.inputPath = path
        }
      } catch (error) {
        ElMessage.error(`选择文件夹失败: ${error.message}`)
      }
    }
    
    const selectOutputFolder = async () => {
      try {
        const path = await window.electronAPI.selectFolder()
        if (path) {
          form.outputPath = path
        }
      } catch (error) {
        ElMessage.error(`选择输出文件夹失败: ${error.message}`)
      }
    }
    
    const selectExcelFile = async () => {
      try {
        const path = await window.electronAPI.selectExcelFile()
        if (path) {
          form.excelPath = path
          await loadExcelMapping()
        }
      } catch (error) {
        ElMessage.error(`选择Excel文件失败: ${error.message}`)
      }
    }
    
    const loadExcelMapping = async () => {
      try {
        const result = await window.electronAPI.readExcelMapping(form.excelPath)
        mappingData.value = result.mapping
        mappingErrors.value = result.errors
        
        if (result.errors.length > 0) {
          ElMessage.warning(`映射表存在 ${result.errors.length} 个错误，请检查`)
        }
      } catch (error) {
        ElMessage.error(`读取Excel映射表失败: ${error.message}`)
      }
    }
    
    const previewChanges = async () => {
      try {
        previewLoading.value = true
        
        const isRePreview = previewResults.value.length > 0
        
        const files = await window.electronAPI.scanFiles(form.inputPath, form.recursive, form.fileTypes)
        
        const serializableMapping = mappingData.value.map(item => {
          if (Array.isArray(item) && item.length >= 2) {
            return [String(item[0] || ''), String(item[1] || '')]
          }
          return ['', '']
        }).filter(item => item[0] && item[1])
        
        const previewResult = await window.electronAPI.previewFileChanges({
          files: files,
          mapping: serializableMapping,
          outputPath: form.outputPath
        })
        
        previewResults.value = previewResult.results
        summary.value = previewResult.summary
        
        if (isRePreview) {
          ElMessage.success(`重新预览完成: 命中 ${previewResult.summary.processed} 个文件，跳过 ${previewResult.summary.skipped} 个文件${previewResult.summary.conflicts > 0 ? `，冲突 ${previewResult.summary.conflicts} 个文件` : ''}`)
        } else {
          ElMessage.success(`预览完成: 命中 ${previewResult.summary.processed} 个文件，跳过 ${previewResult.summary.skipped} 个文件${previewResult.summary.conflicts > 0 ? `，冲突 ${previewResult.summary.conflicts} 个文件` : ''}`)
        }
      } catch (error) {
        console.error('预览失败详情:', error)
        ElMessage.error(`预览失败: ${error.message}`)
      } finally {
        previewLoading.value = false
      }
    }
    
    const executeRename = async () => {
      try {
        executing.value = true
        
        const serializableMapping = mappingData.value.map(item => {
          if (Array.isArray(item) && item.length >= 2) {
            return [String(item[0] || ''), String(item[1] || '')]
          }
          return ['', '']
        }).filter(item => item[0] && item[1])
        
        const result = await window.electronAPI.processFiles({
          inputPath: form.inputPath,
          outputPath: form.outputPath,
          mapping: serializableMapping,
          files: previewResults.value.filter(r => r.status === 'success').map(r => r.sourcePath),
          conflictStrategy: form.conflictStrategy,
          maxFileSize: form.maxFileSize,
          compressionMode: form.compressionMode,
          maxDimension: form.maxDimension
        })
        
        executionResults.value = result.results
        executionSummary.value = result.summary
        
        ElMessage.success(`执行完成: 成功处理 ${result.summary.processed} 个文件`)
      } catch (error) {
        console.error('执行失败详情:', error)
        ElMessage.error(`执行失败: ${error.message}`)
      } finally {
        executing.value = false
      }
    }
    
    const getStatusType = (status) => {
      const types = {
        success: 'success',
        skipped: 'info',
        conflict: 'warning',
        error: 'danger'
      }
      return types[status] || 'info'
    }
    
    const getStatusText = (status) => {
      const texts = {
        success: '成功',
        skipped: '跳过',
        conflict: '冲突',
        error: '错误'
      }
      return texts[status] || status
    }
    
    const openOutputFolder = async () => {
      try {
        if (!form.outputPath) {
          ElMessage.warning('请先选择输出文件夹')
          return
        }
        
        const result = await window.electronAPI.openFolder(form.outputPath)
        
        if (result.success) {
          ElMessage.success(result.message)
        } else {
          ElMessage.error(result.error)
        }
      } catch (error) {
        console.error('打开输出文件夹失败:', error)
        ElMessage.error(`打开输出文件夹失败: ${error.message}`)
      }
    }
    
    const exportPreviewResults = async () => {
      try {
        const reportPath = await window.electronAPI.exportResults(previewResults.value, form.outputPath)
        ElMessage.success(`预览报告已导出到: ${reportPath}`)
      } catch (error) {
        ElMessage.error(`导出报告失败: ${error.message}`)
      }
    }
    
    const exportExecutionResults = async () => {
      try {
        const reportPath = await window.electronAPI.exportResults(executionResults.value, form.outputPath)
        ElMessage.success(`执行报告已导出到: ${reportPath}`)
      } catch (error) {
        ElMessage.error(`导出报告失败: ${error.message}`)
      }
    }
    
    const resetApp = () => {
      currentStep.value = 0
      form.inputPath = ''
      form.outputPath = ''
      form.excelPath = ''
      form.recursive = false
      form.fileTypes = 'image'
      form.maxFileSize = 0
      form.compressionMode = 'dimension'
      form.maxDimension = 0
      mappingData.value = []
      mappingErrors.value = []
      previewResults.value = []
      executionResults.value = []
      summary.value = {}
      executionSummary.value = {}
    }
    
    return {
      currentStep,
      activeTab,
      previewLoading,
      executing,
      form,
      mappingData,
      mappingErrors,
      previewResults,
      executionResults,
      summary,
      executionSummary,
      matchedFiles,
      skippedFiles,
      conflictFiles,
      nextStep,
      prevStep,
      selectInputFolder,
      selectOutputFolder,
      selectExcelFile,
      previewChanges,
      executeRename,
      getStatusType,
      getStatusText,
      openOutputFolder,
      exportPreviewResults,
      exportExecutionResults,
      resetApp
    }
  }
}
</script>

<style scoped>
.batch-rename-container {
  padding: 20px;
  background-color: #f8fafc;
  min-height: calc(100vh - 80px);
}

.step-content {
  margin-top: 30px;
}

.el-steps {
  margin-bottom: 40px;
}

.el-steps .el-step__title {
  color: #1e293b;
  font-weight: 600;
}

.el-steps .el-step__description {
  color: #64748b;
}

.el-card {
  margin-bottom: 20px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

.el-card__header {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-bottom: 1px solid #e2e8f0;
  border-radius: 12px 12px 0 0;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-table {
  margin-top: 20px;
}

.el-alert {
  margin-bottom: 20px;
}

.el-tabs {
  margin-top: 20px;
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
}

.el-button--success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-color: #10b981;
}

.folder-select-btn {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 1px solid #cbd5e1;
  color: #475569;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.folder-select-btn:hover {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  border-color: #94a3b8;
  color: #1e293b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.folder-select-btn:active {
  transform: translateY(1px);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

/* 修复el-input append插槽的右侧空白 */
.el-input-group__append {
  padding-right: 0 !important;
  border: none !important;
  background: transparent !important;
  border-left: none !important;
}

.el-input-group__append .el-button {
  border-top-right-radius: 6px !important;
  border-bottom-right-radius: 6px !important;
  margin: 0 !important;
  border-left: none !important;
  height: 100% !important;
}

.el-input-group__append .folder-select-btn {
  width: 100%;
  height: 100%;
  border-radius: 0 6px 6px 0 !important;
  border-left: none !important;
}

.el-input__inner {
  border-right: none !important;
}

.el-input-group__append::before {
  display: none !important;
}

.el-input-group {
  border: 1px solid #dcdfe6 !important;
  border-radius: 6px !important;
  overflow: hidden !important;
}

.el-input-group .el-input__inner {
  border: none !important;
  border-radius: 0 !important;
}

.el-input-group .el-input-group__append {
  border: none !important;
  background: transparent !important;
  padding: 0 !important;
}

/* 文件类型选择器样式 */
.file-type-selector {
  width: 100%;
}

.file-type-radio-group {
  display: flex;
  flex-direction: row;
  gap: 16px;
  width: 100%;
}

.file-type-option {
  flex: 1;
  cursor: pointer;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: #fafafa;
  overflow: hidden;
}

.file-type-option:hover {
  border-color: #c0c4cc;
  background: #f5f7fa;
}

.file-type-option.is-selected {
  border-color: #409eff;
  background: #f0f9ff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.option-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 12px;
  text-align: left;
}

.option-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #e4e7ed;
  color: #606266;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.file-type-option.is-selected .option-icon {
  background: #409eff;
  color: white;
}

.option-icon .el-icon {
  font-size: 16px;
}

.option-text {
  flex: 1;
  min-width: 0;
}

.option-label {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 2px;
  line-height: 1.2;
}

.option-description {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.option-radio {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #e4e7ed;
  border: 2px solid #e4e7ed;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.file-type-option.is-selected .option-radio {
  background: #409eff;
  border-color: #409eff;
}

.radio-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: white;
  transition: all 0.3s ease;
  opacity: 0;
}

.file-type-option.is-selected .radio-dot {
  opacity: 1;
  transform: scale(1.2);
}

.file-type-info {
  margin-top: 16px;
  padding: 16px;
  background: #f0f9ff;
  border: 1px solid #d1e7ff;
  border-radius: 8px;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #409eff;
  font-weight: 600;
  font-size: 14px;
}

.format-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.format-tags .el-tag {
  margin: 0;
}

/* 按钮布局优化 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  min-width: 120px;
}

/* 预览说明样式 */
.preview-info {
  margin-bottom: 20px;
}

.preview-info ul {
  margin: 10px 0;
  padding-left: 20px;
}

.preview-info li {
  margin: 5px 0;
  line-height: 1.5;
}

/* 重新预览说明样式 */
.repreview-info {
  margin-top: 20px;
  background: #f0f9ff;
  border: 1px solid #d1e7ff;
}

.repreview-info p {
  margin: 8px 0;
  line-height: 1.5;
  color: #606266;
}

/* 按钮样式优化 */
.output-folder-btn {
  color: #ffffff !important;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.output-folder-btn:hover {
  color: #ffffff !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.output-folder-btn:active {
  color: #ffffff !important;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
}

.repreview-btn {
  color: #ffffff !important;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.repreview-btn:hover {
  color: #ffffff !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.repreview-btn:active {
  color: #ffffff !important;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
}

.next-step-btn {
  color: #ffffff !important;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.next-step-btn:hover {
  color: #ffffff !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.next-step-btn:active {
  color: #ffffff !important;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .file-type-option {
    padding: 8px;
  }
  
  .file-type-radio-group {
    flex-direction: column;
    gap: 8px;
  }
  
  .option-content {
    gap: 8px;
    padding: 8px;
  }
  
  .option-icon {
    width: 28px;
    height: 28px;
  }
  
  .option-icon .el-icon {
    font-size: 14px;
  }
  
  .option-label {
    font-size: 13px;
  }
  
  .option-description {
    font-size: 11px;
  }
  
  .format-tags {
    gap: 6px;
  }
  
  .format-tags .el-tag {
    font-size: 11px;
    padding: 2px 6px;
  }
}
</style>
