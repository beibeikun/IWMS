<template>
  <div class="settings-container">
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
          <el-button type="primary" @click="saveSettings">
            <el-icon><Check /></el-icon>
            保存设置
          </el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab" type="border-card">
        <!-- 基本设置 -->
        <el-tab-pane label="基本设置" name="basic">
          <el-form :model="basicSettings" label-width="120px">
            <el-form-item label="系统名称">
              <el-input v-model="basicSettings.systemName" placeholder="请输入系统名称" />
            </el-form-item>
            <el-form-item label="系统版本">
              <el-input v-model="basicSettings.version" disabled />
            </el-form-item>
            <el-form-item label="管理员邮箱">
              <el-input v-model="basicSettings.adminEmail" placeholder="请输入管理员邮箱" />
            </el-form-item>
            <el-form-item label="系统描述">
              <el-input 
                v-model="basicSettings.description" 
                type="textarea" 
                :rows="3"
                placeholder="请输入系统描述"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 文件设置 -->
        <el-tab-pane label="文件设置" name="file">
          <el-form :model="fileSettings" label-width="120px">
            <el-form-item label="默认上传路径">
              <el-input v-model="fileSettings.uploadPath" placeholder="请输入默认上传路径" />
            </el-form-item>
            <el-form-item label="最大文件大小">
              <el-input-number 
                v-model="fileSettings.maxFileSize" 
                :min="1" 
                :max="1000"
                placeholder="MB"
              />
              <span class="unit">MB</span>
            </el-form-item>
            <el-form-item label="允许的文件类型">
              <el-select 
                v-model="fileSettings.allowedTypes" 
                multiple 
                placeholder="请选择允许的文件类型"
              >
                <el-option label="图片文件" value="image" />
                <el-option label="文档文件" value="document" />
                <el-option label="视频文件" value="video" />
                <el-option label="音频文件" value="audio" />
                <el-option label="压缩文件" value="archive" />
              </el-select>
            </el-form-item>
            <el-form-item label="自动清理临时文件">
              <el-switch v-model="fileSettings.autoCleanTemp" />
            </el-form-item>
            <el-form-item label="清理间隔(天)">
              <el-input-number 
                v-model="fileSettings.cleanInterval" 
                :min="1" 
                :max="30"
                :disabled="!fileSettings.autoCleanTemp"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 任务设置 -->
        <el-tab-pane label="任务设置" name="task">
          <el-form :model="taskSettings" label-width="120px">
            <el-form-item label="最大并发任务数">
              <el-input-number 
                v-model="taskSettings.maxConcurrentTasks" 
                :min="1" 
                :max="10"
              />
            </el-form-item>
            <el-form-item label="任务超时时间">
              <el-input-number 
                v-model="taskSettings.taskTimeout" 
                :min="30" 
                :max="3600"
              />
              <span class="unit">秒</span>
            </el-form-item>
            <el-form-item label="自动重试次数">
              <el-input-number 
                v-model="taskSettings.maxRetries" 
                :min="0" 
                :max="5"
              />
            </el-form-item>
            <el-form-item label="任务日志保留天数">
              <el-input-number 
                v-model="taskSettings.logRetentionDays" 
                :min="7" 
                :max="365"
              />
            </el-form-item>
            <el-form-item label="启用任务通知">
              <el-switch v-model="taskSettings.enableNotifications" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 安全设置 -->
        <el-tab-pane label="安全设置" name="security">
          <el-form :model="securitySettings" label-width="120px">
            <el-form-item label="会话超时时间">
              <el-input-number 
                v-model="securitySettings.sessionTimeout" 
                :min="15" 
                :max="1440"
              />
              <span class="unit">分钟</span>
            </el-form-item>
            <el-form-item label="密码最小长度">
              <el-input-number 
                v-model="securitySettings.minPasswordLength" 
                :min="6" 
                :max="20"
              />
            </el-form-item>
            <el-form-item label="启用登录日志">
              <el-switch v-model="securitySettings.enableLoginLog" />
            </el-form-item>
            <el-form-item label="启用操作审计">
              <el-switch v-model="securitySettings.enableAuditLog" />
            </el-form-item>
            <el-form-item label="IP白名单">
              <el-input 
                v-model="securitySettings.ipWhitelist" 
                type="textarea" 
                :rows="3"
                placeholder="请输入IP地址，每行一个"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 通知设置 -->
        <el-tab-pane label="通知设置" name="notification">
          <el-form :model="notificationSettings" label-width="120px">
            <el-form-item label="邮件通知">
              <el-switch v-model="notificationSettings.emailEnabled" />
            </el-form-item>
            <el-form-item label="SMTP服务器">
              <el-input 
                v-model="notificationSettings.smtpServer" 
                placeholder="请输入SMTP服务器地址"
                :disabled="!notificationSettings.emailEnabled"
              />
            </el-form-item>
            <el-form-item label="SMTP端口">
              <el-input-number 
                v-model="notificationSettings.smtpPort" 
                :min="1" 
                :max="65535"
                :disabled="!notificationSettings.emailEnabled"
              />
            </el-form-item>
            <el-form-item label="邮箱账号">
              <el-input 
                v-model="notificationSettings.emailAccount" 
                placeholder="请输入邮箱账号"
                :disabled="!notificationSettings.emailEnabled"
              />
            </el-form-item>
            <el-form-item label="邮箱密码">
              <el-input 
                v-model="notificationSettings.emailPassword" 
                type="password" 
                placeholder="请输入邮箱密码"
                :disabled="!notificationSettings.emailEnabled"
              />
            </el-form-item>
            <el-form-item label="通知事件">
              <el-checkbox-group v-model="notificationSettings.notifyEvents">
                <el-checkbox label="task_completed">任务完成</el-checkbox>
                <el-checkbox label="task_failed">任务失败</el-checkbox>
                <el-checkbox label="system_error">系统错误</el-checkbox>
                <el-checkbox label="disk_full">磁盘空间不足</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Check } from '@element-plus/icons-vue'

