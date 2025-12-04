import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8484', // 여기를 백엔드 포트와 똑같이
      changeOrigin: true,
    },
    '/auth': {
      target: 'http://localhost:8484',
      changeOrigin: true,
    }
  }
}
})
