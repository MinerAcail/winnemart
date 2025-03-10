import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import Sitemap from "vite-plugin-sitemap";
 const  route  = [
     "/" ,
     "/job" ,
     "/request" ,
     "/shop" ,
      ]
      const dynamicRoutes = route.map(name => `${name}`)
export default defineConfig({
  plugins: [
    react(),

    Sitemap({ hostname: 'https://winnemart.com',
      dynamicRoutes ,
  
     }),
  ],
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // uri:"http://16.16.208.207:4001/query",
  
  server:{
    proxy: {
      '/minio': {
        // target: 'http://localhost:9000', // Adjust if MinIO is not running on
        target: 'http://16.16.208.207:9000', // Adjust if MinIO is not running on 192.168.62.193

        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/minio/, ""),
      },
    },
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",    
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
    host: '0.0.0.0', 
  },
  preview: {
    allowedHosts: ["winnemart.com"], // Allow winnemart.com
  },
})
// 4173