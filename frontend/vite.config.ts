import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 5173,
    // Em dev, o front roda em :5173 e a API Laravel em :8000 — o proxy
    // evita configurar CORS explícito e mantém tudo em "mesma origem" do
    // ponto de vista do navegador (importante pro cookie de sessão do
    // Sanctum funcionar sem fricção).
    proxy: {
      // :8000 é ocupado pelo Docker Desktop nesta máquina — o backend
      // Laravel roda em :8001 para evitar esse conflito de porta.
      '/api': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
      },
      '/sanctum': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
      },
      '/storage': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
      },
    },
  },
})
