<template>
  <div class="coming-soon-container">
    <div class="coming-soon-content">
      <div class="icon-section">
        <el-icon class="feature-icon"><Delete /></el-icon>
      </div>
      <h1>从仓库删除功能</h1>
      <p>安全的文件删除工具，支持批量删除和回收站</p>
      <p class="status">即将推出，敬请期待！</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'DeleteFromRepo',
  setup() {
    const router = useRouter()
    
    const goHome = () => {
      router.push('/')
    }
    
    return {
      goHome
    }
  }
}
</script>

<style scoped>
.coming-soon-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.coming-soon-content {
  text-align: center;
  max-width: 500px;
}

.icon-section {
  margin-bottom: 30px;
}

.feature-icon {
  font-size: 80px;
  color: #60a5fa;
  opacity: 0.7;
}

.coming-soon-content h1 {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 20px 0;
}

.coming-soon-content p {
  font-size: 16px;
  color: #94a3b8;
  margin: 0 0 10px 0;
  line-height: 1.6;
}

.status {
  font-size: 18px;
  color: #60a5fa;
  font-weight: 600;
  margin: 30px 0 !important;
}

.el-button {
  margin-top: 20px;
}
</style>
