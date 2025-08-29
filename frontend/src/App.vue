<template>
  <div id="app">
    <el-container>
      <el-header class="app-header">
        <div class="header-content">
          <div class="logo-section">
            <img src="/logo.png" alt="IWMS Logo" class="logo" />
            <div class="title-group">
              <h1 class="app-title">IWMS</h1>
              <div class="header-subtitle">图像仓库管理系统</div>
            </div>
          </div>
        </div>
      </el-header>
      
      <el-container>
        <!-- 左侧菜单 -->
        <el-aside :width="sidebarCollapsed ? '64px' : '250px'" class="sidebar" :class="{ 'collapsed': sidebarCollapsed }">
          <!-- 菜单切换按钮 -->
          <div class="sidebar-toggle" @click="toggleSidebar">
            <el-icon>
              <component :is="sidebarCollapsed ? 'Expand' : 'Fold'" />
            </el-icon>
          </div>
          
          <el-menu
            :default-active="activeMenu"
            class="sidebar-menu"
            @select="handleMenuSelect"
            :collapse="sidebarCollapsed"
          >
            <el-menu-item index="home">
              <div class="menu-item-content">
                <el-icon><House /></el-icon>
                <span>首页</span>
              </div>
            </el-menu-item>
            
            <el-menu-item index="batch-rename">
              <div class="menu-item-content">
                <el-icon><Document /></el-icon>
                <span>批量重命名</span>
              </div>
            </el-menu-item>
            
            <el-sub-menu index="file-operations">
              <template #title>
                <div class="menu-item-content">
                  <el-icon><Operation /></el-icon>
                  <span>文件操作</span>
                </div>
              </template>
              
              <el-menu-item index="file-operations-main">
                <div class="submenu-item-content">
                  <el-icon><Grid /></el-icon>
                  <span>功能概览</span>
                </div>
              </el-menu-item>
              
              <el-menu-item index="file-operations-organize">
                <div class="submenu-item-content">
                  <el-icon><Sort /></el-icon>
                  <span>整理排序</span>
                </div>
              </el-menu-item>
              
              <el-menu-item index="file-operations-move" disabled>
                <div class="submenu-item-content">
                  <el-icon><FolderOpened /></el-icon>
                  <span>批量移动</span>
                </div>
                <el-tag size="small" type="info">即将推出</el-tag>
              </el-menu-item>
              
              <el-menu-item index="file-operations-copy" disabled>
                <div class="submenu-item-content">
                  <el-icon><CopyDocument /></el-icon>
                  <span>批量复制</span>
                </div>
                <el-tag size="small" type="info">即将推出</el-tag>
              </el-menu-item>
              
              <el-menu-item index="file-operations-dedupe" disabled>
                <div class="submenu-item-content">
                  <el-icon><Delete /></el-icon>
                  <span>文件去重</span>
                </div>
                <el-tag size="small" type="info">即将推出</el-tag>
              </el-menu-item>
              
              <el-menu-item index="file-operations-classify" disabled>
                <div class="submenu-item-content">
                  <el-icon><Grid /></el-icon>
                  <span>智能分类</span>
                </div>
                <el-tag size="small" type="info">即将推出</el-tag>
              </el-menu-item>
              
              <el-menu-item index="file-operations-sync" disabled>
                <div class="submenu-item-content">
                  <el-icon><Refresh /></el-icon>
                  <span>文件同步</span>
                </div>
                <el-tag size="small" type="info">即将推出</el-tag>
              </el-menu-item>
            </el-sub-menu>
            
            <el-menu-item index="repository-related" disabled>
              <div class="menu-item-content">
                <el-icon><Box /></el-icon>
                <span>仓库相关</span>
              </div>
              <el-tag size="small" type="info">即将推出</el-tag>
            </el-menu-item>
            
            <el-menu-item index="generate-form" disabled>
              <div class="menu-item-content">
                <el-icon><EditPen /></el-icon>
                <span>生成表单</span>
              </div>
              <el-tag size="small" type="info">即将推出</el-tag>
            </el-menu-item>
            
            <el-menu-item index="delete-from-repo" disabled>
              <div class="menu-item-content">
                <el-icon><Delete /></el-icon>
                <span>从仓库删除</span>
              </div>
              <el-tag size="small" type="info">即将推出</el-tag>
            </el-menu-item>
            
            <el-menu-item index="system-settings">
              <div class="menu-item-content">
                <el-icon><Setting /></el-icon>
                <span>系统设置</span>
              </div>
            </el-menu-item>
          </el-menu>
        </el-aside>
        
        <!-- 主内容区域 -->
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

