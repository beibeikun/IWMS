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
import './styles/App.css'

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
