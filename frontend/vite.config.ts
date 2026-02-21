import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Cloud Storage 배포 시 버킷 경로를 base로 설정
  const isCloudStorage = mode === 'gcs'
  const base = isCloudStorage ? '/hrm-frontend-2024/' : '/'

  return {
    base,
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        }
      }
    },
    preview: {
      host: '0.0.0.0',
      port: process.env.PORT ? parseInt(process.env.PORT) : 4173,
      strictPort: false,
      allowedHosts: [
        '.onrender.com',
        'hrm-frontend-3tph.onrender.com',
        'localhost'
      ]
    }
  }
})

