<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :span="6" v-for="stat in stats" :key="stat.title">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: stat.color }">
              <el-icon :size="24"><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-title">{{ stat.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 最近任务 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近任务</span>
              <el-button type="text">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentTasks" style="width: 100%">
            <el-table-column prop="taskName" label="任务名称" />
            <el-table-column prop="status" label="状态">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="创建时间" />
          </el-table>
        </el-card>
      </el-col>

      <!-- 系统状态 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>系统状态</span>
            </div>
          </template>
          <div class="system-status">
            <div class="status-item">
              <span class="status-label">后端服务</span>
              <el-tag type="success">运行中</el-tag>
            </div>
            <div class="status-item">
              <span class="status-label">数据库</span>
              <el-tag type="success">正常</el-tag>
            </div>
            <div class="status-item">
              <span class="status-label">存储空间</span>
              <el-tag type="warning">75%</el-tag>
            </div>
            <div class="status-item">
              <span class="status-label">内存使用</span>
              <el-tag type="info">45%</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Document, List, Folder, DataAnalysis } from '@element-plus/icons-vue'

const stats = ref([
  {
    title: '总任务数',
    value: '156',
    icon: 'List',
    color: '#409EFF'
  },
  {
    title: '运行中',
    value: '8',
    icon: 'DataAnalysis',
    color: '#67C23A'
  },
  {
    title: '已完成',
    value: '142',
    icon: 'Document',
    color: '#E6A23C'
  },
  {
    title: '文件总数',
    value: '2,847',
    icon: 'Folder',
    color: '#F56C6C'
  }
])

const recentTasks = ref([
  {
    taskName: '批量重命名任务',
    status: 'COMPLETED',
    createdAt: '2025-08-26 13:30:00'
  },
  {
    taskName: '图片压缩任务',
    status: 'RUNNING',
    createdAt: '2025-08-26 13:25:00'
  },
  {
    taskName: '文件整理任务',
    status: 'PENDING',
    createdAt: '2025-08-26 13:20:00'
  }
])

const getStatusType = (status) => {
  const statusMap = {
    'PENDING': 'info',
    'RUNNING': 'warning',
    'COMPLETED': 'success',
    'FAILED': 'danger',
    'CANCELLED': 'info'
  }
  return statusMap[status] || 'info'
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 16px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.stat-title {
  font-size: 14px;
  color: #909399;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.system-status {
  padding: 10px 0;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #EBEEF5;
}

.status-item:last-child {
  border-bottom: none;
}

.status-label {
  font-size: 14px;
  color: #606266;
}
</style>
