import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 支援子路徑部署，例如 /exercises-map/
  // 使用: VITE_BASE_PATH=/exercises-map/ npm run build
  base: process.env.VITE_BASE_PATH || '/',
})
