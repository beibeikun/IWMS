<template>
  <div class="reports-container">
    <el-card class="reports-card">
      <template #header>
        <div class="card-header">
          <span>报告中心</span>
          <div class="header-actions">
            <el-button type="primary" @click="generateReport">
              <el-icon><DocumentAdd /></el-icon>
              生成报告
            </el-button>
            <el-button type="success" @click="exportAllReports">
              <el-icon><Download /></el-icon>
              导出全部
            </el-button>
          </div>
        </div>
      </template>

      <!-- 报告统计 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalReports }}</div>
              <div class="stat-label">总报告数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.thisMonth }}</div>
              <div class="stat-label">本月报告</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.thisWeek }}</div>
              <div class="stat-label">本周报告</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.today }}</div>
              <div class="stat-label">今日报告</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 报告类型筛选 -->
      <div class="filter-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-select v-model="selectedType" placeholder="选择报告类型" clearable>
              <el-option label="全部类型" value="" />
              <el-option label="任务执行报告" value="TASK_EXECUTION" />
              <el-option label="文件处理报告" value="FILE_PROCESSING" />
              <el-option label="系统性能报告" value="SYSTEM_PERFORMANCE" />
              <el-option label="错误日志报告" value="ERROR_LOG" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="filterReports">筛选</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 报告列表 -->
      <el-table :data="filteredReports" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="报告标题" />
        <el-table-column prop="type" label="类型" width="150">
          <template #default="scope">
            <el-tag :type="getReportTypeTag(scope.row.type)">
              {{ getReportTypeName(scope.row.type) }}
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
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column prop="fileSize" label="文件大小" width="120">
          <template #default="scope">
            {{ formatFileSize(scope.row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button 
              size="small" 
              type="primary"
              @click="viewReport(scope.row)"
            >
              查看
            </el-button>
            <el-button 
              size="small" 
              type="success"
              @click="downloadReport(scope.row)"
            >
              下载
            </el-button>
            <el-button 
              size="small" 
              type="danger"
              @click="deleteReport(scope.row)"
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
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DocumentAdd, Download } from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const reports = ref([])
const stats = ref({
  totalReports: 0,
  thisMonth: 0,
  thisWeek: 0,
  today: 0
})
const selectedType = ref('')
const dateRange = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 模拟报告数据
const mockReports = [
  {
    id: 1,
    title: '批量重命名任务执行报告',
    type: 'TASK_EXECUTION',
    status: 'COMPLETED',
    createdAt: '2024-08-26 13:30:00',
    fileSize: 102400
  },
  {
    id: 2,
    title: '图片压缩处理报告',
    type: 'FILE_PROCESSING',
    status: 'COMPLETED',
    createdAt: '2024-08-26 13:25:00',
    fileSize: 153600
  },
  {
    id: 3,
    title: '系统性能监控报告',
    type: 'SYSTEM_PERFORMANCE',
    status: 'PENDING',
    createdAt: '2024-08-26 13:20:00',
    fileSize: 51200
  },
  {
    id: 4,
    title: '错误日志汇总报告',
    type: 'ERROR_LOG',
    status: 'FAILED',
    createdAt: '2024-08-26 13:15:00',
    fileSize: 25600
  }
]

// 计算筛选后的报告
const filteredReports = computed(() => {
  let result = reports.value

  // 按类型筛选
  if (selectedType.value) {
    result = result.filter(r => r.type === selectedType.value)
  }

  // 按日期筛选
  if (dateRange.value && dateRange.value.length === 2) {
    const [startDate, endDate] = dateRange.value
    result = result.filter(r => {
      const reportDate = r.createdAt.split(' ')[0]
      return reportDate >= startDate && reportDate <= endDate
    })
  }

  return result
})

// 获取报告类型标签样式
const getReportTypeTag = (type) => {
  const typeMap = {
    'TASK_EXECUTION': 'primary',
    'FILE_PROCESSING': 'success',
    'SYSTEM_PERFORMANCE': 'warning',
    'ERROR_LOG': 'danger'
  }
  return typeMap[type] || 'default'
}

// 获取报告类型名称
const getReportTypeName = (type) => {
  const typeMap = {
    'TASK_EXECUTION': '任务执行报告',
    'FILE_PROCESSING': '文件处理报告',
    'SYSTEM_PERFORMANCE': '系统性能报告',
    'ERROR_LOG': '错误日志报告'
  }
  return typeMap[type] || '未知类型'
}

// 获取状态标签样式
const getStatusTag = (status) => {
  const statusMap = {
    'PENDING': 'info',
    'PROCESSING': 'warning',
    'COMPLETED': 'success',
    'FAILED': 'danger'
  }
  return statusMap[status] || 'default'
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 生成报告
const generateReport = () => {
  ElMessage.info('报告生成功能开发中...')
}

// 导出全部报告
const exportAllReports = () => {
  ElMessage.success('开始导出全部报告...')
}

// 筛选报告
const filterReports = () => {
  ElMessage.success('筛选完成')
}

// 重置筛选
const resetFilter = () => {
  selectedType.value = ''
  dateRange.value = []
  ElMessage.info('筛选条件已重置')
}

// 查看报告
const viewReport = (report) => {
  ElMessage.info(`查看报告: ${report.title}`)
}

// 下载报告
const downloadReport = (report) => {
  ElMessage.success(`下载报告: ${report.title}`)
}

// 删除报告
const deleteReport = async (report) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除报告 "${report.title}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    ElMessage.success(`删除报告: ${report.title}`)
  } catch {
    // 用户取消删除
  }
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  loadReports()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadReports()
}

// 加载报告数据
const loadReports = () => {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    reports.value = mockReports
    stats.value = {
      totalReports: mockReports.length,
      thisMonth: mockReports.length,
      thisWeek: mockReports.length,
      today: mockReports.length
    }
    total.value = mockReports.length
    loading.value = false
  }, 500)
}

// 组件挂载时加载数据
onMounted(() => {
  loadReports()
})
</script>

<style scoped>
.reports-container {
  padding: 20px;
}

.reports-card {
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

.filter-section {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.pagination-container {
  margin-top: 20px;
  text-align: center;
}
</style>