export default {
  name: 'App',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const sidebarCollapsed = ref(false)
    
    // 加载系统设置
    const loadSystemSettings = async () => {
      try {
        const settings = await window.electronAPI.loadSettings()
        if (settings && settings.sidebarCollapsed !== undefined) {
          sidebarCollapsed.value = settings.sidebarCollapsed
        }
      } catch (error) {
        console.warn('加载系统设置失败:', error.message)
      }
    }
    
    // 辅助函数：从设置对象中提取普通JavaScript对象
    const extractSettings = (settings) => {
      return {
        defaultOutputPath: settings.defaultOutputPath || '',
        defaultCompressionMode: settings.defaultCompressionMode || 'dimension',
        defaultMaxDimension: settings.defaultMaxDimension || 1920,
        defaultMaxFileSize: settings.defaultMaxFileSize || 500,
        defaultFileTypes: settings.defaultFileTypes || 'image',
        defaultRecursive: settings.defaultRecursive !== undefined ? settings.defaultRecursive : true,
        defaultConflictStrategy: settings.defaultConflictStrategy || 'skip',
        useMultiThread: settings.useMultiThread !== undefined ? settings.useMultiThread : true,
        sidebarCollapsed: settings.sidebarCollapsed !== undefined ? settings.sidebarCollapsed : false,
        autoSaveSettings: settings.autoSaveSettings !== undefined ? settings.autoSaveSettings : true
      }
    }
    
    // 根据当前路由计算激活的菜单项
    const activeMenu = computed(() => {
      const path = route.path
      if (path === '/') return 'home'
      if (path === '/file-operations') return 'file-operations-main'
      if (path === '/file-operations/organize') return 'file-operations-organize'
      return path.substring(1) // 移除开头的 '/'
    })
    
    const toggleSidebar = async () => {
      sidebarCollapsed.value = !sidebarCollapsed.value
      
      // 自动保存侧边栏状态到系统设置
      try {
        const settings = await window.electronAPI.loadSettings()
        if (settings) {
          settings.sidebarCollapsed = sidebarCollapsed.value
          await window.electronAPI.saveSettings(extractSettings(settings))
        }
      } catch (error) {
        console.warn('保存侧边栏状态失败:', error.message)
      }
    }
    
    const handleMenuSelect = (index) => {
      // 根据菜单项跳转到对应路由
      const routeMap = {
        'home': '/',
        'batch-rename': '/batch-rename',
        'file-operations-main': '/file-operations',
        'file-operations-organize': '/file-operations/organize',
        'repository-related': '/repository-related',
        'generate-form': '/generate-form',
        'delete-from-repo': '/delete-from-repo',
        'system-settings': '/system-settings'
      }
      
      const targetRoute = routeMap[index]
      if (targetRoute) {
        if (['repository-related', 'generate-form', 'delete-from-repo', 'file-operations-move', 'file-operations-copy', 'file-operations-dedupe', 'file-operations-classify', 'file-operations-sync'].includes(index)) {
          ElMessage.info('该功能即将推出，敬请期待！')
          return
        } else {
          router.push(targetRoute)
        }
      }
    }
    
    // 监听路由变化，自动更新菜单状态
    watch(() => route.path, (newPath) => {
      // 路由变化时的处理逻辑
    })
    
    // 组件挂载时加载系统设置
    onMounted(() => {
      loadSystemSettings()
    })
    
    return {
      sidebarCollapsed,
      activeMenu,
      toggleSidebar,
      handleMenuSelect
    }
  }
}
</script>

