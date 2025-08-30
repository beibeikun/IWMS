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

              <!-- 按前缀分文件夹选项 -->
              <el-form-item>
                <el-checkbox v-model="organizeConfig.groupByPrefix">
                  按前缀分文件夹
                </el-checkbox>
                <div style="margin-top: 5px; color: #909399; font-size: 12px;">
                  <div>开启后，将按文件名前缀自动创建子文件夹并移动文件</div>
                </div>
              </el-form-item>

              <!-- 递归模式选项 -->
              <el-form-item v-if="organizeConfig.groupByPrefix">
                <el-checkbox v-model="organizeConfig.recursive">
                  递归模式
                </el-checkbox>
                <div style="margin-top: 5px; color: #909399; font-size: 12px;">
                  <div>开启后，将处理子目录中的文件（默认仅处理根目录第一层）</div>
                </div>
              </el-form-item>

              <!-- 冲突处理策略 -->
              <el-form-item v-if="organizeConfig.groupByPrefix">
                <label>冲突处理策略</label>
                <el-select v-model="organizeConfig.conflictPolicy" style="width: 100%;">
                  <el-option label="跳过已存在文件" value="keep" />
                  <el-option label="覆盖目标文件" value="overwrite" />
                  <el-option label="重命名冲突文件" value="rename" />
                </el-select>
                <div style="margin-top: 5px; color: #909399; font-size: 12px;">
                  <div>当目标位置已存在同名文件时的处理方式</div>
                </div>
              </el-form-item>

              <!-- 目录名清洗 -->
              <el-form-item v-if="organizeConfig.groupByPrefix">
                <el-checkbox v-model="organizeConfig.sanitizeFolderName">
                  清洗目录名
                </el-checkbox>
                <div style="margin-top: 5px; color: #909399; font-size: 12px;">
                  <div>开启后，将替换目录名中的非法字符（\/:*?"<>| → _）</div>
                </div>
              </el-form-item>

              <!-- 大小写敏感 -->
              <el-form-item v-if="organizeConfig.groupByPrefix">
                <el-checkbox v-model="organizeConfig.caseSensitivePrefix">
                  前缀大小写敏感
                </el-checkbox>
                <div style="margin-top: 5px; color: #909399; font-size: 12px;">
                  <div>开启后，a-1 与 A-1 将分别创建不同的文件夹</div>
                </div>
              </el-form-item>

              <!-- 生成移动日志 -->
              <el-form-item v-if="organizeConfig.groupByPrefix">
                <el-checkbox v-model="organizeConfig.logMoveCsv">
                  生成移动日志
                </el-checkbox>
                <div style="margin-top: 5px; color: #909399; font-size: 12px;">
                  <div>开启后，将生成 move_log.csv 文件记录所有移动操作</div>
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
            <el-table 
              :data="paginatedFileList" 
              style="width: 100%" 
              height="400"
              :size="isSmallScreen ? 'small' : 'default'"
            >
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
              
              <el-table-column 
                prop="mtime" 
                label="修改时间" 
                width="150"
                :show-overflow-tooltip="true"
                class-name="hidden-on-mobile"
              >
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
            
            <!-- 分页组件 -->
            <div class="pagination-container">
              <!-- 调试信息 -->
              <div v-if="false" style="font-size: 12px; color: #999; margin-bottom: 5px;">
                调试: 总数={{ sortedFileList.length }}, 当前页={{ currentPage }}, 每页={{ pageSize }}, 布局={{ paginationLayout }}
              </div>
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="getPageSizes()"
                :total="sortedFileList.length"
                :layout="paginationLayout"
                :small="isExtraSmallScreen || isUltraSmallScreen"
                :background="true"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
            
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
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
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
    
    // 分页相关数据
    const currentPage = ref(1)
    const pageSize = ref(50) // 每页显示50条记录
    
    // 响应式分页布局
    const paginationLayout = computed(() => {
      // 根据窗口宽度动态调整分页布局
      const width = window.innerWidth
      if (width < 480) {
        // 窄屏幕：将左中右组件分成三行显示
        return 'total, sizes, prev, pager, next, jumper'
      } else if (width < 640) {
        // 小屏幕：简化布局
        return 'total, sizes, prev, pager, next'
      } else if (width < 768) {
        // 中等小屏幕：添加总数显示
        return 'total, sizes, prev, pager, next'
      } else {
        // 中等及以上屏幕：完整布局
        return 'total, sizes, prev, pager, next, jumper'
      }
    })

    // 判断是否为小屏幕
    const isSmallScreen = computed(() => {
      return window.innerWidth < 768
    })

    // 判断是否为超小屏幕
    const isExtraSmallScreen = computed(() => {
      return window.innerWidth < 480
    })

    // 判断是否为极窄屏幕
    const isUltraSmallScreen = computed(() => {
      return window.innerWidth < 360
    })

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
      primaryNoIndex: true, // 主图无序号模式
      groupByPrefix: false, // 按前缀分文件夹
      recursive: false, // 递归模式
      conflictPolicy: 'keep', // 冲突处理策略
      sanitizeFolderName: true, // 目录名清洗（默认开启）
      caseSensitivePrefix: false, // 前缀大小写敏感
      logMoveCsv: true // 生成移动日志（默认开启）
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

    // 分页后的文件列表
    const paginatedFileList = computed(() => {
      const startIndex = (currentPage.value - 1) * pageSize.value
      const endIndex = startIndex + pageSize.value
      return sortedFileList.value.slice(startIndex, endIndex)
    })

    // 总页数
    const totalPages = computed(() => {
      return Math.ceil(sortedFileList.value.length / pageSize.value)
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

            // 添加调试信息
            console.log('开始执行文件整理，配置参数:', {
              groupByPrefix: organizeConfig.groupByPrefix,
              recursive: organizeConfig.recursive,
              conflictPolicy: organizeConfig.conflictPolicy,
              sanitizeFolderName: organizeConfig.sanitizeFolderName,
              caseSensitivePrefix: organizeConfig.caseSensitivePrefix,
              logMoveCsv: organizeConfig.logMoveCsv
            })

            const result = await window.electronAPI.executeFileOrganize({
              files: serializableFiles,
              folderPath: selectedFolder.value,
              primaryNoIndex: organizeConfig.primaryNoIndex,
              groupByPrefix: organizeConfig.groupByPrefix,
              recursive: organizeConfig.recursive,
              conflictPolicy: organizeConfig.conflictPolicy,
              sanitizeFolderName: organizeConfig.sanitizeFolderName,
              caseSensitivePrefix: organizeConfig.caseSensitivePrefix,
              logMoveCsv: organizeConfig.logMoveCsv
            })

            console.log('文件整理结果:', result)

            if (result.success) {
              progressPercentage.value = 100
              progressStatus.value = 'success'
              progressText.value = '整理完成！'

              let message = `文件整理完成！\n` +
                `- 成功重命名：${result.stats.renamedFiles} 个文件\n` +
                `- 处理组数：${result.stats.processedFiles} 个\n` +
                `- 失败文件：${result.stats.failedFiles} 个`
              
              // 如果启用了按前缀分文件夹，显示相关统计
              if (organizeConfig.groupByPrefix && result.stats.prefixGrouping) {
                const pg = result.stats.prefixGrouping
                message += `\n\n按前缀分文件夹结果：\n` +
                  `- 成功移动：${pg.movedFiles} 个文件\n` +
                  `- 跳过文件：${pg.skippedFiles} 个\n` +
                  `- 失败文件：${pg.failedFiles} 个\n` +
                  `- 创建文件夹：${pg.createdFolders} 个`
              }

              ElMessage.success(message)

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
    
    // 监听排序配置变化，重置分页
    watch([() => sortConfig.primarySort, () => sortConfig.primaryOrder, () => sortConfig.secondarySort, () => sortConfig.secondaryOrder], () => {
      currentPage.value = 1
    })
    
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
        // 重置分页到第一页
        currentPage.value = 1
        // 确保分页组件正确更新
        nextTick(() => {
          console.log('分页组件更新完成，总数:', sortedFileList.value.length)
        })
      }
    })
    
    // 分页处理方法
    const handleSizeChange = (newSize) => {
      pageSize.value = newSize
      currentPage.value = 1 // 重置到第一页
    }

    const handleCurrentChange = (newPage) => {
      currentPage.value = newPage
    }

    // 根据屏幕大小动态调整页面大小选项
    const getPageSizes = () => {
      const width = window.innerWidth
      if (width < 480) {
        // 超小屏幕：最少选项
        return [20, 50]
      } else if (width < 768) {
        // 小屏幕：减少选项
        return [20, 50, 100]
      } else {
        // 大屏幕：完整选项
        return [20, 50, 100, 200]
      }
    }

    // 窗口大小变化处理
    const handleResize = () => {
      // 触发响应式更新
      nextTick(() => {
        // 强制重新计算分页布局
        console.log('窗口大小变化，重新计算分页布局')
      })
    }

    // 组件挂载时的初始化
    onMounted(() => {
      console.log('FileOrganize 组件挂载完成')
      // 添加窗口大小变化监听器
      window.addEventListener('resize', handleResize)
    })

    // 组件卸载时清理监听器
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
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
      paginatedFileList,
      currentPage,
      pageSize,
      totalPages,
      paginationLayout,
      isSmallScreen,
      isExtraSmallScreen,
      isUltraSmallScreen,
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
      handleSizeChange,
      handleCurrentChange,
      getPageSizes
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px 0;
  flex-wrap: wrap;
  gap: 10px;
  background: #fafafa;
  border-radius: 6px;
  margin: 20px 0;
  overflow: hidden;
  max-width: 100%;
  box-sizing: border-box;
  position: relative;
}