// 响应式数据
const activeTab = ref('basic')
const basicSettings = ref({
  systemName: 'IWMS智能文件管理系统',
  version: '1.0.0',
  adminEmail: 'admin@iwms.com',
  description: '智能文件管理系统，支持批量重命名、图片压缩、文件整理等功能'
})

const fileSettings = ref({
  uploadPath: './uploads',
  maxFileSize: 100,
  allowedTypes: ['image', 'document'],
  autoCleanTemp: true,
  cleanInterval: 7
})

const taskSettings = ref({
  maxConcurrentTasks: 3,
  taskTimeout: 300,
  maxRetries: 2,
  logRetentionDays: 30,
  enableNotifications: true
})

const securitySettings = ref({
  sessionTimeout: 30,
  minPasswordLength: 8,
  enableLoginLog: true,
  enableAuditLog: true,
  ipWhitelist: '127.0.0.1\n192.168.1.0/24'
})

const notificationSettings = ref({
  emailEnabled: false,
  smtpServer: 'smtp.gmail.com',
  smtpPort: 587,
  emailAccount: '',
  emailPassword: '',
  notifyEvents: ['task_completed', 'task_failed']
})

// 保存设置
const saveSettings = () => {
  // 模拟保存操作
  ElMessage.success('设置保存成功！')
  
  // 这里可以调用API保存设置
  console.log('保存的设置:', {
    basic: basicSettings.value,
    file: fileSettings.value,
    task: taskSettings.value,
    security: securitySettings.value,
    notification: notificationSettings.value
  })
}

// 加载设置
const loadSettings = () => {
  // 模拟从API加载设置
  // 这里可以调用API获取当前设置
}

// 组件挂载时加载设置
onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.settings-container {
  padding: 20px;
}

.settings-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.unit {
  margin-left: 10px;
  color: #606266;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
