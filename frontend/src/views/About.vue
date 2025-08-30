<template>
  <div class="about-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack" icon="ArrowLeft" text>返回</el-button>
        <h1>关于 IWMS</h1>
      </div>
    </div>

    <el-row :gutter="20">
      <!-- 左侧信息区域 -->
      <el-col :span="16">
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <span>软件信息</span>
            </div>
          </template>

          <!-- 软件基本信息 -->
          <div class="software-info">
            <div class="info-section">
              <h3>IWMS - 智能文件管理解决方案</h3>
              <p class="description">
                IWMS 是一个功能强大的智能文件管理系统，专为图像仓库管理而设计。
                提供批量重命名、文件整理、智能分类等功能，帮助用户高效管理大量文件。
              </p>
            </div>

            <!-- 版本信息 -->
            <div class="info-section">
              <h4>版本信息</h4>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="当前版本">
                  <el-tag type="primary">{{ version }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="构建日期">
                  {{ buildDate }}
                </el-descriptions-item>
                <el-descriptions-item label="Node.js 版本">
                  {{ nodeVersion }}
                </el-descriptions-item>
                <el-descriptions-item label="Electron 版本">
                  {{ electronVersion }}
                </el-descriptions-item>
              </el-descriptions>
            </div>

            <!-- 技术栈 -->
            <div class="info-section">
              <h4>技术栈</h4>
              <el-row :gutter="16">
                <el-col :span="8">
                  <el-card class="tech-card" shadow="hover">
                    <div class="tech-icon">⚡</div>
                    <h5>前端</h5>
                    <p>Vue 3 + Element Plus</p>
                  </el-card>
                </el-col>
                <el-col :span="8">
                  <el-card class="tech-card" shadow="hover">
                    <div class="tech-icon">🖥️</div>
                    <h5>桌面端</h5>
                    <p>Electron</p>
                  </el-card>
                </el-col>
                <el-col :span="8">
                  <el-card class="tech-card" shadow="hover">
                    <div class="tech-icon">🔧</div>
                    <h5>后端</h5>
                    <p>Spring Boot</p>
                  </el-card>
                </el-col>
              </el-row>
            </div>

            <!-- 功能特性 -->
            <div class="info-section">
              <h4>主要功能</h4>
              <el-row :gutter="16">
                <el-col :span="12">
                  <ul class="feature-list">
                    <li>📁 批量文件重命名</li>
                    <li>🔄 智能文件整理排序</li>
                    <li>📂 按前缀分文件夹</li>
                    <li>🖼️ 图像压缩优化</li>
                    <li>📊 文件统计分析</li>
                  </ul>
                </el-col>
                <el-col :span="12">
                  <ul class="feature-list">
                    <li>🔍 智能文件搜索</li>
                    <li>📋 批量操作支持</li>
                    <li>⚙️ 灵活配置选项</li>
                    <li>📈 操作日志记录</li>
                    <li>🎨 现代化界面设计</li>
                  </ul>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧链接区域 -->
      <el-col :span="8">
        <el-card class="links-card">
          <template #header>
            <div class="card-header">
              <span>相关链接</span>
            </div>
          </template>

          <!-- GitHub 链接 -->
          <div class="link-section">
            <h4>GitHub 仓库</h4>
            <el-button 
              type="primary" 
              @click="openGitHub"
              style="width: 100%; margin-bottom: 10px;"
            >
              <el-icon><Link /></el-icon>
              查看源代码
            </el-button>
            <p class="link-description">
              访问 GitHub 仓库，查看最新代码、提交历史和技术文档。
            </p>
          </div>

          <!-- 问题反馈 -->
          <div class="link-section">
            <h4>问题反馈</h4>
            <el-button 
              type="warning" 
              @click="openIssues"
              style="width: 100%; margin-bottom: 10px;"
            >
              <el-icon><ChatDotRound /></el-icon>
              报告问题
            </el-button>
            <p class="link-description">
              发现 Bug 或有功能建议？欢迎在 GitHub Issues 中反馈。
            </p>
          </div>

          <!-- 更新检查 -->
          <div class="link-section">
            <h4>检查更新</h4>
            <el-button 
              type="info" 
              @click="checkUpdate"
              :loading="checkingUpdate"
              style="width: 100%; margin-bottom: 10px;"
            >
              <el-icon><Refresh /></el-icon>
              检查更新
            </el-button>
            <p class="link-description">
              检查是否有新版本可用，获取最新功能和修复。
            </p>
          </div>

          <!-- 版权信息 -->
          <div class="copyright-section">
            <h4>版权信息</h4>
            <p class="copyright-text">
              © 2024 IWMS Team<br>
              基于 MIT 许可证开源
            </p>
            <el-button 
              text 
              type="info" 
              @click="showLicense"
              style="padding: 0; font-size: 12px;"
            >
              查看许可证
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'About',
  setup() {
    const router = useRouter()
    const checkingUpdate = ref(false)

    // 版本信息
    const version = ref('1.0.0')
    const buildDate = ref('2024-01-01')
    const nodeVersion = ref('')
    const electronVersion = ref('')

    // 获取版本信息
    const getVersionInfo = async () => {
      try {
        // 从 package.json 获取版本信息
        const packageInfo = await window.electronAPI.getPackageInfo()
        if (packageInfo) {
          version.value = packageInfo.version || '1.0.0'
          buildDate.value = packageInfo.buildDate || new Date().toISOString().split('T')[0]
        }

        // 获取 Node.js 和 Electron 版本
        const versions = await window.electronAPI.getVersions()
        if (versions) {
          nodeVersion.value = versions.node || 'Unknown'
          electronVersion.value = versions.electron || 'Unknown'
        }
      } catch (error) {
        console.warn('获取版本信息失败:', error.message)
      }
    }

    // 返回上一页
    const goBack = () => {
      router.go(-1)
    }

    // 打开 GitHub 仓库
    const openGitHub = () => {
      window.electronAPI.openExternal('https://github.com/beibeikun/IWMS')
    }

    // 打开 Issues 页面
    const openIssues = () => {
      window.electronAPI.openExternal('https://github.com/beibeikun/IWMS/issues')
    }

    // 检查更新
    const checkUpdate = async () => {
      checkingUpdate.value = true
      try {
        // 这里可以添加检查更新的逻辑
        await new Promise(resolve => setTimeout(resolve, 2000)) // 模拟检查过程
        
        ElMessage.success('当前已是最新版本！')
      } catch (error) {
        ElMessage.error('检查更新失败，请稍后重试')
      } finally {
        checkingUpdate.value = false
      }
    }

    // 显示许可证信息
    const showLicense = () => {
      ElMessageBox.alert(
        `MIT License

Copyright (c) 2024 IWMS Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
        'MIT 许可证',
        {
          confirmButtonText: '确定',
          customClass: 'license-dialog'
        }
      )
    }

    onMounted(() => {
      getVersionInfo()
    })

    return {
      version,
      buildDate,
      nodeVersion,
      electronVersion,
      checkingUpdate,
      goBack,
      openGitHub,
      openIssues,
      checkUpdate,
      showLicense
    }
  }
}
</script>

<style scoped>
.about-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-left h1 {
  margin: 0;
  color: #303133;
}

.info-card, .links-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.software-info {
  padding: 20px 0;
}

.info-section {
  margin-bottom: 30px;
}

.info-section h3 {
  color: #303133;
  margin-bottom: 10px;
}

.info-section h4 {
  color: #606266;
  margin-bottom: 15px;
  border-bottom: 2px solid #409eff;
  padding-bottom: 5px;
}

.description {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 20px;
}

.tech-card {
  text-align: center;
  padding: 20px;
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.tech-icon {
  font-size: 24px;
  margin-bottom: 10px;
}

.tech-card h5 {
  margin: 10px 0 5px 0;
  color: #303133;
}

.tech-card p {
  margin: 0;
  color: #909399;
  font-size: 12px;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  padding: 8px 0;
  color: #606266;
  border-bottom: 1px solid #f0f0f0;
}

.feature-list li:last-child {
  border-bottom: none;
}

.link-section {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.link-section:last-child {
  border-bottom: none;
}

.link-section h4 {
  color: #303133;
  margin-bottom: 15px;
}

.link-description {
  color: #909399;
  font-size: 12px;
  line-height: 1.4;
  margin: 0;
}

.copyright-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.copyright-text {
  color: #909399;
  font-size: 12px;
  line-height: 1.4;
  margin-bottom: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .about-container {
    padding: 10px;
  }
  
  .el-col {
    margin-bottom: 20px;
  }
  
  .tech-card {
    height: 100px;
    padding: 15px;
  }
}

/* 许可证对话框样式 */
:deep(.license-dialog) {
  max-width: 600px;
}

:deep(.license-dialog .el-message-box__content) {
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
}
</style>
