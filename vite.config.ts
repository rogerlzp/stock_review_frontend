import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  server: {
    port: 8001,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/v1') 
      },
    },
    middlewares: [
      (req, res, next) => {
        // 如果请求的不是静态资源，返回 index.html
        if (!req.url?.includes('.')) {
          req.url = '/index.html'
        }
        next()
      }
    ]
  },
})
