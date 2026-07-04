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
    // Vercel'de derlerken 'dist' klasörüne, localde ise backend'in wwwroot klasörüne çıkar
    outDir: process.env.VERCEL ? 'dist' : '../SocialLibrary.Server/wwwroot',
    emptyOutDir: true, // Build öncesi klasörü temizle
  },
})
