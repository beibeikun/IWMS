<template>
  <div class="tasks-container">
    <el-card class="tasks-card">
      <template #header>
        <div class="card-header">
          <span>任务管理</span>
          <el-button type="primary" @click="createTask">
            <el-icon><Plus /></el-icon>
            创建任务
          </el-button>
        </div>
      </template>

      <!-- 任务统计 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.total }}</div>
              <div class="stat-label">总任务数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number running">{{ stats.running }}</div>
              <div class="stat-label">运行中</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number completed">{{ stats.completed }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number failed">{{ stats.failed }}</div>
              <div class="stat-label">失败</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 任务列表 -->
      <el-table :data="tasks" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="taskName" label="任务名称" />
        <el-table-column prop="taskType" label="类型" width="120">
          <template #default="scope">
            <el-tag :type="getTaskTypeTag(scope.row.taskType)">
              {{ scope.row.taskType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="200">
          <template #default="scope">
            <el-progress 
              :percentage="scope.row.progress" 
              :status="getProgressStatus(scope.row.status)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button 
              v-if="scope.row.status === 'PENDING'" 
              size="small" 
              type="primary"
              @click="startTask(scope.row)"
            >
              开始
            </el-button>
            <el-button 
              v-if="scope.row.status === 'RUNNING'" 
              size="small" 
              type="warning"
              @click="cancelTask(scope.row)"
            >
              取消
            </el-button>
            <el-button 
              size="small" 
              type="info"
              @click="viewDetails(scope.row)"
            >
              详情
            </el-button>
            <el-button 
              size="small" 
              type="danger"
              @click="deleteTask(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const tasks = ref([])
const stats = ref({
  total: 0,
  running: 0,
  completed: 0,
  failed: 0
})
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 模拟数据
const mockTasks = [
  {
    id: 1,
    taskName: '批量重命名图片',
    taskType: 'RENAME',
    status: 'COMPLETED',
    progress: 100,
    createdAt: '2024-08-26 13:30:00',
    description: '重命名100张图片文件'
  },
  {
    id: 2,
    taskName: '图片压缩任务',
    taskType: 'COMPRESS',
    status: 'RUNNING',
    progress: 65,
    createdAt: '2024-08-26 13:25:00',
    description: '压缩50张高清图片'
  },
  {
    id: 3,
    taskName: '文件整理任务',
    taskType: 'ORGANIZE',
    status: 'PENDING',
    progress: 0,
    createdAt: '2024-08-26 13:20:00',
    description: '整理文档文件夹'
  }
]

// 获取任务类型标签样式
const getTaskTypeTag = (type) => {
  const typeMap = {
    'RENAME': 'primary',
    'COMPRESS': 'success',
    'ORGANIZE': 'info'
  }
  return typeMap[type] || 'default'
}

// 获取状态标签样式
const getStatusTag = (status) => {
  const statusMap = {
    'PENDING': 'info',
    'RUNNING': 'warning',
    'COMPLETED': 'success',
    'FAILED': 'danger',
    'CANCELLED': 'default'
  }
  return statusMap[status] || 'default'
}

// 获取进度条状态
const getProgressStatus = (status) => {
  if (status === 'FAILED') return 'exception'
  if (status === 'COMPLETED') return 'success'
  return ''
}

// 创建任务
const createTask = () => {
  ElMessage.info('创建任务功能开发中...')
}

// 开始任务
const startTask = (task) => {
  ElMessage.success(`开始任务: ${task.taskName}`)
}

// 取消任务
const cancelTask = (task) => {
  ElMessage.warning(`取消任务: ${task.taskName}`)
}

// 查看详情
const viewDetails = (task) => {
  ElMessage.info(`查看任务详情: ${task.taskName}`)
}

// 删除任务
const deleteTask = async (task) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除任务 "${task.taskName}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    ElMessage.success(`删除任务: ${task.taskName}`)
  } catch {
    // 用户取消删除
  }
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  loadTasks()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadTasks()
}

// 加载任务数据
const loadTasks = () => {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    tasks.value = mockTasks
    stats.value = {
      total: mockTasks.length,
      running: mockTasks.filter(t => t.status === 'RUNNING').length,
      completed: mockTasks.filter(t => t.status === 'COMPLETED').length,
      failed: mockTasks.filter(t => t.status === 'FAILED').length
    }
    total.value = mockTasks.length
    loading.value = false
  }, 500)
}

// 组件挂载时加载数据
onMounted(() => {
  loadTasks()
})
</script>

<style scoped>
.tasks-container {
  padding: 20px;
}

.tasks-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.stat-number.running {
  color: #e6a23c;
}

.stat-number.completed {
  color: #67c23a;
}

.stat-number.failed {
  color: #f56c6c;
}

.stat-label {
  margin-top: 5px;
  color: #606266;
  font-size: 14px;
}

.pagination-container {
  margin-top: 20px;
  text-align: center;
}
</style>
