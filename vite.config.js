import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

export default defineConfig({
  plugins: [
    vue(),
    electron([
      {
        entry: 'electron/main.js',
        onstart(options) {
          // 设置开发环境变量
          process.env.NODE_ENV = 'development'
          process.env.IS_DEV = 'true'
          options.startup()
        },
        vite: {
          build: {
            outDir: 'dist-electron',
          },
        },
      },
      {
        entry: 'electron/preload.js',
        onstart(options) {
          options.reload()
        },
        vite: {
          build: {
            outDir: 'dist-electron',
          },
        },
      },
    ]),
    renderer(),
  ],
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true, // 允许外部访问
  },
  // 确保开发模式正确启动
  optimizeDeps: {
    exclude: ['electron']
  },
  // 设置环境变量
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
})
