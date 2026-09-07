import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],


  base: '/library-repo/',

  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://library-repo-1bcp.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})