/* 响应式分页样式 */
@media (max-width: 768px) {
  .pagination-container {
    justify-content: center;
    padding: 15px 10px;
    margin: 20px 10px;
  }
  
  .pagination-container .el-pagination {
    font-size: 12px;
    width: 100%;
    justify-content: center;
  }
  
  .pagination-container .el-pagination .el-pagination__sizes {
    margin-right: 10px;
  }
  
  .pagination-container .el-pagination .el-pagination__total {
    font-size: 12px;
  }
}

@media (max-width: 640px) {
  .pagination-container {
    padding: 15px 8px;
    margin: 20px 8px;
  }
  
  .pagination-container .el-pagination {
    font-size: 11px;
  }
  
  .pagination-container .el-pagination .el-pagination__sizes {
    margin-right: 8px;
  }
  
  .pagination-container .el-pagination .el-pagination__total {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .pagination-container {
    flex-direction: column;
    align-items: center;
    gap: 15px;
    padding: 20px 10px;
    margin: 20px 10px;
    width: calc(100% - 20px);
    box-sizing: border-box;
  }
  
  .pagination-container .el-pagination {
    flex-direction: column;
    align-items: center;
    gap: 15px;
    width: 100%;
    font-size: 12px;
    max-width: 100%;
    overflow: hidden;
  }
  
  /* 第一行：总数和每页条数选择器 */
  .pagination-container .el-pagination .el-pagination__total,
  .pagination-container .el-pagination .el-pagination__sizes {
    margin: 0;
    text-align: center;
    width: 100%;
    max-width: 100%;
  }
  
  /* 第二行：分页导航按钮 */
  .pagination-container .el-pagination .el-pagination__prev,
  .pagination-container .el-pagination .el-pagination__next,
  .pagination-container .el-pagination .el-pager {
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    max-width: 100%;
    flex-wrap: wrap;
  }
  
  .pagination-container .el-pagination .el-pager {
    gap: 8px;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .pagination-container .el-pagination .el-pager li {
    min-width: 32px;
    height: 32px;
    line-height: 32px;
    font-size: 12px;
    margin: 2px;
  }
  
  /* 第三行：跳转输入框 */
  .pagination-container .el-pagination .el-pagination__jump {
    margin: 0;
    text-align: center;
    width: 100%;
    max-width: 100%;
  }
  
  .pagination-container .el-pagination .el-pagination__jump .el-input {
    width: 80px;
    max-width: 100%;
  }
  
  /* 确保每行之间有足够的间距 */
  .pagination-container .el-pagination > * {
    margin-bottom: 10px;
    width: 100%;
    max-width: 100%;
  }
  
  .pagination-container .el-pagination > *:last-child {
    margin-bottom: 0;
  }
  
  /* 确保选择器不会超出容器 */
  .pagination-container .el-pagination .el-pagination__sizes .el-select {
    width: 100%;
    max-width: 120px;
  }
  
  /* 确保总数显示不会换行 */
  .pagination-container .el-pagination .el-pagination__total {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

/* 极窄屏幕优化 */
@media (max-width: 360px) {
  .pagination-container {
    padding: 15px 5px;
    margin: 15px 5px;
    width: calc(100% - 10px);
    gap: 10px;
  }
  
  .pagination-container .el-pagination {
    gap: 10px;
    font-size: 11px;
  }
  
  .pagination-container .el-pagination .el-pager li {
    min-width: 28px;
    height: 28px;
    line-height: 28px;
    font-size: 11px;
    margin: 1px;
  }
  
  .pagination-container .el-pagination .el-pagination__jump .el-input {
    width: 60px;
  }
  
  .pagination-container .el-pagination .el-pagination__sizes .el-select {
    max-width: 100px;
  }
}

/* 表格响应式样式 */
@media (max-width: 768px) {
  .hidden-on-mobile {
    display: none !important;
  }
  
  .file-list .el-table {
    font-size: 12px;
  }
  
  .file-list .el-table .el-table__header {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .file-list .el-table {
    font-size: 11px;
  }
  
  .file-list .el-table .el-table__header {
    font-size: 11px;
  }
  
  .file-list .el-table .el-table__cell {
    padding: 8px 4px;
  }
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
