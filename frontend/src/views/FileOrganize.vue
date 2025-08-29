<template>
  <div class="file-organize-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack" icon="ArrowLeft" text>返回</el-button>
        <h1>整理排序</h1>
      </div>
      <div class="header-right">
        <el-button type="info" @click="previewOrganize" :loading="previewing" :disabled="!selectedFolder || !hasFiles">
          <el-icon><View /></el-icon>
          预览整理
        </el-button>
        <el-button type="primary" @click="startOrganize" :loading="organizing" :disabled="!selectedFolder || !hasFiles">
          <el-icon><Sort /></el-icon>
          开始整理
        </el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <!-- 左侧配置区域 -->
      <el-col :span="8">
        <el-card class="config-card">
          <template #header>
            <div class="card-header">
              <span>配置设置</span>
            </div>
          </template>

          <!-- 文件夹选择 -->
          <div class="config-section">
            <h3>选择文件夹</h3>
            <el-button @click="selectFolder" type="primary" style="width: 100%;">
              <el-icon><FolderOpened /></el-icon>
              选择文件夹
            </el-button>
            <div v-if="selectedFolder" class="folder-info">
              <p>已选择: {{ selectedFolder }}</p>
              <p>文件数量: {{ fileList.length }}</p>
            </div>
          </div>

          <!-- 排序规则 -->
          <div class="config-section">
            <h3>排序规则</h3>
            <el-form :model="sortConfig" label-position="top">
              <el-form-item label="主要排序">
                <el-select v-model="sortConfig.primarySort" style="width: 100%;">
                  <el-option label="按名称" value="name" />
                  <el-option label="按大小" value="size" />
                  <el-option label="按修改时间" value="mtime" />
                  <el-option label="按创建时间" value="ctime" />
                  <el-option label="按文件类型" value="type" />
                </el-select>
              </el-form-item>

              <el-form-item label="排序方向">
                <el-radio-group v-model="sortConfig.primaryOrder">
                  <el-radio label="asc">升序 (A→Z)</el-radio>
                  <el-radio label="desc">降序 (Z→A)</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="次要排序">
                <el-select v-model="sortConfig.secondarySort" style="width: 100%;">
                  <el-option label="无" value="none" />
                  <el-option label="按名称" value="name" />
                  <el-option label="按大小" value="size" />
                  <el-option label="按修改时间" value="mtime" />
                  <el-option label="按创建时间" value="ctime" />
                </el-select>
              </el-form-item>

              <el-form-item v-if="sortConfig.secondarySort !== 'none'" label="次要排序方向">
                <el-radio-group v-model="sortConfig.secondaryOrder">
                  <el-radio label="asc">升序</el-radio>
                  <el-radio label="desc">降序</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-form>
          </div>

          <!-- 文件过滤 -->
          <div class="config-section">
            <h3>文件过滤</h3>
            <el-form :model="filterConfig" label-position="top">
              <el-form-item label="文件类型">
                <el-select v-model="filterConfig.fileTypes" multiple style="width: 100%;">
                  <el-option label="图片文件" value="image" />
                  <el-option label="文档文件" value="document" />
                  <el-option label="视频文件" value="video" />
                  <el-option label="音频文件" value="audio" />
                  <el-option label="所有文件" value="all" />
                </el-select>
              </el-form-item>


            </el-form>
          </div>

          <!-- 文件整理选项 -->
          <div class="config-section">
            <h3>文件整理选项</h3>
            <el-form :model="organizeConfig" label-position="top">
              <el-form-item>
                <el-radio-group v-model="organizeConfig.primaryNoIndex">
                  <el-radio :label="true">主图无序号</el-radio>
                  <el-radio :label="false">主图也编号</el-radio>
                </el-radio-group>
                <div style="margin-top: 5px; color: #909399; font-size: 12px;">
                  <div>主图无序号：主图保持 base.ext 格式，从图编号为 base (1).ext</div>
                  <div>主图也编号：所有文件统一编号为 base (1).ext, base (2).ext...</div>
                </div>
              </el-form-item>


            </el-form>
          </div>


        </el-card>
      </el-col>

      <!-- 右侧预览区域 -->
      <el-col :span="16">
        <el-card class="preview-card">
          <template #header>
            <div class="card-header">
              <span>文件预览</span>
              <div class="header-actions">
                <el-button @click="refreshFiles" :loading="loading" size="small">
                  <el-icon><Refresh /></el-icon>
                  刷新
                </el-button>
                <el-button @click="forceGeneratePreview" :disabled="!hasFiles" size="small">
                  <el-icon><View /></el-icon>
                  强制生成预览
                </el-button>
              </div>
            </div>
          </template>

          <!-- 文件列表 -->
          <div v-if="fileList.length > 0" class="file-list">
            <el-table :data="sortedFileList" style="width: 100%" height="400">
              <el-table-column prop="name" label="文件名" min-width="200">
                <template #default="{ row }">
                  <div class="file-name">
                    <el-icon class="file-icon">
                      <component :is="getFileIcon(row.type)" />
                    </el-icon>
                    <span>{{ row.name }}</span>
                  </div>
                </template>
              </el-table-column>
              
              <el-table-column prop="size" label="大小" width="100">
                <template #default="{ row }">
                  {{ formatFileSize(row.size) }}
                </template>
              </el-table-column>
              
              <el-table-column prop="type" label="类型" width="80">
                <template #default="{ row }">
                  <el-tag size="small">{{ row.type }}</el-tag>
                </template>
              </el-table-column>
              
              <el-table-column prop="mtime" label="修改时间" width="150">
                <template #default="{ row }">
                  {{ formatDate(row.mtime) }}
                </template>
              </el-table-column>
              
              <el-table-column prop="newName" label="新名称" min-width="200">
                <template #default="{ row }">
                  <span v-if="previewData">
                    {{ getNewNameFromPreview(row) }}
                  </span>
                  <span v-else>
                    {{ row.name }}
                  </span>
                  <!-- 调试信息 -->
                  <div v-if="false" style="font-size: 10px; color: #999;">
                    预览: {{ !!previewData }}, 数据长度: {{ previewData?.length || 0 }}
                  </div>
                </template>
              </el-table-column>
            </el-table>
            
            <!-- 文件统计信息 -->
            <div class="file-stats">
              <el-row :gutter="20">
                <el-col :span="6">
                  <div class="stat-card">
                    <div class="stat-number">{{ fileList.length }}</div>
                    <div class="stat-label">总文件数</div>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="stat-card">
                    <div class="stat-number">{{ getGroupCount() }}</div>
                    <div class="stat-label">文件组数</div>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="stat-card">
                    <div class="stat-number">{{ getRenameCount() }}</div>
                    <div class="stat-label">重命名数</div>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="stat-card">
                    <div class="stat-number">{{ formatTotalSize() }}</div>
                    <div class="stat-label">总大小</div>
                  </div>
                </el-col>
              </el-row>
            </div>
            

            
            <!-- 重命名预览摘要 -->
            <div v-if="previewData" class="rename-summary">
              <h4>重命名预览摘要</h4>
              <div class="summary-content">
                <div v-for="(group, index) in getRenameGroups()" :key="index" class="group-summary">
                  <div class="group-title">{{ group.base }}</div>
                  <div class="group-files">
                    <span v-for="file in group.files" :key="file.oldName" class="file-change">
                      {{ file.oldName }} → {{ file.newName }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="empty-state">
            <el-icon class="empty-icon"><FolderOpened /></el-icon>
            <h3>暂无文件</h3>
            <p>请选择一个包含文件的文件夹</p>
            <el-button @click="selectFolder" type="primary">
              选择文件夹
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 进度对话框 -->
    <el-dialog v-model="progressVisible" title="正在整理文件" :close-on-click-modal="false" :close-on-press-escape="false">
      <div class="progress-content">
        <el-progress :percentage="progressPercentage" :status="progressStatus" />
        <p class="progress-text">{{ progressText }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'FileOrganize',
  setup() {
    const router = useRouter()
    
    // 响应式数据
    const selectedFolder = ref('')
    const fileList = ref([])
    const loading = ref(false)
    const progressVisible = ref(false)
    const progressPercentage = ref(0)
    const progressStatus = ref('')
    const progressText = ref('')
    const renamePreview = ref(null)

    // 配置对象
    const sortConfig = reactive({
      primarySort: 'name',
      primaryOrder: 'asc',
      secondarySort: 'none',
      secondaryOrder: 'asc'
    })

    const filterConfig = reactive({
      fileTypes: ['all']
    })

    // 文件整理配置
    const organizeConfig = reactive({
      primaryNoIndex: true // 主图无序号模式
    })

    // 文件名解析正则表达式
    const FILE_NAME_REGEX = /^(.+?)\s?(?:\((\d+)\))?\.(jpg|jpeg|png|tif|tiff|webp)$/i

    // 计算属性
    const hasFiles = computed(() => fileList.value.length > 0)
    
    // 强制更新的计算属性
    const previewData = computed(() => {
      console.log('previewData 计算属性触发，renamePreview:', renamePreview.value?.length)
      return renamePreview.value
    })

    // 前端文件整理逻辑
    const parseFileName = (fileName) => {
      const match = fileName.match(FILE_NAME_REGEX)
      if (!match) return null
      
      const [, base, idx, ext] = match
      return {
        base: base.trim(),
        idx: idx ? parseInt(idx) : null,
        ext: ext.toLowerCase(), // 统一转换为小写用于处理
        originalExt: ext, // 保留原始扩展名用于显示
        isMain: !idx
      }
    }

    const groupFilesByBase = (files) => {
      const groups = new Map()
      
      for (const file of files) {
        const parsed = parseFileName(file.name)
        if (!parsed) continue
        
        if (!groups.has(parsed.base)) {
          groups.set(parsed.base, [])
        }
        groups.get(parsed.base).push({
          ...file,
          parsed
        })
      }
      
      return groups
    }

    const generateRenamePlanModeA = (files, base) => {
      const renamePlan = []
      
      // 分离主图和从图
      const mainFile = files.find(f => f.parsed.isMain)
      const subFiles = files.filter(f => !f.parsed.isMain).sort((a, b) => a.parsed.idx - b.parsed.idx)
      
      // 1. 处理主图
      if (mainFile) {
        // 主图已存在，保持不变
        const targetName = `${base}.${mainFile.parsed.originalExt}`
        renamePlan.push({
          file: mainFile,
          oldName: mainFile.name,
          newName: targetName,
          reason: mainFile.name !== targetName ? '主图标准化' : '主图保持不变'
        })
      } else if (subFiles.length > 0) {
        // 无主图，将最小序号的从图提升为主图
        const promotedFile = subFiles[0]
        const targetName = `${base}.${promotedFile.parsed.originalExt}`
        renamePlan.push({
          file: promotedFile,
          oldName: promotedFile.name,
          newName: targetName,
          reason: '从图提升为主图'
        })
        subFiles.splice(0, 1) // 移除已提升的文件
      }
      
      // 2. 处理从图（压缩编号）
      for (let i = 0; i < subFiles.length; i++) {
        const file = subFiles[i]
        const newIdx = i + 1
        const targetName = `${base} (${newIdx}).${file.parsed.originalExt}`
        
        renamePlan.push({
          file: file,
          oldName: file.name,
          newName: targetName,
          reason: file.parsed.idx !== newIdx ? `从图重新编号: ${file.parsed.idx} → ${newIdx}` : '从图保持不变'
        })
      }
      
      return renamePlan
    }

    const generateRenamePlanModeB = (files, base) => {
      const renamePlan = []
      
      // 分离主图和从图，并按序号排序
      const mainFile = files.find(f => f.parsed.isMain)
      const subFiles = files.filter(f => !f.parsed.isMain).sort((a, b) => a.parsed.idx - b.parsed.idx)
      
      // 合并所有文件并按顺序排列
      const allFiles = []
      if (mainFile) allFiles.push(mainFile)
      allFiles.push(...subFiles)
      
      // 统一编号
      for (let i = 0; i < allFiles.length; i++) {
        const file = allFiles[i]
        const newIdx = i + 1
        const targetName = `${base} (${newIdx}).${file.parsed.originalExt}`
        
        let reason
        if (file.parsed.isMain) {
          reason = file.name !== targetName ? `主图编号: ${file.parsed.idx || '无'} → ${newIdx}` : '主图保持不变'
        } else {
          reason = file.name !== targetName ? `从图重新编号: ${file.parsed.idx} → ${newIdx}` : '从图保持不变'
        }
        
        renamePlan.push({
          file: file,
          oldName: file.name,
          newName: targetName,
          reason: reason
        })
      }
      
      return renamePlan
    }

    const generateRenamePlan = (groups, primaryNoIndex) => {
      const renamePlan = []
      
      for (const [base, files] of groups) {
        if (primaryNoIndex) {
          renamePlan.push(...generateRenamePlanModeA(files, base))
        } else {
          renamePlan.push(...generateRenamePlanModeB(files, base))
        }
      }
      
      return renamePlan
    }

    // 监听配置变化，重新生成预览
    const watchConfig = () => {
      console.log('watchConfig 触发:', {
        hasFiles: hasFiles.value,
        primaryNoIndex: organizeConfig.primaryNoIndex
      })
      
      if (hasFiles.value) {
        console.log('触发 generatePreview')
        generatePreview()
      } else {
        console.log('跳过 generatePreview')
        renamePreview.value = null
      }
    }

    const sortedFileList = computed(() => {
      if (!fileList.value.length) return []
      
      let sorted = [...fileList.value]
      
      // 主要排序
      sorted.sort((a, b) => {
        let comparison = 0
        
        switch (sortConfig.primarySort) {
          case 'name':
            comparison = a.name.localeCompare(b.name)
            break
          case 'size':
            comparison = a.size - b.size
            break
          case 'mtime':
            comparison = new Date(a.mtime) - new Date(b.mtime)
            break
          case 'ctime':
            comparison = new Date(a.ctime) - new Date(b.ctime)
            break
          case 'type':
            comparison = a.type.localeCompare(b.type)
            break
        }
        
        return sortConfig.primaryOrder === 'asc' ? comparison : -comparison
      })
      
      // 次要排序
      if (sortConfig.secondarySort !== 'none') {
        sorted.sort((a, b) => {
          let comparison = 0
          
          switch (sortConfig.secondarySort) {
            case 'name':
              comparison = a.name.localeCompare(b.name)
              break
            case 'size':
              comparison = a.size - b.size
              break
            case 'mtime':
              comparison = new Date(a.mtime) - new Date(b.mtime)
              break
            case 'ctime':
              comparison = new Date(a.ctime) - new Date(b.ctime)
              break
          }
          
          return sortConfig.secondaryOrder === 'asc' ? comparison : -comparison
        })
      }
      
      return sorted
    })

    // 方法
    const goBack = () => {
      router.push('/file-operations')
    }

    const selectFolder = async () => {
      try {
        const folderPath = await window.electronAPI.selectFolder()
        if (folderPath) {
          selectedFolder.value = folderPath
          await loadFiles()
        }
      } catch (error) {
        ElMessage.error(`选择文件夹失败: ${error.message}`)
      }
    }

    const loadFiles = async () => {
      if (!selectedFolder.value) return
      
      loading.value = true
      try {
        // 使用真实的文件扫描功能 - 总是扫描所有文件，然后在前端过滤
        const filePaths = await window.electronAPI.scanFiles(
          selectedFolder.value, 
          false, // 不递归扫描
          'all' // 扫描所有文件，在前端进行类型过滤
        )
        
        // 获取文件详细信息
        const files = []
        for (const filePath of filePaths) {
          try {
            const fileName = filePath.split('/').pop() || filePath.split('\\').pop()
            const fileExt = fileName.split('.').pop()?.toLowerCase() || ''
            
            // 过滤系统文件
            const systemFiles = ['.DS_Store', '.Thumbs.db', 'desktop.ini', '.Spotlight-V100', '.Trashes', '.fseventsd']
            if (systemFiles.includes(fileName) || fileName.startsWith('._')) {
              continue // 跳过系统文件
            }
            
            // 获取文件统计信息
            const stats = await window.electronAPI.getFileStats(filePath)
            
            // 确定文件类型
            let fileType = 'other'
            if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExt)) {
              fileType = 'image'
            } else if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(fileExt)) {
              fileType = 'document'
            } else if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(fileExt)) {
              fileType = 'video'
            } else if (['mp3', 'wav', 'flac', 'aac'].includes(fileExt)) {
              fileType = 'audio'
            }
            
            // 根据过滤配置过滤文件
            const shouldInclude = filterConfig.fileTypes.includes('all') || 
                                 filterConfig.fileTypes.includes(fileType)
            
            if (shouldInclude) {
              files.push({
                name: fileName,
                path: filePath,
                size: stats.size || 0,
                type: fileType,
                mtime: new Date(stats.mtime || Date.now()),
                ctime: new Date(stats.birthtime || Date.now()),
                extension: fileExt
              })
            }
          } catch (error) {
            console.warn(`获取文件信息失败: ${filePath}`, error.message)
          }
        }
        
        fileList.value = files
        
        if (files.length > 0) {
          ElMessage.success(`已加载 ${files.length} 个文件`)
          
          // 自动生成预览
          console.log('文件加载完成，自动生成预览')
          generatePreview()
          
          // 验证预览数据
          if (renamePreview.value) {
            console.log('预览数据生成成功:', renamePreview.value.length, '个重命名计划')
          } else {
            console.log('预览数据生成失败')
          }
        } else {
          ElMessage.warning('选择的文件夹中没有找到文件')
        }
      } catch (error) {
        console.error('加载文件失败:', error)
        ElMessage.error(`加载文件失败: ${error.message}`)
        fileList.value = []
      } finally {
        loading.value = false
      }
    }

    const refreshFiles = () => {
      loadFiles()
    }

    const previewing = ref(false)
    const organizing = ref(false)



    const forceGeneratePreview = () => {
      console.log('强制生成预览')
      generatePreview()
      if (renamePreview.value) {
        ElMessage.success(`强制生成预览成功，共 ${renamePreview.value.length} 个重命名计划`)
      } else {
        ElMessage.warning('预览生成失败')
      }
    }

    // 获取文件组数
    const getGroupCount = () => {
      if (!previewData.value) return 0
      const groups = new Set()
      previewData.value.forEach(plan => {
        const parsed = parseFileName(plan.file.name)
        if (parsed) {
          groups.add(parsed.base)
        }
      })
      return groups.size
    }

    // 获取重命名数量
    const getRenameCount = () => {
      if (!previewData.value) return 0
      return previewData.value.filter(plan => plan.oldName !== plan.newName).length
    }

    // 格式化总大小
    const formatTotalSize = () => {
      const totalBytes = fileList.value.reduce((sum, file) => sum + file.size, 0)
      return formatFileSize(totalBytes)
    }

    // 获取重命名组信息
    const getRenameGroups = () => {
      if (!previewData.value) return []
      
      const groups = new Map()
      previewData.value.forEach(plan => {
        const parsed = parseFileName(plan.file.name)
        if (parsed) {
          if (!groups.has(parsed.base)) {
            groups.set(parsed.base, [])
          }
          groups.get(parsed.base).push({
            oldName: plan.oldName,
            newName: plan.newName,
            reason: plan.reason
          })
        }
      })
      
      return Array.from(groups.entries()).map(([base, files]) => ({
        base,
        files
      }))
    }

    // 生成预览函数 - 使用前端逻辑
    const generatePreview = () => {
              console.log('generatePreview 调用:', { 
          hasFiles: hasFiles.value, 
          fileCount: fileList.value.length 
        })
        
        if (!hasFiles.value) {
        console.log('generatePreview 跳过：无文件')
        renamePreview.value = null
        return
      }

      try {
        console.log('开始生成预览，文件列表:', fileList.value.map(f => f.name))
        
        // 使用前端逻辑生成重命名计划
        const groups = groupFilesByBase(fileList.value)
        console.log('分组结果:', Array.from(groups.keys()))
        
        const renamePlan = generateRenamePlan(groups, organizeConfig.primaryNoIndex)
        console.log('重命名计划长度:', renamePlan.length)
        
        // 添加不匹配的文件（保持原名称）
        const processedFiles = new Set()
        for (const plan of renamePlan) {
          processedFiles.add(plan.file.name)
        }

        for (const file of fileList.value) {
          if (!processedFiles.has(file.name)) {
            renamePlan.push({
              file: file,
              oldName: file.name,
              newName: file.name,
              reason: '不匹配的文件，保持原名称'
            })
          }
        }
        
        // 保存预览数据
        renamePreview.value = renamePlan
        console.log('前端生成预览数据成功:', renamePreview.value)
        console.log('预览数据长度:', renamePreview.value?.length)
        
        // 调试：打印每个重命名计划
        renamePreview.value.forEach((plan, index) => {
          console.log(`重命名计划 ${index + 1}: ${plan.oldName} → ${plan.newName} (${plan.reason})`)
        })
        
        // 强制触发响应式更新
        console.log('强制触发响应式更新')
        nextTick(() => {
          console.log('nextTick 执行，预览数据已更新')
        })
        
      } catch (error) {
        console.error('前端生成预览失败:', error)
        renamePreview.value = null
      }
    }

    const previewOrganize = async () => {
      if (!selectedFolder.value || !hasFiles.value) {
        ElMessage.warning('请先选择文件夹并确保有文件')
        return
      }

      previewing.value = true
      try {
        // 使用前端逻辑生成预览
        generatePreview()
        
        if (renamePreview.value && renamePreview.value.length > 0) {
          const willRename = renamePreview.value.filter(plan => plan.oldName !== plan.newName).length
          const groups = new Set(renamePreview.value.map(plan => {
            const parsed = parseFileName(plan.file.name)
            return parsed ? parsed.base : null
          }).filter(Boolean))
          
          ElMessage.success(`预览完成！将处理 ${groups.size} 个文件组，重命名 ${willRename} 个文件`)
          
          // 显示预览结果
          ElMessageBox.alert(
            `预览结果：\n` +
            `- 总文件数：${fileList.value.length}\n` +
            `- 处理组数：${groups.size}\n` +
            `- 重命名数：${willRename}\n` +
            `- 文件组：${Array.from(groups).join(', ')}`,
            '预览结果',
            {
              confirmButtonText: '确定',
              type: 'info'
            }
          )
        } else {
          ElMessage.warning('没有找到需要整理的文件')
        }
      } catch (error) {
        ElMessage.error(`预览失败: ${error.message}`)
      } finally {
        previewing.value = false
      }
    }

    const startOrganize = async () => {
      if (!selectedFolder.value || !hasFiles.value) {
        ElMessage.warning('请先选择文件夹并确保有文件')
        return
      }

      try {
        const confirmed = await ElMessageBox.confirm(
          '确定要开始整理文件吗？此操作将重命名文件，请确保已备份重要文件。',
          '确认操作',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        if (confirmed) {
          organizing.value = true
          progressVisible.value = true
          progressPercentage.value = 0
          progressStatus.value = ''
          progressText.value = '正在准备整理...'

          try {
            // 创建可序列化的文件对象副本
            const serializableFiles = fileList.value.map(file => ({
              name: file.name,
              path: file.path,
              size: file.size,
              type: file.type,
              extension: file.extension,
              mtime: file.mtime instanceof Date ? file.mtime.getTime() : file.mtime,
              ctime: file.ctime instanceof Date ? file.ctime.getTime() : file.ctime
            }))

            const result = await window.electronAPI.executeFileOrganize({
              files: serializableFiles,
              folderPath: selectedFolder.value,
              primaryNoIndex: organizeConfig.primaryNoIndex
            })

            if (result.success) {
              progressPercentage.value = 100
              progressStatus.value = 'success'
              progressText.value = '整理完成！'

              ElMessage.success(
                `文件整理完成！\n` +
                `- 成功重命名：${result.stats.renamedFiles} 个文件\n` +
                `- 处理组数：${result.stats.processedFiles} 个\n` +
                `- 失败文件：${result.stats.failedFiles} 个`
              )

              // 重新加载文件列表
              await loadFiles()
            } else {
              progressStatus.value = 'exception'
              progressText.value = '整理失败！'
              ElMessage.error(`整理失败: ${result.error}`)
            }
          } catch (error) {
            progressStatus.value = 'exception'
            progressText.value = '整理失败！'
            ElMessage.error(`整理失败: ${error.message}`)
          }

          setTimeout(() => {
            progressVisible.value = false
          }, 2000)
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error(`整理失败: ${error.message}`)
        }
      } finally {
        organizing.value = false
      }
    }

    const getFileIcon = (type) => {
      const iconMap = {
        image: 'Picture',
        document: 'Document',
        video: 'VideoPlay',
        audio: 'Headset',
        all: 'Document'
      }
      return iconMap[type] || 'Document'
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('zh-CN')
    }

    // 从预览数据中获取新名称
    const getNewNameFromPreview = (file) => {
      if (!previewData.value) {
        console.log(`getNewNameFromPreview: 无预览数据，返回原名称: ${file.name}`)
        return file.name
      }

      console.log(`getNewNameFromPreview: 查找文件 ${file.name} 的重命名计划`)
      console.log(`getNewNameFromPreview: 预览数据长度: ${previewData.value.length}`)
      
      // 使用文件名进行匹配，避免对象引用问题
      const plan = previewData.value.find(p => p.file.name === file.name)
      if (plan) {
        console.log(`找到重命名计划: ${file.name} → ${plan.newName}`)
        return plan.newName
      }
      
      console.log(`未找到重命名计划: ${file.name}`)
      console.log(`可用的重命名计划:`, previewData.value.map(p => `${p.file.name} → ${p.newName}`))
      return file.name
    }

    // 添加监听器
    watch(() => organizeConfig.primaryNoIndex, watchConfig)
    
    // 监听文件类型过滤配置变化，重新加载文件
    watch(() => filterConfig.fileTypes, () => {
      console.log('文件类型过滤配置变化:', filterConfig.fileTypes)
      if (selectedFolder.value) {
        console.log('重新加载文件以应用新的过滤配置')
        loadFiles()
      }
    })
    
    // 监听文件列表变化，自动生成预览
    watch(() => fileList.value.length, (newLength, oldLength) => {
      console.log(`文件列表长度变化: ${oldLength} → ${newLength}`)
      if (newLength > 0) {
        console.log('文件列表变化，自动生成预览')
        generatePreview()
      }
    })
    
    // 组件挂载时的初始化
    onMounted(() => {
      console.log('FileOrganize 组件挂载完成')
    })

    return {
      selectedFolder,
      fileList,
      loading,
      progressVisible,
      progressPercentage,
      progressStatus,
      progressText,
      sortConfig,
      filterConfig,
      organizeConfig,
      hasFiles,
      previewData,
      sortedFileList,
      goBack,
      selectFolder,
      loadFiles,
      refreshFiles,
      forceGeneratePreview,
      previewOrganize,
      startOrganize,
      getFileIcon,
      formatFileSize,
      formatDate,
      getNewNameFromPreview,
      getGroupCount,
      getRenameCount,
      formatTotalSize,
      getRenameGroups
    }
  }
}
</script>

