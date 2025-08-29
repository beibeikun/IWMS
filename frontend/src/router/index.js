/**
 * IWMS 智能文件管理解决方案 - 路由配置
 * 
 * 本文件配置 Vue Router，负责：
 * - 定义应用路由规则
 * - 配置路由守卫
 * - 管理页面导航
 * 
 * @author IWMS Team
 * @version 1.0.0
 */

import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import BatchRename from '../views/BatchRename.vue'

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'IWMS - 智能文件管理解决方案'
    }
  },
  {
    path: '/batch-rename',
    name: 'BatchRename',
    component: BatchRename,
    meta: {
      title: '批量重命名 - IWMS'
    }
  },
  {
    path: '/file-operations',
    name: 'FileOperations',
    component: () => import('../views/FileOperations.vue'),
    meta: {
      title: '文件操作 - IWMS'
    }
  },
  {
    path: '/file-operations/organize',
    name: 'FileOrganize',
    component: () => import('../views/FileOrganize.vue'),
    meta: {
      title: '整理排序 - IWMS'
    }
  },
  {
    path: '/repository-related',
    name: 'RepositoryRelated',
    component: () => import('../views/RepositoryRelated.vue'),
    meta: {
      title: '仓库相关 - IWMS',
      disabled: true
    }
  },
  {
    path: '/generate-form',
    name: 'GenerateForm',
    component: () => import('../views/GenerateForm.vue'),
    meta: {
      title: '生成表单 - IWMS',
      disabled: true
    }
  },
  {
    path: '/delete-from-repo',
    name: 'DeleteFromRepo',
    component: () => import('../views/DeleteFromRepo.vue'),
    meta: {
      title: '从仓库删除 - IWMS',
      disabled: true
    }
  },
  {
    path: '/system-settings',
    name: 'SystemSettings',
    component: () => import('../views/SystemSettings.vue'),
    meta: {
      title: '系统设置 - IWMS'
    }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  // 检查功能是否可用
  if (to.meta.disabled) {
    next('/')
    return
  }
  
  next()
})

export default router
