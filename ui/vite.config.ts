import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  server:{
    proxy: {
      '/minio': {
        target: 'http://16.16.208.207:9000', // Adjust if MinIO is not running on 192.168.62.193
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/minio/, ''),
      },
    },
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",    
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
    host: '0.0.0.0', 
  }
})