<style scoped>
.file-organize-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-left h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
}

.config-card, .preview-card {
  height: calc(100vh - 200px);
  overflow-y: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.config-section {
  margin-bottom: 30px;
}

.config-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

.folder-info {
  margin-top: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.folder-info p {
  margin: 5px 0;
  font-size: 14px;
  color: #666;
}

.file-list {
  height: 100%;
}

.file-stats {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-card {
  text-align: center;
  padding: 15px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.rename-summary {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.rename-summary h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.group-summary {
  background: white;
  padding: 15px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.group-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 14px;
}

.group-files {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.file-change {
  background: #e1f5fe;
  color: #0277bd;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
}

.quick-actions {
  margin-top: 20px;
}

.action-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  height: 100%;
}

.action-card h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.status-item:last-child {
  border-bottom: none;
}

.status-label {
  font-size: 12px;
  color: #666;
}

.status-value {
  font-size: 12px;
  font-weight: 500;
  color: #2c3e50;
}

.status-enabled {
  color: #67c23a;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  color: #409eff;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  color: #ddd;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 18px;
  color: #666;
  margin: 0 0 10px 0;
}

.empty-state p {
  color: #999;
  margin: 0 0 20px 0;
}

.progress-content {
  text-align: center;
}

.progress-text {
  margin-top: 15px;
  color: #666;
}

.text-muted {
  color: #999;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .config-card, .preview-card {
    height: auto;
    margin-bottom: 20px;
  }
}
</style>
