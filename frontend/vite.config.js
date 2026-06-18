import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Ép Vite tự động khai báo global là window khi biên dịch
    global: 'window',
  },
})
