<template>
  <div class="files-container">
    <el-card class="files-card">
      <template #header>
        <div class="card-header">
          <span>文件管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="uploadFiles">
              <el-icon><Upload /></el-icon>
              上传文件
            </el-button>
            <el-button type="success" @click="createFolder">
              <el-icon><FolderAdd /></el-icon>
              新建文件夹
            </el-button>
          </div>
        </div>
      </template>

      <!-- 文件统计 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalFiles }}</div>
              <div class="stat-label">总文件数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalSize }}</div>
              <div class="stat-label">总大小</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.imageFiles }}</div>
              <div class="stat-label">图片文件</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.documentFiles }}</div>
              <div class="stat-label">文档文件</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 文件浏览器 -->
      <div class="file-browser">
        <!-- 面包屑导航 -->
        <el-breadcrumb separator="/" class="breadcrumb">
          <el-breadcrumb-item 
            v-for="(item, index) in breadcrumb" 
            :key="index"
            @click="navigateTo(item.path)"
            :class="{ 'clickable': index < breadcrumb.length - 1 }"
          >
            {{ item.name }}
          </el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 文件列表 -->
        <el-table :data="files" style="width: 100%" v-loading="loading">
          <el-table-column width="50">
            <template #default="scope">
              <el-icon v-if="scope.row.type === 'folder'" color="#409eff">
                <Folder />
              </el-icon>
              <el-icon v-else-if="isImageFile(scope.row.name)" color="#67c23a">
                <Picture />
              </el-icon>
              <el-icon v-else color="#909399">
                <Document />
              </el-icon>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="名称" />
          <el-table-column prop="size" label="大小" width="120">
            <template #default="scope">
              <span v-if="scope.row.type === 'folder'">-</span>
              <span v-else>{{ formatFileSize(scope.row.size) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="120">
            <template #default="scope">
              <el-tag v-if="scope.row.type === 'folder'" type="primary">文件夹</el-tag>
              <el-tag v-else :type="getFileTypeTag(scope.row.name)">{{ getFileType(scope.row.name) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="modifiedAt" label="修改时间" width="180" />
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button 
                v-if="scope.row.type === 'folder'" 
                size="small" 
                type="primary"
                @click="openFolder(scope.row)"
              >
                打开
              </el-button>
              <el-button 
                v-else
                size="small" 
                type="info"
                @click="previewFile(scope.row)"
              >
                预览
              </el-button>
              <el-button 
                size="small" 
                type="success"
                @click="downloadFile(scope.row)"
              >
                下载
              </el-button>
              <el-button 
                size="small" 
                type="danger"
                @click="deleteFile(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Upload, FolderAdd, Folder, Picture, Document } from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const files = ref([])
const stats = ref({
  totalFiles: 0,
  totalSize: '0 MB',
  imageFiles: 0,
  documentFiles: 0
})
const currentPath = ref('/')
const breadcrumb = ref([{ name: '根目录', path: '/' }])

// 模拟文件数据
const mockFiles = [
  {
    name: '图片文件夹',
    type: 'folder',
    size: 0,
    modifiedAt: '2024-08-26 13:30:00'
  },
  {
    name: '文档文件夹',
    type: 'folder',
    size: 0,
    modifiedAt: '2024-08-26 13:25:00'
  },
  {
    name: 'sample.jpg',
    type: 'file',
    size: 2048576,
    modifiedAt: '2024-08-26 13:20:00'
  },
  {
    name: 'report.pdf',
    type: 'file',
    size: 1048576,
    modifiedAt: '2024-08-26 13:15:00'
  }
]

// 判断是否为图片文件
const isImageFile = (fileName) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
  return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext))
}

// 获取文件类型
const getFileType = (fileName) => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  const typeMap = {
    'jpg': 'JPEG图片',
    'jpeg': 'JPEG图片',
    'png': 'PNG图片',
    'gif': 'GIF图片',
    'pdf': 'PDF文档',
    'doc': 'Word文档',
    'docx': 'Word文档',
    'xls': 'Excel表格',
    'xlsx': 'Excel表格',
    'txt': '文本文件'
  }
  return typeMap[ext] || '未知文件'
}

// 获取文件类型标签样式
const getFileTypeTag = (fileName) => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  const tagMap = {
    'jpg': 'success',
    'jpeg': 'success',
    'png': 'success',
    'gif': 'success',
    'pdf': 'warning',
    'doc': 'info',
    'docx': 'info',
    'xls': 'info',
    'xlsx': 'info',
    'txt': 'default'
  }
  return tagMap[ext] || 'default'
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 上传文件
const uploadFiles = () => {
  ElMessage.info('文件上传功能开发中...')
}

// 新建文件夹
const createFolder = () => {
  ElMessage.info('新建文件夹功能开发中...')
}

// 打开文件夹
const openFolder = (folder) => {
  const newPath = currentPath.value === '/' ? folder.name : `${currentPath.value}/${folder.name}`
  navigateTo(newPath)
}

// 导航到指定路径
const navigateTo = (path) => {
  currentPath.value = path
  updateBreadcrumb(path)
  loadFiles(path)
}

// 更新面包屑
const updateBreadcrumb = (path) => {
  if (path === '/') {
    breadcrumb.value = [{ name: '根目录', path: '/' }]
    return
  }
  
  const parts = path.split('/').filter(p => p)
  breadcrumb.value = [{ name: '根目录', path: '/' }]
  
  let currentPath = ''
  parts.forEach(part => {
    currentPath += `/${part}`
    breadcrumb.value.push({ name: part, path: currentPath })
  })
}

// 预览文件
const previewFile = (file) => {
  ElMessage.info(`预览文件: ${file.name}`)
}

// 下载文件
const downloadFile = (file) => {
  ElMessage.success(`下载文件: ${file.name}`)
}

// 删除文件
const deleteFile = async (file) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 "${file.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    ElMessage.success(`删除文件: ${file.name}`)
  } catch {
    // 用户取消删除
  }
}

// 加载文件列表
const loadFiles = (path) => {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    files.value = mockFiles
    stats.value = {
      totalFiles: mockFiles.length,
      totalSize: '3.0 MB',
      imageFiles: mockFiles.filter(f => isImageFile(f.name)).length,
      documentFiles: mockFiles.filter(f => !isImageFile(f.name) && f.type === 'file').length
    }
    loading.value = false
  }, 500)
}

// 组件挂载时加载数据
onMounted(() => {
  loadFiles('/')
})
</script>

<style scoped>
.files-container {
  padding: 20px;
}

.files-card {
  margin-bottom: 20px;
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

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat-content {
  padding: 10px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.stat-label {
  margin-top: 5px;
  color: #606266;
  font-size: 14px;
}

.file-browser {
  margin-top: 20px;
}

.breadcrumb {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.clickable {
  cursor: pointer;
  color: #409eff;
}

.clickable:hover {
  text-decoration: underline;
}
</style>
