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
      '/api': {  // 所有以 /api 开头的请求都会被代理
        target: 'http://localhost:9000', // 你的后端服务器地址
        changeOrigin: true, // 跨域时需要设置为 true
        // rewrite: (path) => path.replace(/^\/api/, '') // 如果你的后端接口没有 /api 前缀，则需要重写路径
      }
    }
  }
})
