<template>
  <div id="app">
    <el-container>
      <el-header class="app-header">
        <div class="header-content">
          <div class="logo-section">
            <img src="/logo.png" alt="IWMS Logo" class="logo" />
            <div class="title-group">
              <h1 class="app-title">IWMS</h1>
              <div class="header-subtitle">图像仓库管理系统</div>
            </div>
          </div>
        </div>
      </el-header>
      
      <el-container>
        <!-- 左侧菜单 -->
        <el-aside :width="sidebarCollapsed ? '64px' : '250px'" class="sidebar" :class="{ 'collapsed': sidebarCollapsed }">
          <!-- 菜单切换按钮 -->
          <div class="sidebar-toggle" @click="toggleSidebar">
            <el-icon>
              <component :is="sidebarCollapsed ? 'Expand' : 'Fold'" />
            </el-icon>
          </div>
          
          <el-menu
            :default-active="activeMenu"
            class="sidebar-menu"
            @select="handleMenuSelect"
            :collapse="sidebarCollapsed"
          >
            <el-menu-item index="batch-rename">
              <div class="menu-item-content">
                <el-icon><Document /></el-icon>
                <span>批量重命名</span>
              </div>
            </el-menu-item>
            
            <el-menu-item index="file-operations" disabled>
              <div class="menu-item-content">
                <el-icon><Operation /></el-icon>
                <span>文件操作</span>
              </div>
              <el-tag size="small" type="info">即将推出</el-tag>
            </el-menu-item>
            
            <el-menu-item index="repository-related" disabled>
              <div class="menu-item-content">
                <el-icon><Box /></el-icon>
                <span>仓库相关</span>
              </div>
              <el-tag size="small" type="info">即将推出</el-tag>
            </el-menu-item>
            
            <el-menu-item index="generate-form" disabled>
              <div class="menu-item-content">
                <el-icon><EditPen /></el-icon>
                <span>生成表单</span>
              </div>
              <el-tag size="small" type="info">即将推出</el-tag>
            </el-menu-item>
            
            <el-menu-item index="delete-from-repo" disabled>
              <div class="menu-item-content">
                <el-icon><Delete /></el-icon>
                <span>从仓库删除</span>
              </div>
              <el-tag size="small" type="info">即将推出</el-tag>
            </el-menu-item>
            
            <el-menu-item index="repository-config" disabled>
              <div class="menu-item-content">
                <el-icon><Setting /></el-icon>
                <span>仓库配置</span>
              </div>
              <el-tag size="small" type="info">即将推出</el-tag>
            </el-menu-item>
          </el-menu>
          

        </el-aside>
        
        <!-- 主内容区域 -->
        <el-main class="main-content">
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
                  <el-radio-group v-model="form.fileTypes" class="file-type-radio-group">
                    <el-radio label="image" class="file-type-radio">
                      <div class="radio-content">
                        <div class="radio-icon">
                          <el-icon><Picture /></el-icon>
                        </div>
                        <div class="radio-text">
                          <div class="radio-label">仅图片文件</div>
                          <div class="radio-description">只处理图片格式文件</div>
                        </div>
                      </div>
                    </el-radio>
                    <el-radio label="all" class="file-type-radio">
                      <div class="radio-content">
                        <div class="radio-icon">
                          <el-icon><Document /></el-icon>
                        </div>
                        <div class="radio-text">
                          <div class="radio-label">所有文件</div>
                          <div class="radio-description">处理所有类型的文件</div>
                        </div>
                      </div>
                    </el-radio>
                  </el-radio-group>
                  
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
              
              <el-form-item label="图片压缩:">
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
              
              <el-form-item>
                <el-button type="primary" @click="nextStep" :disabled="!form.inputPath">
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
                <el-button type="primary" @click="nextStep" :disabled="!form.outputPath">
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
                <el-button type="primary" @click="nextStep" :disabled="!form.excelPath || mappingData.length === 0">
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
              <el-button type="primary" @click="previewChanges" :loading="previewLoading">
                预览变更
              </el-button>
            </div>
            
            <div v-else>
              <el-alert
                :title="`预览结果: 命中 ${summary.processed} 个文件，跳过 ${summary.skipped} 个文件`"
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
              
              <div style="margin-top: 20px; text-align: center;">
                <el-button @click="prevStep">上一步</el-button>
                <el-button type="primary" @click="executeRename" :loading="executing">
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
              <el-button type="success" @click="openOutputFolder">打开输出目录</el-button>
              <el-button @click="exportExecutionResults">导出执行报告</el-button>
              <el-button @click="resetApp">重新开始</el-button>
            </div>
          </el-card>
        </div>
      </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Picture, 
  Document, 
  InfoFilled,
  Expand,
  Fold,
  Operation,
  Box,
  EditPen,
  Delete,
  Setting
} from '@element-plus/icons-vue'

