import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173, // Port chạy Frontend ứng dụng Web (Vite React)
    allowedHosts: true,
    proxy: {
      '/chat-api': {
        target: 'http://localhost:8003', // Port kết nối tới máy chủ AI ANM Python
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/chat-api/, '')
      }
    }
  }
})
