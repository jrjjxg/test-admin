import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
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
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:9000', // 后端服务器地址
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'http://localhost:9000', // 后端服务器地址
        changeOrigin: true,
        secure: false
      }
    }
  }
})
