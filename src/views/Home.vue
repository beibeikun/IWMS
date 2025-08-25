<template>
  <div class="home-container">
    <div class="welcome-section">
      <div class="welcome-content">
        
        <div class="feature-cards">
          <div class="feature-card" @click="navigateToBatchRename">
            <div class="feature-icon">
              <el-icon><Document /></el-icon>
            </div>
            <h3>批量重命名</h3>
            <p>基于Excel映射表的智能文件批量重命名，支持预览和冲突处理</p>
            <el-button type="primary" @click="navigateToBatchRename">
              开始使用
            </el-button>
          </div>
          
          <div class="feature-card disabled">
            <div class="feature-icon">
              <el-icon><Operation /></el-icon>
            </div>
            <h3>文件操作</h3>
            <p>高级文件操作工具，支持批量移动、复制、删除等操作</p>
            <el-tag size="small" type="info">即将推出</el-tag>
          </div>
          
          <div class="feature-card disabled">
            <div class="feature-icon">
              <el-icon><Box /></el-icon>
            </div>
            <h3>仓库相关</h3>
            <p>仓库管理和同步功能，支持版本控制和备份</p>
            <el-tag size="small" type="info">即将推出</el-tag>
          </div>
          
          <div class="feature-card disabled">
            <div class="feature-icon">
              <el-icon><EditPen /></el-icon>
            </div>
            <h3>生成表单</h3>
            <p>智能表单生成器，快速创建数据录入表单</p>
            <el-tag size="small" type="info">即将推出</el-tag>
          </div>
          
          <div class="feature-card disabled">
            <div class="feature-icon">
              <el-icon><Delete /></el-icon>
            </div>
            <h3>从仓库删除</h3>
            <p>安全的文件删除工具，支持批量删除和回收站</p>
            <el-tag size="small" type="info">即将推出</el-tag>
          </div>
          
          <div class="feature-card disabled">
            <div class="feature-icon">
              <el-icon><Setting /></el-icon>
            </div>
            <h3>仓库配置</h3>
            <p>仓库设置和管理，支持多仓库配置</p>
            <el-tag size="small" type="info">即将推出</el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'Home',
  setup() {
    const router = useRouter()
    
    const navigateToBatchRename = () => {
      router.push('/batch-rename')
    }
    
    return {
      navigateToBatchRename
    }
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.welcome-section {
  max-width: 1200px;
  width: 100%;
}

.welcome-content {
  text-align: center;
}

.logo-section {
  margin-bottom: 60px;
}

.welcome-logo {
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border-radius: 16px;
}

.welcome-title {
  font-size: 48px;
  font-weight: 700;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 10px 0;
  text-shadow: 0 4px 20px rgba(96, 165, 250, 0.3);
}

.welcome-subtitle {
  font-size: 18px;
  color: #94a3b8;
  margin: 0;
  font-weight: 300;
  letter-spacing: 1px;
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  margin-top: 40px;
}

.feature-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
  border-color: rgba(96, 165, 250, 0.3);
}

.feature-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.feature-card.disabled:hover {
  transform: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.feature-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
  font-size: 28px;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
}

.feature-card.disabled .feature-icon {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  box-shadow: 0 4px 16px rgba(107, 114, 128, 0.3);
}

.feature-card h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
}

.feature-card p {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin: 0 0 20px 0;
}

.feature-card .el-button {
  margin-top: 8px;
}

.feature-card .el-tag {
  margin-top: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .welcome-title {
    font-size: 36px;
  }
  
  .welcome-subtitle {
    font-size: 16px;
  }
  
  .feature-cards {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .feature-card {
    padding: 24px;
  }
  
  .feature-icon {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }
}
</style>
