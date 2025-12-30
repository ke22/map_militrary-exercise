import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync } from 'fs'
import { join } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 插件：在构建后复制 .nojekyll 文件到 dist 目录
    {
      name: 'copy-nojekyll',
      closeBundle() {
        const nojekyllPath = join(process.cwd(), '.nojekyll')
        const distNojekyllPath = join(process.cwd(), 'dist', '.nojekyll')
        if (existsSync(nojekyllPath)) {
          copyFileSync(nojekyllPath, distNojekyllPath)
          console.log('✅ 已复制 .nojekyll 到 dist 目录')
        }
      },
    },
  ],
  // 支援子路徑部署，例如 /exercises-map/
  // 使用: VITE_BASE_PATH=/exercises-map/ npm run build
  base: process.env.VITE_BASE_PATH || '/',
  build: {
    rollupOptions: {
      output: {
        // 添加版本号到文件名避免缓存问题
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
      },
    },
  },
  // 开发模式下也添加版本查询参数
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },
})