export default {
  name: 'App',
  components: {
    Picture,
    Document,
    InfoFilled,
    Expand,
    Fold,
    Operation,
    Box,
    EditPen,
    Delete,
    Setting
  },
  setup() {
    const currentStep = ref(0)
    const activeTab = ref('matched')
    const previewLoading = ref(false)
    const executing = ref(false)
    const activeMenu = ref('batch-rename')
    const sidebarCollapsed = ref(false)
    
    const form = reactive({
      inputPath: '',
      outputPath: '',
      excelPath: '',
      recursive: false,
      fileTypes: 'image',
      maxDimension: 0,
      conflictStrategy: 'skip'
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
        
        // 扫描文件
        const files = await window.electronAPI.scanFiles(form.inputPath, form.recursive, form.fileTypes)
        
        // 构建映射Map
        const mappingMap = new Map(mappingData.value)
        
        // 预览处理结果
        const results = []
        let processedCount = 0
        let skippedCount = 0
        let conflictCount = 0
        
        for (const filePath of files) {
          const fileName = require('path').basename(filePath)
          const { base, sequence, extension } = parseFileName(fileName)
          
          if (mappingMap.has(base)) {
            const newBase = mappingMap.get(base)
            let newFileName = newBase
            
            if (sequence) {
              newFileName += ` (${sequence})`
            }
            
            if (extension) {
              newFileName += extension
            }
            
            // 检查冲突
            const outputFilePath = require('path').join(form.outputPath, newFileName)
            const fs = require('fs-extra')
            
            if (await fs.pathExists(outputFilePath)) {
              conflictCount++
              results.push({
                sourcePath: filePath,
                originalName: fileName,
                newName: newFileName,
                status: 'conflict',
                message: '目标文件已存在'
              })
            } else {
              processedCount++
              results.push({
                sourcePath: filePath,
                originalName: fileName,
                newName: newFileName,
                status: 'success',
                message: ''
              })
            }
          } else {
            skippedCount++
            results.push({
              sourcePath: filePath,
              originalName: fileName,
              newName: '',
              status: 'skipped',
              message: '未命中映射表'
            })
          }
        }
        
        previewResults.value = results
        summary.value = {
          processed: processedCount,
          skipped: skippedCount,
          conflicts: conflictCount,
          total: files.length
        }
        
        ElMessage.success(`预览完成: 命中 ${processedCount} 个文件`)
      } catch (error) {
        ElMessage.error(`预览失败: ${error.message}`)
      } finally {
        previewLoading.value = false
      }
    }
    
    const executeRename = async () => {
      try {
        executing.value = true
        
        const mappingMap = new Map(mappingData.value)
        
        const result = await window.electronAPI.processFiles({
          inputPath: form.inputPath,
          outputPath: form.outputPath,
          mapping: mappingMap,
          files: previewResults.value.filter(r => r.status === 'success').map(r => r.sourcePath),
          conflictStrategy: form.conflictStrategy,
          maxDimension: form.maxDimension
        })
        
        executionResults.value = result.results
        executionSummary.value = result.summary
        
        ElMessage.success(`执行完成: 成功处理 ${result.summary.processed} 个文件`)
      } catch (error) {
        ElMessage.error(`执行失败: ${error.message}`)
      } finally {
        executing.value = false
      }
    }
    
    const parseFileName = (fileName) => {
      // 匹配带编号的文件名: filename (1).ext
      const numberedPattern = /^(.+?)\s*\((\d+)\)(\.[^.]+)$/
      const match = fileName.match(numberedPattern)
      
      if (match) {
        return {
          base: match[1].trim(),
          sequence: match[2],
          extension: match[3]
        }
      }
      
      // 匹配不带编号的文件名: filename.ext
      const simplePattern = /^(.+?)(\.[^.]+)$/
      const simpleMatch = fileName.match(simplePattern)
      
      if (simpleMatch) {
        return {
          base: simpleMatch[1].trim(),
          sequence: null,
          extension: simpleMatch[2]
        }
      }
      
      // 无扩展名的情况
      return {
        base: fileName,
        sequence: null,
        extension: ''
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
    
    const openOutputFolder = () => {
      // 这里可以调用系统命令打开文件夹
      ElMessage.info('请在文件管理器中手动打开输出目录')
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
      form.maxDimension = 0
      mappingData.value = []
      mappingErrors.value = []
      previewResults.value = []
      executionResults.value = []
      summary.value = {}
      executionSummary.value = {}
    }
    
    const handleMenuSelect = (index) => {
      activeMenu.value = index
      // 目前只有批量重命名功能可用
      if (index !== 'batch-rename') {
        ElMessage.info('该功能即将推出，敬请期待！')
        activeMenu.value = 'batch-rename'
      }
    }
    
    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }
    
    return {
      currentStep,
      activeTab,
      previewLoading,
      executing,
      activeMenu,
      sidebarCollapsed,
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
      resetApp,
      handleMenuSelect,
      toggleSidebar
    }
  }
}
</script>

<style>
/* 全局重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background-color: #0f172a;
  overflow: hidden;
}

#app {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  overflow: hidden;
}

/* 容器样式 */
.el-container {
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  overflow: visible;
}

/* 高级头部样式 */
.app-header {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white;
  text-align: left;
  line-height: 1;
  padding: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  height: 80px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  padding-left: 30px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo {
  width: 35px;
  height: 35px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.title-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.app-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 10px rgba(96, 165, 250, 0.3);
  line-height: 1;
}

.header-subtitle {
  font-size: 13px;
  color: #ffffff;
  font-weight: 300;
  letter-spacing: 1px;
  line-height: 1;
}

.el-main {
  padding: 20px;
  background-color: #f8fafc;
  height: calc(100vh - 80px);
  overflow-y: auto;
  overflow-x: hidden;
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

/* 确保按钮填满append区域 */
.el-input-group__append .folder-select-btn {
  width: 100%;
  height: 100%;
  border-radius: 0 6px 6px 0 !important;
  border-left: none !important;
}

/* 修复输入框右侧边框 */
.el-input__inner {
  border-right: none !important;
}

/* 移除所有分隔线 */
.el-input-group__append::before {
  display: none !important;
}

/* 确保输入框和按钮完全贴合 */
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

/* 左侧菜单样式 */
.el-aside {
  overflow: visible !important;
}

.sidebar {
  background: linear-gradient(180deg, #1e293b 0%, #334155 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  height: calc(100vh - 80px);
  overflow: visible;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.2);
  transition: width 0.3s ease;
  position: relative;
}

.sidebar.collapsed {
  width: 64px !important;
}

.sidebar-toggle {
  position: absolute;
  top: 15px;
  right: -15px;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 16px;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
  z-index: 1000;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  animation: breathe 3s ease-in-out infinite;
}

.sidebar-toggle:hover {
  transform: scale(1.2) rotate(180deg);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.6);
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  border-color: rgba(255, 255, 255, 0.4);
  animation: none;
}

.sidebar-toggle:active {
  transform: scale(1.1) rotate(180deg);
  transition: all 0.1s ease;
}

.sidebar-toggle .el-icon {
  transition: all 0.3s ease;
}

.sidebar-toggle:hover .el-icon {
  transform: scale(1.1);
}

@keyframes breathe {
  0%, 100% {
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
  }
}



.sidebar-menu {
  border: none;
  background-color: transparent;
  padding-top: 50px;
}

.sidebar.collapsed .sidebar-menu {
  padding-top: 60px;
}

.sidebar.collapsed .el-menu-item {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 8px 6px;
  padding: 0 !important;
  height: 52px;
  border-radius: 12px;
  position: relative;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.sidebar.collapsed .el-menu-item .el-icon {
  margin-right: 0 !important;
  margin-bottom: 0;
  font-size: 22px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.sidebar.collapsed .el-menu-item:hover .el-icon {
  font-size: 26px;
  transform: scale(1.1) rotate(5deg);
}

.sidebar.collapsed .el-menu-item:hover {
  transform: translateX(3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

.sidebar.collapsed .el-menu-item.is-active .el-icon {
  font-size: 24px;
  transform: scale(1.1);
}

.sidebar.collapsed .el-menu-item.is-active {
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.6);
  }
  100% {
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  }
}

.sidebar.collapsed .el-menu-item:not(.is-disabled):active {
  transform: translateX(1px) scale(0.95);
  transition: all 0.1s ease;
}

.sidebar.collapsed .el-menu-item span {
  display: none;
}

.sidebar.collapsed .el-menu-item .el-tag {
  display: none;
}

.sidebar-menu .el-menu-item {
  height: 50px;
  line-height: 50px;
  margin: 4px 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: #9ca3af;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-menu .el-menu-item:hover {
  background: linear-gradient(135deg, #4b5563 0%, #6b7280 100%);
  color: #e5e7eb;
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateX(5px);
}

.sidebar-menu .el-menu-item.is-active {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-color: #60a5fa;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
}

.sidebar-menu .el-menu-item.is-disabled {
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.5;
}

.sidebar-menu .el-menu-item.is-disabled:hover {
  background-color: transparent;
  transform: none;
}

.menu-item-content {
  display: flex;
  align-items: center;
  gap: 8px;
}



/* 主内容区域样式 */
.main-content {
  padding: 20px;
  background-color: #f8fafc;
  height: calc(100vh - 80px);
  overflow-y: auto;
}

/* 文件类型选择器样式 */
.file-type-selector {
  width: 100%;
}

.file-type-radio-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.file-type-radio {
  width: 100%;
  margin-right: 0 !important;
}

.file-type-radio .el-radio__label {
  width: 100%;
  padding-left: 0;
}

.radio-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  background: #fafafa;
}

.file-type-radio.is-checked .radio-content {
  border-color: #409eff;
  background: #f0f9ff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.radio-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #e4e7ed;
  color: #606266;
  transition: all 0.3s ease;
}

.file-type-radio.is-checked .radio-icon {
  background: #409eff;
  color: white;
}

.radio-icon .el-icon {
  font-size: 20px;
}

.radio-text {
  flex: 1;
}

.radio-label {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.radio-description {
  font-size: 14px;
  color: #909399;
  line-height: 1.4;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 200px !important;
  }
  
  .sidebar-header h3 {
    font-size: 16px;
  }
  
  .app-title {
    font-size: 24px;
  }
  
  .logo {
    width: 30px;
    height: 30px;
  }
  
  .header-content {
    padding-left: 20px;
  }

  .radio-content {
    padding: 12px;
    gap: 8px;
  }
  
  .radio-icon {
    width: 32px;
    height: 32px;
  }
  
  .radio-icon .el-icon {
    font-size: 16px;
  }
  
  .radio-label {
    font-size: 14px;
  }
  
  .radio-description {
    font-size: 12px;
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