<style>
/* 全局重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background-color: #0f172a;
  overflow: hidden;
}

#app {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  overflow: hidden;
}

/* 容器样式 */
.el-container {
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  overflow: visible;
}

/* 高级头部样式 */
.app-header {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white;
  text-align: left;
  line-height: 1;
  padding: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  height: 80px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  padding-left: 30px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo {
  width: 35px;
  height: 35px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.title-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.app-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 10px rgba(96, 165, 250, 0.3);
  line-height: 1;
}

.header-subtitle {
  font-size: 13px;
  color: #ffffff;
  font-weight: 300;
  letter-spacing: 1px;
  line-height: 1;
}

.el-main {
  padding: 0;
  background-color: #f8fafc;
  height: calc(100vh - 80px);
  overflow-y: auto;
  overflow-x: hidden;
}

/* 左侧菜单样式 */
.el-aside {
  overflow: visible !important;
}

.sidebar {
  background: linear-gradient(180deg, #1e293b 0%, #334155 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  height: calc(100vh - 80px);
  overflow: visible;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.2);
  transition: width 0.3s ease;
  position: relative;
}

.sidebar.collapsed {
  width: 64px !important;
}

.sidebar-toggle {
  position: absolute;
  top: 15px;
  right: -15px;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 16px;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
  z-index: 1000;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  animation: breathe 3s ease-in-out infinite;
}

.sidebar-toggle:hover {
  transform: scale(1.2) rotate(180deg);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.6);
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  border-color: rgba(255, 255, 255, 0.4);
  animation: none;
}

.sidebar-toggle:active {
  transform: scale(1.1) rotate(180deg);
  transition: all 0.1s ease;
}

.sidebar-toggle .el-icon {
  transition: all 0.3s ease;
}

.sidebar-toggle:hover .el-icon {
  transform: scale(1.1);
}

@keyframes breathe {
  0%, 100% {
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
  }
}

.sidebar-menu {
  border: none;
  background-color: transparent;
  padding-top: 50px;
}

.sidebar.collapsed .sidebar-menu {
  padding-top: 60px;
}

.sidebar.collapsed .el-menu-item {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 8px 6px;
  padding: 0 !important;
  width: 52px;
  height: 52px;
  border-radius: 12px;
  position: relative;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  color: #9ca3af;
  border: 1px solid transparent;
  box-sizing: border-box;
  overflow: hidden;
  transform: none;
}

