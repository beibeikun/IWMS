<template>
  <div class="file-operations-container">
    <div class="page-header">
      <h1>文件操作</h1>
      <p>高级文件管理工具，支持批量操作、整理排序等功能</p>
    </div>

    <div class="operations-grid">
      <!-- 整理排序卡片 -->
      <el-card class="operation-card" @click="navigateToOrganize">
        <div class="card-content">
          <div class="card-icon">
            <el-icon><Sort /></el-icon>
          </div>
          <h3>整理排序</h3>
          <p>按名称、大小、日期等条件对文件进行智能排序和整理</p>
          <div class="card-features">
            <el-tag size="small" type="success">智能排序</el-tag>
            <el-tag size="small" type="primary">批量整理</el-tag>
            <el-tag size="small" type="warning">自定义规则</el-tag>
          </div>
        </div>
      </el-card>

      <!-- 批量移动卡片 -->
      <el-card class="operation-card coming-soon">
        <div class="card-content">
          <div class="card-icon">
            <el-icon><FolderOpened /></el-icon>
          </div>
          <h3>批量移动</h3>
          <p>根据规则批量移动文件到指定目录</p>
          <div class="card-features">
            <el-tag size="small" type="info">即将推出</el-tag>
          </div>
        </div>
      </el-card>

      <!-- 批量复制卡片 -->
      <el-card class="operation-card coming-soon">
        <div class="card-content">
          <div class="card-icon">
            <el-icon><CopyDocument /></el-icon>
          </div>
          <h3>批量复制</h3>
          <p>批量复制文件到多个目标位置</p>
          <div class="card-features">
            <el-tag size="small" type="info">即将推出</el-tag>
          </div>
        </div>
      </el-card>

      <!-- 文件去重卡片 -->
      <el-card class="operation-card coming-soon">
        <div class="card-content">
          <div class="card-icon">
            <el-icon><Delete /></el-icon>
          </div>
          <h3>文件去重</h3>
          <p>检测并处理重复文件，节省存储空间</p>
          <div class="card-features">
            <el-tag size="small" type="info">即将推出</el-tag>
          </div>
        </div>
      </el-card>

      <!-- 文件分类卡片 -->
      <el-card class="operation-card coming-soon">
        <div class="card-content">
          <div class="card-icon">
            <el-icon><Grid /></el-icon>
          </div>
          <h3>智能分类</h3>
          <p>根据文件类型和内容自动分类</p>
          <div class="card-features">
            <el-tag size="small" type="info">即将推出</el-tag>
          </div>
        </div>
      </el-card>

      <!-- 文件同步卡片 -->
      <el-card class="operation-card coming-soon">
        <div class="card-content">
          <div class="card-icon">
            <el-icon><Refresh /></el-icon>
          </div>
          <h3>文件同步</h3>
          <p>同步多个目录之间的文件差异</p>
          <div class="card-features">
            <el-tag size="small" type="info">即将推出</el-tag>
          </div>
        </div>
      </el-card>
    </div>

    
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

export default {
  name: 'FileOperations',
  setup() {
    const router = useRouter()
    
    const navigateToOrganize = () => {
      router.push('/file-operations/organize')
    }
    
    const selectFolder = async () => {
      try {
        const folderPath = await window.electronAPI.selectFolder()
        if (folderPath) {
          ElMessage.success(`已选择文件夹: ${folderPath}`)
          // 这里可以添加文件夹选择的后续处理逻辑
        }
      } catch (error) {
        ElMessage.error(`选择文件夹失败: ${error.message}`)
      }
    }
    
    const showHelp = () => {
      ElMessage.info('文件操作功能帮助文档即将推出！')
    }
    
    return {
      navigateToOrganize,
      selectFolder,
      showHelp
    }
  }
}
</script>

<style scoped>
.file-operations-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 10px 0;
}

.page-header p {
  font-size: 16px;
  color: #7f8c8d;
  margin: 0;
}

.operations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.operation-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.operation-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #409eff;
}

.operation-card.coming-soon {
  opacity: 0.6;
  cursor: not-allowed;
}

.operation-card.coming-soon:hover {
  transform: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-color: transparent;
}

.card-content {
  text-align: center;
  padding: 20px;
}

.card-icon {
  margin-bottom: 20px;
}

.card-icon .el-icon {
  font-size: 48px;
  color: #409eff;
}

.card-content h3 {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 15px 0;
}

.card-content p {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.card-features {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-actions {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
}

.quick-actions h2 {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 20px 0;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  padding: 12px 24px;
  font-size: 14px;
}

.action-buttons .el-icon {
  margin-right: 8px;
}

@media (max-width: 768px) {
  .operations-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .action-buttons .el-button {
    width: 100%;
    max-width: 300px;
  }
}
</style>
