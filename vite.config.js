import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  base: '/', // 添加基础路径配置
  publicDir: 'public', // 使用默认的public目录
  server: {
    fs: {
      // 允许访问上级目录
      allow: ['..']
    },
    // 添加静态资源处理
    static: {
      directory: 'public',
      publicPath: '/'
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'axios']
        }
      }
    }
  }
})