.sidebar.collapsed .el-menu-item .el-icon {
  margin-right: 0 !important;
  margin-bottom: 0;
  margin-left: 0 !important;
  font-size: 22px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar.collapsed .el-menu-item:hover .el-icon {
  font-size: 24px;
  transform: rotate(5deg) !important;
}

.sidebar.collapsed .el-menu-item:hover {
  background: linear-gradient(135deg, #4b5563 0%, #6b7280 100%);
  color: #e5e7eb;
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
  transform: none !important;
}

.sidebar.collapsed .el-menu-item.is-active .el-icon {
  font-size: 24px;
  transform: none !important;
}

.sidebar.collapsed .el-menu-item.is-active {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-color: #60a5fa;
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  animation: pulse 2s infinite;
  transform: none !important;
}

@keyframes pulse {
  0% {
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.6);
  }
  100% {
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  }
}

.sidebar.collapsed .el-menu-item:not(.is-disabled):active {
  transition: all 0.1s ease;
  transform: none !important;
}

.sidebar.collapsed .el-menu-item span {
  display: none;
}

.sidebar.collapsed .el-menu-item .menu-item-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.sidebar.collapsed .el-menu-item .el-tag {
  display: none;
}

/* 覆盖 Element Plus 默认样式 */
.sidebar.collapsed .el-menu-item,
.sidebar.collapsed .el-sub-menu .el-sub-menu__title {
  padding-left: 0 !important;
  padding-right: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  margin-left: 6px !important;
  margin-right: 6px !important;
  text-align: center !important;
}

/* 折叠状态下的子菜单标题样式 - 与普通菜单项保持一致 */
.sidebar.collapsed .el-sub-menu .el-sub-menu__title {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 8px 6px;
  padding: 0 !important;
  width: 52px;
  height: 52px;
  border-radius: 12px;
  position: relative;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  color: #9ca3af;
  border: 1px solid transparent;
  box-sizing: border-box;
  overflow: hidden;
  transform: none !important;
}

.sidebar.collapsed .el-sub-menu .el-sub-menu__title .el-icon {
  margin-right: 0 !important;
  margin-bottom: 0;
  margin-left: 0 !important;
  font-size: 22px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar.collapsed .el-sub-menu .el-sub-menu__title:hover {
  background: linear-gradient(135deg, #4b5563 0%, #6b7280 100%);
  color: #e5e7eb;
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
  transform: none !important;
}

.sidebar.collapsed .el-sub-menu .el-sub-menu__title:hover .el-icon {
  font-size: 24px;
  transform: rotate(5deg) !important;
}

.sidebar.collapsed .el-sub-menu.is-active .el-sub-menu__title {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-color: #60a5fa;
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  animation: pulse 2s infinite;
  transform: none !important;
}

.sidebar.collapsed .el-sub-menu.is-active .el-sub-menu__title .el-icon {
  font-size: 24px;
  transform: none !important;
}

.sidebar.collapsed .el-sub-menu .el-sub-menu__title:not(.is-disabled):active {
  transition: all 0.1s ease;
  transform: none !important;
}

.sidebar.collapsed .el-sub-menu .el-sub-menu__title span {
  display: none;
}

.sidebar.collapsed .el-sub-menu .el-sub-menu__title .menu-item-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.sidebar.collapsed .el-sub-menu .el-sub-menu__title .el-sub-menu__icon-arrow {
  display: none;
}



/* 最终强制约束：确保所有菜单项都不会超出侧边栏边界 */
.sidebar.collapsed .el-menu-item,
.sidebar.collapsed .el-sub-menu .el-sub-menu__title {
  transform: none !important;
  overflow: hidden !important;
  box-sizing: border-box !important;
  max-width: 52px !important;
  min-width: 52px !important;
  width: 52px !important;
  position: relative !important;
  left: 0 !important;
  right: 0 !important;
  margin-left: 6px !important;
  margin-right: 6px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.menu-item-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 子菜单样式 */
.sidebar-menu .el-sub-menu {
  margin: 4px 8px;
}

.sidebar-menu .el-sub-menu .el-sub-menu__title {
  height: 50px;
  line-height: 50px;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: #9ca3af;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-menu .el-sub-menu .el-sub-menu__title:hover {
  background: linear-gradient(135deg, #4b5563 0%, #6b7280 100%);
  color: #e5e7eb;
  border-color: rgba(255, 255, 255, 0.15);
  transform: scale(1.02);
}

.sidebar-menu .el-sub-menu.is-active .el-sub-menu__title {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-color: #60a5fa;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
}

.sidebar-menu .el-sub-menu .el-menu {
  background-color: #1f2937;
  border: none;
  padding: 8px 0;
}

.sidebar-menu .el-sub-menu .el-menu-item {
  height: 40px;
  line-height: 40px;
  margin: 2px 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
  color: #9ca3af;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
}

.sidebar-menu .el-sub-menu .el-menu-item:hover {
  background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
  color: #e5e7eb;
  border-color: rgba(255, 255, 255, 0.1);
  transform: scale(1.02);
}

.sidebar-menu .el-sub-menu .el-menu-item.is-active {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-color: #60a5fa;
  box-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);
}

.sidebar-menu .el-sub-menu .el-menu-item.is-disabled {
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.5;
}

.sidebar-menu .el-sub-menu .el-menu-item.is-disabled:hover {
  background-color: transparent;
  transform: none;
}

.submenu-item-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 主菜单项样式 */
.sidebar-menu .el-menu-item {
  height: 50px;
  line-height: 50px;
  margin: 4px 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: #9ca3af;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-menu .el-menu-item:hover {
  background: linear-gradient(135deg, #4b5563 0%, #6b7280 100%);
  color: #e5e7eb;
  border-color: rgba(255, 255, 255, 0.15);
  transform: scale(1.02);
}

.sidebar-menu .el-menu-item.is-active {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-color: #60a5fa;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
}

.sidebar-menu .el-menu-item.is-disabled {
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.5;
}

.sidebar-menu .el-menu-item.is-disabled:hover {
  background-color: transparent;
  transform: none;
}

/* 折叠状态下的子菜单样式 */
.sidebar.collapsed .el-sub-menu .el-menu {
  position: absolute;
  left: 100%;
  top: 0;
  min-width: 200px;
  background-color: #1f2937;
  border-radius: 8px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  display: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar.collapsed .el-sub-menu:hover .el-menu {
  display: block;
}

.sidebar.collapsed .el-sub-menu .el-menu-item {
  height: 40px;
  line-height: 40px;
  margin: 2px 8px;
  border-radius: 6px;
  color: #9ca3af;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  transition: all 0.3s ease;
}

.sidebar.collapsed .el-sub-menu .el-menu-item:hover {
  background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
  color: #e5e7eb;
  border-color: rgba(255, 255, 255, 0.1);
  transform: scale(1.02);
}

.sidebar.collapsed .el-sub-menu .el-menu-item.is-active {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-color: #60a5fa;
  box-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);
}

/* 主内容区域样式 */
.main-content {
  padding: 0;
  background-color: #f8fafc;
  height: calc(100vh - 80px);
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 200px !important;
  }
  
  .app-title {
    font-size: 24px;
  }
  
  .logo {
    width: 30px;
    height: 30px;
  }
  
  .header-content {
    padding-left: 20px;
  }
}

/* 标签样式优化 - 全局覆盖 */
.sidebar-menu .el-sub-menu .el-menu-item .el-tag {
  font-size: 10px !important;
  height: 18px !important;
  line-height: 16px !important;
  padding: 0 6px !important;
  border-radius: 4px !important;
  font-weight: 400 !important;
  letter-spacing: 0.5px !important;
  background-color: rgba(156, 163, 175, 0.2) !important;
  border-color: rgba(156, 163, 175, 0.3) !important;
  color: #9ca3af !important;
  margin-left: 8px !important;
  flex-shrink: 0 !important;
  min-width: auto !important;
  white-space: nowrap !important;
}

.sidebar-menu .el-sub-menu .el-menu-item:hover .el-tag {
  background-color: rgba(156, 163, 175, 0.3) !important;
  border-color: rgba(156, 163, 175, 0.4) !important;
  color: #d1d5db !important;
}

.sidebar-menu .el-menu-item .el-tag {
  font-size: 11px !important;
  height: 20px !important;
  line-height: 18px !important;
  padding: 0 8px !important;
  border-radius: 4px !important;
  font-weight: 400 !important;
  letter-spacing: 0.5px !important;
  background-color: rgba(156, 163, 175, 0.2) !important;
  border-color: rgba(156, 163, 175, 0.3) !important;
  color: #9ca3af !important;
  margin-left: 8px !important;
  flex-shrink: 0 !important;
  min-width: auto !important;
  white-space: nowrap !important;
}

.sidebar-menu .el-menu-item:hover .el-tag {
  background-color: rgba(156, 163, 175, 0.3) !important;
  border-color: rgba(156, 163, 175, 0.4) !important;
  color: #d1d5db !important;
}

.sidebar.collapsed .el-sub-menu .el-menu-item .el-tag {
  font-size: 10px !important;
  height: 18px !important;
  line-height: 16px !important;
  padding: 0 6px !important;
  border-radius: 4px !important;
  font-weight: 400 !important;
  letter-spacing: 0.5px !important;
  background-color: rgba(156, 163, 175, 0.2) !important;
  border-color: rgba(156, 163, 175, 0.3) !important;
  color: #9ca3af !important;
  margin-left: 8px !important;
  flex-shrink: 0 !important;
  min-width: auto !important;
  white-space: nowrap !important;
}



.sidebar.collapsed .el-sub-menu .el-menu-item:hover .el-tag {
  background-color: rgba(156, 163, 175, 0.3) !important;
  border-color: rgba(156, 163, 175, 0.4) !important;
  color: #d1d5db !important;
}
</style>
