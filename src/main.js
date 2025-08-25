/**
 * IWMS 智能文件管理解决方案 - Vue 应用入口文件
 * 
 * 本文件是 Vue 3 应用的启动入口，负责：
 * - 创建 Vue 应用实例
 * - 集成 Element Plus UI 组件库
 * - 注册全局图标组件
 * - 配置 Vue Router
 * - 挂载应用到 DOM
 * 
 * @author IWMS Team
 * @version 1.0.0
 */

// 导入 Vue 3 核心功能
import { createApp } from 'vue'
// 导入 Element Plus UI 组件库
import ElementPlus from 'element-plus'
// 导入 Element Plus 的样式文件
import 'element-plus/dist/index.css'
// 导入所有 Element Plus 图标组件
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// 导入路由配置
import router from './router'
// 导入根组件
import App from './App.vue'

// 创建 Vue 应用实例
const app = createApp(App)

// 注册所有 Element Plus 图标组件为全局组件
// 这样可以在任何组件中直接使用图标，无需单独导入
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用 Element Plus 插件
// 这会自动注册所有 Element Plus 组件
app.use(ElementPlus)

// 使用 Vue Router
app.use(router)

// 将应用挂载到 DOM 元素上
// 目标元素是 index.html 中 id 为 'app' 的 div
app.mount('#app')
