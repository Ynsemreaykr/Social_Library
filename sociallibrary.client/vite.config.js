import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false, // Otomatik tarayıcı açma KAPALI - sadece backend kullanılacak
  },
  build: {
    // Build output'u Server'ın wwwroot klasörüne koy
    outDir: '../SocialLibrary.Server/wwwroot',
    emptyOutDir: true, // Build öncesi klasörü temizle
  },
})
