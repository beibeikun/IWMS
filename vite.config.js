/**
 * IWMS 智能文件管理解决方案 - Vite 构建配置文件
 * 
 * 本文件配置 Vite 构建工具，负责：
 * - Vue 3 应用构建配置
 * - Electron 主进程和预加载脚本构建
 * - 开发服务器配置
 * - 构建输出配置
 * 
 * @author IWMS Team
 * @version 1.0.0
 */

// 导入 Vite 配置函数
import { defineConfig } from 'vite'
// 导入 Vue 3 插件
import vue from '@vitejs/plugin-vue'
// 导入 Electron 主进程构建插件
import electron from 'vite-plugin-electron'
// 导入 Electron 渲染进程构建插件
import renderer from 'vite-plugin-electron-renderer'

// 导出 Vite 配置对象
export default defineConfig({
  // 插件配置
  plugins: [
    // Vue 3 插件：支持 .vue 单文件组件
    vue(),
    
    // Electron 插件：构建主进程和预加载脚本
    electron([
      {
        // 主进程入口文件
        entry: 'electron/main.js',
        onstart(options) {
          // 设置开发环境变量
          process.env.NODE_ENV = 'development'
          process.env.IS_DEV = 'true'
          // 启动主进程
          options.startup()
        },
        vite: {
          build: {
            // 主进程构建输出目录
            outDir: 'dist-electron',
          },
        },
      },
      {
        // 预加载脚本入口文件
        entry: 'electron/preload.js',
        onstart(options) {
          // 重新加载预加载脚本
          options.reload()
        },
        vite: {
          build: {
            // 预加载脚本构建输出目录
            outDir: 'dist-electron',
          },
        },
      },
    ]),
    
    // 渲染进程插件：支持 Electron 渲染进程
    renderer(),
  ],
  
  // 构建配置
  build: {
    // 前端应用构建输出目录
    outDir: 'dist',
  },
  
  // 开发服务器配置
  server: {
    port: 5173,                         // 开发服务器端口
    strictPort: true,                   // 严格端口模式，端口被占用时报错
    host: true,                         // 允许外部访问，支持局域网访问
  },
  
  // 依赖优化配置
  optimizeDeps: {
    exclude: ['electron']               // 排除 Electron 模块，避免预构建问题
  },
  
  // 环境变量定义
  define: {
    // 设置 NODE_ENV 环境变量，确保开发模式正确识别
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
})
